/**

 * Sales Revenue API Service

 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

 * All calls include JWT Bearer token from localStorage.

 * Base URL is read from the Vite env variable VITE_API_BASE_URL

 * (defaults to http://13.233.207.68:8000 for local development).

 */



// IMPORTANT: Keep ?? (not ||) here.

import { LEGAL_ENTITIES } from '../data/masterData';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';



/* â”€â”€ JWT helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */



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



  if (!token) {

    console.warn(`[salesRevenueApi] Token missing for: ${path}. Throwing Unauthorized.`);

    throw { status: 401, message: 'Unauthorized - No token found', isAuthError: true };

  }



  const qs = new URLSearchParams(

    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null && v !== 'All')

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

    if (res.status === 401) {

      localStorage.removeItem('finsight_token');

      throw {

        status: 401,

        message: 'Unauthorized - Token expired or invalid',

        isAuthError: true,

      };

    }



    if (res.status === 403) {

      throw {

        status: 403,

        message: 'Forbidden - Access denied',

        isAuthError: false,

      };

    }



    // Capture the full response body for debugging 502s/500s

    const rawBody = await res.text().catch(() => '');

    let body = {};

    try { body = JSON.parse(rawBody); } catch { /* non-JSON body */ }



    let message = body?.error?.message || body?.message;

    if (!message && body?.detail) {

      message = typeof body.detail === 'string' ? body.detail : Array.isArray(body.detail) ? body.detail.map(d => typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d)).join(', ') : JSON.stringify(body.detail);

    }

    if (!message && body?.error && typeof body.error === 'string') message = body.error;

    if (!message) message = rawBody.slice(0, 120) || res.statusText || 'Error occurred';



    console.error(

      `[salesRevenueApi] ${res.status} on ${url}`,

      '\nBody:', rawBody.slice(0, 500)

    );



    throw { status: res.status, message: String(message), rawBody: rawBody.slice(0, 300) };

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





/* â”€â”€ Filter params builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */



/**

 * Normalise the filter state object into API-ready query params.

 * Maps frontend camelCase filter keys â†’ exact backend snake_case param names.

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

    // â”€â”€ Date range â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    from_date:               filters.fromDate                  || undefined,

    to_date:                 filters.toDate                    || undefined,

    // â”€â”€ Dimension filters (stg_sales_revenue_detail) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    legal_entity:            active(filters.legalEntity),

    division_code:           active(filters.parentDiv),

    subdivision_code:        active(filters.subDiv),

    sales_person:            active(filters.salesman),          // backend field: sales_person

    invoice_currency:        active(filters.invoiceCurrency),
    reporting_currency:      active(filters.reportingCurrency),

    // â”€â”€ Customer / transaction filters (details endpoint) â”€â”€â”€â”€â”€â”€â”€

    customer_name:           filters.customerName              || undefined,

    customer_account_number: filters.customerAccountNumber     || undefined,

    project_reference:       filters.projectReference         || undefined,

  };

}



/* â”€â”€ Export URL builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */



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

    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null && v !== 'All')

  ).toString();



  const url = `${API_BASE}/api/sales-revenue/${endpoint}/export${qs ? `?${qs}` : ''}`;



  if (!token) {

    return Promise.reject(new Error('Unauthorized - No token found for export'));

  }



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

}



/* â”€â”€ Public API functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */



/**

 * GET /api/sales-revenue/filters

 * Returns available filter options (dropdown values).

 */





/**

 * GET /api/sales-revenue/filter-options

 * Cascading filter options

 */


export async function fetchFilterOptions(params = {}) {
  const apiParams = {};
  if (params.legalEntity && params.legalEntity !== 'All') apiParams.legal_entity = params.legalEntity;
  if (params.parentDiv && params.parentDiv !== 'All') apiParams.parent_division = params.parentDiv;
  if (params.subDiv && params.subDiv !== 'All') apiParams.subdivision = params.subDiv;

  const raw = await apiCall('/api/sales-revenue/filter-options', apiParams);
  const res = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};

  return {
    legal_entities: Array.isArray(res.legal_entities) ? res.legal_entities : [],
    parent_divisions: Array.isArray(res.parent_divisions) ? res.parent_divisions : [],
    sub_divisions: Array.isArray(res.subdivisions) ? res.subdivisions : [],
    salesmen: Array.isArray(res.salesmen) ? res.salesmen : [],
    currencies: Array.isArray(res.currencies) ? res.currencies : []
  };
}


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





 */

export async function fetchSummaryDetail(filters) {

  return apiCall('/api/sales-revenue/summary-detail', buildParams(filters));

}



export async function fetchAccessMe() {
  return apiCall('/api/access/me');
}

export async function fetchRolePermissions(roleCode) {
  return apiCall('/api/admin/roles/' + roleCode + '/permissions');
}
