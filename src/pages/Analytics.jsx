import { useCurrency } from '../CurrencyContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const CATEGORY_COLORS = {
  food:          '#f7c96f',
  travel:        '#7c6ff7',
  bills:         '#f76f6f',
  clothing:      '#6ff7b8',
  health:        '#6fb8f7',
  entertainment: '#f76fb8',
  shopping:      '#b8f76f',
  income:        '#22c55e',
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
  income:        '💰',
  other:         '📦',
}

function Analytics({ transactions, totalIncome, totalExpenses, savings, byCategory }) {
  const { format } = useCurrency()
  // --- Income vs Expenses by month ---
  const monthMap = {}
  transactions.forEach(tx => {
    const month = tx.date.slice(0, 7) // YYYY-MM
    if (!monthMap[month]) monthMap[month] = { month, income: 0, expenses: 0 }
    if (tx.type === 'income')  monthMap[month].income   += tx.amount
    if (tx.type === 'expense') monthMap[month].expenses += tx.amount
  })
  const monthlyData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      ...m,
      month:    m.month.slice(5), // Show MM only
      income:   parseFloat(m.income.toFixed(2)),
      expenses: parseFloat(m.expenses.toFixed(2)),
      savings:  parseFloat((m.income - m.expenses).toFixed(2)),
    }))

  // --- Top spending categories ---
  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)

  // --- Savings rate ---
  const savingsRate = totalIncome > 0
    ? ((savings / totalIncome) * 100).toFixed(1)
    : 0

  // --- Biggest expense ---
  const biggest = transactions
    .filter(tx => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0]

  // --- Most frequent category ---
  const freqMap = {}
  transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => { freqMap[tx.category] = (freqMap[tx.category] || 0) + 1 })
  const topCategory = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div>

      {/* INSIGHT CARDS */}
      <div style={styles.insightGrid}>
        <div style={styles.insightCard}>
          <p style={styles.insightLabel}>💡 Savings Rate</p>
          <p style={{ ...styles.insightValue, color: savingsRate >= 20 ? '#22c55e' : '#f7c96f' }}>
            {savingsRate}%
          </p>
          <p style={styles.insightSub}>
            {savingsRate >= 20 ? 'Great job! Above 20% target.' : 'Aim for 20% or more.'}
          </p>
        </div>
        <div style={styles.insightCard}>
          <p style={styles.insightLabel}>📈 Net Savings</p>
          <p style={{ ...styles.insightValue, color: savings >= 0 ? '#22c55e' : '#ef4444' }}>
            format(savings)
          </p>
          <p style={styles.insightSub}>Income minus all expenses</p>
        </div>
        <div style={styles.insightCard}>
          <p style={styles.insightLabel}>💸 Biggest Expense</p>
          <p style={{ ...styles.insightValue, color: '#ef4444' }}>
            {biggest ? format(biggest.amount) : 'N/A'}
          </p>
          <p style={styles.insightSub}>{biggest ? biggest.description : 'No expenses yet'}</p>
        </div>
        <div style={styles.insightCard}>
          <p style={styles.insightLabel}>🔁 Top Category</p>
          <p style={{ ...styles.insightValue, color: '#7c6ff7' }}>
            {topCategory ? `${CATEGORY_ICONS[topCategory[0]]} ${topCategory[0]}` : 'N/A'}
          </p>
          <p style={styles.insightSub}>
            {topCategory ? `${topCategory[1]} transactions` : 'No data yet'}
          </p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={styles.chartRow}>

        {/* Monthly Income vs Expenses */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Income vs Expenses</h3>
          {monthlyData.length === 0 ? (
            <p style={styles.noData}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b6b8a' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b6b8a' }} />
                <Tooltip
                  formatter={(val) => format(val)}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e0e0f0' }}
                />
                <Legend />
                <Bar dataKey="income"   fill="#22c55e" radius={[4,4,0,0]} name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Savings Trend */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Savings Trend</h3>
          {monthlyData.length === 0 ? (
            <p style={styles.noData}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b6b8a' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b6b8a' }} />
                <Tooltip
                  formatter={(val) => format(val)}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e0e0f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#7c6ff7"
                  strokeWidth={3}
                  dot={{ fill: '#7c6ff7', r: 5 }}
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* CATEGORY BREAKDOWN */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Spending Breakdown by Category</h3>
        {categoryData.length === 0 ? (
          <p style={styles.noData}>No expense data yet.</p>
        ) : (
          <div>
            {categoryData.map(cat => {
              const pct = totalExpenses > 0
                ? ((cat.value / totalExpenses) * 100).toFixed(1)
                : 0
              return (
                <div key={cat.name} style={styles.catRow}>
                  <div style={styles.catLeft}>
                    <span style={styles.catIcon}>
                      {CATEGORY_ICONS[cat.name] || '📦'}
                    </span>
                    <span style={styles.catName}>{cat.name}</span>
                  </div>
                  <div style={styles.barWrap}>
                    <div style={{
                      ...styles.barFill,
                      width: `${pct}%`,
                      background: CATEGORY_COLORS[cat.name] || '#a0a0b8',
                    }} />
                  </div>
                  <div style={styles.catRight}>
                    <span style={styles.catPct}>{pct}%</span>
                    <span style={styles.catAmt}>{format(cat.value)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

const styles = {
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  insightCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e0e0f0',
  },
  insightLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b6b8a',
    marginBottom: '6px',
  },
  insightValue: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '4px',
    textTransform: 'capitalize',
  },
  insightSub: {
    fontSize: '11px',
    color: '#6b6b8a',
  },
  chartRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  chartCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e0e0f0',
    marginBottom: '16px',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  noData: {
    color: '#6b6b8a',
    fontSize: '13px',
  },
  catRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  catLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '120px',
  },
  catIcon: { fontSize: '16px' },
  catName: {
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  barWrap: {
    flex: 1,
    height: '10px',
    background: '#f0f0f8',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.5s ease',
  },
  catRight: {
    display: 'flex',
    gap: '12px',
    width: '100px',
    justifyContent: 'flex-end',
  },
  catPct: {
    fontSize: '12px',
    color: '#6b6b8a',
    fontWeight: '600',
  },
  catAmt: {
    fontSize: '13px',
    fontWeight: '700',
  },
}

export default Analytics