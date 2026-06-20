/** Shared 0–100 → letter grade (A≥90, B≥75, C≥60, D≥40, else F). */
export type Letter = 'A' | 'B' | 'C' | 'D' | 'F'

export function letterGrade(score: number): Letter {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}
