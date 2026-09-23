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
  api.get("/api/inventory/filter-options", { params, paramsSerializer: serializeParams });

export const getInventoryDashboard = (params = {}) =>
  api.get("/api/inventory/dashboard", { params, paramsSerializer: serializeParams });

export const getInventorySummary = (params = {}) =>
  api.get("/api/inventory/kpis", { params, paramsSerializer: serializeParams });

export const getInventoryAgingSummary = (params = {}) =>
  api.get("/api/inventory/aging-summary", { params, paramsSerializer: serializeParams });

export const getInventoryDivisionWise = (params = {}) =>
  api.get("/api/inventory/by-parent-division", { params, paramsSerializer: serializeParams });

export const getInventorySubDivisionWise = (params = {}) =>
  api.get("/api/inventory/by-subdivision", { params, paramsSerializer: serializeParams });

export const getInventoryCategoryWise = (params = {}) =>
  api.get("/api/inventory/by-category", { params, paramsSerializer: serializeParams });

export const getInventoryTrend = (params = {}) =>
  api.get("/api/inventory/trend", { params, paramsSerializer: serializeParams });

export const getInventoryTopItems = (params = {}) =>
  api.get("/api/inventory/top-items", { params, paramsSerializer: serializeParams });

export const getInventoryDetails = (params = {}) => {
  const { limit, page_size, section, ...rest } = params;
  let route = "/api/inventory/view-all";
  if (section === 'trend') route = "/api/inventory/view-all/trend";
  else if (section === 'parent-divisions') route = "/api/inventory/view-all/parent-divisions";
  else if (section === 'slow-moving') route = "/api/inventory/view-all/slow-moving";

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
  let route = type.toLowerCase() === 'pdf' ? '/api/inventory/export/pdf' : '/api/inventory/export/excel';
  
  if (section === 'trend') {
      route = type.toLowerCase() === 'pdf' ? '/api/inventory/view-all/trend/export/pdf' : '/api/inventory/view-all/trend/export/excel';
  } else if (section === 'parent-divisions') {
      route = type.toLowerCase() === 'pdf' ? '/api/inventory/view-all/parent-divisions/export/pdf' : '/api/inventory/view-all/parent-divisions/export/excel';
  } else if (section === 'slow-moving') {
      route = type.toLowerCase() === 'pdf' ? '/api/inventory/view-all/slow-moving/export/pdf' : '/api/inventory/view-all/slow-moving/export/excel';
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
