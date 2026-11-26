import JSZip from 'jszip'
import { format } from 'date-fns'
import { db } from './db'
import { MOOD_BY_ID } from './moods'

function extFor(type?: string): string {
  if (!type) return 'webm'
  if (type.includes('mp4') || type.includes('aac')) return 'm4a'
  if (type.includes('ogg')) return 'ogg'
  return 'webm'
}

function safe(name: string): string {
  return name.replace(/[^\w\- ]+/g, '').trim().slice(0, 40) || 'entry'
}

/** Builds a ZIP of every mood log and journal entry between two dates (inclusive). */
export async function buildExport(from: Date, to: Date): Promise<Blob> {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime()
  const zip = new JSZip()

  const moods = (await db.moods.toArray()).filter((m) => m.loggedAt >= start && m.loggedAt <= end)
  const csv = ['date,time,mood', ...moods.map((m) => `${m.date},${format(m.loggedAt, 'HH:mm')},${MOOD_BY_ID[m.mood].label}`)]
  zip.file('mood-logs.csv', csv.join('\n'))

  const entries = await db.entries.where('createdAt').between(start, end, true, true).toArray()
  for (const e of entries) {
    const stamp = format(e.createdAt, 'yyyy-MM-dd_HHmm')
    if (e.kind === 'text') {
      const md = `# ${e.title || 'Untitled'}\n\n_${format(e.createdAt, 'EEEE, d MMMM yyyy · h:mm a')}_\n\n${e.prompt ? `> ${e.prompt}\n\n` : ''}${e.body}\n`
      zip.file(`journal/${stamp} ${safe(e.title)}.md`, md)
    } else if (e.audio) {
      zip.file(`voice/${stamp} ${safe(e.title)}.${extFor(e.audioType)}`, e.audio)
      if (e.body) zip.file(`voice/${stamp} ${safe(e.title)} (transcript).txt`, e.body)
    }
  }

  zip.file(
    'README.txt',
    `UNSAID export\n${format(from, 'd MMM yyyy')} – ${format(to, 'd MMM yyyy')}\n\n${moods.length} mood logs, ${entries.length} journal entries.\nThis file was created on your device. Keep it somewhere safe.\n`,
  )
  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
