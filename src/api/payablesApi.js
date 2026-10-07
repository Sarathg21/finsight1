
/**
 * Payables API Service
 * ─────────────────────────────────────────────
 *
 * Endpoints:
 *   GET /api/payables/filter-options
 *   GET /api/payables/dashboard
 *   GET /api/payables/view-all
 *   GET /api/payables/by-subdivision
 *   GET /api/payables/month-on-month
 *   GET /api/payables/export/excel
 *   GET /api/payables/export/pdf
 *
 * Authentication:
 *   Bearer token from localStorage
 *
 * Standard Payables parameters:
 *   - legal_group_id
 *   - legal_entity_id
 *   - parent_division_id
 *   - subdivision_id
 *   - aging_basis
 *   - as_on_date
 *   - reporting_currency
 *
 * View All additional parameters:
 *   - page
 *   - page_size
 *   - sort_by
 *   - sort_dir
 *   - supplier_id
 *   - source_currency
 *   - gl_code
 *   - search
 *
 * Month-on-Month additional parameter:
 *   - year
 *
 * Export endpoints:
 *   - Excel -> Blob response
 *   - PDF   -> Blob response
 */

import api from "./axios";

/* ─────────────────────────────────────────────
   AUTH TOKEN
   ───────────────────────────────────────────── */

function getAuthToken() {
    return (
        localStorage.getItem("finsight_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function getAuthHeaders() {
    const token = getAuthToken();

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
}

/* ─────────────────────────────────────────────
   QUERY PARAM HELPERS
   ───────────────────────────────────────────── */

/**
 * Appends a parameter.
 *
 * Supports:
 *   string
 *   number
 *   arrays
 *
 * Arrays are appended repeatedly:
 *
 * parent_division_id=13
 * parent_division_id=14
 */
function appendParam(params, key, value) {
    if (value === undefined || value === null || value === "") {
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (item !== undefined && item !== null && item !== "") {
                params.append(key, item);
            }
        });


        return;
    }

    params.append(key, value);
}

/* ─────────────────────────────────────────────
   STANDARD PAYABLES PARAMETERS
   ───────────────────────────────────────────── */

/**
 * Build standard Payables query parameters.
 *
 * Used by:
 *   - dashboard
 *   - by-subdivision
 *   - month-on-month
 *   - export/excel
 *   - export/pdf
 */
function buildDashboardParams(filters = {}) {
    const params = new URLSearchParams();

    appendParam(params, "legal_group_id", filters.legal_group_id);
    appendParam(params, "legal_entity_id", filters.legal_entity_id);
    appendParam(params, "parent_division_id", filters.parent_division_id);
    appendParam(params, "subdivision_id", filters.subdivision_id);

    appendParam(
        params,
        "aging_basis",
        filters.aging_basis || "DUE_DATE"
    );

    appendParam(params, "as_on_date", filters.as_on_date);

    appendParam(
        params,
        "reporting_currency",
        filters.reporting_currency || "AED"
    );
    appendParam(params, "supplier_type", filters.supplier_type);
    appendParam(params, "gl_code", filters.gl_code);

    return params;
}

/**
 * Build View All query parameters.
 */
function buildViewAllParams(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "page", filters.page ?? 1);
    appendParam(params, "page_size", filters.page_size ?? 50);

    appendParam(
        params,
        "sort_by",
        filters.sort_by || "total_payables"
    );

    appendParam(
        params,
        "sort_dir",
        filters.sort_dir || "desc"
    );

    appendParam(params, "supplier_id", filters.supplier_id);
    appendParam(params, "source_currency", filters.source_currency);
    appendParam(params, "gl_code", filters.gl_code);
    appendParam(params, "search", filters.search);

    return params;
}


/**
 * Build Export query parameters.
 *
 * Includes View All / drill-down filters so that
 * Excel/PDF exports contain only the currently filtered records.
 */
function buildExportParams(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "aging_bucket", filters.aging_bucket);
    appendParam(params, "balance_status", filters.balance_status);

    appendParam(params, "supplier_id", filters.supplier_id);
    appendParam(params, "source_currency", filters.source_currency);
    appendParam(params, "gl_code", filters.gl_code);
    appendParam(params, "search", filters.search);

    return params;
}

/* ─────────────────────────────────────────────
   FILTER OPTIONS
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/filter-options
 *
 * Returns the available Payables filter options.
 */
export async function getPayablesFilterOptions() {
    const response = await api.get("/payables/filter-options", {
        headers: getAuthHeaders(),
    });

    return response;
}

/* ─────────────────────────────────────────────
   DASHBOARD
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/dashboard
 *
 * Returns:
 *   - KPI cards
 *   - Aging summary
 *   - Payables trend
 *   - Parent Division breakdown
 *   - Top 10 suppliers
 *   - Business Unit breakdown
 *   - Sub-Division breakdown
 */
export async function getPayablesDashboard(filters = {}) {
    const params = buildDashboardParams(filters);

    const response = await api.get("/payables/dashboard", {
        params,
        headers: getAuthHeaders(),
    });

    return response;
}



export async function getPayablesOtherBalances(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "year", filters.year);

    const response = await api.get(
        "/payables/other-balances",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}
/* ─────────────────────────────────────────────
   VIEW ALL
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/view-all
 *
 * Supports:
 *   - Pagination
 *   - Sorting
 *   - Supplier filter
 *   - Source currency
 *   - GL code
 *   - Search
 */
