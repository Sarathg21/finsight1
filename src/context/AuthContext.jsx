

import { createContext, useContext, useState, useEffect } from 'react';
import {
  canAdmin as canAdminPermission,
  canExport as canExportPermission,
} from '../utils/rbacPermissions';

import {

  loginWithBackend as _apiLogin,

  logoutFromBackend,

  getCurrentUser,


  getStoredToken,

} from '../services/authApi';



// ── Auth Context ────────────────────────────────────────────────────

const AuthContext = createContext(null);



// ── Audit helper ────────────────────────────────────────────────────

function _auditWrite(action, payload = {}) {

  const STORAGE_KEY = 'finsight_audit_log';

  const MAX = 500;



  let user = null;

  try {

    user = JSON.parse(localStorage.getItem('finsight_user') || 'null');

  } catch {

    // Ignore invalid stored data.

  }



  const entry = {

    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

    timestamp: new Date().toISOString(),

    action,

    userId: user?.id || null,

    userName: user?.name || null,

    userRole: user?.role || null,

    ...payload,

  };



  let log = [];

  try {

    log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (!Array.isArray(log)) log = [];

  } catch {

    log = [];

  }



  log.push(entry);



  try {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-MAX)));

  } catch {

    // A logging/storage failure must not crash authentication.

  }

}



// ── Master entity list: retained for demo users ─────────────────────

export const ALL_ENTITIES = [

  { id: 1, name: 'FJ Group HQ', country: 'UAE', division: 'Corporate' },

  { id: 10, name: 'FJ Care UAE', country: 'UAE', division: 'FJ Care' },

  { id: 11, name: "FJ Care Int'l", country: 'UAE', division: 'FJ Care' },

  { id: 15, name: 'Flowtech Qatar', country: 'Qatar', division: 'Flowtech UAE, QTR, OMN' },

  { id: 16, name: 'Flowtech Oman', country: 'Oman', division: 'Flowtech UAE, QTR, OMN' },

  { id: 20, name: 'FJ Engineering KSA', country: 'KSA', division: 'Engineering' },

  { id: 21, name: 'FJ Contracting KSA', country: 'KSA', division: 'Engineering' },

  { id: 30, name: 'FJ Investments', country: 'UAE', division: 'Investments' },

];



export const ALL_COUNTRIES = ['UAE', 'Qatar', 'Oman', 'KSA'];



const SENSITIVE_PAGES = [

  'balance-sheet',

  'fixed-assets',

  'cash-collection',

  'ap',

  'admin',

];



// ── Demo permissions: retained for demo sessions only ───────────────

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

  { legal_group_code: 'FJ_GROUP', legal_entity_name: "FJ Care Int'l", parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services' },

];



const ACCT_SCOPES = [

  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care UAE', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services' },

];



const SALES_SCOPES = [

  { legal_group_code: 'FJ_GROUP', legal_entity_name: 'FJ Care UAE', parent_division_name: 'FJ Care', subdivision_name: 'FJ Care Services', salesman: 'Hassan Al Nuaimi' },

];



// ── Demo users: existing accounts retained ──────────────────────────

export const DEMO_USERS = [

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

    allowedPages: ['exec-dashboard', 'dashboard', 'pl', 'working-capital', 'country-performance', 'excel-consolidator', 'profile'],

    module_permissions: EXEC_MODULES,

    access_scopes: HQ_ALL_SCOPES,

  },

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

    scope: { countries: ['UAE', 'Qatar'], entities: [1, 15, 10, 11], divisions: ['Flowtech UAE, QTR, OMN', 'FJ Care'] },

    exportRights: 'controlled',

    canManageUsers: false,

    allowedPages: ['dashboard', 'division', 'pl', 'ar', 'inventory', 'excel-consolidator', 'profile'],

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

    scope: { countries: ['UAE'], entities: [10, 11], divisions: ['FJ Care'] },

    exportRights: 'controlled',

    canManageUsers: false,

    allowedPages: ['dashboard', 'bu-pack', 'pl', 'ar', 'ap', 'inventory', 'salesman', 'excel-consolidator', 'profile'],

    module_permissions: BUM_MODULES,

    access_scopes: BU_SCOPES,

  },

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

    allowedPages: ['pl', 'balance-sheet', 'ar', 'ap', 'fixed-assets', 'cash-collection', 'revenue', 'excel-consolidator', 'profile'],

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

    allowedPages: ['salesman', 'revenue', 'excel-consolidator', 'profile'],

    module_permissions: SALES_MODULES,

    access_scopes: SALES_SCOPES,

  },

];



