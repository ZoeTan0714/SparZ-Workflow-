import api from "./api";

export const fetchUsers = () => api.get("/admin/users");
export const updateUserRole = (userId, role) => api.patch(`/admin/users/${userId}/role`, { role });
