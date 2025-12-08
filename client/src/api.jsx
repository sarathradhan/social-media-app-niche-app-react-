// api.js
// This file makes talking to your backend SUPER easy.
// It automatically handles:
// - base API URL (from Vite env or fallback)
// - sending cookies (credentials: "include")
// - JSON request helpers

// Get base URL: either from .env or default localhost
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// Core fetch wrapper
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  // Ensure credentials + headers are correct
  const finalOptions = {
    credentials: "include", // send session cookie always
    ...options,
    headers: {
      // Don't set Content-Type for FormData - browser will set it with boundary
      ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  };

  return fetch(url, finalOptions);
}

// Helper for GET JSON
export async function apiGet(path) {
  const res = await apiFetch(path);
  return res.ok ? res.json() : Promise.reject(await res.json().catch(() => ({})));
}

// Helper for POST JSON
export async function apiPost(path, body = {}) {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return res.ok ? res.json() : Promise.reject(await res.json().catch(() => ({})));
}

// Helper for file uploads
export async function apiUpload(path, formData) {
  const res = await apiFetch(path, {
    method: "POST",
    body: formData // FormData auto-handles headers
  });
  return res.ok ? res.json() : Promise.reject(await res.json().catch(() => ({})));
}
