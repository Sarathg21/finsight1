/**
 * ============================================================
 * Financial Position API Service
 * ============================================================
 *
 * Financial Position Backend Integration
 *
 * Endpoints:
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
 * Authentication:
 *   Bearer token from localStorage
 *
 * ============================================================
 *
 * Common Financial Position parameters:
 *
 *   - calendar_date
 *   - legal_group_id
 *   - legal_entity_id
 *   - parent_division_id
 *   - subdivision_id
 *   - reporting_currency
 *
 * Multi-select IDs are sent repeatedly:
 *
 *   parent_division_id=2
 *   parent_division_id=3
 *
 * NOT:
 *
 *   parent_division_id=2,3
 *
 * Default reporting currency:
 *   AED
 *
 * IMPORTANT:
 *   Financial formulas are calculated by the backend.
 *   No frontend financial recalculation is performed here.
 *
 * ============================================================
 */

import axios from "axios";

/* ─────────────────────────────────────────────
   API BASE URL
   ───────────────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/* ─────────────────────────────────────────────
   AXIOS INSTANCE
   ───────────────────────────────────────────── */

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/* ─────────────────────────────────────────────
   AUTH TOKEN
   ───────────────────────────────────────────── */

/**
 * Get FinSight authentication token.
 *
 * Supports the same token locations used by the
 * existing Payables API.
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
 *   - string
 *   - number
 *   - arrays
 *
 * Arrays are appended repeatedly.
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

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (
                item !== undefined &&
                item !== null &&
                item !== ""
            ) {
                params.append(key, item);
            }
        });

        return;
    }

    params.append(key, value);
}

/* ─────────────────────────────────────────────
   STANDARD FINANCIAL POSITION PARAMETERS
   ───────────────────────────────────────────── */

/**
 * Build standard Financial Position query parameters.
 *
 * Used by every Financial Position endpoint.
 *
 * Parameters:
 *
 *   - calendar_date
 *   - legal_group_id
 *   - legal_entity_id
 *   - parent_division_id
 *   - subdivision_id
 *   - reporting_currency
 */
function buildFinancialPositionParams(filters = {}) {
    const params = new URLSearchParams();

    /* ----------------------------------------------------------
       Calendar Date
    ---------------------------------------------------------- */

    appendParam(
        params,
        "calendar_date",
        filters.calendar_date
    );

    /* ----------------------------------------------------------
       Legal Group
    ---------------------------------------------------------- */

    appendParam(
        params,
        "legal_group_id",
        filters.legal_group_id
    );

    /* ----------------------------------------------------------
       Legal Entity
    ---------------------------------------------------------- */

    appendParam(
        params,
        "legal_entity_id",
        filters.legal_entity_id
    );

    /* ----------------------------------------------------------
       Parent Division
    ---------------------------------------------------------- */

    appendParam(
        params,
        "parent_division_id",
        filters.parent_division_id
    );

    /* ----------------------------------------------------------
       Sub-Division
    ---------------------------------------------------------- */

    appendParam(
        params,
        "subdivision_id",
        filters.subdivision_id
    );

    /* ----------------------------------------------------------
       Reporting Currency
       Default = AED
    ---------------------------------------------------------- */

    appendParam(
        params,
        "reporting_currency",
        filters.reporting_currency || "AED"
    );

    return params;
}

/* ─────────────────────────────────────────────
   1. KPI CARDS
   ───────────────────────────────────────────── */

/**
 * GET /api/financial-position/kpis
 *
 * Returns Financial Position KPI data.
 *
 * Fields:
 *
 *   - net_working_capital
 *   - total_current_assets
 *   - total_current_liabilities
 *   - current_ratio
 *   - nwc_turnover_ratio
 *   - total_investments
 *   - equity_position
 *   - fixed_assets_and_other_non_current_assets
 *   - long_term_bank_borrowings
 *   - short_term_bank_borrowings
 *   - loan_from_related_party
 *
 * IMPORTANT:
 *
 * loan_from_related_party is currently expected to be null
 * because the related-party loan Balance Sheet mapping is
 * still pending.
 *
 * Do not convert null to 0 in this API service.
 */
