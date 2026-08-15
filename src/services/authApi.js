// /**
//  * Auth API Service
//  * ────────────────
//  * Handles JWT authentication against the Finsight backend.
//  *
//  * Login endpoint : POST /api/auth/login
//  * Current user    : GET /api/access/me
//  * Token storage   : localStorage.token
//  *
//  * Base URL:
//  * VITE_API_BASE_URL
//  */

// export const API_BASE =
//   import.meta.env.VITE_API_BASE_URL ?? "";

// export const FINSIGHT_ORIGIN =
//   import.meta.env.VITE_FINSIGHT_ORIGIN ??
//   window.location.origin;

// const LOGIN_URL = `${API_BASE}/api/auth/login`;
// const ACCESS_ME_URL = `${API_BASE}/api/access/me`;

// const TIMEOUT_MS = 15000;


// /* ────────────────────────────────────────────────────────────────
//    Fetch with timeout
// ──────────────────────────────────────────────────────────────── */

// function fetchWithTimeout(url, options = {}) {
//   const controller = new AbortController();

//   const timeoutId = setTimeout(() => {
//     controller.abort();
//   }, TIMEOUT_MS);

//   return fetch(url, {
//     ...options,
//     signal: controller.signal,
//   }).finally(() => {
//     clearTimeout(timeoutId);
//   });
// }


// /* ────────────────────────────────────────────────────────────────
//    Backend health
// ──────────────────────────────────────────────────────────────── */

// let _online = null;
// let _healthPromise = null;

// export async function checkBackendHealth() {
//   if (_online !== null) {
//     return _online;
//   }

//   if (_healthPromise) {
//     return _healthPromise;
//   }

//   _healthPromise = (async () => {
//     try {
//       const response = await fetchWithTimeout(LOGIN_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({}),
//       });

//       // Any HTTP response means backend is reachable.
//       _online = true;

//       return response;
//     } catch {
//       _online = false;
//       return null;
//     } finally {
//       _healthPromise = null;
//     }
//   })();

//   await _healthPromise;

//   return _online;
// }


// /* ────────────────────────────────────────────────────────────────
//    Reset health cache
// ──────────────────────────────────────────────────────────────── */

// export function resetHealthCache() {
//   _online = null;
//   _healthPromise = null;
// }


// /* ────────────────────────────────────────────────────────────────
//    Login
// ──────────────────────────────────────────────────────────────── */

// export async function loginWithBackend(email, password) {
//   let response;

//   try {
//     response = await fetchWithTimeout(LOGIN_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     });
//   } catch (error) {
//     _online = false;

//     console.error(
//       "[authApi] Network error during login:",
//       error
//     );

//     throw {
//       status: 503,
//       message:
//         "Connection to server timed out. Please try again.",
//       isNetworkError: true,
//       isAuthError: false,
//     };
//   }

//   const body = await response.json().catch(() => ({}));

//   console.log(
//     "[authApi] Login response:",
//     response.status,
//     body
//   );


//   /* ────────────────────────────────────────────────────────────
//      Login failed
//   ──────────────────────────────────────────────────────────── */

//   if (!response.ok) {
//     let message =
//       body?.error?.message ||
//       body?.message ||
//       body?.detail;

//     if (Array.isArray(body?.detail)) {
//       message = body.detail
//         .map((item) =>
//           typeof item === "object"
//             ? item.msg || JSON.stringify(item)
//             : String(item)
//         )
//         .join(", ");
//     }

//     if (!message) {
//       message =
//         response.status === 401 ||
//           response.status === 403
//           ? "Invalid email or password"
//           : `Authentication failed (${response.status})`;
//     }

//     throw {
//       status: response.status,
//       message: String(message),
//       isAuthError:
//         response.status === 400 ||
//         response.status === 401 ||
//         response.status === 403 ||
//         response.status === 422,
//       isNetworkError: false,
//     };
//   }


//   /* ────────────────────────────────────────────────────────────
//      Get JWT
//   ──────────────────────────────────────────────────────────── */

//   const token = body?.access_token;

//   if (!token) {
//     console.error(
//       "[authApi] Login succeeded but no access_token was returned.",
//       body
//     );

//     throw {
//       status: 500,
//       message:
//         "Server returned an invalid auth response (no access token).",
//       isNetworkError: false,
//       isAuthError: false,
//     };
//   }


//   /* ────────────────────────────────────────────────────────────
//      Get authoritative backend role

//      Backend response:

//      {
//        "access_token": "...",
//        "token_type": "bearer",
//        "user": {
//          "role": "ADMIN",
//          "role_code": "ADMIN"
//        }
//      }

//      Therefore role_code is read from user.role_code.
//   ──────────────────────────────────────────────────────────── */

//   const roleCode =
//     body?.role_code ||
//     body?.user?.role_code ||
//     body?.user?.role ||
//     null;

