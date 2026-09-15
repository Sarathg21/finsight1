
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
       * legal_entity_id: [1, 2, 3]
       *
       * Axios will send:
       * ?legal_entity_id=1&legal_entity_id=2&legal_entity_id=3
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


/*
 * Extract Axios response data.
 */
const getResponseData = (response) => {
  return response?.data;
};


/*
 * Normalize API errors.
 */
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

export const getReceivableFilters = async () => {
    try {
        const response = await api.get("/receivables/filters");

        return response.data;
    } catch (error) {
        console.error("Receivables Filters API Error:", error);
        throw error;
    }
};

export const getReceivableSummary = async (filters = {}) => {
  const params = buildParams(filters, false);

  const response = await api.get(
    "/receivables/summary",
    { params }
  );

  return getResponseData(response);
};


export const getReceivableDivisionWise = async (filters = {}) => {
  const params = buildParams(filters, false);

  const response = await api.get(
    "/receivables/division-wise",
    { params }
  );

  return getResponseData(response);
};


export const getReceivableTopCustomers = async (filters = {}) => {
  const params = buildParams(filters, false);

  const response = await api.get(
    "/receivables/top-customers",
    { params }
  );

  return getResponseData(response);
};


export const getReceivableBuckets = async (filters = {}) => {
  const params = buildParams(filters, false);

  const response = await api.get(
    "/receivables/buckets",
    { params }
  );

  return getResponseData(response);
};