import { useState } from 'react'
import { format } from 'date-fns'
import { Lock } from 'lucide-react'
import clsx from 'clsx'
import tooltipArrow from '../../assets/icons/tooltip-arrow.svg'
import { MoodFace } from '../MoodFace'
import { MOODS, MOOD_BY_ID, type MoodId } from '../../lib/moods'
import { db, type MoodLog } from '../../lib/db'
import { dayKey, isMoodUnlocked } from '../../lib/dates'
import { useToast } from '../Toast'

const FACE = 25.243

/**
 * The daily check-in at the top of Home. Three states from Figma:
 * locked until 7 PM, open (pick one face), and logged.
 */
export function MoodCheckIn({ today, now }: { today: MoodLog | undefined; now: Date }) {
  const toast = useToast()
  const [selected, setSelected] = useState<MoodId | null>(null)
  const [changing, setChanging] = useState(false)
  const unlocked = isMoodUnlocked(now)

  const save = async () => {
    if (!selected) return
    await db.moods.put({ date: dayKey(now), mood: selected, loggedAt: Date.now() })
    setSelected(null)
    setChanging(false)
    toast('Mood logged. Thank you for checking in.')
  }

  if (today && !changing) {
    return (
      <section>
        <h1 className="title-gradient font-display text-[1.5625rem] font-black leading-[1.25] tracking-[0.05em]">You logged your mood for Today.</h1>
        <p className="mt-[16px] text-body font-light tracking-[0.05em] text-fg">Thank you !</p>
        <div className="mt-[16px] flex h-[40px] items-center rounded-card border-[0.3px] border-mist pl-[11px] pr-[20px]">
          <MoodFace mood={today.mood} size={FACE} />
          <span className="ml-[9px] text-body font-light uppercase tracking-[0.05em] text-sage">{MOOD_BY_ID[today.mood].label}</span>
          <span className="ml-auto text-body font-light uppercase tracking-[0.05em] text-mist">{format(now, 'EEE, dd/MM/yyyy')}</span>
        </div>
        <div className="flex h-[52px] items-start justify-end pt-[8px]">
          <button type="button" onClick={() => setChanging(true)} className="text-micro tracking-[0.05em] text-mist/60 underline-offset-2 hover:underline">
            Changed your mind? Update today’s mood
          </button>
        </div>
      </section>
    )
  }

  if (!unlocked && !today) {
    return (
      <section>
        <h1 className="title-gradient font-display text-[1.5625rem] font-black leading-[1.25] tracking-[0.05em]">We’ll check your mood tonight !</h1>
        <p className="mt-[12px] text-body font-light tracking-[0.05em] text-fg">Mood logins opens post 7 PM - once your day settles.</p>
        <div className="relative mt-[16px] flex h-[40px] items-center justify-center gap-[12px] rounded-card border-[0.3px] border-mist" aria-label="Mood check-in opens at 7 PM">
          {MOODS.map((m) => (
            <span key={m.id} className="opacity-40">
              <MoodFace mood={m.id} size={FACE} dim />
            </span>
          ))}
          <span className="absolute left-1/2 top-1/2 flex size-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink">
            <Lock size={12} strokeWidth={2.5} />
          </span>
        </div>
        <div className="h-[52px]" />
      </section>
    )
  }

  return (
    <section>
      <h1 className="title-gradient max-w-[326px] font-display text-h1 font-black leading-[1.25] tracking-[0.05em]">How was your day today ?</h1>
      <p className="mt-[12px] max-w-[304px] text-body font-light tracking-[0.05em] text-fg">Choose the mood that fits your overall day - one tap, once a day.</p>
      <div role="radiogroup" aria-label="Today’s mood" className="mt-[16px] flex h-[40px] items-center justify-center gap-[12px] rounded-card border-[0.3px] border-mist">
        {MOODS.map((m) => {
          const isSel = selected === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              aria-label={m.label}
              onClick={() => setSelected(m.id)}
              className="relative transition-transform active:scale-90"
            >
              <MoodFace mood={m.id} size={FACE} dim={!isSel} className={clsx(isSel && 'scale-110')} />
              {isSel && (
                <span className="absolute left-1/2 top-[34px] flex -translate-x-1/2 flex-col items-center">
                  <img src={tooltipArrow} alt="" className="h-[7.5px] w-[8.66px]" />
                  <span className="whitespace-nowrap rounded-[35px] bg-teal px-[10px] py-[3px] text-caption font-bold tracking-[0.05em] text-white">{m.label}</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
      {/* 58px gap to the first card, as in Figma; the confirm button lives in its lower right. */}
      <div className="relative h-[58px]">
        {selected && (
          <div className="absolute bottom-[4px] right-0 flex items-center gap-3">
            {changing && (
              <button type="button" onClick={() => { setChanging(false); setSelected(null) }} className="text-caption text-mist/70">
                Cancel
              </button>
            )}
            <button type="button" onClick={save} className="btn-fill h-[30px] animate-fade-up rounded-card px-4 text-caption font-semibold tracking-[0.05em] text-white">
              Log today’s mood
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
