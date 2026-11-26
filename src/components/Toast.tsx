import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const ToastCtx = createContext<(msg: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 2800)
  }, [])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+96px)] z-[70] flex justify-center px-6">
        {msg && (
          <div className="animate-fade-up rounded-full border border-teal/60 bg-deep/95 px-5 py-3 text-center text-body text-mist shadow-[0_0_12px_rgba(0,98,122,0.5)]">
            {msg}
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
