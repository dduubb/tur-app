import { describe, it, expect } from 'vitest'
import {
  getRecommendation,
  getNextWeight,
  getRecommendationText,
  formatSeconds,
  selectSessionExercises,
} from '../lib/progression'

describe('getRecommendation', () => {
  it('returns reduce when below min', () => {
    expect(getRecommendation(44, 45, 90)).toBe('reduce')
    expect(getRecommendation(0, 45, 90)).toBe('reduce')
    expect(getRecommendation(1, 45, 90)).toBe('reduce')
  })

  it('returns keep at exactly min', () => {
    expect(getRecommendation(45, 45, 90)).toBe('keep')
  })

  it('returns keep within range', () => {
    expect(getRecommendation(67, 45, 90)).toBe('keep')
    expect(getRecommendation(90, 45, 90)).toBe('keep')
  })

  it('returns increase above max', () => {
    expect(getRecommendation(91, 45, 90)).toBe('increase')
    expect(getRecommendation(120, 45, 90)).toBe('increase')
  })

  it('respects custom targets', () => {
    expect(getRecommendation(30, 30, 60)).toBe('keep')
    expect(getRecommendation(29, 30, 60)).toBe('reduce')
    expect(getRecommendation(61, 30, 60)).toBe('increase')
  })
})

describe('getNextWeight', () => {
  it('increases by increment when above max', () => {
    expect(getNextWeight(80, 91, 5, 45, 90)).toBe(85)
    expect(getNextWeight(80, 120, 10, 45, 90)).toBe(90)
  })

  it('decreases by increment when below min', () => {
    expect(getNextWeight(80, 44, 5, 45, 90)).toBe(75)
    expect(getNextWeight(80, 0, 5, 45, 90)).toBe(75)
  })

  it('does not decrease below one increment', () => {
    expect(getNextWeight(5, 10, 5, 45, 90)).toBe(5)
    expect(getNextWeight(10, 10, 10, 45, 90)).toBe(10)
  })

  it('keeps weight in target range', () => {
    expect(getNextWeight(80, 67, 5, 45, 90)).toBe(80)
    expect(getNextWeight(80, 45, 5, 45, 90)).toBe(80)
    expect(getNextWeight(80, 90, 5, 45, 90)).toBe(80)
  })
})

describe('getRecommendationText', () => {
  it('returns increase message', () => {
    const text = getRecommendationText('increase', 85, 80)
    expect(text).toContain('85')
    expect(text.toLowerCase()).toContain('increase')
  })

  it('returns reduce message', () => {
    const text = getRecommendationText('reduce', 75, 80)
    expect(text).toContain('75')
    expect(text.toLowerCase()).toContain('reduce')
  })

  it('returns keep message', () => {
    const text = getRecommendationText('keep', 80, 80)
    expect(text.toLowerCase()).toMatch(/keep|beat/)
  })
})

describe('formatSeconds', () => {
  it('shows raw seconds under 60', () => {
    expect(formatSeconds(47)).toBe('47')
    expect(formatSeconds(0)).toBe('0')
  })

  it('formats MM:SS at 60+', () => {
    expect(formatSeconds(60)).toBe('1:00')
    expect(formatSeconds(90)).toBe('1:30')
    expect(formatSeconds(125)).toBe('2:05')
  })
})

describe('selectSessionExercises', () => {
  const exercises = [
    { id: 'a', lastDate: '2026-06-01' },
    { id: 'b', lastDate: null },
    { id: 'c', lastDate: '2026-06-05' },
    { id: 'd', lastDate: '2026-06-03' },
    { id: 'e', lastDate: null },
  ]

  it('selects the requested count', () => {
    expect(selectSessionExercises(exercises, 4)).toHaveLength(4)
  })

  it('puts never-done exercises first', () => {
    const ids = selectSessionExercises(exercises, 4)
    expect(ids[0]).toBe('b')
    expect(ids[1]).toBe('e')
  })

  it('sorts done exercises oldest-first after nulls', () => {
    const ids = selectSessionExercises(exercises, 4)
    expect(ids[2]).toBe('a')
    expect(ids[3]).toBe('d')
  })
})
