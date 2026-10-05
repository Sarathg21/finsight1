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
 *
 * Fields:
 *
 *   net_working_capital
 *   total_current_assets
 *   total_current_liabilities
 *   current_ratio
 *   nwc_turnover_ratio
 *   total_investments
 *   equity_position
 *   fixed_assets_and_other_non_current_assets
 *   long_term_bank_borrowings
 *   short_term_bank_borrowings
 *   loan_from_related_party
 *
 * loan_from_related_party is currently expected to be null.
 *
 * IMPORTANT:
 * Do not convert null to 0 here.
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
 *
 * Fields:
 *
 *   share_capital
 *   additional_capital
 *   reserves_and_surplus
 *   partner_current_account
 *   current_year_profit
 *   equity_total
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
 *
 * One row per Parent Division.
 *
 * Fields:
 *
 *   parent_division_code
 *   parent_division_name
 *   share_capital
 *   additional_capital
 *   reserves_and_surplus
 *   partner_current_account
 *   current_year_profit
 *   equity_total
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
 *
 * Fields:
 *
 *   period_code
 *   period_month
 *   parent_division_code
 *   parent_division_name
 *   equity_total
 *
 * Used for:
 *
 *   Parent Division × Month
 *   Equity analysis
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
 *
 * Used for:
 *
 *   Fixed Assets View All
 *   Investments Analysis
 *   NWC by Parent Division
 *   Provision for Gratuity analysis
 *
 * IMPORTANT:
 *
 * Financial formulas are supplied by backend.
 * Do not recalculate them here.
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
 *
 * IMPORTANT:
 *
 * This is the single monthly endpoint used by:
 *
 *   1. Fixed Assets & Other Non-Current Assets
 *   2. Investments MoM
 *   3. Month on Month Net Working Capital
 *   4. Gratuity MoM
 *
 * Fields:
 *
 *   period_code
 *   period_month
 *   parent_division_code
 *   parent_division_name
 *   fixed_assets_and_other_non_current_assets
 *   provision_for_gratuity
 *   net_working_capital
 *   total_investments
 *
 * Do NOT create separate API requests for Fixed Assets
 * and NWC when this endpoint already returns both values.
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
 *
 * Used for:
 *
 *   Borrowing Position
 *   Borrowings View All
 *   Borrowing analysis by Parent Division
 *
 * Fields:
 *
 *   parent_division_code
 *   parent_division_name
 *   long_term_bank_borrowings
 *   short_term_bank_borrowings
 *   bank_borrowings_total
 *   loan_from_related_party
 *   total_borrowings
 *
 * IMPORTANT:
 *
 * loan_from_related_party = null
 * total_borrowings = null
 *
 * Do not replace null with 0.
 *
 * Do not substitute:
 *
 *   920008 Due to Related Party
 *
 * for:
 *
 *   Loan from Related Party
 *
 * bank_borrowings_total is the backend-provided
 * LT Bank Borrowings + ST Bank Borrowings value.
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
 *
 * One response is used for:
 *
 *   Long-Term Bank Loan MoM
 *   Short-Term Bank Borrowing MoM
 *   Combined Bank Borrowing trend
 *
 * Related Party Loan remains pending.
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
 *
 * Response:
 *
 *   total_current_assets
 *   total_current_liabilities
 *   current_assets[]
 *   current_liabilities[]
 *
 * Category structure:
 *
 *   category
 *   amount
 *   percentage_of_total
 *
 * Zero-value categories may be absent from backend response.
 *
 * Do not manufacture missing categories in this API service.
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
 *
 * One row per Parent Division.
 *
 * Current Assets:
 *
 *   inventories
 *   trade_receivables
 *   other_current_assets
 *   prepayments_and_advances
 *   cash_and_bank
 *   due_from_related_party
 *   total_current_assets
 *
 * Current Liabilities:
 *
 *   short_term_bank_borrowings
 *   trade_payables
 *   short_term_lease_liability
 *   other_current_liabilities
 *   due_to_related_party
 *   total_current_liabilities
 *
 * Working Capital:
 *
 *   net_working_capital
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

    /*
     * IMPORTANT:
     * This ONE endpoint is used by both:
     *
     * Fixed Assets & Other Non-Current Assets
     * Month on Month Net Working Capital
     */
    getFinancialPositionInvestmentsMonthlyByParentDivision,

    /* --------------------------------------------------------
       Borrowings
    -------------------------------------------------------- */

    /*
     * Borrowing Position uses this endpoint.
     */
    getFinancialPositionBorrowingsByParentDivision,

    getFinancialPositionBorrowingsMonthlyByParentDivision,

    /* --------------------------------------------------------
       Current Assets / Current Liabilities
    -------------------------------------------------------- */

    getFinancialPositionCurrentAssetsLiabilitiesComposition,
    getFinancialPositionCurrentAssetsLiabilitiesViewAll,
    getFinancialPositionNetWorkingCapitalTrend,
};

export default financialPositionApi;







