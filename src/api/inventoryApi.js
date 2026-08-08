
import api from "./axios";

// Inventory APIs

export const getInventoryFilters = (params = {}) =>
  api.get("/inventory/filters", { params });

export const getInventorySummary = (params = {}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    )
  );

  return api.get("/inventory/summary", {
    params: filteredParams,
  });
};

export const getInventoryAgingSummary = (params = {}) =>
  api.get("/inventory/aging-summary", { params });

export const getInventoryDivisionWise = (params = {}) =>
  api.get("/inventory/division-wise", { params });

export const getInventorySubDivisionWise = (params = {}) =>
  api.get("/inventory/subdivision-wise", { params });


export const getInventoryCategoryWise = (params = {}) =>
  api.get("/inventory/category-wise", { params });

export const getInventoryWarehouseWise = (params = {}) =>
  api.get("/inventory/warehouse-wise", { params });

export const getInventoryTrend = (params = {}) =>
  api.get("/inventory/trend", { params });

export const getInventorySlowMovingItems = (params = {}) =>
  api.get("/inventory/slow-moving-items", { params });


export const getInventoryTopItems = (params = {}) =>
  api.get("/inventory/top-items", { params });

export const getInventoryDetails = (params = {}) =>
  api.get("/inventory/details", {
    params: {
      page: params.page || 1,
      limit: params.limit || 100,
      sort_by: params.sort_by || undefined,
      sort_dir: params.sort_dir || undefined,
      search: params.search || undefined,
      ...params
    }
  });


export const getInventoryExport = (type, filters) => {
  return api.get(`/inventory/export`, {
    params: {
      type,
      ...filters
    },
    responseType: "blob", // IMPORTANT
  });
};