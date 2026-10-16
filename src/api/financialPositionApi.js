/**
 * ============================================================
 * Financial Position API Service
 * ============================================================
 *
 * Financial Position Backend Integration
 *
 * Backend Endpoints:
 *
 *   GET /api/financial-position/kpis
 *
 *   GET /api/financial-position/equity-contribution
 *
 *   GET /api/financial-position/equity-contribution/view-all
 *
 *   GET /api/financial-position/equity-contribution/monthly-by-parent-division
 *
 *   GET /api/financial-position/investments/by-parent-division
 *
 *   GET /api/financial-position/investments/monthly-by-parent-division
 *
 *   GET /api/financial-position/borrowings/by-parent-division
 *
 *   GET /api/financial-position/borrowings/monthly-by-parent-division
 *
 *   GET /api/financial-position/current-assets-liabilities/composition
 *
 *   GET /api/financial-position/current-assets-liabilities/by-parent-division
 *
 *   GET /api/financial-position/net-working-capital/trend
 *   GET /api/financial-position/net-working-capital/view-all
 *   GET /api/financial-position/net-working-capital/view-all/export/excel
 *   GET /api/financial-position/net-working-capital/view-all/export/pdf
 *
 *   GET /api/financial-position/equity-contribution/view-all/export/excel
 *   GET /api/financial-position/equity-contribution/view-all/export/pdf
 *   GET /api/financial-position/equity-contribution/monthly-by-parent-division/export/excel
 *   GET /api/financial-position/equity-contribution/monthly-by-parent-division/export/pdf
 *
 *   GET /api/financial-position/investments/by-parent-division/export/excel
 *   GET /api/financial-position/investments/by-parent-division/export/pdf
 *   GET /api/financial-position/investments/monthly-by-parent-division/export/excel
 *   GET /api/financial-position/investments/monthly-by-parent-division/export/pdf
 *
 *   GET /api/financial-position/borrowings/by-parent-division/export/excel
 *   GET /api/financial-position/borrowings/by-parent-division/export/pdf
 *   GET /api/financial-position/borrowings/monthly-by-parent-division/export/excel
 *   GET /api/financial-position/borrowings/monthly-by-parent-division/export/pdf
 *
 *   GET /api/financial-position/current-assets-liabilities/by-parent-division/export/excel
 *   GET /api/financial-position/current-assets-liabilities/by-parent-division/export/pdf
 *
 * ============================================================
 *
 * COMMON FILTER PARAMETERS
 *
 *   calendar_date
 *   legal_group_id[]
 *   legal_entity_id[]
 *   parent_division_id[]
 *   subdivision_id[]
 *   reporting_currency
 *
 * Multi-select IDs are sent as repeated query parameters:
 *
 *   parent_division_id=2
 *   parent_division_id=3
 *
 * NOT:
 *
 *   parent_division_id=2,3
 *
 * Default reporting currency:
 *
 *   AED
 *
 * IMPORTANT:
 *
 * - Backend returns values in requested reporting currency.
 * - No frontend FX conversion is performed here.
 * - No financial formulas are recalculated here.
 * - Backend null values are preserved.
 * ============================================================
 */

import axios from "axios";

/* ============================================================
   API BASE URL
============================================================ */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/* ============================================================
   AXIOS INSTANCE
============================================================ */

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/* ============================================================
   AUTHENTICATION
============================================================ */

/**
 * Get FinSight authentication token.
 *
 * Supports the token locations used by the existing
 * FinSight API services.
 */
