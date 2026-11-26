import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { FillButton, GhostButton } from '../components/ui'
import { CrisisSheet } from '../components/CrisisSheet'
import { useToast } from '../components/Toast'
import { mentionsCrisis } from '../lib/crisis'
import { VENT_MAX, VentError, vents } from '../lib/vents'

const DRAFT_KEY = 'unsaid-draft-vent'

export default function Vent() {
  const navigate = useNavigate()
  const toast = useToast()
  const location = useLocation()
  const fromVoice = (location.state as { text?: string } | null)?.text
  const [text, setText] = useState(() => fromVoice ?? localStorage.getItem(DRAFT_KEY) ?? '')
  const [busy, setBusy] = useState(false)
  const [crisis, setCrisis] = useState(false)

  const update = (v: string) => {
    setText(v)
    localStorage.setItem(DRAFT_KEY, v)
  }

  const post = async () => {
    setCrisis(false)
    setBusy(true)
    try {
      await vents.post(text)
      localStorage.removeItem(DRAFT_KEY)
      toast('Your vent is out there now. It fades in 24 hours.')
      navigate('/vent-space?tab=mine', { replace: true })
    } catch (e) {
      toast(e instanceof VentError ? e.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const submit = () => {
    if (!text.trim()) return
    if (mentionsCrisis(text)) setCrisis(true)
    else post()
  }

  return (
    <Screen title={<>Vent it out. Be heard. Then let it fade.</>} titleClassName="leading-[1.25]">
      <p className="mt-[6px] max-w-[330px] text-body font-light leading-snug tracking-[0.05em] text-fg">
        A space that asks for nothing — only to hold what you’re ready to let go. Your words stay for 24 hours, then quietly disappear.
      </p>
      <p className="mt-[20px] text-body font-light tracking-[0.05em] text-fg">
        Explore what others left unsaid{' '}
        <Link to="/vent-space" className="ml-1 font-bold text-teal">
          Vent Space
        </Link>
      </p>

      <div
        className="-mx-[12px] mt-[16px] flex min-h-[420px] flex-1 flex-col rounded-card border border-teal/70 px-[28px] pt-[26px] pb-[16px]"
        style={{ background: 'radial-gradient(80% 70% at 45% 35%, rgba(0,98,122,0.5), rgba(0,6,9,0) 75%), var(--c-ink)' }}
      >
        <textarea
          value={text}
          onChange={(e) => update(e.target.value.slice(0, VENT_MAX))}
          placeholder="Type anything you want. No one will ever see it."
          aria-label="Your vent"
          className="flex-1 resize-none bg-transparent text-body font-light leading-relaxed tracking-[0.03em] text-mist outline-none placeholder:text-center placeholder:text-mist/60"
        />
        <div className="flex justify-between text-micro text-mist/45">
          <span>Anonymous. No name, no profile.</span>
          <span>
            {text.length}/{VENT_MAX}
          </span>
        </div>
      </div>

      <div className="-mx-[12px] mt-[24px] grid grid-cols-[1.6fr_1fr] gap-[14px]">
        <FillButton onClick={submit} disabled={!text.trim() || busy}>
          {busy ? 'Sending…' : 'Vent Now'}
        </FillButton>
        <GhostButton onClick={() => update('')} disabled={!text}>
          Clear All
        </GhostButton>
      </div>
      {!vents.live && (
        <p className="mt-4 text-center text-micro leading-snug text-mist/45">
          Preview mode: Vent Space isn’t connected to the server yet, so vents stay on this device.
        </p>
      )}

      <CrisisSheet open={crisis} onClose={() => setCrisis(false)} onContinue={post} continueLabel="Post my vent" />
    </Screen>
  )
}
