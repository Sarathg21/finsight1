

import api from "./axios";

/* -----FILTERS--------*/

export const getReceivableFilters = (params = {}) => {
  return api.get("/receivables/filters", { params });
};

/* -----KPI SUMMARY--------*/
export const getReceivableSummary = (params = {}) => {
  return api.get("/receivables/summary", { params });
};

/* ===========================
   AGING SUMMARY
=========================== */

export const getReceivableAgingSummary = (params = {}) => {
  return api.get("/receivables/aging-summary", { params });
};

/* ===========================
   DIVISION WISE
=========================== */

export const getReceivableDivisionWise = (params = {}) => {
  return api.get("/receivables/division-wise", { params });
};

/* ===========================
   TOP CUSTOMERS
=========================== */

export const getReceivableTopCustomers = (filters = {}) => {
  const params = {
    limit: 10,
    sort_by: "total_outstanding",
    sort_dir: "desc",
    ...filters
  };
  return api.get("/receivables/top-customers", {
    params
  });
};

/* ===========================
   DETAILS TABLE
=========================== */

export const getReceivableDetails = (params) =>
  api.get("/receivables/details", {
    params,
  });

/* ===========================
   BUSINESS UNIT
=========================== */
// export const getReceivableBusinessUnit = (params = {}) => {
//   return api.get("/receivables/business-unit", { params });
// };


/* ===========================
   SUB DIVISIONS
=========================== */
export const getReceivableSubDivision = (params = {}) => {
  return api.get("/receivables/sub-division", { params });
}

/* ===========================
   OVERDUE SUMMARY
=========================== */
export const getReceivableOverdueSummary = (params = {}) => {
  return api.get("/receivables/overdue-summary", { params });
};

/* ===========================
   TREND
=========================== */

export const getReceivableTrend = (params = {}) => {
  return api.get("/receivables/trend", { params });
};

/* ===========================
   SALESMAN
=========================== */

export const getSalesmanPerformance = (filters) =>
  api.get("/receivables/salesman", { params: filters, });

/* ===========================
   EXPORT
=========================== */
export const getReceivableExport = (type, filters = {}) =>
  api.get("/receivables/export", {
    params: {
      ...filters,
      type,
    },
    responseType: "blob",
  });

/* ===========================
   UPLOAD
=========================== */

export const uploadReceivableReport = (file, as_on_date = "") => {
  const formData = new FormData();

  formData.append("file", file);

  if (as_on_date) {
    formData.append("as_on_date", as_on_date);
  }

  return api.post("/receivables/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};