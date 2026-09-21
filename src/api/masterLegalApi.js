import api from "./axios";

// Legal Groups
export const addLegalGroup = (data) =>
  api.post("/admin/master/legal-groups", data);

export const getLegalGroups = () =>
  api.get("/admin/master/legal-groups");

export const updateLegalGroup = (id, data) =>
  api.put(`/admin/master/legal-groups/${id}`, data);

// Legal Entities
export const addLegalEntities = (data) =>
  api.post("/admin/master/legal-entities", data);

export const getLegalEntities = () =>
  api.get("/admin/master/legal-entities");

export const updateLegalEntities = (id, data) =>
  api.put(`/admin/master/legal-entities/${id}`, data);

// Parent Divisions
export const addParentDivision = (data) =>
  api.post("/admin/master/parent-divisions", data);

export const getParentDivision = () =>
  api.get("/admin/master/parent-divisions");

export const updateParentDivision = (id, data) =>
  api.put(`/admin/master/parent-divisions/${id}`, data);

// Sub Divisions
export const addSubDivision = (data) =>
  api.post("/admin/master/subdivisions", data);

export const getSubDivision = () =>
  api.get("/admin/master/subdivisions");

export const updateSubDivision = (id, data) =>
  api.put(`/admin/master/subdivisions/${id}`, data);

// Business Units
export const addBusinessunits = (data) =>
  api.post("/admin/master/business-units", data);

export const getBusinessunits = () =>
  api.get("/admin/master/business-units");

export const updateBusinessunits = (id, data) =>
  api.put(`/admin/master/business-units/${id}`, data);

//Analysis codes
export const addAnalysisCodes = (data) =>
  api.post("/admin/master/analysis-codes", data);

export const getAnalysisCodes = () =>
  api.get("/admin/master/analysis-codes");

export const updateAnalysisCodes = (id, data) =>
  api.put(`/admin/master/analysis-codes/${id}`, data);

export const getParentDivisionLegalEntities = (parentDivisionId) =>
  api.get(`/admin/master/parent-divisions/${parentDivisionId}/legal-entities`);

export const updateParentDivisionLegalEntities = (
  parentDivisionId,
  legalEntityIds) =>
  api.put(
    `/admin/master/parent-divisions/${parentDivisionId}/legal-entities`,
    {
      legal_entity_ids: legalEntityIds,
    }
  );

// Currencies
export const getCurrencies = () =>
  api.get("/admin/master/currencies");

export const addCurrency = (data) =>
  api.post("/admin/master/currencies", data);

export const updateCurrency = (id, data) =>
  api.put(`/admin/master/currencies/${id}`, data);