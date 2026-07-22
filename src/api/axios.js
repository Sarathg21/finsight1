
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Temporary token (remove this in production)

// After successful login
//localStorage.setItem("token", response.data.access_token);
localStorage.setItem(
    "token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6ZW5pdGhAZmp0Y28uY29tIiwidXNlcl9pZCI6Miwicm9sZSI6IkFkbWluIiwiZnVsbF9uYW1lIjoiWmVuaXRoIFVzZXIiLCJleHAiOjE3ODQ2NjkwMjR9.lgiDC7k9Fgwkf2pwrx0MRijWGKZsa7S6dGjeiUn6IZ8"
);

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;

        switch (status) {

            case 401:
                toast.error("Unauthorized API request");
                console.log("401 Error:", error.response?.data);
                break;

            case 403:
                toast.error("Permission denied.");
                break;

            case 404:
                toast.error("Record not found.");
                break;

            case 500:
                toast.error("Server error. Please contact support.");
                break;

            default:
                toast.error(
                    error.response?.data?.message ||
                    "Something went wrong."
                );
        }

        return Promise.reject(error);
    }
);

export default api;