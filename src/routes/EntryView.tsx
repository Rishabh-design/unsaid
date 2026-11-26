import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Modal } from '../components/ui'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export default function EntryView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const entry = useLiveQuery(() => db.entries.get(Number(id)), [id], null)
  const [confirm, setConfirm] = useState(false)
  const audioUrl = useMemo(() => (entry?.audio ? URL.createObjectURL(entry.audio) : null), [entry?.audio])
  useEffect(() => () => void (audioUrl && URL.revokeObjectURL(audioUrl)), [audioUrl])

  if (entry === undefined) {
    return (
      <Screen title="Not found.">
        <p className="mt-6 text-body text-mist/80">This entry doesn’t exist anymore.</p>
      </Screen>
    )
  }
  if (!entry) return <Screen>{null}</Screen>

  const remove = async () => {
    await db.entries.delete(entry.id!)
    toast('Entry deleted.')
    navigate(entry.kind === 'voice' ? '/logs?tab=voice' : '/logs', { replace: true })
  }

  return (
    <Screen title={entry.title || 'Untitled'} titleClassName="text-title leading-snug" subtitle={format(entry.createdAt, 'EEEE, d MMMM yyyy · h:mm a')}>
      <article
        className="-mx-[12px] mt-[28px] rounded-card border border-teal/60 px-[28px] py-[24px]"
        style={{ background: 'radial-gradient(90% 60% at 40% 70%, rgba(0,98,122,0.3), rgba(0,6,9,0) 70%), var(--c-ink)' }}
      >
        {entry.kind === 'voice' && audioUrl && <audio controls src={audioUrl} className="w-full" />}
        {entry.kind === 'voice' && (
          <p className="mt-4 text-micro uppercase tracking-[0.1em] text-mist/50">{entry.body ? 'Transcript' : 'No transcript for this recording'}</p>
        )}
        {entry.body && <p className="mt-2 whitespace-pre-wrap text-body font-light leading-relaxed tracking-[0.02em] text-mist">{entry.body}</p>}
      </article>

      <div className="mt-[24px] flex gap-[14px]">
        {entry.kind === 'text' && (
          <button type="button" onClick={() => navigate(`/journal/write?id=${entry.id}`)} className="btn-glow flex h-[40px] flex-1 items-center justify-center gap-2 rounded-card text-caption font-semibold text-mist">
            <Pencil size={14} /> Edit
          </button>
        )}
        <button type="button" onClick={() => setConfirm(true)} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-card bg-deep text-caption font-semibold text-mist">
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <ConfirmDialog open={confirm} onCancel={() => setConfirm(false)} onConfirm={remove} message="This entry will be deleted from this device for good." />
    </Screen>
  )
}

/** "Are you sure ?" dialog from the Settings frames. */
export function ConfirmDialog({ open, onCancel, onConfirm, message }: { open: boolean; onCancel: () => void; onConfirm: () => void; message?: string }) {
  return (
    <Modal open={open} onClose={onCancel} label="Are you sure?">
      <div className="mx-auto w-[260px] rounded-card bg-[linear-gradient(180deg,#00627a,#000609)] px-[20px] py-[18px] text-center">
        <p className="text-lead font-bold tracking-[0.05em] text-white">Are you sure ?</p>
        {message && <p className="mt-2 text-caption font-light leading-snug text-mist">{message}</p>}
        <div className="mt-[16px] grid grid-cols-2 gap-[10px]">
          <button type="button" onClick={onCancel} className="h-[30px] rounded-pill border border-mist/60 text-caption font-semibold text-mist">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="h-[30px] rounded-pill bg-teal text-caption font-semibold text-white shadow-[inset_0_4px_4px_rgba(0,0,0,0.4)]">
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  )
}
