// api.js
// Centralized API client for VeriGate frontend

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `API error: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[VeriGate API] Failed request to ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Document Screening Analysis
  analyzeScreening: async (formData) => {
    const res = await fetch(`${API_BASE}/screening/analyze`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to analyze document.");
    }
    return await res.json();
  },

  // System Health
  checkHealth: () => fetchApi("/health"),

  // Case History & Audit Trail
  getCases: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/cases${query ? `?${query}` : ""}`);
  },
  getCaseStats: () => fetchApi("/cases/stats"),
  getCaseById: (id) => fetchApi(`/cases/${id}`),
  updateOfficerAction: (id, action, notes) =>
    fetchApi(`/cases/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    }),
  clearCases: () =>
    fetchApi("/cases/clear", {
      method: "POST",
    }),

  // Watchlist Management Simulator
  getWatchlist: () => fetchApi("/watchlist"),
  addWatchlistRecord: (record) =>
    fetchApi("/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }),
  toggleWatchlistStatus: (id) =>
    fetchApi(`/watchlist/${id}/toggle`, {
      method: "PATCH",
    }),
  deleteWatchlistRecord: (id) =>
    fetchApi(`/watchlist/${id}`, {
      method: "DELETE",
    }),
  resetWatchlist: () =>
    fetchApi("/watchlist/reset", {
      method: "POST",
    }),
};
