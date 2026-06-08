import { useState } from 'react'
import type { AppState, Action, Exercise } from '../types'

type Props = {
  state: AppState
  dispatch: React.Dispatch<Action>
}

type EditState = {
  exercise: Exercise
  open: boolean
}

export function Exercises({ state, dispatch }: Props) {
  const { exercises } = state
  const [edit, setEdit] = useState<EditState>({ exercise: exercises[0], open: false })

  const openEdit = (ex: Exercise) => setEdit({ exercise: { ...ex }, open: true })
  const closeEdit = () => setEdit((e) => ({ ...e, open: false }))

  const handleSave = () => {
    dispatch({ type: 'UPDATE_EXERCISE', exercise: edit.exercise })
    closeEdit()
  }

  const handleResetPR = () => {
    if (window.confirm(`Reset PR for ${edit.exercise.name}?`)) {
      dispatch({ type: 'RESET_PR', exerciseId: edit.exercise.id })
      closeEdit()
    }
  }

  const update = (field: keyof Exercise, raw: string) => {
    const numFields: (keyof Exercise)[] = [
      'weight',
      'increment',
      'targetSecondsMin',
      'targetSecondsMax',
    ]
    const value: string | number = numFields.includes(field)
      ? (parseFloat(raw) || 0)
      : raw
    setEdit((prev) => ({
      ...prev,
      exercise: { ...prev.exercise, [field]: value },
    }))
  }

  return (
    <div>
      <div className="page-hd">
        <div className="page-title">Library</div>
        <div className="page-sub">{exercises.length} exercises</div>
      </div>

      <div className="exercise-list">
        {exercises.map((ex) => (
          <div key={ex.id} className="ex-card">
            <div className="ex-card-top">
              <span className="ex-card-name">{ex.name}</span>
              <button
                className="ex-card-edit"
                onClick={() => openEdit(ex)}
                aria-label={`Edit ${ex.name}`}
              >
                Edit
              </button>
            </div>
            <div className="ex-card-stats">
              <span className="ex-stat">
                Weight: <strong>{ex.weight} lbs</strong>
              </span>
              <span className="ex-stat">
                PR:{' '}
                <strong>
                  {ex.prSeconds != null ? `${ex.prSeconds}s` : '—'}
                </strong>
              </span>
              <span className="ex-stat">
                Last:{' '}
                <strong>
                  {ex.lastSeconds != null ? `${ex.lastSeconds}s` : '—'}
                </strong>
              </span>
              <span className="ex-stat">
                +{ex.increment} lbs / step
              </span>
            </div>
          </div>
        ))}
      </div>

      {edit.open && (
        <div
          className="sheet-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Edit exercise"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit()
          }}
        >
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">Edit — {edit.exercise.name}</div>

            <div className="field">
              <label className="field-label" htmlFor="edit-name">
                Name
              </label>
              <input
                id="edit-name"
                name="name"
                className="field-input"
                type="text"
                value={edit.exercise.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="edit-weight">
                  Weight (lbs)
                </label>
                <input
                  id="edit-weight"
                  name="weight"
                  className="field-input"
                  type="number"
                  inputMode="decimal"
                  value={edit.exercise.weight}
                  onChange={(e) => update('weight', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edit-increment">
                  Increment (lbs)
                </label>
                <input
                  id="edit-increment"
                  name="increment"
                  className="field-input"
                  type="number"
                  inputMode="decimal"
                  value={edit.exercise.increment}
                  onChange={(e) => update('increment', e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="edit-target-min">
                  Target min (sec)
                </label>
                <input
                  id="edit-target-min"
                  className="field-input"
                  type="number"
                  inputMode="numeric"
                  value={edit.exercise.targetSecondsMin}
                  onChange={(e) => update('targetSecondsMin', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edit-target-max">
                  Target max (sec)
                </label>
                <input
                  id="edit-target-max"
                  className="field-input"
                  type="number"
                  inputMode="numeric"
                  value={edit.exercise.targetSecondsMax}
                  onChange={(e) => update('targetSecondsMax', e.target.value)}
                />
              </div>
            </div>

            <div className="sheet-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              {edit.exercise.prSeconds != null && (
                <button
                  className="btn btn-sm btn-danger-ghost"
                  onClick={handleResetPR}
                >
                  Reset PR
                </button>
              )}
              <button className="btn btn-link btn-sm" onClick={closeEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
