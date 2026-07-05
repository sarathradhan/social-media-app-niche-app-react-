// api.js
// Shared API helper for frontend requests. Recent changes centralize request setup and error extraction
// so pages can rely on consistent fetch behavior and readable error messages.
// It automatically handles:
// - base API URL (from Vite env or fallback)
// - sending cookies (credentials: "include")
// - JSON request helpers

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const finalOptions = {
    credentials: "include",
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  };

  return fetch(url, finalOptions);
}

export function getApiErrorMessage(error, fallback = "Request failed") {
  if (error?.data?.message) return error.data.message;
  if (error?.data?.error) return error.data.error;
  if (error?.message) return error.message;
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      status: res.status,
      data,
      message: getApiErrorMessage({ data }, "Request failed")
    };
  }

  return { ok: true, data, status: res.status, res };
}

export async function apiGet(path) {
  return apiRequest(path);
}

export async function apiPost(path, body = {}) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function apiUpload(path, formData) {
  return apiRequest(path, {
    method: "POST",
    body: formData
  });
}
