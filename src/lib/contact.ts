import { ensureAnonymousSession, supabase } from './supabase'

export const SUPPORT_EMAIL = 'support@unsaidapp.in'

export type ContactTopic = 'Feedback' | 'Report a bug' | 'Need help' | 'Request feature' | 'Other'

export interface ContactMessage {
  name: string
  email: string
  topic: string
  message: string
}

/**
 * Sends the contact form to Supabase when it is connected.
 * Returns false when it can't, so the caller can fall back to the mail app.
 */
export async function sendContactMessage(msg: ContactMessage): Promise<boolean> {
  if (!supabase) return false
  await ensureAnonymousSession()
  const { error } = await supabase.rpc('submit_contact', {
    p_name: msg.name.trim().slice(0, 100),
    p_email: msg.email.trim().slice(0, 200),
    p_topic: msg.topic.slice(0, 60),
    p_message: msg.message.trim().slice(0, 4000),
  })
  return !error
}

export function mailtoLink(msg?: Partial<ContactMessage>): string {
  const subject = encodeURIComponent(`UNSAID – ${msg?.topic ?? 'Support'}`)
  const body = encodeURIComponent(msg?.message ? `${msg.message}\n\n— ${msg.name ?? ''}` : '')
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
}