// ── Demo tiers: retained for login-page display ──────────────────────

export const DEMO_TIERS = [

  { tier: 'Board', icon: '♛', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', ids: ['u007'] },

  { tier: 'Executive', icon: '◆', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', ids: ['u001', 'u002'] },

  { tier: 'Management', icon: '▲', color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', ids: ['u003', 'u004'] },

  { tier: 'Finance', icon: '●', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)', ids: ['u005', 'u006'] },

];



// ── RBAC helpers ────────────────────────────────────────────────────

const normalizeCode = value =>

  String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');



const normalizePage = value =>

  String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');



const isBackendUser = user => user?.auth_source === 'backend';



const PAGE_TO_MODULE = {

  dashboard: 'DASHBOARD',

  'exec-dashboard': 'DASHBOARD',

  revenue: 'SALES_REVENUE',

  'sales-revenue': 'SALES_REVENUE',

  'salesman': 'SALES_REVENUE',

  pl: 'PROFIT_LOSS',

  'profit-loss': 'PROFIT_LOSS',

  'balance-sheet': 'BALANCE_SHEET',

  'operating-expenses': 'OPERATING_EXPENSES',

  opex: 'OPERATING_EXPENSES',

  'manufacturing-cost': 'MANUFACTURING_COST',
  'manufacturingcostdashboard': 'MANUFACTURING_COST',

  payables: 'PAYABLES',

  ap: 'PAYABLES',

  receivables: 'RECEIVABLES',

  ar: 'RECEIVABLES',

  'working-capital': 'WORKING_CAPITAL',

  inventory: 'INVENTORY',

  'fixed-assets': 'FIXED_ASSETS',

  'financial-position': 'FINANCIAL_POSITION',

  masterdata: 'MASTER_DATA',

  'master-data': 'MASTER_DATA',

  admin: 'USER_MANAGEMENT',

};



const PAGE_ALIASES = {

  financialposition: 'financial-position',

  workingcapital: 'working-capital',

  'sales-revenue-report': 'revenue',

};



function getModulePermission(user, moduleCode) {

  if (!Array.isArray(user?.module_permissions)) return null;



  const expectedCode = normalizeCode(moduleCode);



  return user.module_permissions.find(

    permission => normalizeCode(permission?.module_code) === expectedCode

  ) || null;

}



function isValidBackendProfile(profile) {

  return Boolean(

    profile &&

    profile.active !== false &&

    Array.isArray(profile.module_permissions) &&

    Array.isArray(profile.access_scopes)

  );

}



function clearStoredTokens() {

  localStorage.removeItem('token');

  localStorage.removeItem('finsight_token');

}



// ── Provider ────────────────────────────────────────────────────────

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);



  // ── Restore session ───────────────────────────────────────────────

  // A backend session is restored only after /api/access/me succeeds.

  useEffect(() => {

    let cancelled = false;



    async function restoreSession() {

      let saved = null;



      try {

        saved = JSON.parse(localStorage.getItem('finsight_user') || 'null');

      } catch {

        localStorage.removeItem('finsight_user');

      }



      const token = getStoredToken();



      if (token) {

        try {

          const accessProfile = await getCurrentUser(token);



          if (!isValidBackendProfile(accessProfile)) {

            throw new Error('The backend profile is inactive or missing required permissions/scopes.');

          }



          if (cancelled) return;



          const resolvedRole =

            accessProfile.role_code || accessProfile.role || 'accountant';



          const updatedUser = {

            ...accessProfile,

            auth_source: 'backend',

            id: accessProfile.user_profile_id || accessProfile.id,

            name: accessProfile.employee_name || accessProfile.full_name || 'User',

            email: accessProfile.official_email || accessProfile.email || '',

            employee_name: accessProfile.employee_name || accessProfile.full_name || '',

            employee_code: accessProfile.employee_code || null,

            designation: accessProfile.designation || '',

            department: accessProfile.department || '',

            role: resolvedRole,

            role_code: accessProfile.role_code || resolvedRole,

            role_name: accessProfile.role_name || resolvedRole,

            roleLabel: accessProfile.role_name || resolvedRole,

            avatar: (accessProfile.employee_name || accessProfile.official_email || 'U')

              .slice(0, 2)

              .toUpperCase(),

            // Backend scopes are authoritative. Never merge demo scopes.

            scope: null,

            exportRights: null,

            canManageUsers: getModulePermission(accessProfile, 'USER_MANAGEMENT')?.can_admin === true,

            defaultPage: '/dashboard',

            // Backend access is based on module_permissions, not allowedPages.

            allowedPages: [],

            module_permissions: accessProfile.module_permissions,

            access_scopes: accessProfile.access_scopes,

            access_token: token,

            token,

          };



          setUser(updatedUser);

          localStorage.setItem('finsight_user', JSON.stringify(updatedUser));

          setLoading(false);

          return;

        } catch (err) {

          console.warn('[AuthContext] Backend session restore failed:', err);



          if (cancelled) return;



          // Never fall back to a cached backend profile after a failed refresh.

          localStorage.removeItem('finsight_user');



          if (err?.status === 401) {
            clearStoredTokens();
          }



          setUser(null);

          setLoading(false);

          return;

        }

      }



      if (cancelled) return;



      // Restore demo sessions only. Do not restore a backend session without a token.

      const savedIsDemo =

        saved &&

        saved.auth_source !== 'backend' &&

        DEMO_USERS.some(

          demo =>

            demo.id === saved.id &&

            demo.email?.toLowerCase() === saved.email?.toLowerCase()

        );



      if (savedIsDemo) {

        setUser({ ...saved, auth_source: 'demo' });

      } else {

        localStorage.removeItem('finsight_user');

        setUser(null);

      }



      setLoading(false);

    }



    restoreSession();



    return () => {

      cancelled = true;

    };

  }, []);



  // Step 1: Check demo credentials only; MFA flow remains controlled by LoginPage.

  function verifyCredentials(email, password) {

    const trimmedEmail = email?.trim() || '';

    const trimmedPassword = password?.trim() || '';



    const found = DEMO_USERS.find(

      demo =>

        demo.email.toLowerCase() === trimmedEmail.toLowerCase() &&

        demo.password === trimmedPassword

    );



    if (!found) {

      _auditWrite('login_failed', { attemptedEmail: trimmedEmail });

      return { success: false, error: 'Invalid credentials' };

    }



    const { password: _pwd, ...safe } = found;

    return { success: true, user: { ...safe, auth_source: 'demo' } };

  }



  // Step 2: Called after MFA passes; preserve existing demo login behavior.

  function completeLogin(safeUser) {

    if (!safeUser) return;



    const sessionUser = {

      ...safeUser,

      auth_source: safeUser.auth_source || 'demo',

    };



    setUser(sessionUser);

    localStorage.setItem('finsight_user', JSON.stringify(sessionUser));



    _auditWrite('login', {

      userId: sessionUser.id,

      userName: sessionUser.name,

      userRole: sessionUser.role,

    });

  }



  // Backward compatibility for existing non-MFA demo login callers.

  function login(email, password) {

    const result = verifyCredentials(email, password);

    if (result.success) completeLogin(result.user);

    return result;

  }



  function logout() {

    _auditWrite('logout');

    setUser(null);

    localStorage.removeItem('finsight_user');



    // Preserve the existing backend logout/token cleanup.

    try {

      const result = logoutFromBackend();

      if (result && typeof result.catch === 'function') {

        result.catch(err => console.warn('[AuthContext] Backend logout failed:', err));

      }

    } catch (err) {

      console.warn('[AuthContext] Backend logout failed:', err);

    }

  }



  // ── Backend login ─────────────────────────────────────────────────

  // No demo-user permissions or role-based fallbacks are used here.

  async function loginWithBackend(email, password) {

    let token = null;



    try {

      const response = await _apiLogin(email, password);

      token = response?.token;



      if (!token) {

        throw new Error('The login response did not include an access token.');

      }



      const accessProfile = await getCurrentUser(token);



      if (!isValidBackendProfile(accessProfile)) {

        throw new Error(

          'Your account is inactive or the backend profile is missing permissions or access scopes.'

        );

      }



      const resolvedRole =

        accessProfile.role_code || accessProfile.role || 'accountant';



      const session = {

        ...accessProfile,

        auth_source: 'backend',

        access_token: token,

        token,

        id: accessProfile.user_profile_id || accessProfile.id,

        name: accessProfile.employee_name || accessProfile.full_name || 'User',

        email: accessProfile.official_email || accessProfile.email || email,

        employee_name: accessProfile.employee_name || accessProfile.full_name || '',

        employee_code: accessProfile.employee_code || null,

        designation: accessProfile.designation || '',

        department: accessProfile.department || '',

        role: resolvedRole,

        role_code: accessProfile.role_code || resolvedRole,

        role_name: accessProfile.role_name || resolvedRole,

        roleLabel: accessProfile.role_name || resolvedRole,

        avatar: (accessProfile.employee_name || email || 'U')

          .slice(0, 2)

          .toUpperCase(),

        // No role-based or demo-based authorization fallback.

        scope: null,

        exportRights: null,

        canManageUsers: getModulePermission(accessProfile, 'USER_MANAGEMENT')?.can_admin === true,

        defaultPage: '/dashboard',

        allowedPages: [],

        module_permissions: accessProfile.module_permissions,

        access_scopes: accessProfile.access_scopes,

      };



      completeLogin(session);

      return session;

    } catch (err) {

      console.warn('[AuthContext] Backend login/profile validation failed:', err);



      // Fail closed: don't keep a partially authenticated session.

      setUser(null);

      localStorage.removeItem('finsight_user');



      try {

        clearStoredTokens();

        const result = logoutFromBackend();

        if (result && typeof result.catch === 'function') {

          result.catch(() => { });

        }

      } catch {

        // Preserve the original authentication error.

      }



      throw err;

    }

  }



  // ── On-demand profile refresh ─────────────────────────────────────

  async function refreshProfile() {

    const token = getStoredToken();



    if (!token) return null;



    try {

      // Keep the existing service import available for compatibility.

      const accessProfile = await getCurrentUser(token);



      if (!isValidBackendProfile(accessProfile)) {

        throw new Error('The backend profile is inactive or missing permissions/scopes.');

      }



      const previousUser = user;



      const updated = {

        ...accessProfile,

        auth_source: 'backend',

        id: accessProfile.user_profile_id || accessProfile.id,

        name: accessProfile.employee_name || accessProfile.full_name || 'User',

        email: accessProfile.official_email || accessProfile.email || '',

        employee_name: accessProfile.employee_name || '',

        employee_code: accessProfile.employee_code || null,

        designation: accessProfile.designation || '',

        department: accessProfile.department || '',

        role: accessProfile.role_code || accessProfile.role || 'accountant',

        role_code: accessProfile.role_code || accessProfile.role || 'accountant',

        role_name: accessProfile.role_name || accessProfile.role_code || '',

        roleLabel: accessProfile.role_name || accessProfile.role_code || '',

        avatar: previousUser?.avatar ||

          (accessProfile.employee_name || accessProfile.official_email || 'U')

            .slice(0, 2)

            .toUpperCase(),

        scope: null,

        exportRights: null,

        canManageUsers: getModulePermission(accessProfile, 'USER_MANAGEMENT')?.can_admin === true,

        defaultPage: '/dashboard',

        allowedPages: [],

        module_permissions: accessProfile.module_permissions,

        access_scopes: accessProfile.access_scopes,

        access_token: token,

        token,

      };



      setUser(updated);

      localStorage.setItem('finsight_user', JSON.stringify(updated));



      return accessProfile;

    } catch (err) {

      console.warn('[AuthContext] refreshProfile failed:', err);



      // Fail closed rather than retaining stale permissions after a denied refresh.

      setUser(null);

      localStorage.removeItem('finsight_user');



      if (err?.status === 401) {
        clearStoredTokens();
      }



      return null;

    }

  }



  // ── Module/page access ────────────────────────────────────────────

  function canAccess(page) {

    if (!user) return false;



    const normalizedPage = normalizePage(page);

    const resolvedPage = PAGE_ALIASES[normalizedPage] || normalizedPage;



    // The profile page is available to the authenticated user.

    if (resolvedPage === 'profile') return true;



    // Backend users must rely exclusively on backend module permissions.

    if (isBackendUser(user)) {

      const moduleCode = PAGE_TO_MODULE[resolvedPage];

      if (!moduleCode) return false;



      const permission = getModulePermission(user, moduleCode);

      return permission?.can_view === true;

    }



    // Existing demo-user authorization is preserved.

    if (user.allowedPages?.includes('*')) return true;



    if (

      Array.isArray(user.allowedPages) &&

      user.allowedPages.some(allowed => normalizePage(allowed) === resolvedPage)

    ) {

      return true;

    }



    const moduleCode = PAGE_TO_MODULE[resolvedPage];

    if (!moduleCode) return false;



    const permission = getModulePermission(user, moduleCode);

    return permission?.can_view === true;

  }



  // ── Export authorization ──────────────────────────────────────────

  function canAdmin(moduleCode) {
    if (!user || !moduleCode) return false;
    return canAdminPermission(user.module_permissions, normalizeCode(moduleCode));
  }
  function hasExportRight(type) {

    if (!user || !type) return false;



    const normalizedType = normalizeCode(type);



    if (isBackendUser(user)) {

      // Backend exports must be checked against the specific module.

      // A file format such as "excel" alone is not an authorization scope.

      return canExportPermission(
        user.module_permissions,
        normalizedType
      );

    }



    // Preserve legacy demo export rules.

    const typeMap = { ALL: 3, EXCEL: 2, PDF: 2, CSV: 1 };



    if (typeMap[normalizedType] !== undefined) {

      const rightsMap = {

        full: 3,

        controlled: 2,

        operational: 2,

        limited: 1,

      };



      return (rightsMap[user.exportRights] || 0) >= typeMap[normalizedType];

    }



    const permission = getModulePermission(user, normalizedType);

    if (permission) return permission.can_export === true;



    if (

      ['board', 'cfo', 'admin'].includes(

        String(user.role || '').toLowerCase()

      )

    ) {

      return true;

    }



    return false;

  }



  // ── Data scope helpers ─────────────────────────────────────────────

  // Backend users must use authorized filter-options APIs in the modules.

  // Never return demo entity/country lists for a backend session.

  function getScopedEntities() {

    if (!user) return [];



    if (isBackendUser(user)) {

      // access_scopes contain hierarchy names, not the legacy demo entity IDs.

      // Return only scoped entity records in the legacy shape; no country is inferred.

      const scopes = Array.isArray(user.access_scopes) ? user.access_scopes : [];

      const uniqueEntities = new Map();



      scopes.forEach(scope => {

        const entityName = scope?.legal_entity_name;

        if (!entityName) return;



        const key = `${scope?.legal_group_code || ''}::${entityName}`;



        if (!uniqueEntities.has(key)) {

          uniqueEntities.set(key, {

            id: key,

            name: entityName,

            country: null,

            division: scope?.parent_division_name || null,

            legal_group_code: scope?.legal_group_code || null,

          });

        }

      });



      return Array.from(uniqueEntities.values());

    }



    const scope = user.scope;



    if (scope?.countries === 'all' && scope?.entities === 'all') {

      return ALL_ENTITIES;

    }



    return ALL_ENTITIES.filter(entity => {

      const countryOk =

        !scope?.countries ||

        scope.countries === 'all' ||

        (Array.isArray(scope.countries) && scope.countries.includes(entity.country));



      const entityOk =

        !scope?.entities ||

        scope.entities === 'all' ||

        (Array.isArray(scope.entities) && scope.entities.includes(entity.id));



      return countryOk && entityOk;

    });

  }



  function getScopedCountries() {

    if (!user) return [];



    if (isBackendUser(user)) {

      // access_scopes do not provide an authoritative country field.

      // Country options must come from the backend's authorized filter options.

      return [];

    }



    const scope = user.scope;



    if (scope?.countries === 'all') return ALL_COUNTRIES;



    return Array.isArray(scope?.countries) ? scope.countries : ALL_COUNTRIES;

  }



  function getScopedSalesperson() {

    if (!user) return null;



    if (isBackendUser(user)) {

      // Do not infer salesperson restrictions from unrelated profile fields.

      return null;

    }



    return user.scope?.salesman || null;

  }



  // ── Sensitive page access ─────────────────────────────────────────

  function hasSensitiveAccess(page) {

    if (!user) return false;



    const normalizedPage = normalizePage(page);

    const resolvedPage = PAGE_ALIASES[normalizedPage] || normalizedPage;



    if (!SENSITIVE_PAGES.includes(resolvedPage)) return true;



    if (isBackendUser(user)) {

      const moduleCode = PAGE_TO_MODULE[resolvedPage];

      if (!moduleCode) return false;



      return getModulePermission(user, moduleCode)?.can_view === true;

    }



    // Preserve the existing demo-only sensitive page restriction.

    return ['board', 'cfo'].includes(

      String(user.role || '').toLowerCase()

    );

  }



  function auditLog(action, payload = {}) {

    _auditWrite(action, payload);

  }



  // ── Compatibility shim for MyProfile.jsx ──────────────────────────

  function getAccessScopes() {

    if (!user) return [];



    if (Array.isArray(user.access_scopes)) {

      return user.access_scopes;

    }



    return Array.isArray(user.allowedPages) ? user.allowedPages : [];

  }



  return (

    <AuthContext.Provider

      value={{

        user,

        login,

        logout,

        canAccess,
        canAdmin,

        hasExportRight,

        loading,

        verifyCredentials,

        completeLogin,

        loginWithBackend,

        getScopedEntities,

        getScopedCountries,

        getScopedSalesperson,

        hasSensitiveAccess,

        auditLog,

        getAccessScopes,

        refreshProfile,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth() {

  return useContext(AuthContext);

}
