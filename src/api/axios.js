import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL ?? ""}/api`,

    headers: {
        "Content-Type": "application/json",
    },
});


/*
 * Attach JWT to every API request.
 *
 * Canonical token storage:
 * localStorage.token
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
            console.log(
                `[API] ${config.method?.toUpperCase()} ${config.url}`
            );
        }

        return config;
    },
    (error) => Promise.reject(error)
);


/*
 * Handle API responses/errors.
 */
api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        const message =
            data?.detail ||
            data?.message ||
            error.message ||
            "Something went wrong.";

        /*
         * HTTP 401
         *
         * The JWT is invalid/expired.
         *
         * Immediately:
         * 1. Remove token
         * 2. Tell AuthContext authentication is no longer valid
         * 3. AuthContext clears user
         * 4. ProtectedRoute redirects to /login
         */
        if (status === 401) {
            localStorage.removeItem("token");

            window.dispatchEvent(
                new CustomEvent("auth:unauthorized")
            );

            toast.error(
                message || "Session expired. Please log in again."
            );
        }

        else if (status === 403) {
            toast.error(
                message || "Permission denied."
            );
        }

        else if (status === 404) {
            toast.error(
                message || "Record not found."
            );
        }

        else if (status === 422) {
            toast.error(
                message || "Validation error."
            );
        }

        else if (status === 500) {
            toast.error(
                message ||
                "Server error. Please contact support."
            );
        }

        else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;