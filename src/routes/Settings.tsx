import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { Screen } from '../components/Screen'
import { Toggle } from '../components/ui'
import { ExportModal } from '../components/ExportModal'
import { ConfirmDialog } from './EntryView'
import { useToast } from '../components/Toast'
import { setPasscode, updateSettings, useSettings, type FontSize } from '../lib/settings'
import { wipeLocalData } from '../lib/db'
import { vents } from '../lib/vents'
import { supabase } from '../lib/supabase'

const VERSION = '1.0.0'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-[17px] py-[16px]">
      <h2 className="text-lead font-bold tracking-[0.03em] text-teal">{title}</h2>
      <div className="mt-[10px] flex flex-col gap-[10px] pl-[3px]">{children}</div>
    </section>
  )
}

function Row({ label, right, onClick, to }: { label: ReactNode; right?: ReactNode; onClick?: () => void; to?: string }) {
  const cls = 'flex min-h-[20px] w-full items-center justify-between text-left text-[0.69rem] font-medium tracking-[0.03em] text-mist'
  if (to) return <Link to={to} className={cls}>{label}{right}</Link>
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{label}{right}</button>
  return <div className={cls}>{label}{right}</div>
}

const Divider = () => <span className="mx-[14px] block h-px bg-[linear-gradient(90deg,transparent,rgba(219,219,219,0.5),transparent)]" />

function PinSetup({ onDone }: { onDone: () => void }) {
  const toast = useToast()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const save = async () => {
    if (!/^\d{4}$/.test(pin)) return toast('Use exactly 4 digits.')
    if (pin !== confirm) return toast('The two passcodes don’t match.')
    await setPasscode(pin)
    toast('Passcode lock is on.')
    onDone()
  }
  return (
    <div className="mt-[4px] flex flex-col gap-[8px] rounded-[14px] border border-teal/40 p-[12px]">
      {[
        ['New 4-digit passcode', pin, setPin],
        ['Repeat passcode', confirm, setConfirm],
      ].map(([label, value, set]) => (
        <input
          key={label as string}
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={value as string}
          onChange={(e) => (set as (v: string) => void)(e.target.value.replace(/\D/g, ''))}
          placeholder={label as string}
          className="h-[32px] rounded-pill border border-mist/40 bg-transparent px-[14px] text-caption tracking-[0.3em] text-mist outline-none placeholder:tracking-normal placeholder:text-mist/40"
        />
      ))}
      <button type="button" onClick={save} className="h-[30px] rounded-pill bg-teal text-caption font-semibold text-white">
        Turn on passcode lock
      </button>
      <p className="text-micro leading-snug text-mist/50">If you forget it, the only way back in is to reinstall, which erases your journal. Export a backup first.</p>
    </div>
  )
}

export default function Settings() {
  const s = useSettings()
  const navigate = useNavigate()
  const toast = useToast()
  const [open, setOpen] = useState<'passcode' | 'font' | null>(null)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!s) return <Screen>{null}</Screen>

  const setReminder = async (key: 'journalReminder' | 'moodReminder', value: boolean) => {
    await updateSettings({ [key]: value })
    if (value && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission().catch(() => {})
    }
  }

  const deleteEverything = async () => {
    try {
      if (vents.live) await vents.removeAllMine()
      await supabase?.auth.signOut()
    } catch {
      /* local wipe still happens */
    }
    await wipeLocalData()
    window.location.replace('/splash')
  }

  const chevron = (isOpen: boolean) => <ChevronDown size={14} className={clsx('text-mist transition-transform', isOpen && 'rotate-180')} />

  return (
    <Screen title="Settings" subtitle="Tailor your space, your way.">
      <div
        className="-mx-[6px] mt-[52px] rounded-card"
        style={{ background: 'linear-gradient(180deg, rgba(0,6,9,0.2), rgba(0,98,122,0.45) 55%, rgba(0,6,9,0))' }}
      >
        <Section title="Privacy & Data">
          <Row label="Passcode Lock" right={s.passcodeHash ? <span className="text-micro text-teal-bright">On</span> : chevron(open === 'passcode')} onClick={() => setOpen(open === 'passcode' ? null : 'passcode')} />
          {open === 'passcode' &&
            (s.passcodeHash ? (
              <button
                type="button"
                onClick={async () => {
                  await setPasscode(null)
                  toast('Passcode lock is off.')
                  setOpen(null)
                }}
                className="self-start rounded-pill border border-mist/40 px-4 py-1.5 text-caption text-mist"
              >
                Turn off passcode lock
              </button>
            ) : (
              <PinSetup onDone={() => setOpen(null)} />
            ))}
          <Row label="Export my data" right={chevron(false)} onClick={() => setExporting(true)} />
          <Row label="Delete my Account" right={chevron(false)} onClick={() => setDeleting(true)} />
        </Section>
        <Divider />
        <Section title="Notifications">
          <Row label="Daily Journal Reminder" right={<Toggle label="Daily journal reminder" checked={s.journalReminder} onChange={(v) => setReminder('journalReminder', v)} />} />
          <Row label="Mood Check-ins" right={<Toggle label="Mood check-in reminder" checked={s.moodReminder} onChange={(v) => setReminder('moodReminder', v)} />} />
        </Section>
        <Divider />
        <Section title="App appearance">
          <Row label="Dark / Light mode" right={<Toggle label="Dark mode" checked={s.theme === 'dark'} onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })} />} />
          <Row
            label={
              <span>
                Font size ( <span className="text-teal-bright">{s.fontSize}</span> )
              </span>
            }
            right={chevron(open === 'font')}
            onClick={() => setOpen(open === 'font' ? null : 'font')}
          />
          {open === 'font' && (
            <div className="flex h-[40px] items-center rounded-pill border border-teal p-[4px]">
              {(['small', 'medium', 'large'] as FontSize[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => updateSettings({ fontSize: f })}
                  className={clsx('h-full flex-1 rounded-pill text-caption font-semibold capitalize transition', s.fontSize === f ? 'bg-teal text-white' : 'text-mist')}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </Section>
        <Divider />
        <Section title="Help & Support">
          <Row label="Visit Help Center" to="/help" />
          <Row label="FAQs" to="/help#faqs" />
          <Row label="Contact Us" to="/contact" />
          <Row label="Privacy Policy" to="/privacy" />
        </Section>
        <Divider />
        <Section title="About Unsaid">
          <Row label="Our Story and Mission" to="/mission" />
          <Row label="Version info." right={<span className="text-micro text-mist/60">v{VERSION}</span>} />
          <Row label="Replay the welcome screens" onClick={async () => { await updateSettings({ onboarded: false }); navigate('/splash') }} />
        </Section>
      </div>

      <ExportModal open={exporting} onClose={() => setExporting(false)} />
      <ConfirmDialog
        open={deleting}
        onCancel={() => setDeleting(false)}
        onConfirm={deleteEverything}
        message="This erases your journal, voice notes and mood logs from this phone, and removes your vents from Vent Space. It can’t be undone."
      />
    </Screen>
  )
}