function getAuthToken() {
    return (
        localStorage.getItem("finsight_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

/**
 * Build authorization headers.
 */
function getAuthHeaders() {
    const token = getAuthToken();

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

/* ============================================================
   QUERY PARAMETER HELPERS
============================================================ */

/**
 * Append a query parameter.
 *
 * Supported values:
 *   - string
 *   - number
 *   - array
 *
 * Arrays are appended as repeated query parameters.
 *
 * Example:
 *
 *   parent_division_id=2
 *   parent_division_id=3
 */
function appendParam(params, key, value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return;
    }

    /* --------------------------------------------------------
       Array / Multi-select
    -------------------------------------------------------- */

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (
                item !== undefined &&
                item !== null &&
                item !== ""
            ) {
                params.append(key, String(item));
            }
        });

        return;
    }

    /* --------------------------------------------------------
       Scalar
    -------------------------------------------------------- */

    params.append(key, String(value));
}

/* ============================================================
   STANDARD FINANCIAL POSITION PARAMETERS
============================================================ */

/**
 * Build common Financial Position query parameters.
 *
 * Every Financial Position endpoint uses the same filters:
 *
 *   calendar_date
 *   legal_group_id
 *   legal_entity_id
 *   parent_division_id
 *   subdivision_id
 *   reporting_currency
 *
 * The hierarchy IDs support multi-select.
 */
function buildFinancialPositionParams(filters = {}) {
    const params = new URLSearchParams();

    /* --------------------------------------------------------
       Calendar Date
    -------------------------------------------------------- */

    appendParam(
        params,
        "calendar_date",
        filters.calendar_date
    );

    /* --------------------------------------------------------
       Legal Group
    -------------------------------------------------------- */

    appendParam(
        params,
        "legal_group_id",
        filters.legal_group_id
    );

    /* --------------------------------------------------------
       Legal Entity
    -------------------------------------------------------- */

    appendParam(
        params,
        "legal_entity_id",
        filters.legal_entity_id
    );

    /* --------------------------------------------------------
       Parent Division
    -------------------------------------------------------- */

    appendParam(
        params,
        "parent_division_id",
        filters.parent_division_id
    );

    /* --------------------------------------------------------
       Sub-Division
    -------------------------------------------------------- */

    appendParam(
        params,
        "subdivision_id",
        filters.subdivision_id
    );

    /* --------------------------------------------------------
       Reporting Currency
       Default = AED
    -------------------------------------------------------- */

    appendParam(
        params,
        "reporting_currency",
        filters.reporting_currency || "AED"
    );

    return params;
}

/* ============================================================
   1. KPI CARDS
============================================================ */

/**
 * GET
 * /api/financial-position/kpis
 */
export async function getFinancialPositionKpis(filters = {}) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/kpis",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   2. EQUITY CONTRIBUTION
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution
 */
