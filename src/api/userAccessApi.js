
import api from "./axios";

export const getUserAccessSummary = () =>
  api.get("/admin/summary");

export const getUserAccess = (userId) =>
  api.get(`/admin/users/${userId}/access`);

export const saveUserAccess = (userId, data) =>
  api.put(`/admin/access/${userId}`, data);

export const getOrganizationTree = () =>
  api.get("/admin/access/org-tree");