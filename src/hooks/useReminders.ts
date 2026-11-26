import { useEffect } from 'react'
import { db } from '../lib/db'
import { dayKey, isMoodUnlocked } from '../lib/dates'
import { loadSettings } from '../lib/settings'

const JOURNAL_HOUR = 20

/**
 * Gentle in-app reminders, shown at most once per day each, when the app is
 * opened in the evening: the mood check-in after 7 PM, a journaling nudge after 8 PM.
 */
export function useReminders(show: (msg: string) => void) {
  useEffect(() => {
    const check = async () => {
      if (document.hidden) return
      const s = await loadSettings()
      if (!s.onboarded) return
      const now = new Date()
      const today = dayKey(now)

      if (s.moodReminder && isMoodUnlocked(now) && localStorage.getItem('unsaid-remind-mood') !== today && !(await db.moods.get(today))) {
        localStorage.setItem('unsaid-remind-mood', today)
        show('Your mood check-in is open. How was your day?')
        return
      }
      if (s.journalReminder && now.getHours() >= JOURNAL_HOUR && localStorage.getItem('unsaid-remind-journal') !== today) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        if ((await db.entries.where('createdAt').aboveOrEqual(start).count()) === 0) {
          localStorage.setItem('unsaid-remind-journal', today)
          show('A few lines before the day ends? Your journal is here.')
        }
      }
    }
    const t = setTimeout(check, 2500)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', check)
    }
  }, [show])
}
