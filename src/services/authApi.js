/**
 * Auth API Service
 * ────────────────
 * Handles JWT authentication against the Finsight backend.
 *
 * Login endpoint : POST /api/auth/login   (JSON body)
 * Health probe   : POST /api/auth/login   (empty body → 422 = server alive)
 * Token storage  : localStorage.finsight_token
 *
 * Base URL is set via .env → VITE_API_BASE_URL
 */

// IMPORTANT: Keep ?? (not ||) here.
// When VITE_API_BASE_URL is empty (""), API_BASE stays "" so that all requests
// use relative paths (/api/...) which are intercepted by the Vite dev proxy
// → http://13.233.207.68:8000.  Using || would bypass the proxy and cause
// CORS errors because the browser would hit the backend directly.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? '';

// Static display constant – always shows the real backend host in the UI
// regardless of whether API_BASE is empty (proxy mode) or a full URL.
export const BACKEND_HOST = '13.233.207.68:8000';

const LOGIN_URL = `${API_BASE}/api/auth/login`;

// Health probe: We send an empty POST to /api/auth/login.
// The backend will return 422 (Unprocessable Entity) for missing fields —
// that still proves the server is alive.  A network error / timeout means down.
const HEALTH_PROBE_URL = `${API_BASE}/api/auth/login`;

const TIMEOUT_MS = 15000; // 15 s

/* ── Fetch with timeout ──────────────────────────────────────────── */
function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() =>
    clearTimeout(tid)
  );
}

/* ── Backend health probe ────────────────────────────────────────── */
let _online = null;
let _healthPromise = null;

/**
 * Returns true if the backend is reachable, false otherwise.
 *
 * Strategy: POST an empty body to /api/auth/login.
 *   - 200 / 401 / 403 / 422  →  server is UP   (_online = true)
 *   - Network error / timeout →  server is DOWN  (_online = false)
 *
 * Result is cached for the session; call resetHealthCache() to re-check.
 */
export async function checkBackendHealth() {
  if (_online !== null) return _online;
  if (_healthPromise) return _healthPromise;

  _healthPromise = (async () => {
    try {
      await fetchWithTimeout(HEALTH_PROBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      // Any HTTP response (even 4xx) means the server is reachable
      _online = true;
    } catch {
      // Network error or AbortError (timeout) → server unreachable
      _online = false;
    }
    _healthPromise = null;
    return _online;
  })();

  return _healthPromise;
}

/** Force re-check on next call (e.g. user clicked Retry). */
export function resetHealthCache() {
  _online = null;
  _healthPromise = null;
}

/* ── Login ───────────────────────────────────────────────────────── */

/**
 * loginWithBackend(email, password)
 * ──────────────────────────────────
 * 1. Health-gate: if server unreachable → throws isNetworkError immediately.
 * 2. POST /api/auth/login with { email, password }.
 * 3. On 200 → stores JWT in localStorage.finsight_token, returns { token, raw }.
 * 4. On 401/403 → throws isAuthError so caller shows credential error.
 * 5. On timeout/network → throws isNetworkError so caller falls back to demo.
 */
export async function loginWithBackend(email, password) {
  // ── Step 1: Authenticate ──────────────────────────────────────
  let res;
  let isFormData = false;
  try {
    res = await fetchWithTimeout(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username: email, password }),
    });

    // Fallback for OAuth2 backends that strictly require Form-Encoded data
    if (res.status === 422 || res.status === 401) {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const retryRes = await fetchWithTimeout(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      if (retryRes.ok || retryRes.status === 200) {
        res = retryRes;
        isFormData = true;
      }
    }
  } catch (err) {
    // Timeout or network failure
    _online = false; // mark backend as down for this session
    console.warn('[authApi] Network error during login:', err);
    throw {
      status: 503,
      message: 'Connection to server timed out. Please try again.',
      isNetworkError: true,
    };
  }

  // ── Step 3: Parse response ────────────────────────────────────
  const body = await res.json().catch(() => ({}));
  console.log('[authApi] Login response status:', res.status, 'body:', body, 'isFormData:', isFormData);

  if (!res.ok) {
    const message =
      body?.detail ||
      body?.message ||
      body?.error ||
      (res.status === 401 || res.status === 403
        ? 'Invalid email or password'
        : `Authentication failed (${res.status})`);
    throw { status: res.status, message, isAuthError: true };
  }

  const token = body?.access_token || body?.token;
  if (!token) {
    console.error('[authApi] Login succeeded (HTTP 200) but no token found in response!', body);
    throw {
      status: 500,
      message: 'Server returned an invalid auth response (no token).',
      isNetworkError: true, // triggers Demo fallback
    };
  }

  // ── Step 4: Store token ───────────────────────────────────────
  localStorage.setItem('finsight_token', token);
  _online = true;
  console.info('[authApi] ✓ Authenticated via', LOGIN_URL);
  return { token, raw: body };
}

/* ── Logout ──────────────────────────────────────────────────────── */
export function logoutFromBackend() {
  localStorage.removeItem('finsight_token');
  _online = null;
}

/* ── Token accessor ──────────────────────────────────────────────── */
export function getStoredToken() {
  return localStorage.getItem('finsight_token');
}
