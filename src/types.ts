export type Recommendation = 'reduce' | 'keep' | 'increase'

export type Exercise = {
  id: string
  name: string
  weight: number
  lastSeconds: number | null
  prSeconds: number | null
  targetSecondsMin: number
  targetSecondsMax: number
  increment: number
  lastDate: string | null
}

export type WorkoutEntry = {
  exerciseId: string
  exerciseName: string
  weight: number
  seconds: number
  isNewPR: boolean
  recommendation: Recommendation
}

export type WorkoutSession = {
  id: string
  date: string
  entries: WorkoutEntry[]
}

export type TimerState = 'idle' | 'running' | 'stopped'

export type ActiveSession = {
  id: string
  date: string
  exerciseQueue: string[]
  currentIndex: number
  timerState: TimerState
  timerStart: number | null
  timerSeconds: number
  entries: WorkoutEntry[]
}

export type AppState = {
  exercises: Exercise[]
  sessions: WorkoutSession[]
  activeSession: ActiveSession | null
}

export type Screen = 'today' | 'exercises' | 'history' | 'settings'

export type Action =
  | { type: 'START_SESSION'; exerciseIds: string[] }
  | { type: 'START_TIMER' }
  | { type: 'STOP_TIMER'; seconds: number }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'SKIP_EXERCISE' }
  | { type: 'FINISH_SESSION' }
  | { type: 'CANCEL_SESSION' }
  | { type: 'UPDATE_EXERCISE'; exercise: Exercise }
  | { type: 'RESET_PR'; exerciseId: string }
  | { type: 'IMPORT'; exercises: Exercise[]; sessions: WorkoutSession[] }
  | { type: 'CLEAR' }
