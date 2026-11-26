import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RotateCw } from 'lucide-react'
import clsx from 'clsx'
import hugFilled from '../assets/icons/hug-filled.png'
import hugOutline from '../assets/icons/hug-outline.png'
import commentIcon from '../assets/icons/comment.png'
import replyArrow from '../assets/icons/reply-arrow.svg'
import plusIcon from '../assets/icons/plus.png'
import fabRing from '../assets/icons/fab-ring.svg'
import { Screen } from '../components/Screen'
import { Spinner } from '../components/ui'
import { useToast } from '../components/Toast'
import { VentCard } from '../components/vent/VentCard'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { fadesIn, postedAgo, shortAgo } from '../lib/dates'
import { VentError, vents, type Reply, type Vent } from '../lib/vents'

function Tabs({ tab, mineCount, onChange }: { tab: 'explore' | 'mine'; mineCount: number; onChange: (t: 'explore' | 'mine') => void }) {
  return (
    <div className="mx-auto mt-[22px] flex h-[45px] w-[221px] items-center justify-center gap-[9px] rounded-pill border-[0.5px] border-mist">
      {(['explore', 'mine'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          aria-pressed={tab === t}
          className={clsx(
            'relative h-[26px] w-[95px] rounded-pill border border-mist text-[0.65rem] font-semibold text-mist transition',
            tab === t ? 'bg-teal' : 'bg-teal/20',
          )}
        >
          {t === 'explore' ? 'Explore' : 'My vents'}
          {t === 'mine' && mineCount > 0 && tab !== 'mine' && (
            <span className="absolute -right-[6px] -top-[9px] flex size-[19px] items-center justify-center rounded-full border border-mist bg-ink text-micro font-semibold">
              {mineCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function MyVentCard({ vent }: { vent: Vent }) {
  const [open, setOpen] = useState(false)
  const [replies, setReplies] = useState<Reply[] | null>(null)

  const toggle = async () => {
    if (!open && !replies) {
      const res = await vents.get(vent.id)
      setReplies(res?.replies ?? [])
    }
    setOpen(!open)
  }

  return (
    <article className="animate-fade-up">
      <Link to={`/vent-space/${vent.id}`} className="vent-card relative block rounded-card px-[15px] pt-[11px] pb-[18px]">
        <p className="text-[0.375rem] font-medium tracking-[0.05em] text-[rgba(217,217,217,0.8)]">{postedAgo(vent.createdAt)}</p>
        <span className="absolute right-[11px] top-[11px] flex items-center gap-[4px]">
          {vent.hugCount > 0 && <span className="text-micro font-medium text-[#d9d9d9]">{vent.hugCount}</span>}
          <img src={vent.hugCount > 0 ? hugFilled : hugOutline} alt={`${vent.hugCount} hugs`} className="size-[21px]" />
        </span>
        <p className="mt-[12px] line-clamp-3 pr-[30px] text-caption font-light leading-[1.25] tracking-[0.05em] text-white">{vent.body}</p>
      </Link>
      <div className="flex items-center justify-between pl-[17px] pr-[6px]">
        <button type="button" onClick={toggle} disabled={vent.replyCount === 0} aria-expanded={open} className="mt-[5px] flex items-center gap-[4px] disabled:opacity-60">
          <img src={commentIcon} alt="" className="size-[19px]" />
          <span className="text-micro font-medium text-[#d9d9d9]">{vent.replyCount}</span>
        </button>
        <span className="text-[0.4rem] tracking-[0.05em] text-mist/40">{fadesIn(vent.createdAt)}</span>
      </div>
      {open && replies && (
        <div className="mx-[22px] -mt-[2px] rounded-b-card bg-[rgba(30,43,50,0.5)] px-[20px] pt-[10px] pb-[16px]">
          {replies.length === 0 && <p className="text-caption text-mist/60">No replies yet.</p>}
          {replies.map((r) => (
            <div key={r.id} className="mt-[8px] flex gap-[5px]">
              <img src={replyArrow} alt="" className="mt-[1px] h-[11.8px] w-[11.5px] shrink-0" />
              <div>
                <p className="text-caption font-light leading-snug tracking-[0.05em] text-teal-bright">{r.body}</p>
                <p className="mt-[4px] text-micro font-medium text-[rgba(217,217,217,0.5)]">{shortAgo(r.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

export default function VentSpace() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'mine' ? 'mine' : 'explore'
  const [feed, setFeed] = useState<Vent[] | null>(null)
  const [mine, setMine] = useState<Vent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [f, m] = await Promise.all([vents.feed(), vents.mine()])
      setFeed(f)
      setMine(m)
      setError(null)
    } catch (e) {
      setError(e instanceof VentError ? e.message : 'Couldn’t load Vent Space.')
    }
  }, [])

  useEffect(() => {
    load()
    const onFocus = () => !document.hidden && load()
    document.addEventListener('visibilitychange', onFocus)
    return () => document.removeEventListener('visibilitychange', onFocus)
  }, [load])

  const { pull, refreshing } = usePullToRefresh(load)

  const hug = async (v: Vent) => {
    // Optimistic: feel instant, roll back if the server says no.
    const flip = (list: Vent[] | null, hugged: boolean, count: number) =>
      list?.map((x) => (x.id === v.id ? { ...x, huggedByMe: hugged, hugCount: count } : x)) ?? null
    setFeed((f) => flip(f, !v.huggedByMe, v.hugCount + (v.huggedByMe ? -1 : 1)))
    try {
      const res = await vents.toggleHug(v.id)
      setFeed((f) => flip(f, res.hugged, res.hugCount))
    } catch (e) {
      setFeed((f) => flip(f, v.huggedByMe, v.hugCount))
      toast(e instanceof VentError ? e.message : 'Couldn’t send that hug.')
    }
  }

  const list = tab === 'explore' ? feed : mine

  return (
    <Screen
      title={tab === 'explore' ? 'Vent Space' : 'My Vents'}
      subtitle={
        tab === 'explore'
          ? 'Read what others left unsaid — completely anonymous, disappearing in 24 hours.'
          : 'Every vent you write will automatically disappear after 24 hours — no traces, no history.'
      }
      footer={
        tab === 'mine' ? (
          <div className="pointer-events-none sticky bottom-[calc(env(safe-area-inset-bottom)+40px)] mx-auto flex w-full max-w-[430px] justify-center">
            <button type="button" onClick={() => navigate('/vent')} aria-label="Write a new vent" className="pointer-events-auto relative size-[60px]">
              <img src={fabRing} alt="" className="absolute inset-0 size-full" />
              <img src={plusIcon} alt="" className="absolute left-1/2 top-1/2 size-[57px] -translate-x-1/2 -translate-y-1/2" />
            </button>
          </div>
        ) : undefined
      }
    >
      <Tabs tab={tab} mineCount={mine?.length ?? 0} onChange={(t) => setParams(t === 'mine' ? { tab: 'mine' } : {}, { replace: true })} />

      <div className="flex justify-center overflow-hidden transition-all" style={{ height: refreshing ? 44 : pull * 0.6 }}>
        <RotateCw size={22} className={clsx('mt-[12px] text-mist', refreshing && 'animate-spin')} style={{ transform: `rotate(${pull * 4}deg)` }} />
      </div>

      {!vents.live && (
        <p className="mt-[10px] rounded-card border border-teal/40 px-4 py-2 text-center text-micro leading-snug text-mist/70">
          Preview mode — Vent Space isn’t connected to the server yet. Vents are only stored on this device.
        </p>
      )}

      <div className="-mx-[4px] mt-[18px] flex flex-col gap-[20px] pb-[80px]">
        {error && (
          <div className="mt-6 text-center">
            <p className="text-body text-mist/80">{error}</p>
            <button type="button" onClick={load} className="mt-3 text-caption font-bold text-teal">
              Try again
            </button>
          </div>
        )}
        {!list && !error && (
          <div className="mt-10 flex justify-center">
            <Spinner />
          </div>
        )}
        {list && list.length === 0 && (
          <div className="mt-10 text-center">
            <p className="font-display text-lead text-mist">{tab === 'explore' ? 'It’s quiet in here.' : 'No vents right now.'}</p>
            <p className="mt-2 text-caption font-light text-mist/70">
              {tab === 'explore' ? 'Be the first to let something out today.' : 'Anything you vent stays here for 24 hours.'}
            </p>
            <button type="button" onClick={() => navigate('/vent')} className="btn-glow mt-5 h-[40px] rounded-card px-6 text-caption font-semibold text-mist">
              Write a vent
            </button>
          </div>
        )}
        {list?.map((v) => (tab === 'explore' ? <VentCard key={v.id} vent={v} onHug={hug} /> : <MyVentCard key={v.id} vent={v} />))}
      </div>
    </Screen>
  )
}
