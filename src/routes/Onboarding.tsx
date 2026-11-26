import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import card1 from '../assets/onboarding/card1.jpg'
import card2 from '../assets/onboarding/card2.jpg'
import card3 from '../assets/onboarding/card3.jpg'
import dots1 from '../assets/onboarding/dots-1.svg'
import dots2 from '../assets/onboarding/dots-2.svg'
import dots3 from '../assets/onboarding/dots-3.svg'
import arrowNext from '../assets/onboarding/arrow-next.svg'
import arrowPrev from '../assets/onboarding/arrow-prev.svg'
import { loadProfile, updateSettings } from '../lib/settings'

const CARDS = [
  { img: card1, opacity: 0.8, bg: '#000d10', text: 'Not everything needs to be spoken.', dots: dots1 },
  { img: card2, opacity: 0.65, bg: '#000609', text: 'A space just for you — no judgments.', dots: dots2 },
  { img: card3, opacity: 0.35, bg: '#000609', text: 'Let it out. You’ll feel better', dots: dots3 },
]

/** Figma draws the chevrons as rotated triangles; this reproduces that geometry. */
function Chevron({ dir, onClick, dim }: { dir: 'prev' | 'next'; onClick: () => void; dim?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'next' ? 'Next' : 'Previous'}
      className={clsx('flex size-[39.454px] items-center justify-center', dim && 'pointer-events-none opacity-30')}
    >
      <span className="relative block size-[28.882px]" style={{ transform: dir === 'next' ? 'rotate(-30deg)' : 'rotate(-150deg) scaleY(-1)' }}>
        <img src={dir === 'next' ? arrowNext : arrowPrev} alt="" className="absolute" style={{ left: '6.7%', right: '6.7%', top: 0, bottom: '25%', width: '86.6%', height: '75%' }} />
      </span>
    </button>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const touchX = useRef<number | null>(null)

  const begin = async () => {
    await loadProfile()
    await updateSettings({ onboarded: true })
    navigate('/', { replace: true })
  }
  const go = (n: number) => setI(Math.max(0, Math.min(CARDS.length - 1, n)))
  const card = CARDS[i]

  return (
    <div
      className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col overflow-hidden transition-colors duration-500"
      style={{ background: card.bg }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
    >
      {CARDS.map((c, n) => (
        <img
          key={n}
          src={c.img}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500"
          style={{ opacity: n === i ? c.opacity : 0 }}
        />
      ))}

      {i < CARDS.length - 1 && (
        <button type="button" onClick={begin} className="absolute right-[28px] top-[calc(env(safe-area-inset-top)+24px)] z-10 text-caption tracking-[0.1em] text-mist/60 uppercase">
          Skip
        </button>
      )}

      <div className="relative flex flex-1 flex-col items-center justify-end pb-[calc(env(safe-area-inset-bottom)+40px)]">
        <p
          key={i}
          className="w-[220px] animate-fade-up bg-[linear-gradient(90deg,#dbdbdb,rgba(219,219,219,0.5))] bg-clip-text text-center text-[0.875rem] font-medium tracking-[0.05em] text-transparent [font-variant:small-caps]"
        >
          {card.text}
        </p>

        <div className="mt-[40px] h-[47px]">
          {i === CARDS.length - 1 && (
            <button
              type="button"
              onClick={begin}
              className="h-[47px] w-[154px] animate-fade-up rounded-[29px] border border-sage text-[0.875rem] font-medium tracking-[0.05em] text-white"
            >
              LET’S BEGIN
            </button>
          )}
        </div>

        <div className="mt-[34px] flex w-full items-center justify-between px-[31px]">
          <Chevron dir="prev" onClick={() => go(i - 1)} dim={i === 0} />
          <img src={card.dots} alt={`Step ${i + 1} of ${CARDS.length}`} style={{ width: 52.058, height: 10.011 }} />
          <Chevron dir="next" onClick={() => (i === CARDS.length - 1 ? begin() : go(i + 1))} dim={i === CARDS.length - 1} />
        </div>
      </div>
    </div>
  )
}
