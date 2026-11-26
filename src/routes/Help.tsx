import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import contactIcon from '../assets/help/contact.png'
import privacyIcon from '../assets/help/privacy.png'
import faqIcon from '../assets/help/faq.png'
import bugIcon from '../assets/help/bug.png'
import overwhelmedIcon from '../assets/help/overwhelmed.png'
import textPrivacy from '../assets/help/text-privacy.png'
import textBug from '../assets/help/text-bug.png'
import textOverwhelmed from '../assets/help/text-overwhelmed.png'
import chevronDown from '../assets/icons/chevron-down.png'
import externalIcon from '../assets/icons/external.png'
import { Screen } from '../components/Screen'
import { CrisisSheet } from '../components/CrisisSheet'
import { HELPLINES } from '../lib/crisis'
import { SUPPORT_EMAIL, mailtoLink } from '../lib/contact'

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: 'How to use the app ?',
    a: 'Each evening after 7 PM, log one mood for your day. Any time, tap Start journaling to write it out or speak it out, or Start Venting to share something anonymously. Your logs and stats build up quietly over time.',
  },
  {
    q: 'Privacy & data security',
    a: 'Your journal, voice notes, mood logs, name and photo are stored only on your phone — never on our servers. Vents are posted with a random anonymous ID, are never linked to you, and are deleted after 24 hours. There are no ads and no trackers.',
  },
  {
    q: 'Exporting or deleting your journal.',
    a: 'Go to Settings → Export my data to download a ZIP of your entries and moods. Settings → Delete my Account erases everything on this phone and removes your vents from Vent Space.',
  },
  {
    q: 'Anonymous venting & profile safety.',
    a: 'Nobody can see who wrote a vent — not other users, not us. Don’t include your name or anyone else’s details. You can report hurtful vents or replies; anything reported by several people is hidden automatically.',
  },
]

function Card({ icon, children, dir = 'l' }: { icon: string; children: ReactNode; dir?: 'l' | 'r' }) {
  return (
    <section
      className="-mx-[18px] rounded-card px-[27px] pt-[17px] pb-[22px]"
      style={{ background: `linear-gradient(${dir === 'l' ? 270 : 90}deg, rgba(0,98,122,0.5), rgba(0,6,9,0))` }}
    >
      <img src={icon} alt="" className="size-[34px]" />
      {children}
    </section>
  )
}

/** Card titles in Figma are filled with a texture image; this keeps that exact fill. */
function TexturedTitle({ children, img, id }: { children: ReactNode; img: string; id?: string }) {
  return (
    <h2 id={id} className="mt-[10px] bg-cover bg-center bg-clip-text text-lead font-black tracking-[0.05em] text-transparent" style={{ backgroundImage: `url(${img})` }}>
      {children}
    </h2>
  )
}

export default function Help() {
  const [open, setOpen] = useState<number | null>(null)
  const [resources, setResources] = useState(false)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#faqs') document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <Screen title="Help & Support" subtitle="If you’re facing any issues, have suggestions, or simply need clarity — this space is for you">
      <div className="mt-[30px] flex flex-col gap-[16px]">
        <Card icon={contactIcon}>
          <h2 className="teal-text-gradient mt-[10px] text-lead font-black tracking-[0.05em]">Contact Support</h2>
          <a href={mailtoLink()} className="mt-[12px] inline-flex h-[30px] items-center rounded-card border border-teal px-[12px] text-caption font-light tracking-[0.05em] text-mist shadow-[0_0_4px_2px_#00627a]">
            {SUPPORT_EMAIL}
          </a>
          <p className="mt-[11px] text-caption font-light leading-snug tracking-[0.05em] text-mist">
            Tap redirect to email.
            <br />
            Expected response within 24–48 hrs
          </p>
        </Card>

        <Card icon={privacyIcon}>
          <TexturedTitle img={textPrivacy}>Privacy &amp; Data Use</TexturedTitle>
          <p className="mt-[8px] text-caption font-light leading-[2] tracking-[0.05em] text-mist">Understand how your data is:</p>
          <ul className="list-disc pl-[15px] text-caption font-light leading-[2] tracking-[0.05em] text-mist">
            <li>Stored securely — on your phone</li>
            <li>Kept anonymous</li>
            <li>Never shared with third parties</li>
          </ul>
          <Link to="/privacy" className="mt-[10px] inline-flex items-center gap-1.5 text-caption tracking-[0.05em] text-teal">
            Read full Privacy Policy <img src={externalIcon} alt="" className="size-[14px] -scale-y-100 rotate-180" />
          </Link>
        </Card>

        <Card icon={faqIcon} dir="r">
          <h2 id="faqs" className="mt-[10px] bg-[linear-gradient(270deg,#00b3e0,#00627a)] bg-clip-text text-lead font-black tracking-[0.05em] text-transparent [width:fit-content]">
            FAQs
          </h2>
          <p className="mt-[8px] text-caption font-light leading-[2] tracking-[0.05em] text-mist">Find quick answers to common questions around:</p>
          <ul>
            {FAQS.map((f, i) => (
              <li key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center justify-between py-[3px] text-left text-caption font-light leading-[1.8] tracking-[0.05em] text-mist"
                >
                  <span>• {f.q}</span>
                  <img src={chevronDown} alt="" className={clsx('size-[10px] transition-transform', open === i && 'rotate-180')} />
                </button>
                {open === i && <p className="pb-[8px] pl-[10px] text-caption font-light leading-snug text-mist/80">{f.a}</p>}
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={bugIcon} dir="r">
          <TexturedTitle img={textBug}>Report a Bug / Suggest a Feature</TexturedTitle>
          <p className="mt-[8px] text-caption font-light leading-[1.2] tracking-[0.05em] text-mist">Notice something off or have an idea to make UNSAID better?</p>
          <p className="mt-[12px] text-caption font-light leading-[1.2] tracking-[0.05em] text-mist">Let us know — no detail is too small.</p>
          <Link to="/contact?topic=Report%20a%20bug" className="mt-[12px] inline-block text-caption font-bold tracking-[0.05em] text-teal">
            Send a report →
          </Link>
        </Card>

        <Card icon={overwhelmedIcon} dir="r">
          <TexturedTitle img={textOverwhelmed}>Feeling Mentally Overwhelmed?</TexturedTitle>
          <p className="mt-[8px] text-caption font-light leading-[1.2] tracking-[0.05em] text-mist">
            We’re not a crisis app, but we care.
            <br />
            You are not alone — help is just a tap away.
          </p>
          <button type="button" onClick={() => setResources(true)} className="mt-[20px] text-caption font-bold tracking-[0.05em] text-mist">
            View Support Resources
          </button>
          <div className="mt-[4px] text-caption font-semibold leading-[2] tracking-[0.05em] text-mist">
            {HELPLINES.slice(0, 3).map((h) => (
              <p key={h.name}>
                {h.name} –{' '}
                {h.numbers.map((n, i) => (
                  <span key={n.tel}>
                    {i > 0 && ' or '}
                    <a href={`tel:${n.tel}`} className="text-teal">
                      {n.label}
                    </a>
                  </span>
                ))}
              </p>
            ))}
          </div>
        </Card>
      </div>
      <CrisisSheet open={resources} onClose={() => setResources(false)} />
    </Screen>
  )
}
