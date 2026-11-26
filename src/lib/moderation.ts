/**
 * A small first line of defence for replies in Vent Space. The server also
 * hides anything that collects several reports.
 */
const BLOCKED = [
  /\bk[i1]ll\s+your\s*self\b/i,
  /\bkys\b/i,
  /\bgo\s+die\b/i,
  /\b(f+u+c+k+|f\*+k)\s*(you|u|off)\b/i,
  /\b(retard(ed)?|f[a@]gg?[o0]t|n[i1]gg(er|a))\b/i,
  /\b(madarchod|behenchod|bhenchod|chutiya|bhosdi\w*|randi)\b/i,
  /\bnobody\s+cares\b/i,
  /\bman\s+up\b/i,
]

export function isAbusive(text: string): boolean {
  return BLOCKED.some((re) => re.test(text))
}
