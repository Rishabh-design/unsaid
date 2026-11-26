# UNSAID

**What you don’t say, still matters.**

UNSAID is a quiet space for men to check in with themselves, journal by writing or speaking, and vent anonymously. It started as a UX case study in Figma and is now a working, installable web app (PWA).

## What’s in the app

| Area | What it does |
| --- | --- |
| **Splash & onboarding** | Slide to continue, three intro cards, skip. |
| **Daily mood check-in** | Opens at 7 PM local time, one mood per day from 8 faces, can be changed until midnight. |
| **Home** | Write it out / Speak it out, anonymous venting, weekly mood chart, monthly “Little by Little” calendar. |
| **Write it out** | Title + entry, gentle prompts with refresh, auto-saved drafts, edit later. |
| **Speak it out** | Voice recording with live waveform, voice-to-text where the browser supports it, play back, save, or turn it into a vent. |
| **Reflections Archive** | Written and voice logs, filter by month and year, open, edit, delete. |
| **Mood Logs** | Mood stats for 7 / 14 / 30 days, insight line, timeline with timestamps. |
| **Vent Space** | Anonymous vents that disappear after 24 hours. Hugs, anonymous replies, “My vents”, pull to refresh, report, delete your own. |
| **Safety** | Helplines appear if someone writes about self-harm. Abusive replies are blocked; content reported by 3 people is hidden. Rate limits on posting. |
| **Profile** | Local name and photo, streaks and quick summary. |
| **Settings** | Passcode lock, export to ZIP, delete everything, reminders, dark/light mode, font size. |
| **About / Mission / Creator / Help / Contact / Privacy** | Content from the case study, FAQs, contact form, privacy policy. |

## Privacy model

- **Journal entries, voice notes, mood logs, name and photo never leave the phone.** They live in the browser’s IndexedDB.
- **Vent Space** uses Supabase with *anonymous* sign-in (no email, no name). The database tables aren’t reachable from the API; the app only calls SQL functions that never return author IDs. Vents are hidden after 24 hours and deleted by an hourly job.
- No analytics, no ads, no third-party trackers.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS 4 · Dexie (IndexedDB) · Supabase · vite-plugin-pwa. Fonts: Unbounded + Montserrat (self-hosted).

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Without Supabase keys, Vent Space runs in **preview mode** (vents stay on that device), so everything else can be tried right away.

```bash
npm test        # unit tests
npm run build   # production build in dist/
```

## Connect Vent Space (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. **Authentication → Sign In / Providers → enable “Anonymous sign-ins”.**
3. **SQL Editor →** paste and run [`supabase/migrations/20261126000000_vent_space.sql`](supabase/migrations/20261126000000_vent_space.sql). It creates the tables, the API functions, and the hourly clean-up job.
4. **Project Settings → API:** copy the Project URL and the `anon` public key into a `.env` file (see [`.env.example`](.env.example)):

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

5. Restart `npm run dev`. The “Preview mode” notice disappears once Vent Space is connected.

Recommended before launch: turn on **CAPTCHA for anonymous sign-ins** (Authentication → Attack Protection) to slow down spam accounts.

## Deploy (Vercel)

1. Import this GitHub repo at [vercel.com/new](https://vercel.com/new). It detects Vite automatically (`vercel.json` is included).
2. Add the two `VITE_SUPABASE_*` environment variables.
3. Deploy. Every push to `main` redeploys.

On a phone, open the site and use **Share → Add to Home Screen** (iOS) or **Install app** (Android) to get it as an app.

## Project structure

```
src/
  routes/        one file per screen (Home, JournalWrite, VentSpace, …)
  components/    shared UI (Screen shell, MoodFace, Menu, sheets, home widgets)
  hooks/         recorder, reminders, pull-to-refresh, clock
  lib/           data (db, vents, settings), moods, prompts, stats, safety
  assets/        images and icons exported from the Figma file
supabase/migrations/   Vent Space database schema and API
```

## Design source

All screens follow the UNSAID Figma file (pages “WHole” and “Case study”). Colours: `#000609` ink, `#00627A` teal, `#DBDBDB` mist. Type: Unbounded for headings, Montserrat for text.
