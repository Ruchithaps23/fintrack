import { LayoutDashboard, ArrowLeftRight, BarChart2, Target, Bot, Settings } from 'lucide-react'

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'analytics',    label: 'Analytics',    icon: BarChart2 },
  { id: 'budget',       label: 'Budget',       icon: Target },
  { id: 'ai',           label: 'AI Assistant', icon: Bot },
  { id: 'settings',     label: 'Settings',     icon: Settings },
]

function Sidebar({ activePage, setActivePage }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar desktop-sidebar" style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoText}>
            Fin<span style={styles.logoAccent}>Track</span>
          </span>
          <p style={styles.logoSub}>Personal Finance</p>
        </div>
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

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav" style={styles.mobileNav}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            onClick={() => setActivePage(id)}
            style={{
              ...styles.mobileNavItem,
              ...(activePage === id ? styles.mobileNavItemActive : {})
            }}
          >
            <Icon size={20} />
            <span style={styles.mobileNavLabel}>{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        .desktop-sidebar {
          display: flex;
        }
        .mobile-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}

const styles = {
  // Desktop
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

  // Mobile
  mobileNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#1a1a2e',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0 12px',
    zIndex: 1000,
    borderTop: '1px solid #2a2a4a',
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: '#6b6b8a',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  mobileNavItemActive: {
    color: '#7c6ff7',
  },
  mobileNavLabel: {
    fontSize: '9px',
    fontWeight: '600',
  },
}

export default Sidebar