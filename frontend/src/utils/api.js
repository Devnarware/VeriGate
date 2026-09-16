// api.js
// Centralized API client for VeriGate frontend

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  // Screening
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
  getScreenings: (params = "") => fetchApi(`/screening/history${params}`),
  getScreening: (id) => fetchApi(`/screening/${id}`),
  getDemoScenarios: () => fetchApi("/screening/scenarios"),

  // Cases
  getCases: (params = "") => fetchApi(`/cases${params}`),
  getCase: (id) => fetchApi(`/cases/${id}`),
  createCase: (data) =>
    fetchApi("/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateCase: (id, data) =>
    fetchApi(`/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // Alerts
  getAlerts: (params = "") => fetchApi(`/alerts${params}`),
  updateAlert: (id, data) =>
    fetchApi(`/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // Watchlist
  getWatchlist: () => fetchApi("/watchlist"),
  searchWatchlist: (query) =>
    fetchApi("/watchlist/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
  createWatchlistEntry: (data) =>
    fetchApi("/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteWatchlistEntry: (id) =>
    fetchApi(`/watchlist/${id}`, {
      method: "DELETE",
    }),

  // Analytics
  getAnalytics: () => fetchApi("/analytics"),

  // Reports
  getReports: () => fetchApi("/reports"),
  generateReport: (data) =>
    fetchApi("/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // Audit
  getAuditLogs: () => fetchApi("/audit"),

  // Settings
  getSettings: () => fetchApi("/settings"),
  updateSettings: (data) =>
    fetchApi("/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // Health
  checkHealth: () => fetchApi("/health"),
};
