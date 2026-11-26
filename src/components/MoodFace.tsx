import { MOOD_BY_ID, type FaceArt, type MoodId } from '../lib/moods'

interface Props {
  mood: MoodId
  size: number
  dim?: boolean
  className?: string
}

/** Renders a mood face from the Figma assets. Neutral and sad are layered exactly as in Figma. */
export function MoodFace({ mood, size, dim = false, className }: Props) {
  const m = MOOD_BY_ID[mood]
  const art: FaceArt = dim ? m.dim : m.art
  if (art.kind === 'single') {
    return (
      <img
        src={art.src}
        alt=""
        draggable={false}
        className={className}
        style={{ width: size * art.aspect, height: size, display: 'block' }}
      />
    )
  }
  return (
    <span className={className} style={{ position: 'relative', display: 'block', width: size, height: size }}>
      <img src={art.base} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: size, height: size }} />
      {[art.eyes, art.mouth].map((l) => (
        <img
          key={l.src}
          src={l.src}
          alt=""
          draggable={false}
          style={{ position: 'absolute', left: l.left * size, top: l.top * size, width: l.width * size, height: l.height * size }}
        />
      ))}
    </span>
  )
}
