import { api } from "./api";

export const adminApi = {
  getPricing: () => api.get("/admin/pricing"),
  updatePricing: (body) => api.put("/admin/pricing", body),
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    if (params.q) query.set("q", params.q);
    const qs = query.toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  getPendingWalkers: () => api.get("/admin/walkers/pending"),
  approveWalker: (walkerId) => api.post("/admin/walkers/approve", { walkerId }),
  rejectWalker: (walkerId) => api.post("/admin/walkers/reject", { walkerId }),
};
