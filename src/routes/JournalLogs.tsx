import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import clsx from 'clsx'
import plusIcon from '../assets/icons/plus.png'
import micIcon from '../assets/icons/mic.png'
import writeIcon from '../assets/icons/write.png'
import filterIcon from '../assets/icons/filter.png'
import selectChevron from '../assets/icons/select-chevron.png'
import { Screen } from '../components/Screen'
import { Waveform } from '../components/Waveform'
import { db, type Entry } from '../lib/db'
import { formatClock } from '../hooks/useRecorder'

const MONTHS = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function EntryCard({ e }: { e: Entry }) {
  return (
    <Link
      to={`/logs/${e.id}`}
      className="flex h-[86px] items-center justify-between rounded-[19px] bg-[linear-gradient(180deg,#00627a,#001014)] pl-[23px] pr-[22px] transition active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-[0.7rem] font-bold text-mist">{e.title || 'Untitled'}</p>
        {e.kind === 'text' ? (
          <p className="mt-[3px] line-clamp-2 text-[0.6rem] font-medium leading-[1.2] text-mist/80">{e.body}</p>
        ) : (
          <div className="mt-[6px] flex items-center gap-2">
            <Waveform seed={e.id ?? 1} className="h-[18px] w-[150px]" />
            {e.durationMs ? <span className="text-micro text-mist/70">{formatClock(e.durationMs)}</span> : null}
          </div>
        )}
        <p className="mt-[4px] text-[0.6rem] font-medium text-white">{format(e.createdAt, 'hh:mm a')}</p>
      </div>
      <div className="text-right font-semibold leading-none text-mist">
        <p className="text-[2.38rem] tracking-[0.05em]">{format(e.createdAt, 'dd')}</p>
        <p className="mt-[4px] text-[1.19rem] tracking-[0.05em]">{format(e.createdAt, 'MMMM').slice(0, 9)}</p>
      </div>
    </Link>
  )
}

export default function JournalLogs() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab: Entry['kind'] = params.get('tab') === 'voice' ? 'voice' : 'text'
  const all = useLiveQuery(() => db.entries.orderBy('createdAt').reverse().toArray(), [], undefined)
  const [month, setMonth] = useState(0)
  const years = useMemo(() => {
    const ys = new Set((all ?? []).map((e) => new Date(e.createdAt).getFullYear()))
    ys.add(new Date().getFullYear())
    return [...ys].sort((a, b) => b - a)
  }, [all])
  const [year, setYear] = useState(new Date().getFullYear())

  const list = (all ?? []).filter((e) => {
    const d = new Date(e.createdAt)
    return e.kind === tab && d.getFullYear() === year && (month === 0 || d.getMonth() === month - 1)
  })

  return (
    <Screen
      title="Reflections Archive."
      subtitle="Scroll through the footprints of your inner journey. Your thoughts, safely kept - Day by Day."
      footer={
        <div className="pointer-events-none sticky bottom-0 mx-auto flex w-full max-w-[430px] justify-center bg-gradient-to-t from-ink via-ink/90 to-transparent pt-[40px] pb-[calc(env(safe-area-inset-bottom)+36px)]">
          <button
            type="button"
            onClick={() => navigate(tab === 'voice' ? '/journal/speak' : '/journal/write')}
            className="pointer-events-auto flex h-[61px] w-[156px] items-center rounded-pill border border-teal bg-ink pl-[2px] pr-[20px]"
          >
            {tab === 'voice' ? (
              <span className="flex size-[56px] items-center justify-center rounded-full bg-mist">
                <img src={micIcon} alt="" className="size-[34px]" />
              </span>
            ) : (
              <img src={plusIcon} alt="" className="size-[56px]" />
            )}
            <span className="ml-[10px] text-body font-semibold tracking-[0.05em] text-white">NEW ENTRY</span>
          </button>
        </div>
      }
    >
      <div className="mt-[34px] flex items-center gap-[5px]">
        <span className="flex size-[20px] items-center justify-center rounded-full bg-teal" aria-hidden>
          <img src={filterIcon} alt="" className="size-[10px]" />
        </span>
        <label className="relative">
          <span className="sr-only">Month</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-[20px] appearance-none rounded-pill border border-teal bg-transparent px-[9px] text-caption font-semibold text-white outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i} className="bg-ink">
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="relative flex items-center">
          <span className="sr-only">Year</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-[20px] w-[70px] appearance-none rounded-pill border border-teal bg-transparent pl-[8px] text-caption font-semibold text-white outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-ink">
                {y}
              </option>
            ))}
          </select>
          <img src={selectChevron} alt="" className="pointer-events-none absolute right-[2px] size-[16px]" />
        </label>

        <button
          type="button"
          onClick={() => setParams(tab === 'voice' ? {} : { tab: 'voice' }, { replace: true })}
          className="ml-auto flex h-[20px] items-center gap-[6px] rounded-pill bg-teal pl-[8px] pr-[8px] text-caption font-semibold text-white"
        >
          {tab === 'voice' ? 'Written logs' : 'Voice Logs'}
          <img src={tab === 'voice' ? writeIcon : micIcon} alt="" className={clsx('size-[14px]', 'invert-0')} />
        </button>
      </div>

      <div className="mt-[16px] flex flex-col gap-[20px]">
        {all && list.length === 0 && (
          <div className="mt-[40px] text-center">
            <p className="font-display text-lead text-mist">Nothing here yet.</p>
            <p className="mt-2 text-caption font-light text-mist/70">
              {tab === 'voice' ? 'Your voice journals will show up here.' : 'Your written entries will show up here.'} Your first one is a tap away.
            </p>
          </div>
        )}
        {list.map((e) => (
          <EntryCard key={e.id} e={e} />
        ))}
      </div>
    </Screen>
  )
}
