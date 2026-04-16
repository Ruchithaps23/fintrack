import { useState, useEffect } from 'react'
import { useCurrency } from '../CurrencyContext'

const CATEGORY_COLORS = {
  food:          '#f7c96f',
  travel:        '#7c6ff7',
  bills:         '#f76f6f',
  clothing:      '#6ff7b8',
  health:        '#6fb8f7',
  entertainment: '#f76fb8',
  shopping:      '#b8f76f',
  other:         '#a0a0b8',
}

const CATEGORY_ICONS = {
  food:          '🍔',
  travel:        '✈️',
  bills:         '🔌',
  clothing:      '👗',
  health:        '💊',
  entertainment: '🎬',
  shopping:      '🛍️',
  other:         '📦',
}

const EXPENSE_CATEGORIES = [
  'food','travel','bills','clothing',
  'health','entertainment','shopping','other'
]

const DEFAULT_BUDGETS = {
  food: 300, travel: 200, bills: 400,
  clothing: 150, health: 100,
  entertainment: 100, shopping: 200, other: 100,
}

function Budget({ byCategory }) {
  const { format } = useCurrency()

  const [budgets, setBudgets]       = useState(() => {
    const saved = localStorage.getItem('fintrack_budgets')
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS
  })
  const [editing, setEditing]       = useState(null)
  const [editVal, setEditVal]       = useState('')
  const [alerts, setAlerts]         = useState([])
  const [dismissed, setDismissed]   = useState([])

  // Check for alerts whenever byCategory or budgets change
  useEffect(() => {
    const newAlerts = []
    EXPENSE_CATEGORIES.forEach(cat => {
      const spent = byCategory[cat] || 0
      const limit = budgets[cat]   || 0
      const pct   = limit > 0 ? (spent / limit) * 100 : 0

      if (pct >= 100 && !dismissed.includes(`over-${cat}`)) {
        newAlerts.push({
          id:      `over-${cat}`,
          type:    'danger',
          icon:    '🚨',
          message: `You've exceeded your ${CATEGORY_ICONS[cat]} ${cat} budget by ${format(spent - limit)}!`,
        })
      } else if (pct >= 80 && pct < 100 && !dismissed.includes(`warn-${cat}`)) {
        newAlerts.push({
          id:      `warn-${cat}`,
          type:    'warning',
          icon:    '⚠️',
          message: `You've used ${pct.toFixed(0)}% of your ${CATEGORY_ICONS[cat]} ${cat} budget. Only ${format(limit - spent)} left!`,
        })
      }
    })
    setAlerts(newAlerts)
  }, [byCategory, budgets, dismissed])

  function dismiss(id) {
    setDismissed(prev => [...prev, id])
  }

  function saveBudget(cat) {
    const val = parseFloat(editVal)
    if (!isNaN(val) && val > 0) {
      const updated = { ...budgets, [cat]: val }
      setBudgets(updated)
      localStorage.setItem('fintrack_budgets', JSON.stringify(updated))
    }
    setEditing(null)
  }

  const totalBudget    = Object.values(budgets).reduce((s, v) => s + v, 0)
  const totalSpent     = Object.values(byCategory).reduce((s, v) => s + v, 0)
  const totalRemaining = totalBudget - totalSpent

  return (
    <div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {alerts.map(alert => (
            <div
              key={alert.id}
              style={{
                ...styles.alert,
                ...(alert.type === 'danger' ? styles.alertDanger : styles.alertWarning)
              }}
            >
              <span style={{ fontSize: '18px' }}>{alert.icon}</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>
                {alert.message}
              </span>
              <button
                style={styles.dismissBtn}
                onClick={() => dismiss(alert.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>💰 Total Budget</p>
          <p style={{ ...styles.summaryValue, color: '#7c6ff7' }}>
            {format(totalBudget)}
          </p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>💸 Total Spent</p>
          <p style={{ ...styles.summaryValue, color: '#ef4444' }}>
            {format(totalSpent)}
          </p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>🏦 Remaining</p>
          <p style={{
            ...styles.summaryValue,
            color: totalRemaining >= 0 ? '#22c55e' : '#ef4444'
          }}>
            {format(totalRemaining)}
          </p>
        </div>
      </div>

      {/* BUDGET CARDS */}
      <div style={styles.grid}>
        {EXPENSE_CATEGORIES.map(cat => {
          const spent     = byCategory[cat] || 0
          const limit     = budgets[cat]    || 0
          const pct       = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
          const remaining = limit - spent
          const over      = spent > limit
          const warning   = !over && pct >= 80

          let barColor = CATEGORY_COLORS[cat]
          if (over)          barColor = '#ef4444'
          else if (warning)  barColor = '#f59e0b'

          return (
            <div key={cat} style={{
              ...styles.card,
              ...(over ? styles.cardOver : warning ? styles.cardWarning : {})
            }}>

              {/* Header */}
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>{CATEGORY_ICONS[cat]}</span>
                <span style={styles.cardName}>{cat}</span>
                {over && (
                  <span style={styles.overBadge}>🚨 Over!</span>
                )}
                {warning && !over && (
                  <span style={styles.warnBadge}>⚠️ 80%+</span>
                )}
              </div>

              {/* Amounts */}
              <div style={styles.amounts}>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>
                  {format(spent)} spent
                </span>
                <span style={{ color: '#6b6b8a' }}>
                  of {format(limit)}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={styles.barWrap}>
                <div style={{
                  ...styles.barFill,
                  width: `${pct}%`,
                  background: barColor,
                }} />
              </div>

              {/* Footer */}
              <div style={styles.cardFooter}>
                <span style={{
                  fontSize: '12px',
                  color: over ? '#ef4444' : warning ? '#f59e0b' : '#22c55e',
                  fontWeight: '600',
                }}>
                  {over
                    ? `${format(Math.abs(remaining))} over budget`
                    : `${format(remaining)} remaining`}
                </span>
                <span style={{ fontSize: '12px', color: '#6b6b8a' }}>
                  {pct.toFixed(0)}%
                </span>
              </div>

              {/* Edit */}
              {editing === cat ? (
                <div style={styles.editRow}>
                  <input
                    style={styles.editInput}
                    type="number"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    placeholder="New limit"
                    autoFocus
                  />
                  <button style={styles.saveBtn} onClick={() => saveBudget(cat)}>
                    Save
                  </button>
                  <button style={styles.cancelBtn} onClick={() => setEditing(null)}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  style={styles.editBtn}
                  onClick={() => { setEditing(cat); setEditVal(budgets[cat]) }}
                >
                  ✏️ Edit Limit
                </button>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}

const styles = {
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid',
  },
  alertDanger: {
    background: '#fff0f0',
    borderColor: '#ffd0d0',
    color: '#ef4444',
  },
  alertWarning: {
    background: '#fffbeb',
    borderColor: '#fde68a',
    color: '#d97706',
  },
  dismissBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b6b8a',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e0e0f0',
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b6b8a',
    marginBottom: '6px',
  },
  summaryValue: {
    fontSize: '26px',
    fontWeight: '800',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '14px',
    padding: '18px',
    border: '1px solid #e0e0f0',
    transition: 'border-color 0.2s',
  },
  cardOver: {
    borderColor: '#ffd0d0',
    background: '#fffafa',
  },
  cardWarning: {
    borderColor: '#fde68a',
    background: '#fffef5',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  cardIcon:  { fontSize: '20px' },
  cardName: {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'capitalize',
    flex: 1,
  },
  overBadge: {
    background: '#fff0f0',
    color: '#ef4444',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '20px',
    border: '1px solid #ffd0d0',
  },
  warnBadge: {
    background: '#fffbeb',
    color: '#d97706',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '20px',
    border: '1px solid #fde68a',
  },
  amounts: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '8px',
  },
  barWrap: {
    height: '8px',
    background: '#f0f0f8',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  editBtn: {
    width: '100%',
    padding: '7px',
    borderRadius: '8px',
    border: '1px solid #e0e0f0',
    background: '#fafafa',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#6b6b8a',
  },
  editRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #e0e0f0',
    fontSize: '13px',
    outline: 'none',
  },
  saveBtn: {
    background: '#7c6ff7',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
  },
  cancelBtn: {
    background: '#f0f0f8',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
  },
}

export default Budget