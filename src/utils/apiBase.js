/**
 * Resolve the API origin for browser requests.
 *
 * Local dev and Vercel production should use relative paths (/api/...)
 * so requests go through the Vite dev proxy or Vercel serverless proxy.
 *
 * If VITE_API_BASE_URL points at an http:// backend while the app is
 * served over https:// (typical on Vercel), browsers block mixed-content
 * requests — fall back to the same-origin /api proxy instead.
 */
export function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

  if (!configured) {
    return "";
  }

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    configured.startsWith("http://")
  ) {
    return "";
  }

  return configured.replace(/\/+$/, "");
}

/**
 * Axios/fetch base path that always includes the /api prefix.
 */
export function getApiRoot() {
  const base = getApiBaseUrl();
  return base ? `${base}/api` : "/api";
}
