import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import backIcon from '../assets/icons/back.png'
import menuIcon from '../assets/icons/menu.png'
import { Menu } from './Menu'

interface Props {
  title?: ReactNode
  subtitle?: ReactNode
  back?: boolean | string
  menu?: boolean
  children: ReactNode
  className?: string
  /** Extra classes for the title (size varies by screen in Figma). */
  titleClassName?: string
  /** Rendered fixed at the bottom of the screen, above the safe area. */
  footer?: ReactNode
}

/**
 * The common page shell from Figma: back arrow top-left, menu top-right,
 * gradient Unbounded heading, light Montserrat subtitle, 38px side gutters.
 */
export function Screen({ title, subtitle, back = true, menu = true, children, className, titleClassName, footer }: Props) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const goBack = () => {
    if (typeof back === 'string') navigate(back)
    else if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-clip bg-ink">
      <header className="relative z-10 flex h-[44px] items-end justify-between px-[var(--gutter)]" style={{ marginTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
        {back ? (
          <button type="button" onClick={goBack} aria-label="Go back" className="-m-3 p-3">
            <img src={backIcon} alt="" className="size-[22px]" />
          </button>
        ) : (
          <span />
        )}
        {menu && (
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-m-3 translate-y-[9px] p-3">
            <img src={menuIcon} alt="" className="size-[20px]" />
          </button>
        )}
      </header>

      <main className={clsx('relative flex flex-1 flex-col px-[var(--gutter)] pb-[calc(env(safe-area-inset-bottom)+32px)]', className)}>
        {title && (
          // Figma lets headings run to 25px from the right edge, wider than the 38px body gutter.
          <h1 className={clsx('title-gradient mr-[calc(var(--gutter)*-0.34)] mt-[20px] font-display text-h2 font-bold tracking-[0.05em]', titleClassName)}>{title}</h1>
        )}
        {subtitle && <p className="mt-[6px] max-w-[320px] text-caption font-light leading-snug tracking-[0.05em] text-fg">{subtitle}</p>}
        {children}
      </main>

      {footer}
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
