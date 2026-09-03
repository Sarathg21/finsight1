import { getApiRoot } from '../utils/apiBase';
import axios from "axios";
import toast from "react-hot-toast";


const api = axios.create({
  baseURL: getApiRoot(),

  headers: {
    "Content-Type": "application/json",
  },
});


/*
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 *
 * Attach JWT from localStorage.
 *
 * IMPORTANT:
 * Never console.log the actual JWT.
 */

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("finsight_token");


    if (token) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }


    /*
     * DEV logging only.
     *
     * Do NOT print token.
     */

    if (import.meta.env.DEV) {

      console.log(
        "➡️ API:",
        config.method?.toUpperCase(),
        config.url
      );

      console.log(
        "🔐 Authorization:",
        token
          ? "Bearer token attached"
          : "NO TOKEN"
      );
    }


    return config;
  },

  (error) =>
    Promise.reject(error)
);


/*
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 */

api.interceptors.response.use(

  /*
   * ----------------------------------------------------------
   * Successful response
   * ----------------------------------------------------------
   */

  (response) => {

    if (import.meta.env.DEV) {

      console.log(
        "✅ API Response:",
        response.status,
        response.config.url
      );
    }

    return response;
  },


  /*
   * ----------------------------------------------------------
   * Error response
   * ----------------------------------------------------------
   */

  (error) => {

    const status =
      error.response?.status;


    switch (status) {

      /*
       * ======================================================
       * 401 UNAUTHORIZED
       * ======================================================
       */

      case 401:

        toast.error(
          "Session expired. Please login again."
        );


        /*
         * Remove invalid/expired JWT.
         */

        localStorage.removeItem(
          "finsight_token"
        );


        /*
         * IMPORTANT:
         *
         * Notify App.jsx.
         *
         * App.jsx listens for:
         *
         * auth:unauthorized
         */

        window.dispatchEvent(
          new Event("auth:unauthorized")
        );

        break;


      /*
       * ======================================================
       * 403 FORBIDDEN
       * ======================================================
       */

      case 403:

        toast.error(
          "Permission denied."
        );

        break;


      /*
       * ======================================================
       * 404 NOT FOUND
       * ======================================================
       */

      case 404:

        toast.error(
          "Record not found."
        );

        break;


      /*
       * ======================================================
       * 422 VALIDATION ERROR
       * ======================================================
       */

      case 422:

        toast.error(
          error.response?.data?.detail ||
          "Validation error."
        );

        break;


      /*
       * ======================================================
       * 500 SERVER ERROR
       * ======================================================
       */

      case 500:

        toast.error(
          "Server error. Please contact support."
        );

        break;


      /*
       * ======================================================
       * OTHER ERRORS
       * ======================================================
       */

      default:

        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Something went wrong."
        );

        break;
    }


    return Promise.reject(error);
  }
);


export default api;