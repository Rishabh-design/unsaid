import type { ReactNode } from 'react'
import portrait from '../assets/creator/portrait.png'
import signature from '../assets/creator/signature.png'
import { Screen } from '../components/Screen'

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[28px]">
      <h2 className="teal-text-gradient text-lead font-black tracking-[0.05em]">{title}</h2>
      <div className="mt-[10px] space-y-[10px] text-caption font-light leading-[1.4] tracking-[0.05em] text-mist">{children}</div>
    </section>
  )
}

export default function Creator() {
  return (
    <Screen title="Meet The Creator." subtitle="Unsaid wasn’t built by a company. It was built by someone who understood the silence firsthand.">
      <div className="relative -mx-[var(--gutter)] mt-[10px] h-[258px]">
        <div className="absolute inset-x-[-21px] bottom-0 h-[167px] rounded-[30px] bg-[linear-gradient(0deg,#00627a,rgba(0,6,9,0))]" />
        <img src={portrait} alt="Rishabh Dhiman" className="absolute bottom-0 left-1/2 h-[258px] w-[322px] -translate-x-1/2 object-cover" />
        <div className="absolute inset-x-[-25px] bottom-0 h-[169px] rounded-[30px] bg-[linear-gradient(0deg,#000609,rgba(0,6,9,0)_40%)]" />
      </div>

      <Part title="Who I Am ?">
        <p className="font-semibold">
          Rishabh Dhiman, 22 — a designer by profession, a thinker by nature, and someone who recently completed my B.Tech in Electronics &amp; Communication
          Engineering.
        </p>
        <p className="font-semibold">
          While I studied circuits and code, my mind was often elsewhere — questioning emotions, silence, and the spaces we don’t talk about. That’s how design
          became more than a skill — it became a way to explore the unsaid.
        </p>
      </Part>
      <Part title="Where It All Began">
        <p>A designer, an overthinker, someone who used to carry more emotions in silence than I ever spoke aloud.</p>
        <p>
          This app didn’t start as a project. It started as a feeling. A feeling I lived with for years — that something was missing. That even in a world
          flooded with content about mental health, I didn’t see myself in any of it.
        </p>
      </Part>
      <Part title="Growing Up Silent">
        <p>
          I grew up feeling things deeply, but never really knew what to do with all that emotion. Like many men, I was told silence was strength. That
          feelings were distractions. That vulnerability wasn’t masculine. I’ve been told to “man up” more times than I can count.
        </p>
        <p>
          So I stayed quiet. I smiled when I was falling apart. I coped by bottling things up. I’ve been through those nights when you overthink everything but
          can’t talk to anyone. I’ve felt the weight of emotions I didn’t know how to name — and worse, felt like I had no space to name them in.
        </p>
      </Part>
      <Part title="The Turning Point">
        <p>
          As I grew more curious, I started researching men’s mental health. What I found shook me. The numbers weren’t just sad — they were terrifying.
        </p>
        <p className="font-semibold italic">Suicide. Suppressed emotions. Emotional isolation.</p>
        <p>
          So many men dying with their stories untold, their pain unheard. Most didn’t even leave a note. Just silence. That silence felt familiar — because
          for the longest time, it was mine too.
        </p>
      </Part>
      <Part title="Discovering Journaling">
        <p>
          That’s when I discovered journaling — not from an app, but from desperation, Not as a productivity hack, but as a quiet release.
        </p>
        <p>
          I also discovered the healing power of journaling. It’s not just writing — it’s releasing. It’s the quiet friend who listens without judgment.
        </p>
        <p className="font-semibold italic">
          And studies show it can be life-saving. It helps break the mental loop that often pushes people toward dangerous edges.
        </p>
      </Part>
      <Part title="The Gap I Saw">
        <p>
          I looked around — for something, anything — that felt like it was made for me. An app, a place, a tool — where I didn’t have to filter my feelings or
          pretend I was okay. But everything I found was either too polished, too performative, or too clinical.
        </p>
        <p className="font-semibold italic">
          I can honestly say, the majority of them were more woman-centric. None truly reflected what it feels like to be a man who feels — but stays quiet.
        </p>
      </Part>
      <Part title="So I Built What I Needed">
        <p>So I built what I needed when I needed one.</p>
        <p>
          I’m not a therapist. I’m not a startup founder chasing users. I’m just someone who believes men deserve a safe space to feel — without needing to
          explain or apologize for it.
        </p>
        <p className="font-semibold">So no — UNSAID isn’t built to scale. It’s built to matter.</p>
      </Part>
      <Part title="Why This Matters">
        <p>This isn’t a business.</p>
        <p>
          It’s a contribution — to something real, raw, and often ignored. UNSAID is for people like me — the silent carriers, the overthinkers, the ones who
          smile while breaking on the inside.
        </p>
      </Part>

      <p className="mt-[36px] text-center text-caption font-semibold italic leading-snug tracking-[0.05em] text-teal">
        “UNSAID is more than an app. It’s my quiet apology to every version of me that needed a safe space and never found one — until now.”
      </p>
      <img src={signature} alt="Rishabh Dhiman’s signature" className="mx-auto mt-[12px] h-[37px] w-[79px] object-contain object-bottom" />
      <p className="mt-[10px] text-center text-caption font-semibold italic leading-snug tracking-[0.05em] text-teal">
        If it reaches just one person who feels the way I did, this journey is already worth it.
      </p>
    </Screen>
  )
}
