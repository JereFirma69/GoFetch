import { api } from "./api";

export const adminApi = {
  getPricing: () => api.get("/admin/pricing"),
  updatePricing: (body) => api.put("/admin/pricing", body),
  getWalkers: (status = "pending") => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    const qs = query.toString();
    return api.get(`/admin/walkers${qs ? `?${qs}` : ""}`);
  },
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    if (params.q) query.set("q", params.q);
    const qs = query.toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  approveWalker: (walkerId) => api.post("/admin/walkers/approve", { walkerId }),
  rejectWalker: (walkerId) => api.post("/admin/walkers/reject", { walkerId }),
};
