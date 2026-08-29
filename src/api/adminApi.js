
import api from "./axios";

export const getAdminSystemStatus = () =>
  api.get("/admin/system/status");