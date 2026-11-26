import Dexie, { type EntityTable } from 'dexie'
import type { MoodId } from './moods'

/** One mood check-in per calendar day (local time). */
export interface MoodLog {
  date: string // YYYY-MM-DD, primary key
  mood: MoodId
  loggedAt: number
}

/** A private journal entry. Written entries have a body; voice entries have audio. */
export interface Entry {
  id?: number
  kind: 'text' | 'voice'
  title: string
  body: string
  prompt?: string
  audio?: Blob
  audioType?: string
  durationMs?: number
  createdAt: number
  updatedAt: number
}

export interface KV {
  key: string
  value: unknown
}

/** Used only when Supabase is not configured, so Vent Space still works on one device. */
export interface DemoVent {
  id: string
  body: string
  createdAt: number
  isMine: 0 | 1
  hugCount: number
  huggedByMe: 0 | 1
  replies: { id: string; body: string; createdAt: number; isMine: boolean }[]
}

class UnsaidDB extends Dexie {
  moods!: EntityTable<MoodLog, 'date'>
  entries!: EntityTable<Entry, 'id'>
  kv!: EntityTable<KV, 'key'>
  demoVents!: EntityTable<DemoVent, 'id'>

  constructor() {
    super('unsaid')
    this.version(1).stores({
      moods: 'date, mood, loggedAt',
      entries: '++id, kind, createdAt',
      kv: 'key',
      demoVents: 'id, createdAt, isMine',
    })
  }
}

export const db = new UnsaidDB()

export async function getKV<T>(key: string, fallback: T): Promise<T> {
  const row = await db.kv.get(key)
  return row === undefined ? fallback : (row.value as T)
}

export async function setKV<T>(key: string, value: T): Promise<void> {
  await db.kv.put({ key, value })
}

/** Wipes everything stored on this device. */
export async function wipeLocalData(): Promise<void> {
  await db.delete()
  localStorage.clear()
}
