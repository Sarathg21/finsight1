

import api from "./axios";
import { deriveCategoryNaturalAccounts, buildOpexMonthlyReportData } from "../data/opexNaturalAccounts";

/* =========================================================
   OPEX API
   Base path: /api/opex
========================================================= */

/* =========================================================
   BUILD COMMON PARAMS

   Backend contract:
   - hierarchy filters use IDs
   - period_name is required for financial APIs
   - reporting_currency defaults to AED
   - multi-select IDs are repeated query params
========================================================= */

const buildParams = (filters = {}, includePeriod = true) => {
    const params = new URLSearchParams();

    const appendArray = (key, value) => {
        if (!value) return;

        const values = Array.isArray(value)
            ? value
            : [value];

        values.forEach((item) => {
            if (
                item !== undefined &&
                item !== null &&
                item !== "" &&
                item !== "all" &&
                item !== "All"
            ) {
                params.append(
                    key,
                    String(item)
                );
            }
        });
    };

    appendArray(
        "legal_group_id",
        filters.legal_group_id
    );

    appendArray(
        "legal_entity_id",
        filters.legal_entity_id
    );

    appendArray(
        "parent_division_id",
        filters.parent_division_id
    );

    appendArray(
        "subdivision_id",
        filters.subdivision_id
    );

    /* =====================================================
       YEAR

       Keep selected Year in the same filter context.
    ===================================================== */

    if (
        filters.year !== undefined &&
        filters.year !== null &&
        filters.year !== ""
    ) {
        params.append(
            "year",
            String(filters.year)
        );
    }

    /* =====================================================
       PERIOD
    ===================================================== */

    if (
        includePeriod &&
        filters.period_name
    ) {
        appendArray(
            "period_name",
            filters.period_name
        );
    }

    /* =====================================================
       COMPARE PERIOD
    ===================================================== */

    if (
        filters.compare_period_name
    ) {
        params.append(
            "compare_period_name",
            filters.compare_period_name
        );
    }

    /* =====================================================
       LEDGER CURRENCY
    ===================================================== */

    if (filters.ledger_currency) {
        params.append(
            "ledger_currency",
            filters.ledger_currency
        );
    }

    /* =====================================================
       REPORTING CURRENCY
    ===================================================== */

    params.append(
        "reporting_currency",
        filters.reporting_currency || "AED"
    );

    return params;
};


/* =========================================================
   NORMALIZE RESPONSE

   Handles APIs that return:
   response.data
   OR
   response.data.data
========================================================= */

const getResponseData = (response) => {
    const body = response?.data;

    if (
        body &&
        typeof body === "object" &&
        Object.prototype.hasOwnProperty.call(
            body,
            "data"
        )
    ) {
        return body.data;
    }

    return body;
};


/* =========================================================
   ERROR HELPER
========================================================= */

const getApiError = (error) => {
    const responseData =
        error?.response?.data;

    const message =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        error?.message ||
        "Failed to load OPEX data.";

    const normalizedError =
        new Error(message);

    normalizedError.status =
        error?.response?.status;

    normalizedError.response =
        error?.response;

    return normalizedError;
};


/* =========================================================
   FILTER OPTIONS

   GET /api/opex/filter-options
========================================================= */

export const getOpexFilterOptions = async (
    filters = {}
) => {
    try {
        const params = buildParams(
            filters,
            false
        );

        const response = await api.get(
            "/opex/filter-options",
            {
                params,
            }
        );

        return getResponseData(response);

    } catch (error) {
        throw getApiError(error);
    }
};

/* =========================================================
   SUMMARY

   Aggregated from /api/opex/expense-breakdown
========================================================= */

export const getOpexSummary = async (
    filters = {}
) => {
    try {
        const params = buildParams(
            filters,
            true
        );

        const response = await api.get(
            "/opex/summary",
            {
                params,
            }
        );

        const data = getResponseData(response) || {};

        return {
            data_as_of: data.data_as_of || null,
            period_name: data.period_name || null,
            selected_periods: data.selected_periods || [],
            year: data.year || null,

            actual_ptd_aed: data.actual_ptd_aed ?? null,
            target_ptd_aed: data.target_ptd_aed ?? null,
            variance_ptd_aed: data.variance_ptd_aed ?? null,
            variance_ptd_pct: data.variance_ptd_pct ?? null,

            actual_ytd_aed: data.actual_ytd_aed ?? null,
            target_ytd_aed: data.target_ytd_aed ?? null,
            variance_ytd_aed: data.variance_ytd_aed ?? null,
            variance_ytd_pct: data.variance_ytd_pct ?? null,

            actual_ptd: data.actual_ptd ?? null,
            target_ptd: data.target_ptd ?? null,
            variance_ptd: data.variance_ptd ?? null,

            actual_ytd: data.actual_ytd ?? null,
            target_ytd: data.target_ytd ?? null,
            variance_ytd: data.variance_ytd ?? null,

            variance_ptd_status: data.variance_ptd_status ?? null,
            variance_ytd_status: data.variance_ytd_status ?? null,

            reporting_currency:
                data.reporting_currency || "AED",

            conversion_rate_to_aed:
                data.conversion_rate_to_aed ?? null,
        };

    } catch (error) {
        throw getApiError(error);
    }
};


/* =========================================================
   CATEGORY COMPARISON

   GET /api/pl/expense-breakdown
========================================================= */

export const getOpexCategoryComparison =
    async (filters = {}) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            const response = await api.get(
                "/opex/category-comparison",
                {
                    params,
                }
            );

            return getResponseData(response);

        } catch (error) {
            throw getApiError(error);
        }
    };


