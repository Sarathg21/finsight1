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
// → http://13.233.207.68:8000.
//
// Using || would bypass the proxy and cause CORS errors because the browser
// would hit the backend directly.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "";

// Static display constant – always shows the real backend host in the UI
// regardless of whether API_BASE is empty (proxy mode) or a full URL.
export const BACKEND_HOST = "13.233.207.68:8000";

const LOGIN_URL = `${API_BASE}/api/auth/login`;

// Health probe
const HEALTH_PROBE_URL = `${API_BASE}/api/auth/login`;

const TIMEOUT_MS = 15000; // 15 seconds


/* ────────────────────────────────────────────────────────────────
   Fetch with timeout
──────────────────────────────────────────────────────────────── */

function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();

  const tid = setTimeout(() => {
    ctrl.abort();
  }, TIMEOUT_MS);

  return fetch(url, {
    ...options,
    signal: ctrl.signal,
  }).finally(() => {
    clearTimeout(tid);
  });
}


/* ────────────────────────────────────────────────────────────────
   Backend health probe
──────────────────────────────────────────────────────────────── */

/**
 * Returns true if the backend is reachable, false otherwise.
 *
 * Strategy:
 *
 * 200 / 401 / 403 / 422 → server is UP
 * Network error / timeout → server is DOWN
 */

let _online = null;
let _healthPromise = null;

