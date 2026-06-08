import { useReducer, useEffect } from 'react'
import type { AppState, Action, ActiveSession } from '../types'
import { DEFAULT_EXERCISES } from '../data/defaultExercises'
import { loadState, saveState } from '../lib/storage'
import { getRecommendation, getNextWeight, todayISO, selectSessionExercises } from '../lib/progression'

const INITIAL_STATE: AppState = {
  exercises: DEFAULT_EXERCISES.map((e) => ({ ...e })),
  sessions: [],
  activeSession: null,
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_SESSION': {
      const session: ActiveSession = {
        id: Date.now().toString(),
        date: todayISO(),
        exerciseQueue: action.exerciseIds,
        currentIndex: 0,
        timerState: 'idle',
        timerStart: null,
        timerSeconds: 0,
        entries: [],
      }
      return { ...state, activeSession: session }
    }

    case 'START_TIMER': {
      const { activeSession } = state
      if (!activeSession) return state
      return {
        ...state,
        activeSession: {
          ...activeSession,
          timerState: 'running',
          timerStart: Date.now(),
          timerSeconds: 0,
        },
      }
    }

    case 'STOP_TIMER': {
      const { activeSession } = state
      if (!activeSession) return state
      return {
        ...state,
        activeSession: {
          ...activeSession,
          timerState: 'stopped',
          timerSeconds: action.seconds,
        },
      }
    }

    case 'NEXT_EXERCISE': {
      const { activeSession, exercises } = state
      if (!activeSession || activeSession.timerState !== 'stopped') return state

      const seconds = activeSession.timerSeconds
      const exerciseId = activeSession.exerciseQueue[activeSession.currentIndex]
      const exercise = exercises.find((e) => e.id === exerciseId)
      if (!exercise) return state

      const isNewPR = seconds > (exercise.prSeconds ?? 0)
      const rec = getRecommendation(seconds, exercise.targetSecondsMin, exercise.targetSecondsMax)
      const nextWeight = getNextWeight(
        exercise.weight,
        seconds,
        exercise.increment,
        exercise.targetSecondsMin,
        exercise.targetSecondsMax
      )

      return {
        ...state,
        exercises: exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                lastSeconds: seconds,
                prSeconds: isNewPR ? seconds : e.prSeconds,
                lastDate: activeSession.date,
                weight: nextWeight,
              }
            : e
        ),
        activeSession: {
          ...activeSession,
          currentIndex: activeSession.currentIndex + 1,
          timerState: 'idle',
          timerStart: null,
          timerSeconds: 0,
          entries: [
            ...activeSession.entries,
            {
              exerciseId,
              exerciseName: exercise.name,
              weight: exercise.weight,
              seconds,
              isNewPR,
              recommendation: rec,
            },
          ],
        },
      }
    }

    case 'SKIP_EXERCISE': {
      const { activeSession } = state
      if (!activeSession) return state
      return {
        ...state,
        activeSession: {
          ...activeSession,
          currentIndex: activeSession.currentIndex + 1,
          timerState: 'idle',
          timerStart: null,
          timerSeconds: 0,
        },
      }
    }

    case 'FINISH_SESSION': {
      const { activeSession } = state
      if (!activeSession) return state
      if (activeSession.entries.length === 0) {
        return { ...state, activeSession: null }
      }
      return {
        ...state,
        sessions: [
          { id: activeSession.id, date: activeSession.date, entries: activeSession.entries },
          ...state.sessions,
        ],
        activeSession: null,
      }
    }

    case 'CANCEL_SESSION':
      return { ...state, activeSession: null }

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.id === action.exercise.id ? action.exercise : e
        ),
      }

    case 'RESET_PR':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.id === action.exerciseId ? { ...e, prSeconds: null } : e
        ),
      }

    case 'IMPORT':
      return {
        ...state,
        exercises: action.exercises,
        sessions: action.sessions,
        activeSession: null,
      }

    case 'CLEAR':
      return {
        exercises: DEFAULT_EXERCISES.map((e) => ({ ...e })),
        sessions: [],
        activeSession: null,
      }

    default:
      return state
  }
}

function hydrateState(): AppState {
  const saved = loadState()
  let activeSession = saved.activeSession ?? null

  // If timer was running when app was closed, freeze it at elapsed seconds
  if (activeSession?.timerState === 'running' && activeSession.timerStart) {
    const elapsed = Math.floor((Date.now() - activeSession.timerStart) / 1000)
    activeSession = { ...activeSession, timerState: 'stopped', timerSeconds: elapsed }
  }

  return {
    exercises: saved.exercises ?? INITIAL_STATE.exercises,
    sessions: saved.sessions ?? INITIAL_STATE.sessions,
    activeSession,
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, undefined, hydrateState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const startWorkout = () => {
    const ids = selectSessionExercises(state.exercises)
    dispatch({ type: 'START_SESSION', exerciseIds: ids })
  }

  return { state, dispatch, startWorkout }
}
