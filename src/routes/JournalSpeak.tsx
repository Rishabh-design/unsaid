import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pause, Play, RotateCw } from 'lucide-react'
import clsx from 'clsx'
import wave from '../assets/voice/wave.png'
import recordInner from '../assets/voice/record-inner.svg'
import recordRing from '../assets/voice/record-ring.svg'
import voiceGlow from '../assets/voice/glow.svg'
import chevronDown from '../assets/icons/chevron-down.png'
import chevronRing from '../assets/icons/chevron-ring.svg'
import { Screen } from '../components/Screen'
import { Pill } from '../components/ui'
import { CrisisSheet } from '../components/CrisisSheet'
import { useToast } from '../components/Toast'
import { formatClock, useRecorder } from '../hooks/useRecorder'
import { db } from '../lib/db'
import { nextPrompt } from '../lib/prompts'
import { mentionsCrisis } from '../lib/crisis'

export default function JournalSpeak() {
  const navigate = useNavigate()
  const toast = useToast()
  const r = useRecorder()
  const [prompt, setPrompt] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [crisis, setCrisis] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const url = useRef<string | null>(null)

  useEffect(() => {
    if (r.error) toast(r.error)
  }, [r.error, toast])

  useEffect(() => {
    if (!r.blob) return
    url.current = URL.createObjectURL(r.blob)
    const a = new Audio(url.current)
    a.onended = () => setPlaying(false)
    audio.current = a
    return () => {
      a.pause()
      if (url.current) URL.revokeObjectURL(url.current)
    }
  }, [r.blob])

  const togglePlay = () => {
    const a = audio.current
    if (!a) return
    if (playing) a.pause()
    else a.play()
    setPlaying(!playing)
  }

  const onMain = () => {
    if (r.state === 'idle') r.start()
    else if (r.state === 'recording') r.stop()
    else togglePlay()
  }

  const save = async () => {
    if (!r.blob) return
    const now = Date.now()
    await db.entries.add({
      kind: 'voice',
      title: prompt ?? 'Voice note',
      body: r.transcript,
      prompt: prompt ?? undefined,
      audio: r.blob,
      audioType: r.blob.type,
      durationMs: r.elapsed,
      createdAt: now,
      updatedAt: now,
    })
    toast('Voice journal saved on this device.')
    if (mentionsCrisis(r.transcript)) setCrisis(true)
    else navigate('/logs?tab=voice', { replace: true })
  }

  const vent = () => {
    if (!r.transcript) toast('This browser couldn’t turn your voice into text. You can type your vent instead.')
    navigate('/vent', { state: { text: r.transcript } })
  }

  const discard = () => {
    audio.current?.pause()
    setPlaying(false)
    r.reset()
  }

  const live = r.state === 'recording'
  const waveScale = live ? 0.35 + r.level * 1.4 : r.state === 'review' ? 0.6 : 0.25

  return (
    <Screen title="Speak Your Mind." titleClassName="font-semibold" menu={false} className="!pb-0">
      <div>
        <p className="mt-[14px] max-w-[307px] text-body font-light leading-snug tracking-[0.05em] text-fg">
          Too lazy to write ? Don’t worry we got you, No pressure just talk like you’re talking to yourself.
        </p>
        <button type="button" onClick={() => setPrompt((p) => (p ? null : nextPrompt()))} className="mt-[30px] flex items-center gap-[8px] text-body tracking-[0.05em]">
          <span className="font-light text-fg">Not sure what to speak ?</span>
          <span className="font-bold text-teal">Try Prompts.</span>
          <span className={clsx('relative size-[18px] transition-transform', prompt && 'rotate-180')}>
            <img src={chevronRing} alt="" className="absolute inset-0 size-full" />
            <img src={chevronDown} alt="" className="absolute left-[4px] top-[4px] size-[10px]" />
          </span>
        </button>
        {prompt && (
          <div className="mt-[22px] flex animate-fade-up items-center gap-[14px]">
            <p className="text-body font-bold tracking-[0.03em] text-fg">{prompt}</p>
            <button type="button" aria-label="Another prompt" onClick={() => setPrompt(nextPrompt(prompt))} className="text-teal">
              <RotateCw size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="relative -mx-[var(--gutter)] mt-auto flex flex-col items-center pt-[40px]">
        <p className="bg-[linear-gradient(90deg,#dbdbdb,rgba(219,219,219,0))] bg-clip-text font-display text-[2.19rem] font-bold tracking-[0.05em] text-transparent" aria-live="off">
          {formatClock(r.elapsed)}
        </p>
        <div className="relative -mt-[16px] h-[189px] w-full overflow-hidden">
          <img
            src={wave}
            alt=""
            className="absolute inset-0 size-full object-cover object-bottom opacity-60 transition-transform duration-100"
            style={{ transform: `scaleY(${waveScale})` }}
          />
        </div>
        <div className="h-[44px] w-full overflow-hidden px-[var(--gutter)] text-center text-caption font-light leading-snug text-mist/70">
          {live && !r.speechSupported && 'Recording… (voice-to-text isn’t available on this browser)'}
          {(live || r.state === 'review') && r.speechSupported && (
            <span className="line-clamp-2">
              {r.transcript} <span className="text-mist/40">{r.interim}</span>
            </span>
          )}
          {r.state === 'idle' && 'Tap the button and start talking. Up to 10 minutes.'}
        </div>

        <div className="relative mt-[8px] h-[calc(257px+env(safe-area-inset-bottom))] w-full overflow-hidden rounded-t-[50px] bg-[rgba(219,219,219,0.01)]">
          <img src={voiceGlow} alt="" className="pointer-events-none absolute left-[7px] top-[1px] size-[100px] blur-[60px]" />
          <img src={voiceGlow} alt="" className="pointer-events-none absolute right-[16px] top-[157px] size-[100px] blur-[60px]" />
          <div className="absolute inset-0 backdrop-blur-[40px]" style={{ background: 'linear-gradient(180deg, rgba(0,26,32,0.6), rgba(0,98,122,0.25))' }} />

          <div className={clsx('relative mt-[19px] flex justify-center gap-[18px] transition-opacity', r.state === 'review' ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <Pill className="w-[100px]" onClick={vent}>
              Vent
            </Pill>
            <Pill active className="w-[100px]" onClick={save}>
              Save
            </Pill>
            <Pill className="w-[100px]" onClick={discard}>
              Delete
            </Pill>
          </div>

          <button
            type="button"
            onClick={onMain}
            aria-label={r.state === 'idle' ? 'Start recording' : live ? 'Stop recording' : playing ? 'Pause' : 'Play recording'}
            className="absolute left-1/2 top-[115px] size-[65px] -translate-x-1/2"
          >
            <img src={recordRing} alt="" className="absolute inset-0 size-full" />
            {r.state === 'review' ? (
              <span className="absolute inset-[7.6px] flex items-center justify-center rounded-full bg-teal text-white">
                {playing ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-[3px]" />}
              </span>
            ) : live ? (
              <span className="absolute inset-[15px] rounded-[8px] bg-teal" />
            ) : (
              <img src={recordInner} alt="" className="absolute inset-[7.6px] size-[49.76px]" />
            )}
          </button>
        </div>
      </div>

      <CrisisSheet
        open={crisis}
        onClose={() => navigate('/logs?tab=voice', { replace: true })}
        onContinue={() => navigate('/logs?tab=voice', { replace: true })}
        continueLabel="Go to my journal"
      />
    </Screen>
  )
}
