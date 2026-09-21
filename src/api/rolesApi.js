import api from "./axios";

// Roles
export const addRole = (data) =>
    api.post("/admin/roles", data);

export const getRole = () =>
    api.get("/admin/roles");

export const updateRole = (roleCode, data) =>
    api.put(`/admin/roles/${roleCode}`, data);

export const getRolePermissions = (roleCode) => {
    return api.get(`/admin/roles/${roleCode}/permissions`);
};

export const updateRolePermissions = (roleCode, data) => {
    return api.put(`/admin/roles/${roleCode}/permissions`, data);
};