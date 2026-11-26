import type { ReactNode } from 'react'
import { Screen } from '../components/Screen'
import { SUPPORT_EMAIL } from '../lib/contact'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[26px]">
      <h2 className="teal-text-gradient text-lead font-black tracking-[0.05em]">{title}</h2>
      <div className="mt-[8px] space-y-[8px] text-caption font-light leading-[1.45] tracking-[0.03em] text-mist">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <Screen title="Privacy Policy" subtitle="Plain words, no fine print. Last updated 26 November 2026.">
      <Block title="The short version">
        <p>Your journal, voice notes and mood logs never leave your phone. We can’t read them, and neither can anyone else.</p>
        <p>Vents are anonymous and disappear after 24 hours. No ads. No trackers. No selling data. Ever.</p>
      </Block>
      <Block title="What stays on your phone">
        <p>
          Written entries, voice recordings and their transcripts, mood check-ins, your display name, profile photo, passcode and settings are stored in your
          browser’s private storage on this device. Clearing the app’s data, uninstalling it or using Delete my Account removes them. Use Export my data to keep
          a copy.
        </p>
        <p>Voice-to-text uses your browser’s built-in speech recognition. On some browsers (for example Chrome) the audio is processed by the browser maker to produce the text.</p>
      </Block>
      <Block title="What goes to our server">
        <p>
          To make Vent Space work, your device gets a random anonymous ID — no email, phone number or name. With it we store: the vents you post, your replies,
          the hugs you send and any reports you make.
        </p>
        <p>Vents are hidden after 24 hours and permanently deleted within the following hour, along with their replies and hugs.</p>
        <p>Other people can never see who wrote a vent. Our server never sends anyone’s ID to other users.</p>
        <p>If you use the Contact form, we store your name, e-mail and message only to reply to you.</p>
      </Block>
      <Block title="Safety">
        <p>
          Vents or replies reported by several people are hidden automatically. If someone writes about wanting to hurt themselves, the app shows helpline
          numbers. UNSAID is not a crisis or medical service. If you are in danger, call 112.
        </p>
      </Block>
      <Block title="Your choices">
        <p>You can delete any vent you posted, export your data, or delete everything (on your phone and on our server) from Settings → Delete my Account.</p>
      </Block>
      <Block title="Contact">
        <p>
          Questions about privacy? Write to{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-teal">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Block>
    </Screen>
  )
}
