import { createContext, useContext, useState, useEffect } from 'react';
import { loginWithBackend as _apiLogin, logoutFromBackend, getCurrentUser, fetchAccessMe, getStoredToken } from '../services/authApi';

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

// Authoritative modules matching backend role_permissions
const ALL_MODULES_PERMISSIONS = [
  { module_code: 'BALANCE_SHEET', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'DASHBOARD', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'FINANCIAL_POSITION', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'FIXED_ASSETS', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'INVENTORY', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'MASTER_DATA', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'OPERATING_EXPENSES', can_view: true, can_export: true, can_upload: false, can_admin: true, actions: ['VIEW', 'EXPORT', 'ADMIN'] },
  { module_code: 'PAYABLES', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'PROFIT_LOSS', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'RECEIVABLES', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'SALES_REVENUE', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'USER_MANAGEMENT', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
  { module_code: 'WORKING_CAPITAL', can_view: true, can_export: true, can_upload: true, can_admin: true, actions: ['VIEW', 'EXPORT', 'UPLOAD', 'ADMIN'] },
];

const EXEC_MODULES = [
  { module_code: 'DASHBOARD', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'SALES_REVENUE', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'PROFIT_LOSS', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'WORKING_CAPITAL', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
];

const GM_MODULES = [
  { module_code: 'DASHBOARD', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'SALES_REVENUE', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'PROFIT_LOSS', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'RECEIVABLES', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'INVENTORY', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
];

const BUM_MODULES = [
  { module_code: 'DASHBOARD', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'SALES_REVENUE', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'PROFIT_LOSS', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'RECEIVABLES', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'PAYABLES', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'INVENTORY', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
];

const ACCT_MODULES = [
  { module_code: 'PROFIT_LOSS', can_view: true, can_export: true, can_upload: true, can_admin: false, actions: ['VIEW', 'EXPORT', 'UPLOAD'] },
  { module_code: 'BALANCE_SHEET', can_view: true, can_export: true, can_upload: true, can_admin: false, actions: ['VIEW', 'EXPORT', 'UPLOAD'] },
  { module_code: 'SALES_REVENUE', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
  { module_code: 'PAYABLES', can_view: true, can_export: true, can_upload: true, can_admin: false, actions: ['VIEW', 'EXPORT', 'UPLOAD'] },
  { module_code: 'RECEIVABLES', can_view: true, can_export: true, can_upload: true, can_admin: false, actions: ['VIEW', 'EXPORT', 'UPLOAD'] },
  { module_code: 'FIXED_ASSETS', can_view: true, can_export: true, can_upload: true, can_admin: false, actions: ['VIEW', 'EXPORT', 'UPLOAD'] },
];

const SALES_MODULES = [
  { module_code: 'SALES_REVENUE', can_view: true, can_export: true, can_upload: false, can_admin: false, actions: ['VIEW', 'EXPORT'] },
];

const HQ_ALL_SCOPES = [
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'All Entities', parent_division_name: 'All Divisions', subdivision_name: 'All Subdivisions', analysis_name: 'All Analyses' },
  { legal_group_code: 'RKME_GROUP', legal_entity_name: 'All Entities', parent_division_name: 'All Divisions', subdivision_name: 'All Subdivisions', analysis_name: 'All Analyses' },
];

const GM_SCOPES = [
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care UAE', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services' },
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'Flowtech Qatar', parent_division_name: 'Flowtech UAE, QTR, OMN', subdivision_name: 'Flowtech Sales' },
];

const BU_SCOPES = [
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care UAE', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services' },
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care Int\'l', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services' },
];

const ACCT_SCOPES = [
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care UAE', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services' },
];

const SALES_SCOPES = [
  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care UAE', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services', salesman: 'Hassan Al Nuaimi' },
];

