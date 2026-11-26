import happy from '../assets/moods/happy.svg'
import peaceful from '../assets/moods/peaceful.svg'
import okay from '../assets/moods/okay.svg'
import angry from '../assets/moods/angry.svg'
import anxious from '../assets/moods/anxious.svg'
import numb from '../assets/moods/numb.svg'
import faceBase from '../assets/moods/face-base.svg'
import neutralEyes from '../assets/moods/neutral-eyes.svg'
import neutralMouth from '../assets/moods/neutral-mouth.svg'
import sadEyes from '../assets/moods/sad-eyes.svg'
import sadMouth from '../assets/moods/sad-mouth.svg'
import happyDim from '../assets/moods/happy-dim.svg'
import peacefulDim from '../assets/moods/peaceful-dim.svg'
import okayDim from '../assets/moods/okay-dim.svg'
import angryDim from '../assets/moods/angry-dim.svg'
import anxiousDim from '../assets/moods/anxious-dim.svg'
import numbDim from '../assets/moods/numb-dim.svg'
import faceBaseDim from '../assets/moods/face-base-dim.svg'
import neutralEyesDim from '../assets/moods/neutral-eyes-dim.svg'
import neutralMouthDim from '../assets/moods/neutral-mouth-dim.svg'
import sadEyesDim from '../assets/moods/sad-eyes-dim.svg'
import sadMouthDim from '../assets/moods/sad-mouth-dim.svg'

export type MoodId = 'happy' | 'peaceful' | 'okay' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'numb'

/**
 * A face is either one SVG, or (for neutral and sad) a base circle with eyes
 * and mouth layered on top, exactly as they are built in Figma.
 * Layer offsets are fractions of the face size, taken from the Figma frame.
 */
export type FaceArt =
  | { kind: 'single'; src: string; aspect: number }
  | {
      kind: 'layered'
      base: string
      eyes: { src: string; left: number; top: number; width: number; height: number }
      mouth: { src: string; left: number; top: number; width: number; height: number }
    }

export interface Mood {
  id: MoodId
  label: string
  /** -2 (heavy) .. +2 (light). Used to place faces on the weekly chart. */
  valence: number
  art: FaceArt
  dim: FaceArt
}

const S = 25.243 // Figma face size on the home screen

function layered(base: string, eyes: string, mouth: string, kind: 'neutral' | 'sad'): FaceArt {
  return kind === 'neutral'
    ? {
        kind: 'layered',
        base,
        eyes: { src: eyes, left: 5.32 / S, top: 7.07 / S, width: 14.388 / S, height: 5.049 / S },
        // Figma offsets the stroked line by its stroke width: 6.32 − 5.24% and 17.54 − 0.68.
        mouth: { src: mouth, left: 5.646 / S, top: 16.86 / S, width: 14.2238 / S, height: 1.35 / S },
      }
    : {
        kind: 'layered',
        base,
        eyes: { src: eyes, left: 4.98 / S, top: 7.07 / S, width: 14.388 / S, height: 5.049 / S },
        mouth: { src: mouth, left: 6.3 / S, top: 15.48 / S, width: 12.2 / S, height: 3.62 / S },
      }
}

export const MOODS: Mood[] = [
  { id: 'happy', label: 'Happy', valence: 2, art: { kind: 'single', src: happy, aspect: 1 }, dim: { kind: 'single', src: happyDim, aspect: 1 } },
  {
    id: 'peaceful',
    label: 'Peaceful',
    valence: 2,
    art: { kind: 'single', src: peaceful, aspect: 30.291 / 25.495 },
    dim: { kind: 'single', src: peacefulDim, aspect: 30.291 / 25.495 },
  },
  { id: 'okay', label: 'Okay', valence: 1, art: { kind: 'single', src: okay, aspect: 1 }, dim: { kind: 'single', src: okayDim, aspect: 1 } },
  {
    id: 'neutral',
    label: 'Neutral',
    valence: 0,
    art: layered(faceBase, neutralEyes, neutralMouth, 'neutral'),
    dim: layered(faceBaseDim, neutralEyesDim, neutralMouthDim, 'neutral'),
  },
  {
    id: 'sad',
    label: 'Sad',
    valence: -1,
    art: layered(faceBase, sadEyes, sadMouth, 'sad'),
    dim: layered(faceBaseDim, sadEyesDim, sadMouthDim, 'sad'),
  },
  { id: 'angry', label: 'Angry', valence: -2, art: { kind: 'single', src: angry, aspect: 1 }, dim: { kind: 'single', src: angryDim, aspect: 1 } },
  { id: 'anxious', label: 'Anxious', valence: -1, art: { kind: 'single', src: anxious, aspect: 1 }, dim: { kind: 'single', src: anxiousDim, aspect: 1 } },
  { id: 'numb', label: 'Numb', valence: -1, art: { kind: 'single', src: numb, aspect: 1 }, dim: { kind: 'single', src: numbDim, aspect: 1 } },
]

export const MOOD_BY_ID = Object.fromEntries(MOODS.map((m) => [m.id, m])) as Record<MoodId, Mood>
