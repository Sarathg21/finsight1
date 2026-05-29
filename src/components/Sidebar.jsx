import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Nav item definitions per role ──────────────────────────────── */
const NAV_BY_ROLE = {
  board: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Board View' },
    { to: '/exec-dashboard', label: 'Exec Finance Dashboard', group: 'Board View' },
    { to: '/dashboard',      label: 'CFO Dashboard',          group: 'Board View' },
    { to: '/pl',             label: 'P&L Report',             group: 'Reports' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'Reports' },
    { to: '/ar',             label: 'Receivables Aging',      group: 'Reports' },
    { to: '/working-capital',label: 'Working Capital',        group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
    { to: '/admin',          label: 'User & Access Control',  group: 'Admin' },
  ],
  cfo: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Overview' },
    { to: '/dashboard',      label: 'CFO Dashboard',          group: 'Overview' },
    { to: '/exec-dashboard', label: 'Exec Finance Dashboard', group: 'Overview' },
    { to: '/pl',             label: 'P&L Report',             group: 'Financials' },
    { to: '/balance-sheet',  label: 'Balance Sheet',          group: 'Financials' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'Financials' },
    { to: '/ar',             label: 'Receivables Aging',      group: 'Working Capital' },
    { to: '/ap',             label: 'Payables Aging',         group: 'Working Capital' },
    { to: '/inventory',      label: 'Inventory Aging',        group: 'Working Capital' },
    { to: '/working-capital',label: 'Working Capital',        group: 'Working Capital' },
    { to: '/cash-collection',label: 'Cash Collection',        group: 'Treasury' },
    { to: '/fixed-assets',   label: 'Fixed Assets',           group: 'Treasury' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
    { to: '/admin',          label: 'User & Access Control',  group: 'Admin' },
  ],
  executive: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Overview' },
    { to: '/exec-dashboard', label: 'Exec Finance Dashboard', group: 'Overview' },
    { to: '/dashboard',      label: 'CFO Dashboard',          group: 'Overview' },
    { to: '/pl',             label: 'P&L Report',             group: 'Reports' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'Reports' },
    { to: '/working-capital',label: 'Working Capital',        group: 'Reports' },
    { to: '/country-performance', label: 'Country Performance', group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  gm: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Overview' },
    { to: '/dashboard',      label: 'Dashboard',              group: 'Overview' },
    { to: '/division',       label: 'Division Reports',       group: 'Reports' },
    { to: '/pl',             label: 'P&L Report',             group: 'Reports' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'Reports' },
    { to: '/ar',             label: 'Receivables Aging',      group: 'Reports' },
    { to: '/inventory',      label: 'Inventory Aging',        group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  bu_manager: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Overview' },
    { to: '/dashboard',      label: 'Dashboard',              group: 'Overview' },
    { to: '/bu-pack',        label: 'BU Financial Pack',      group: 'BU Reports' },
    { to: '/pl',             label: 'P&L Report',             group: 'BU Reports' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'BU Reports' },
    { to: '/ar',             label: 'Receivables Aging',      group: 'BU Reports' },
    { to: '/ap',             label: 'Payables Aging',         group: 'BU Reports' },
    { to: '/inventory',      label: 'Inventory Aging',        group: 'BU Reports' },
    { to: '/salesman',       label: 'Salesman Reports',       group: 'BU Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  accountant: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Finance' },
    { to: '/pl',             label: 'P&L Report',             group: 'Finance' },
    { to: '/balance-sheet',  label: 'Balance Sheet',          group: 'Finance' },
    { to: '/ar',             label: 'Receivables Aging',      group: 'Finance' },
    { to: '/ap',             label: 'Payables Aging',         group: 'Finance' },
    { to: '/fixed-assets',   label: 'Fixed Assets',           group: 'Finance' },
    { to: '/cash-collection',label: 'Cash Collection',        group: 'Finance' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'Finance' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  sales: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard',  group: 'Sales' },
    { to: '/salesman',       label: 'Salesman Dashboard',     group: 'Sales' },
    { to: '/revenue',        label: 'Sales Revenue Report',   group: 'Sales' },
  ],
};

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.cfo;

  /* group items for labelled sections */
  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ padding: '22px 20px', border: 'none', marginBottom: 4 }}>
        <div className="logo-mark" style={{
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          borderRadius: 14, width: 44, height: 44,
          fontSize: '1rem', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
        }}>FJ</div>
        {!collapsed && (
          <div className="logo-text">
            <span className="brand" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>FJ Group</span>
            <span className="tagline" style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Finance Suite</span>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            padding: '6px 12px', borderRadius: 100,
            background: roleBg(user?.role), color: roleColor(user?.role),
            fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            border: `1px solid ${roleColor(user?.role)}30`,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: '0.55rem' }}>●</span>
            {user?.roleLabel || 'User'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav" style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            {!collapsed && (
              <div style={{
                fontSize: '0.6rem', fontWeight: 700, color: '#cbd5e1',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '0 8px', marginBottom: 6,
              }}>
                {group}
              </div>
            )}
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  background: isActive ? '#7c3aed' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: collapsed ? '12px' : '10px 16px',
                  borderRadius: 12,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  marginBottom: 3,
                  boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: user info */}
      <div className="sidebar-footer" style={{ padding: '16px 20px', border: 'none', background: 'transparent' }}>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{user?.email}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function roleBg(role) {
  const map = { board:'#fef3c7', cfo:'#ede9fe', executive:'#ede9fe', gm:'#dbeafe', bu_manager:'#dbeafe', accountant:'#d1fae5', sales:'#d1fae5' };
  return map[role] || '#f1f5f9';
}
function roleColor(role) {
  const map = { board:'#d97706', cfo:'#7c3aed', executive:'#6d28d9', gm:'#1d4ed8', bu_manager:'#2563eb', accountant:'#059669', sales:'#10b981' };
  return map[role] || '#64748b';
}