export async function checkBackendHealth() {
  if (_online !== null) {
    return _online;
  }

  if (_healthPromise) {
    return _healthPromise;
  }

  _healthPromise = (async () => {
    try {
      await fetchWithTimeout(HEALTH_PROBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      // Any HTTP response means the server is reachable
      _online = true;
    } catch {
      // Network error or timeout
      _online = false;
    }

    _healthPromise = null;

    return _online;
  })();

  return _healthPromise;
}


/* ────────────────────────────────────────────────────────────────
   Reset health cache
──────────────────────────────────────────────────────────────── */

export function resetHealthCache() {
  _online = null;
  _healthPromise = null;
}


/* ────────────────────────────────────────────────────────────────
   Login
──────────────────────────────────────────────────────────────── */

/**
 * loginWithBackend(email, password)
 *
 * 1. POST /api/auth/login
 * 2. Get access_token
 * 3. Validate token
 * 4. Save JWT in FinSight localStorage
 * 5. Open Payables dashboard
 * 6. Send JWT to Payables using postMessage
 * 7. Return token + raw response
 */

export async function loginWithBackend(email, password) {

  /* ──────────────────────────────────────────────────────────────
     Step 1: Authenticate
  ────────────────────────────────────────────────────────────── */

  let res;
  let isFormData = false;

  try {

    // First try JSON request
    res = await fetchWithTimeout(LOGIN_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        username: email,
        password,
      }),
    });


    /* ────────────────────────────────────────────────────────────
       OAuth2 fallback
    ──────────────────────────────────────────────────────────── */

    if (res.status === 415 || res.status === 422) {

      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const retryRes = await fetchWithTimeout(LOGIN_URL, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: formData,
      });

      if (retryRes.ok || retryRes.status === 200) {
        res = retryRes;
        isFormData = true;
      }
    }

  } catch (err) {

    // Timeout or network failure

    _online = false;

    console.warn(
      "[authApi] Network error during login:",
      err
    );

    throw {
      status: 503,

      message:
        "Connection to server timed out. Please try again.",

      isNetworkError: true,

      isAuthError: false,
    };
  }


  /* ──────────────────────────────────────────────────────────────
     Step 2: Parse response
  ────────────────────────────────────────────────────────────── */

  const body = await res.json().catch(() => ({}));

  console.log(
    "[authApi] Login response status:",
    res.status,
    "body:",
    body,
    "isFormData:",
    isFormData
  );


  /* ──────────────────────────────────────────────────────────────
     Step 3: Handle unsuccessful response
  ────────────────────────────────────────────────────────────── */

  if (!res.ok) {

    /* ────────────────────────────────────────────────────────────
       Server error
    ──────────────────────────────────────────────────────────── */

    if (res.status >= 500) {

      _online = false;

      let message =
        body?.error?.message ||
        body?.message;


      if (!message && body?.detail) {

        message =
          typeof body.detail === "string"
            ? body.detail
            : Array.isArray(body.detail)
              ? body.detail
                .map((d) =>
                  typeof d === "object"
                    ? d.msg || JSON.stringify(d)
                    : String(d)
                )
                .join(", ")
              : JSON.stringify(body.detail);
      }


      if (
        !message &&
        body?.error &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }


      if (!message) {
        message =
          `Backend server unavailable (${res.status}).`;
      }


      console.warn(
        `[authApi] Server error (${res.status}) during login:`,
        message
      );


      throw {
        status: res.status,

        message: String(message),

        isNetworkError: true,

        isAuthError: false,
      };
    }


    /* ────────────────────────────────────────────────────────────
       Authentication / validation error
    ──────────────────────────────────────────────────────────── */

    let message =
      body?.error?.message ||
      body?.message;


    if (!message && body?.detail) {

      message =
        typeof body.detail === "string"
          ? body.detail
          : Array.isArray(body.detail)
            ? body.detail
              .map((d) =>
                typeof d === "object"
                  ? d.msg || JSON.stringify(d)
                  : String(d)
              )
              .join(", ")
            : JSON.stringify(body.detail);
    }


    if (
      !message &&
      body?.error &&
      typeof body.error === "string"
    ) {
      message = body.error;
    }


    if (!message) {

      message =
        res.status === 401 ||
          res.status === 403
          ? "Invalid email or password"
          : `Authentication failed (${res.status})`;
    }


    throw {

      status: res.status,

      message: String(message),

      isAuthError:
        res.status === 401 ||
        res.status === 403 ||
        res.status === 400 ||
        res.status === 422,

      isNetworkError: false,
    };
  }


  const token = body?.access_token || body?.token;
  const user = body?.user;

  // Validate token first
  if (!token) {
    console.error(
      "[authApi] Login succeeded but no access_token found!",
      body
    );

    throw {
      status: 500,
      message: "Server returned an invalid auth response (no token).",
      isNetworkError: true,
      isAuthError: false,
    };
  }

  // Save token
 
  localStorage.setItem("token", token);

  // Save user information
  if (user) {
    localStorage.setItem(
      "finsight_user",
      JSON.stringify(body.user)
    );
  }

  console.log("✅ FinSight login successful");
  console.log("👤 User:", user?.full_name);
  console.log("🔑 Role:", user?.role);

  // Only Admin can open Payables
  if (user?.role === "Admin") {
    const payablesWindow = window.open(
      "http://localhost:5174/admin/dashboard",
      "_blank"
    );

    if (payablesWindow) {
      setTimeout(() => {
        payablesWindow.postMessage(
          {
            type: "FINSIGHT_AUTH",
            token,
          },
          "http://localhost:5174"
        );

        console.log(
          "📤 Admin token sent to Payables"
        );
      }, 2000);
    } else {
      console.warn(
        "⚠️ Payables window could not be opened. Please allow popups."
      );
    }
  } else {
    console.log(
      "ℹ️ User is not Admin. Payables will not be opened."
    );
  }

  _online = true;

  return {
    token,
    user,
    raw: body,
  };
}
  /* ────────────────────────────────────────────────────────────────
     Logout
  ──────────────────────────────────────────────────────────────── */

  export function logoutFromBackend() {

    localStorage.removeItem(
      "finsight_token"
    );

    localStorage.removeItem(
      "token"
    );

    _online = null;
  }


  /* ────────────────────────────────────────────────────────────────
     Token accessor
  ──────────────────────────────────────────────────────────────── */

  export function getStoredToken() {

    return localStorage.getItem(
      "token"
    );
  }
