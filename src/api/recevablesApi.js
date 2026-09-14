const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

function getAuthHeaders() {
  const token = localStorage.getItem('finsight_token');

  return {
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
}

function buildQueryParams(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'All' ||
      value === 'all'
    ) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (
          item !== undefined &&
          item !== null &&
          item !== '' &&
          item !== 'All' &&
          item !== 'all'
        ) {
          searchParams.append(key, item);
        }
      });
    } else {
      searchParams.append(key, value);
    }
  });

  return searchParams;
}

async function receivablesApiCall(
  path,
  params = {}
) {
  const queryParams =
    buildQueryParams(params);

  const qs = queryParams.toString();

  const url =
    `${API_BASE}${path}` +
    `${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/* =========================================================
   1. FILTERS
   GET /api/receivables/filters
========================================================= */

export function fetchReceivablesFilters(params = {}) {
  return receivablesApiCall(
    '/api/receivables/filters',
    params
  );
}

/* =========================================================
   2. SUMMARY
   GET /api/receivables/summary
========================================================= */

export function fetchReceivablesSummary(params = {}) {
  return receivablesApiCall(
    '/api/receivables/summary',
    params
  );
}

/* =========================================================
   3. AGING SUMMARY
   GET /api/receivables/aging-summary
========================================================= */

export function fetchReceivablesAgingSummary(params = {}) {
  return receivablesApiCall(
    '/api/receivables/aging-summary',
    params
  );
}

/* =========================================================
   4. BUCKETS
   GET /api/receivables/buckets
========================================================= */

export function fetchReceivablesBuckets(params = {}) {
  return receivablesApiCall(
    '/api/receivables/buckets',
    params
  );
}

/* =========================================================
   5. OVERDUE SUMMARY
   GET /api/receivables/overdue-summary
========================================================= */

export function fetchReceivablesOverdueSummary(params = {}) {
  return receivablesApiCall(
    '/api/receivables/overdue-summary',
    params
  );
}

/* =========================================================
   6. DIVISION-WISE
   GET /api/receivables/division-wise
========================================================= */

export function fetchReceivablesDivisionWise(params = {}) {
  return receivablesApiCall(
    '/api/receivables/division-wise',
    params
  );
}

/* =========================================================
   7. SUB-DIVISION
   GET /api/receivables/sub-division
========================================================= */

export function fetchReceivablesSubDivision(params = {}) {
  return receivablesApiCall(
    '/api/receivables/sub-division',
    params
  );
}

/* =========================================================
   8. TOP CUSTOMERS
   GET /api/receivables/top-customers
========================================================= */

export function fetchReceivablesTopCustomers(params = {}) {
  return receivablesApiCall(
    '/api/receivables/top-customers',
    params
  );
}

/* =========================================================
   9. DETAILS
   GET /api/receivables/details
========================================================= */

export async function getReceivableDetails(params = {}) {
  return receivablesApiCall(
    "/api/receivables/details",
    params
  );
}

export async function getReceivableExport(
  type,
  params = {}
) {
  const format = type === "xlsx" ? "excel" : type;

  const queryParams = buildQueryParams({
    ...params,
    format,
  });

  const qs = queryParams.toString();

  const url =
    `${API_BASE}/api/receivables/export` +
    `${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage =
      `Export failed: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();

      if (Array.isArray(errorData?.detail)) {
        errorMessage = errorData.detail
          .map(
            (item) =>
              item?.msg ||
              item?.message ||
              JSON.stringify(item)
          )
          .join(", ");
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error
    }

    throw new Error(errorMessage);
  }

  return {
    data: await response.blob(),
  };
}

export async function getReceivableFilters(params = {}) {
    return receivablesApiCall(
        "/api/receivables/filters",
        params
    );
}
export async function getReceivableAgingSummary(params = {}) {
    return receivablesApiCall(
        "/api/receivables/aging-summary",
        params
    );
}

export async function getReceivableOverdueSummary(params = {}) {
    return receivablesApiCall(
        "/api/receivables/overdue-summary",
        params
    );
}

export async function getReceivableSubDivision(params = {}) {
    return receivablesApiCall(
        "/api/receivables/sub-division",
        params
    );
}


export async function getReceivableSummary(params = {}) {
    return receivablesApiCall(
        "/api/receivables/summary",
        params
    );
}

export async function getReceivableTopCustomers(params = {}) {
    return receivablesApiCall(
        "/api/receivables/top-customers",
        params
    );
}

export async function getReceivableTrend(params = {}) {
    return receivablesApiCall(
        "/api/receivables/trend",
        params
    );
}

export async function getSalesmanPerformance(params = {}) {
    return receivablesApiCall(
        "/api/receivables/salesman",
        params
    );
}

export async function getReceivableDivisionWise(params = {}) {
    return receivablesApiCall(
        "/api/receivables/division-wise",
        params
    );
}
/* =========================================================
   10. TREND
   GET /api/receivables/trend
========================================================= */

export function fetchReceivablesTrend(params = {}) {
  return receivablesApiCall(
    '/api/receivables/trend',
    params
  );
}

/* =========================================================
   11. SALESMAN
   GET /api/receivables/salesman
========================================================= */

export function fetchReceivablesSalesman(params = {}) {
  return receivablesApiCall(
    '/api/receivables/salesman',
    params
  );
}

/* =========================================================
   12. EXPORT
   GET /api/receivables/export
========================================================= */

export async function exportReceivables(
  format,
  params = {}
) {
  const backendFormat =
    format === 'xlsx' ? 'excel' : format;

  const queryParams = buildQueryParams({
    ...params,
    format: backendFormat,
  });

  const qs = queryParams.toString();

  const url =
    `${API_BASE}/api/receivables/export` +
    `${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage =
      `Export failed: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();

      if (Array.isArray(errorData?.detail)) {
        errorMessage = errorData.detail
          .map(
            (item) =>
              item?.msg ||
              item?.message ||
              JSON.stringify(item)
          )
          .join(', ');
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const blob = await response.blob();

  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = blobUrl;

  link.download =
    `Receivables_Export_${new Date()
      .toISOString()
      .slice(0, 10)}.${backendFormat === 'excel'
      ? 'xlsx'
      : 'pdf'
    }`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(blobUrl);
}

/* =========================================================
   13. UPLOAD
   POST /api/receivables/upload
========================================================= */

export async function uploadReceivables(file) {
  if (!file) {
    throw new Error('Please select a file.');
  }

  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(
    `${API_BASE}/api/receivables/upload`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // IMPORTANT:
        // Do NOT set Content-Type manually.
        // Browser sets multipart/form-data boundary.
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let errorMessage =
      `Upload failed: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();

      if (Array.isArray(errorData?.detail)) {
        errorMessage = errorData.detail
          .map(
            (item) =>
              item?.msg ||
              item?.message ||
              JSON.stringify(item)
          )
          .join(', ');
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}