/* =========================================================
   COMPOSITION

   GET /api/pl/expense-breakdown
========================================================= */

export const getOpexComposition =
    async (filters = {}) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            const response = await api.get(
                "/opex/composition",
                {
                    params,
                }
            );

            return getResponseData(response);

        } catch (error) {
            throw getApiError(error);
        }
    };


/* =========================================================
   COMPOSITION VIEW ALL

   GET /api/opex/composition/view-all

   Uses exactly the same filter context as
   the dashboard Composition API.
========================================================= */

export const getOpexCompositionViewAll =
    async (filters = {}) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            const response = await api.get(
                "/opex/composition/view-all",
                {
                    params,
                }
            );

            return getResponseData(response);

        } catch (error) {
            throw getApiError(error);
        }
    };


/* =========================================================
   COMPOSITION EXPORT

   GET /api/opex/composition/export

   format:
      excel
      pdf

   The active dashboard filters are sent unchanged.
========================================================= */

export const exportOpexComposition =
    async (
        filters = {},
        format = "excel"
    ) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            params.append(
                "format",
                format
            );

            const response = await api.get(
                "/opex/composition/export",
                {
                    params,
                    responseType: "blob",
                }
            );

            return response;

        } catch (error) {
            throw getApiError(error);
        }
    };


/* =========================================================
   CATEGORY BREAKDOWN

   GET /api/pl/expense-breakdown
========================================================= */

export const getOpexCategoryBreakdown =
    async (filters = {}) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            const response = await api.get(
                "/opex/category-breakdown",
                {
                    params,
                }
            );

            return getResponseData(response);

        } catch (error) {
            throw getApiError(error);
        }
    };


/* =========================================================
   CATEGORY DETAIL

   Authoritative Oracle GL chart of accounts derivation
========================================================= */

export const getOpexCategoryDetail =
    async ({
        category,
        item,
        ...filters
    } = {}) => {
        return deriveCategoryNaturalAccounts(item || filters, category);
    };


/* =========================================================
   MONTHLY

   GET /api/pl/expense-breakdown
========================================================= */

export const getOpexMonthly = async (
    filters = {}
) => {
    try {
        const params = buildParams(
            filters,
            true
        );

        const response = await api.get(
            "/opex/category-detail",
            {
                params,
            }
        );

        const liveData = getResponseData(response);
        const liveItems = Array.isArray(liveData)
            ? liveData
            : liveData?.items || liveData?.categories || [];

        return buildOpexMonthlyReportData(liveItems);

    } catch (error) {
        return buildOpexMonthlyReportData([]);
    }
};


/* =========================================================
   CATEGORY DETAIL MONTHLY

   Authoritative Oracle GL chart of accounts derivation
========================================================= */

export const getOpexCategoryDetailMonthly = async (
    { category, item, ...filters } = {}
) => {
    return deriveCategoryNaturalAccounts(item || filters, category);
};


export const exportOpexCategoryComparison = async (
    filters = {},
    format = "excel"
) => {
    try {
        const params = buildParams(filters, true);

        params.append("format", format);

        const response = await api.get(
            "/opex/category-comparison/export",
            {
                params,
                responseType: "blob",
            }
        );

        return response;
    } catch (error) {
        throw getApiError(error);
    }
};


/* =========================================================
   CATEGORY BREAKDOWN VIEW ALL

   GET /api/pl/expense-breakdown
========================================================= */

export const getOpexCategoryBreakdownViewAll =
    async (filters = {}) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            const response = await api.get(
                "/opex/category-breakdown/view-all",
                {
                    params,
                }
            );

            return getResponseData(response);

        } catch (error) {
            throw getApiError(error);
        }
    };

/* =========================================================
CATEGORY BREAKDOWN EXPORT

GET /api/opex/category-breakdown/export

format:
  excel
  pdf

Response is binary/blob.
========================================================= */

export const exportOpexCategoryBreakdown =
    async (
        filters = {},
        format = "excel"
    ) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            params.append(
                "format",
                format
            );

            const response = await api.get(
                "/opex/category-breakdown/export",
                {
                    params,
                    responseType: "blob",
                }
            );

            return response;

        } catch (error) {
            throw getApiError(error);
        }
    };

/* =========================================================
COMPLETE OPEX PAGE EXPORT

GET /api/opex/export

Exports the complete OPEX report, not just one section.

format:
  excel
  pdf

Uses the SAME active dashboard filters.
========================================================= */

export const exportOpexFullReport = async (
    filters = {},
    format = "excel"
) => {
    try {
        const params = buildParams(
            filters,
            true
        );

        params.append(
            "format",
            format
        );

        const response = await api.get(
            "/opex/export",
            {
                params,
                responseType: "blob",
            }
        );

        return response;

    } catch (error) {
        throw getApiError(error);
    }
};

/* =========================================================
   RECONCILIATION

   GET /api/opex/reconciliation

   Uses the SAME filter serialization as the other
   OPEX financial APIs.

   Multi-select period_name values are sent as
   repeated query parameters:
   period_name=Apr-26
   period_name=May-26
   period_name=Jun-26
========================================================= */

export const getOpexReconciliation = async (
    filters = {}
) => {
    try {
        const params = buildParams(
            filters,
            true
        );

        const response = await api.get(
            "/opex/reconciliation",
            {
                params,
            }
        );

        return getResponseData(response);

    } catch (error) {
        if (error?.response?.status === 404 || error?.status === 404) {
            return null;
        }
        throw getApiError(error);
    }
};