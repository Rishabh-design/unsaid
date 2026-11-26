import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import clsx from 'clsx'
import { MoodFace } from '../MoodFace'
import { MOOD_BY_ID } from '../../lib/moods'
import { dayKey, weekDays } from '../../lib/dates'
import type { MoodLog } from '../../lib/db'

const CHART_H = 143
const MID = 73 // the neutral line, as in Figma

/** "Weekly Stats !" — each day's mood sits above or below the neutral line by how light or heavy it was. */
export function WeeklyStats({ logs, now }: { logs: MoodLog[]; now: Date }) {
  const byDay = new Map(logs.map((l) => [l.date, l.mood]))
  const days = weekDays(now)
  const todayKey = dayKey(now)

  return (
    <section className="mt-[37px]">
      <h2 className="text-title font-bold tracking-[0.05em] text-mist">Weekly Stats !</h2>
      <p className="mt-[6px] text-caption font-light tracking-[0.05em] text-fg">A snapshot of how you’ve been feeling lately.</p>

      <div className="relative mt-[30px] ml-[6px]" style={{ height: CHART_H }}>
        <span className="absolute bottom-0 left-0 top-0 w-[2px] rounded bg-mist/80" />
        <span className="absolute bottom-0 left-0 right-[-8px] h-[2px] rounded bg-mist/80" />
        <span className="absolute left-0 right-[-8px] h-[0.5px] bg-mist/50" style={{ top: MID }} />
        <div className="absolute inset-0 left-[14px] grid grid-cols-7">
          {days.map((d) => {
            const key = dayKey(d)
            const mood = byDay.get(key)
            const y = mood ? MID - MOOD_BY_ID[mood].valence * 26 : MID
            return (
              <div key={key} className="relative">
                {mood ? (
                  <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-up" style={{ top: y }} title={`${format(d, 'EEEE')}: ${MOOD_BY_ID[mood].label}`}>
                    <MoodFace mood={mood} size={25.243} />
                  </span>
                ) : (
                  <span
                    className={clsx('absolute left-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full', key > todayKey ? 'bg-mist/15' : 'bg-mist/35')}
                    style={{ top: MID }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-[8px] ml-[20px] grid grid-cols-7">
        {days.map((d) => (
          <span key={d.toISOString()} className={clsx('text-center text-micro font-semibold uppercase tracking-[0.05em]', dayKey(d) === todayKey ? 'text-teal-bright' : 'text-fg')}>
            {format(d, 'EEE')}
          </span>
        ))}
      </div>

      <div className="mt-[26px] flex justify-center">
        <Link to="/moods" className="btn-fill flex h-[30px] w-[100px] items-center justify-center rounded-card text-micro font-semibold tracking-[0.05em] text-white">
          Explore
        </Link>
      </div>
    </section>
  )
}