// Demo user accounts (Layer 1-6)
export const DEMO_USERS = [
  // ── Board ──────────────────────────────────────────────────────
  {
    id: 'u007',
    name: 'Faisal Jassim Al Dosari',
    employee_name: 'Faisal Jassim Al Dosari',
    employee_code: 'E000007',
    official_email: 'board@fjgroup.com',
    email: 'board@fjgroup.com',
    password: 'board123',
    designation: 'Board Chairman',
    department: 'Board of Directors',
    role: 'board',
    role_code: 'BOARD',
    role_name: 'Board Chairman',
    roleLabel: 'Board Chairman',
    layer: 0,
    avatar: 'FJ',
    scope: { countries: 'all', entities: 'all', divisions: 'all' },
    exportRights: 'full',
    canManageUsers: true,
    defaultPage: '/exec-dashboard',
    allowedPages: ['*'],
    module_permissions: ALL_MODULES_PERMISSIONS,
    access_scopes: HQ_ALL_SCOPES,
  },
  // ── Executive ──────────────────────────────────────────────────
  {
    id: 'u001',
    name: 'CFO',
    employee_name: 'Jeemon Jose',
    employee_code: 'E001977',
    official_email: 'cfo@fjgroup.com',
    email: 'cfo@fjgroup.com',
    password: 'cfo123',
    designation: 'Group Chief Financial Officer',
    department: 'Finance & Strategy',
    role: 'cfo',
    role_code: 'CFO',
    role_name: 'Chief Financial Officer',
    roleLabel: 'CFO & Admin',
    layer: 1,
    avatar: 'CF',
    scope: { countries: 'all', entities: 'all', divisions: 'all' },
    exportRights: 'full',
    canManageUsers: true,
    defaultPage: '/dashboard',
    allowedPages: ['*'],
    module_permissions: ALL_MODULES_PERMISSIONS,
    access_scopes: HQ_ALL_SCOPES,
  },
  {
    id: 'u002',
    name: 'Khalid Al Rashidi',
    employee_name: 'Khalid Al Rashidi',
    employee_code: 'E000002',
    official_email: 'khalid.rashidi@fjgroup.com',
    email: 'khalid.rashidi@fjgroup.com',
    password: 'exec123',
    designation: 'Executive Director',
    department: 'Executive Management',
    role: 'executive',
    role_code: 'EXECUTIVE',
    role_name: 'Executive Management',
    roleLabel: 'Executive Management',
    layer: 2,
    avatar: 'KR',
    scope: { countries: 'all', entities: 'all', divisions: 'all' },
    exportRights: 'controlled',
    canManageUsers: false,
    defaultPage: '/exec-dashboard',
    allowedPages: ['exec-dashboard','dashboard','pl','working-capital','country-performance', 'excel-consolidator', 'profile'],
    module_permissions: EXEC_MODULES,
    access_scopes: HQ_ALL_SCOPES,
  },
  // ── Management ─────────────────────────────────────────────────
  {
    id: 'u003',
    name: 'Ahmed Al Farsi',
    employee_name: 'Ahmed Al Farsi',
    employee_code: 'E000003',
    official_email: 'ahmed.farsi@fjgroup.com',
    email: 'ahmed.farsi@fjgroup.com',
    password: 'gm123',
    designation: 'Division General Manager',
    department: 'Flowtech Division',
    role: 'gm',
    role_code: 'GM',
    role_name: 'Division General Manager',
    roleLabel: 'Division General Manager',
    layer: 3,
    avatar: 'AF',
    scope: { countries: ['UAE','Qatar'], entities: [1,15,10,11], divisions: ['Flowtech UAE, QTR, OMN','FJ Care'] },
    exportRights: 'controlled',
    canManageUsers: false,
    allowedPages: ['dashboard','division','pl','ar','inventory', 'excel-consolidator', 'profile'],
    module_permissions: GM_MODULES,
    access_scopes: GM_SCOPES,
  },
  {
    id: 'u004',
    name: 'Ravi Menon',
    employee_name: 'Ravi Menon',
    employee_code: 'E000004',
    official_email: 'ravi.menon@fjgroup.com',
    email: 'ravi.menon@fjgroup.com',
    password: 'bum123',
    designation: 'Business Unit Manager',
    department: 'FJ Care',
    role: 'bu_manager',
    role_code: 'BU_MANAGER',
    role_name: 'Business Unit Manager',
    roleLabel: 'Business Unit Manager',
    layer: 4,
    avatar: 'RM',
    scope: { countries: ['UAE'], entities: [10,11], divisions: ['FJ Care'] },
    exportRights: 'controlled',
    canManageUsers: false,
    allowedPages: ['dashboard','bu-pack','pl','ar','ap','inventory','salesman', 'excel-consolidator', 'profile'],
    module_permissions: BUM_MODULES,
    access_scopes: BU_SCOPES,
  },
  // ── Finance ────────────────────────────────────────────────────
  {
    id: 'u005',
    name: 'Priya Nair',
    employee_name: 'Priya Nair',
    employee_code: 'E000005',
    official_email: 'priya.nair@fjgroup.com',
    email: 'priya.nair@fjgroup.com',
    password: 'acct123',
    designation: 'BU Senior Accountant',
    department: 'Finance & Accounting',
    role: 'accountant',
    role_code: 'BU_ACCOUNTANT',
    role_name: 'BU Accountant',
    roleLabel: 'BU Accountant',
    layer: 5,
    avatar: 'PN',
    scope: { countries: ['UAE'], entities: [10], divisions: ['FJ Care'] },
    exportRights: 'operational',
    canManageUsers: false,
    allowedPages: ['pl','balance-sheet','ar','ap','fixed-assets','cash-collection','revenue', 'excel-consolidator', 'profile'],
    module_permissions: ACCT_MODULES,
    access_scopes: ACCT_SCOPES,
  },
  {
    id: 'u006',
    name: 'Hassan Al Nuaimi',
    employee_name: 'Hassan Al Nuaimi',
    employee_code: 'E000006',
    official_email: 'hassan@fjgroup.com',
    email: 'hassan@fjgroup.com',
    password: 'sales123',
    designation: 'Senior Sales Engineer',
    department: 'Sales & Commercial',
    role: 'sales',
    role_code: 'SALES_ENGINEER',
    role_name: 'Sales Engineer',
    roleLabel: 'Sales Engineer',
    layer: 6,
    avatar: 'HN',
    scope: { countries: ['UAE'], entities: [10], divisions: ['FJ Care'], salesman: 'Hassan Al Nuaimi' },
    exportRights: 'limited',
    canManageUsers: false,
    allowedPages: ['salesman','revenue', 'excel-consolidator', 'profile'],
    module_permissions: SALES_MODULES,
    access_scopes: SALES_SCOPES,
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

  // ── Restore session ───────────────────────────────────────────────
  // Loads cached session from localStorage immediately, then if a JWT token
  // exists, calls GET /api/access/me to refresh module_permissions and access_scopes.
  useEffect(() => {
    async function restoreSession() {
      let saved = null;
      try {
        const raw = localStorage.getItem('finsight_user');
        if (raw) saved = JSON.parse(raw);
      } catch { /* ignore */ }

      const token = getStoredToken();

      if (token) {
        try {
          const accessProfile = await getCurrentUser(token);
          if (accessProfile && accessProfile.active !== false) {
            const resolvedRole = accessProfile.role_code || accessProfile.role || saved?.role || 'accountant';
            const demoMatch = DEMO_USERS.find(
              u => u.email.toLowerCase() === (accessProfile.official_email || accessProfile.email || '').toLowerCase()
            );

            const updatedUser = {
              ...(saved || {}),
              ...accessProfile,
              id: accessProfile.user_profile_id || accessProfile.id || saved?.id,
              name: accessProfile.employee_name || accessProfile.full_name || saved?.name || 'User',
              email: accessProfile.official_email || accessProfile.email || saved?.email,
              employee_name: accessProfile.employee_name || saved?.employee_name,
              employee_code: accessProfile.employee_code || saved?.employee_code,
              designation: accessProfile.designation || saved?.designation || 'Finance Professional',
              department: accessProfile.department || saved?.department || 'Finance',
              role: resolvedRole,
              role_code: accessProfile.role_code || resolvedRole,
              role_name: accessProfile.role_name || saved?.role_name || resolvedRole,
              layer: demoMatch?.layer ?? saved?.layer ?? (['board', 'cfo', 'admin'].includes(String(resolvedRole).toLowerCase()) ? 1 : 5),
              avatar: saved?.avatar || (accessProfile.employee_name || accessProfile.official_email || 'U').slice(0, 2).toUpperCase(),
              scope: saved?.scope || demoMatch?.scope || { countries: 'all', entities: 'all', divisions: 'all' },
              exportRights: saved?.exportRights || demoMatch?.exportRights || 'full',
              canManageUsers: demoMatch?.canManageUsers ?? (['admin', 'cfo', 'board'].includes(String(resolvedRole).toLowerCase())),
              defaultPage: saved?.defaultPage || demoMatch?.defaultPage || '/dashboard',
              allowedPages: saved?.allowedPages || demoMatch?.allowedPages || ['*'],
              module_permissions: Array.isArray(accessProfile.module_permissions) ? accessProfile.module_permissions : (saved?.module_permissions || []),
              access_scopes: Array.isArray(accessProfile.access_scopes) ? accessProfile.access_scopes : (saved?.access_scopes || []),
              access_token: token,
              token: token,
            };

            setUser(updatedUser);
            localStorage.setItem('finsight_user', JSON.stringify(updatedUser));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[AuthContext] Session restore via /api/access/me failed:', err);
          if (err?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('finsight_token');
            localStorage.removeItem('finsight_user');
            setUser(null);
            setLoading(false);
            return;
          }
        }
      }

      // If no token or network error, fallback to saved user from localStorage
      if (saved) {
        setUser(saved);
      }
      setLoading(false);
    }

    restoreSession();
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
    logoutFromBackend(); // also clears finsight_token and token
  }

  // ── Real backend login ────────────────────────────────────────────
  // 1. Calls POST /api/auth/login and receives JWT access_token.
  // 2. Immediately calls GET /api/access/me to fetch authoritative module_permissions,
  //    access_scopes, employee profile, and roles.
  // 3. Builds authoritative session object with all access details for the Profile page and RBAC.
  async function loginWithBackend(email, password) {
    const { token, raw } = await _apiLogin(email, password);
    const backendUser = raw?.user || raw?.user_info || null;
    const trimmedEmail = (email || '').trim().toLowerCase();

    const demoMatch = DEMO_USERS.find(
      u => u.email.toLowerCase() === trimmedEmail
    );

    // Fetch authoritative user profile and permissions from /api/access/me
    let accessProfile = null;
    try {
      accessProfile = await getCurrentUser(token);
    } catch (err) {
      console.warn('[AuthContext] Could not fetch /api/access/me right after login:', err);
    }

    const resolvedRole = accessProfile?.role_code || backendUser?.role_code || backendUser?.role || demoMatch?.role || 'accountant';

    // Build the session object: /api/access/me fields take authoritative precedence
    const session = {
      ...(backendUser || {}),
      ...(accessProfile || {}),
      access_token: token,
      token: token,
      id:          accessProfile?.user_profile_id || backendUser?.user_profile_id || backendUser?.user_id || backendUser?.id || demoMatch?.id || `backend-${Date.now()}`,
      name:        accessProfile?.employee_name || backendUser?.full_name || backendUser?.name || demoMatch?.name || email,
      email:       accessProfile?.official_email || backendUser?.email || email,
      employee_name: accessProfile?.employee_name || backendUser?.full_name || demoMatch?.name || email,
      employee_code: accessProfile?.employee_code || backendUser?.employee_code || demoMatch?.employee_code || null,
      designation: accessProfile?.designation || demoMatch?.designation || 'Finance Professional',
      department:  accessProfile?.department || demoMatch?.department || 'Finance',
      role:        resolvedRole,
      role_code:   accessProfile?.role_code || backendUser?.role_code || resolvedRole,
      role_name:   accessProfile?.role_name || backendUser?.role_name || demoMatch?.roleLabel || resolvedRole,
      roleLabel:   accessProfile?.role_name || backendUser?.roleLabel || demoMatch?.roleLabel || resolvedRole,
      layer:       demoMatch?.layer ?? (['board', 'cfo', 'admin'].includes(String(resolvedRole).toLowerCase()) ? 1 : 5),
      avatar:      demoMatch?.avatar || (email.slice(0, 2).toUpperCase()),
      scope:       demoMatch?.scope || { countries: 'all', entities: 'all', divisions: 'all' },
      exportRights:   demoMatch?.exportRights || 'controlled',
      canManageUsers: demoMatch?.canManageUsers ?? (['admin', 'cfo', 'board'].includes(String(resolvedRole).toLowerCase()) ? true : false),
      defaultPage:    demoMatch?.defaultPage || '/dashboard',
      allowedPages:   backendUser?.allowedPages || demoMatch?.allowedPages || 
                      (['admin', 'cfo', 'board'].includes(String(resolvedRole).toLowerCase()) ? ['*'] : ['dashboard', 'revenue', 'pl', 'profile']),
      module_permissions: Array.isArray(accessProfile?.module_permissions) ? accessProfile.module_permissions : (demoMatch?.module_permissions || []),
      access_scopes:      Array.isArray(accessProfile?.access_scopes) ? accessProfile.access_scopes : (demoMatch?.access_scopes || []),
    };

    completeLogin(session);
    return session;
  }

  // ── On-demand profile refresh ─────────────────────────────────────
  // Re-fetches /api/access/me and updates user context and localStorage
  async function refreshProfile() {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const accessProfile = await getCurrentUser(token);
      if (accessProfile) {
        setUser(prev => {
          const updated = {
            ...(prev || {}),
            ...accessProfile,
            name: accessProfile.employee_name || accessProfile.full_name || prev?.name,
            email: accessProfile.official_email || accessProfile.email || prev?.email,
            employee_name: accessProfile.employee_name || prev?.employee_name,
            employee_code: accessProfile.employee_code || prev?.employee_code,
            designation: accessProfile.designation || prev?.designation,
            department: accessProfile.department || prev?.department,
            role_code: accessProfile.role_code || prev?.role_code,
            role_name: accessProfile.role_name || prev?.role_name,
            module_permissions: Array.isArray(accessProfile.module_permissions) ? accessProfile.module_permissions : (prev?.module_permissions || []),
            access_scopes: Array.isArray(accessProfile.access_scopes) ? accessProfile.access_scopes : (prev?.access_scopes || []),
          };
          localStorage.setItem('finsight_user', JSON.stringify(updated));
          return updated;
        });
        return accessProfile;
      }
    } catch (err) {
      console.warn('[AuthContext] refreshProfile error:', err);
    }
    return null;
  }

  function canAccess(page) {
    if (!user) return false;
    if (user.allowedPages && user.allowedPages.includes('*')) return true;
    if (['board', 'cfo', 'admin'].includes(String(user.role || user.role_code).toLowerCase())) return true;
    if (user.allowedPages && user.allowedPages.includes(page)) return true;

    // Check backend module_permissions if present
    if (Array.isArray(user?.module_permissions)) {
      const pageToModule = {
        'dashboard': 'DASHBOARD',
        'exec-dashboard': 'DASHBOARD',
        'revenue': 'SALES_REVENUE',
        'sales-revenue': 'SALES_REVENUE',
        'pl': 'PROFIT_LOSS',
        'balance-sheet': 'BALANCE_SHEET',
        'operating-expenses': 'OPERATING_EXPENSES',
        'opex': 'OPERATING_EXPENSES',
        'payables': 'PAYABLES',
        'ap': 'PAYABLES',
        'receivables': 'RECEIVABLES',
        'ar': 'RECEIVABLES',
        'working-capital': 'WORKING_CAPITAL',
        'inventory': 'INVENTORY',
        'fixed-assets': 'FIXED_ASSETS',
        'financial-position': 'FINANCIAL_POSITION',
        'master-data': 'MASTER_DATA',
        'admin': 'USER_MANAGEMENT',
        'profile': '*',
      };
      const mod = pageToModule[page];
      if (mod === '*') return true;
      if (mod) {
        const found = user.module_permissions.find(p => p.module_code === mod);
        if (found) return Boolean(found.can_view);
      }
    }

    return false;
  }

    function hasExportRight(type) {
    const typeMap = { all: 3, excel: 2, pdf: 2, csv: 1 };
    if (typeMap[type] !== undefined) {
      const map = { full: 3, controlled: 2, operational: 2, limited: 1 };
      return (map[user?.exportRights] || 0) >= typeMap[type];
    }
    
    if (user?.module_permissions && Array.isArray(user.module_permissions)) {
      const mod = user.module_permissions.find(p => p.module_code === type);
      if (mod) return !!mod.can_export;
    }
    
    if (user?.role && ['board', 'cfo', 'admin'].includes(String(user.role).toLowerCase())) {
      return true;
    }
    
    return false;
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

  // ── Compat shim for MyProfile.jsx ────────────────────────────────
  // MyProfile expects getAccessScopes() from useAuth().
  // Returns the user's allowedPages as an array of scope strings so
  // that MyProfile can display what this user has access to.
  // This does NOT change any existing RBAC logic.
  function getAccessScopes() {
    if (!user) return [];
    if (Array.isArray(user.access_scopes)) return user.access_scopes;
    return Array.isArray(user.allowedPages) ? user.allowedPages : [];
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, canAccess, hasExportRight, loading,
      verifyCredentials, completeLogin,
      loginWithBackend,
      getScopedEntities, getScopedCountries, getScopedSalesperson,
      hasSensitiveAccess, auditLog,
      getAccessScopes,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
