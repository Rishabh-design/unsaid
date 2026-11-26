/**
 * Gentle, situation-based prompts. The case study found 91% of men felt
 * "emotionally unblocked" when guided by relevant prompts.
 */
export const PROMPTS: string[] = [
  'Who or what brought you comfort today?',
  'What’s been sitting on your chest lately?',
  'What did you want to say today, but didn’t?',
  'When did you last feel truly at ease?',
  'What are you pretending is fine right now?',
  'What would you tell a friend who felt the way you do?',
  'What drained you today? What filled you back up?',
  'What’s one thing you’re carrying that isn’t yours to carry?',
  'Describe today in three words. Then explain one of them.',
  'What are you proud of that nobody noticed?',
  'What’s a worry you keep coming back to?',
  'Who do you miss right now? What would you say to them?',
  'What made you angry recently? What was underneath it?',
  'What do you need more of this week?',
  'When did you last laugh for real?',
  'What expectation is weighing on you the most?',
  'What’s one small win from today?',
  'If your mind had a weather report today, what would it say?',
  'What do you wish someone would ask you?',
  'What are you afraid people would think if they really knew you?',
  'What’s something you’ve been avoiding? Why?',
  'What does “being strong” mean to you right now?',
  'Write a few lines to your younger self.',
  'What helped you get through a hard time before?',
  'What would make tomorrow a little lighter?',
  'What are you grateful for, even if it’s small?',
  'Where in your body do you feel today’s stress?',
  'What boundary do you need to set?',
  'What’s a memory that still makes you smile?',
  'What would you do if no one was watching or judging?',
]

export function nextPrompt(current?: string): string {
  const pool = PROMPTS.filter((p) => p !== current)
  return pool[Math.floor(Math.random() * pool.length)]
}