//   if (!roleCode) {
//     console.error(
//       "[authApi] Login succeeded but no role_code was returned.",
//       body
//     );

//     throw {
//       status: 500,
//       message:
//         "Server returned an invalid auth response (no role_code).",
//       isNetworkError: false,
//       isAuthError: false,
//     };
//   }


//   /* ────────────────────────────────────────────────────────────
//      Store canonical JWT
//   ──────────────────────────────────────────────────────────── */

//   localStorage.setItem("token", token);

//   _online = true;


//   /* ────────────────────────────────────────────────────────────
//      Normalize user object
//   ──────────────────────────────────────────────────────────── */

//   const backendUser = body?.user
//     ? {
//       ...body.user,

//       role_code:
//         body.user.role_code ||
//         body.role_code ||
//         body.user.role ||
//         roleCode,

//       role:
//         body.user.role ||
//         body.user.role_code ||
//         body.role_code ||
//         roleCode,

//       name:
//         body.user.employee_name ||
//         body.user.full_name ||
//         body.user.name ||
//         body.user.email,

//       email:
//         body.user.official_email ||
//         body.user.email,
//     }
//     : null;


//   /* ────────────────────────────────────────────────────────────
//      Return login session
//   ──────────────────────────────────────────────────────────── */

//   return {
//     ...body,

//     access_token: token,
//     token_type: body?.token_type || "bearer",

//     // Normalized authoritative role
//     role_code: roleCode,

//     // Normalized user
//     user: backendUser,

//     access: body?.access ?? null,
//   };
// }


// /* ────────────────────────────────────────────────────────────────
//    Logout
// ──────────────────────────────────────────────────────────────── */

// export function logoutFromBackend() {
//   localStorage.removeItem("token");

//   _online = null;
// }


// /* ────────────────────────────────────────────────────────────────
//    Current authenticated user
// ──────────────────────────────────────────────────────────────── */

// export async function getCurrentUser() {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     throw new Error("No authentication token found.");
//   }

//   let response;

//   try {
//     response = await fetchWithTimeout(ACCESS_ME_URL, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     throw {
//       status: 503,
//       message:
//         "Unable to connect to authentication server.",
//       isNetworkError: true,
//     };
//   }

//   const body = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     throw {
//       status: response.status,
//       message:
//         body?.detail ||
//         body?.message ||
//         "Failed to fetch current user.",
//     };
//   }

//   /*
//    * Normalize role_code in case /api/access/me
//    * returns role instead of role_code.
//    */
//   return {
//     ...body,

//     role_code:
//       body?.role_code ||
//       body?.user?.role_code ||
//       body?.role ||
//       body?.user?.role ||
//       null,

//     role:
//       body?.role ||
//       body?.role_code ||
//       body?.user?.role ||
//       body?.user?.role_code ||
//       null,
//   };
// }


// /* ────────────────────────────────────────────────────────────────
//    Token accessor
// ─────────────────────────────────────────────────────────────── */

// export function getStoredToken() {
//   return localStorage.getItem("token");
// }

/**
 * Auth API Service
 * ────────────────
 * Handles JWT authentication against the Finsight backend.
 *
 * Login endpoint : POST /api/auth/login
 * Current user    : GET /api/access/me
 * Token storage   : localStorage.token
 *
 * Base URL:
 * VITE_API_BASE_URL
 */

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "";

export const FINSIGHT_ORIGIN =
  import.meta.env.VITE_FINSIGHT_ORIGIN ??
  window.location.origin;

const LOGIN_URL = `${API_BASE}/api/auth/login`;
const ACCESS_ME_URL = `${API_BASE}/api/access/me`;

const TIMEOUT_MS = 15000;


/* ───────────────────────────────────────────────────────────────
   Development logging
─────────────────────────────────────────────────────────────── */

function devLog(...args) {
  if (import.meta.env.DEV) {
    console.log("[authApi]", ...args);
  }
}


/* ───────────────────────────────────────────────────────────────
   Fetch with timeout
─────────────────────────────────────────────────────────────── */

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}


/* ───────────────────────────────────────────────────────────────
   Backend health
─────────────────────────────────────────────────────────────── */

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
      const response = await fetchWithTimeout(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      _online = true;

      return response;
    } catch {
      _online = false;
      return null;
    } finally {
      _healthPromise = null;
    }
  })();

  await _healthPromise;

  return _online;
}


/* ───────────────────────────────────────────────────────────────
   Reset health cache
─────────────────────────────────────────────────────────────── */

export function resetHealthCache() {
  _online = null;
  _healthPromise = null;
}

/* ───────────────────────────────────────────────────────────────
   Login
─────────────────────────────────────────────────────────────── */

