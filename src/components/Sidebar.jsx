import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Nav item definitions per role ──────────────────────────────── */
const NAV_BY_ROLE = {
  board: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard', group: 'Board View' },
    { to: '/exec-dashboard',     label: 'Exec Finance Dashboard', group: 'Board View' },
    { to: '/dashboard',          label: 'CFO Dashboard',          group: 'Board View' },
    { to: '/pl',                 label: 'P&L Report',             group: 'Reports' },
    { to: '/revenue',            label: 'Sales Revenue Report',   group: 'Reports' },
    { to: '/ar',                 label: 'Receivables Aging',      group: 'Reports' },
    { to: '/working-capital',    label: 'Working Capital',        group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator',     group: 'Utilities' },
    { to: '/admin',              label: 'User & Access Control',  group: 'Admin' },
  ],
  cfo: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard', group: 'Overview' },
    { to: '/dashboard',          label: 'CFO Dashboard',          group: 'Overview' },
    { to: '/exec-dashboard',     label: 'Exec Finance Dashboard', group: 'Overview' },
    { to: '/pl',                 label: 'P&L Report',             group: 'Financials' },
    { to: '/balance-sheet',      label: 'Balance Sheet',          group: 'Financials' },
    { to: '/revenue',            label: 'Sales Revenue Report',   group: 'Financials' },
    { to: '/ar',                 label: 'Receivables Aging',      group: 'Working Capital' },
    { to: '/ap',                 label: 'Payables Aging',         group: 'Working Capital' },
    { to: '/inventory',          label: 'Inventory Aging',        group: 'Working Capital' },
    { to: '/working-capital',    label: 'Working Capital',        group: 'Working Capital' },
    { to: '/cash-collection',    label: 'Cash Collection',        group: 'Treasury' },
    { to: '/fixed-assets',       label: 'Fixed Assets',           group: 'Treasury' },
    { to: '/excel-consolidator', label: 'Excel Consolidator',     group: 'Utilities' },
    { to: '/admin',              label: 'User & Access Control',  group: 'Admin' },
  ],
  executive: [
    { to: '/finsight-dashboard',  label: '⭐ Executive Dashboard', group: 'Overview' },
    { to: '/exec-dashboard',      label: 'Exec Finance Dashboard', group: 'Overview' },
    { to: '/dashboard',           label: 'CFO Dashboard',          group: 'Overview' },
    { to: '/pl',                  label: 'P&L Report',             group: 'Reports' },
    { to: '/revenue',             label: 'Sales Revenue Report',   group: 'Reports' },
    { to: '/working-capital',     label: 'Working Capital',        group: 'Reports' },
    { to: '/country-performance', label: 'Country Performance',    group: 'Reports' },
    { to: '/excel-consolidator',  label: 'Excel Consolidator',     group: 'Utilities' },
  ],
  gm: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard', group: 'Overview' },
    { to: '/dashboard',          label: 'Dashboard',              group: 'Overview' },
    { to: '/division',           label: 'Division Reports',       group: 'Reports' },
    { to: '/pl',                 label: 'P&L Report',             group: 'Reports' },
    { to: '/revenue',            label: 'Sales Revenue Report',   group: 'Reports' },
    { to: '/ar',                 label: 'Receivables Aging',      group: 'Reports' },
    { to: '/inventory',          label: 'Inventory Aging',        group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator',     group: 'Utilities' },
  ],
  bu_manager: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard', group: 'Overview' },
    { to: '/dashboard',          label: 'Dashboard',              group: 'Overview' },
    { to: '/bu-pack',            label: 'BU Financial Pack',      group: 'BU Reports' },
    { to: '/pl',                 label: 'P&L Report',             group: 'BU Reports' },
    { to: '/revenue',            label: 'Sales Revenue Report',   group: 'BU Reports' },
    { to: '/ar',                 label: 'Receivables Aging',      group: 'BU Reports' },
    { to: '/ap',                 label: 'Payables Aging',         group: 'BU Reports' },
    { to: '/inventory',          label: 'Inventory Aging',        group: 'BU Reports' },
    { to: '/salesman',           label: 'Salesman Reports',       group: 'BU Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator',     group: 'Utilities' },
  ],
  accountant: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard', group: 'Finance' },
    { to: '/pl',                 label: 'P&L Report',             group: 'Finance' },
    { to: '/balance-sheet',      label: 'Balance Sheet',          group: 'Finance' },
    { to: '/ar',                 label: 'Receivables Aging',      group: 'Finance' },
    { to: '/ap',                 label: 'Payables Aging',         group: 'Finance' },
    { to: '/fixed-assets',       label: 'Fixed Assets',           group: 'Finance' },
    { to: '/cash-collection',    label: 'Cash Collection',        group: 'Finance' },
    { to: '/revenue',            label: 'Sales Revenue Report',   group: 'Finance' },
    { to: '/excel-consolidator', label: 'Excel Consolidator',     group: 'Utilities' },
  ],
  sales: [
    { to: '/finsight-dashboard', label: '⭐ Executive Dashboard', group: 'Sales' },
    { to: '/salesman',           label: 'Salesman Dashboard',     group: 'Sales' },
    { to: '/revenue',            label: 'Sales Revenue Report',   group: 'Sales' },
  ],
};

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.cfo;

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">FJ</div>
        {!collapsed && (
          <div className="logo-text">
            <span className="brand">FJ Group</span>
            <span className="tagline">Finance Suite</span>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '12px 18px 8px' }}>
          <div style={{
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: roleBg(user?.role),
            color: roleColor(user?.role),
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            border: `1px solid ${roleColor(user?.role)}28`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: roleColor(user?.role), display: 'inline-block' }} />
            {user?.roleLabel || 'User'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <div className="nav-section-label">{group}</div>
            )}
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                style={collapsed ? { justifyContent: 'center', padding: '10px' } : undefined}
                title={collapsed ? item.label : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: user info */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-text)' }}>
              {user?.name}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-dim)', fontWeight: 400 }}>
              {user?.email}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

function roleBg(role) {
  const map = {
    board:      '#eef2ff',
    cfo:        '#eef2ff',
    executive:  '#f5f3ff',
    gm:         '#eff6ff',
    bu_manager: '#eff6ff',
    accountant: '#f0fdf4',
    sales:      '#fff1f2',
  };
  return map[role] || 'var(--clr-surface-2)';
}

function roleColor(role) {
  const map = {
    board:      '#6366f1',
    cfo:        '#6366f1',
    executive:  '#7c3aed',
    gm:         '#2563eb',
    bu_manager: '#2563eb',
    accountant: '#16a34a',
    sales:      '#f43f5e',
  };
  return map[role] || 'var(--clr-text-muted)';
}
