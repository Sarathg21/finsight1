

import api from "./axios";

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
        params.append(
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

   GET /api/opex/summary
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

        return getResponseData(response);

    } catch (error) {
        throw getApiError(error);
    }
};


/* =========================================================
   CATEGORY COMPARISON

   GET /api/opex/category-comparison
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

   GET /api/opex/composition
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

   GET /api/opex/category-breakdown
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

   Lazy loaded only when user expands a category.

   GET /api/opex/category-detail
========================================================= */

export const getOpexCategoryDetail =
    async ({
        category,
        ...filters
    } = {}) => {
        try {
            const params = buildParams(
                filters,
                true
            );

            if (category) {
                params.append(
                    "category",
                    category
                );
            }

            const response = await api.get(
                "/opex/category-detail",
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
   MONTHLY

   GET /api/opex/monthly
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
            "/opex/monthly",
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
   CATEGORY DETAIL MONTHLY
========================================================= */

export const getOpexCategoryDetailMonthly =
    async (params = {}) => {
        try {
            const response = await api.get(
                "/opex/category-detail-monthly",
                {
                    params,
                }
            );

            return response.data;

        } catch (error) {
            throw getApiError(error);
        }
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

   GET /api/opex/category-breakdown/view-all

   Uses the SAME active dashboard filters.
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