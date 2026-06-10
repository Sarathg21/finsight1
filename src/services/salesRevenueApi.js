/**
 * Sales Revenue API Service
 * ─────────────────────────
 * All calls include JWT Bearer token from localStorage.
 * Base URL is read from the Vite env variable VITE_API_BASE_URL
 * (defaults to http://13.233.207.68:8000 for local development).
 */

// IMPORTANT: Keep ?? (not ||) here.
// When VITE_API_BASE_URL is empty (""), API_BASE stays "" so all requests use
// relative paths (/api/...) intercepted by the Vite dev proxy → backend.
// Using || would bypass the proxy and cause CORS errors from the browser.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/* ── JWT helpers ───────────────────────────────────────────────── */

/**
 * Build the Authorization + Content-Type headers for every request.
 * Token key: localStorage.finsight_token  (written by the real backend after login).
 */
function getAuthHeaders() {
  const token = localStorage.getItem('finsight_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Mock data for Demo fallback ──────────────────────────────── */

const MOCK_FILTERS = {
  legal_groups: ['FJ Group'],
  legal_entities: ['FJ HQ', 'FJ Care UAE', 'FJ Care Int\'l', 'Flowtech Qatar', 'Flowtech Oman', 'FJ Engineering KSA'],
  parent_divisions: ['Corporate', 'FJ Care', 'Flowtech UAE, QTR, OMN', 'Engineering'],
  sub_divisions: ['HQ Operations', 'FJ Care Services', 'Flowtech Sales', 'Engineering Services'],
  salesmen: ['E000001-Hassan Al Nuaimi', 'E000037-Senan A. Alwan', 'E000063-Krikor Ohanian', 'E000002-John Doe', 'E000003-Sarah Connor']
};

const MOCK_SUMMARY = {
  // Core revenue
  total_revenue:       168900000,
  mtd_revenue:         14250000,
  ytd_revenue:         168900000,
  prev_mtd_revenue:    13100000,
  prev_ytd_revenue:    154000000,
  mtd_change_pct:      8.78,
  ytd_change_pct:      9.68,
  // Gross margin
  gross_margin:        59115000,
  gross_margin_pct:    35.00,
  prev_gross_margin:   52360000,
  gross_margin_change_pct: 12.90,
  // Counts
  total_customers:     47,
  total_salesmen:      12,
  // Drill-down highlights
  top_legal_entity:   { name: 'FJ HQ', value: 7850000, pct: 55.09 },
  top_parent_division:{ name: 'Engineering', value: 6540000, pct: 45.89 },
  currency:            'AED',
  data_as_of:          new Date().toISOString(),
  current_year_label:  'Current Year',
  previous_year_label: 'Previous Year',
};

const MOCK_TREND = [
  { period_name: 'Jan-26', sales_aed: 12000000 },
  { period_name: 'Feb-26', sales_aed: 13500000 },
  { period_name: 'Mar-26', sales_aed: 14200000 },
  { period_name: 'Apr-26', sales_aed: 15100000 },
  { period_name: 'May-26', sales_aed: 16200000 },
  { period_name: 'Jun-26', sales_aed: 17500000 },
];

const MOCK_LEGAL_ENTITY = {
  data: [
    { name: 'FJ HQ', value: 7850000, pct: 55.09 },
    { name: 'FJ Care UAE', value: 2450000, pct: 17.19 },
    { name: 'Flowtech Qatar', value: 1850000, pct: 12.98 },
    { name: 'FJ Engineering KSA', value: 2100000, pct: 14.74 },
  ],
  total: 14250000
};

const MOCK_PARENT_DIVISION = {
  data: [
    { name: 'Corporate', value: 7850000 },
    { name: 'FJ Care', value: 2450000 },
    { name: 'Flowtech UAE, QTR, OMN', value: 1850000 },
    { name: 'Engineering', value: 2100000 },
  ],
  total: 14250000
};

const MOCK_SUBDIVISION = {
  data: [
    { name: 'HQ Operations', value: 7850000 },
    { name: 'FJ Care Services', value: 2450000 },
    { name: 'Flowtech Sales', value: 1850000 },
    { name: 'Engineering Services', value: 2100000 },
  ],
  total: 14250000
};

/* ── Mock View-All Detail Data ────────────────────────────────── */

const MOCK_LEGAL_ENTITY_DETAIL = {
  data: [
    { legal_entity: 'FJ HQ', total_revenue: 7850000, mtd_revenue: 7850000, ytd_revenue: 92000000, transaction_count: 142, currency: 'AED' },
    { legal_entity: 'FJ Care UAE', total_revenue: 2450000, mtd_revenue: 2450000, ytd_revenue: 28000000, transaction_count: 85, currency: 'AED' },
    { legal_entity: 'Flowtech Qatar', total_revenue: 1850000, mtd_revenue: 1850000, ytd_revenue: 22000000, transaction_count: 63, currency: 'AED' },
    { legal_entity: 'FJ Engineering KSA', total_revenue: 2100000, mtd_revenue: 2100000, ytd_revenue: 26900000, transaction_count: 71, currency: 'AED' },
  ],
  total: 14250000,
  count: 4
};

const MOCK_PARENT_DIVISION_DETAIL = {
  data: [
    { division_name: 'Corporate', division_code: 'CORP', total_revenue: 7850000, mtd_revenue: 7850000, ytd_revenue: 92000000, transaction_count: 142, currency: 'AED' },
    { division_name: 'FJ Care', division_code: 'FJCARE', total_revenue: 2450000, mtd_revenue: 2450000, ytd_revenue: 28000000, transaction_count: 85, currency: 'AED' },
    { division_name: 'Flowtech UAE, QTR, OMN', division_code: 'FLOWTECH', total_revenue: 1850000, mtd_revenue: 1850000, ytd_revenue: 22000000, transaction_count: 63, currency: 'AED' },
    { division_name: 'Engineering', division_code: 'ENG', total_revenue: 2100000, mtd_revenue: 2100000, ytd_revenue: 26900000, transaction_count: 71, currency: 'AED' },
  ],
  total: 14250000,
  count: 4
};

const MOCK_SUBDIVISION_DETAIL = {
  data: [
    { subdivision_name: 'HQ Operations', subdivision_code: 'HQ-OPS', parent_division: 'Corporate', total_revenue: 7850000, mtd_revenue: 7850000, ytd_revenue: 92000000, transaction_count: 142, currency: 'AED' },
    { subdivision_name: 'FJ Care Services', subdivision_code: 'FJCARE-SVC', parent_division: 'FJ Care', total_revenue: 2450000, mtd_revenue: 2450000, ytd_revenue: 28000000, transaction_count: 85, currency: 'AED' },
    { subdivision_name: 'Flowtech Sales', subdivision_code: 'FLOWTECH-SLS', parent_division: 'Flowtech UAE, QTR, OMN', total_revenue: 1850000, mtd_revenue: 1850000, ytd_revenue: 22000000, transaction_count: 63, currency: 'AED' },
    { subdivision_name: 'Engineering Services', subdivision_code: 'ENG-SVC', parent_division: 'Engineering', total_revenue: 2100000, mtd_revenue: 2100000, ytd_revenue: 26900000, transaction_count: 71, currency: 'AED' },
  ],
  total: 14250000,
  count: 4
};

const MOCK_SALESMAN_DETAIL = {
  data: [
    {
      employee_id: 'EMP-1001',
      sales_person: 'Hassan Al Nuaimi',
      direct_manager: 'Ahmed Al Rashid',
      direct_manager_level: 'L3 – Sales Director',
      sales_manager: 'Khalid Al Mansoori',
      division_manager: 'Omar Bin Saeed',
      legal_entity: 'FJ HQ',
      parent_division: 'Corporate',
      subdivision: 'HQ Operations',
      business_unit: 'BU-001',
      sales_aed: 4550000,
      gross_margin: 1592500,
      contribution_pct: 31.93,
      transaction_count: 58,
      currency: 'AED',
    },
    {
      employee_id: 'EMP-1002',
      sales_person: 'John Doe',
      direct_manager: 'Ahmed Al Rashid',
      direct_manager_level: 'L3 – Sales Director',
      sales_manager: 'Khalid Al Mansoori',
      division_manager: 'Nasser Al Blooshi',
      legal_entity: 'FJ Care UAE',
      parent_division: 'FJ Care',
      subdivision: 'FJ Care Services',
      business_unit: 'BU-002',
      sales_aed: 3890000,
      gross_margin: 1361500,
      contribution_pct: 27.30,
      transaction_count: 47,
      currency: 'AED',
    },
    {
      employee_id: 'EMP-1003',
      sales_person: 'Sarah Connor',
      direct_manager: 'Faisal Al Hammadi',
      direct_manager_level: 'L3 – Sales Director',
      sales_manager: 'Rashed Al Suwaidi',
      division_manager: 'Hamdan Al Maktoum',
      legal_entity: 'Flowtech Qatar',
      parent_division: 'Flowtech UAE, QTR, OMN',
      subdivision: 'Flowtech Sales',
      business_unit: 'BU-003',
      sales_aed: 3100000,
      gross_margin: 1085000,
      contribution_pct: 21.75,
      transaction_count: 39,
      currency: 'AED',
    },
    {
      employee_id: 'EMP-1004',
      sales_person: 'Mike Ross',
      direct_manager: 'Faisal Al Hammadi',
      direct_manager_level: 'L4 – Regional Manager',
      sales_manager: 'Rashed Al Suwaidi',
      division_manager: 'Sultan Al Nuaimi',
      legal_entity: 'FJ Engineering KSA',
      parent_division: 'Engineering',
      subdivision: 'Engineering Services',
      business_unit: 'BU-004',
      sales_aed: 1850000,
      gross_margin: 647500,
      contribution_pct: 12.98,
      transaction_count: 28,
      currency: 'AED',
    },
    {
      employee_id: 'EMP-1005',
      sales_person: 'Rachel Zane',
      direct_manager: 'Ahmed Al Rashid',
      direct_manager_level: 'L4 – Regional Manager',
      sales_manager: 'Khalid Al Mansoori',
      division_manager: 'Omar Bin Saeed',
      legal_entity: 'FJ HQ',
      parent_division: 'Corporate',
      subdivision: 'HQ Operations',
      business_unit: 'BU-001',
      sales_aed: 860000,
      gross_margin: 301000,
      contribution_pct: 6.04,
      transaction_count: 17,
      currency: 'AED',
    },
  ],
  total_sales_aed: 14250000,
  count: 5,
};

const MOCK_DETAILS = {
  data: [
    {
      invoice_number: 'INV-2026-001',
      invoice_date: '2026-01-05',
      legal_entity: 'FJ HQ',
      division_code: 'CORP',
      subdivision_code: 'HQ-OPS',
      business_unit: 'BU-001',
      sales_person: 'Hassan Al Nuaimi',
      customer_name: 'Al Futtaim Carillion',
      customer_account_number: 'ACC-1001',
      project_reference: 'PRJ-2026-001',
      invoice_currency: 'AED',
      amount: 450000,
      base_amount: 450000,
    },
    {
      invoice_number: 'INV-2026-002',
      invoice_date: '2026-01-08',
      legal_entity: 'FJ Care UAE',
      division_code: 'FJCARE',
      subdivision_code: 'FJCARE-SVC',
      business_unit: 'BU-002',
      sales_person: 'John Doe',
      customer_name: 'Emaar Properties PJSC',
      customer_account_number: 'ACC-1002',
      project_reference: 'PRJ-2026-002',
      invoice_currency: 'AED',
      amount: 380000,
      base_amount: 380000,
    },
    {
      invoice_number: 'INV-2026-003',
      invoice_date: '2026-01-12',
      legal_entity: 'Flowtech Qatar',
      division_code: 'FLOWTECH',
      subdivision_code: 'FLOWTECH-SLS',
      business_unit: 'BU-003',
      sales_person: 'Sarah Connor',
      customer_name: 'Damac Properties',
      customer_account_number: 'ACC-1003',
      project_reference: 'PRJ-2026-003',
      invoice_currency: 'AED',
      amount: 290000,
      base_amount: 290000,
    },
    {
      invoice_number: 'INV-2026-004',
      invoice_date: '2026-01-15',
      legal_entity: 'FJ Engineering KSA',
      division_code: 'ENG',
      subdivision_code: 'ENG-SVC',
      business_unit: 'BU-004',
      sales_person: 'Mike Ross',
      customer_name: 'Arabtec Construction',
      customer_account_number: 'ACC-1004',
      project_reference: 'PRJ-2026-004',
      invoice_currency: 'AED',
      amount: 315000,
      base_amount: 315000,
    },
    {
      invoice_number: 'INV-2026-005',
      invoice_date: '2026-01-18',
      legal_entity: 'FJ HQ',
      division_code: 'CORP',
      subdivision_code: 'HQ-OPS',
      business_unit: 'BU-001',
      sales_person: 'Rachel Zane',
      customer_name: 'Sobha Realty',
      customer_account_number: 'ACC-1005',
      project_reference: 'PRJ-2026-005',
      invoice_currency: 'AED',
      amount: 175000,
      base_amount: 175000,
    },
  ],
  total_count: 5,
  limit: 50,
  offset: 0,
};

const MOCK_TOP_CUSTOMERS = {
  data: [
    { name: 'Al Futtaim Carillion', value: 3450000, pct: 24.21 },
    { name: 'Emaar Properties PJSC', value: 2890000, pct: 20.28 },
    { name: 'Damac Properties', value: 1850000, pct: 12.98 },
    { name: 'Arabtec Construction', value: 1650000, pct: 11.58 },
    { name: 'Sobha Realty', value: 1200000, pct: 8.42 },
    { name: 'Al Naboodah Contracting', value: 980000, pct: 6.88 },
    { name: 'Shapoorji Pallonji M.E.', value: 850000, pct: 5.96 },
    { name: 'Drake & Scull Int\'l', value: 600000, pct: 4.21 },
    { name: 'Habtoor Leighton Group', value: 450000, pct: 3.16 },
    { name: 'China State Construction', value: 330000, pct: 2.32 }
  ],
  total: 14250000
};

const MOCK_BY_SALESMAN = {
  data: [
    { name: 'Hassan Al Nuaimi', value: 4550000, target: 5000000, pct: 31.93 },
    { name: 'John Doe', value: 3890000, target: 4000000, pct: 27.30 },
    { name: 'Sarah Connor', value: 3100000, target: 3000000, pct: 21.75 },
    { name: 'Mike Ross', value: 1850000, target: 2000000, pct: 12.98 },
    { name: 'Rachel Zane', value: 860000, target: 1000000, pct: 6.04 }
  ],
  total: 14250000
};

const MOCK_CUSTOMER_SUMMARY = {
  data: [
    { customer_name: 'Al Futtaim Carillion', customer_account_number: 'ACC-1001', sales_aed: 3450000, gross_margin: 1207500, percentage: 24.21, transaction_count: 42, currency: 'AED' },
    { customer_name: 'Emaar Properties PJSC', customer_account_number: 'ACC-1002', sales_aed: 2890000, gross_margin: 1011500, percentage: 20.28, transaction_count: 35, currency: 'AED' },
    { customer_name: 'Damac Properties', customer_account_number: 'ACC-1003', sales_aed: 1850000, gross_margin: 647500, percentage: 12.98, transaction_count: 22, currency: 'AED' },
    { customer_name: 'Arabtec Construction', customer_account_number: 'ACC-1004', sales_aed: 1650000, gross_margin: 577500, percentage: 11.58, transaction_count: 18, currency: 'AED' },
    { customer_name: 'Sobha Realty', customer_account_number: 'ACC-1005', sales_aed: 1200000, gross_margin: 420000, percentage: 8.42, transaction_count: 15, currency: 'AED' },
  ],
  total_sales_aed: 11040000,
  count: 5
};

const MOCK_CUSTOMER_DETAIL = {
  data: [
    { customer_account_number: 'ACC-1001', customer_name: 'Al Futtaim Carillion', legal_entity: 'FJ HQ', business_unit: 'BU-001', sales_aed: 3450000, gross_margin: 1207500, contribution_pct: 24.21, currency: 'AED' },
    { customer_account_number: 'ACC-1002', customer_name: 'Emaar Properties PJSC', legal_entity: 'FJ Care UAE', business_unit: 'BU-002', sales_aed: 2890000, gross_margin: 1011500, contribution_pct: 20.28, currency: 'AED' },
    { customer_account_number: 'ACC-1003', customer_name: 'Damac Properties', legal_entity: 'Flowtech Qatar', business_unit: 'BU-003', sales_aed: 1850000, gross_margin: 647500, contribution_pct: 12.98, currency: 'AED' },
    { customer_account_number: 'ACC-1004', customer_name: 'Arabtec Construction', legal_entity: 'FJ Engineering KSA', business_unit: 'BU-004', sales_aed: 1650000, gross_margin: 577500, contribution_pct: 11.58, currency: 'AED' },
    { customer_account_number: 'ACC-1005', customer_name: 'Sobha Realty', legal_entity: 'FJ HQ', business_unit: 'BU-001', sales_aed: 1200000, gross_margin: 420000, contribution_pct: 8.42, currency: 'AED' },
  ],
  total_sales_aed: 11040000,
  count: 5
};

const MOCK_SALESMAN_SUMMARY = {
  data: [
    { sales_person: 'Hassan Al Nuaimi', sales_aed: 4550000, gross_margin: 1592500, percentage: 31.93, transaction_count: 58, currency: 'AED' },
    { sales_person: 'John Doe', sales_aed: 3890000, gross_margin: 1361500, percentage: 27.30, transaction_count: 47, currency: 'AED' },
    { sales_person: 'Sarah Connor', sales_aed: 3100000, gross_margin: 1085000, percentage: 21.75, transaction_count: 39, currency: 'AED' },
    { sales_person: 'Mike Ross', sales_aed: 1850000, gross_margin: 647500, percentage: 12.98, transaction_count: 28, currency: 'AED' },
    { sales_person: 'Rachel Zane', sales_aed: 860000, gross_margin: 301000, percentage: 6.04, transaction_count: 17, currency: 'AED' },
  ],
  total_sales_aed: 14250000,
  count: 5
};

const MOCK_GROSS_MARGIN = {
  gross_profit_mtd: 4987500,
  gross_margin_mtd_pct: 35.00,
  gross_profit_ytd: 59115000,
  gross_margin_ytd_pct: 35.00,
  prev_gross_profit_mtd: 4454000,
  prev_gross_margin_mtd_pct: 34.00,
  prev_gross_profit_ytd: 52360000,
  prev_gross_margin_ytd_pct: 34.00,
  mtd_change_pct: 11.98,
  ytd_change_pct: 12.90,
  trend: [
    { period: 'Jan', gross_profit: 4200000, gross_margin_pct: 35.0 },
    { period: 'Feb', gross_profit: 4725000, gross_margin_pct: 35.0 },
    { period: 'Mar', gross_profit: 4970000, gross_margin_pct: 35.0 },
    { period: 'Apr', gross_profit: 5285000, gross_margin_pct: 35.0 },
    { period: 'May', gross_profit: 5670000, gross_margin_pct: 35.0 },
    { period: 'Jun', gross_profit: 6125000, gross_margin_pct: 35.0 }
  ]
};

const MOCK_SUMMARY_DETAIL = {
  data: [
    {
      legal_entity: 'Alpine Coils', parent_division: 'Alpine', sub_division: 'Alpine Coils',
      business_unit: 'Coils BU',
      revenue_mtd: 28200000, revenue_prev_mtd: 24100000,
      revenue_ytd: 268400000, revenue_ytd_py: 225300000,
    },
    {
      legal_entity: 'DC Serve', parent_division: 'DC Serve', sub_division: 'DC Serve Equip.',
      business_unit: 'Service BU',
      revenue_mtd: 18400000, revenue_prev_mtd: 16200000,
      revenue_ytd: 184300000, revenue_ytd_py: 152100000,
    },
    {
      legal_entity: 'Filter Fan', parent_division: 'Alpine', sub_division: 'Filter Fan - UAE',
      business_unit: 'Fans BU',
      revenue_mtd: 12100000, revenue_prev_mtd: 9800000,
      revenue_ytd: 128400000, revenue_ytd_py: 110200000,
    },
    {
      legal_entity: 'Alpine Gears', parent_division: 'Alpine Gears', sub_division: 'Alpine Gears',
      business_unit: 'Gears BU',
      revenue_mtd: 7800000, revenue_prev_mtd: 6500000,
      revenue_ytd: 78600000, revenue_ytd_py: 64200000,
    },
    {
      legal_entity: 'Valves KSA', parent_division: 'DC Serve', sub_division: 'Valves KSA',
      business_unit: 'Valves BU',
      revenue_mtd: 6400000, revenue_prev_mtd: 5600000,
      revenue_ytd: 64250000, revenue_ytd_py: 52800000,
    },
    {
      legal_entity: 'CT KSA', parent_division: 'DC Serve', sub_division: 'CT KSA',
      business_unit: 'CT BU',
      revenue_mtd: 4200000, revenue_prev_mtd: 3800000,
      revenue_ytd: 42300000, revenue_ytd_py: 34600000,
    },
    {
      legal_entity: 'FJ Engineering', parent_division: 'Engineering', sub_division: 'Engineering Services',
      business_unit: 'Eng BU',
      revenue_mtd: 3100000, revenue_prev_mtd: 2900000,
      revenue_ytd: 31500000, revenue_ytd_py: 27400000,
    },
    {
      legal_entity: 'FJ Care UAE', parent_division: 'FJ Care', sub_division: 'FJ Care Services',
      business_unit: 'Care BU',
      revenue_mtd: 2800000, revenue_prev_mtd: 2400000,
      revenue_ytd: 28200000, revenue_ytd_py: 24100000,
    },
    {
      legal_entity: 'Flowtech Qatar', parent_division: 'Flowtech', sub_division: 'Flowtech Sales',
      business_unit: 'Flow BU',
      revenue_mtd: 2500000, revenue_prev_mtd: 2200000,
      revenue_ytd: 25100000, revenue_ytd_py: 22000000,
    },
    {
      legal_entity: 'Others', parent_division: 'Others', sub_division: 'Others',
      business_unit: 'Others',
      revenue_mtd: 2950000, revenue_prev_mtd: 2700000,
      revenue_ytd: 32400000, revenue_ytd_py: 28100000,
    },
  ]
};

function getMockDataForPath(path) {
  if (path.includes('/filters')) return MOCK_FILTERS;
  if (path.includes('/gross-margin')) return MOCK_GROSS_MARGIN;
  if (path.includes('/salesman-summary')) return MOCK_SALESMAN_SUMMARY;
  if (path.includes('/salesman-detail')) return MOCK_SALESMAN_DETAIL;
  if (path.includes('/summary-detail')) return MOCK_SUMMARY_DETAIL;
  if (path.includes('/summary')) return MOCK_SUMMARY;
  if (path.includes('/trend')) return MOCK_TREND;
  if (path.includes('/legal-entity-detail')) return MOCK_LEGAL_ENTITY_DETAIL;
  if (path.includes('/parent-division-detail')) return MOCK_PARENT_DIVISION_DETAIL;
  if (path.includes('/subdivision-detail')) return MOCK_SUBDIVISION_DETAIL;
  if (path.includes('/legal-entity')) return MOCK_LEGAL_ENTITY;
  if (path.includes('/parent-division')) return MOCK_PARENT_DIVISION;
  if (path.includes('/subdivision')) return MOCK_SUBDIVISION;
  if (path.includes('/details')) return MOCK_DETAILS;
  if (path.includes('/top-customers')) return MOCK_TOP_CUSTOMERS;
  if (path.includes('/customer-summary')) return MOCK_CUSTOMER_SUMMARY;
  if (path.includes('/customer-detail')) return MOCK_CUSTOMER_DETAIL;
  if (path.includes('/by-salesman')) return MOCK_BY_SALESMAN;
  return {};
}

/* ── Core fetch wrapper ────────────────────────────────────────── */

/**
 * Central request handler.
 * @param {string} path     - e.g. '/api/sales-revenue/summary'
 * @param {object} params   - query-string parameters (filters)
 * @returns {Promise<any>}  - parsed JSON response
 * @throws {{ status: number, message: string }}
 */
const apiCache = new Map();

async function apiCall(path, params = {}) {
  const token = localStorage.getItem('finsight_token');

  // If no token exists in localStorage, fall back to high-fidelity mock data.
  // This allows the page to work seamlessly when logged in via Demo Mode.
  if (!token) {
    console.warn(`[salesRevenueApi] Token missing. Returning local mock fallback data for: ${path}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDataForPath(path));
      }, 300); // simulate network latency
    });
  }

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString();

  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;

  // Deduplicate identical concurrent requests using a short-lived cache (solves React Strict Mode double-fetches)
  if (apiCache.has(url)) {
    return apiCache.get(url);
  }

  const fetchPromise = (async () => {
    let res;
    try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (networkErr) {
    const err = { status: 0, message: `Network error: ${networkErr.message}` };
    console.error('[salesRevenueApi] Network error on', url, networkErr);
    throw err;
  }

  if (!res.ok) {
    // Capture the full response body for debugging 502s
    const rawBody = await res.text().catch(() => '');
    let body = {};
    try { body = JSON.parse(rawBody); } catch { /* non-JSON body */ }

    const message =
      body?.detail ||
      body?.message ||
      body?.error ||
      rawBody.slice(0, 120) ||
      res.statusText;

    console.error(
      `[salesRevenueApi] ${res.status} on ${url}`,
      '\nBody:', rawBody.slice(0, 500)
    );

    throw { status: res.status, message, rawBody: rawBody.slice(0, 300) };
  }

  const json = await res.json();
  
  // Normalize response to always have a .data array if the backend returns a direct array
  if (Array.isArray(json)) {
    if (json.length > 0) {
      console.log(`\n========================================`);
      console.log(`[salesRevenueApi] FIRST ROW FOR ${path}:`);
      console.log(`KEYS:`, Object.keys(json[0]).join(', '));
      console.log(`DATA:`, JSON.stringify(json[0], null, 2));
      console.log(`========================================\n`);
    }
    return { data: json };
  }
  
  // If the backend returned an object but no .data field, try to find the array
  if (json && typeof json === 'object' && !('data' in json)) {
    const arrVal = Object.values(json).find(v => Array.isArray(v));
    if (arrVal) {
      if (arrVal.length > 0) {
        console.log(`\n========================================`);
        console.log(`[salesRevenueApi] FIRST ROW FOR ${path}:`);
        console.log(`KEYS:`, Object.keys(arrVal[0]).join(', '));
        console.log(`DATA:`, JSON.stringify(arrVal[0], null, 2));
        console.log(`========================================\n`);
      }
      return { ...json, data: arrVal };
    }
  }

    return json;
  })();

  apiCache.set(url, fetchPromise);
  // Keep in cache for 500ms to catch identical concurrent requests
  setTimeout(() => apiCache.delete(url), 500);

  return fetchPromise;
}


/* ── Filter params builder ─────────────────────────────────────── */

/**
 * Normalise the filter state object into API-ready query params.
 * Maps frontend camelCase filter keys → exact backend snake_case param names.
 *
 * Backend field names accepted by stg_sales_revenue_detail APIs:
 *   from_date, to_date, legal_entity, division_code, subdivision_code,
 *   business_unit, sales_person, invoice_currency
 *
 * NOTE: sales_person is the confirmed backend field name (not 'salesman').
 *       The selected value is passed as-is, e.g. "E002767-Sreejith Prasannan Pillai".
 */
function buildParams(filters = {}) {
  // Helper: return value only when it exists and is not a catch-all placeholder
  const active = (val) =>
    val && val !== 'All' && val !== 'all' ? val : undefined;

  return {
    // ── Date range ──────────────────────────────────────────────
    from_date:               filters.fromDate                  || undefined,
    to_date:                 filters.toDate                    || undefined,
    // ── Dimension filters (stg_sales_revenue_detail) ────────────
    legal_entity:            active(filters.legalEntity),
    division_code:           active(filters.parentDiv),
    subdivision_code:        active(filters.subDiv),
    sales_person:            active(filters.salesman),          // backend field: sales_person
    invoice_currency:        active(filters.invoiceCurrency),
    // ── Customer / transaction filters (details endpoint) ───────
    customer_name:           filters.customerName              || undefined,
    customer_account_number: filters.customerAccountNumber     || undefined,
    project_reference:       filters.projectReference         || undefined,
  };
}

/* ── Export URL builder ────────────────────────────────────────── */

/**
 * Triggers a file download for Excel or PDF export from the backend.
 * @param {string} endpoint - e.g. 'legal-entity-detail', 'details'
 * @param {'excel'|'pdf'} format
 * @param {object} filters  - current applied filters
 */
export function exportSalesRevenue(endpoint, format, filters = {}) {
  const token = localStorage.getItem('finsight_token');

  const params = {
    ...buildParams(filters),
    format,
  };

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString();

  const url = `${API_BASE}/api/sales-revenue/${endpoint}/export${qs ? `?${qs}` : ''}`;

  // Create a hidden anchor and click it to trigger download
  const a = document.createElement('a');
  a.href = url;
  if (token) {
    // For JWT-protected download endpoints the browser cannot set headers via <a>,
    // so we fetch the blob and create an object URL instead.
    // Return the Promise so callers can chain .then/.catch for feedback.
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error(`Export failed: ${res.status} ${res.statusText}`);
        return res.blob();
      })
      .then(blob => {
        const ext = format === 'excel' ? 'xlsx' : 'pdf';
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${endpoint}_export.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      });
    // Note: .catch is intentionally NOT chained here — let the caller handle it.
  } else {
    // Demo mode — no token, open URL directly (fire-and-forget, returns undefined)
    a.download = `${endpoint}_export.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/* ── Public API functions ──────────────────────────────────────── */

/**
 * GET /api/sales-revenue/filters
 * Returns available filter options (dropdown values).
 */
export async function fetchFilters() {
  return apiCall('/api/sales-revenue/filters', { currency: 'AED' });
}

/**
 * GET /api/sales-revenue/filter-options
 * Cascading filter options
 */
export async function fetchFilterOptions(params = {}) {
  const apiParams = {};
  if (params.legalEntity && params.legalEntity !== 'All') apiParams.legal_entity = params.legalEntity;
  if (params.parentDiv && params.parentDiv !== 'All') apiParams.parent_division = params.parentDiv;
  if (params.subDiv && params.subDiv !== 'All') apiParams.subdivision = params.subDiv;
  
  return apiCall('/api/sales-revenue/filter-options', apiParams);
}

/* ── View-All Detail APIs (new endpoints) ──────────────────────── */

/**
 * GET /api/sales-revenue/legal-entity-detail
 * Returns full detail table for all legal entities.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { legal_entity, total_revenue, mtd_revenue, ytd_revenue, transaction_count, currency }
 *   ],
 *   total: number,
 *   count: number
 * }
 */
export async function fetchLegalEntityDetail(filters) {
  return apiCall('/api/sales-revenue/legal-entity-detail', buildParams(filters));
}

/**
 * GET /api/sales-revenue/parent-division-detail
 * Returns full detail table for all parent divisions.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { division_name, division_code, total_revenue, mtd_revenue, ytd_revenue, transaction_count, currency }
 *   ],
 *   total: number,
 *   count: number
 * }
 */
export async function fetchParentDivisionDetail(filters) {
  return apiCall('/api/sales-revenue/parent-division-detail', buildParams(filters));
}

/**
 * GET /api/sales-revenue/subdivision-detail
 * Returns full detail table for all sub-divisions.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { subdivision_name, subdivision_code, parent_division, total_revenue, mtd_revenue, ytd_revenue, transaction_count, currency }
 *   ],
 *   total: number,
 *   count: number
 * }
 */
export async function fetchSubdivisionDetail(filters) {
  return apiCall('/api/sales-revenue/subdivision-detail', buildParams(filters));
}

/**
 * GET /api/sales-revenue/salesman-detail
 * Returns full detail table for all salespeople.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { sales_person, legal_entity, division, total_revenue, mtd_revenue, ytd_revenue, target, achievement_pct, transaction_count, currency }
 *   ],
 *   total: number,
 *   count: number
 * }
 */
export async function fetchSalesmanDetail(filters) {
  return apiCall('/api/sales-revenue/salesman-detail', buildParams(filters));
}

/**
 * GET /api/sales-revenue/details
 * Returns the full detailed transaction view with pagination.
 *
 * @param {object} filters     - applied filters
 * @param {number} limit       - rows per page (default 50)
 * @param {number} offset      - starting row index (default 0)
 *
 * Expected response shape:
 * {
 *   data: [
 *     {
 *       invoice_number, invoice_date, legal_entity, division_code, subdivision_code,
 *       business_unit, sales_person, customer_name, customer_account_number,
 *       project_reference, invoice_currency, amount, base_amount
 *     }
 *   ],
 *   total_count: number,
 *   limit: number,
 *   offset: number
 * }
 */
export async function fetchDetails(filters, limit = 50, offset = 0) {
  return apiCall('/api/sales-revenue/details', {
    ...buildParams(filters),
    limit,
    offset,
  });
}

/**
 * GET /api/sales-revenue/summary
 * Returns aggregate KPI summary (MTD/YTD revenue, change percentages, etc.).
 *
 * Expected response shape:
 * {
 *   mtd_revenue, ytd_revenue, prev_mtd_revenue, prev_ytd_revenue,
 *   mtd_change_pct, ytd_change_pct, top_legal_entity, top_parent_division,
 *   currency, data_as_of, current_year_label, previous_year_label
 * }
 */
export async function fetchSummary(filters) {
  return apiCall('/api/sales-revenue/summary', buildParams(filters));
}

/**
 * GET /api/sales-revenue/gross-margin
 * Returns gross margin KPI data.
 *
 * Expected response shape:
 * {
 *   gross_profit_mtd, gross_margin_mtd_pct, gross_profit_ytd, gross_margin_ytd_pct,
 *   prev_gross_profit_mtd, prev_gross_margin_mtd_pct,
 *   mtd_change_pct, ytd_change_pct,
 *   trend: [{ period, gross_profit, gross_margin_pct }]
 * }
 */
export async function fetchGrossMargin(filters) {
  return apiCall('/api/sales-revenue/gross-margin', buildParams(filters));
}

/**
 * GET /api/sales-revenue/salesman-summary
 * Returns summary table for all salespeople (used for KPI card & Salesman View All).
 *
 * Expected response shape:
 * {
 *   data: [
 *     { sales_person, sales_aed, gross_margin, percentage, transaction_count, currency }
 *   ],
 *   total_sales_aed, count
 * }
 */
export async function fetchSalesmanSummary(filters) {
  return apiCall('/api/sales-revenue/salesman-summary', buildParams(filters));
}

/**
 * GET /api/sales-revenue/trend
 * Returns the revenue trend data.
 *
 * Expected response shape (array):
 * [
 *   { period_name: 'Jan', sales_aed: 12000000 },
 *   ...
 * ]
 */
export async function fetchTrend(filters) {
  return apiCall('/api/sales-revenue/trend', buildParams(filters));
}

/**
 * GET /api/sales-revenue/legal-entity
 * Aggregated revenue by legal entity.
 */
export async function fetchLegalEntity(filters) {
  return apiCall('/api/sales-revenue/legal-entity', buildParams(filters));
}

/**
 * GET /api/sales-revenue/parent-division
 * Aggregated revenue by parent division.
 */
export async function fetchParentDivision(filters) {
  return apiCall('/api/sales-revenue/parent-division', buildParams(filters));
}

/**
 * GET /api/sales-revenue/subdivision
 * Aggregated revenue by subdivision.
 */
export async function fetchSubdivision(filters) {
  return apiCall('/api/sales-revenue/subdivision', buildParams(filters));
}

/**
 * GET /api/sales-revenue/by-salesman
 * Revenue vs target grouped by salesman.
 */
export async function fetchBySalesman(filters) {
  return apiCall('/api/sales-revenue/by-salesman', buildParams(filters));
}
/**
 * GET /api/sales-revenue/top-customers
 * Returns top customers aggregated data.
 */
export async function fetchTopCustomers(filters) {
  return apiCall('/api/sales-revenue/top-customers', buildParams(filters));
}

/**
 * GET /api/sales-revenue/customer-summary
 * Returns customer summary.
 */
export async function fetchCustomerSummary(filters) {
  return apiCall('/api/sales-revenue/customer-summary', buildParams(filters));
}

/**
 * GET /api/sales-revenue/customer-detail
 * Returns detailed view of customers.
 */
export async function fetchCustomerDetail(filters) {
  return apiCall('/api/sales-revenue/customer-detail', buildParams(filters));
}

/**
 * GET /api/sales-revenue/summary-detail
 * Returns the summary grid table with MTD/YTD revenue by Legal Entity,
 * Parent Division, Sub-Division, and Business Unit.
 *
 * Expected response shape:
 * {
 *   data: [
 *     {
 *       legal_entity, parent_division, sub_division, business_unit,
 *       revenue_mtd, revenue_prev_mtd, revenue_ytd, revenue_ytd_py
 *     }
 *   ]
 * }
 *
 * NOTE: Falls back to local mock data if the backend returns a 5xx error
 * (endpoint may not be implemented yet on the server).
 */
export async function fetchSummaryDetail(filters) {
  return apiCall('/api/sales-revenue/summary-detail', buildParams(filters))
    .catch((err) => {
      if (err?.status >= 500 || err?.status === 0) {
        console.warn(
          `[salesRevenueApi] summary-detail returned ${err?.status ?? 'network error'} — ` +
          'falling back to local mock data. Backend endpoint may not be implemented yet.'
        );
        return MOCK_SUMMARY_DETAIL;
      }
      // Re-throw auth errors and other client errors so the caller can handle them
      throw err;
    });
}
