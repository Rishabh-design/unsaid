import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Screen } from '../components/Screen'

function StoryCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="relative mt-[40px]">
      <span className="absolute -left-[var(--gutter)] -right-[var(--gutter)] top-[30px] h-px bg-mist/30" aria-hidden />
      <div className="relative mx-[-8px] rounded-[30px] border border-mist/10 bg-[linear-gradient(180deg,#000609,#00627a)] px-[22px] pb-[26px]">
        <h2 className="mx-auto -translate-y-[1px] bg-ink px-3 pt-[20px] text-center text-lead font-bold tracking-[0.03em] text-teal-mid [width:fit-content] [background:linear-gradient(180deg,var(--c-ink),var(--c-ink)_60%,transparent)]">
          {title}
        </h2>
        <p className="mt-[14px] text-center text-caption font-medium italic tracking-[0.05em] text-white">{subtitle}</p>
        <div className="mt-[16px] space-y-[12px] text-center text-caption font-light leading-[1.35] tracking-[0.05em] text-white">{children}</div>
      </div>
    </section>
  )
}

export default function About() {
  return (
    <Screen title="About Unsaid." subtitle="Some things are meant to be felt. Not shouted.">
      <p className="mt-[28px] text-caption font-medium italic leading-snug tracking-[0.05em] text-teal-mid">
        Every minute, a man loses his life to silence. Let’s make space for what’s unsaid.
      </p>

      <StoryCard title="Our Story" subtitle="Born from Silence">
        <p>
          Unsaid was born from the silence — the kind men often carry. Silence about pain, struggles, confusion, and the weight they rarely talk about. Most
          platforms for journaling and mental health weren’t made for men. The tone, visuals, and features often cater to women — which left a gap no one
          filled.
        </p>
        <p>Unsaid fills that gap. A quiet space where men can check in with themselves. No noise. No judgment. Just you, your emotions, and honesty.</p>
      </StoryCard>

      <StoryCard title="The Problem No One Talks About" subtitle="What Happens When Men Stay Silent?">
        <p>77% of suicide victims are men.</p>
        <p>40% of men have never spoken about mental health.</p>
        <p>Emotional expression is often labeled “weakness.”</p>
        <p>Most don’t seek help until it’s too late.</p>
      </StoryCard>

      <p className="mt-[44px] text-center font-display text-[1rem] font-black leading-snug tracking-[0.03em] text-white">Being strong doesn’t mean staying silent.</p>

      <StoryCard title="Why Unsaid is Different" subtitle="More Than Just a Journaling App !">
        <p>Man-Centric Design – Built with men’s mental health in mind</p>
        <p>Anonymous Venting – Let it out, no names needed</p>
        <p>Mood Logs &amp; Visuals – See your journey, without words</p>
        <p>Private &amp; Secure – No judgments, no leaks</p>
        <p>Silent Prompts – Emotionally intelligent guidance that doesn’t pressure</p>
      </StoryCard>

      <StoryCard title="Why It Matters" subtitle="It’s not unsaid matters, it’s because man matters">
        <p>Because ignoring men’s emotions doesn’t make them disappear.</p>
        <p>
          Because saying “I’m fine” isn’t always the truth. Because being strong doesn’t mean staying silent. Unsaid gives voice to what’s often left behind.
          It’s more than a wellness app — it’s a movement toward awareness, healing, and owning your emotions.
        </p>
      </StoryCard>

      <div className="mx-[-8px] mt-[40px] rounded-[30px] border border-mist/10 bg-[linear-gradient(180deg,#000609,#00627a)] px-[40px] py-[22px] text-center">
        <p className="text-caption font-bold text-white">#</p>
        <p className="mt-[6px] text-caption font-medium italic leading-snug tracking-[0.05em] text-white">
          If this app helps even one man open up to himself — <span className="text-teal-bright">it’s already worth it.</span> This isn’t about being perfect.
          It’s about being real.
        </p>
      </div>

      <p className="mt-[40px] text-center text-[0.85rem] font-bold leading-snug tracking-[0.03em] text-white">
        Everything you never said still matters. Start where you are
      </p>
      <Link
        to="/journal/write"
        className="mx-auto mt-[20px] flex h-[30px] w-[130px] items-center justify-center rounded-card border border-teal text-caption text-white shadow-[0_0_4px_2px_#00627a]"
      >
        Start Journaling
      </Link>
      <Link to="/mission" className="mx-auto mt-[20px] flex items-center gap-1.5 text-caption tracking-[0.05em] text-teal">
        Learn more about the Mission <ArrowUpRight size={14} className="rounded-full border border-teal" />
      </Link>
    </Screen>
  )
}
