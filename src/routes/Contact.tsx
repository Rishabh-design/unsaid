import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import radio from '../assets/icons/radio.svg'
import radioOn from '../assets/icons/radio-on.svg'
import instagram from '../assets/icons/instagram.png'
import linkedin from '../assets/icons/linkedin.png'
import xIcon from '../assets/icons/x.png'
import { Screen } from '../components/Screen'
import { useToast } from '../components/Toast'
import { SUPPORT_EMAIL, mailtoLink, sendContactMessage, type ContactTopic } from '../lib/contact'
import { SOCIAL } from '../lib/links'

const TOPICS: ContactTopic[] = ['Feedback', 'Report a bug', 'Need help', 'Request feature', 'Other']
const label = 'text-[0.69rem] font-semibold italic tracking-[0.05em] text-fg'
const field = 'mt-[6px] h-[29px] w-full rounded-card border-[0.5px] border-mist bg-transparent px-[14px] text-caption text-mist outline-none focus:border-teal'

export default function Contact() {
  const toast = useToast()
  const [params] = useSearchParams()
  const initialTopic = (TOPICS as string[]).includes(params.get('topic') ?? '') ? (params.get('topic') as ContactTopic) : 'Need help'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<ContactTopic>(initialTopic)
  const [other, setOther] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const valid = /^\S+@\S+\.\S+$/.test(email) && message.trim().length > 0

  const send = async () => {
    if (!valid) return toast('Add your e-mail and a message so we can reply.')
    setSending(true)
    const msg = { name, email, topic: topic === 'Other' && other ? `Other: ${other}` : topic, message }
    try {
      if (await sendContactMessage(msg)) {
        toast('Message sent. We’ll get back to you within 24–48 hrs.')
        setMessage('')
      } else {
        window.location.href = mailtoLink(msg)
      }
    } catch {
      window.location.href = mailtoLink(msg)
    } finally {
      setSending(false)
    }
  }

  const socials = [
    { href: SOCIAL.instagram, icon: instagram, label: 'Instagram' },
    { href: SOCIAL.linkedin, icon: linkedin, label: 'LinkedIn' },
    { href: SOCIAL.x, icon: xIcon, label: 'X' },
  ].filter((s) => s.href)

  return (
    <Screen title="Contact Us !" subtitle="Have questions, feedback, or need help? Reach out and we’ll respond as soon as we can.">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="-mx-[6px] mt-[10px] rounded-[30px] px-[24px] pt-[40px] pb-[20px]"
        style={{ background: 'linear-gradient(180deg, rgba(0,6,9,0.2), rgba(0,98,122,0.6) 49%, rgba(0,6,9,0))' }}
      >
        <h2 className="text-[0.81rem] font-black tracking-[0.05em] text-teal">Contact from</h2>
        <label className="mt-[20px] block">
          <span className={label}>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="mt-[18px] block">
          <span className={label}>E-Mail address*</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email" className={field} />
        </label>
        <fieldset className="mt-[18px]">
          <legend className={label}>Choose Topic :-</legend>
          <div className="mt-[6px] rounded-card border-[0.5px] border-mist px-[17px] py-[14px]">
            {TOPICS.map((t) => (
              <label key={t} className="flex h-[20px] cursor-pointer items-center gap-[4px] text-[0.56rem] tracking-[0.05em] text-fg">
                <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />
                <img src={topic === t ? radioOn : radio} alt="" className="size-[15px]" />
                {t}
                {t === 'Other' && (
                  <input
                    value={other}
                    onChange={(e) => {
                      setOther(e.target.value)
                      setTopic('Other')
                    }}
                    maxLength={40}
                    aria-label="Other topic"
                    className="ml-[8px] w-[115px] border-b-[0.5px] border-mist bg-transparent text-[0.56rem] text-mist outline-none"
                  />
                )}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-[20px] block">
          <span className={label}>Your message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
            placeholder="Write freely. We're listening"
            className="mt-[6px] h-[137px] w-full resize-none rounded-card border-[0.5px] border-mist bg-transparent px-[16px] py-[12px] text-caption text-mist outline-none placeholder:text-[0.56rem] placeholder:text-white/50 focus:border-teal"
          />
        </label>
        <button
          type="submit"
          disabled={sending}
          className="mx-auto mt-[14px] flex h-[30px] w-[100px] items-center justify-center rounded-card border border-teal text-[0.69rem] text-white shadow-[0_0_4px_2px_#00627a] disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>

      <section className="-mx-[6px] mt-[10px] rounded-card bg-[linear-gradient(180deg,#00627a,rgba(0,6,9,0))] px-[28px] pt-[40px] pb-[36px]">
        <h2 className="text-[0.81rem] font-black tracking-[0.05em] text-teal-mid">Alternative Support</h2>
        <p className="mt-[24px] text-[0.69rem] font-semibold italic tracking-[0.05em] text-mist">
          Email directly us at :{' '}
          <a href={mailtoLink()} className="text-teal">
            {SUPPORT_EMAIL}
          </a>
        </p>
        {socials.length > 0 && (
          <div className="mt-[14px] flex items-center gap-[8px]">
            <span className="text-[0.69rem] font-semibold italic tracking-[0.05em] text-mist">Follow Us :</span>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                <img src={s.icon} alt="" className="size-[20px]" />
              </a>
            ))}
          </div>
        )}
      </section>

      <p className="mt-[36px] text-body font-semibold italic leading-snug tracking-[0.05em] text-teal">
        We respect your privacy. Everything you share with us stays safe and is only used to improve your experience.
      </p>
    </Screen>
  )
}
