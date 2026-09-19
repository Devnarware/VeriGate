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
};
