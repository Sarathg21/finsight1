import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Star, TrendingUp, FileText, BookOpen, DollarSign,
  Building2, Receipt, CreditCard, Package, LayoutGrid, Wallet,
  FileSpreadsheet, Shield, Users, Globe, PieChart, Briefcase,
  UserCheck, ChevronLeft, LogOut, Search, X,
} from 'lucide-react';

/* ── Icon map per route ─────────────────────────────────────────── */
const ROUTE_ICON = {
  '/finsight-dashboard': Star,
  '/exec-dashboard': Briefcase,
  '/dashboard': LayoutDashboard,
  '/pl': FileText,
  '/balance-sheet': BookOpen,
  '/revenue': DollarSign,
  '/fixed-assets': Building2,
  '/ar': Receipt,
  '/ap': CreditCard,
  '/inventory': Package,
  '/working-capital': LayoutGrid,
  '/cash-collection': Wallet,
  '/excel-consolidator': FileSpreadsheet,
  '/admin': Shield,
  '/country-performance': Globe,
  '/division': PieChart,
  '/bu-pack': Briefcase,
  '/salesman': UserCheck,
  '/workingcapital-report': LayoutGrid,
  '/payables': CreditCard,
  '/receivables': CreditCard,
};

/* ── Nav item definitions per role ─────────────────────────────── */
const NAV_BY_ROLE = {
  board: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Board View' },
    { to: '/exec-dashboard', label: 'Exec Finance Dashboard', group: 'Board View' },
    { to: '/dashboard', label: 'CFO Dashboard', group: 'Board View' },
    { to: '/pl', label: 'P&L Report', group: 'Reports' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'Reports' },
    { to: '/ar', label: 'Receivables Aging', group: 'Reports' },
    { to: '/working-capital', label: 'Overview', group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
    { to: '/admin', label: 'User & Access Control', group: 'Admin' },
  ],
  cfo: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Overview' },
    { to: '/dashboard', label: 'CFO Dashboard', group: 'Overview' },
    { to: '/exec-dashboard', label: 'Exec Finance Dashboard', group: 'Overview' },
    { to: '/pl', label: 'P&L Report', group: 'Financials' },
    { to: '/balance-sheet', label: 'Balance Sheet', group: 'Financials' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'Financials' },
    { to: '/fixed-assets', label: 'Fixed Assets', group: 'Financials' },
    { to: '/ar', label: 'Receivables Aging', group: 'Working Capital' },
    { to: '/ap', label: 'Payables Aging', group: 'Working Capital' },
    { to: '/payables', label: 'Payables Report', group: 'Working Capital' },
    { to: '/receivables', label: 'Receivables Report', group: 'Working Capital' },
    { to: '/inventory', label: 'Inventory Aging', group: 'Working Capital' },
    { to: '/workingcapital-report', label: 'WorkingCapital Report', group: 'Working Capital' },

    { to: '/working-capital', label: 'Overview', group: 'Working Capital' },
    { to: '/cash-collection', label: 'Cash Collection', group: 'Treasury' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
    { to: '/admin', label: 'User & Access Control', group: 'Admin' },
  
  ],
  executive: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Overview' },
    { to: '/exec-dashboard', label: 'Exec Finance Dashboard', group: 'Overview' },
    { to: '/dashboard', label: 'CFO Dashboard', group: 'Overview' },
    { to: '/pl', label: 'P&L Report', group: 'Reports' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'Reports' },
    { to: '/working-capital', label: 'Overview', group: 'Reports' },
    { to: '/country-performance', label: 'Country Performance', group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  gm: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Overview' },
    { to: '/dashboard', label: 'Dashboard', group: 'Overview' },
    { to: '/division', label: 'Division Reports', group: 'Reports' },
    { to: '/pl', label: 'P&L Report', group: 'Reports' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'Reports' },
    { to: '/ar', label: 'Receivables Aging', group: 'Reports' },
    { to: '/inventory', label: 'Inventory Aging', group: 'Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  bu_manager: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Overview' },
    { to: '/dashboard', label: 'Dashboard', group: 'Overview' },
    { to: '/bu-pack', label: 'BU Financial Pack', group: 'BU Reports' },
    { to: '/pl', label: 'P&L Report', group: 'BU Reports' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'BU Reports' },
    { to: '/ar', label: 'Receivables Aging', group: 'BU Reports' },
    { to: '/ap', label: 'Payables Aging', group: 'BU Reports' },
    { to: '/inventory', label: 'Inventory Aging', group: 'BU Reports' },
    { to: '/salesman', label: 'Salesman Reports', group: 'BU Reports' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  accountant: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Finance' },
    { to: '/pl', label: 'P&L Report', group: 'Finance' },
    { to: '/balance-sheet', label: 'Balance Sheet', group: 'Finance' },
    { to: '/ar', label: 'Receivables Aging', group: 'Finance' },
    { to: '/ap', label: 'Payables Aging', group: 'Finance' },
    { to: '/fixed-assets', label: 'Fixed Assets', group: 'Finance' },
    { to: '/cash-collection', label: 'Cash Collection', group: 'Finance' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'Finance' },
    { to: '/excel-consolidator', label: 'Excel Consolidator', group: 'Utilities' },
  ],
  sales: [
    { to: '/finsight-dashboard', label: 'Executive Dashboard', pinned: true, group: 'Sales' },
    { to: '/salesman', label: 'Salesman Dashboard', group: 'Sales' },
    { to: '/revenue', label: 'Sales Revenue Report', group: 'Sales' },
  ],
};

/* ── Role theme helpers ─────────────────────────────────────────── */
function roleBg(role) {
  const m = { board: '#eef2ff', cfo: '#eef2ff', executive: '#f5f3ff', gm: '#eff6ff', bu_manager: '#eff6ff', accountant: '#f0fdf4', sales: '#fff1f2' };
  return m[role] || '#eef2ff';
}
function roleColor(role) {
  const m = { board: '#6366f1', cfo: '#6366f1', executive: '#7c3aed', gm: '#2563eb', bu_manager: '#2563eb', accountant: '#16a34a', sales: '#f43f5e' };
  return m[role] || '#6366f1';
}

/* ── Tooltip wrapper for collapsed mode ────────────────────────── */
function Tip({ label, children, show }) {
  if (!show) return children;
  return (
    <div style={{ position: 'relative', display: 'contents' }}>
      {children}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.cfo;
  const isExpanded = !collapsed;
  const accentColor = roleColor(user?.role);

  /* Filter by search query */
  const filtered = query.trim()
    ? navItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : navItems;

  /* Group filtered items */
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  /* User initials */
  const initials = (user?.name || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      {/* ═══════════════════ ASIDE ═══════════════════ */}
      <aside
        className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}
        style={{
          width: isExpanded ? 'var(--sidebar-w)' : 'var(--sidebar-collapsed)',
          position: 'relative',
          overflow: 'visible',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          background: '#081B46',
          borderRight: '1px solid var(--clr-border)',
          flexShrink: 0,
          zIndex: 110,
        }}
      >
        {/* ── Inner clip (content clipped during animation) ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* ── Logo row ── */}
          <div style={{
            height: 'var(--topbar-h)',
            display: 'flex', alignItems: 'center',
            padding: isExpanded ? '0 16px 0 18px' : '0 0 0 18px',
            borderBottom: '1px solid var(--clr-border)',
            flexShrink: 0,
            gap: 10,
          }}>
            {/* Logo mark */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.85rem', color: '#fff',
              boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
            }}>FJ</div>

            {/* Brand name */}
            <div style={{
              overflow: 'hidden', whiteSpace: 'nowrap',
              transition: 'opacity 0.2s, width 0.3s',
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? 'auto' : 0,
              pointerEvents: isExpanded ? 'auto' : 'none',
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>FJ Group</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Finance Suite</div>
            </div>
          </div>

          {/* ── Role badge ── */}
          <div style={{
            padding: isExpanded ? '10px 16px 4px' : '10px 0 4px',
            display: 'flex',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            flexShrink: 0,
            transition: 'padding 0.3s',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: isExpanded ? '4px 10px 4px 6px' : '4px 6px',
              background: roleBg(user?.role),
              border: `1px solid ${accentColor}22`,
              borderRadius: 99,
              fontSize: '0.62rem', fontWeight: 700, color: accentColor,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'all 0.3s',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
              {isExpanded && (user?.roleLabel || 'User')}
            </div>
          </div>

          {/* ── Search (expanded only) ── */}
          {isExpanded && (
            <div style={{ padding: '6px 12px 2px', flexShrink: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '5px 10px',
                transition: 'border-color 0.15s',
              }}>
                <Search size={13} color="#94a3b8" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search menu…"
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: '0.78rem', color: '#334155', width: '100%',
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    <X size={11} color="#94a3b8" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 10px 12px' }}>
            {Object.entries(grouped).map(([group, items], gi) => (
              <div key={group} style={{ marginBottom: 4 }}>
                {/* Section label */}
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: isExpanded ? '10px 8px 4px' : '10px 0 4px',
                  textAlign: isExpanded ? 'left' : 'center',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {isExpanded ? (
                    <>
                      <span>{group}</span>
                      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.25)', display: 'inline-block' }} />
                    </>
                  ) : (
                    <span style={{
                      width: 20, height: 1, background: 'rgba(255,255,255,0.25)',
                      display: 'inline-block', margin: '0 auto',
                    }} />
                  )}
                </div>

                {/* Nav items */}
                {items.map(item => {
                  const Icon = ROUTE_ICON[item.to] || LayoutDashboard;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={!isExpanded ? item.label : undefined}
                      className={({ isActive }) => isActive ? 'sb-link sb-link--active' : 'sb-link'}
                      style={{ textDecoration: 'none', display: 'block', marginBottom: 1, }}
                    >
                      {({ isActive }) => (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: isExpanded ? '8px 10px' : '9px 0',
                          justifyContent: isExpanded ? 'flex-start' : 'center',
                          borderRadius: 9,
                          cursor: 'pointer',
                          background: isActive
                            ? `linear-gradient(135deg, ${accentColor}ee, ${accentColor}cc)`
                            : 'transparent',
                          boxShadow: isActive ? `0 3px 10px ${accentColor}33` : 'none',
                          transition: 'background 0.18s, box-shadow 0.18s',
                          position: 'relative',
                        }}
                          onMouseEnter={e => {
                            if (!isActive) {
                              e.currentTarget.style.background = '#7C3AED';
                              const label = e.currentTarget.querySelector('.nav-label');
                              const icon = e.currentTarget.querySelector('.nav-icon');

                              if (label) {
                                label.style.color = '#000';
                              }

                              if (icon) {
                                icon.style.color = '#000';
                              }
                            }
                          }}

                          onMouseLeave={e => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              const label = e.currentTarget.querySelector('.nav-label');
                              const icon = e.currentTarget.querySelector('.nav-icon');
                              if (label) {
                                label.style.color = '#fff';
                              }
                              if (icon) {
                                icon.style.color = '#fff';
                              }
                            }
                          }}
                        >
                          {/* Icon */}
                          <span style={{
                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 20, height: 20,
                          }}>
                            {item.pinned ? (
                              <Star
                                size={15}
                                fill={isActive ? '#fbbf24' : 'none'}
                                color={isActive ? '#fbbf24' : '#f59e0b'}
                                strokeWidth={2}
                              />
                            ) : (
                              <Icon
                                size={15}
                                color={isActive ? '#fff' : '#64748b'}
                                strokeWidth={isActive ? 2.5 : 1.8}
                              />
                            )}
                          </span>

                          {/* Label */}
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isActive ? 700 : 500,
                            // color: isActive ? '#fff' : '#334155',
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? 'auto' : 0,
                            transition: 'opacity 0.2s',
                            pointerEvents: isExpanded ? 'auto' : 'none',
                            lineHeight: 1.3,
                          }}>
                            {item.label}
                          </span>

                          {/* Pinned star badge (expanded, not active) */}
                          {item.pinned && isExpanded && !isActive && (
                            <span style={{
                              marginLeft: 'auto',
                              fontSize: '0.55rem', fontWeight: 700,
                              color: '#f59e0b',
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              borderRadius: 4,
                              padding: '1px 5px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}>Featured</span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}

            {/* Empty search state */}
            {query && Object.keys(grouped).length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.76rem', paddingTop: 24 }}>
                No results for "{query}"
              </div>
            )}
          </nav>

          {/* ── User footer ── */}
          <div style={{
            borderTop: '1px solid var(--clr-border)',
            padding: isExpanded ? '12px 14px' : '10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            justifyContent: isExpanded ? 'flex-start' : 'center',
            transition: 'padding 0.3s',
          }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 800, color: '#fff',
              boxShadow: `0 2px 8px ${accentColor}44`,
            }}>{initials}</div>

            {/* Name & email */}
            {isExpanded && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || user?.roleLabel || ''}
                </div>
              </div>
            )}

            {/* Logout */}
            {isExpanded && (
              <button
                onClick={logout}
                title="Logout"
                style={{
                  flexShrink: 0, border: 'none', background: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', width: 28, height: 28,
                  borderRadius: 7, color: '#94a3b8',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>

        </div>{/* /inner clip */}

        {/* ── Desktop floating chevron toggle ── */}
        <button
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="sidebar-toggle-btn"
          style={{
            position: 'absolute', top: '32px', right: '-13px',
            transform: 'translateY(-50%)',
            zIndex: 200, width: 26, height: 26, borderRadius: '50%',
            border: '1.5px solid var(--clr-border)',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--clr-primary)'; e.currentTarget.style.borderColor = 'var(--clr-primary)'; e.currentTarget.querySelector('svg').style.stroke = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.querySelector('svg').style.stroke = '#64748b'; }}
        >
          <ChevronLeft
            size={13}
            color="#64748b"
            strokeWidth={2.5}
            style={{
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          />
        </button>

      </aside>

      {/* ── Mobile FAB arrow pill ── */}
      <button
        onClick={onToggle}
        aria-label="Open navigation"
        className="sidebar-mobile-fab"
        style={{
          position: 'fixed', top: '32px',
          left: mobileOpen ? '-60px' : '0px',
          transform: 'translateY(-50%)',
          zIndex: 1100, width: 28, height: 52,
          borderRadius: '0 26px 26px 0',
          border: '1.5px solid var(--clr-border)',
          borderLeft: 'none',
          background: 'var(--clr-primary)',
          boxShadow: '2px 0 12px rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <ChevronLeft
          size={14} color="#fff" strokeWidth={2.5}
          style={{ transform: 'rotate(180deg)' }}
        />
      </button>
    </>
  );
}
