import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import writeIcon from '../assets/icons/write.png'
import micIcon from '../assets/icons/mic.png'
import glow21 from '../assets/brand/glow-21.svg'
import glow22 from '../assets/brand/glow-22.svg'
import glow102 from '../assets/brand/glow-102.svg'
import { Screen } from '../components/Screen'
import { GlowButton } from '../components/ui'
import { MoodCheckIn } from '../components/home/MoodCheckIn'
import { WeeklyStats } from '../components/home/WeeklyStats'
import { MonthCalendar } from '../components/home/MonthCalendar'
import { db } from '../lib/db'
import { dayKey } from '../lib/dates'
import { useNow } from '../hooks/useNow'

export default function Home() {
  const navigate = useNavigate()
  const now = useNow()
  const logs = useLiveQuery(() => db.moods.toArray(), [], [])
  const today = logs.find((l) => l.date === dayKey(now))
  const [choosing, setChoosing] = useState(false)

  return (
    <Screen back={false} className="pt-[22px]">
      <MoodCheckIn today={today} now={now} />

      <div className="relative">
        <section className="relative -mx-[12px] rounded-card border-[0.3px] border-mist bg-[rgba(219,219,219,0.01)] px-[clamp(16px,6.5vw,34px)] pt-[24px] pb-[24px] backdrop-blur-[40px]">
          <h2 className="card-title-gradient whitespace-nowrap text-center font-display text-[min(1.25rem,5.1vw)] tracking-[0.05em]">Wanna Talk about it ?</h2>
          <p className="mt-[6px] text-center text-caption font-light tracking-[0.05em] text-fg">Your safe space to reflect or just write freely.</p>
          <GlowButton className="mt-[24px] w-full" onClick={() => setChoosing((c) => !c)} aria-expanded={choosing}>
            Start journaling
          </GlowButton>
          <div className={clsx('grid transition-all duration-300', choosing ? 'mt-[22px] grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
            <div className="overflow-hidden">
              <p className="text-center text-body font-semibold tracking-[0.05em] text-mist">How would you like to start ?</p>
              <div className="mt-[20px] grid grid-cols-2 gap-[14px]">
                {[
                  { to: '/journal/write', icon: writeIcon, label: 'Write it out.' },
                  { to: '/journal/speak', icon: micIcon, label: 'Speak it out.' },
                ].map((o) => (
                  <button key={o.to} type="button" onClick={() => navigate(o.to)} className="flex flex-col items-center" tabIndex={choosing ? 0 : -1}>
                    <span className="btn-glow flex h-[71px] w-full items-center justify-center rounded-card">
                      <img src={o.icon} alt="" className="size-[34px]" />
                    </span>
                    <span className="mt-[10px] text-caption font-light tracking-[0.05em] text-fg">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="relative -mx-[12px] mt-[31px]">
          {/* Figma places a teal and a black circle behind this glass card; its blur turns them into the glow. */}
          <img src={glow21} alt="" className="pointer-events-none absolute left-[7px] top-[50px] size-[80px]" />
          <img src={glow22} alt="" className="pointer-events-none absolute right-[5px] top-[-1px] size-[102px]" />
          <section className="relative rounded-card border-[0.5px] border-teal bg-[rgba(219,219,219,0.01)] px-[clamp(16px,6.5vw,34px)] pt-[23px] pb-[23px] backdrop-blur-[40px]">
            <h2 className="card-title-gradient whitespace-nowrap text-center font-display text-[min(1.25rem,5.1vw)] tracking-[0.05em]">Anonymous Venting</h2>
            <p className="mx-auto mt-[6px] max-w-[240px] text-center text-caption font-light tracking-[0.05em] text-fg">
              Vent Anonymously. Like shouting into the void - and leaving it their.
            </p>
            <GlowButton className="mt-[24px] w-full" onClick={() => navigate('/vent')}>
              Start Venting
            </GlowButton>
          </section>
        </div>
      </div>

      <div className="relative">
        <img src={glow102} alt="" className="pointer-events-none absolute right-[-272px] top-[-170px] h-[530px] w-[526px] max-w-none" />
        <WeeklyStats logs={logs} now={now} />
      </div>
      <MonthCalendar logs={logs} now={now} />
    </Screen>
  )
}
