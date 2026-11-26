import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import splashBg from '../assets/brand/splash-bg.jpg'
import knob from '../assets/icons/slider-knob.svg'
import arrow from '../assets/icons/slider-arrow.svg'
import { Logo } from '../components/Logo'
import { useSettings } from '../lib/settings'

const TRACK_W = 268
const KNOB = 60
const PAD = 11

export default function Splash() {
  const navigate = useNavigate()
  const settings = useSettings()
  const [x, setX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef(0)
  const max = TRACK_W - KNOB - PAD * 2

  const finish = () => navigate(settings?.onboarded ? '/' : '/welcome', { replace: true })

  const onDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    start.current = e.clientX - x
    setDragging(true)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setX(Math.min(max, Math.max(0, e.clientX - start.current)))
  }
  const onUp = () => {
    setDragging(false)
    if (x > max * 0.8) {
      setX(max)
      setTimeout(finish, 150)
    } else setX(0)
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col overflow-hidden bg-ink">
      <img src={splashBg} alt="" className="pointer-events-none absolute inset-0 size-full object-cover object-bottom" />
      <div className="relative flex flex-1 flex-col items-center justify-center pb-[8vh]">
        <Logo />
        <p className="mt-[12px] text-center text-[0.8125rem] font-medium uppercase leading-snug tracking-[0.05em] text-mist">
          what you don’t say,
          <br />
          still matters
        </p>
      </div>

      <div className="relative mx-auto mb-[calc(env(safe-area-inset-bottom)+40px)]" style={{ width: TRACK_W, height: 82 }}>
        <div className="absolute inset-0 rounded-[50px] border border-white/15 bg-black/20 backdrop-blur-[2px]" />
        <span
          className="absolute top-1/2 -translate-y-1/2 text-[0.8125rem] tracking-[0.05em] text-mist/80 uppercase transition-opacity"
          style={{ left: 96, opacity: 1 - x / max }}
        >
          slide to continue
        </span>
        <button
          type="button"
          aria-label="Slide to continue"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && finish()}
          className="absolute top-1/2 -translate-y-1/2 touch-none"
          style={{ left: PAD + x, width: KNOB, height: KNOB, transition: dragging ? 'none' : 'left 0.25s ease' }}
        >
          <img src={knob} alt="" className="absolute inset-0 size-full" draggable={false} />
          <img src={arrow} alt="" draggable={false} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" style={{ width: 24, height: 24 }} />
        </button>
      </div>
    </div>
  )
}
