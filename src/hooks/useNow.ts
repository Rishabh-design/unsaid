import { useEffect, useState } from 'react'

/** Current time, refreshed every `ms` so time-based UI (like the 7 PM unlock) updates on its own. */
export function useNow(ms = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    const onVis = () => !document.hidden && setNow(new Date())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ms])
  return now
}
