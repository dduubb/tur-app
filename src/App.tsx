import { useState } from 'react'
import type { Screen } from './types'
import { useAppState } from './hooks/useAppState'
import { BottomNav } from './components/BottomNav'
import { Today } from './screens/Today'
import { Exercises } from './screens/Exercises'
import { History } from './screens/History'
import { Settings } from './screens/Settings'

export default function App() {
  const [screen, setScreen] = useState<Screen>('today')
  const { state, dispatch, startWorkout } = useAppState()

  return (
    <div className="app">
      <div className="screen">
        {screen === 'today' && (
          <Today state={state} dispatch={dispatch} startWorkout={startWorkout} />
        )}
        {screen === 'exercises' && (
          <Exercises state={state} dispatch={dispatch} />
        )}
        {screen === 'history' && <History state={state} />}
        {screen === 'settings' && (
          <Settings state={state} dispatch={dispatch} />
        )}
      </div>
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}
