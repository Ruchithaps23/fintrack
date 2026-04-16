import { useCurrency } from '../CurrencyContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
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

function Dashboard({ transactions, totalIncome, totalExpenses, savings, byCategory }) {
  const { format } = useCurrency()
  // --- Stat Cards ---
  const stats = [
    { label: 'Total Income',   value: totalIncome,   color: '#22c55e', icon: '💰' },
    { label: 'Total Expenses', value: totalExpenses, color: '#ef4444', icon: '💸' },
    { label: 'Savings',        value: savings,       color: '#7c6ff7', icon: '🏦' },
    { label: 'Transactions',   value: transactions.length, color: '#f7c96f', icon: '📋', noFormat: true },
  ]

  // --- Pie Chart Data (by category) ---
  const pieData = Object.entries(byCategory).map(([name, value]) => ({
    name, value: parseFloat(value.toFixed(2))
  }))

  // --- Bar Chart Data (last 7 transactions grouped by date) ---
  const barMap = {}
  transactions
    .filter(tx => tx.type === 'expense')
    .slice(0, 20)
    .forEach(tx => {
      const date = tx.date
      barMap[date] = (barMap[date] || 0) + tx.amount
    })
  const barData = Object.entries(barMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, amount]) => ({
      date: date.slice(5), // Show MM-DD only
      amount: parseFloat(amount.toFixed(2))
    }))

  // --- Recent Transactions (last 5) ---
  const recent = transactions.slice(0, 5)

  return (
    <div>

      {/* STAT CARDS */}
      <div style={styles.statGrid}>
        {stats.map(stat => (
          <div key={stat.label} style={styles.statCard}>
            <div style={styles.statIcon}>{stat.icon}</div>
            <p style={styles.statLabel}>{stat.label}</p>
            <p style={{ ...styles.statValue, color: stat.color }}>
              {stat.noFormat
                ? stat.value
                : format(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div style={styles.chartRow}>

        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Daily Spending</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b6b8a' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b6b8a' }} />
              <Tooltip
                formatter={(val) => [`$${val}`, 'Spent']}
                contentStyle={{ borderRadius: '10px', border: '1px solid #e0e0f0' }}
              />
              <Bar dataKey="amount" fill="#7c6ff7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Spending by Category</h3>
          {pieData.length === 0 ? (
            <p style={{ color: '#6b6b8a', fontSize: '13px', marginTop: '20px' }}>
              No expense data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name] || '#a0a0b8'}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) =>
                    `${CATEGORY_ICONS[value] || '📦'} ${value}`
                  }
                  iconType="circle"
                  iconSize={8}
                />
                <Tooltip formatter={(val) => `$${val}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* RECENT TRANSACTIONS */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Recent Transactions</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Date', 'Description', 'Category', 'Amount'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(tx => (
              <tr key={tx.id} style={styles.tr}>
                <td style={styles.td}>{tx.date}</td>
                <td style={styles.td}>{tx.description}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    background: (CATEGORY_COLORS[tx.category] || '#a0a0b8') + '22',
                    color: CATEGORY_COLORS[tx.category] || '#a0a0b8',
                  }}>
                    {CATEGORY_ICONS[tx.category] || '📦'} {tx.category}
                  </span>
                </td>
                <td style={{
                  ...styles.td,
                  color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                  fontWeight: '700',
                }}>
                  {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const styles = {
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e0e0f0',
  },
  statIcon: { fontSize: '24px', marginBottom: '8px' },
  statLabel: {
    fontSize: '11px',
    color: '#6b6b8a',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '800',
  },
  chartRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '16px',
    marginBottom: '24px',
  },
  chartCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e0e0f0',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '16px',
  },
  tableCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #e0e0f0',
  },
  tableTitle: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    fontSize: '11px',
    color: '#6b6b8a',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderBottom: '1px solid #e0e0f0',
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    borderBottom: '1px solid #f0f0f8',
  },
  tr: { transition: 'background 0.15s' },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
}

export default Dashboard