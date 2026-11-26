import { Phone } from 'lucide-react'
import { HELPLINES } from '../lib/crisis'
import { Sheet } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  /** When set, shows a secondary action (e.g. "Post anyway"). */
  onContinue?: () => void
  continueLabel?: string
}

/** Shown when someone writes something that suggests they may be in danger. */
export function CrisisSheet({ open, onClose, onContinue, continueLabel = 'Continue' }: Props) {
  return (
    <Sheet open={open} onClose={onClose} label="Support resources">
      <h2 className="teal-text-gradient font-body text-lead font-black tracking-[0.05em]">You don’t have to carry this alone.</h2>
      <p className="mt-2 text-caption font-light leading-relaxed text-mist">
        It sounds like things are really heavy right now. UNSAID isn’t a crisis service, but these people are — free, confidential, and ready to
        listen. One call is enough.
      </p>
      <ul className="mt-4 space-y-3">
        {HELPLINES.map((h) => (
          <li key={h.name} className="rounded-card border border-teal/40 px-4 py-3">
            <p className="text-caption font-semibold text-mist">{h.name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {h.numbers.map((n) => (
                <a key={n.tel} href={`tel:${n.tel}`} className="inline-flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-caption font-semibold text-white">
                  <Phone size={12} /> {n.label}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-micro text-mist/70">If you are in immediate danger, call 112.</p>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="btn-glow h-[40px] flex-1 rounded-card text-caption font-semibold text-mist">
          Not now
        </button>
        {onContinue && (
          <button type="button" onClick={onContinue} className="btn-fill h-[40px] flex-1 rounded-card text-caption font-semibold text-white">
            {continueLabel}
          </button>
        )}
      </div>
    </Sheet>
  )
}
