import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { X } from 'lucide-react'

const ITEMS: { to: string; label: [string, string?] }[] = [
  { to: '/', label: ['HOME'] },
  { to: '/logs', label: ['JOURNAL', 'LOGS'] },
  { to: '/moods', label: ['MOOD', 'LOGS'] },
  { to: '/vent-space', label: ['VENT', 'SPACE'] },
  { to: '/settings', label: ['SETTINGS'] },
  { to: '/about', label: ['ABOUT', 'UNSAID'] },
  { to: '/mission', label: ['OUR', 'MISSION'] },
  { to: '/creator', label: ['ABOUT', 'CREATOR'] },
  { to: '/help', label: ['HELP &', 'SUPPORT'] },
  { to: '/profile', label: ['PROFILE'] },
]

export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] bg-ink animate-fade-up" role="dialog" aria-modal="true" aria-label="Menu">
      <div
        className="relative m-[26px] mt-[calc(env(safe-area-inset-top)+46px)] flex flex-1 flex-col items-center justify-center rounded-[40px] border border-line/40"
        style={{ background: 'radial-gradient(120% 70% at 0% 45%, rgba(0,98,122,0.75), rgba(0,6,9,0) 65%), var(--c-ink)' }}
      >
        <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-[18px] top-[18px] p-2 text-fg">
          <X size={24} strokeWidth={3} />
        </button>
        <nav className="flex flex-col items-center gap-[24px]">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                clsx('text-lead tracking-[0.08em]', isActive ? 'font-bold text-teal-mid' : 'font-light text-mist')
              }
            >
              {item.label[0]}
              {item.label[1] && <span className="font-light opacity-80"> {item.label[1]}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
