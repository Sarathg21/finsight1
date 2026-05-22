import { createContext, useContext, useState, useEffect } from 'react';

// ── Auth Context ────────────────────────────────────────────────────
// Manages login state, RBAC roles, and data-scope enforcement for Finsight

const AuthContext = createContext(null);

// ── Audit helper (lightweight – avoids circular AuditContext import) ──
function _auditWrite(action, payload = {}) {
  const STORAGE_KEY = 'finsight_audit_log';
  const MAX = 500;
  let user = null;
  try { user = JSON.parse(localStorage.getItem('finsight_user') || 'null'); } catch { /**/ }
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    timestamp: new Date().toISOString(),
    action,
    userId:   user?.id   || null,
    userName: user?.name || null,
    userRole: user?.role || null,
    ...payload,
  };
  let log = [];
  try { log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { /**/ }
  log.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-MAX)));
}

// ── Master entity list (used for scope filtering) ────────────────────
export const ALL_ENTITIES = [
  { id: 1,  name: 'FJ Group HQ',               country: 'UAE',   division: 'Corporate' },
  { id: 10, name: 'FJ Care UAE',                country: 'UAE',   division: 'FJ Care' },
  { id: 11, name: 'FJ Care Int\'l',             country: 'UAE',   division: 'FJ Care' },
  { id: 15, name: 'Flowtech Qatar',             country: 'Qatar', division: 'Flowtech UAE, QTR, OMN' },
  { id: 16, name: 'Flowtech Oman',              country: 'Oman',  division: 'Flowtech UAE, QTR, OMN' },
  { id: 20, name: 'FJ Engineering KSA',         country: 'KSA',   division: 'Engineering' },
  { id: 21, name: 'FJ Contracting KSA',         country: 'KSA',   division: 'Engineering' },
  { id: 30, name: 'FJ Investments',             country: 'UAE',   division: 'Investments' },
];

export const ALL_COUNTRIES = ['UAE', 'Qatar', 'Oman', 'KSA'];

// ── Sensitive pages (journal-level / customer-vendor detail) ─────────
const SENSITIVE_PAGES = ['balance-sheet', 'fixed-assets', 'cash-collection', 'ap', 'admin'];
const SENSITIVE_ROLES = ['board', 'cfo']; // only these can see journal-level detail

// Demo user accounts (Layer 1-6)
export const DEMO_USERS = [
  // ── Board ──────────────────────────────────────────────────────
  {
    id: 'u007',
    name: 'Faisal Jassim Al Dosari',
    email: 'board@fjgroup.com',
    password: 'board123',
    role: 'board',
    roleLabel: 'Board Chairman',
    layer: 0,
    avatar: 'FJ',
    scope: { countries: 'all', entities: 'all', divisions: 'all' },
    exportRights: 'full',
    canManageUsers: true,
    defaultPage: '/exec-dashboard',
    allowedPages: ['*'],
  },
  // ── Executive ──────────────────────────────────────────────────
  {
    id: 'u001',
    name: 'CFO',
    email: 'cfo@fjgroup.com',
    password: 'cfo123',
    role: 'cfo',
    roleLabel: 'CFO & Admin',
    layer: 1,
    avatar: 'CF',
    scope: { countries: 'all', entities: 'all', divisions: 'all' },
    exportRights: 'full',
    canManageUsers: true,
    defaultPage: '/dashboard',
    allowedPages: ['*'],
  },
  {
    id: 'u002',
    name: 'Khalid Al Rashidi',
    email: 'khalid.rashidi@fjgroup.com',
    password: 'exec123',
    role: 'executive',
    roleLabel: 'Executive Management',
    layer: 2,
    avatar: 'KR',
    scope: { countries: 'all', entities: 'all', divisions: 'all' },
    exportRights: 'controlled',
    canManageUsers: false,
    defaultPage: '/exec-dashboard',
    allowedPages: ['exec-dashboard','dashboard','pl','working-capital','country-performance', 'excel-consolidator'],
  },
  // ── Management ─────────────────────────────────────────────────
  {
    id: 'u003',
    name: 'Ahmed Al Farsi',
    email: 'ahmed.farsi@fjgroup.com',
    password: 'gm123',
    role: 'gm',
    roleLabel: 'Division General Manager',
    layer: 3,
    avatar: 'AF',
    scope: { countries: ['UAE','Qatar'], entities: [1,15,10,11], divisions: ['Flowtech UAE, QTR, OMN','FJ Care'] },
    exportRights: 'controlled',
    canManageUsers: false,
    allowedPages: ['dashboard','division','pl','ar','inventory', 'excel-consolidator'],
  },
  {
    id: 'u004',
    name: 'Ravi Menon',
    email: 'ravi.menon@fjgroup.com',
    password: 'bum123',
    role: 'bu_manager',
    roleLabel: 'Business Unit Manager',
    layer: 4,
    avatar: 'RM',
    scope: { countries: ['UAE'], entities: [10,11], divisions: ['FJ Care'] },
    exportRights: 'controlled',
    canManageUsers: false,
    allowedPages: ['dashboard','bu-pack','pl','ar','ap','inventory','salesman', 'excel-consolidator'],
  },
  // ── Finance ────────────────────────────────────────────────────
  {
    id: 'u005',
    name: 'Priya Nair',
    email: 'priya.nair@fjgroup.com',
    password: 'acct123',
    role: 'accountant',
    roleLabel: 'BU Accountant',
    layer: 5,
    avatar: 'PN',
    scope: { countries: ['UAE'], entities: [10], divisions: ['FJ Care'] },
    exportRights: 'operational',
    canManageUsers: false,
    allowedPages: ['pl','balance-sheet','ar','ap','fixed-assets','cash-collection','revenue', 'excel-consolidator'],
  },
  {
    id: 'u006',
    name: 'Hassan Al Nuaimi',
    email: 'hassan@fjgroup.com',
    password: 'sales123',
    role: 'sales',
    roleLabel: 'Sales Engineer',
    layer: 6,
    avatar: 'HN',
    scope: { countries: ['UAE'], entities: [10], divisions: ['FJ Care'], salesman: 'Hassan Al Nuaimi' },
    exportRights: 'limited',
    canManageUsers: false,
    allowedPages: ['salesman','revenue', 'excel-consolidator'],
  },
];

