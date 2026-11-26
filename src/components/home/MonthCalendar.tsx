import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { dayKey } from '../../lib/dates'
import { MOOD_BY_ID } from '../../lib/moods'
import type { MoodLog } from '../../lib/db'

/** "Little by Little" — days you checked in light up. */
export function MonthCalendar({ logs, now }: { logs: MoodLog[]; now: Date }) {
  const [offset, setOffset] = useState(0)
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const byDay = new Map(logs.map((l) => [l.date, l.mood]))
  const lead = month.getDay() // Sunday-first, as in Figma
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const todayKey = dayKey(now)
  const logged = Array.from({ length: count }, (_, i) => dayKey(new Date(month.getFullYear(), month.getMonth(), i + 1))).filter((k) => byDay.has(k)).length

  return (
    <section className="mt-[43px]">
      <h2 className="text-title font-bold tracking-[0.05em] text-mist">Little by Little</h2>
      <p className="mt-[6px] text-caption font-light tracking-[0.05em] text-fg">Every day counts, even the quiet ones.</p>

      <div className="btn-fill mx-auto mt-[24px] w-full max-w-[323px] rounded-card px-[24px] pt-[16px] pb-[20px]">
        <div className="flex items-center justify-between">
          <p className="text-caption font-bold uppercase tracking-[0.05em] text-white">{format(month, 'MMMM yyyy')}</p>
          <div className="flex items-center gap-1 text-white/80">
            <button type="button" aria-label="Previous month" onClick={() => setOffset((o) => o - 1)} className="p-1">
              <ChevronLeft size={14} />
            </button>
            <button type="button" aria-label="Next month" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset === 0} className="p-1 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="mt-[10px] grid grid-cols-7 gap-x-[8px]">
          {['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'].map((d) => (
            <span key={d} className="text-center text-micro font-semibold italic tracking-[0.05em] text-white">
              {d}
            </span>
          ))}
        </div>
        <div className="mt-[8px] grid grid-cols-7 gap-[8px]">
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const d = new Date(month.getFullYear(), month.getMonth(), i + 1)
            const key = dayKey(d)
            const mood = byDay.get(key)
            const future = key > todayKey
            return (
              <span
                key={key}
                title={mood ? MOOD_BY_ID[mood].label : undefined}
                className={clsx(
                  'mx-auto flex size-[20px] items-center justify-center rounded-full text-caption font-bold tracking-[0.05em]',
                  mood ? 'bg-mist text-teal' : 'bg-teal text-white/30',
                  future && 'opacity-40',
                  key === todayKey && 'ring-1 ring-white ring-offset-1 ring-offset-teal',
                )}
              >
                {i + 1}
              </span>
            )
          })}
        </div>
        <p className="mt-[14px] text-micro tracking-[0.05em] text-white/70">
          {logged === 0 ? 'No check-ins yet this month.' : `${logged} check-in${logged === 1 ? '' : 's'} this month.`}
        </p>
      </div>
    </section>
  )
}
