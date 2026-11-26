import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Flag, SendHorizontal, Trash2, X } from 'lucide-react'
import hugOutline from '../assets/icons/hug-outline.png'
import hugFilled from '../assets/icons/hug-filled.png'
import replyArrow from '../assets/icons/reply-arrow.svg'
import { Screen } from '../components/Screen'
import { Sheet, Spinner } from '../components/ui'
import { useToast } from '../components/Toast'
import { ConfirmDialog } from './EntryView'
import { postedAgo, shortAgo } from '../lib/dates'
import { REPLY_MAX, VentError, vents, type Reply, type Vent } from '../lib/vents'
import { isAbusive } from '../lib/moderation'

const REASONS = ['Hateful or abusive', 'Harassment or bullying', 'Spam or advertising', 'Sharing someone’s personal info', 'Something else']

export default function VentDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState<{ vent: Vent; replies: Reply[] } | null | undefined>(undefined)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [report, setReport] = useState<{ kind: 'vent' | 'reply'; id: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    try {
      setData(await vents.get(id))
    } catch (e) {
      toast(e instanceof VentError ? e.message : 'Couldn’t open this vent.')
      setData(null)
    }
  }, [id, toast])

  useEffect(() => {
    load()
  }, [load])

  const close = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/vent-space'))

  const hug = async () => {
    if (!data) return
    try {
      const res = await vents.toggleHug(data.vent.id)
      setData({ ...data, vent: { ...data.vent, huggedByMe: res.hugged, hugCount: res.hugCount } })
    } catch (e) {
      toast(e instanceof VentError ? e.message : 'Couldn’t send that hug.')
    }
  }

  const send = async () => {
    const text = reply.trim()
    if (!text || !data) return
    if (isAbusive(text)) {
      toast('Let’s keep Vent Space kind. Try rewording that.')
      return
    }
    setSending(true)
    try {
      const r = await vents.reply(data.vent.id, text)
      setData({ vent: { ...data.vent, replyCount: data.vent.replyCount + 1 }, replies: [...data.replies, r] })
      setReply('')
      toast('Your words were sent anonymously.')
    } catch (e) {
      toast(e instanceof VentError ? e.message : 'Couldn’t send that.')
    } finally {
      setSending(false)
    }
  }

  const submitReport = async (reason: string) => {
    if (!report) return
    try {
      await vents.report(report.kind, report.id, reason)
      toast('Thanks for looking out. We’ll review it.')
      if (report.kind === 'vent') close()
      else setData((d) => (d ? { ...d, replies: d.replies.filter((r) => r.id !== report.id) } : d))
    } catch (e) {
      toast(e instanceof VentError ? e.message : 'Couldn’t send the report.')
    }
    setReport(null)
  }

  const remove = async () => {
    try {
      await vents.remove(id)
      toast('Your vent was removed.')
      navigate('/vent-space?tab=mine', { replace: true })
    } catch (e) {
      toast(e instanceof VentError ? e.message : 'Couldn’t remove it.')
    }
  }

  return (
    <Screen title="Vent Space" subtitle="Read what others left unsaid — completely anonymous, disappearing in 24 hours.">
      {data === undefined && (
        <div className="mt-16 flex justify-center">
          <Spinner />
        </div>
      )}
      {data === null && (
        <div className="mt-16 text-center">
          <p className="font-display text-lead text-mist">This vent has faded.</p>
          <p className="mt-2 text-caption text-mist/70">Vents disappear after 24 hours.</p>
        </div>
      )}
      {data && (
        <>
          <div
            className="-mx-[12px] mt-[60px] rounded-card border-[0.5px] border-mist/70 px-[16px] pt-[11px] pb-[14px]"
            style={{ backgroundImage: 'linear-gradient(160deg, rgba(0,16,20,0.95) 30%, rgba(30,43,50,0.95))' }}
          >
            <div className="flex items-start justify-between">
              <p className="text-[0.375rem] font-medium tracking-[0.05em] text-[rgba(217,217,217,0.8)]">{postedAgo(data.vent.createdAt)}</p>
              <div className="flex items-center gap-[10px]">
                {data.vent.isMine ? (
                  <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete my vent" className="text-mist/60">
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <button type="button" onClick={() => setReport({ kind: 'vent', id: data.vent.id })} aria-label="Report this vent" className="text-mist/50">
                    <Flag size={13} />
                  </button>
                )}
                <button type="button" onClick={hug} disabled={data.vent.isMine} aria-pressed={data.vent.huggedByMe} aria-label="Send a hug" className="flex items-center gap-1">
                  {data.vent.hugCount > 0 && <span className="text-micro text-[#d9d9d9]">{data.vent.hugCount}</span>}
                  <img src={data.vent.huggedByMe || data.vent.isMine ? hugFilled : hugOutline} alt="" className="size-[21px]" />
                </button>
              </div>
            </div>
            <div className="mt-[10px] max-h-[300px] overflow-y-auto pr-[6px]">
              <p className="whitespace-pre-wrap text-caption font-light leading-[1.3] tracking-[0.05em] text-white">{data.vent.body}</p>
            </div>

            {data.replies.length > 0 && (
              <div className="mt-[14px] border-t border-mist/15 pt-[10px]">
                {data.replies.map((r) => (
                  <div key={r.id} className="mt-[8px] flex gap-[5px]">
                    <img src={replyArrow} alt="" className="mt-[1px] h-[11.8px] w-[11.5px] shrink-0" />
                    <div className="flex-1">
                      <p className="text-caption font-light leading-snug tracking-[0.05em] text-teal-bright">{r.body}</p>
                      <p className="mt-[3px] text-micro font-medium text-[rgba(217,217,217,0.5)]">
                        {shortAgo(r.createdAt)}
                        {r.isMine && ' · you'}
                      </p>
                    </div>
                    {!r.isMine && (
                      <button type="button" onClick={() => setReport({ kind: 'reply', id: r.id })} aria-label="Report this reply" className="self-start text-mist/40">
                        <Flag size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!data.vent.isMine && (
              <div className="mt-[16px] flex items-center gap-[10px]">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value.slice(0, REPLY_MAX))}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Leave an anonymous word of comfort."
                  aria-label="Reply"
                  className="h-[31px] flex-1 rounded-card border-[0.5px] border-mist bg-transparent px-[14px] text-caption font-light tracking-[0.05em] text-mist outline-none placeholder:text-mist/60"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!reply.trim() || sending}
                  aria-label="Send reply"
                  className="flex size-[30px] items-center justify-center rounded-full border border-mist text-mist disabled:opacity-40"
                >
                  <SendHorizontal size={14} fill="currentColor" />
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={close} aria-label="Close" className="mx-auto mt-[18px] p-2 text-mist">
            <X size={22} />
          </button>
        </>
      )}

      <Sheet open={!!report} onClose={() => setReport(null)} label="Report">
        <h2 className="text-lead font-bold text-mist">Why are you reporting this?</h2>
        <p className="mt-1 text-caption font-light text-mist/70">Reports are anonymous. Content with several reports is hidden automatically.</p>
        <div className="mt-4 flex flex-col gap-2">
          {REASONS.map((r) => (
            <button key={r} type="button" onClick={() => submitReport(r)} className="rounded-card border border-teal/50 px-4 py-3 text-left text-caption text-mist">
              {r}
            </button>
          ))}
        </div>
      </Sheet>
      <ConfirmDialog open={confirmDelete} onCancel={() => setConfirmDelete(false)} onConfirm={remove} message="Your vent and its replies will be removed now." />
    </Screen>
  )
}
