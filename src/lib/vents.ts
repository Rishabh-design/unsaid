import { db, type DemoVent } from './db'
import { ensureAnonymousSession, supabase } from './supabase'

export const VENT_MAX = 1000
export const REPLY_MAX = 300
const DAY = 24 * 3_600_000

export interface Vent {
  id: string
  body: string
  createdAt: number
  hugCount: number
  replyCount: number
  huggedByMe: boolean
  isMine: boolean
}

export interface Reply {
  id: string
  ventId: string
  body: string
  createdAt: number
  isMine: boolean
}

export interface VentService {
  /** True when vents are shared through the server; false in on-device preview mode. */
  readonly live: boolean
  feed(): Promise<Vent[]>
  mine(): Promise<Vent[]>
  get(id: string): Promise<{ vent: Vent; replies: Reply[] } | null>
  post(body: string): Promise<Vent>
  toggleHug(id: string): Promise<{ hugged: boolean; hugCount: number }>
  reply(ventId: string, body: string): Promise<Reply>
  report(kind: 'vent' | 'reply', id: string, reason: string): Promise<void>
  remove(id: string): Promise<void>
  removeAllMine(): Promise<void>
}

export class VentError extends Error {}

/* ------------------------------------------------------------------ */
/* Supabase: all access goes through RPC functions that never expose    */
/* author ids, so vents stay anonymous even to other API clients.       */
/* ------------------------------------------------------------------ */

interface VentRow {
  id: string
  body: string
  created_at: string
  hug_count: number
  reply_count: number
  hugged_by_me: boolean
  is_mine: boolean
}
interface ReplyRow {
  id: string
  vent_id: string
  body: string
  created_at: string
  is_mine: boolean
}

const toVent = (r: VentRow): Vent => ({
  id: r.id,
  body: r.body,
  createdAt: Date.parse(r.created_at),
  hugCount: r.hug_count,
  replyCount: r.reply_count,
  huggedByMe: r.hugged_by_me,
  isMine: r.is_mine,
})
const toReply = (r: ReplyRow): Reply => ({
  id: r.id,
  ventId: r.vent_id,
  body: r.body,
  createdAt: Date.parse(r.created_at),
  isMine: r.is_mine,
})

function friendly(message: string): string {
  if (/rate/i.test(message)) return 'You’ve shared a lot in a short time. Take a breath and try again in a little while.'
  if (/length|empty/i.test(message)) return 'That message is too long or empty.'
  if (/not found|expired/i.test(message)) return 'This vent has already faded away.'
  if (/own vent/i.test(message)) return 'You can’t hug your own vent — but someone else might.'
  return 'Couldn’t reach Vent Space. Check your connection and try again.'
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new VentError('Vent Space is not connected.')
  await ensureAnonymousSession()
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new VentError(friendly(error.message))
  return data as T
}

class SupabaseVentService implements VentService {
  readonly live = true
  async feed() {
    return (await rpc<VentRow[]>('vent_feed')).map(toVent)
  }
  async mine() {
    return (await rpc<VentRow[]>('my_vents')).map(toVent)
  }
  async get(id: string) {
    const rows = await rpc<VentRow[]>('vent_get', { p_vent: id })
    if (!rows.length) return null
    const replies = await rpc<ReplyRow[]>('vent_replies', { p_vent: id })
    return { vent: toVent(rows[0]), replies: replies.map(toReply) }
  }
  async post(body: string) {
    const rows = await rpc<VentRow[]>('post_vent', { p_body: body.trim() })
    return toVent(rows[0])
  }
  async toggleHug(id: string) {
    const rows = await rpc<{ hugged: boolean; hug_count: number }[]>('toggle_hug', { p_vent: id })
    return { hugged: rows[0].hugged, hugCount: rows[0].hug_count }
  }
  async reply(ventId: string, body: string) {
    const rows = await rpc<ReplyRow[]>('post_reply', { p_vent: ventId, p_body: body.trim() })
    return toReply(rows[0])
  }
  async report(kind: 'vent' | 'reply', id: string, reason: string) {
    await rpc('report_content', { p_kind: kind, p_target: id, p_reason: reason })
  }
  async remove(id: string) {
    await rpc('delete_vent', { p_vent: id })
  }
  async removeAllMine() {
    await rpc('delete_my_data')
  }
}

/* ------------------------------------------------------------------ */
/* On-device preview: same behaviour, stored locally, so the app works  */
/* before the Supabase project is connected.                            */
/* ------------------------------------------------------------------ */

