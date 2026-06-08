import { useEffect, useRef, useState } from 'react'
import type { AppState, Action } from '../types'
import {
  getRecommendation,
  getNextWeight,
  getRecommendationText,
  formatDate,
  selectSessionExercises,
  todayISO,
} from '../lib/progression'

type Props = {
  state: AppState
  dispatch: React.Dispatch<Action>
  startWorkout: () => void
}

export function Today({ state, dispatch, startWorkout }: Props) {
  const { activeSession, exercises } = state

  // ── Timer display (local state only) ──────────────────────
  const [displaySec, setDisplaySec] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (activeSession?.timerState === 'running' && activeSession.timerStart) {
      const start = activeSession.timerStart
      setDisplaySec(Math.floor((Date.now() - start) / 1000))
      intervalRef.current = setInterval(() => {
        setDisplaySec(Math.floor((Date.now() - start) / 1000))
      }, 200)
    } else {
      clearInterval(intervalRef.current)
      if (activeSession?.timerState === 'stopped') {
        setDisplaySec(activeSession.timerSeconds)
      }
    }
    return () => clearInterval(intervalRef.current)
  }, [activeSession?.timerState, activeSession?.timerStart, activeSession?.timerSeconds])

  const handleStop = () => {
    const seconds = Math.floor(
      (Date.now() - (activeSession?.timerStart ?? Date.now())) / 1000
    )
    dispatch({ type: 'STOP_TIMER', seconds })
  }

  const handleCancel = () => {
    if (window.confirm('Cancel this workout? Progress will be lost.')) {
      dispatch({ type: 'CANCEL_SESSION' })
    }
  }

  // ── No active session ──────────────────────────────────────
  if (!activeSession) {
    const upcoming = selectSessionExercises(exercises).map(
      (id) => exercises.find((e) => e.id === id)!
    )
    const today = todayISO()

    return (
      <div>
        <div className="page-hd">
          <div className="page-title">TUR</div>
          <div className="page-sub">
            {formatDate(today)} · Time Under Resistance
          </div>
        </div>

        <div className="section-label" style={{ marginBottom: 10 }}>
          Today's plan
        </div>

        <div className="upcoming-list" style={{ marginBottom: 32 }}>
          {upcoming.map((ex) => (
            <div key={ex.id} className="upcoming-item">
              <span className="upcoming-name">{ex.name}</span>
              <div className="upcoming-meta">
                <div style={{ fontWeight: 600 }}>{ex.weight} lbs</div>
                {ex.prSeconds ? (
                  <div style={{ fontSize: 12, color: 'var(--pr-color)' }}>
                    PR {ex.prSeconds}s
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    No PR yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={startWorkout}>
          Start Workout
        </button>
      </div>
    )
  }

  const { exerciseQueue, currentIndex, timerState } = activeSession

  // ── Session complete ───────────────────────────────────────
  if (currentIndex >= exerciseQueue.length) {
    return (
      <div>
        <div className="complete-icon">💪</div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          Workout Complete
        </div>
        <div
          style={{
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          {activeSession.entries.length} exercise
          {activeSession.entries.length !== 1 ? 's' : ''} done
        </div>

        <div className="session-summary">
          {activeSession.entries.map((entry) => (
            <div key={entry.exerciseId} className="summary-row">
              <span className="summary-name">{entry.exerciseName}</span>
              <div className="summary-right">
                <span>
                  {entry.seconds}
                  <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>
                    s
                  </span>
                </span>
                {entry.isNewPR && (
                  <span className="pr-star" title="New PR">
                    ★
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'FINISH_SESSION' })}
        >
          Done
        </button>
      </div>
    )
  }

  const exerciseId = exerciseQueue[currentIndex]
  const exercise = exercises.find((e) => e.id === exerciseId)!

  // ── Timer running ──────────────────────────────────────────
  if (timerState === 'running') {
    return (
      <div className="timer-screen">
        <div className="timer-exercise-label">{exercise.name}</div>
        <div className="timer-weight-label">{exercise.weight} lbs</div>

        <div
          className="timer-digits"
          aria-live="polite"
          aria-label={`${displaySec} seconds`}
        >
          {displaySec}
        </div>
        <div className="timer-unit">seconds</div>

        <div className="timer-stop-area">
          <button className="btn btn-danger" onClick={handleStop}>
            Stop
          </button>
        </div>
      </div>
    )
  }

  // ── Set result ─────────────────────────────────────────────
  if (timerState === 'stopped') {
    const seconds = activeSession.timerSeconds
    const isNewPR = seconds > (exercise.prSeconds ?? 0)
    const rec = getRecommendation(
      seconds,
      exercise.targetSecondsMin,
      exercise.targetSecondsMax
    )
    const nextWeight = getNextWeight(
      exercise.weight,
      seconds,
      exercise.increment,
      exercise.targetSecondsMin,
      exercise.targetSecondsMax
    )
    const recText = getRecommendationText(rec, nextWeight, exercise.weight)
    const isLast = currentIndex === exerciseQueue.length - 1

    return (
      <div className="result-screen">
        <div className="exercise-header" style={{ paddingTop: 20, paddingBottom: 16 }}>
          <div>
            <div
              style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}
            >
              {exercise.name}
            </div>
            <div
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}
            >
              {exercise.weight} lbs
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {currentIndex + 1} of {exerciseQueue.length}
          </div>
        </div>

        {isNewPR && (
          <div className="result-new-pr">★ New Personal Record!</div>
        )}

        <div className="result-seconds" aria-label={`${seconds} seconds`}>
          {seconds}
        </div>
        <div className="result-unit">seconds</div>

        {exercise.prSeconds && !isNewPR && (
          <div
            style={{
              fontSize: 14,
              color: 'var(--text-dim)',
              marginTop: 8,
            }}
          >
            PR: {exercise.prSeconds}s
          </div>
        )}

        <div className={`result-rec ${rec}`}>{recText}</div>

        <div className="stack gap-12" style={{ marginTop: 28 }}>
          <button
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'NEXT_EXERCISE' })}
          >
            {isLast ? 'Finish Workout' : 'Next Exercise'}
          </button>
        </div>
      </div>
    )
  }

  // ── Exercise intro (timerState === 'idle') ─────────────────
  return (
    <div>
      <div className="exercise-header">
        <span className="exercise-progress">
          {currentIndex + 1} of {exerciseQueue.length}
        </span>
        <button
          className="exercise-cancel"
          onClick={handleCancel}
          aria-label="Cancel workout"
        >
          Cancel
        </button>
      </div>

      <div className="exercise-name">{exercise.name}</div>
      <div className="exercise-weight">{exercise.weight} lbs</div>

      <div className="exercise-stats">
        <div className="stat-block">
          <span className="stat-label">Last</span>
          <span className="stat-value">
            {exercise.lastSeconds != null ? `${exercise.lastSeconds}s` : '—'}
          </span>
        </div>
        <div className="stat-block">
          <span className="stat-label">PR</span>
          <span className={`stat-value${exercise.prSeconds ? ' pr' : ''}`}>
            {exercise.prSeconds != null ? `${exercise.prSeconds}s` : '—'}
          </span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Target</span>
          <span className="stat-value">
            {exercise.targetSecondsMin}–{exercise.targetSecondsMax}s
          </span>
        </div>
      </div>

      <div style={{ marginTop: 40 }} className="stack gap-12">
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'START_TIMER' })}
        >
          Start Timer
        </button>
        <button
          className="btn btn-link"
          onClick={() => dispatch({ type: 'SKIP_EXERCISE' })}
        >
          Skip this exercise
        </button>
      </div>
    </div>
  )
}
