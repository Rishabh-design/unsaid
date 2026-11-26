import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null until the Supabase project keys are set in .env (see README). */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'unsaid-auth' },
      })
    : null

let signingIn: Promise<void> | null = null

/**
 * Every device gets a silent anonymous account: no email, no name, no sign-up.
 * It only exists so the server can tell "my vents" apart and rate-limit abuse.
 */
export async function ensureAnonymousSession(): Promise<void> {
  if (!supabase) return
  const { data } = await supabase.auth.getSession()
  if (data.session) return
  signingIn ??= supabase.auth
    .signInAnonymously()
    .then(({ error }) => {
      if (error) throw error
    })
    .finally(() => {
      signingIn = null
    })
  await signingIn
}
