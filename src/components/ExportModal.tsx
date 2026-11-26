import { useState } from 'react'
import { format } from 'date-fns'
import { LogOut } from 'lucide-react'
import filterIcon from '../assets/icons/filter.png'
import { Modal } from './ui'
import { useToast } from './Toast'
import { buildExport, downloadBlob } from '../lib/export'

type Preset = '7' | '30' | 'all' | 'custom'

/** "Export everything in one click." — Settings frames Group 101 / 103. */
export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [preset, setPreset] = useState<Preset>('7')
  const today = format(new Date(), 'yyyy-MM-dd')
  const [start, setStart] = useState(format(new Date(Date.now() - 6 * 86_400_000), 'yyyy-MM-dd'))
  const [end, setEnd] = useState(today)
  const [busy, setBusy] = useState(false)

  const run = async () => {
    const to = preset === 'custom' ? new Date(end) : new Date()
    const from =
      preset === 'custom' ? new Date(start) : preset === 'all' ? new Date(2020, 0, 1) : new Date(Date.now() - (Number(preset) - 1) * 86_400_000)
    if (from > to) {
      toast('Start date must be before the end date.')
      return
    }
    setBusy(true)
    try {
      const blob = await buildExport(from, to)
      downloadBlob(blob, `unsaid-export-${format(new Date(), 'yyyy-MM-dd')}.zip`)
      toast('Your export is ready.')
      onClose()
    } catch {
      toast('Couldn’t create the export. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} label="Export my data">
      <div className="rounded-[25px] bg-[linear-gradient(180deg,#00627a,#000609)] px-[33px] pt-[30px] pb-[28px]">
        <p className="text-lead font-bold tracking-[0.05em] text-white">Export everything in one click.</p>
        <p className="mt-[14px] text-[0.95rem] leading-snug tracking-[0.05em] text-white">
          Download all your mood logs and journal entries in a single <b>ZIP file.</b>
        </p>
        <div className="mt-[22px] flex items-center gap-[10px]">
          <span className="flex size-[33px] items-center justify-center rounded-full bg-teal" aria-hidden>
            <img src={filterIcon} alt="" className="size-[16px]" />
          </span>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as Preset)}
            aria-label="Date range"
            className="h-[38px] appearance-none rounded-[19px] border border-teal bg-transparent px-[14px] text-caption font-semibold text-white outline-none"
          >
            <option value="7" className="bg-ink">Last 7 days</option>
            <option value="30" className="bg-ink">Last 30 days</option>
            <option value="all" className="bg-ink">Everything</option>
            <option value="custom" className="bg-ink">Custom date</option>
          </select>
        </div>
        {preset === 'custom' && (
          <div className="mt-[18px] grid grid-cols-2 gap-[20px]">
            {[
              ['Start Date', start, setStart],
              ['End Date', end, setEnd],
            ].map(([label, value, set]) => (
              <label key={label as string} className="block">
                <span className="text-caption font-semibold tracking-[0.05em] text-white">{label as string}</span>
                <input
                  type="date"
                  value={value as string}
                  max={today}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  className="mt-[6px] w-full border-b border-white/70 bg-transparent pb-[4px] text-caption text-white outline-none [color-scheme:dark]"
                />
              </label>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="mt-[26px] flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[25px] bg-[linear-gradient(180deg,#00627a,#000609)] text-lead font-bold tracking-[0.05em] text-mist shadow-[0_0_0_0.5px_rgba(219,219,219,0.3)] disabled:opacity-50"
        >
          {busy ? 'Preparing…' : 'Export'} <LogOut size={20} />
        </button>
        <p className="mt-[12px] text-center text-micro text-white/60">Created on your device. Nothing is uploaded.</p>
      </div>
    </Modal>
  )
}
