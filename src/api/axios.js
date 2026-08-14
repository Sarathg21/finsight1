import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

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