/** A small decorative waveform for voice log cards, stable per entry id. */
export function Waveform({ seed, bars = 48, className }: { seed: number; bars?: number; className?: string }) {
  let x = seed * 9301 + 49297
  const rand = () => {
    x = (x * 9301 + 49297) % 233280
    return x / 233280
  }
  const heights = Array.from({ length: bars }, (_, i) => {
    const envelope = 0.35 + 0.65 * Math.sin((i / bars) * Math.PI)
    return Math.max(0.12, envelope * (0.3 + rand() * 0.7))
  })
  return (
    <svg viewBox={`0 0 ${bars * 3} 20`} className={className} preserveAspectRatio="none" aria-hidden>
      {heights.map((h, i) => (
        <rect key={i} x={i * 3} y={10 - h * 10} width={1.6} height={h * 20} rx={0.8} fill="#8fc2f2" />
      ))}
    </svg>
  )
}