export async function loginWithBackend(email, password) {
  let response;

  try {
    response = await fetchWithTimeout(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  } catch (error) {
    _online = false;

    if (import.meta.env.DEV) {
      console.error(
        "[authApi] Network error during login:",
        error
      );
    }

    throw {
      status: 503,
      message:
        "Connection to server timed out. Please try again.",
      isNetworkError: true,
      isAuthError: false,
    };
  }

  const body =
    await response.json().catch(() => ({}));

  devLog(
    "Login response status:",
    response.status
  );

  /* ─────────────────────────────────────────────────────────────
     Login failed
  ───────────────────────────────────────────────────────────── */

  if (!response.ok) {
    let message =
      body?.error?.message ||
      body?.message ||
      body?.detail;

    if (Array.isArray(body?.detail)) {
      message = body.detail
        .map((item) =>
          typeof item === "object"
            ? item.msg || JSON.stringify(item)
            : String(item)
        )
        .join(", ");
    }

    if (!message) {
      message =
        response.status === 401 ||
        response.status === 403
          ? "Invalid email or password"
          : `Authentication failed (${response.status})`;
    }

    throw {
      status: response.status,
      message: String(message),
      isAuthError:
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403 ||
        response.status === 422,
      isNetworkError: false,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     Get JWT
     
     IMPORTANT:
     The login endpoint is responsible only for authentication.
     
     The authoritative user/access information comes from:
     
       GET /api/access/me
     
     Therefore:
       - user_profile_id
       - role_code
       - access_scopes
     
     are NOT taken from the login response.
  ───────────────────────────────────────────────────────────── */

  const token = body?.access_token;

  if (!token) {
    if (import.meta.env.DEV) {
      console.error(
        "[authApi] Login succeeded but no access_token was returned."
      );
    }

    throw {
      status: 500,
      message:
        "Server returned an invalid auth response (no access token).",
      isNetworkError: false,
      isAuthError: false,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     Store canonical JWT
  ───────────────────────────────────────────────────────────── */

  localStorage.setItem(
    "token",
    token
  );

  _online = true;

  /* ─────────────────────────────────────────────────────────────
     IMPORTANT:
     
     Do NOT use body.user as the final authenticated user.
     
     AuthContext will immediately call:
     
       GET /api/access/me
     
     and use that response as the authoritative frontend
     user/access state.
     
     Authoritative fields include:
       - user_profile_id
       - role_code
       - access_scopes
       - employee_name
       - official_email
       - designation
       - department
  ───────────────────────────────────────────────────────────── */

  return {
    access_token: token,
    token_type:
      body?.token_type || "bearer",
  };
}


/* ───────────────────────────────────────────────────────────────
   Logout
─────────────────────────────────────────────────────────────── */

export function logoutFromBackend() {
  localStorage.removeItem("token");

  _online = null;
}


/* ───────────────────────────────────────────────────────────────
   Current authenticated user
   AUTHORITATIVE SOURCE
─────────────────────────────────────────────────────────────── */

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw {
      status: 401,
      message: "No authentication token found.",
      isAuthError: true,
      isNetworkError: false,
    };
  }

  let response;

  try {
    response = await fetchWithTimeout(
      ACCESS_ME_URL,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        "[authApi] Network error while loading current user:",
        error
      );
    }

    throw {
      status: 503,
      message:
        "Unable to connect to authentication server.",
      isNetworkError: true,
      isAuthError: false,
    };
  }

  const body =
    await response.json().catch(() => ({}));


  /* ─────────────────────────────────────────────────────────────
     Unauthorized
  ───────────────────────────────────────────────────────────── */

  if (response.status === 401) {
    localStorage.removeItem("token");

    throw {
      status: 401,
      message:
        body?.detail ||
        body?.message ||
        "Authentication session has expired.",
      isAuthError: true,
      isNetworkError: false,
    };
  }


  /* ─────────────────────────────────────────────────────────────
     Other errors
  ───────────────────────────────────────────────────────────── */

  if (!response.ok) {
    let message =
      body?.detail ||
      body?.message ||
      "Failed to fetch current user.";

    if (Array.isArray(body?.detail)) {
      message = body.detail
        .map((item) =>
          typeof item === "object"
            ? item.msg || JSON.stringify(item)
            : String(item)
        )
        .join(", ");
    }

    throw {
      status: response.status,
      message: String(message),
      isAuthError:
        response.status === 401 ||
        response.status === 403,
      isNetworkError: false,
    };
  }


  /*
   * IMPORTANT:
   *
   * Return the backend /api/access/me response directly.
   *
   * This response is the authoritative source for:
   * - user_profile_id
   * - role_code
   * - access_scopes
   * - employee_name
   * - official_email
   * - designation
   * - department
   */

  return body;
}


/* ───────────────────────────────────────────────────────────────
   Token accessor
─────────────────────────────────────────────────────────────── */

export function getStoredToken() {
  return localStorage.getItem("token");
}