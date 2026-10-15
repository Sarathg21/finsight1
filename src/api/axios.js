// // import { getApiRoot } from '../utils/apiBase';
// // import axios from "axios";
// // import toast from "react-hot-toast";


// // const api = axios.create({
// //   baseURL: getApiRoot(),

// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });


// // /*
// //  * ============================================================
// //  * REQUEST INTERCEPTOR
// //  * ============================================================
// //  *
// //  * Attach JWT from localStorage.
// //  *
// //  * IMPORTANT:
// //  * Never console.log the actual JWT.
// //  */

// // api.interceptors.request.use(
// //   (config) => {

// //     const token =
// //       localStorage.getItem("finsight_token") ||
// //       localStorage.getItem("token");


// //     if (token) {

// //       config.headers =
// //         config.headers || {};

// //       config.headers.Authorization =
// //         `Bearer ${token}`;
// //     }


// //     /*
// //      * DEV logging only.
// //      *
// //      * Do NOT print token.
// //      */

// //     if (import.meta.env.DEV) {

// //       console.log(
// //         "➡️ API:",
// //         config.method?.toUpperCase(),
// //         config.url
// //       );

// //       console.log(
// //         "🔐 Authorization:",
// //         token
// //           ? "Bearer token attached"
// //           : "NO TOKEN"
// //       );
// //     }


// //     return config;
// //   },

// //   (error) =>
// //     Promise.reject(error)
// // );


// // /*
// //  * ============================================================
// //  * RESPONSE INTERCEPTOR
// //  * ============================================================
// //  */

// // api.interceptors.response.use(

// //   /*
// //    * ----------------------------------------------------------
// //    * Successful response
// //    * ----------------------------------------------------------
// //    */

// //   (response) => {

// //     if (import.meta.env.DEV) {

// //       console.log(
// //         "✅ API Response:",
// //         response.status,
// //         response.config.url
// //       );
// //     }

// //     return response;
// //   },


// //   /*
// //    * ----------------------------------------------------------
// //    * Error response
// //    * ----------------------------------------------------------
// //    */

// //   (error) => {

// //     const status =
// //       error.response?.status;


// //     switch (status) {

// //       /*
// //        * ======================================================
// //        * 401 UNAUTHORIZED
// //        * ======================================================
// //        */

// //       case 401:

// //         toast.error(
// //           "Session expired. Please login again."
// //         );


// //         /*
// //          * Remove invalid/expired JWT.
// //          */

// //         localStorage.removeItem(
// //           "finsight_token"
// //         );
// //         localStorage.removeItem(
// //           "token"
// //         );


// //         /*
// //          * IMPORTANT:
// //          *
// //          * Notify App.jsx.
// //          *
// //          * App.jsx listens for:
// //          *
// //          * auth:unauthorized
// //          */

// //         window.dispatchEvent(
// //           new Event("auth:unauthorized")
// //         );

// //         break;


// //       /*
// //        * ======================================================
// //        * 403 FORBIDDEN
// //        * ======================================================
// //        */

// //       case 400:
// //         toast.error(
// //           error.response?.data?.detail ||
// //           error.response?.data?.message ||
// //           "Invalid request. Please check the submitted information."
// //         );
// //         break;

// //       case 403: {
// //         const backendMessage =
// //           error.response?.data?.detail ||
// //           error.response?.data?.message ||
// //           "Permission denied.";
// //         const environmentBlocked =
// //           /write operations are disabled|read.only|integration environment/i.test(String(backendMessage));
// //         toast.error(environmentBlocked
// //           ? String(backendMessage)
// //           : `Permission denied: ${backendMessage}`);
// //         break;
// //       }

// //       case 409:
// //         toast.error(
// //           error.response?.data?.detail ||
// //           error.response?.data?.message ||
// //           "Conflict detected. Refresh the data and try again."
// //         );
// //         break;


// //       /*
// //        * ======================================================
// //        * 404 NOT FOUND
// //        * ======================================================
// //        */

// //       case 404:

// //         toast.error(
// //           "Record not found."
// //         );

// //         break;

// //       case 503:
// //       case 502:
// //       case 500:
// //         toast.error(
// //           error.response?.data?.detail ||
// //           "The server is temporarily unavailable. Please try again later."
// //         );
// //         break;


// //       /*
// //        * ======================================================
// //        * 422 VALIDATION ERROR
// //        * ======================================================
// //        */

// //       case 422: {
// //         const detail = error.response?.data?.detail;
// //         const validationMessage = Array.isArray(detail)
// //           ? detail.map((item) => [item?.loc?.filter(Boolean).join("."), item?.msg].filter(Boolean).join(": ")).join("; ")
// //           : (typeof detail === "string" ? detail : error.response?.data?.message);
// //         toast.error(validationMessage || "Validation error. Please review the highlighted fields.");
// //         break;
// //       }


// //       /*
// //        * ======================================================
// //        * 500 SERVER ERROR
// //        * ======================================================
// //        */

// //       case 500:

// //         toast.error(
// //           "Server error. Please contact support."
// //         );

// //         break;


// //       /*
// //        * ======================================================
// //        * OTHER ERRORS
// //        * ======================================================
// //        */

// //       default:

// //         toast.error(
// //           error.response?.data?.detail ||
// //           error.response?.data?.message ||
// //           "Something went wrong."
// //         );

// //         break;
// //     }