const SEED: Omit<DemoVent, 'id' | 'createdAt'>[] = [
  { body: 'Sometimes I wish I could cry… but it’s like I’ve forgotten how.', isMine: 0, hugCount: 4, huggedByMe: 0, replies: [] },
  { body: 'I laugh a lot these days… not because I’m happy, just because it’s easier than explaining anything.', isMine: 0, hugCount: 12, huggedByMe: 0, replies: [] },
  {
    body: 'It’s scary how good I’ve become at pretending everything’s okay.',
    isMine: 0,
    hugCount: 18,
    huggedByMe: 0,
    replies: [{ id: 'seed-r1', body: 'It is indeed!! bro we’re on a same page.', createdAt: Date.now() - 9 * 60_000, isMine: false }],
  },
  {
    body:
      'I don’t know how to explain this heaviness anymore. I show up every day with a smile — in front of friends, at work, even at home. But inside, it’s like I’m carrying something that no one else sees. I’m the “go-to” guy for everyone’s problems, the one who listens, helps, fixes things. But when it comes to my own thoughts… who do I go to? Not for sympathy. Just to say this out loud in a place where no one knows me.',
    isMine: 0,
    hugCount: 7,
    huggedByMe: 0,
    replies: [],
  },
]
const SEED_AGES = [1, 5, 120, 300].map((m) => m * 60_000)

function demoToVent(d: DemoVent): Vent {
  return {
    id: d.id,
    body: d.body,
    createdAt: d.createdAt,
    hugCount: d.hugCount,
    replyCount: d.replies.length,
    huggedByMe: !!d.huggedByMe,
    isMine: !!d.isMine,
  }
}

class LocalVentService implements VentService {
  readonly live = false

  private async all(): Promise<DemoVent[]> {
    const now = Date.now()
    if ((await db.demoVents.count()) === 0 && !localStorage.getItem('unsaid-demo-seeded')) {
      localStorage.setItem('unsaid-demo-seeded', '1')
      await db.demoVents.bulkAdd(SEED.map((s, i) => ({ ...s, id: crypto.randomUUID(), createdAt: now - SEED_AGES[i] })))
    }
    await db.demoVents.where('createdAt').below(now - DAY).delete()
    return db.demoVents.orderBy('createdAt').reverse().toArray()
  }

  async feed() {
    return (await this.all()).map(demoToVent)
  }
  async mine() {
    return (await this.all()).filter((d) => d.isMine).map(demoToVent)
  }
  async get(id: string) {
    await this.all()
    const d = await db.demoVents.get(id)
    if (!d) return null
    return {
      vent: demoToVent(d),
      replies: d.replies.map((r) => ({ ...r, ventId: id })),
    }
  }
  async post(body: string) {
    const recent = (await db.demoVents.where('isMine').equals(1).toArray()).filter((d) => Date.now() - d.createdAt < 3_600_000)
    if (recent.length >= 5) throw new VentError(friendly('rate'))
    const d: DemoVent = { id: crypto.randomUUID(), body: body.trim(), createdAt: Date.now(), isMine: 1, hugCount: 0, huggedByMe: 0, replies: [] }
    await db.demoVents.add(d)
    return demoToVent(d)
  }
  async toggleHug(id: string) {
    const d = await db.demoVents.get(id)
    if (!d) throw new VentError(friendly('not found'))
    if (d.isMine) throw new VentError(friendly('own vent'))
    const hugged = !d.huggedByMe
    const hugCount = Math.max(0, d.hugCount + (hugged ? 1 : -1))
    await db.demoVents.update(id, { huggedByMe: hugged ? 1 : 0, hugCount })
    return { hugged, hugCount }
  }
  async reply(ventId: string, body: string) {
    const d = await db.demoVents.get(ventId)
    if (!d) throw new VentError(friendly('not found'))
    const r = { id: crypto.randomUUID(), body: body.trim(), createdAt: Date.now(), isMine: true }
    await db.demoVents.update(ventId, { replies: [...d.replies, r] })
    return { ...r, ventId }
  }
  async report(_kind: 'vent' | 'reply', id: string) {
    await db.demoVents.delete(id)
  }
  async remove(id: string) {
    await db.demoVents.delete(id)
  }
  async removeAllMine() {
    await db.demoVents.where('isMine').equals(1).delete()
  }
}

export const vents: VentService = supabase ? new SupabaseVentService() : new LocalVentService()
