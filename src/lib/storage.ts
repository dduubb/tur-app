import type { AppState, Exercise, WorkoutSession } from '../types'

const KEY = 'tur-app-v1'

export function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<AppState>
  } catch {
    return {}
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Quota exceeded or unavailable — fail silently
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY)
}

export function exportJSON(exercises: Exercise[], sessions: WorkoutSession[]): void {
  const payload = { version: 1, exportedAt: new Date().toISOString(), exercises, sessions }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tur-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImport(raw: string): { exercises: Exercise[]; sessions: WorkoutSession[] } {
  const data = JSON.parse(raw) as { exercises?: Exercise[]; sessions?: WorkoutSession[] }
  if (!Array.isArray(data.exercises)) throw new Error('Invalid backup: missing exercises')
  return {
    exercises: data.exercises,
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
  }
}
