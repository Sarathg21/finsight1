import { Search, Bell, LogOut, Calendar, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':           { title: 'CFO Dashboard',              sub: 'Executive financial command centre' },
  '/exec-dashboard':      { title: 'Exec Finance Dashboard',     sub: 'Enterprise financial overview across all divisions' },
  '/finsight-dashboard':  { title: 'Executive Dashboard',        sub: 'Comprehensive overview of your financial performance' },
  '/pl':                  { title: 'Profit & Loss Report',       sub: 'Income statement analysis' },
  '/ar':                  { title: 'Receivables Aging',          sub: 'AR aging & collection tracking' },
  '/ap':                  { title: 'Payables Aging',             sub: 'AP aging & cash planning' },
  '/inventory':           { title: 'Inventory Aging',            sub: 'Stock movement & slow-moving analysis' },
  '/working-capital':     { title: 'Working Capital Dashboard',  sub: 'DSO / DIO / DPO & NWC trend' },
  '/balance-sheet':       { title: 'Balance Sheet',              sub: 'Assets, liabilities & equity' },
  '/cash-collection':     { title: 'Cash Collection Report',     sub: 'Collections vs. targets' },
  '/fixed-assets':        { title: 'Fixed Asset Register',       sub: 'NBV, depreciation & movements' },
  '/country-performance': { title: 'Country Performance',        sub: 'Cross-country KPI comparison' },
  '/salesman':            { title: 'Salesman Dashboard',         sub: 'Individual performance & AR tracking' },
  '/revenue':             { title: 'Revenue Analysis',           sub: 'Revenue by segment, product & period' },
  '/division':            { title: 'Division Reports',           sub: 'Division-wise financial performance' },
  '/bu-pack':             { title: 'BU Financial Pack',          sub: 'Business unit reporting pack' },
  '/admin':               { title: 'User & Access Control',      sub: 'Role management & security settings' },
};

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] || { title: 'Finsight', sub: 'FJ Group Finance Intelligence' };

  return (
    <header className="topbar">
      <button
        className="btn-icon"
        onClick={onToggleSidebar}
        style={{ marginRight: '8px' }}
        id="sidebar-toggle-btn"
      >
        <div style={{ width: '20px', height: '2px', background: 'currentColor', marginBottom: '4px' }} />
        <div style={{ width: '20px', height: '2px', background: 'currentColor', marginBottom: '4px' }} />
        <div style={{ width: '20px', height: '2px', background: 'currentColor' }} />
      </button>

      <div className="topbar-title" style={{ lineHeight: 1.25 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text)' }}>{page.title}</div>
        <div style={{ fontSize: '0.63rem', color: 'var(--clr-text-muted)', fontWeight: 400 }}>{page.sub}</div>
      </div>

      <div className="topbar-actions">
        {/* Global filters pill */}
        <div className="flex items-center gap-3" style={{
          background: 'var(--clr-surface)', padding: '4px 12px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--clr-border)',
        }}>
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: 'var(--clr-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>FY 2026</span>
          </div>
          <div className="filter-divider" style={{ height: '12px' }} />
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: 'var(--clr-emerald)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>All Entities</span>
          </div>
        </div>

        <div className="filter-divider" />

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-dim)' }} />
          <input
            type="text"
            placeholder="Search reports, entities..."
            className="filter-input"
            style={{ paddingLeft: '38px', width: '220px', background: 'var(--clr-surface-2)' }}
          />
        </div>

        <button className="btn-icon" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: 'var(--clr-rose)', borderRadius: '50%', border: '2px solid var(--clr-bg-2)' }} />
        </button>

        <div className="filter-divider" />

        <div className="flex items-center gap-3" style={{ paddingLeft: '8px' }}>
          {/* Avatar circle */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {user?.avatar || '?'}
          </div>
          <div className="text-right">
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-muted)' }}>{user?.roleLabel}</div>
          </div>
          <button
            className="btn-icon"
            onClick={logout}
            style={{ color: 'var(--clr-rose)', borderColor: 'rgba(244,63,94,0.2)' }}
            title="Logout"
            id="logout-btn"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
