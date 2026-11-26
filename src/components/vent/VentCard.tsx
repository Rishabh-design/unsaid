import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import hugOutline from '../../assets/icons/hug-outline.png'
import hugFilled from '../../assets/icons/hug-filled.png'
import commentIcon from '../../assets/icons/comment.png'
import { fadesIn, postedAgo } from '../../lib/dates'
import type { Vent } from '../../lib/vents'

interface Props {
  vent: Vent
  onHug: (v: Vent) => void
}

/** A vent in the Explore feed: text card, then the hug and reply actions beneath it. */
export function VentCard({ vent, onHug }: Props) {
  const [expanded, setExpanded] = useState(false)
  const long = vent.body.length > 160

  return (
    <article className="animate-fade-up">
      <div className="vent-card relative rounded-card px-[23px] pt-[11px] pb-[16px]">
        <p className="text-[0.375rem] font-medium tracking-[0.05em] text-[rgba(217,217,217,0.8)]">{postedAgo(vent.createdAt)}</p>
        <p className={clsx('mt-[12px] whitespace-pre-wrap text-caption font-light leading-[1.25] tracking-[0.05em] text-white', !expanded && long && 'line-clamp-3')}>
          {vent.body}
        </p>
        {long && !expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="mt-[2px] text-caption font-bold tracking-[0.05em] text-teal">
            Read More
          </button>
        )}
      </div>
      <div className="mt-[6px] flex items-center gap-[10px] pl-[14px]">
        <button type="button" onClick={() => onHug(vent)} disabled={vent.isMine} aria-pressed={vent.huggedByMe} aria-label={vent.huggedByMe ? 'Remove hug' : 'Send a hug'} className="flex items-center gap-1 transition active:scale-90">
          <img src={vent.huggedByMe ? hugFilled : hugOutline} alt="" className="size-[21px]" />
          {vent.hugCount > 0 && <span className="text-micro font-medium text-[#d9d9d9]">{vent.hugCount}</span>}
        </button>
        <Link to={`/vent-space/${vent.id}`} aria-label="Reply" className="flex items-center gap-1">
          <img src={commentIcon} alt="" className="size-[19px]" />
          {vent.replyCount > 0 && <span className="text-micro font-medium text-[#d9d9d9]">{vent.replyCount}</span>}
        </Link>
        <span className="ml-auto pr-[6px] text-[0.4rem] tracking-[0.05em] text-mist/40">{fadesIn(vent.createdAt)}</span>
      </div>
    </article>
  )
}
