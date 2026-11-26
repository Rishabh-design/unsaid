/**
 * UNSAID is not a crisis app, but if someone writes something that suggests
 * they may be in danger, we gently surface real helplines before anything else.
 */
export interface Helpline {
  name: string
  numbers: { label: string; tel: string }[]
}

export const HELPLINES: Helpline[] = [
  { name: 'iCall', numbers: [{ label: '+91 9152987821', tel: '+919152987821' }] },
  {
    name: 'Vandrevala Foundation',
    numbers: [
      { label: '1860 2662 345', tel: '18602662345' },
      { label: '1800 2333 330', tel: '18002333330' },
    ],
  },
  { name: 'AASRA', numbers: [{ label: '+91 9820466726', tel: '+919820466726' }] },
  { name: 'Tele MANAS (Govt. of India, 24×7)', numbers: [{ label: '14416', tel: '14416' }] },
]

const PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bend\s+(it\s+all|my\s+life|everything)\b/i,
  /\bwant(ed)?\s+to\s+die\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|go(ing)?\s+on)\b/i,
  /\bself[\s-]?harm/i,
  /\bcut(ting)?\s+my\s*self\b/i,
  /\bhurt(ing)?\s+my\s*self\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+here|live|wake\s+up)\b/i,
  /\bnot\s+worth\s+living\b/i,
]

export function mentionsCrisis(text: string): boolean {
  return PATTERNS.some((re) => re.test(text))
}
