import { useState, useMemo } from 'react';
import { useAudit } from '../context/AuditContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  Shield, Users, Activity, Download, Search, Filter,
  Trash2, RefreshCw, Lock, Unlock, Eye, AlertTriangle,
  ChevronRight, User, Clock, Globe, Key,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────
function fmtTS(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

const ACTION_LABELS = {
  login:         { label: 'Login',          color: '#10b981', bg: '#d1fae5' },
  logout:        { label: 'Logout',         color: '#6b7280', bg: '#f3f4f6' },
  report_access: { label: 'Report View',    color: '#3b82f6', bg: '#dbeafe' },
  filter_change: { label: 'Filter Change',  color: '#8b5cf6', bg: '#ede9fe' },
  export:        { label: 'Export',         color: '#f59e0b', bg: '#fef3c7' },
  role_change:   { label: 'Role Change',    color: '#ef4444', bg: '#fee2e2' },
  access_denied: { label: 'Access Denied',  color: '#ef4444', bg: '#fee2e2' },
  login_mfa:     { label: 'MFA Verified',   color: '#10b981', bg: '#d1fae5' },
  login_failed:  { label: 'Login Failed',   color: '#ef4444', bg: '#fee2e2' },
};

const ROLE_COLORS = {
  board:      { bg: '#fef3c7', color: '#d97706' },
  cfo:        { bg: '#ede9fe', color: '#7c3aed' },
  executive:  { bg: '#ede9fe', color: '#6d28d9' },
  gm:         { bg: '#dbeafe', color: '#1d4ed8' },
  bu_manager: { bg: '#dbeafe', color: '#2563eb' },
  accountant: { bg: '#d1fae5', color: '#059669' },
  sales:      { bg: '#d1fae5', color: '#10b981' },
};

const SCOPE_DISPLAY = (scope) => {
  if (!scope) return '—';
  if (scope.countries === 'all') return 'All Countries · All Entities';
  const c = Array.isArray(scope.countries) ? scope.countries.join(', ') : scope.countries;
  const e = Array.isArray(scope.entities) ? `${scope.entities.length} entities` : scope.entities;
  return `${c} · ${e}`;
};

// ── stat card ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#1e3a8a', letterSpacing: '-0.02em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const { getLog, clearLog } = useAudit();

  const [tab, setTab] = useState('users');   // 'users' | 'audit'
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [confirmed, setConfirmed] = useState(false);

  // Only CFO / Board can manage users; segregation requirement
  const isAdmin = user?.canManageUsers;

  const rawLog = useMemo(() => getLog(), [tab]); // refresh on tab switch

  const filteredLog = useMemo(() => {
    return rawLog.filter(e => {
      const matchAction = actionFilter === 'all' || e.action === actionFilter;
      const matchUser   = userFilter   === 'all' || e.userId === userFilter;
      const matchSearch = !search || [e.userName, e.userRole, e.action, e.page, e.path].some(
        v => v?.toLowerCase().includes(search.toLowerCase())
      );
      return matchAction && matchUser && matchSearch;
    });
  }, [rawLog, actionFilter, userFilter, search]);

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs    = rawLog.filter(e => e.timestamp?.startsWith(todayStr));
  const loginCount   = rawLog.filter(e => e.action === 'login').length;
  const deniedCount  = rawLog.filter(e => e.action === 'access_denied').length;
  const exportCount  = rawLog.filter(e => e.action === 'export').length;

  function handleClearLog() {
    if (!confirmed) { setConfirmed(true); return; }
    clearLog();
    setConfirmed(false);
    setTab('audit'); // trigger re-render
  }

  function downloadLog() {
    const csv = [
      ['Timestamp','User','Role','Action','Page / Path','Details'].join(','),
      ...rawLog.map(e => [
        e.timestamp, e.userName || '', e.userRole || '', e.action,
        e.page || e.path || '', e.exportType || e.filterKey || '',
      ].map(v => `"${v}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `finsight_audit_${todayStr}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-in">
      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} style={{ color: '#7c3aed' }} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>User &amp; Security Management</h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 46 }}>
            RBAC administration · Audit trail · Data scope control
          </p>
        </div>
        {/* Admin-only badge */}
        <div style={{
          padding: '6px 14px', borderRadius: 100,
          background: isAdmin ? '#d1fae5' : '#fee2e2',
          color:  isAdmin ? '#059669' : '#ef4444',
          border: `1px solid ${isAdmin ? '#a7f3d0' : '#fca5a5'}`,
          fontSize: '0.66rem', fontWeight: 700, letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {isAdmin ? <Unlock size={12} /> : <Lock size={12} />}
          {isAdmin ? 'Admin Access' : 'View-Only Access'}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users}        label="Total Users"      value={DEMO_USERS.length} color="#7c3aed" sub="Across all tiers" />
        <StatCard icon={Activity}     label="Today's Events"   value={todayLogs.length}  color="#3b82f6" sub={`as of ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`} />
        <StatCard icon={Key}          label="Login Events"     value={loginCount}         color="#10b981" sub="Total in log" />
        <StatCard icon={AlertTriangle} label="Access Denied"   value={deniedCount}        color="#ef4444" sub="Unauthorised attempts" />
        <StatCard icon={Download}     label="Export Events"    value={exportCount}        color="#f59e0b" sub="Total exports" />
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'users',  label: 'User Directory',  icon: Users    },
          { key: 'audit',  label: 'Audit Log',        icon: Activity },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            id={`admin-tab-${t.key}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
              background: tab === t.key ? '#fff' : 'transparent',
              color:      tab === t.key ? '#7c3aed' : '#64748b',
              boxShadow:  tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Users ── */}
      {tab === 'users' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
              Role Directory · <span style={{ color: '#94a3b8', fontWeight: 500 }}>{DEMO_USERS.length} users</span>
            </div>
            {!isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>
                <AlertTriangle size={12} />
                Read-only — user management restricted to Admin
              </div>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['User', 'Role', 'Tier', 'Data Scope', 'Export Rights', 'Can Manage', 'Allowed Pages'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '0.74rem', fontWeight: 700, color: '#1e3a8a', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.map((u, i) => {
                const rc = ROLE_COLORS[u.role] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fdfcff', transition: 'background 0.15s' }}>
                    {/* User */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.62rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {u.avatar}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b' }}>{u.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Role label */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 100, background: rc.bg, color: rc.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                        {u.roleLabel}
                      </span>
                    </td>
                    {/* Tier / layer */}
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                      {u.layer === 0 ? 'Board' : `Layer ${u.layer}`}
                    </td>
                    {/* Data scope */}
                    <td style={{ padding: '12px 16px', fontSize: '0.72rem', color: '#64748b', maxWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        {SCOPE_DISPLAY(u.scope)}
                      </div>
                    </td>
                    {/* Export rights */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 700,
                        ...({ full: { background: '#d1fae5', color: '#059669' }, controlled: { background: '#dbeafe', color: '#1d4ed8' }, operational: { background: '#fef3c7', color: '#d97706' }, limited: { background: '#fee2e2', color: '#ef4444' } }[u.exportRights] || {}),
                      }}>
                        {u.exportRights?.toUpperCase()}
                      </span>
                    </td>
                    {/* Can manage users */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {u.canManageUsers
                        ? <span style={{ color: '#10b981', fontSize: '0.8rem' }}>✓</span>
                        : <span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>✗</span>}
                    </td>
                    {/* Allowed pages */}
                    <td style={{ padding: '12px 16px', fontSize: '0.7rem', color: '#64748b' }}>
                      {u.allowedPages.includes('*')
                        ? <span style={{ color: '#7c3aed', fontWeight: 700 }}>All Pages</span>
                        : u.allowedPages.slice(0, 3).join(', ') + (u.allowedPages.length > 3 ? ` +${u.allowedPages.length - 3}` : '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB: Audit Log ── */}
      {tab === 'audit' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search user, action, page…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="audit-search-input"
                style={{
                  width: '100%', paddingLeft: 32, paddingRight: 12, height: 36,
                  borderRadius: 9, border: '1px solid #e2e8f0', fontSize: '0.78rem',
                  background: '#fff', color: '#1e293b', outline: 'none',
                }}
              />
            </div>
            {/* Action filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} style={{ color: '#94a3b8' }} />
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                id="audit-action-filter"
                style={{ height: 36, borderRadius: 9, border: '1px solid #e2e8f0', fontSize: '0.78rem', padding: '0 10px', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
              >
                <option value="all">All Actions</option>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {/* User filter */}
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              id="audit-user-filter"
              style={{ height: 36, borderRadius: 9, border: '1px solid #e2e8f0', fontSize: '0.78rem', padding: '0 10px', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
            >
              <option value="all">All Users</option>
              {DEMO_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {/* Download CSV */}
              <button
                onClick={downloadLog}
                id="audit-download-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 14px', height: 36, borderRadius: 9,
                  background: '#ede9fe', color: '#7c3aed', border: 'none',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Download size={13} /> Export CSV
              </button>
              {/* Clear log — admin only */}
              {isAdmin && (
                <button
                  onClick={handleClearLog}
                  id="audit-clear-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 14px', height: 36, borderRadius: 9,
                    background: confirmed ? '#fee2e2' : '#f1f5f9',
                    color:      confirmed ? '#ef4444' : '#64748b',
                    border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {confirmed ? <><AlertTriangle size={13} /> Confirm Clear</> : <><Trash2 size={13} /> Clear Log</>}
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 10 }}>
            Showing {filteredLog.length} of {rawLog.length} events
          </div>

          {/* Log table */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {filteredLog.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <Activity size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>No audit events found</div>
                <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Events are recorded as you use the system.</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Timestamp', 'User', 'Role', 'Action', 'Page / Path', 'Details'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '0.74rem', fontWeight: 700, color: '#1e3a8a', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.map((e, i) => {
                    const al = ACTION_LABELS[e.action] || { label: e.action, color: '#64748b', bg: '#f1f5f9' };
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fdfcff' }}>
                        <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={11} style={{ color: '#cbd5e1' }} />
                            {fmtTS(e.timestamp)}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              <User size={10} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{e.userName || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#64748b' }}>
                          {e.userRole ? e.userRole.toUpperCase() : '—'}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ padding: '2px 10px', borderRadius: 100, background: al.bg, color: al.color, fontSize: '0.68rem', fontWeight: 700 }}>
                            {al.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: '#475569' }}>
                          {e.page || e.path || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.7rem', color: '#94a3b8' }}>
                          {e.exportType || e.filterKey ? `${e.filterKey || e.exportType}${e.filterValue ? ': ' + e.filterValue : ''}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