// Tier groupings for login page display
export const DEMO_TIERS = [
  {
    tier: 'Board',
    icon: '♛',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    ids: ['u007'],
  },
  {
    tier: 'Executive',
    icon: '◆',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    ids: ['u001','u002'],
  },
  {
    tier: 'Management',
    icon: '▲',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    ids: ['u003','u004'],
  },
  {
    tier: 'Finance',
    icon: '●',
    color: '#10b981',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    ids: ['u005','u006'],
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session
    try {
      const saved = localStorage.getItem('finsight_user');
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Step 1: Check credentials only — does NOT create a session.
  // Used by LoginPage before the MFA step.
  function verifyCredentials(email, password) {
    const trimmedEmail = email?.trim() || '';
    const trimmedPassword = password?.trim() || '';
    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === trimmedPassword
    );
    if (!found) {
      _auditWrite('login_failed', { attemptedEmail: trimmedEmail });
      return { success: false, error: 'Invalid credentials' };
    }
    const { password: _pwd, ...safe } = found;
    return { success: true, user: safe };
  }

  // Step 2: Called after MFA passes — creates the session.
  function completeLogin(safeUser) {
    setUser(safeUser);
    localStorage.setItem('finsight_user', JSON.stringify(safeUser));
    _auditWrite('login', { userId: safeUser.id, userName: safeUser.name, userRole: safeUser.role });
  }

  // Kept for backward-compat (non-MFA internal use)
  function login(email, password) {
    const result = verifyCredentials(email, password);
    if (result.success) completeLogin(result.user);
    return result;
  }

  function logout() {
    _auditWrite('logout');
    setUser(null);
    localStorage.removeItem('finsight_user');
  }

  function canAccess(page) {
    if (!user) return false;
    if (user.allowedPages.includes('*')) return true;
    return user.allowedPages.includes(page);
  }

  function hasExportRight(type) {
    const map = { full: 3, controlled: 2, operational: 2, limited: 1 };
    const typeMap = { all: 3, excel: 2, pdf: 2, csv: 1 };
    return (map[user?.exportRights] || 0) >= (typeMap[type] || 0);
  }

  // ── Data scope enforcement ────────────────────────────────────────
  // Returns only entities user is authorised to view.
  // Unauthorised entities must not appear even in filter dropdowns.
  function getScopedEntities() {
    if (!user) return [];
    const scope = user.scope;
    if (scope?.countries === 'all' && scope?.entities === 'all') return ALL_ENTITIES;
    return ALL_ENTITIES.filter(e => {
      const countryOk = !scope?.countries || scope.countries === 'all'
        || (Array.isArray(scope.countries) && scope.countries.includes(e.country));
      const entityOk  = !scope?.entities  || scope.entities  === 'all'
        || (Array.isArray(scope.entities)  && scope.entities.includes(e.id));
      return countryOk && entityOk;
    });
  }

  // Returns only countries user is authorised to view.
  function getScopedCountries() {
    if (!user) return [];
    const scope = user.scope;
    if (scope?.countries === 'all') return ALL_COUNTRIES;
    return Array.isArray(scope?.countries) ? scope.countries : ALL_COUNTRIES;
  }

  // Returns the salesperson filter value if the user's scope is locked to one.
  function getScopedSalesperson() {
    return user?.scope?.salesman || null;
  }

  // Returns true only for board/cfo roles on sensitive finance detail pages.
  function hasSensitiveAccess(page) {
    if (!user) return false;
    if (!SENSITIVE_PAGES.includes(page)) return true; // not a sensitive page
    return SENSITIVE_ROLES.includes(user.role);
  }

  // Log an audit event from any component (filter changes, exports, etc.)
  function auditLog(action, payload = {}) {
    _auditWrite(action, payload);
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, canAccess, hasExportRight, loading,
      verifyCredentials, completeLogin,
      getScopedEntities, getScopedCountries, getScopedSalesperson,
      hasSensitiveAccess, auditLog,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
