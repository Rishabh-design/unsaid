-- UNSAID · Vent Space
-- Anonymous vents that disappear after 24 hours, with hugs, replies and reports.
--
-- Privacy model:
--   * Every device signs in with Supabase anonymous auth (no email, no name).
--   * Tables are not reachable from the API at all. The app only calls the
--     functions below, which never return author ids, so nobody can link
--     two vents to the same person.
--   * Expired vents are filtered out immediately and deleted by a cron job.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.vents (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users (id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at  timestamptz not null default now(),
  hidden      boolean not null default false
);
create index if not exists vents_created_at_idx on public.vents (created_at desc);
create index if not exists vents_author_idx on public.vents (author_id, created_at desc);

create table if not exists public.vent_hugs (
  vent_id     uuid not null references public.vents (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (vent_id, user_id)
);

create table if not exists public.vent_replies (
  id          uuid primary key default gen_random_uuid(),
  vent_id     uuid not null references public.vents (id) on delete cascade,
  author_id   uuid not null references auth.users (id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 1 and 300),
  created_at  timestamptz not null default now(),
  hidden      boolean not null default false
);
create index if not exists vent_replies_vent_idx on public.vent_replies (vent_id, created_at);
create index if not exists vent_replies_author_idx on public.vent_replies (author_id, created_at desc);

create table if not exists public.reports (
  id           bigint generated always as identity primary key,
  kind         text not null check (kind in ('vent', 'reply')),
  target_id    uuid not null,
  reporter_id  uuid not null references auth.users (id) on delete cascade,
  reason       text not null check (char_length(reason) <= 200),
  created_at   timestamptz not null default now(),
  unique (kind, target_id, reporter_id)
);

create table if not exists public.contact_messages (
  id          bigint generated always as identity primary key,
  sender_id   uuid references auth.users (id) on delete set null,
  name        text check (char_length(name) <= 100),
  email       text not null check (char_length(email) between 3 and 200),
  topic       text check (char_length(topic) <= 60),
  message     text not null check (char_length(message) between 1 and 4000),
  created_at  timestamptz not null default now()
);

-- No direct table access from the public API: RLS on, no policies, no grants.
alter table public.vents            enable row level security;
alter table public.vent_hugs        enable row level security;
alter table public.vent_replies     enable row level security;
alter table public.reports          enable row level security;
alter table public.contact_messages enable row level security;
revoke all on public.vents, public.vent_hugs, public.vent_replies, public.reports, public.contact_messages from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public._require_user()
returns uuid
language plpgsql stable security definer set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  return uid;
end $$;

create or replace function public._vent_visible(p_vent uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from vents v
    where v.id = p_vent and not v.hidden and v.created_at > now() - interval '24 hours'
  );
$$;

-- One shape for every vent the app sees.
create or replace function public._vent_rows(p_only_mine boolean, p_vent uuid)
returns table (
  id uuid, body text, created_at timestamptz,
  hug_count int, reply_count int, hugged_by_me boolean, is_mine boolean
)
language sql stable security definer set search_path = public
as $$
  select
    v.id, v.body, v.created_at,
    (select count(*)::int from vent_hugs h where h.vent_id = v.id),
    (select count(*)::int from vent_replies r where r.vent_id = v.id and not r.hidden),
    exists (select 1 from vent_hugs h where h.vent_id = v.id and h.user_id = auth.uid()),
    v.author_id = auth.uid()
  from vents v
  where not v.hidden
    and v.created_at > now() - interval '24 hours'
    and (not p_only_mine or v.author_id = auth.uid())
    and (p_vent is null or v.id = p_vent)
  order by v.created_at desc
  limit 200;
$$;

-- ---------------------------------------------------------------------------
-- API used by the app
-- ---------------------------------------------------------------------------

create or replace function public.vent_feed()
returns table (id uuid, body text, created_at timestamptz, hug_count int, reply_count int, hugged_by_me boolean, is_mine boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform _require_user();
  return query select * from _vent_rows(false, null);
end $$;

create or replace function public.my_vents()
returns table (id uuid, body text, created_at timestamptz, hug_count int, reply_count int, hugged_by_me boolean, is_mine boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform _require_user();
  return query select * from _vent_rows(true, null);
end $$;

create or replace function public.vent_get(p_vent uuid)
returns table (id uuid, body text, created_at timestamptz, hug_count int, reply_count int, hugged_by_me boolean, is_mine boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform _require_user();
  return query select * from _vent_rows(false, p_vent);
end $$;

create or replace function public.vent_replies(p_vent uuid)
returns table (id uuid, vent_id uuid, body text, created_at timestamptz, is_mine boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform _require_user();
  if not _vent_visible(p_vent) then
    return;
  end if;
  return query
    select r.id, r.vent_id, r.body, r.created_at, r.author_id = auth.uid()
    from vent_replies r
    where r.vent_id = p_vent and not r.hidden
    order by r.created_at asc
    limit 200;
end $$;

create or replace function public.post_vent(p_body text)
returns table (id uuid, body text, created_at timestamptz, hug_count int, reply_count int, hugged_by_me boolean, is_mine boolean)
language plpgsql volatile security definer set search_path = public
as $$
declare
  uid uuid := _require_user();
  new_id uuid;
begin
  if p_body is null or char_length(btrim(p_body)) = 0 or char_length(btrim(p_body)) > 1000 then
    raise exception 'vent is empty or too long (length)';
  end if;
  if (select count(*) from vents v where v.author_id = uid and v.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate limit: too many vents';
  end if;
  insert into vents (author_id, body) values (uid, btrim(p_body)) returning vents.id into new_id;
  return query select * from _vent_rows(false, new_id);
end $$;

create or replace function public.toggle_hug(p_vent uuid)
returns table (hugged boolean, hug_count int)
language plpgsql volatile security definer set search_path = public
as $$
declare uid uuid := _require_user();
begin
  if not _vent_visible(p_vent) then
    raise exception 'vent not found or expired';
  end if;
  if exists (select 1 from vents v where v.id = p_vent and v.author_id = uid) then
    raise exception 'you can''t hug your own vent';
  end if;
  if exists (select 1 from vent_hugs h where h.vent_id = p_vent and h.user_id = uid) then
    delete from vent_hugs h where h.vent_id = p_vent and h.user_id = uid;
    hugged := false;
  else
    insert into vent_hugs (vent_id, user_id) values (p_vent, uid);
    hugged := true;
  end if;
  select count(*)::int into hug_count from vent_hugs h where h.vent_id = p_vent;
  return next;
end $$;

create or replace function public.post_reply(p_vent uuid, p_body text)
returns table (id uuid, vent_id uuid, body text, created_at timestamptz, is_mine boolean)
language plpgsql volatile security definer set search_path = public
as $$
declare
  uid uuid := _require_user();
  new_id uuid;
begin
  if not _vent_visible(p_vent) then
    raise exception 'vent not found or expired';
  end if;
  if p_body is null or char_length(btrim(p_body)) = 0 or char_length(btrim(p_body)) > 300 then
    raise exception 'reply is empty or too long (length)';
  end if;
  if (select count(*) from vent_replies r where r.author_id = uid and r.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate limit: too many replies';
  end if;
  insert into vent_replies (vent_id, author_id, body) values (p_vent, uid, btrim(p_body)) returning vent_replies.id into new_id;
  return query
    select r.id, r.vent_id, r.body, r.created_at, true
    from vent_replies r where r.id = new_id;
end $$;

-- Anything reported by 3 different people is hidden automatically.
create or replace function public.report_content(p_kind text, p_target uuid, p_reason text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  uid uuid := _require_user();
  n int;
begin
  if p_kind not in ('vent', 'reply') then
    raise exception 'invalid report';
  end if;
  insert into reports (kind, target_id, reporter_id, reason)
  values (p_kind, p_target, uid, left(coalesce(p_reason, ''), 200))
  on conflict do nothing;

  select count(*) into n from reports where kind = p_kind and target_id = p_target;
  if n >= 3 then
    if p_kind = 'vent' then
      update vents set hidden = true where vents.id = p_target;
    else
      update vent_replies set hidden = true where vent_replies.id = p_target;
    end if;
  end if;
end $$;

create or replace function public.delete_vent(p_vent uuid)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare uid uuid := _require_user();
begin
  delete from vents v where v.id = p_vent and v.author_id = uid;
end $$;

-- "Delete my Account": removes the anonymous user and, through cascades, everything they posted.
create or replace function public.delete_my_data()
returns void
language plpgsql volatile security definer set search_path = public, auth
as $$
declare uid uuid := _require_user();
begin
  delete from public.vents where author_id = uid;
  delete from public.vent_replies where author_id = uid;
  delete from public.vent_hugs where user_id = uid;
  delete from public.reports where reporter_id = uid;
  update public.contact_messages set sender_id = null where sender_id = uid;
  delete from auth.users where id = uid;
end $$;

create or replace function public.submit_contact(p_name text, p_email text, p_topic text, p_message text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare uid uuid := _require_user();
begin
  if (select count(*) from contact_messages c where c.sender_id = uid and c.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate limit: too many messages';
  end if;
  insert into contact_messages (sender_id, name, email, topic, message)
  values (uid, left(p_name, 100), left(p_email, 200), left(p_topic, 60), left(p_message, 4000));
end $$;

-- Only signed-in (anonymous) users may call the API; helpers are internal.
revoke execute on all functions in schema public from public, anon;
revoke execute on function public._require_user(), public._vent_visible(uuid), public._vent_rows(boolean, uuid) from authenticated;
grant execute on function
  public.vent_feed(), public.my_vents(), public.vent_get(uuid), public.vent_replies(uuid),
  public.post_vent(text), public.toggle_hug(uuid), public.post_reply(uuid, text),
  public.report_content(text, uuid, text), public.delete_vent(uuid), public.delete_my_data(),
  public.submit_contact(text, text, text, text)
to authenticated;

-- ---------------------------------------------------------------------------
-- Delete expired vents every hour (needs the pg_cron extension, available on
-- every Supabase project). Expired vents are already invisible to the app.
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'unsaid-purge-expired-vents',
  '7 * * * *',
  $$ delete from public.vents where created_at < now() - interval '24 hours' $$
);
