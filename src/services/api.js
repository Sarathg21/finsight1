import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000, // Sync with env timeout or fallback to 30s
    headers: {
        'ngrok-skip-browser-warning': 'true',
    },
});

// Inject JWT Bearer token and user context headers on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pms_token');
    const userStr = localStorage.getItem('pms_user');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // --- Global Parameter Sanitization ---
    // Remove empty string parameters that cause 422/500 backend errors.
    // Ensure from_date/to_date/start_date/end_date are never empty.
    if (config.params) {
        Object.keys(config.params).forEach(key => {
            const val = config.params[key];
            if (val === '' || val === null || val === undefined) {
                // Remove empty or null params
                delete config.params[key];
            } else if (['from_date', 'to_date', 'start_date', 'end_date'].includes(key) && typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed.length < 10) {
                    delete config.params[key];
                } else {
                    // Convert DD-MM-YYYY to YYYY-MM-DD to avoid backend parsing errors
                    const dmy = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
                    if (dmy) {
                        config.params[key] = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
                    } else {
                        config.params[key] = trimmed;
                    }
                }
            }
        });
    }

    // Add employee context headers if available
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.emp_id || user.id) {
                config.headers['X-EMP-ID'] = user.emp_id || user.id;
            }
            if (user.role) {
                const r = user.role.toUpperCase();
                // Standardize role for backend headers: condense composite roles to primary keys
                let standardRole = r;
                if (r.includes('CFO')) standardRole = 'CFO';
                else if (r.includes('ADMIN')) standardRole = 'ADMIN';
                else if (r.includes('MANAGER')) standardRole = 'MANAGER';
                else if (r.includes('EMPLOYEE')) standardRole = 'EMPLOYEE';
                
                config.headers['X-USER-ROLE'] = standardRole;
            }
        } catch (e) {
            console.warn('[API] Failed to parse user for headers');
        }
    }
    
    return config;
});

// Public routes that must never be redirected to /login by the interceptor
const PUBLIC_PATHS = ['/reset-password', '/forgot-password', '/login'];
const isOnPublicPage = () =>
    PUBLIC_PATHS.some(p => window.location.pathname.startsWith(p));

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;
        const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
        const url = error.config?.url || '';

        const isBlob = error.config?.responseType === 'blob';

        if (status === 401) {
            // Never redirect away from public pages or auth endpoints themselves
            const skipRedirect = isOnPublicPage() || url.includes('/auth/') || url.includes('reset-password');

            if (!skipRedirect) {
                localStorage.removeItem('pms_token');
                localStorage.removeItem('pms_user');
                window.location.href = '/login';
            }
        } else if (status === 422) {
            // Blob requests handle their own error display — skip global toast
            const skipToast = error.config?.skipErrorToast === true;
            if (!isBlob && !skipToast) {
                const detail = error.response?.data?.detail;
                const msg = Array.isArray(detail)
                    ? detail.map(d => d.msg).join(', ')
                    : (detail || 'Invalid input. Please check your data.');
                toast.error(msg);
            }
        } else if (status === 400 || status === 409) {
            // Blob requests (downloads/exports) handle their own error display — skip global toast
            if (!isBlob) toast.error(message);
        } else if (status === 403) {
            // Gracefully resolve 403s ONLY for GET requests for authenticated users.
            // State-changing actions (POST, PUT, DELETE) must fail explicitly so users 
            // know their action (like approval or deletion) was not performed.
            // Callers can set skip403Graceful: true to receive the real 403 (e.g. manager recurring).
            try {
                const savedUser = JSON.parse(localStorage.getItem('pms_user') || '{}');
                const isGet = error.config?.method?.toLowerCase() === 'get';
                const skipGraceful = error.config?.skip403Graceful === true;

                // We should NOT mock data for blob/binary requests (like downloads) 
                // as it would return a corrupted file (the dummy JSON as a blob).
                if (savedUser?.role && isGet && !isBlob && !skipGraceful) {
                    console.warn(`[API] 403 Forbidden on ${url} for role ${savedUser.role}. Resolving gracefully.`);
                    return Promise.resolve({ data: { data: [], notifications: [], items: [], status: 'success' } });
                }
            } catch (e) { /* ignore */ }

            // Not authenticated or not a GET request — redirect only if NOT on a public page
            if (!localStorage.getItem('pms_token') && !isOnPublicPage()) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);


export default api;
