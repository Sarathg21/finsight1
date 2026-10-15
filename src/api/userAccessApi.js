
// import api from "./axios";

// export const getUserAccessSummary = () =>
//   api.get("/admin/summary");

// export const getUserAccess = (userId) =>
//   api.get(`/admin/users/${userId}/access`);

// export const saveUserAccess = (userId, data) =>
//   api.put(`/admin/access/${userId}`, data);

// export const getOrganizationTree = () =>
//   api.get("/admin/access/org-tree");



import api from "./axios";

export const getUserAccessSummary = () =>
  api.get("/admin/summary");

export const getUserAccess = (userId) =>
  api.get(`/admin/users/${userId}/access`);

export const createUserAccess = (userId, data) =>
  api.post(`/admin/users/${userId}/access`, data);

export const updateUserAccess = (userId, accessScopeId, data) =>
  api.put(
    `/admin/users/${userId}/access/${accessScopeId}`,
    data
  );

export const deleteUserAccess = (userId, accessScopeId) =>
  api.delete(
    `/admin/users/${userId}/access/${accessScopeId}`
  );

export const getOrganizationTree = () =>
  api.get("/admin/access/org-tree");
