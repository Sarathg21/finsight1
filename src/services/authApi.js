/**
 * Auth API Service
 * ────────────────
 * Handles JWT authentication against the Finsight backend.
 *
 * Login endpoint : POST /api/auth/login   (JSON body)
 * Health endpoint: GET  /health
 * Token storage  : localStorage.finsight_token
 *
 * Base URL is set via .env → VITE_API_BASE_URL
 */

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://13.233.207.68:8000';

const LOGIN_URL = `${API_BASE}/api/auth/login`;
const HEALTH_URL = `${API_BASE}/health`;
const TIMEOUT_MS = 6000; // 6 s

/* ── Fetch with timeout ──────────────────────────────────────────── */
function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() =>
    clearTimeout(tid)
  );
}

/* ── Health check ────────────────────────────────────────────────── */
let _online = null;
let _healthPromise = null;

/**
 * Returns true if the backend is reachable, false otherwise.
 * Result is cached for the session; call resetHealthCache() to re-check.
 */
export async function checkBackendHealth() {
  if (_online !== null) return _online;
  if (_healthPromise) return _healthPromise;

  _healthPromise = (async () => {
    try {
      const res = await fetchWithTimeout(HEALTH_URL, { method: 'GET' });
      _online = res.ok;
    } catch {
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
  // ── Step 1: Quick health gate ─────────────────────────────────
  const online = await checkBackendHealth();
  if (!online) {
    throw {
      status: 503,
      message: 'Backend server is currently unreachable.',
      isNetworkError: true,
    };
  }

  // ── Step 2: Authenticate ──────────────────────────────────────
  let res;
  try {
    res = await fetchWithTimeout(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    // Timeout or network failure
    _online = false; // mark backend as down for this session
    throw {
      status: 503,
      message: 'Connection to server timed out. Please try again.',
      isNetworkError: true,
    };
  }

  // ── Step 3: Parse response ────────────────────────────────────
  const body = await res.json().catch(() => ({}));

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
    throw {
      status: 500,
      message: 'Server returned an invalid auth response (no token).',
      isNetworkError: true,
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
