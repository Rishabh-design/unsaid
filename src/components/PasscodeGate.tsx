import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Delete } from 'lucide-react'
import clsx from 'clsx'
import { checkPasscode, useSettings, type Settings } from '../lib/settings'
import { Logo } from './Logo'

const RELOCK_AFTER_MS = 60_000

/** Locks the app behind a 4-digit passcode when one is set in Settings. */
export function PasscodeGate({ children }: { children: ReactNode }) {
  const settings = useSettings()
  const [unlocked, setUnlocked] = useState(false)
  const hiddenAt = useRef<number | null>(null)

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) hiddenAt.current = Date.now()
      else if (hiddenAt.current && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) setUnlocked(false)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!settings) return null
  if (!settings.passcodeHash || unlocked) return <>{children}</>
  return <LockScreen settings={settings} onUnlock={() => setUnlocked(true)} />
}

function LockScreen({ settings, onUnlock }: { settings: Settings; onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    if (pin.length !== 4) return
    checkPasscode(pin, settings).then((ok) => {
      if (ok) onUnlock()
      else {
        setWrong(true)
        setTimeout(() => {
          setPin('')
          setWrong(false)
        }, 600)
      }
    })
  }, [pin, settings, onUnlock])

  const press = (d: string) => setPin((p) => (p.length < 4 ? p + d : p))

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center bg-ink px-10">
      <Logo />
      <p className="mt-8 text-body font-light tracking-[0.05em] text-mist">Enter your passcode</p>
      <div className={clsx('mt-5 flex gap-4', wrong && 'animate-pulse')}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={clsx('size-[14px] rounded-full border border-teal', i < pin.length && (wrong ? 'bg-red-500' : 'bg-teal'))} />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-3 gap-5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" onClick={() => press(d)} className="btn-glow size-[68px] rounded-full font-display text-title text-mist">
            {d}
          </button>
        ))}
        <span />
        <button type="button" onClick={() => press('0')} className="btn-glow size-[68px] rounded-full font-display text-title text-mist">
          0
        </button>
        <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Delete" className="flex size-[68px] items-center justify-center text-mist">
          <Delete size={22} />
        </button>
      </div>
    </div>
  )
}
