import type { Recommendation } from '../types'

export function getRecommendation(
  seconds: number,
  min: number,
  max: number
): Recommendation {
  if (seconds < min) return 'reduce'
  if (seconds > max) return 'increase'
  return 'keep'
}

export function getNextWeight(
  currentWeight: number,
  seconds: number,
  increment: number,
  min: number,
  max: number
): number {
  if (seconds > max) return currentWeight + increment
  if (seconds < min) return Math.max(currentWeight - increment, increment)
  return currentWeight
}

export function getRecommendationText(
  rec: Recommendation,
  nextWeight: number,
  currentWeight: number
): string {
  if (rec === 'increase')
    return `Increase to ${nextWeight} lbs next session`
  if (rec === 'reduce')
    return `Reduce to ${nextWeight} lbs next session`
  return currentWeight === nextWeight
    ? 'Keep same weight — beat this time!'
    : `Keep at ${nextWeight} lbs — beat this time!`
}

export function formatSeconds(s: number): string {
  const mins = Math.floor(s / 60)
  const secs = s % 60
  if (mins === 0) return `${secs}`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function selectSessionExercises(
  exercises: { id: string; lastDate: string | null }[],
  count = 4
): string[] {
  return [...exercises]
    .sort((a, b) => {
      if (!a.lastDate && !b.lastDate) return 0
      if (!a.lastDate) return -1
      if (!b.lastDate) return 1
      return new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime()
    })
    .slice(0, count)
    .map((e) => e.id)
}
