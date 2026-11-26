import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderState = 'idle' | 'recording' | 'review'

const MAX_MS = 10 * 60_000

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported(t))
}

/**
 * Records audio with MediaRecorder, reports a live input level for the waveform,
 * and transcribes speech to text where the browser supports it.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  const rec = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const startedAt = useRef(0)
  const raf = useRef(0)
  const ctx = useRef<AudioContext | null>(null)
  const speech = useRef<SpeechRecognitionLike | null>(null)
  const listening = useRef(false)
  const mime = useRef<string | undefined>(undefined)

  const speechSupported = !!getSpeechRecognition()

  const cleanup = useCallback(() => {
    cancelAnimationFrame(raf.current)
    listening.current = false
    speech.current?.stop()
    speech.current = null
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    ctx.current?.close().catch(() => {})
    ctx.current = null
    setLevel(0)
  }, [])

  useEffect(() => cleanup, [cleanup])

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording isn’t supported on this browser.')
      return
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      stream.current = s
      mime.current = pickMime()
      const r = new MediaRecorder(s, mime.current ? { mimeType: mime.current } : undefined)
      chunks.current = []
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      r.onstop = () => {
        setBlob(new Blob(chunks.current, { type: mime.current ?? r.mimeType ?? 'audio/webm' }))
        setElapsed(Date.now() - startedAt.current)
        setState('review')
        cleanup()
      }
      rec.current = r
      r.start(1000)
      startedAt.current = Date.now()
      setTranscript('')
      setInterim('')
      setBlob(null)
      setState('recording')

      // Live level for the waveform
      const ac = new AudioContext()
      ctx.current = ac
      const src = ac.createMediaStreamSource(s)
      const an = ac.createAnalyser()
      an.fftSize = 512
      src.connect(an)
      const data = new Uint8Array(an.fftSize)
      const tick = () => {
        an.getByteTimeDomainData(data)
        let sum = 0
        for (const v of data) sum += ((v - 128) / 128) ** 2
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4))
        const ms = Date.now() - startedAt.current
        setElapsed(ms)
        if (ms >= MAX_MS) stop()
        raf.current = requestAnimationFrame(tick)
      }
      tick()

      // Voice-to-text where available. Chrome ends recognition after silence, so restart it.
      const SR = getSpeechRecognition()
      if (SR) {
        const sr = new SR()
        sr.continuous = true
        sr.interimResults = true
        sr.lang = navigator.language || 'en-IN'
        sr.onresult = (e) => {
          let finalText = ''
          let interimText = ''
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i]
            if (res.isFinal) finalText += res[0].transcript
            else interimText += res[0].transcript
          }
          if (finalText) setTranscript((t) => (t ? `${t} ${finalText.trim()}` : finalText.trim()))
          setInterim(interimText)
        }
        sr.onend = () => {
          if (listening.current) {
            try {
              sr.start()
            } catch {
              /* already started */
            }
          }
        }
        sr.onerror = () => {}
        speech.current = sr
        listening.current = true
        try {
          sr.start()
        } catch {
          /* ignore */
        }
      }
    } catch {
      cleanup()
      setError('UNSAID needs microphone access to record. You can allow it in your browser settings.')
    }
  }, [cleanup, stop])

  const reset = useCallback(() => {
    cleanup()
    setBlob(null)
    setElapsed(0)
    setTranscript('')
    setInterim('')
    setState('idle')
  }, [cleanup])

  return { state, elapsed, level, blob, transcript, interim, error, speechSupported, start, stop, reset }
}

export function formatClock(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
