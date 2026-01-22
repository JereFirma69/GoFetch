import { api } from "./api";

export const searchApi = {
  searchWalkers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.location) query.set("location", params.location);
    if (params.minPrice) query.set("minPrice", params.minPrice);
    if (params.maxPrice) query.set("maxPrice", params.maxPrice);
    if (params.minRating) query.set("minRating", params.minRating);
    if (params.q) query.set("q", params.q);
    const qs = query.toString();
    return api.get(`/search/walkers${qs ? `?${qs}` : ""}`);
  },
  searchTermini: (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.location) query.set("location", params.location);
    if (params.walkerId) query.set("walkerId", params.walkerId);
    if (params.minPrice) query.set("minPrice", params.minPrice);
    if (params.maxPrice) query.set("maxPrice", params.maxPrice);
    if (params.type) query.set("type", params.type);
    if (params.onlyAvailable !== undefined) query.set("onlyAvailable", params.onlyAvailable);
    const qs = query.toString();
    return api.get(`/search/termini${qs ? `?${qs}` : ""}`);
  }
};
