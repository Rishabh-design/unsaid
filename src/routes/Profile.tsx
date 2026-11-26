import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { User } from 'lucide-react'
import cameraIcon from '../assets/profile/camera.png'
import streakIcon from '../assets/profile/streak.png'
import journalIcon from '../assets/profile/journal.png'
import voiceIcon from '../assets/profile/voice.png'
import { Screen } from '../components/Screen'
import { MoodFace } from '../components/MoodFace'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { MOOD_BY_ID } from '../lib/moods'
import { journalStreak, monthTopMood, moodStreak } from '../lib/stats'
import { updateProfile, useProfile } from '../lib/settings'

/** Shrinks a photo to 320px so the on-device database stays small. */
async function resizeImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const size = 320
  const scale = Math.max(size / bmp.width, size / bmp.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bmp, (size - bmp.width * scale) / 2, (size - bmp.height * scale) / 2, bmp.width * scale, bmp.height * scale)
  return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.85))
}

function SummaryCard({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-[158px] flex-col items-center rounded-card bg-[linear-gradient(180deg,#000609,#00627a)] px-[8px] pt-[24px]">
      <div className="flex h-[50px] items-center justify-center">{icon}</div>
      <p className="mt-[10px] text-center text-caption font-extrabold leading-[1.2] tracking-[0.05em] text-white">{children}</p>
    </div>
  )
}

export default function Profile() {
  const profile = useProfile()
  const toast = useToast()
  const moods = useLiveQuery(() => db.moods.toArray(), [], [])
  const entries = useLiveQuery(() => db.entries.toArray(), [], [])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const avatarUrl = useMemo(() => (profile?.avatar ? URL.createObjectURL(profile.avatar) : null), [profile?.avatar])
  useEffect(() => () => void (avatarUrl && URL.revokeObjectURL(avatarUrl)), [avatarUrl])

  const streak = moodStreak(moods)
  const top = monthTopMood(moods)
  const jStreak = journalStreak(entries)
  const voiceCount = entries.filter((e) => e.kind === 'voice').length

  const saveName = async () => {
    const n = name.trim().slice(0, 24)
    if (n) await updateProfile({ name: n })
    setEditing(false)
  }

  const onPhoto = async (f: File | undefined) => {
    if (!f) return
    try {
      await updateProfile({ avatar: await resizeImage(f) })
      toast('Photo updated. It stays on this device only.')
    } catch {
      toast('Couldn’t use that photo. Try another one.')
    }
  }

  return (
    <Screen title="Profile" subtitle="Know your Journey.">
      <section className="-mx-[6px] mt-[22px] flex flex-col items-center rounded-card bg-[linear-gradient(180deg,#000609,#00627a)] pb-[30px]">
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change photo" className="relative mt-[3px] size-[116px] rounded-full bg-[linear-gradient(180deg,#00252e,#000609)] shadow-[0_5.5px_5.5px_rgba(0,0,0,0.5)]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-full rounded-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-mist/40">
              <User size={52} strokeWidth={1.2} />
            </span>
          )}
          <img src={cameraIcon} alt="" className="absolute bottom-[-4px] left-1/2 size-[25px] -translate-x-1/2 opacity-90 drop-shadow-[0_0_10px_black]" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />

        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            maxLength={24}
            aria-label="Display name"
            className="mt-[16px] w-[180px] border-b border-mist/50 bg-transparent pb-[6px] text-center text-caption font-semibold tracking-[0.05em] text-mist outline-none"
          />
        ) : (
          <p className="mt-[16px] text-caption font-semibold tracking-[0.05em] text-mist">{profile?.name ?? 'Anonymous'}</p>
        )}
        <span className="mt-[8px] h-px w-[280px] max-w-[80%] bg-mist/40" />
        <button
          type="button"
          onClick={() => (editing ? saveName() : (setName(profile?.name ?? ''), setEditing(true)))}
          className="btn-fill mt-[21px] h-[33px] w-[88px] rounded-[30px] text-caption font-extrabold tracking-[0.05em] text-mist"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
        <p className="mt-[12px] px-6 text-center text-micro text-mist/60">Your name and photo never leave this phone. Vents are always posted anonymously.</p>
      </section>

      <h2 className="title-gradient mt-[26px] font-display text-lead font-bold tracking-[0.05em]">Quick Summary</h2>
      <p className="mt-[6px] text-caption font-light tracking-[0.05em] text-fg">Quick facts about your journey till now.</p>
      <div className="-mx-[6px] mt-[22px] grid grid-cols-2 gap-[21px]">
        <SummaryCard icon={<img src={streakIcon} alt="" className="size-[50px]" />}>
          {streak > 0 ? `${streak}x streak of daily mood checked with consistency.` : 'Check in tonight to start your mood streak.'}
        </SummaryCard>
        <SummaryCard icon={top ? <MoodFace mood={top} size={44} /> : <MoodFace mood="okay" size={44} dim />}>
          {top ? `${MOOD_BY_ID[top].label} is your most logged mood this month.` : 'Your most logged mood this month will show here.'}
        </SummaryCard>
        <SummaryCard icon={<img src={journalIcon} alt="" className="size-[50px]" />}>
          {jStreak >= 2 ? `You have journaled every day for the last ${jStreak} days. Impressive.` : jStreak === 1 ? 'You journaled today. Little by little.' : 'Write a few lines today to start a journaling streak.'}
        </SummaryCard>
        <SummaryCard icon={<img src={voiceIcon} alt="" className="size-[50px]" />}>
          {voiceCount > 0 ? `You have recorded ${voiceCount} voice journal${voiceCount === 1 ? '' : 's'} till now.` : 'No voice journals yet. Sometimes it’s easier to just talk.'}
        </SummaryCard>
      </div>
    </Screen>
  )
}
