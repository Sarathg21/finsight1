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
  salesmen: ['Hassan Al Nuaimi', 'John Doe', 'Sarah Connor']
};

const MOCK_SUMMARY = {
  mtd_revenue: 14250000,
  ytd_revenue: 168900000,
  prev_mtd_revenue: 13100000,
  prev_ytd_revenue: 154000000,
  mtd_change_pct: 8.78,
  ytd_change_pct: 9.68,
  top_legal_entity: { name: 'FJ HQ', value: 7850000, pct: 55.09 },
  top_parent_division: { name: 'Engineering', value: 6540000, pct: 45.89 },
  currency: 'AED',
  data_as_of: new Date().toISOString(),
  current_year_label: 'Current Year',
  previous_year_label: 'Previous Year'
};

const MOCK_TREND = {
  data: [
    { period: 'Jan', current_year: 12000000, previous_year: 11000000, target: 11500000 },
    { period: 'Feb', current_year: 13500000, previous_year: 12200000, target: 13000000 },
    { period: 'Mar', current_year: 14200000, previous_year: 13000000, target: 13800000 },
    { period: 'Apr', current_year: 15100000, previous_year: 14000000, target: 14500000 },
    { period: 'May', current_year: 16200000, previous_year: 14800000, target: 15500000 },
    { period: 'Jun', current_year: 17500000, previous_year: 15500000, target: 16800000 },
  ]
};

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
    { sales_person: 'Hassan Al Nuaimi', legal_entity: 'FJ HQ', division: 'Corporate', total_revenue: 4550000, mtd_revenue: 4550000, ytd_revenue: 52000000, target: 5000000, achievement_pct: 91.0, transaction_count: 58, currency: 'AED' },
    { sales_person: 'John Doe', legal_entity: 'FJ Care UAE', division: 'FJ Care', total_revenue: 3890000, mtd_revenue: 3890000, ytd_revenue: 45000000, target: 4000000, achievement_pct: 97.25, transaction_count: 47, currency: 'AED' },
    { sales_person: 'Sarah Connor', legal_entity: 'Flowtech Qatar', division: 'Flowtech UAE, QTR, OMN', total_revenue: 3100000, mtd_revenue: 3100000, ytd_revenue: 36000000, target: 3000000, achievement_pct: 103.33, transaction_count: 39, currency: 'AED' },
    { sales_person: 'Mike Ross', legal_entity: 'FJ Engineering KSA', division: 'Engineering', total_revenue: 1850000, mtd_revenue: 1850000, ytd_revenue: 21500000, target: 2000000, achievement_pct: 92.5, transaction_count: 28, currency: 'AED' },
    { sales_person: 'Rachel Zane', legal_entity: 'FJ HQ', division: 'Corporate', total_revenue: 860000, mtd_revenue: 860000, ytd_revenue: 14400000, target: 1000000, achievement_pct: 86.0, transaction_count: 17, currency: 'AED' },
  ],
  total: 14250000,
  count: 5
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

function getMockDataForPath(path) {
  if (path.includes('/filters')) return MOCK_FILTERS;
  if (path.includes('/summary')) return MOCK_SUMMARY;
  if (path.includes('/trend')) return MOCK_TREND;
  if (path.includes('/legal-entity-detail')) return MOCK_LEGAL_ENTITY_DETAIL;
  if (path.includes('/parent-division-detail')) return MOCK_PARENT_DIVISION_DETAIL;
  if (path.includes('/subdivision-detail')) return MOCK_SUBDIVISION_DETAIL;
  if (path.includes('/salesman-detail')) return MOCK_SALESMAN_DETAIL;
  if (path.includes('/legal-entity')) return MOCK_LEGAL_ENTITY;
  if (path.includes('/parent-division')) return MOCK_PARENT_DIVISION;
  if (path.includes('/subdivision')) return MOCK_SUBDIVISION;
  if (path.includes('/details')) return MOCK_DETAILS;
  if (path.includes('/top-customers')) return MOCK_TOP_CUSTOMERS;
  if (path.includes('/by-salesman')) return MOCK_BY_SALESMAN;
  if (path.includes('/gross-margin')) return MOCK_GROSS_MARGIN;
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
}


/* ── Filter params builder ─────────────────────────────────────── */

/**
 * Normalise the filter state object into API-ready query params.
 * Maps frontend filter keys to the backend parameter names.
 */
function buildParams(filters = {}) {
  return {
    from_date:              filters.fromDate        || undefined,
    to_date:                filters.toDate          || undefined,
    legal_entity:           filters.legalEntity !== 'All' ? filters.legalEntity  : undefined,
    division_code:          filters.parentDiv   !== 'All' ? filters.parentDiv    : undefined,
    subdivision_code:       filters.subDiv      !== 'All' ? filters.subDiv       : undefined,
    business_unit:          filters.businessUnit !== 'All' ? filters.businessUnit : undefined,
    sales_person:           filters.salesman    !== 'All' ? filters.salesman     : undefined,
    customer_name:          filters.customerName            || undefined,
    customer_account_number:filters.customerAccountNumber   || undefined,
    project_reference:      filters.projectReference        || undefined,
    invoice_currency:       filters.invoiceCurrency         || undefined,
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
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error(`Export failed: ${res.status}`);
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
      })
      .catch(err => {
        console.error('[salesRevenueApi] Export error:', err);
        alert(`Export failed: ${err.message}`);
      });
  } else {
    // Demo mode — no token, open URL directly
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
