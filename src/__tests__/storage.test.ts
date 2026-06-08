import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadState, saveState, clearState, parseImport } from '../lib/storage'
import type { AppState } from '../types'
import { DEFAULT_EXERCISES } from '../data/defaultExercises'

// ── localStorage mock ─────────────────────────────────────────
let store: Record<string, string> = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    store = {}
  }),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

const mockState: AppState = {
  exercises: DEFAULT_EXERCISES.slice(0, 3),
  sessions: [
    {
      id: '1',
      date: '2026-06-08',
      entries: [
        {
          exerciseId: 'chest-press',
          exerciseName: 'Chest Press',
          weight: 80,
          seconds: 67,
          isNewPR: true,
          recommendation: 'keep',
        },
      ],
    },
  ],
  activeSession: null,
}

describe('storage', () => {
  beforeEach(() => {
    store = {}
    vi.clearAllMocks()
  })

  it('returns empty object when nothing saved', () => {
    expect(loadState()).toEqual({})
  })

  it('saves and loads state round-trip', () => {
    saveState(mockState)
    const loaded = loadState()
    expect(loaded.exercises).toEqual(mockState.exercises)
    expect(loaded.sessions).toEqual(mockState.sessions)
    expect(loaded.activeSession).toBeNull()
  })

  it('clears state', () => {
    saveState(mockState)
    clearState()
    expect(loadState()).toEqual({})
  })

  it('handles corrupted JSON gracefully', () => {
    store['tur-app-v1'] = 'not valid json {{{'
    expect(loadState()).toEqual({})
  })

  it('handles localStorage being unavailable', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveState(mockState)).not.toThrow()
  })
})

describe('parseImport', () => {
  it('parses valid export', () => {
    const payload = JSON.stringify({
      version: 1,
      exercises: DEFAULT_EXERCISES.slice(0, 2),
      sessions: [],
    })
    const { exercises, sessions } = parseImport(payload)
    expect(exercises).toHaveLength(2)
    expect(sessions).toHaveLength(0)
  })

  it('throws on missing exercises', () => {
    expect(() => parseImport(JSON.stringify({ sessions: [] }))).toThrow()
  })

  it('defaults sessions to [] when missing', () => {
    const payload = JSON.stringify({ exercises: DEFAULT_EXERCISES.slice(0, 1) })
    const { sessions } = parseImport(payload)
    expect(sessions).toEqual([])
  })

  it('throws on invalid JSON', () => {
    expect(() => parseImport('garbage')).toThrow()
  })
})
