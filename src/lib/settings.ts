import { useLiveQuery } from 'dexie-react-hooks'
import { db, getKV, setKV } from './db'

export type FontSize = 'small' | 'medium' | 'large'
export type Theme = 'dark' | 'light'

export interface Settings {
  onboarded: boolean
  theme: Theme
  fontSize: FontSize
  journalReminder: boolean
  moodReminder: boolean
  /** SHA-256 of salt + PIN, or null when the passcode lock is off. */
  passcodeHash: string | null
  passcodeSalt: string | null
}

export interface Profile {
  name: string
  avatar: Blob | null
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  theme: 'dark',
  fontSize: 'small',
  journalReminder: true,
  moodReminder: true,
  passcodeHash: null,
  passcodeSalt: null,
}

export async function loadSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await getKV<Partial<Settings>>('settings', {})) }
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const current = await loadSettings()
  await setKV('settings', { ...current, ...patch })
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(async () => {
    const row = await db.kv.get('settings')
    return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<Settings>) ?? {}) }
  })
}

export function randomAnonName(): string {
  return `Anonymous${Math.floor(10 + Math.random() * 90)}`
}

export async function loadProfile(): Promise<Profile> {
  const existing = await getKV<Profile | null>('profile', null)
  if (existing) return existing
  const fresh: Profile = { name: randomAnonName(), avatar: null }
  await setKV('profile', fresh)
  return fresh
}

export function useProfile(): Profile | undefined {
  return useLiveQuery(async () => {
    const row = await db.kv.get('profile')
    return (row?.value as Profile | undefined) ?? { name: 'Anonymous', avatar: null }
  })
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const current = await loadProfile()
  await setKV('profile', { ...current, ...patch })
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function setPasscode(pin: string | null): Promise<void> {
  if (!pin) return updateSettings({ passcodeHash: null, passcodeSalt: null })
  const salt = crypto.randomUUID()
  await updateSettings({ passcodeHash: await sha256(salt + pin), passcodeSalt: salt })
}

export async function checkPasscode(pin: string, s: Settings): Promise<boolean> {
  if (!s.passcodeHash || !s.passcodeSalt) return true
  return (await sha256(s.passcodeSalt + pin)) === s.passcodeHash
}
