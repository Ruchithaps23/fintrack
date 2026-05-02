import { useState } from 'react'

function Settings() {
  const [groqKey, setGroqKey] = useState(
    () => localStorage.getItem('groq_key') || ''
  )
  const [saved, setSaved] = useState(false)

  const txCount = JSON.parse(
    localStorage.getItem('fintrack_transactions') || '[]'
  ).length

  const budgets = localStorage.getItem('fintrack_budgets')

  function saveKey() {
    localStorage.setItem('groq_key', groqKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function exportData() {
    const transactions = JSON.parse(
      localStorage.getItem('fintrack_transactions') || '[]'
    )
    const csv = [
      ['Date', 'Description', 'Category', 'Type', 'Amount'],
      ...transactions.map(tx => [
        tx.date, tx.description, tx.category, tx.type, tx.amount
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'fintrack_transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function resetBudgets() {
    if (window.confirm('Reset all budgets to default?')) {
      localStorage.removeItem('fintrack_budgets')
      window.location.reload()
    }
  }

  return (
    <div style={{ maxWidth: '680px' }}>

      {/* AI SETTINGS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🤖 AI Assistant</h2>
        <div style={styles.row}>
          <div>
            <p style={styles.rowLabel}>Groq API Key</p>
            <p style={styles.rowDesc}>Used to power the AI Assistant chat</p>
          </div>
        </div>
        <div style={styles.keyRow}>
          <input
            style={styles.input}
            type="password"
            placeholder="gsk_..."
            value={groqKey}
            onChange={e => setGroqKey(e.target.value)}
          />
          <button style={styles.btnPrimary} onClick={saveKey}>
            {saved ? '✅ Saved!' : 'Save Key'}
          </button>
        </div>
        <p style={styles.note}>
          🔒 Your key is stored only in your browser. Never sent to any server.
        </p>
      </div>

      {/* DATA */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💾 Your Data</h2>

        <div style={styles.row}>
          <div>
            <p style={styles.rowLabel}>Transactions</p>
            <p style={styles.rowDesc}>
              {txCount} transactions stored in your browser
            </p>
          </div>
          <button style={styles.btnSuccess} onClick={exportData}>
            📥 Export CSV
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.row}>
          <div>
            <p style={styles.rowLabel}>Budget Limits</p>
            <p style={styles.rowDesc}>
              {budgets ? 'Custom budgets saved' : 'Using default budgets'}
            </p>
          </div>
          <button style={styles.btnWarning} onClick={resetBudgets}>
            Reset Budgets
          </button>
        </div>
      </div>

      {/* ABOUT */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>ℹ️ About</h2>
        <div style={styles.aboutGrid}>
          {[
            ['App',        'FinTrack'],
            ['Version',    '1.0.0'],
            ['Built with', 'React + Vite'],
            ['AI',         'Groq (LLaMA 3.1)'],
            ['Storage',    'Browser localStorage'],
            ['Data Policy','All data stays in your browser'],
          ].map(([key, val]) => (
            <div key={key} style={styles.aboutRow}>
              <span style={styles.aboutKey}>{key}</span>
              <span style={styles.aboutVal}>{val}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

const styles = {
  section: {
    background: '#fff',
    borderRadius: '14px',
    padding: '22px',
    border: '1px solid #e0e0f0',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 0',
  },
  rowLabel: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '2px',
  },
  rowDesc: {
    fontSize: '12px',
    color: '#6b6b8a',
  },
  divider: {
    height: '1px',
    background: '#f0f0f8',
    margin: '10px 0',
  },
  keyRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    marginBottom: '8px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e0e0f0',
    fontSize: '14px',
    outline: 'none',
    background: '#fafafa',
  },
  note: {
    fontSize: '12px',
    color: '#6b6b8a',
  },
  btnPrimary: {
    background: '#7c6ff7',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  btnSuccess: {
    background: '#f0fdf4',
    color: '#22c55e',
    border: '1px solid #bbf7d0',
    padding: '8px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  btnWarning: {
    background: '#fffbeb',
    color: '#f59e0b',
    border: '1px solid #fde68a',
    padding: '8px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  aboutGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  aboutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f8',
  },
  aboutKey: {
    color: '#6b6b8a',
    fontWeight: '600',
  },
  aboutVal: {
    fontWeight: '600',
  },
}

export default Settings