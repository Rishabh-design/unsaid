import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RotateCw } from 'lucide-react'
import { Screen } from '../components/Screen'
import { FillButton, GhostButton } from '../components/ui'
import { CrisisSheet } from '../components/CrisisSheet'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { nextPrompt } from '../lib/prompts'
import { mentionsCrisis } from '../lib/crisis'

const DRAFT_KEY = 'unsaid-draft-write'

interface Draft {
  title: string
  body: string
  prompt: string | null
}

export default function JournalWrite() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const editId = params.get('id') ? Number(params.get('id')) : null
  const [draft, setDraft] = useState<Draft>(() => {
    if (editId) return { title: '', body: '', prompt: null }
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '') as Draft
    } catch {
      return { title: '', body: '', prompt: null }
    }
  })
  const [crisis, setCrisis] = useState(false)

  // Editing an existing entry
  useEffect(() => {
    if (!editId) return
    db.entries.get(editId).then((e) => e && setDraft({ title: e.title, body: e.body, prompt: e.prompt ?? null }))
  }, [editId])

  // Never lose what someone has written: keep a local draft while typing.
  useEffect(() => {
    if (editId) return
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft, editId])

  const usePrompt = !!draft.prompt
  const canSave = draft.body.trim().length > 0

  const save = async () => {
    if (!canSave) return
    const now = Date.now()
    const title = (draft.prompt ?? draft.title).trim() || 'Untitled'
    if (editId) {
      await db.entries.update(editId, { title, body: draft.body, prompt: draft.prompt ?? undefined, updatedAt: now })
    } else {
      await db.entries.add({ kind: 'text', title, body: draft.body, prompt: draft.prompt ?? undefined, createdAt: now, updatedAt: now })
      localStorage.removeItem(DRAFT_KEY)
    }
    toast('Entry saved. Safely kept on this device.')
    if (mentionsCrisis(draft.body)) setCrisis(true)
    else navigate('/logs', { replace: true })
  }

  return (
    <Screen
      title={editId ? 'Edit your entry.' : 'Unpack what you’ve been carrying !'}
      titleClassName="font-extrabold leading-[1.25]"
      subtitle="No pressure, no format. Just you, your words, your pace."
    >
      {usePrompt ? (
        <>
          <p className="mt-[40px] text-body font-light tracking-[0.05em] text-fg">
            Want to write freely ?{' '}
            <button type="button" onClick={() => setDraft((d) => ({ ...d, prompt: null }))} className="font-bold text-teal">
              Go Back.
            </button>
          </p>
          <div className="mt-[12px] flex h-[38px] items-center rounded-card border border-teal pl-[14px] pr-[6px]">
            <p className="flex-1 truncate text-caption font-normal tracking-[0.05em] text-mist">{draft.prompt}</p>
            <button
              type="button"
              aria-label="Another prompt"
              onClick={() => setDraft((d) => ({ ...d, prompt: nextPrompt(d.prompt ?? undefined) }))}
              className="flex size-[30px] items-center justify-center text-teal transition active:rotate-90"
            >
              <RotateCw size={20} />
            </button>
          </div>
          <p className="mt-[20px] text-body font-light tracking-[0.05em] text-fg">Tap a Prompt to start reflecting.</p>
        </>
      ) : (
        <p className="mt-[40px] text-body font-light tracking-[0.05em] text-fg">
          Not sure what to write ?{' '}
          <button type="button" onClick={() => setDraft((d) => ({ ...d, prompt: nextPrompt() }))} className="font-bold text-teal">
            Try Prompts.
          </button>
        </p>
      )}

      <div
        className="-mx-[12px] mt-[16px] flex min-h-[360px] flex-1 flex-col rounded-card border border-teal/70 px-[32px] pt-[28px] pb-[20px]"
        style={{ background: 'radial-gradient(90% 60% at 40% 70%, rgba(0,98,122,0.35), rgba(0,6,9,0) 70%), var(--c-ink)' }}
      >
        {usePrompt ? (
          <p className="border-b border-mist/70 pb-[10px] text-lead font-semibold tracking-[0.05em] text-mist">{draft.prompt}</p>
        ) : (
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Title"
            maxLength={120}
            aria-label="Title"
            className="border-b border-mist/70 bg-transparent pb-[10px] text-lead font-semibold tracking-[0.05em] text-mist outline-none placeholder:text-mist"
          />
        )}
        <textarea
          value={draft.body}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          placeholder="Write here..."
          aria-label="Your entry"
          className="mt-[14px] min-h-[260px] flex-1 resize-none bg-transparent text-body font-light leading-relaxed tracking-[0.03em] text-mist outline-none placeholder:text-mist/30"
        />
        <p className="text-right text-micro text-mist/40">{draft.body.trim() ? `${draft.body.trim().split(/\s+/).length} words` : 'Only you can see this.'}</p>
      </div>

      <div className="-mx-[12px] mt-[24px] grid grid-cols-[1.6fr_1fr] gap-[14px]">
        <FillButton onClick={save} disabled={!canSave}>
          {editId ? 'Save Changes' : 'Save Entry'}
        </FillButton>
        <GhostButton onClick={() => setDraft({ title: '', body: '', prompt: draft.prompt })} disabled={!draft.body && !draft.title}>
          Clear
        </GhostButton>
      </div>

      <CrisisSheet
        open={crisis}
        onClose={() => navigate('/logs', { replace: true })}
        onContinue={() => navigate('/logs', { replace: true })}
        continueLabel="Go to my journal"
      />
    </Screen>
  )
}
