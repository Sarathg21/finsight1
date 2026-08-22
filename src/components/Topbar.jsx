import { Search, Bell, LogOut, Calendar, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const PAGE_TITLES = {
  '/dashboard': { title: 'CFO Dashboard', sub: 'Executive financial command centre' },
  '/exec-dashboard': { title: 'Exec Finance Dashboard', sub: 'Enterprise financial overview across all divisions' },
  '/finsight-dashboard': { title: 'Executive Dashboard', sub: 'Comprehensive financial performance overview' },
  '/pl': { title: 'Profit & Loss Report', sub: 'Income statement analysis' },
  '/ar': { title: 'Receivables Aging', sub: 'AR aging & collection tracking' },
  '/ap': { title: 'Payables Aging', sub: 'AP aging & cash planning' },
  '/inventory': { title: 'Inventory Aging', sub: 'Stock movement & slow-moving analysis' },
  '/working-capital': { title: 'Working Capital Dashboard', sub: 'DSO / DIO / DPO & NWC trend' },
  '/balance-sheet': { title: 'Balance Sheet', sub: 'Assets, liabilities & equity' },
  '/cash-collection': { title: 'Cash Collection Report', sub: 'Collections vs. targets' },
  '/fixed-assets': { title: 'Fixed Asset Register', sub: 'NBV, depreciation & movements' },
  '/country-performance': { title: 'Country Performance', sub: 'Cross-country KPI comparison' },
  '/salesman': { title: 'Salesman Dashboard', sub: 'Individual performance & AR tracking' },
  '/revenue': { title: 'Revenue Analysis', sub: 'Revenue by segment, product & period' },
  '/division': { title: 'Division Reports', sub: 'Division-wise financial performance' },
  '/bu-pack': { title: 'BU Financial Pack', sub: 'Business unit reporting pack' },
  '/admin': { title: 'User & Access Control', sub: 'Role management & security settings' },
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const isRestricted = !['ADMIN', 'FGT_SUPER_ADMIN', 'CEO', 'CFO', 'CFO_GROUP', 'COO', 'MD', 'BOARD', 'EXECUTIVE', 'cfo', 'board', 'executive'].includes(user?.role?.toUpperCase() || '');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = PAGE_TITLES[pathname] || { title: 'Finsight', sub: 'FJ Group Finance Intelligence' };

  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Filter PAGE_TITLES by query — case-insensitive match on title or sub
  const searchResults = query.trim()
    ? Object.entries(PAGE_TITLES).filter(([, p]) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.sub.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (path) => {
    navigate(path);
    setQuery('');
    setShowResults(false);
  };

  return (
    <header className="topbar"
      style={{
        minHeight: "40px",
        height: "40px",
        padding: "0 16px",
      }}>
      {/* Page title */}
      <div className="topbar-title">
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {page.title}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-dim)', fontWeight: 400, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {page.sub}
        </div>
      </div>

      <div className="topbar-actions">
        {/* Context pill — FY + Entity */}
        <div
          className="hide-on-tablet"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--clr-surface-2)',
            padding: '5px 12px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--clr-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={12} style={{ color: 'var(--clr-primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text)' }}>FY 2026</span>
          </div>
          <div className="filter-divider" style={{ height: 12, margin: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Globe size={12} style={{ color: 'var(--clr-emerald)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text)' }}>{isRestricted ? 'Authorized Entities' : 'All Entities'}</span>
          </div>
        </div>

        <div className="filter-divider hide-on-tablet" />

        {/* Search */}
        <div className="search-wrap hide-on-tablet" ref={searchRef} style={{ position: 'relative' }}>
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search reports…"
            className="search-input"
            aria-label="Search"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => query.trim() && setShowResults(true)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setQuery(''); setShowResults(false); }
              if (e.key === 'Enter' && searchResults.length > 0) handleSearchSelect(searchResults[0][0]);
            }}
          />
          {showResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 1000, marginTop: 4, overflow: 'hidden',
            }}>
              {searchResults.map(([path, p]) => (
                <button
                  key={path}
                  onClick={() => handleSearchSelect(path)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 12px', background: 'none', border: 'none',
                    cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{p.title}</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: 1 }}>{p.sub}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bell */}
        <button className="btn-icon" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={16} />
          <span
            className="live-dot"
            style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, border: '1.5px solid var(--clr-surface)' }}
          />
        </button>

        <div className="filter-divider" />

        {/* User */}
        <div className="user-menu-wrap">
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.62rem', fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
          }}>
            {user?.avatar || '?'}
          </div>
          <div className="hide-on-tablet" style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--clr-text)', whiteSpace: 'nowrap' }}>
              {user?.name || 'Zenith User'}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--clr-text-dim)', fontWeight: 400, whiteSpace: 'nowrap' }}>
              {user?.roleLabel || 'User'}
            </div>
          </div>
          <button
            className="btn-icon btn-icon-danger"
            onClick={logout}
            title="Logout"
            id="logout-btn"
            aria-label="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
