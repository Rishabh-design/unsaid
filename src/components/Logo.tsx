import logoN from '../assets/brand/logo-n.svg'

/** "UNSAID" wordmark: Unbounded Black with the split-N mark from Figma. */
export function Logo({ scale = 1 }: { scale?: number }) {
  const fs = 33.271 * scale
  return (
    <div className="flex items-center justify-center font-display font-black text-white opacity-75" style={{ fontSize: fs, lineHeight: 1 }} aria-label="UNSAID">
      <span aria-hidden>U</span>
      <img src={logoN} alt="" aria-hidden style={{ width: 12.928 * scale, height: 25.427 * scale, margin: `0 ${6 * scale}px 0 ${5 * scale}px` }} />
      <span aria-hidden>SAID</span>
    </div>
  )
}
