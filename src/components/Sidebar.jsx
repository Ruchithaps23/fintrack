import { LayoutDashboard, ArrowLeftRight, BarChart2, Target, Bot, Settings } from 'lucide-react'

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'transactions',  label: 'Transactions',  icon: ArrowLeftRight },
  { id: 'analytics',     label: 'Analytics',     icon: BarChart2 },
  { id: 'budget',        label: 'Budget',        icon: Target },
  { id: 'ai',            label: 'AI Assistant',  icon: Bot },
  { id: 'settings',      label: 'Settings',      icon: Settings },
]

function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar" style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoText}>Fin<span style={styles.logoAccent}>Track</span></span>
        <p style={styles.logoSub}>Personal Finance</p>
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            onClick={() => setActivePage(id)}
            style={{
              ...styles.navItem,
              ...(activePage === id ? styles.navItemActive : {})
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '230px',
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100vh',
  },
  logo: {
    padding: '28px 24px 20px',
    borderBottom: '1px solid #2a2a4a',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
  },
  logoAccent: {
    color: '#7c6ff7',
  },
  logoSub: {
    fontSize: '11px',
    color: '#6b6b8a',
    marginTop: '2px',
    letterSpacing: '1px',
  },
  nav: {
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#6b6b8a',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: '#7c6ff7',
    color: '#fff',
  },
}

export default Sidebar