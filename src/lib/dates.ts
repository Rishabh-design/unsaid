import { format, formatDistanceToNowStrict } from 'date-fns'

/** Hour (24h, local time) when the daily mood check-in opens. */
export const MOOD_UNLOCK_HOUR = 19

/** Local calendar day key, e.g. "2025-06-07". */
export function dayKey(d: Date | number = new Date()): string {
  return format(d, 'yyyy-MM-dd')
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isMoodUnlocked(now: Date = new Date()): boolean {
  return now.getHours() >= MOOD_UNLOCK_HOUR
}

/** Monday-first week that contains `d`. */
export function weekDays(d: Date = new Date()): Date[] {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const offset = (start.getDay() + 6) % 7 // Monday = 0
  start.setDate(start.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

/** "Just Now", "Posted 5 mins ago", "Posted 2 hrs ago" — matching the Vent Space cards. */
export function postedAgo(ts: number, now = Date.now()): string {
  const diff = now - ts
  if (diff < 60_000) return 'Just Now'
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `Posted ${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  return `Posted ${hrs} hr${hrs === 1 ? '' : 's'} ago`
}

export function shortAgo(ts: number): string {
  if (Date.now() - ts < 60_000) return 'just now'
  return `${formatDistanceToNowStrict(ts).replace(' minutes', ' mins').replace(' minute', ' min').replace(' hours', ' hrs').replace(' hour', ' hr')} ago`
}

/** Time left before a vent disappears, e.g. "Fades in 21 hrs". */
export function fadesIn(createdAt: number, now = Date.now()): string {
  const left = createdAt + 24 * 3_600_000 - now
  if (left <= 0) return 'Fading now'
  const hrs = Math.floor(left / 3_600_000)
  if (hrs >= 1) return `Fades in ${hrs} hr${hrs === 1 ? '' : 's'}`
  return `Fades in ${Math.max(1, Math.floor(left / 60_000))} mins`
}
