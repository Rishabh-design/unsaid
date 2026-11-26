import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }

/** Outlined button with the inner teal glow ("Start journaling"). */
export function GlowButton({ className, children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'btn-glow h-[44px] rounded-card text-body font-medium tracking-[0.05em] text-mist transition active:scale-[0.98] disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Teal-to-background filled button ("Save Entry", "Vent Now"). */
export function FillButton({ className, children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'btn-fill h-[40px] rounded-card text-caption font-semibold tracking-[0.05em] text-white transition active:scale-[0.98] disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Dark secondary button ("Clear"). */
export function GhostButton({ className, children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'h-[40px] rounded-card bg-deep text-caption font-semibold tracking-[0.05em] text-mist transition active:scale-[0.98] disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Rounded pill used for chips and the Vent / Save / Delete row. */
export function Pill({ active, className, children, ...rest }: BtnProps & { active?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'h-[35px] rounded-[30px] border border-teal px-4 text-caption font-semibold tracking-[0.05em] text-white transition active:scale-[0.97] disabled:opacity-40',
        active ? 'bg-teal shadow-[inset_0_4px_4px_rgba(0,0,0,0.5)]' : 'bg-teal/20',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-[13px] w-[22px] shrink-0 rounded-full border transition',
        checked ? 'border-teal bg-teal' : 'border-mist/60 bg-transparent',
      )}
    >
      <span
        className={clsx(
          'absolute top-1/2 size-[9px] -translate-y-1/2 rounded-full bg-white transition-all',
          checked ? 'left-[10px]' : 'left-[1px]',
        )}
      />
    </button>
  )
}

/** Centered dialog with a dimmed backdrop. */
export function Modal({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-[24px]" onClick={onClose} role="dialog" aria-modal="true" aria-label={label}>
      <div className="w-full max-w-[380px] animate-fade-up" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/** Bottom sheet. */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70" onClick={onClose} role="dialog" aria-modal="true" aria-label={label}>
      <div
        className="w-full max-w-[430px] animate-fade-up rounded-t-[32px] border-t border-teal/50 bg-ink px-[28px] pt-[24px] pb-[calc(env(safe-area-inset-bottom)+24px)]"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,98,122,0.35), rgba(0,6,9,0) 60%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <span className={clsx('inline-block size-[18px] animate-spin rounded-full border-2 border-teal border-t-transparent', className)} aria-label="Loading" />
}
