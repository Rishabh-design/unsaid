import { dayKey } from './dates'
import type { MoodLog, Entry } from './db'
import { MOODS, type MoodId } from './moods'

export interface MoodShare {
  id: MoodId
  days: number
  percent: number
}

/** Mood counts over the last `days` days (including today). */
export function moodShares(logs: MoodLog[], days: number, now = new Date()): MoodShare[] {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))
  const fromKey = dayKey(from)
  const inRange = logs.filter((l) => l.date >= fromKey && l.date <= dayKey(now))
  const total = inRange.length
  return MOODS.map((m) => {
    const count = inRange.filter((l) => l.mood === m.id).length
    return { id: m.id, days: count, percent: total ? Math.round((count / total) * 100) : 0 }
  })
}

export function topMood(shares: MoodShare[]): MoodShare | undefined {
  const best = [...shares].sort((a, b) => b.days - a.days)[0]
  return best && best.days > 0 ? best : undefined
}

/** Consecutive days with a mood logged, ending today (or yesterday if today isn't logged yet). */
export function moodStreak(logs: MoodLog[], now = new Date()): number {
  const keys = new Set(logs.map((l) => l.date))
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!keys.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (keys.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Consecutive days with at least one journal entry (written or voice). */
export function journalStreak(entries: Entry[], now = new Date()): number {
  const keys = new Set(entries.map((e) => dayKey(e.createdAt)))
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!keys.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (keys.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function monthTopMood(logs: MoodLog[], now = new Date()): MoodId | undefined {
  const prefix = dayKey(now).slice(0, 7)
  const counts = new Map<MoodId, number>()
  for (const l of logs) if (l.date.startsWith(prefix)) counts.set(l.mood, (counts.get(l.mood) ?? 0) + 1)
  let best: MoodId | undefined
  let n = 0
  for (const [id, c] of counts) if (c > n) [best, n] = [id, c]
  return best
}
