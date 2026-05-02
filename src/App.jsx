import { useCurrency } from './CurrencyContext'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import useTransactions from './data/useTransactions'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Budget from './pages/Budget'
import AIAssistant from './pages/AIAssistant'
import Settings from './pages/Settings'
import InvestmentSuggester from './components/InvestmentSuggester'

function App() {
  const { currency, changeCurrency, currencies } = useCurrency()
  const [activePage, setActivePage] = useState('dashboard')
  const txData = useTransactions()

  function handleAddClick() {
    if (activePage !== 'transactions') {
      setActivePage('transactions')
      setTimeout(() => document.getElementById('openAddModal')?.click(), 100)
    } else {
      document.getElementById('openAddModal')?.click()
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard    {...txData} />
      case 'transactions': return <Transactions {...txData} />
      case 'analytics':    return <Analytics    {...txData} />
      case 'budget':       return <Budget       {...txData} />
      case 'ai':           return <AIAssistant  {...txData} />
      case 'invest':       return <InvestmentSuggester totalIncome={txData.totalIncome} totalExpenses={txData.totalExpenses} />
      case 'settings':     return <Settings />
      default:
        return <p style={{ color: '#6b6b8a' }}>🚧 Coming soon.</p>
    }
  }

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '20px 32px',
          background: '#fff',
          borderBottom: '1px solid #e0e0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', textTransform: 'capitalize' }}>
            {activePage === 'invest' ? 'Investment Suggester' : activePage}
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={currency}
              onChange={e => changeCurrency(e.target.value)}
              style={{
                background: '#f5f5ff',
                border: '1px solid #e0e0f0',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#7c6ff7',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {Object.entries(currencies).map(([code, cur]) => (
                <option key={code} value={code}>
                  {cur.symbol} {code}
                </option>
              ))}
            </select>
            <button onClick={handleAddClick} style={{
              background: '#7c6ff7', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '10px',
              fontWeight: '600', cursor: 'pointer', fontSize: '14px',
            }}>
              + Add Transaction
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', paddingBottom: '80px' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default App