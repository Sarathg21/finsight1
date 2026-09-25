import api from "../services/api";

const serializeParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== "" && val !== null && val !== undefined) {
      if (Array.isArray(val)) {
        val.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, val);
      }
    }
  });
  return searchParams.toString();
};

// Inventory APIs

export const getInventoryFilters = (params = {}) =>
  api.get("/inventory/filter-options", { params, paramsSerializer: serializeParams });

export const getInventoryDashboard = (params = {}) =>
  api.get("/inventory/dashboard", { params, paramsSerializer: serializeParams });

export const getInventorySummary = (params = {}) =>
  api.get("/inventory/kpis", { params, paramsSerializer: serializeParams });

export const getInventoryAgingSummary = (params = {}) =>
  api.get("/inventory/aging-summary", { params, paramsSerializer: serializeParams });

export const getInventoryDivisionWise = (params = {}) =>
  api.get("/inventory/by-parent-division", { params, paramsSerializer: serializeParams });

export const getInventorySubDivisionWise = (params = {}) =>
  api.get("/inventory/by-subdivision", { params, paramsSerializer: serializeParams });

export const getInventoryCategoryWise = (params = {}) =>
  api.get("/inventory/by-category", { params, paramsSerializer: serializeParams });

export const getInventoryTrend = (params = {}) =>
  api.get("/inventory/trend", { params, paramsSerializer: serializeParams });

export const getInventoryTopItems = (params = {}) =>
  api.get("/inventory/top-items", { params, paramsSerializer: serializeParams });

export const getInventoryMonthOnMonth = (params = {}) =>
  api.get("/inventory/parent-division/month-on-month", { params, paramsSerializer: serializeParams });


export const getInventoryDetails = (params = {}) => {
  const { limit, page_size, section, ...rest } = params;
  let route = "/inventory/view-all";
  if (section === 'trend') route = "/inventory/view-all/trend";
  else if (section === 'parent-divisions') route = "/inventory/view-all/parent-divisions";
  else if (section === 'slow-moving') route = "/inventory/view-all/slow-moving";

  return api.get(route, {
    params: {
      page: rest.page || 1,
      page_size: page_size || limit || 100,
      ...rest
    },
    paramsSerializer: serializeParams
  });
};

export const getInventoryExport = (type, filters) => {
  const { section, ...restFilters } = filters;
  let route = type.toLowerCase() === 'pdf' ? '/inventory/export/pdf' : '/inventory/export/excel';
  
  if (section === 'trend') {
      route = type.toLowerCase() === 'pdf' ? '/inventory/view-all/trend/export/pdf' : '/inventory/view-all/trend/export/excel';
  } else if (section === 'parent-divisions') {
      route = type.toLowerCase() === 'pdf' ? '/inventory/view-all/parent-divisions/export/pdf' : '/inventory/view-all/parent-divisions/export/excel';
  } else if (section === 'slow-moving') {
      route = type.toLowerCase() === 'pdf' ? '/inventory/view-all/slow-moving/export/pdf' : '/inventory/view-all/slow-moving/export/excel';
  }

  // Strip pagination-only params from export calls
  // eslint-disable-next-line no-unused-vars
  const { page: _page, page_size: _ps, limit: _lim, ...exportFilters } = restFilters;
  return api.get(route, {
    params: exportFilters,
    paramsSerializer: serializeParams,
    responseType: "blob", // IMPORTANT
  });
};
