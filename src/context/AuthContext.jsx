import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginWithBackend as _apiLogin, logoutFromBackend, getCurrentUser, fetchAccessMe, getStoredToken } from '../services/authApi';
import {
  canView as rbacCanView,
  canExport as rbacCanExport,
  canUpload as rbacCanUpload,
  canAdmin as rbacCanAdmin,
  canAccess as rbacCanAccess,
  computeAuthorizationState,
  resolveLandingRoute,
  CANONICAL_ROUTE_REGISTRY,
} from '../utils/rbacPermissions';

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
  { module_code: 'INVENTORY', can_view: true, can_export: true, can_upload: true, can_admin: false, actions: ['VIEW', 'EXPORT', 'UPLOAD'] },
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
    defaultPage: '/exec-dashboard',
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
    allowedPages: ['dashboard','exec-dashboard','division','pl','ar','revenue','receivables','inventory', 'excel-consolidator', 'profile'],
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
    allowedPages: ['pl','revenue','receivables','payables','inventory','salesman','profile'],
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
    allowedPages: ['pl','balance-sheet','receivables','payables','revenue','inventory','profile'],
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
  const [authError, setAuthError] = useState(null);

  // ── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    _auditWrite('logout');
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('finsight_user');
    logoutFromBackend(); // also clears finsight_token and token
  }, []);

  // ── Restore session ───────────────────────────────────────────────
  // Requires a valid JWT and a successful, active profile from GET /api/access/me.
  // A failed profile request must NEVER activate cached permissions (fails closed).
  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const accessProfile = await getCurrentUser(token);
        if (accessProfile && accessProfile.active !== false) {
          const resolvedRole = accessProfile.role_code || accessProfile.role || 'accountant';

          const authoritativeUser = {
            id: accessProfile.user_profile_id || accessProfile.id,
            user_profile_id: accessProfile.user_profile_id || accessProfile.id,
            name: accessProfile.employee_name || accessProfile.full_name || 'User',
            email: accessProfile.official_email || accessProfile.email,
            employee_name: accessProfile.employee_name || 'User',
            employee_code: accessProfile.employee_code || null,
            designation: accessProfile.designation || 'Finance Professional',
            department: accessProfile.department || 'Finance',
            role: resolvedRole,
            role_code: accessProfile.role_code || resolvedRole,
            role_name: accessProfile.role_name || resolvedRole,
            roleLabel: accessProfile.role_name || resolvedRole,
            avatar: (accessProfile.employee_name || accessProfile.official_email || 'U').slice(0, 2).toUpperCase(),
            // Authoritative arrays strictly from /api/access/me
            module_permissions: Array.isArray(accessProfile.module_permissions) ? accessProfile.module_permissions : [],
            access_scopes: Array.isArray(accessProfile.access_scopes) ? accessProfile.access_scopes : [],
            access_token: token,
            token: token,
          };

          setUser(authoritativeUser);
          localStorage.setItem('finsight_user', JSON.stringify(authoritativeUser));
          setAuthError(null);
        } else {
          // Inactive user or empty profile response
          logout();
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore via /api/access/me failed:', err);
        if (err?.status === 401 || err?.status === 403) {
          // Token expired or invalid credentials
          logout();
        } else {
          // Transient error / network failure: Fail closed, do NOT activate cached permissions
          setUser(null);
          setAuthError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [logout]);

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

  // Step 2: Creates the session in React state and local storage.
  const completeLogin = useCallback((safeUser) => {
    setUser(safeUser);
    localStorage.setItem('finsight_user', JSON.stringify(safeUser));
    _auditWrite('login', { userId: safeUser.id, userName: safeUser.name, userRole: safeUser.role });
  }, []);

  // Kept for backward-compat (non-MFA internal use)
  function login(email, password) {
    const result = verifyCredentials(email, password);
    if (result.success) completeLogin(result.user);
    return result;
  }

  // ── Real backend login ────────────────────────────────────────────
  // 1. Authenticates against POST /api/auth/login to get JWT token.
  // 2. Immediately verifies GET /api/access/me for authoritative profile.
  // 3. Commits session once.
  async function loginWithBackend(email, password) {
    const { token } = await _apiLogin(email, password);
    if (!token) {
      throw { status: 500, message: 'Server did not return a valid authentication token.', isAuthError: false };
    }

    // Authoritative profile from /api/access/me
    const accessProfile = await getCurrentUser(token);
    if (!accessProfile || accessProfile.active === false) {
      logoutFromBackend();
      throw {
        status: 403,
        message: 'Your account is inactive or access profile could not be loaded.',
        isAuthError: true,
      };
    }

    const resolvedRole = accessProfile.role_code || accessProfile.role || 'accountant';

    const session = {
      id: accessProfile.user_profile_id || accessProfile.id,
      user_profile_id: accessProfile.user_profile_id || accessProfile.id,
      name: accessProfile.employee_name || accessProfile.full_name || email,
      email: accessProfile.official_email || accessProfile.email || email,
      employee_name: accessProfile.employee_name || email,
      employee_code: accessProfile.employee_code || null,
      designation: accessProfile.designation || 'Finance Professional',
      department: accessProfile.department || 'Finance',
      role: resolvedRole,
      role_code: accessProfile.role_code || resolvedRole,
      role_name: accessProfile.role_name || resolvedRole,
      roleLabel: accessProfile.role_name || resolvedRole,
      avatar: (accessProfile.employee_name || email).slice(0, 2).toUpperCase(),
      // Strictly backend-driven permissions & scopes (no demo overrides)
      module_permissions: Array.isArray(accessProfile.module_permissions) ? accessProfile.module_permissions : [],
      access_scopes: Array.isArray(accessProfile.access_scopes) ? accessProfile.access_scopes : [],
      access_token: token,
      token: token,
    };

    // Commit session once
    completeLogin(session);
    setAuthError(null);
    return session;
  }

  // ── Authoritative Profile Refresh ─────────────────────────────────
  // Re-fetches /api/access/me and strictly replaces permissions/scopes.
  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const accessProfile = await getCurrentUser(token);
      if (accessProfile && accessProfile.active !== false) {
        let updatedUser = null;
        setUser(prev => {
          updatedUser = {
            ...(prev || {}),
            ...accessProfile,
            id: accessProfile.user_profile_id || prev?.id,
            user_profile_id: accessProfile.user_profile_id || prev?.user_profile_id,
            name: accessProfile.employee_name || accessProfile.full_name || prev?.name,
            email: accessProfile.official_email || accessProfile.email || prev?.email,
            employee_name: accessProfile.employee_name || prev?.employee_name,
            employee_code: accessProfile.employee_code || prev?.employee_code,
            designation: accessProfile.designation || prev?.designation,
            department: accessProfile.department || prev?.department,
            role_code: accessProfile.role_code || prev?.role_code,
            role_name: accessProfile.role_name || prev?.role_name,
            // Strictly replace module_permissions and access_scopes - never merge
            module_permissions: Array.isArray(accessProfile.module_permissions) ? accessProfile.module_permissions : [],
            access_scopes: Array.isArray(accessProfile.access_scopes) ? accessProfile.access_scopes : [],
          };
          localStorage.setItem('finsight_user', JSON.stringify(updatedUser));
          return updatedUser;
        });
        return accessProfile;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      console.warn('[AuthContext] refreshProfile error:', err);
      if (err?.status === 401 || err?.status === 403) {
        logout();
      }
    }
    return null;
  }, [logout]);

  // ── Authoritative RBAC Helper Methods ─────────────────────────────
  const canView = useCallback((moduleCode) => {
    return rbacCanView(user?.module_permissions, moduleCode);
  }, [user?.module_permissions]);

  const canExport = useCallback((moduleCode) => {
    return rbacCanExport(user?.module_permissions, moduleCode);
  }, [user?.module_permissions]);

  const canUpload = useCallback((moduleCode) => {
    return rbacCanUpload(user?.module_permissions, moduleCode);
  }, [user?.module_permissions]);

  const canAdmin = useCallback((moduleCode) => {
    return rbacCanAdmin(user?.module_permissions, moduleCode);
  }, [user?.module_permissions]);

  const canAccess = useCallback((routeOrKey) => {
    return rbacCanAccess(user?.module_permissions, routeOrKey);
  }, [user?.module_permissions]);

  const getAuthorizationState = useCallback(() => {
    return computeAuthorizationState({ user, loading, error: authError });
  }, [user, loading, authError]);

  const resolveLanding = useCallback(() => {
    return resolveLandingRoute(user?.module_permissions, user?.role_code || user?.role);
  }, [user?.module_permissions, user?.role_code, user?.role]);

  // Backwards compatibility alias: hasExportRight delegates to canExport
  const hasExportRight = useCallback((moduleCodeOrType) => {
    return rbacCanExport(user?.module_permissions, moduleCodeOrType);
  }, [user?.module_permissions]);

  // ── Data scope enforcement ────────────────────────────────────────
  function getScopedEntities() {
    if (!user) return [];
    if (Array.isArray(user.access_scopes) && user.access_scopes.length > 0) {
      const hasAll = user.access_scopes.some(
        s => s.legal_entity_name === 'All Entities' || s.legal_entity_name === 'ALL'
      );
      if (hasAll) return ALL_ENTITIES;
      const allowedNames = new Set(user.access_scopes.map(s => s.legal_entity_name).filter(Boolean));
      return ALL_ENTITIES.filter(e => allowedNames.has(e.name));
    }
    return [];
  }

  function getScopedCountries() {
    if (!user) return [];
    if (Array.isArray(user.access_scopes) && user.access_scopes.length > 0) {
      const hasAll = user.access_scopes.some(
        s => s.country === 'ALL' || s.country === 'All Countries' || s.legal_entity_name === 'All Entities' || s.legal_entity_name === 'ALL'
      );
      if (hasAll) return ALL_COUNTRIES;
      const allowedCountries = new Set();
      user.access_scopes.forEach(s => {
        if (s.country) {
          allowedCountries.add(s.country);
        } else if (s.legal_entity_name) {
          const matched = ALL_ENTITIES.find(e => e.name === s.legal_entity_name);
          if (matched?.country) allowedCountries.add(matched.country);
        }
      });
      if (allowedCountries.size > 0) {
        return Array.from(allowedCountries);
      }
    }
    return [];
  }

  function getScopedSalesperson() {
    if (!user?.access_scopes || !Array.isArray(user.access_scopes)) return null;
    const scopedUser = user.access_scopes.find(s => s.salesman);
    return scopedUser?.salesman || null;
  }

  function hasSensitiveAccess(page) {
    if (!user) return false;
    if (!SENSITIVE_PAGES.includes(page)) return true;
    return SENSITIVE_ROLES.includes(String(user.role_code || user.role).toLowerCase());
  }

  function auditLog(action, payload = {}) {
    _auditWrite(action, payload);
  }

  function getAccessScopes() {
    if (!user) return [];
    return Array.isArray(user.access_scopes) ? user.access_scopes : [];
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      login,
      logout,
      canView,
      canExport,
      canUpload,
      canAdmin,
      canAccess,
      resolveLanding,
      getAuthorizationState,
      refreshProfile,
      hasExportRight,
      verifyCredentials,
      completeLogin,
      loginWithBackend,
      getScopedEntities,
      getScopedCountries,
      getScopedSalesperson,
      hasSensitiveAccess,
      auditLog,
      getAccessScopes,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
