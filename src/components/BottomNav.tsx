import type { Screen } from '../types'

type Props = {
  active: Screen
  onChange: (s: Screen) => void
}

const ITEMS: { id: Screen; icon: string; label: string }[] = [
  { id: 'today', icon: '⏱', label: 'Today' },
  { id: 'exercises', icon: '📋', label: 'Library' },
  { id: 'history', icon: '📅', label: 'History' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="nav" aria-label="Main navigation">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-btn${active === item.id ? ' active' : ''}`}
          onClick={() => onChange(item.id)}
          aria-current={active === item.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
