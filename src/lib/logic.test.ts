import { describe, expect, it } from 'vitest'
import { dayKey, isMoodUnlocked, postedAgo, weekDays, fadesIn } from './dates'
import { journalStreak, monthTopMood, moodShares, moodStreak, topMood } from './stats'
import { mentionsCrisis } from './crisis'
import { isAbusive } from './moderation'
import type { Entry, MoodLog } from './db'

const log = (date: string, mood: MoodLog['mood']): MoodLog => ({ date, mood, loggedAt: new Date(`${date}T20:00:00`).getTime() })

describe('mood check-in window', () => {
  it('is locked before 7 PM and open from 7 PM', () => {
    expect(isMoodUnlocked(new Date(2025, 5, 7, 18, 59))).toBe(false)
    expect(isMoodUnlocked(new Date(2025, 5, 7, 19, 0))).toBe(true)
    expect(isMoodUnlocked(new Date(2025, 5, 7, 23, 59))).toBe(true)
  })

  it('uses local calendar days', () => {
    expect(dayKey(new Date(2025, 5, 7, 23, 30))).toBe('2025-06-07')
  })

  it('builds a Monday-first week', () => {
    const days = weekDays(new Date(2025, 5, 7)) // Saturday
    expect(dayKey(days[0])).toBe('2025-06-02')
    expect(dayKey(days[6])).toBe('2025-06-08')
  })
})

describe('stats', () => {
  const now = new Date(2025, 5, 7, 21, 0)
  const logs = [log('2025-06-07', 'happy'), log('2025-06-06', 'happy'), log('2025-06-05', 'sad'), log('2025-06-03', 'happy'), log('2025-05-20', 'angry')]

  it('counts moods in a range with percentages', () => {
    const shares = moodShares(logs, 7, now)
    const happy = shares.find((s) => s.id === 'happy')!
    expect(happy.days).toBe(3)
    expect(happy.percent).toBe(75)
    expect(shares.find((s) => s.id === 'angry')!.days).toBe(0)
    expect(topMood(shares)?.id).toBe('happy')
  })

  it('counts a streak ending today or yesterday', () => {
    expect(moodStreak(logs, now)).toBe(3)
    expect(moodStreak(logs, new Date(2025, 5, 8, 10))).toBe(3)
    expect(moodStreak(logs, new Date(2025, 5, 10, 10))).toBe(0)
  })

  it('finds the most logged mood this month', () => {
    expect(monthTopMood(logs, now)).toBe('happy')
  })

  it('counts a journaling streak', () => {
    const e = (d: string): Entry => ({ kind: 'text', title: '', body: 'x', createdAt: new Date(`${d}T21:00:00`).getTime(), updatedAt: 0 })
    expect(journalStreak([e('2025-06-07'), e('2025-06-06'), e('2025-06-04')], now)).toBe(2)
  })
})

describe('vent timing labels', () => {
  const t = Date.now()
  it('matches the Figma wording', () => {
    expect(postedAgo(t - 10_000, t)).toBe('Just Now')
    expect(postedAgo(t - 5 * 60_000, t)).toBe('Posted 5 mins ago')
    expect(postedAgo(t - 2 * 3_600_000, t)).toBe('Posted 2 hrs ago')
    expect(fadesIn(t - 3 * 3_600_000, t)).toBe('Fades in 21 hrs')
  })
})

describe('safety', () => {
  it('notices crisis language', () => {
    expect(mentionsCrisis('honestly I just want to die')).toBe(true)
    expect(mentionsCrisis('thinking about ending it all, end it all')).toBe(true)
    expect(mentionsCrisis('I died laughing at that meme')).toBe(false)
    expect(mentionsCrisis('work is killing me this week')).toBe(false)
  })

  it('blocks abusive replies but allows normal ones', () => {
    expect(isAbusive('just man up bro')).toBe(true)
    expect(isAbusive('kys')).toBe(true)
    expect(isAbusive('You’re not alone in this, brother.')).toBe(false)
  })
})