export async function getFinancialPositionEquityContribution(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   3. EQUITY VIEW ALL
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution/view-all
 */
export async function getFinancialPositionEquityViewAll(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution/view-all",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   4. EQUITY MONTHLY BY PARENT DIVISION
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution/monthly-by-parent-division
 */
export async function getFinancialPositionEquityMonthlyByParentDivision(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution/monthly-by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   5. INVESTMENTS BY PARENT DIVISION
============================================================ */

/**
 * GET
 * /api/financial-position/investments/by-parent-division
 */
export async function getFinancialPositionInvestmentsByParentDivision(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/investments/by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   6. INVESTMENTS MONTHLY BY PARENT DIVISION
============================================================ */

/**
 * GET
 * /api/financial-position/investments/monthly-by-parent-division
 */
export async function getFinancialPositionInvestmentsMonthlyByParentDivision(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/investments/monthly-by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   7. BORROWINGS BY PARENT DIVISION
============================================================ */

/**
 * GET
 * /api/financial-position/borrowings/by-parent-division
 */
export async function getFinancialPositionBorrowingsByParentDivision(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/borrowings/by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   8. BORROWINGS MONTHLY BY PARENT DIVISION
============================================================ */

/**
 * GET
 * /api/financial-position/borrowings/monthly-by-parent-division
 */
export async function getFinancialPositionBorrowingsMonthlyByParentDivision(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/borrowings/monthly-by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   9. CURRENT ASSETS / LIABILITIES COMPOSITION
============================================================ */

/**
 * GET
 * /api/financial-position/current-assets-liabilities/composition
 */
export async function getFinancialPositionCurrentAssetsLiabilitiesComposition(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/current-assets-liabilities/composition",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   10. CURRENT ASSETS / LIABILITIES VIEW ALL
============================================================ */

/**
 * GET
 * /api/financial-position/current-assets-liabilities/by-parent-division
 */
export async function getFinancialPositionCurrentAssetsLiabilitiesViewAll(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/current-assets-liabilities/by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   11. NET WORKING CAPITAL TREND
============================================================ */

/**
 * GET
 * /api/financial-position/net-working-capital/trend
 */
export async function getFinancialPositionNetWorkingCapitalTrend(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/net-working-capital/trend",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   12. NET WORKING CAPITAL VIEW ALL
============================================================ */

/**
 * GET
 * /api/financial-position/net-working-capital/view-all
 */
export async function getFinancialPositionNetWorkingCapitalViewAll(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/net-working-capital/view-all",
        {
            params,
            headers: getAuthHeaders(),
        }
    );
}

/* ============================================================
   13. NET WORKING CAPITAL EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/net-working-capital/view-all/export/excel
 */
export async function exportFinancialPositionNetWorkingCapitalExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/net-working-capital/view-all/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   14. NET WORKING CAPITAL EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/net-working-capital/view-all/export/pdf
 */
export async function exportFinancialPositionNetWorkingCapitalPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/net-working-capital/view-all/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   15. EQUITY VIEW ALL EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution/view-all/export/excel
 */
export async function exportFinancialPositionEquityViewAllExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution/view-all/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   16. EQUITY VIEW ALL EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution/view-all/export/pdf
 */
export async function exportFinancialPositionEquityViewAllPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution/view-all/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   17. EQUITY MONTHLY EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution/monthly-by-parent-division/export/excel
 */
export async function exportFinancialPositionEquityMonthlyByParentDivisionExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution/monthly-by-parent-division/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   18. EQUITY MONTHLY EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/equity-contribution/monthly-by-parent-division/export/pdf
 */
export async function exportFinancialPositionEquityMonthlyByParentDivisionPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/equity-contribution/monthly-by-parent-division/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   19. INVESTMENTS BY PARENT DIVISION EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/investments/by-parent-division/export/excel
 */
export async function exportFinancialPositionInvestmentsByParentDivisionExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/investments/by-parent-division/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   20. INVESTMENTS BY PARENT DIVISION EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/investments/by-parent-division/export/pdf
 */
export async function exportFinancialPositionInvestmentsByParentDivisionPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/investments/by-parent-division/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   21. INVESTMENTS MONTHLY EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/investments/monthly-by-parent-division/export/excel
 */
export async function exportFinancialPositionInvestmentsMonthlyByParentDivisionExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/investments/monthly-by-parent-division/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   22. INVESTMENTS MONTHLY EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/investments/monthly-by-parent-division/export/pdf
 */
export async function exportFinancialPositionInvestmentsMonthlyByParentDivisionPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/investments/monthly-by-parent-division/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   23. BORROWINGS BY PARENT DIVISION EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/borrowings/by-parent-division/export/excel
 */
export async function exportFinancialPositionBorrowingsByParentDivisionExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/borrowings/by-parent-division/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   24. BORROWINGS BY PARENT DIVISION EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/borrowings/by-parent-division/export/pdf
 */
export async function exportFinancialPositionBorrowingsByParentDivisionPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/borrowings/by-parent-division/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   25. BORROWINGS MONTHLY EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/borrowings/monthly-by-parent-division/export/excel
 */
export async function exportFinancialPositionBorrowingsMonthlyByParentDivisionExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/borrowings/monthly-by-parent-division/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   26. BORROWINGS MONTHLY EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/borrowings/monthly-by-parent-division/export/pdf
 */
export async function exportFinancialPositionBorrowingsMonthlyByParentDivisionPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/borrowings/monthly-by-parent-division/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   27. CURRENT ASSETS / LIABILITIES EXPORT - EXCEL
============================================================ */

/**
 * GET
 * /api/financial-position/current-assets-liabilities/by-parent-division/export/excel
 */
export async function exportFinancialPositionCurrentAssetsLiabilitiesExcel(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/current-assets-liabilities/by-parent-division/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   28. CURRENT ASSETS / LIABILITIES EXPORT - PDF
============================================================ */

/**
 * GET
 * /api/financial-position/current-assets-liabilities/by-parent-division/export/pdf
 */
export async function exportFinancialPositionCurrentAssetsLiabilitiesPdf(
    filters = {}
) {
    const params = buildFinancialPositionParams(filters);

    return api.get(
        "/api/financial-position/current-assets-liabilities/by-parent-division/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const financialPositionApi = {
    /* --------------------------------------------------------
       KPI
    -------------------------------------------------------- */

    getFinancialPositionKpis,

    /* --------------------------------------------------------
       Equity
    -------------------------------------------------------- */

    getFinancialPositionEquityContribution,
    getFinancialPositionEquityViewAll,
    getFinancialPositionEquityMonthlyByParentDivision,

    /* --------------------------------------------------------
       Investments / Fixed Assets / NWC
    -------------------------------------------------------- */

    getFinancialPositionInvestmentsByParentDivision,

    getFinancialPositionInvestmentsMonthlyByParentDivision,

    /* --------------------------------------------------------
       Borrowings
    -------------------------------------------------------- */

    getFinancialPositionBorrowingsByParentDivision,

    getFinancialPositionBorrowingsMonthlyByParentDivision,

    /* --------------------------------------------------------
       Current Assets / Current Liabilities
    -------------------------------------------------------- */

    getFinancialPositionCurrentAssetsLiabilitiesComposition,
    getFinancialPositionCurrentAssetsLiabilitiesViewAll,

    /* --------------------------------------------------------
       Net Working Capital
    -------------------------------------------------------- */

    getFinancialPositionNetWorkingCapitalTrend,
    getFinancialPositionNetWorkingCapitalViewAll,

    exportFinancialPositionNetWorkingCapitalExcel,
    exportFinancialPositionNetWorkingCapitalPdf,

    /* --------------------------------------------------------
       Equity Contribution Exports
    -------------------------------------------------------- */

    exportFinancialPositionEquityViewAllExcel,
    exportFinancialPositionEquityViewAllPdf,

    exportFinancialPositionEquityMonthlyByParentDivisionExcel,
    exportFinancialPositionEquityMonthlyByParentDivisionPdf,

    /* --------------------------------------------------------
       Investments / Fixed Assets Exports
    -------------------------------------------------------- */

    exportFinancialPositionInvestmentsByParentDivisionExcel,
    exportFinancialPositionInvestmentsByParentDivisionPdf,

    exportFinancialPositionInvestmentsMonthlyByParentDivisionExcel,
    exportFinancialPositionInvestmentsMonthlyByParentDivisionPdf,

    /* --------------------------------------------------------
       Borrowings Exports
    -------------------------------------------------------- */

    exportFinancialPositionBorrowingsByParentDivisionExcel,
    exportFinancialPositionBorrowingsByParentDivisionPdf,

    exportFinancialPositionBorrowingsMonthlyByParentDivisionExcel,
    exportFinancialPositionBorrowingsMonthlyByParentDivisionPdf,

    /* --------------------------------------------------------
       Current Assets / Current Liabilities Exports
    -------------------------------------------------------- */

    exportFinancialPositionCurrentAssetsLiabilitiesExcel,
    exportFinancialPositionCurrentAssetsLiabilitiesPdf,
};

export default financialPositionApi;