// //     return Promise.reject(error);
// //   }
// // );


// // export default api;



// import { getApiRoot } from '../utils/apiBase';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const api = axios.create({
//   baseURL: getApiRoot(),
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// /**
//  * Extract a safe, readable error message from the backend.
//  * Do not expose stack traces, SQL errors, or raw internal objects.
//  */
// export const getApiErrorMessage = (
//   error,
//   fallback = 'Something went wrong.'
// ) => {
//   const data = error?.response?.data;

//   const detail = data?.detail;
//   const message = data?.message;

//   if (Array.isArray(detail)) {
//     const validationMessages = detail
//       .map((item) => {
//         const field = Array.isArray(item?.loc)
//           ? item.loc.filter(Boolean).join('.')
//           : '';

//         const reason = item?.msg || item?.message || '';

//         return [field, reason].filter(Boolean).join(': ');
//       })
//       .filter(Boolean);

//     if (validationMessages.length > 0) {
//       return validationMessages.join('; ');
//     }
//   }

//   if (typeof detail === 'string' && detail.trim()) {
//     return detail;
//   }

//   if (typeof message === 'string' && message.trim()) {
//     return message;
//   }

//   return fallback;
// };

// /**
//  * REQUEST INTERCEPTOR
//  *
//  * Attach the existing JWT without logging its value.
//  */
// api.interceptors.request.use(
//   (config) => {
//     const token =
//       localStorage.getItem('finsight_token') ||
//       localStorage.getItem('token');

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     if (import.meta.env.DEV) {
//       console.log(
//         'API request:',
//         config.method?.toUpperCase(),
//         config.url
//       );

//       console.log(
//         'Authorization:',
//         token ? 'Bearer token attached' : 'NO TOKEN'
//       );
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /**
//  * RESPONSE INTERCEPTOR
//  */
// api.interceptors.response.use(
//   (response) => {
//     if (import.meta.env.DEV) {
//       console.log(
//         'API response:',
//         response.status,
//         response.config?.url
//       );
//     }

//     return response;
//   },

//   (error) => {
//     const status = error?.response?.status;

//     const backendMessage = getApiErrorMessage(
//       error,
//       'Something went wrong.'
//     );

//     switch (status) {
//       case 400:
//         toast.error(
//           getApiErrorMessage(
//             error,
//             'Invalid request. Please check the submitted information.'
//           )
//         );
//         break;

//       case 401:
//         toast.error(
//           'Session expired. Please log in again.'
//         );

//         localStorage.removeItem('finsight_token');
//         localStorage.removeItem('token');

//         // Preserve the existing shared authentication event.
//         window.dispatchEvent(
//           new Event('auth:unauthorized')
//         );
//         break;

//       case 403: {
//         /*
//          * Keep environment restrictions distinct from
//          * actual authorization failures.
//          */
//         const environmentBlocked =
//           /write operations are disabled|read.only|integration environment/i.test(
//             String(backendMessage)
//           );

//         toast.error(
//           environmentBlocked
//             ? backendMessage
//             : `Permission denied: ${backendMessage}`
//         );
//         break;
//       }

//       case 404:
//         toast.error(
//           getApiErrorMessage(error, 'Requested resource was not found.')
//         );
//         break;

//       case 409:
//         toast.error(
//           getApiErrorMessage(
//             error,
//             'Conflict detected. Refresh the data and try again.'
//           )
//         );
//         break;

//       case 422:
//         toast.error(
//           getApiErrorMessage(
//             error,
//             'Validation failed. Please review the submitted fields.'
//           )
//         );
//         break;

//       case 500:
//       case 502:
//       case 503:
//       case 504:
//         toast.error(
//           getApiErrorMessage(
//             error,
//             'The server is temporarily unavailable. Please try again later.'
//           )
//         );
//         break;

//       default:
//         if (!error?.response) {
//           toast.error(
//             'Unable to connect to the server. Check that the backend is running and the API URL is correct.'
//           );
//         } else {
//           toast.error(backendMessage);
//         }
//         break;
//     }

//     // Preserve rejected promises so existing callers can handle errors.
//     return Promise.reject(error);
//   }
// );

// export default api;



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
      localStorage.getItem("finsight_token") ||
      localStorage.getItem("token");


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
        localStorage.removeItem(
          "token"
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

      case 400:
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Invalid request. Please check the submitted information."
        );
        break;

      case 403: {
        const backendMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Permission denied.";
        const environmentBlocked =
          /write operations are disabled|read.only|integration environment/i.test(String(backendMessage));
        toast.error(environmentBlocked
          ? String(backendMessage)
          : `Permission denied: ${backendMessage}`);
        break;
      }

      case 409:
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Conflict detected. Refresh the data and try again."
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

      case 503:
      case 502:
      case 500:
        toast.error(
          error.response?.data?.detail ||
          "The server is temporarily unavailable. Please try again later."
        );
        break;


      /*
       * ======================================================
       * 422 VALIDATION ERROR
       * ======================================================
       */

      case 422: {
        const detail = error.response?.data?.detail;
        const validationMessage = Array.isArray(detail)
          ? detail.map((item) => [item?.loc?.filter(Boolean).join("."), item?.msg].filter(Boolean).join(": ")).join("; ")
          : (typeof detail === "string" ? detail : error.response?.data?.message);
        toast.error(validationMessage || "Validation error. Please review the highlighted fields.");
        break;
      }



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