export async function getFinancialPositionKpis(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/kpis",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   2. EQUITY CONTRIBUTION
   ───────────────────────────────────────────── */

/**
 * GET /api/financial-position/equity-contribution
 *
 * Returns:
 *
 *   - share_capital
 *   - additional_capital
 *   - reserves_and_surplus
 *   - partner_current_account
 *   - current_year_profit
 *   - equity_total
 */
export async function getFinancialPositionEquityContribution(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/equity-contribution",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   3. EQUITY VIEW ALL
   ───────────────────────────────────────────── */

/**
 * GET /api/financial-position/equity-contribution/view-all
 *
 * Returns one row per Parent Division.
 *
 * Fields:
 *
 *   - parent_division_code
 *   - parent_division_name
 *   - share_capital
 *   - additional_capital
 *   - reserves_and_surplus
 *   - partner_current_account
 *   - current_year_profit
 *   - equity_total
 */
export async function getFinancialPositionEquityViewAll(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/equity-contribution/view-all",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   4. EQUITY MONTHLY BY PARENT DIVISION
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/equity-contribution/monthly-by-parent-division
 *
 * Returns:
 *
 *   - period_code
 *   - period_month
 *   - parent_division_code
 *   - parent_division_name
 *   - equity_total
 *
 * Used for:
 *
 *   Parent Division × Month
 *   Equity analysis
 *
 * This endpoint should only be called when the relevant
 * section is visible/required.
 */
export async function getFinancialPositionEquityMonthlyByParentDivision(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/equity-contribution/monthly-by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   5. INVESTMENTS BY PARENT DIVISION
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/investments/by-parent-division
 *
 * Fields include:
 *
 *   - parent_division_code
 *   - parent_division_name
 *   - total_non_current_assets
 *   - long_term_lease_liability
 *   - fixed_assets_and_other_non_current_assets
 *   - provision_for_gratuity
 *   - current_assets
 *   - current_liabilities
 *   - net_working_capital
 *   - total_investments
 *
 * Used for:
 *
 *   - Fixed Assets View All
 *   - Investments Analysis
 *   - NWC by Parent Division
 *   - Provision for Gratuity analysis
 *
 * IMPORTANT:
 * Financial formulas are supplied by the backend.
 * Do not recalculate them in this API file.
 */
export async function getFinancialPositionInvestmentsByParentDivision(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/investments/by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   6. INVESTMENTS MONTHLY BY PARENT DIVISION
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/investments/monthly-by-parent-division
 *
 * Fields:
 *
 *   - period_code
 *   - period_month
 *   - parent_division_code
 *   - parent_division_name
 *   - fixed_assets_and_other_non_current_assets
 *   - provision_for_gratuity
 *   - net_working_capital
 *   - total_investments
 *
 * ONE endpoint should be reused for:
 *
 *   - Fixed Assets MoM
 *   - Investments MoM
 *   - NWC MoM
 *   - Gratuity MoM
 *
 * Do not make four separate frontend API calls.
 */
export async function getFinancialPositionInvestmentsMonthlyByParentDivision(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/investments/monthly-by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   7. BORROWINGS BY PARENT DIVISION
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/borrowings/by-parent-division
 *
 * Fields:
 *
 *   - parent_division_code
 *   - parent_division_name
 *   - long_term_bank_borrowings
 *   - short_term_bank_borrowings
 *   - bank_borrowings_total
 *   - loan_from_related_party
 *   - total_borrowings
 *
 * IMPORTANT:
 *
 * loan_from_related_party = null currently.
 *
 * total_borrowings = null currently.
 *
 * Do not replace these null values with zero.
 *
 * Do not substitute 920008 Due to Related Party
 * as Loan from Related Party.
 *
 * bank_borrowings_total represents:
 *
 *   LT Bank Borrowings + ST Bank Borrowings
 */
export async function getFinancialPositionBorrowingsByParentDivision(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/borrowings/by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   8. BORROWINGS MONTHLY BY PARENT DIVISION
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/borrowings/monthly-by-parent-division
 *
 * Used for:
 *
 *   - Long-Term Bank Loan MoM
 *   - Short-Term Bank Borrowing MoM
 *   - Combined Bank Borrowing trend
 *
 * Related Party Loan remains pending.
 */
export async function getFinancialPositionBorrowingsMonthlyByParentDivision(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/borrowings/monthly-by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   9. CURRENT ASSETS / LIABILITIES COMPOSITION
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/current-assets-liabilities/composition
 *
 * Returns:
 *
 *   - total_current_assets
 *   - total_current_liabilities
 *   - current_assets[]
 *   - current_liabilities[]
 *
 * Each category contains:
 *
 *   - category
 *   - amount
 *   - percentage_of_total
 *
 * Current Asset categories:
 *
 *   - Inventories
 *   - Trade Receivables
 *   - Other Current Assets
 *   - Prepayments & Advances
 *   - Cash & Bank
 *   - Due from Related Party
 *
 * Current Liability categories:
 *
 *   - Short Term Bank Borrowings
 *   - Trade Payables
 *   - Lease Liability - Short Term
 *   - Other Current Liabilities
 *   - Due to Related Party
 *
 * Zero-value categories may not appear in the backend response.
 */
export async function getFinancialPositionCurrentAssetsLiabilitiesComposition(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/current-assets-liabilities/composition",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   10. CURRENT ASSETS / LIABILITIES VIEW ALL
   ───────────────────────────────────────────── */

/**
 * GET
 * /api/financial-position/current-assets-liabilities/by-parent-division
 *
 * One row per Parent Division.
 *
 * Includes:
 *
 *   - inventories
 *   - trade_receivables
 *   - other_current_assets
 *   - prepayments_and_advances
 *   - cash_and_bank
 *   - due_from_related_party
 *   - total_current_assets
 *   - short_term_bank_borrowings
 *   - trade_payables
 *   - short_term_lease_liability
 *   - other_current_liabilities
 *   - due_to_related_party
 *   - total_current_liabilities
 *   - net_working_capital
 *
 * Used for the combined View All table.
 */
export async function getFinancialPositionCurrentAssetsLiabilitiesViewAll(
    filters = {}
) {
    const params =
        buildFinancialPositionParams(filters);

    const response = await api.get(
        "/api/financial-position/current-assets-liabilities/by-parent-division",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response;
}

/* ─────────────────────────────────────────────
   DEFAULT EXPORT
   ───────────────────────────────────────────── */

/**
 * Default API object.
 *
 * This is provided in addition to the named exports so
 * either import style can be used.
 */
const financialPositionApi = {
    getFinancialPositionKpis,

    getFinancialPositionEquityContribution,

    getFinancialPositionEquityViewAll,

    getFinancialPositionEquityMonthlyByParentDivision,

    getFinancialPositionInvestmentsByParentDivision,

    getFinancialPositionInvestmentsMonthlyByParentDivision,

    getFinancialPositionBorrowingsByParentDivision,

    getFinancialPositionBorrowingsMonthlyByParentDivision,

    getFinancialPositionCurrentAssetsLiabilitiesComposition,

    getFinancialPositionCurrentAssetsLiabilitiesViewAll,
};

export default financialPositionApi;