export async function getPayablesViewAll(filters = {}) {
    const params = buildViewAllParams(filters);

    const response = await api.get("/payables/view-all", {
        params,
        headers: getAuthHeaders(),
    });

    return response;
}

/* ─────────────────────────────────────────────
   SUB-DIVISION
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/by-subdivision
 *
 * Returns Payables broken down by Sub-Division.
 *
 * Uses the standard Payables filters.
 *
 * Example:
 *
 * getPayablesBySubdivision({
 *   aging_basis: "DUE_DATE",
 *   as_on_date: "2026-09-17",
 *   reporting_currency: "AED",
 *   legal_group_id: [1],
 *   parent_division_id: [13, 14],
 * });
 */
export async function getPayablesBySubdivision(filters = {}) {
    const params = buildDashboardParams(filters);

    const response = await api.get("/payables/by-subdivision", {
        params,
        headers: getAuthHeaders(),
    });

    return response;
}

/* ─────────────────────────────────────────────
   MONTH-ON-MONTH
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/month-on-month?year=2026
 *
 * Returns Month-on-Month Payables values.
 *
 * Response values are expected under:
 *
 * monthly_values: {
 *   JAN: ...,
 *   FEB: ...,
 *   MAR: ...,
 *   ...
 *   DEC: ...
 * }
 *
 * Months without a successful snapshot return null.
 *
 * IMPORTANT:
 * Do not convert null to 0 here.
 */
export async function getPayablesMonthOnMonth(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "year", filters.year);

    const response = await api.get("/payables/month-on-month", {
        params,
        headers: getAuthHeaders(),
    });

    return response;
}

/* ─────────────────────────────────────────────
   EXPORT EXCEL
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/export/excel
 *
 * Returns a downloadable Excel file.
 *
 * IMPORTANT:
 * responseType must be "blob".
 *
 * Usage:
 *
 * const response = await exportPayablesExcel(filters);
 *
 * const blob = response.data;
 */
export async function exportPayablesExcel(filters = {}) {
    const params = buildExportParams(filters);

    const response = await api.get("/payables/export/excel", {
        params,
        headers: getAuthHeaders(),
        responseType: "blob",
    });

    return response;
}

/* ─────────────────────────────────────────────
   EXPORT PDF
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/export/pdf
 *
 * Returns a downloadable PDF file.
 *
 * IMPORTANT:
 * responseType must be "blob".
 *
 * Usage:
 *
 * const response = await exportPayablesPdf(filters);
 *
 * const blob = response.data;
 */
export async function exportPayablesPdf(filters = {}) {
    const params = buildExportParams(filters);

    const response = await api.get("/payables/export/pdf", {
        params,
        headers: getAuthHeaders(),
        responseType: "blob",
    });

    return response;
}



/* ─────────────────────────────────────────────
   PARENT DIVISION MONTH-ON-MONTH
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/month-on-month/parent-divisions
 *
 * Returns Parent Division Month-on-Month Payables values.
 *
 * Additional parameter:
 *   - year
 *
 * Supports the standard Payables filters plus:
 *   - supplier_type
 *   - gl_code
 *
 * Example:
 *
 * getPayablesParentDivisionMonthOnMonth({
 *   year: 2026,
 *   aging_basis: "DUE_DATE",
 *   as_on_date: "2026-09-17",
 *   reporting_currency: "AED",
 *   legal_group_id: [1],
 *   legal_entity_id: [2],
 *   parent_division_id: [13, 14],
 *   subdivision_id: [15],
 *   supplier_type: ["ALL"],
 *   gl_code: ["223801", "223802"],
 * });
 *
 * IMPORTANT:
 * Do not convert null month values to 0 here.
 */
export async function getPayablesParentDivisionMonthOnMonth(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "year", filters.year);

    // New Payables filters
    appendParam(params, "supplier_type", filters.supplier_type);
    appendParam(params, "gl_code", filters.gl_code);

    const response = await api.get(
        "/payables/month-on-month/parent-divisions",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}


/* ─────────────────────────────────────────────
   PARENT DIVISION MONTH-ON-MONTH EXPORT EXCEL
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/month-on-month/parent-divisions/export/excel
 *
 * Returns Parent Division Month-on-Month data
 * as a downloadable Excel file.
 *
 * IMPORTANT:
 * responseType must be "blob".
 */
export async function exportPayablesParentDivisionMonthOnMonthExcel(
    filters = {}
) {
    const params = buildDashboardParams(filters);

    appendParam(params, "year", filters.year);

    // New Payables filters
    appendParam(params, "supplier_type", filters.supplier_type);
    appendParam(params, "gl_code", filters.gl_code);

    const response = await api.get(
        "/payables/month-on-month/parent-divisions/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );

    return response;
}


/* ─────────────────────────────────────────────
   PARENT DIVISION MONTH-ON-MONTH EXPORT PDF
   ───────────────────────────────────────────── */

/**
 * GET /api/payables/month-on-month/parent-divisions/export/pdf
 *
 * Returns Parent Division Month-on-Month data
 * as a downloadable PDF file.
 *
 * IMPORTANT:
 * responseType must be "blob".
 */
export async function exportPayablesParentDivisionMonthOnMonthPdf(
    filters = {}
) {
    const params = buildDashboardParams(filters);

    appendParam(params, "year", filters.year);

    // New Payables filters
    appendParam(params, "supplier_type", filters.supplier_type);
    appendParam(params, "gl_code", filters.gl_code);

    const response = await api.get(
        "/payables/month-on-month/parent-divisions/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );

    return response;
}





