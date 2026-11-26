import { Screen } from '../components/Screen'

export default function Mission() {
  return (
    <Screen title="Our Mission" subtitle="To give men a safe space to feel, express, and heal — without saying a word.">
      <div className="mt-[34px] space-y-[28px]">
        <section>
          <h2 className="teal-text-gradient text-lead font-black tracking-[0.05em]">Unsaid exists for one reason:</h2>
          <p className="mt-[10px] text-caption font-light leading-[1.4] tracking-[0.05em] text-mist">
            Because men’s emotions matter. For too long, emotional vulnerability in men has been labeled weak. But silence has a cost — mentally,
            emotionally, and even fatally. We want to change that.
          </p>
        </section>
        <section>
          <h2 className="teal-text-gradient text-lead font-black tracking-[0.05em]">What We’re Trying to Do:</h2>
          <ul className="mt-[10px] list-disc space-y-[6px] pl-[16px] text-caption font-light leading-[1.4] tracking-[0.05em] text-mist">
            <li>Normalize silent self-expression for men</li>
            <li>Offer a space free from judgment, shame, or pressure</li>
            <li>Encourage reflection, not perfection</li>
            <li>Focus on mental health, identity, and internal well-being</li>
            <li>Build tools that feel intuitive and emotionally intelligent — no noise, no fluff</li>
          </ul>
        </section>
        <section>
          <h2 className="teal-text-gradient text-lead font-black tracking-[0.05em]">The Bigger Picture</h2>
          <p className="mt-[10px] text-caption font-light leading-[1.4] tracking-[0.05em] text-mist">This isn’t just an app.</p>
          <p className="mt-[8px] text-caption font-light leading-[1.4] tracking-[0.05em] text-mist">
            It’s a contribution to a larger conversation that’s been missing — about how men truly feel, and how often they feel alone in it. If we can help
            someone take the first step toward understanding themselves better, we’ve fulfilled our mission.
          </p>
        </section>
      </div>
      <p className="mt-[44px] text-center text-body font-semibold italic leading-snug tracking-[0.05em] text-teal">
        Because what stays unsaid still matters. Let’s listen to the silence — and heal from it.
      </p>
    </Screen>
  )
}
