// src/utils/apiClient.js
// ─── Centralized API Client ────────────────────────────────────────────────────
// Single source of truth for all HTTP headers and fetch configuration.
// ALL hooks and pages must import from here — never define headers inline.
//
// Key rules enforced here:
//  1. x-app-type is always lowercase "admin" (consistent with backend contract)
//  2. Accept-Language is always "en"
//  3. credentials is NOT included — using Authorization Bearer token instead.
//     Mixing credentials:'include' + Authorization header causes an extra CORS
//     OPTIONS preflight for EVERY request, doubling your API call count.
// ──────────────────────────────────────────────────────────────────────────────

const RAW_BASE_URL = import.meta.env.VITE_BASE_URL;
// In development, use a relative path (empty string) so Vite's proxy intercepts it.
// This prevents the browser from sending CORS preflight OPTIONS requests.
const BASE_URL = import.meta.env.DEV ? "" : RAW_BASE_URL;

/** Returns the standard admin request headers with the current JWT token. */
export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "x-app-type": "admin",
  "Accept-Language": "en",
});

/**
 * Returns headers for multipart/form-data uploads.
 * NOTE: Do NOT set Content-Type here — the browser must set the multipart
 * boundary automatically. Setting it manually breaks file uploads.
 */
export const getUploadHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "x-app-type": "admin",
  "Accept-Language": "en",
});

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

/**
 * Makes an authenticated JSON API call.
 *
 * @param {string} path   - API path (e.g. "/api/auth/admin/users")
 * @param {object} options - Fetch options (method, body, signal, etc.)
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} with a human-readable message on non-2xx or network error
 */
export const apiCall = async (path, options = {}) => {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}), // allow callers to override specific headers
    },
    // DO NOT add credentials:'include' here.
    // We use Authorization: Bearer <token> which is sufficient.
    // credentials:'include' also sends cookies AND triggers an extra
    // CORS preflight OPTIONS request for every API call.
  });

  if (res.status === 401) {
    // Token expired — clear auth and redirect to login
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}: Request failed`);
  }

  return data;
};

/**
 * GET shorthand.
 * @param {string} path
 * @param {RequestInit} [options]
 */
export const apiGet = (path, options) =>
  apiCall(path, { method: "GET", ...options });

/**
 * POST shorthand.
 * @param {string} path
 * @param {object} body
 * @param {RequestInit} [options]
 */
export const apiPost = (path, body, options) =>
  apiCall(path, { method: "POST", body: JSON.stringify(body), ...options });

/**
 * PUT shorthand.
 * @param {string} path
 * @param {object} body
 * @param {RequestInit} [options]
 */
export const apiPut = (path, body, options) =>
  apiCall(path, { method: "PUT", body: JSON.stringify(body), ...options });

/**
 * PATCH shorthand.
 * @param {string} path
 * @param {object} body
 * @param {RequestInit} [options]
 */
export const apiPatch = (path, body, options) =>
  apiCall(path, { method: "PATCH", body: JSON.stringify(body), ...options });

/**
 * DELETE shorthand.
 * @param {string} path
 * @param {RequestInit} [options]
 */
export const apiDelete = (path, options) =>
  apiCall(path, { method: "DELETE", ...options });

/**
 * Upload a file using multipart/form-data.
 * @param {string} path
 * @param {FormData} formData
 * @param {RequestInit} [options]
 */
export const apiUpload = (path, formData, options) =>
  apiCall(path, {
    method: "POST",
    body: formData,
    headers: getUploadHeaders(), // overrides the default Content-Type
    ...options,
  });

export { BASE_URL };
