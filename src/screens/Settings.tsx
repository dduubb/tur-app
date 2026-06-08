import { useRef } from 'react'
import type { AppState, Action } from '../types'
import { exportJSON, parseImport } from '../lib/storage'

type Props = {
  state: AppState
  dispatch: React.Dispatch<Action>
}

export function Settings({ state, dispatch }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    exportJSON(state.exercises, state.sessions)
  }

  const handleImportClick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const { exercises, sessions } = parseImport(ev.target?.result as string)
        if (
          window.confirm(
            `Import ${exercises.length} exercises and ${sessions.length} sessions? This replaces all current data.`
          )
        ) {
          dispatch({ type: 'IMPORT', exercises, sessions })
        }
      } catch (err) {
        alert(`Import failed: ${err instanceof Error ? err.message : 'Invalid file'}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = () => {
    if (
      window.confirm(
        'Clear ALL data? This cannot be undone. Export a backup first.'
      )
    ) {
      dispatch({ type: 'CLEAR' })
    }
  }

  const totalSessions = state.sessions.length
  const totalSets = state.sessions.reduce((n, s) => n + s.entries.length, 0)

  return (
    <div>
      <div className="page-hd">
        <div className="page-title">Settings</div>
      </div>

      <div className="settings-section">
        <div className="settings-label">Stats</div>
        <div
          className="card"
          style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}
        >
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {totalSessions}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Workouts
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {totalSets}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Total sets
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {state.exercises.filter((e) => e.prSeconds != null).length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Exercises with PR
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-label">Data</div>
        <button className="settings-row" onClick={handleExport}>
          <span>Export backup (JSON)</span>
          <span className="settings-row-icon">↓</span>
        </button>
        <button className="settings-row" onClick={handleImportClick}>
          <span>Import backup (JSON)</span>
          <span className="settings-row-icon">↑</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      <div className="settings-section">
        <div className="settings-label" style={{ color: 'var(--danger)' }}>
          Danger Zone
        </div>
        <button className="settings-row danger" onClick={handleClear}>
          <span>Clear all data</span>
          <span className="settings-row-icon">🗑</span>
        </button>
      </div>

      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-faint)',
          fontSize: 12,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        TUR v1.0 · Data stored locally on this device
      </div>
    </div>
  )
}
