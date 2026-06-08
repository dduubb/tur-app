import type { AppState } from '../types'
import { formatDate } from '../lib/progression'

type Props = { state: AppState }

export function History({ state }: Props) {
  const { sessions } = state

  return (
    <div>
      <div className="page-hd">
        <div className="page-title">History</div>
        <div className="page-sub">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</div>
      </div>

      {sessions.length === 0 ? (
        <div className="history-empty">
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          No sessions yet.
          <br />
          Complete a workout to see it here.
        </div>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="session-group">
            <div className="session-date-hd">{formatDate(session.date)}</div>
            {session.entries.map((entry) => (
              <div key={entry.exerciseId} className="history-row">
                <div>
                  <div className="history-exercise">{entry.exerciseName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                    {entry.weight} lbs
                  </div>
                </div>
                <div className="history-right">
                  <span>
                    {entry.seconds}
                    <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>
                      s
                    </span>
                  </span>
                  {entry.isNewPR && (
                    <span className="pr-star" title="Personal Record">
                      ★
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
