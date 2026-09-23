with open("src/services/bsApi.js", "r", encoding="utf-8") as f:
    code = f.read()

new_apicall = """
const apiCache = new Map();

async function apiCall(path, params = {}) {
  const token = localStorage.getItem('finsight_token');

  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === 'All' || v === 'all' || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length === 0 || (v.length === 1 && (v[0] === 'All' || v[0] === 'all'))) continue;
      v.forEach(item => {
        if (item !== 'All' && item !== 'all') urlParams.append(k, item);
      });
    } else {
      urlParams.append(k, v);
    }
  }
  const qs = urlParams.toString();

  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;

  if (apiCache.has(url)) {
    return apiCache.get(url);
  }

  const fetchPromise = (async () => {
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (networkErr) {
      const err = { status: 0, message: `Network error: ${networkErr.message}`, isAuthError: false };
      console.error('[bsApi] Network error on', url, networkErr);
      throw err;
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw { status: 401, message: 'Unauthorized', isAuthError: true };
      }

      const rawBody = await res.text().catch(() => '');
      let body = {};
      try { body = JSON.parse(rawBody); } catch { /* ignore */ }

      let message = body?.error?.message || body?.message || body?.detail;
      if (Array.isArray(message)) message = message.map(m => typeof m === 'object' ? m.msg : m).join(', ');
      if (!message) message = rawBody.slice(0, 120) || res.statusText || 'Error occurred';

      throw { status: res.status, message: String(message), rawBody: rawBody.slice(0, 300) };
    }

    return await res.json();
  })();

  apiCache.set(url, fetchPromise);
  setTimeout(() => apiCache.delete(url), 500);

  return fetchPromise;
}

"""

code = code.replace("function getAuthHeaders() {", new_apicall + "\nfunction getAuthHeaders() {")

with open("src/services/bsApi.js", "w", encoding="utf-8") as f:
    f.write(code)
