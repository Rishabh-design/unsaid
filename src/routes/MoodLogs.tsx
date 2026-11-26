import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import clsx from 'clsx'
import { Screen } from '../components/Screen'
import { MoodFace } from '../components/MoodFace'
import { db } from '../lib/db'
import { MOOD_BY_ID } from '../lib/moods'
import { moodShares, topMood } from '../lib/stats'
import { dayKey, parseDayKey } from '../lib/dates'

const RANGES = [7, 14, 30] as const
type Range = (typeof RANGES)[number]

function RangeChips({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex gap-[8px]">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          aria-pressed={value === r}
          className={clsx(
            'h-[27px] rounded-pill border px-[11px] text-[0.55rem] font-medium tracking-[0.03em] text-white transition',
            value === r ? 'border-teal bg-teal/40 shadow-[0_0_6px_rgba(0,98,122,0.8)]' : 'border-mist/70',
          )}
        >
          Last {r} days
        </button>
      ))}
    </div>
  )
}

const INSIGHT: Record<string, string> = {
  happy: 'Lets keep that Energy going.',
  peaceful: 'That calm is worth protecting.',
  okay: 'Steady counts. Keep showing up.',
  neutral: 'Some weeks are just quiet. That’s okay.',
  sad: 'Be gentle with yourself — writing it out can help.',
  angry: 'Anger usually guards something heavier. Want to unpack it?',
  anxious: 'Try naming one worry at a time. You don’t have to solve it today.',
  numb: 'Feeling nothing is still a feeling. You’re not alone in it.',
}

export default function MoodLogs() {
  const logs = useLiveQuery(() => db.moods.orderBy('date').reverse().toArray(), [], [])
  const [statsRange, setStatsRange] = useState<Range>(7)
  const [timelineRange, setTimelineRange] = useState<Range>(7)
  const shares = moodShares(logs, statsRange)
  const top = topMood(shares)
  const heavy = top && MOOD_BY_ID[top.id].valence < 0

  const fromKey = dayKey(new Date(Date.now() - (timelineRange - 1) * 86_400_000))
  const timeline = logs.filter((l) => l.date >= fromKey)

  return (
    <Screen title={<>Your Journey so far.</>} subtitle="Track your patterns, celebrate your growth, reflect on your progress - all in one place.">
      <h2 className="mt-[40px] text-lead font-semibold tracking-[0.05em] text-mist">Mood Stats</h2>
      <section className="mt-[16px] rounded-card border border-teal px-[12px] pt-[12px] pb-[14px]">
        <RangeChips value={statsRange} onChange={setStatsRange} />
        <ul className="mt-[18px] space-y-[12px] pl-[4px]">
          {shares.map((s) => {
            const filled = Math.round(s.percent / 10)
            return (
              <li key={s.id} className="flex items-center">
                <span className="flex w-[24px] justify-center">
                  <MoodFace mood={s.id} size={20} dim={s.days === 0} />
                </span>
                <span className="ml-[10px] w-[48px] text-[0.55rem] font-medium tracking-[0.03em] text-white">{MOOD_BY_ID[s.id].label}</span>
                <span className="flex gap-[2px]" aria-hidden>
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={clsx('size-[10px] rounded-[2px] border border-teal/80', i < filled && 'bg-[linear-gradient(180deg,#00627a,#004a5c)]')} />
                  ))}
                </span>
                <span className="ml-[7px] w-[34px] text-[0.55rem] font-light text-mist/80">({s.percent}%)</span>
                <span className={clsx('ml-auto text-[0.55rem] tracking-[0.03em]', s.days ? 'font-bold text-teal-bright' : 'font-medium text-white')}>
                  {s.days} {s.days === 1 ? 'Day' : 'Days'}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="mt-[20px] flex gap-[12px] pl-[8px] text-[0.65rem] font-semibold leading-snug tracking-[0.03em] text-white">
        <span className="text-title font-bold leading-none">#</span>
        <span>
          {top ? (
            <>
              You’ve felt mostly <span className="text-teal-bright">{MOOD_BY_ID[top.id].label.toUpperCase()}</span> in the past {statsRange} Days. {INSIGHT[top.id]}{' '}
              {heavy && (
                <Link to="/journal/write" className="text-teal-bright underline">
                  Write it out
                </Link>
              )}
            </>
          ) : (
            <>No check-ins in the past {statsRange} days yet. Your mood log opens every evening at 7 PM.</>
          )}
        </span>
      </p>

      <h2 className="mt-[50px] text-lead font-semibold tracking-[0.05em] text-mist">Mood Log Timeline</h2>
      <p className="mt-[6px] text-caption font-light tracking-[0.05em] text-fg">A daily walk through your emotional journey !</p>
      <div className="mt-[20px]">
        <RangeChips value={timelineRange} onChange={setTimelineRange} />
      </div>
      <section className="-mx-[4px] mt-[18px] overflow-hidden rounded-card border border-mist/20 bg-[linear-gradient(180deg,#1e2b32,#000609_35%)]">
        <div className="grid grid-cols-[1fr_auto_44px] gap-x-[12px] px-[20px] pt-[16px] pb-[10px] text-[0.65rem] font-semibold text-white">
          <span>Date &amp; Day</span>
          <span>Timestamps</span>
          <span className="text-center">Mood</span>
        </div>
        <div className="max-h-[260px] overflow-y-auto px-[20px] pb-[16px] [mask-image:linear-gradient(180deg,#000_80%,transparent)]">
          {timeline.length === 0 && <p className="py-6 text-center text-caption text-mist/60">No moods logged in this range yet.</p>}
          {timeline.map((l) => (
            <div key={l.date} className="grid grid-cols-[1fr_auto_44px] items-center gap-x-[12px] py-[6px]">
              <span className="text-[0.6rem] font-medium text-white/85">{format(parseDayKey(l.date), "dd MMMM yyyy - EEEE").toLowerCase().replace(/ - (\w)/, (_, c: string) => ` - ${c.toUpperCase()}`)}</span>
              <span className="text-[0.6rem] font-bold text-teal">{format(l.loggedAt, 'hh:mm a')}</span>
              <span className="flex justify-center" title={MOOD_BY_ID[l.mood].label}>
                <MoodFace mood={l.mood} size={18} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </Screen>
  )
}
