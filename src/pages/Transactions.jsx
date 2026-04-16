import { useState, useRef } from 'react'
import { useCurrency } from '../CurrencyContext'

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

const CATEGORIES = ['food','travel','bills','clothing','health','entertainment','shopping','income','other']

// Empty form state
const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: '',
  type: 'expense',
  category: 'food',
}

function Transactions({ transactions, addTransaction}) {
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('all')
  const [importing, setImporting]   = useState(false)
  const fileInputRef                = useRef(null)
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const { format } = useCurrency()

  // Filter logic
  const filtered = transactions.filter(tx => {
  const matchSearch  = tx.description.toLowerCase().includes(search.toLowerCase())
  const matchCat     = catFilter === 'all' || tx.category === catFilter
  const matchFrom    = !dateFrom || tx.date >= dateFrom
  const matchTo      = !dateTo   || tx.date <= dateTo
  return matchSearch && matchCat && matchFrom && matchTo
})

  // Handle form field changes
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Save transaction
  function handleSave() {
    if (!form.description.trim()) return setError('Please enter a description.')
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError('Please enter a valid amount.')
    if (!form.date) return setError('Please select a date.')

    addTransaction({
      ...form,
      amount: parseFloat(Number(form.amount).toFixed(2)),
    })

    setForm(emptyForm)
    setError('')
    setShowModal(false)
  }

  // Confirm delete
  function handleCSVImport(e) {
  const file = e.target.files[0]
  if (!file) return

  setImporting(true)
  const reader = new FileReader()

  reader.onload = (event) => {
    const text  = event.target.result
    const lines = text.trim().split('\n')

    // Remove header row if it exists
    const dataLines = lines.filter(line => {
      const lower = line.toLowerCase()
      return !lower.startsWith('date') && line.trim() !== ''
    })

    let successCount = 0
    let skipCount    = 0

    dataLines.forEach(line => {
      // Handle both comma and semicolon separators
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(c => c.replace(/"/g, '').trim())

      if (cols.length < 3) { skipCount++; return }

      const date   = cols[0]
      const desc   = cols[1]
      const amount = parseFloat(cols[2].replace(/[^0-9.-]/g, ''))

      if (!date || !desc || isNaN(amount)) { skipCount++; return }

      // Auto detect type from amount sign
      const type = amount >= 0 ? 'income' : 'expense'

      // Auto categorize by keyword matching
      const descLower = desc.toLowerCase()
      let category = 'other'
      if (/uber|lyft|taxi|flight|airline|train|bus|metro/.test(descLower))   category = 'travel'
      else if (/food|restaurant|cafe|coffee|pizza|burger|eat|swiggy|zomato/.test(descLower)) category = 'food'
      else if (/netflix|spotify|amazon prime|youtube|game|cinema|movie/.test(descLower))     category = 'entertainment'
      else if (/electric|water|internet|phone|bill|utility|rent/.test(descLower))            category = 'bills'
      else if (/shirt|shoes|cloth|fashion|h&m|zara|nike|dress/.test(descLower))              category = 'clothing'
      else if (/hospital|doctor|pharma|medicine|health|clinic/.test(descLower))              category = 'health'
      else if (/amazon|shop|mall|store|purchase|order/.test(descLower))                      category = 'shopping'
      else if (/salary|income|deposit|credit|bonus|refund/.test(descLower))                  category = 'income'

      addTransaction({
        date,
        description: desc,
        amount:      Math.abs(amount),
        type,
        category,
      })
      successCount++
    })

    setImporting(false)
    fileInputRef.current.value = ''
    alert(`✅ Imported ${successCount} transactions${skipCount > 0 ? `, skipped ${skipCount} invalid rows` : ''}!`)
  }

  reader.onerror = () => {
    setImporting(false)
    alert('❌ Failed to read file. Please try again.')
  }

  reader.readAsText(file)
}

  return (
    <div>

      {/* TOP BAR */}
      <div style={styles.topBar}>
  <input
  style={styles.search}
  placeholder="🔍  Search transactions…"
  value={search}
  onChange={e => setSearch(e.target.value)}
/>
<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  <input
    style={styles.dateInput}
    type="date"
    value={dateFrom}
    onChange={e => setDateFrom(e.target.value)}
    title="From date"
  />
  <span style={{ color: '#6b6b8a', fontSize: '13px' }}>→</span>
  <input
    style={styles.dateInput}
    type="date"
    value={dateTo}
    onChange={e => setDateTo(e.target.value)}
    title="To date"
  />
  {(dateFrom || dateTo) && (
    <button
      style={styles.clearDateBtn}
      onClick={() => { setDateFrom(''); setDateTo('') }}
    >
      ✕ Clear
    </button>
  )}
</div>
  <div style={{ display: 'flex', gap: '10px' }}>
    {/* Hidden file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      style={{ display: 'none' }}
      onChange={handleCSVImport}
    />
    <button
      style={styles.btnSuccess}
      onClick={() => fileInputRef.current.click()}
      disabled={importing}
    >
      {importing ? '⏳ Importing…' : '📂 Import CSV'}
    </button>
  </div>
</div>

      {/* CATEGORY FILTERS */}
      <div style={styles.filterBar}>
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            style={{
              ...styles.filterBtn,
              ...(catFilter === cat ? styles.filterBtnActive : {})
            }}
          >
            {cat === 'all' ? '📋 All' : `${CATEGORY_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '36px' }}>📭</p>
            <p style={{ fontWeight: '700', marginTop: '8px' }}>No transactions found</p>
            <p style={{ fontSize: '13px', color: '#6b6b8a', marginTop: '4px' }}>
              Try a different filter or add a new transaction.
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Date', 'Description', 'Category', 'Type', 'Amount'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} style={styles.row}>
                  <td style={styles.td}>{tx.date}</td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>{tx.description}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: (CATEGORY_COLORS[tx.category] || '#a0a0b8') + '22',
                      color: CATEGORY_COLORS[tx.category] || '#a0a0b8',
                    }}>
                      {CATEGORY_ICONS[tx.category] || '📦'} {tx.category}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: tx.type === 'income' ? '#22c55e22' : '#ef444422',
                      color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{
                    ...styles.td,
                    fontWeight: '700',
                    color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add Transaction</h2>

            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  style={styles.input}
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select
                  style={styles.input}
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input
                style={styles.input}
                type="text"
                name="description"
                placeholder="e.g. Uber ride, Netflix…"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount ($)</label>
                <input
                  style={styles.input}
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.input}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.btnGhost}
                onClick={() => { setShowModal(false); setError('') }}
              >
                Cancel
              </button>
              <button style={styles.btnPrimary} onClick={handleSave}>
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating open-modal trigger (used by App.jsx) */}
      <button
        id="openAddModal"
        style={{ display: 'none' }}
        onClick={() => setShowModal(true)}
      />
    </div>
  )
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    gap: '12px',
  },
  search: {
    background: '#fff',
    border: '1px solid #e0e0f0',
    borderRadius: '10px',
    padding: '9px 14px',
    fontSize: '13px',
    width: '260px',
    outline: 'none',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #e0e0f0',
    background: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'capitalize',
    color: '#6b6b8a',
  },
  filterBtnActive: {
    background: '#7c6ff7',
    color: '#fff',
    border: '1px solid #7c6ff7',
  },
  tableCard: {
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid #e0e0f0',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid #e0e0f0',
  },
  tableTitle: {
    fontSize: '14px',
    fontWeight: '700',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px 16px',
    fontSize: '11px',
    color: '#6b6b8a',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderBottom: '1px solid #e0e0f0',
    background: '#fafafa',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    borderBottom: '1px solid #f0f0f8',
  },
  row: {
    transition: 'background 0.15s',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#1a1a2e',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#fff',
    borderRadius: '18px',
    padding: '28px',
    width: '480px',
    maxWidth: '95vw',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '14px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b6b8a',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e0e0f0',
    fontSize: '14px',
    outline: 'none',
    background: '#fafafa',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  btnPrimary: {
    background: '#7c6ff7',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  btnGhost: {
    background: '#f0f0f8',
    color: '#1a1a2e',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  btnDanger: {
    background: '#fff0f0',
    color: '#ef4444',
    border: '1px solid #ffd0d0',
    padding: '9px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
  },
  errorBox: {
    background: '#fff0f0',
    border: '1px solid #ffd0d0',
    color: '#ef4444',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  btnSuccess: {
  background: '#f0fdf4',
  color: '#22c55e',
  border: '1px solid #bbf7d0',
  padding: '9px 16px',
  borderRadius: '10px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '13px',
  whiteSpace: 'nowrap',
},
dateInput: {
    background: '#fff',
    border: '1px solid #e0e0f0',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  clearDateBtn: {
    background: '#fff0f0',
    color: '#ef4444',
    border: '1px solid #ffd0d0',
    padding: '8px 12px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
}

export default Transactions