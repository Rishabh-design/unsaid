import { useEffect, useRef, useState } from 'react'

/** Pull down from the top of the page to refresh, as in the "refresh vent" frame. */
export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)
  const cb = useRef(onRefresh)
  useEffect(() => {
    cb.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null
    }
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return
      const d = Math.max(0, e.touches[0].clientY - startY.current)
      pullRef.current = Math.min(90, d * 0.5)
      setPull(pullRef.current)
    }
    const onEnd = async () => {
      if (startY.current === null) return
      startY.current = null
      if (pullRef.current > 55) {
        setRefreshing(true)
        try {
          await cb.current()
        } finally {
          setRefreshing(false)
        }
      }
      pullRef.current = 0
      setPull(0)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])

  return { pull, refreshing }
}
