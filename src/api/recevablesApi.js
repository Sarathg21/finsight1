import api from "./axios";

/* =========================================================
   COMMON API HELPERS
========================================================= */

const buildParams = (
  filters = {},
  includeEmpty = false
) => {
  const params = {};

  Object.entries(filters || {}).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null
      ) {
        return;
      }

      /*
       * Skip empty values unless explicitly requested.
       */
      if (
        !includeEmpty &&
        (
          value === "" ||
          value === "All" ||
          value === "all"
        )
      ) {
        return;
      }

      /*
       * Multi-select filters.
       *
       * Example:
       * legal_entity: [1, 2, 3]
       *
       * Axios will send:
       * ?legal_entity=1&legal_entity=2&legal_entity=3
       */
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (
            item === undefined ||
            item === null ||
            item === "" ||
            item === "All" ||
            item === "all"
          ) {
            return;
          }

          if (!params[key]) {
            params[key] = [];
          }

          params[key].push(item);
        });

        return;
      }

      params[key] = value;
    }
  );

  return params;
};


/* =========================================================
   RESPONSE HELPER
========================================================= */

const getResponseData = (response) => {
  return response?.data;
};


/* =========================================================
   ERROR HELPER
========================================================= */

const getApiError = (error) => {

  /*
   * Backend validation errors
   */
  if (Array.isArray(error?.response?.data?.detail)) {
    const message =
      error.response.data.detail
        .map(
          (item) =>
            item?.msg ||
            item?.message ||
            JSON.stringify(item)
        )
        .join(", ");

    return new Error(message);
  }

  /*
   * Backend normal error
   */
  if (error?.response?.data?.detail) {
    const detail =
      error.response.data.detail;

    return new Error(
      typeof detail === "string"
        ? detail
        : JSON.stringify(detail)
    );
  }

  /*
   * Backend message
   */
  if (error?.response?.data?.message) {
    return new Error(
      error.response.data.message
    );
  }

  /*
   * Axios error message
   */
  if (error?.message) {
    return new Error(error.message);
  }

  /*
   * Fallback
   */
  return new Error(
    "Something went wrong while processing the request."
  );
};


/* =========================================================
   FILTERS
   GET /api/receivables/filters
========================================================= */

export const getReceivableFilters = async () => {
  try {
    const response = await api.get(
      "/receivables/filters"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Receivables Filters API Error:",
      error
    );

    throw getApiError(error);
  }
};


/* =========================================================
   SUMMARY / KPI
   GET /api/receivables/summary
========================================================= */

export const getReceivableSummary = async (
  filters = {}
) => {
  try {
    const params = buildParams(
      filters,
      false
    );

    const response = await api.get(
      "/receivables/summary",
      {
        params,
      }
    );

    return getResponseData(response);
  } catch (error) {
    console.error(
      "Receivables Summary API Error:",
      error
    );

    throw getApiError(error);
  }
};


/* =========================================================
   TOP CUSTOMERS
   GET /api/receivables/top-customers
========================================================= */

export const getReceivableTopCustomers = async (
  filters = {}
) => {
  try {
    const params = buildParams(
      filters,
      false
    );

    const response = await api.get(
      "/receivables/top-customers",
      {
        params,
      }
    );

    return getResponseData(response);
  } catch (error) {
    console.error(
      "Receivables Top Customers API Error:",
      error
    );

    throw getApiError(error);
  }
};


/* =========================================================
   DIVISION-WISE
   GET /api/receivables/division-wise
========================================================= */

export const getReceivableDivisionWise = async (
  filters = {}
) => {
  try {
    const params = buildParams(
      filters,
      false
    );

    const response = await api.get(
      "/receivables/division-wise",
      {
        params,
      }
    );

    return getResponseData(response);
  } catch (error) {
    console.error(
      "Receivables Division-wise API Error:",
      error
    );

    throw getApiError(error);
  }
};


/* =========================================================
   AGING BUCKETS
   GET /api/receivables/buckets
========================================================= */

export const getReceivableBuckets = async (
  filters = {}
) => {
  try {
    const params = buildParams(
      filters,
      false
    );

    const response = await api.get(
      "/receivables/buckets",
      {
        params,
      }
    );

    return getResponseData(response);
  } catch (error) {
    console.error(
      "Receivables Aging Buckets API Error:",
      error
    );

    throw getApiError(error);
  }
};


/* =========================================================
   OVERDUE AGEING
   GET /api/receivables/overdue-buckets
========================================================= */

export const getReceivableOverdueBuckets = async (
  filters = {}
) => {
  try {
    const params = buildParams(
      filters,
      false
    );

    const response = await api.get(
      "/receivables/overdue-buckets",
      {
        params,
      }
    );

    return getResponseData(response);
  } catch (error) {
    console.error(
      "Receivables Overdue Buckets API Error:",
      error
    );

    throw getApiError(error);
  }
};