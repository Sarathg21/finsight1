
// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   User,
//   Lock,
//   Eye,
//   EyeOff,
//   ShieldCheck,
// } from "lucide-react";
// import {
//   useNavigate,
//   useLocation,
//   Link,
// } from "react-router-dom";

// export default function LoginPage() {
//   const {
//     user,
//     loginWithBackend,
//   } = useAuth();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const from =
//     location.state?.from?.pathname || null;

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [showPwd, setShowPwd] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [ready, setReady] = useState(false);

//   const [backendStatus, setBackendStatus] =
//     useState("idle");

//   /* ================================================================
//      REDIRECT ALREADY AUTHENTICATED USER
//   ================================================================= */

//   useEffect(() => {
//     if (!user) return;

//     /*
//      * ADMIN is redirected to Payables after successful backend
//      * authentication.
//      *
//      * Do not redirect ADMIN here because the login flow handles it.
//      */
//     if (user.role_code === "ADMIN") {
//       return;
//     }

//     navigate(
//       from ||
//       user.defaultPage ||
//       "/dashboard",
//       {
//         replace: true,
//       }
//     );
//   }, [
//     user,
//     navigate,
//     from,
//   ]);

//   /* ================================================================
//      READY BUTTON ANIMATION
//   ================================================================= */

//   useEffect(() => {
//     if (!ready) return;

//     const timer = setTimeout(
//       () => setReady(false),
//       3200
//     );

//     return () => clearTimeout(timer);
//   }, [ready]);

//   /* ================================================================
//      LOGIN

//      IMPORTANT:
//      Existing authentication logic is kept unchanged.
//   ================================================================= */

//   async function handleSubmit(e) {
//     e.preventDefault();

//     setError("");
//     setLoading(true);
//     setBackendStatus("checking");
//     setReady(false);

//     try {
//       const session = await loginWithBackend(
//         email.trim(),
//         password
//       );

//       console.log("LOGIN SESSION:", session);
//       console.log(
//         "ACCESS TOKEN:",
//         !!session?.access_token
//       );
//       console.log(
//         "ROLE CODE:",
//         session?.role_code
//       );

//       setBackendStatus("online");

//       const roleCode =
//         session?.role_code ||
//         session?.user?.role_code;

//       if (
//         roleCode === "ADMIN" ||
//         roleCode === "BU_ACCOUNTANT"
//       ) {
//         const payablesOrigin =
//           import.meta.env.VITE_PAYABLES_ORIGIN;

//         let payablesWindow = null;

//         const handlePayablesReady = (event) => {
//           if (event.origin !== payablesOrigin) {
//             return;
//           }

//           if (
//             event.data?.type !==
//             "PAYABLES_READY"
//           ) {
//             return;
//           }

//           console.log(
//             "Payables is ready. Sending authentication token."
//           );

//           if (
//             payablesWindow &&
//             !payablesWindow.closed
//           ) {
//             console.log(
//               "PAYABLES_READY received from:",
//               event.origin,
//               event.data
//             );

//             console.log(
//               "Sending FINSIGHT_AUTH to:",
//               payablesOrigin
//             );

//             console.log(
//               "Token available:",
//               !!session?.access_token
//             );

//             payablesWindow.postMessage(
//               {
//                 type: "FINSIGHT_AUTH",
//                 token: session.access_token,
//               },
//               payablesOrigin
//             );
//           }

//           window.removeEventListener(
//             "message",
//             handlePayablesReady
//           );
//         };

//         window.addEventListener(
//           "message",
//           handlePayablesReady
//         );

//         payablesWindow = window.open(
//           payablesOrigin,
//           "_blank"
//         );

//         if (!payablesWindow) {
//           window.removeEventListener(
//             "message",
//             handlePayablesReady
//           );

//           setError(
//             "Payables window was blocked. Please allow pop-ups."
//           );

//           return;
//         }

//         window.payablesWindow =
//           payablesWindow;

//         navigate(
//           from || "/dashboard",
//           {
//             replace: true,
//           }
//         );

//         return;
//       }

//       navigate(
//         from ||
//         session?.defaultPage ||
//         "/dashboard",
//         {
//           replace: true,
//         }
//       );

//     } catch (backendErr) {
//       const isAuthFailure =
//         backendErr?.isAuthError ||
//         backendErr?.status === 401 ||
//         backendErr?.status === 403 ||
//         backendErr?.status === 422;

//       if (isAuthFailure) {
//         setBackendStatus("online");

//         setError(
//           backendErr.message ||
//           "Invalid email or password"
//         );
//       } else {
//         setBackendStatus("offline");

//         setError(
//           backendErr.message ||
//           "Unable to connect to the authentication server."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ================================================================
//      UI
//   ================================================================= */

//   return (
//     <div className="finsight-login-page">

//       {/* ============================================================
//           LEFT SIDE - FINANCIAL INTELLIGENCE VISUAL
//       ============================================================ */}

//       <section className="finsight-login-visual">

//         <div className="visual-overlay" />

//         <div className="visual-content">

//           {/* FinSight Branding */}

//           <div className="finsight-brand">
//             <span>FinSight</span>
//             <span className="registered-symbol">®</span>
//           </div>

//           <div className="finsight-subtitle">
//             Financial Intelligence Platform
//           </div>

//           <div className="brand-accent-line" />

//           <h1 className="visual-heading">
//             Clarity for every
//             <br />
//             financial decision.
//           </h1>

//         </div>


//         {/* ==========================================================
//             FINANCIAL CHART
//         ========================================================== */}

//         <div className="financial-chart">

//           <div className="chart-grid-lines">
//             <span />
//             <span />
//             <span />
//             <span />
//           </div>

//           <div className="chart-bars">

//             <span style={{ height: "10%" }} />
//             <span style={{ height: "7%" }} />
//             <span style={{ height: "14%" }} />
//             <span style={{ height: "19%" }} />
//             <span style={{ height: "25%" }} />
//             <span style={{ height: "33%" }} />
//             <span style={{ height: "29%" }} />
//             <span style={{ height: "41%" }} />
//             <span style={{ height: "48%" }} />
//             <span style={{ height: "63%" }} />
//             <span style={{ height: "58%" }} />
//             <span style={{ height: "72%" }} />
//             <span style={{ height: "84%" }} />

//           </div>


//           <svg
//             className="growth-line"
//             viewBox="0 0 1000 500"
//             preserveAspectRatio="none"
//           >

//             <defs>

//               <linearGradient
//                 id="lineGradient"
//                 x1="0%"
//                 y1="0%"
//                 x2="100%"
//                 y2="0%"
//               >
//                 <stop
//                   offset="0%"
//                   stopColor="#35cfd0"
//                 />

//                 <stop
//                   offset="100%"
//                   stopColor="#94f5ee"
//                 />

//               </linearGradient>


//               <filter
//                 id="lineGlow"
//                 x="-50%"
//                 y="-50%"
//                 width="200%"
//                 height="200%"
//               >

//                 <feGaussianBlur
//                   stdDeviation="5"
//                   result="coloredBlur"
//                 />

//                 <feMerge>
//                   <feMergeNode in="coloredBlur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>

//               </filter>

//             </defs>


//             <polyline
//               points="
//                 40,420
//                 120,405
//                 190,370
//                 270,345
//                 350,275
//                 430,260
//                 510,175
//                 600,160
//                 690,105
//                 780,35
//                 900,-20
//               "
//               fill="none"
//               stroke="url(#lineGradient)"
//               strokeWidth="5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               filter="url(#lineGlow)"
//             />


//             {[
//               [40, 420],
//               [120, 405],
//               [190, 370],
//               [270, 345],
//               [350, 275],
//               [430, 260],
//               [510, 175],
//               [600, 160],
//               [690, 105],
//               [780, 35],
//             ].map(([cx, cy], index) => (

//               <g key={index}>

//                 <circle
//                   cx={cx}
//                   cy={cy}
//                   r="10"
//                   fill="rgba(61, 225, 221, 0.18)"
//                 />

//                 <circle
//                   cx={cx}
//                   cy={cy}
//                   r="5"
//                   fill="#86f5ef"
//                 />

//               </g>

//             ))}

//           </svg>

//         </div>

//         {/* ==========================================================
//             COPYRIGHT
//         ========================================================== */}

//         <div className="login-copyright">

//           © 2026 ZeNith Data Intelligence LLC. All rights reserved.

//         </div>


//       </section>


//       {/* ============================================================
//           RIGHT SIDE - LOGIN
//       ============================================================ */}

//       <section className="finsight-login-form-section">

//         <div className="login-form-container">



//           {/* ========================================================
//               FJ GROUP EXACT LOGO
//           ======================================================== */}

//           <div className="fj-group-brand">
//             <img
//               src="/images/fj1.png.png"
//               alt="FJ Group - MEP for a better living"
//               className="fj-group-logo-image"
//             />
//           </div>

//           {/* ========================================================
//               WELCOME
//           ======================================================== */}

//           <h2 className="welcome-heading">
//             Welcome
//           </h2>


//           {/* ========================================================
//               LOGIN FORM
//           ======================================================== */}

//           <form
//             onSubmit={handleSubmit}
//             className="login-form"
//           >

//             {/* EMAIL */}

//             <div className="login-field-group">

//               <label htmlFor="login-email">
//                 Email
//               </label>

//               <div className="login-input-wrapper">

//                 <User
//                   size={22}
//                   className="login-input-icon"
//                   strokeWidth={1.8}
//                 />

//                 <input
//                   id="login-email"
//                   type="text"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setError("");
//                   }}
//                   autoComplete="username"
//                   placeholder="Enter Email"
//                   required
//                 />

//               </div>

//             </div>


//             {/* PASSWORD */}

//             <div className="login-field-group">

//               <label htmlFor="login-password">
//                 Password
//               </label>

//               <div className="login-input-wrapper">

//                 <Lock
//                   size={22}
//                   className="login-input-icon"
//                   strokeWidth={1.8}
//                 />

//                 <input
//                   id="login-password"
//                   type={
//                     showPwd
//                       ? "text"
//                       : "password"
//                   }
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setError("");
//                   }}
//                   autoComplete="current-password"
//                   placeholder="Enter Password"
//                   required
//                 />

//                 <button
//                   type="button"
//                   className="password-visibility-button"
//                   onClick={() =>
//                     setShowPwd(
//                       (value) => !value
//                     )
//                   }
//                   aria-label="Toggle password visibility"
//                 >
//                   {showPwd ? (
//                     <EyeOff
//                       size={22}
//                       strokeWidth={1.8}
//                     />
//                   ) : (
//                     <Eye
//                       size={22}
//                       strokeWidth={1.8}
//                     />
//                   )}
//                 </button>

//               </div>

//             </div>


//             {/* FORGOT PASSWORD */}

//             <div className="forgot-password-row">

//               <Link
//                 to="/forgot-password"
//                 id="forgot-password-link"
//               >
//                 Forgot Password?
//               </Link>

//             </div>


//             {/* ERROR */}

//             {error && (

//               <div className="login-error-message">

//                 {error}

//               </div>

//             )}


//             {/* LOGIN BUTTON */}

//             <button
//               id="login-submit-btn"
//               type="submit"
//               className={`secure-login-button ${ready
//                 ? "secure-login-button-ready"
//                 : ""
//                 }`}
//               disabled={loading}
//             >

//               {loading ? (

//                 <>
//                   <span className="login-spinner" />

//                   <span>
//                     Signing In...
//                   </span>
//                 </>

//               ) : (

//                 <>

//                   <ShieldCheck
//                     size={25}
//                     strokeWidth={1.8}
//                   />

//                   <span>
//                     Sign In Securely
//                   </span>

//                 </>

//               )}

//             </button>

//           </form>

//         </div>



//       </section>


//       {/* ============================================================
//           STYLES
//       ============================================================ */}

//       <style>{`

//         /* ==========================================================
//            ROOT
//         ========================================================== */

//         * {
//           box-sizing: border-box;
//         }

//         .finsight-login-page {
//           width: 100%;
//           min-height: 100vh;
//           display: grid;
//           grid-template-columns: 54% 46%;
//           overflow: hidden;
//           background: #ffffff;
//           font-family:
//             Inter,
//             "Segoe UI",
//             Arial,
//             sans-serif;
//         }


//         /* ==========================================================
//            LEFT VISUAL
//         ========================================================== */

//         .finsight-login-visual {
//           position: relative;
//           min-height: 100vh;
//           overflow: hidden;

//           background:
//             radial-gradient(
//               circle at 72% 68%,
//               rgba(15, 160, 171, 0.13),
//               transparent 30%
//             ),
//             radial-gradient(
//               circle at 10% 20%,
//               rgba(21, 57, 94, 0.2),
//               transparent 35%
//             ),
//             linear-gradient(
//               135deg,
//               #0d2039 0%,
//               #091a30 55%,
//               #061426 100%
//             );
//         }


//         .visual-overlay {
//           position: absolute;
//           inset: 0;

//           background:
//             linear-gradient(
//               180deg,
//               rgba(8, 20, 39, 0.05),
//               rgba(3, 12, 26, 0.28)
//             );

//           pointer-events: none;
//         }


//         .visual-content {
//           position: relative;
//           z-index: 3;

//           padding:
//             clamp(70px, 11vw, 140px)
//             clamp(55px, 7vw, 105px);
//         }


//      .finsight-brand {
//   color: #ffffff;

//  font-size: clamp(1.8rem, 2.5vw, 2.8rem);
//   font-weight: 700;

//   line-height: 1;

//   letter-spacing: -0.045em;

//   text-shadow:
//     0 4px 20px
//     rgba(0, 0, 0, 0.12);

//   display: flex;
//   align-items: flex-start;
// }

// .registered-symbol {
//   display: inline-block;
//   font-size: 1em;
//   margin-left: 1px;
//   vertical-align: super;
//   line-height: 1;
// }


//         .finsight-subtitle {
//           margin-top: 13px;

//           color:
//             rgba(255, 255, 255, 0.84);

//           font-size:
//             clamp(1rem, 1.55vw, 1.5rem);

//           font-weight: 400;

//           letter-spacing: -0.01em;
//         }


//         .brand-accent-line {
//           width: 68px;
//           height: 4px;

//           margin-top: 29px;

//           border-radius: 20px;

//           background:
//             linear-gradient(
//               90deg,
//               #35c8cd,
//               #77e6df
//             );

//           box-shadow:
//             0 0 15px
//             rgba(61, 218, 216, 0.4);
//         }


//         .visual-heading {
//           margin: 30px 0 0;

//           color: #70d6d5;

//           font-size:
//             clamp(1.55rem, 2.35vw, 2.7rem);

//           line-height: 1.35;

//           font-weight: 600;

//           letter-spacing: 0.01em;
//         }


//         /* ==========================================================
//            FINANCIAL CHART
//         ========================================================== */

//         .financial-chart {
//           position: absolute;

//           z-index: 2;

//           left: 9%;
//           right: 7%;
//           bottom: 9%;

//           height: 48%;

//           overflow: hidden;
//         }


//         .chart-grid-lines {
//           position: absolute;

//           inset: 0;

//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;

//           padding-bottom: 0;

//           border-left:
//             1px solid
//             rgba(98, 140, 166, 0.16);
//         }


//         .chart-grid-lines span {
//           width: 100%;

//           border-top:
//             1px dashed
//             rgba(98, 140, 166, 0.12);
//         }


//         .chart-bars {
//           position: absolute;

//           z-index: 1;

//           left: 6%;
//           right: 5%;
//           bottom: 0;

//           height: 100%;

//           display: flex;
//           align-items: flex-end;

//           gap:
//             clamp(8px, 1.2vw, 20px);
//         }


//         .chart-bars span {
//           flex: 1;

//           min-height: 15px;

//           border-radius:
//             2px 2px 0 0;

//           background:
//             linear-gradient(
//               to top,
//               rgba(13, 100, 121, 0.08),
//               rgba(29, 169, 176, 0.65)
//             );

//           box-shadow:
//             0 0 18px
//             rgba(32, 192, 194, 0.12);

//           opacity: 0.75;
//         }


//         .growth-line {
//           position: absolute;

//           z-index: 2;

//           inset: 0;

//           width: 100%;
//           height: 100%;

//           overflow: visible;
//         }


//         /* ==========================================================
//            RIGHT LOGIN SECTION
//         ========================================================== */

//         .finsight-login-form-section {
//           position: relative;

//           min-height: 100vh;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           padding:
//             70px
//             clamp(35px, 6vw, 90px)
//             105px;

//           background:
//             linear-gradient(
//               135deg,
//               #ffffff 0%,
//               #fbfbfc 50%,
//               #f7f8fa 100%
//             );
//         }


//         .login-form-container {
//           width: 100%;
//           max-width: 450px;
//         }


//       /* ==========================================================
//            /* FJ GROUP LOGO */
//           ========================================================== */

//         .fj-group-brand {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin-bottom: 15px;
//         }

//             .fj-group-logo-image {
//               width: 320px;
//               height: auto;

//               display: block;
//               object-fit: contain;
//             }

//         /* ==========================================================
//            WELCOME
//         ========================================================== */

//     .welcome-heading {
//          margin: 0 0 28px;

//          text-align: center;

//          color: #14223a;

//          font-size: clamp(1.9rem, 2.5vw, 2.4rem);

//          font-weight: 700;

//          letter-spacing: -0.04em;

//          line-height: 1.2;
//        }
//         /* ==========================================================
//            FORM
//         ========================================================== */

//         .login-form {
//           width: 100%;
//         }


//         .login-field-group {
//           margin-bottom: 26px;
//         }


//         .login-field-group label {
//           display: block;

//           margin-bottom: 10px;

//           color: #374151;

//           font-size: 0.95rem;

//           font-weight: 500;
//         }


//         .login-input-wrapper {
//           position: relative;

//           width: 100%;

//           display: flex;
//           align-items: center;
//         }


//         .login-input-icon {
//           position: absolute;

//           left: 20px;

//           z-index: 2;

//           color: #8b95a4;

//           pointer-events: none;
//         }


//         .login-input-wrapper input {
//           width: 100%;
//           height: 64px;

//           border:
//             1px solid
//             #d3d8df;

//           border-radius: 14px;

//           outline: none;

//           padding:
//             0
//             58px;

//           background: #ffffff;

//           color: #263247;

//           font-size: 1rem;

//           font-family: inherit;

//           transition:
//             border-color 0.2s ease,
//             box-shadow 0.2s ease,
//             background 0.2s ease;
//         }


//         .login-input-wrapper input::placeholder {
//           color: #a8b0bb;
//         }


//         .login-input-wrapper input:hover {
//           border-color: #bbc4cf;
//         }


//         .login-input-wrapper input:focus {
//           border-color: #16808a;

//           box-shadow:
//             0 0 0 4px
//             rgba(22, 128, 138, 0.1);
//         }


//         /* ==========================================================
//            PASSWORD BUTTON
//         ========================================================== */

//         .password-visibility-button {
//           position: absolute;

//           right: 17px;

//           z-index: 3;

//           width: 38px;
//           height: 38px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           border: none;

//           background: transparent;

//           color: #8b95a4;

//           cursor: pointer;

//           border-radius: 8px;

//           transition:
//             background 0.2s ease,
//             color 0.2s ease;
//         }


//         .password-visibility-button:hover {
//           color: #4b596c;

//           background:
//             rgba(16, 36, 61, 0.05);
//         }


//         /* ==========================================================
//            FORGOT PASSWORD
//         ========================================================== */

//         .forgot-password-row {
//           display: flex;

//           justify-content: flex-end;

//           margin-top: -5px;
//           margin-bottom: 32px;
//         }


//         .forgot-password-row a {
//           color: #3d566b;

//           text-decoration: none;

//           font-size: 0.92rem;

//           font-weight: 500;
//         }


//         .forgot-password-row a:hover {
//           color: #167b85;

//           text-decoration: underline;
//         }


//         /* ==========================================================
//            ERROR
//         ========================================================== */

//         .login-error-message {
//           margin-bottom: 18px;

//           padding: 13px 15px;

//           border:
//             1px solid
//             #fecaca;

//           border-radius: 10px;

//           background: #fff5f5;

//           color: #b42318;

//           font-size: 0.88rem;

//           line-height: 1.45;
//         }


//         /* ==========================================================
//            LOGIN BUTTON
//         ========================================================== */

//         .secure-login-button {
//           width: 100%;
//           height: 64px;

//           display: flex;

//           align-items: center;
//           justify-content: center;

//           gap: 12px;

//           border: none;

//           border-radius: 12px;

//           background:
//             linear-gradient(
//               90deg,
//               #147982,
//               #0b7e8a
//             );

//           color: #ffffff;

//           font-family: inherit;

//           font-size: 1.12rem;

//           font-weight: 600;

//           letter-spacing: -0.01em;

//           cursor: pointer;

//           box-shadow:
//             0 9px 24px
//             rgba(14, 119, 130, 0.18);

//           transition:
//             transform 0.2s ease,
//             box-shadow 0.2s ease,
//             opacity 0.2s ease;
//         }


//         .secure-login-button:hover:not(:disabled) {
//           transform: translateY(-2px);

//           box-shadow:
//             0 13px 30px
//             rgba(14, 119, 130, 0.28);
//         }


//         .secure-login-button:active:not(:disabled) {
//           transform: translateY(0);
//         }


//         .secure-login-button:disabled {
//           opacity: 0.72;

//           cursor: not-allowed;
//         }


//         .secure-login-button-ready {
//           box-shadow:
//             0 0 0 4px
//             rgba(65, 203, 194, 0.14),
//             0 12px 30px
//             rgba(14, 119, 130, 0.25);
//         }


//         /* ==========================================================
//            SPINNER
//         ========================================================== */

//         .login-spinner {
//           width: 19px;
//           height: 19px;

//           border-radius: 50%;

//           border:
//             2px solid
//             rgba(255, 255, 255, 0.35);

//           border-top-color: #ffffff;

//           animation:
//             finsight-login-spin
//             0.75s
//             linear
//             infinite;
//         }


//         @keyframes finsight-login-spin {

//           to {
//             transform: rotate(360deg);
//           }

//         }


//         /* ==========================================================
//            COPYRIGHT
//         ========================================================== */

//       .login-copyright {
//          position: absolute;

//          left: 0;
//          right: 0;
//          bottom: 27px;

//          z-index: 5;

//          padding: 0 20px;

//          text-align: center;

//          color: rgba(255, 255, 255, 0.55);

//          font-size: 0.78rem;

//          font-weight: 400;

//          letter-spacing: 0.01em;
//        }

//         /* ==========================================================
//            RESPONSIVE - TABLET
//         ========================================================== */

//         @media (max-width: 960px) {

//           .finsight-login-page {
//             grid-template-columns: 1fr;
//           }


//           .finsight-login-visual {
//             display: none;
//           }


//           .finsight-login-form-section {
//             min-height: 100vh;

//             padding:
//               60px
//               28px
//               100px;
//           }

//         }


//         /* ==========================================================
//            RESPONSIVE - MOBILE
//         ========================================================== */

//         @media (max-width: 520px) {

//           .finsight-login-form-section {
//             padding:
//               45px
//               18px
//               95px;
//           }


//           .fj-group-brand {
//             margin-bottom: 40px;
//           }


//           .fj-logo-symbol {
//             transform: scale(0.88);
//           }


//           .fj-brand-name {
//             font-size: 1.6rem;
//           }


//           .welcome-heading {
//             margin-bottom: 34px;
//             font-size: 2.1rem;
//           }


//           .login-input-wrapper input {
//             height: 60px;

//             border-radius: 12px;
//           }


//           .secure-login-button {
//             height: 60px;

//             font-size: 1.03rem;
//           }


//           .login-copyright {
//             bottom: 20px;

//             font-size: 0.7rem;
//           }

//         }

//       `}</style>

//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import {
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

export default function LoginPage() {
  const {
    user,
    loginWithBackend,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from?.pathname || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [backendStatus, setBackendStatus] =
    useState("idle");

  /* ================================================================
     REDIRECT ALREADY AUTHENTICATED USER
  ================================================================= */

  useEffect(() => {
    if (!user) return;

    /*
     * ADMIN is redirected to Payables after successful backend
     * authentication.
     *
     * Do not redirect ADMIN here because the login flow handles it.
     */
    if (user.role_code === "ADMIN") {
      return;
    }

    navigate(
      from ||
      user.defaultPage ||
      "/dashboard",
      {
        replace: true,
      }
    );
  }, [
    user,
    navigate,
    from,
  ]);

  /* ================================================================
     READY BUTTON ANIMATION
  ================================================================= */

  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(
      () => setReady(false),
      3200
    );

    return () => clearTimeout(timer);
  }, [ready]);

  /* ================================================================
     LOGIN

     IMPORTANT:
     Existing authentication logic is kept unchanged.
  ================================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);
    setBackendStatus("checking");
    setReady(false);

    try {
      const session = await loginWithBackend(
        email.trim(),
        password
      );

      console.log("LOGIN SESSION:", session);
      console.log(
        "ACCESS TOKEN:",
        !!session?.access_token
      );
      console.log(
        "ROLE CODE:",
        session?.role_code
      );

      setBackendStatus("online");

      const roleCode =
        session?.role_code ||
        session?.user?.role_code;

      if (
        roleCode === "ADMIN" ||
        roleCode === "BU_ACCOUNTANT"
      ) {
        const payablesOrigin =
          import.meta.env.VITE_PAYABLES_ORIGIN;

        let payablesWindow = null;

        const handlePayablesReady = (event) => {
          if (event.origin !== payablesOrigin) {
            return;
          }

          if (
            event.data?.type !==
            "PAYABLES_READY"
          ) {
            return;
          }

          console.log(
            "Payables is ready. Sending authentication token."
          );

          if (
            payablesWindow &&
            !payablesWindow.closed
          ) {
            console.log(
              "PAYABLES_READY received from:",
              event.origin,
              event.data
            );

            console.log(
              "Sending FINSIGHT_AUTH to:",
              payablesOrigin
            );

            console.log(
              "Token available:",
              !!session?.access_token
            );

            payablesWindow.postMessage(
              {
                type: "FINSIGHT_AUTH",
                token: session.access_token,
              },
              payablesOrigin
            );
          }

          window.removeEventListener(
            "message",
            handlePayablesReady
          );
        };

        window.addEventListener(
          "message",
          handlePayablesReady
        );

        payablesWindow = window.open(
          payablesOrigin,
          "_blank"
        );

        if (!payablesWindow) {
          window.removeEventListener(
            "message",
            handlePayablesReady
          );

          setError(
            "Payables window was blocked. Please allow pop-ups."
          );

          return;
        }

        window.payablesWindow =
          payablesWindow;

        navigate(
          from || "/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      navigate(
        from ||
        session?.defaultPage ||
        "/dashboard",
        {
          replace: true,
        }
      );

    } catch (backendErr) {
      const isAuthFailure =
        backendErr?.isAuthError ||
        backendErr?.status === 401 ||
        backendErr?.status === 403 ||
        backendErr?.status === 422;

      if (isAuthFailure) {
        setBackendStatus("online");

        setError(
          backendErr.message ||
          "Invalid email or password"
        );
      } else {
        setBackendStatus("offline");

        setError(
          backendErr.message ||
          "Unable to connect to the authentication server."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* ================================================================
     UI
  ================================================================= */

  return (
    <div className="finsight-login-page">

      {/* ============================================================
          LEFT SIDE - FINANCIAL INTELLIGENCE VISUAL
      ============================================================ */}

      <section className="finsight-login-visual">

        <div className="visual-overlay" />

        <div className="visual-content">

          {/* FinSight Branding */}

          <div className="finsight-brand">
            <span>FinSight</span>
            <span className="registered-symbol">®</span>
          </div>

          <div className="finsight-subtitle">
            Financial Intelligence Platform
          </div>

          <div className="brand-accent-line" />

          <h1 className="visual-heading">
            Clarity for every
            <br />
            financial decision.
          </h1>

        </div>


        {/* ==========================================================
            FINANCIAL CHART
        ========================================================== */}

        <div className="financial-chart">

          <div className="chart-grid-lines">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="chart-bars">

            <span style={{ height: "10%" }} />
            <span style={{ height: "7%" }} />
            <span style={{ height: "14%" }} />
            <span style={{ height: "19%" }} />
            <span style={{ height: "25%" }} />
            <span style={{ height: "33%" }} />
            <span style={{ height: "29%" }} />
            <span style={{ height: "41%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "63%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "72%" }} />
            <span style={{ height: "84%" }} />

          </div>


          <svg
            className="growth-line"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >

            <defs>

              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#35cfd0"
                />

                <stop
                  offset="100%"
                  stopColor="#94f5ee"
                />

              </linearGradient>


              <filter
                id="lineGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >

                <feGaussianBlur
                  stdDeviation="5"
                  result="coloredBlur"
                />

                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>

              </filter>

            </defs>


            <polyline
              points="
                40,420
                120,405
                190,370
                270,345
                350,275
                430,260
                510,175
                600,160
                690,105
                780,35
                900,-20
              "
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />


            {[
              [40, 420],
              [120, 405],
              [190, 370],
              [270, 345],
              [350, 275],
              [430, 260],
              [510, 175],
              [600, 160],
              [690, 105],
              [780, 35],
            ].map(([cx, cy], index) => (

              <g key={index}>

                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="rgba(61, 225, 221, 0.18)"
                />

                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#86f5ef"
                />

              </g>

            ))}

          </svg>

        </div>

        {/* ==========================================================
            COPYRIGHT
        ========================================================== */}

        <div className="login-copyright">

          © 2026 ZeNith Data Intelligence LLC. All rights reserved.

        </div>


      </section>


      {/* ============================================================
          RIGHT SIDE - LOGIN
      ============================================================ */}

      <section className="finsight-login-form-section">

        <div className="login-form-container">

          {/* ========================================================
              FJ GROUP EXACT LOGO
          ======================================================== */}

          <div className="fj-group-brand">
            <img
              src="/images/fj1.png.png"
              alt="FJ Group - MEP for a better living"
              className="fj-group-logo-image"
            />
          </div>

          {/* ========================================================
              WELCOME
          ======================================================== */}

          <h2 className="welcome-heading">
            Welcome
          </h2>


          {/* ========================================================
              LOGIN FORM
          ======================================================== */}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* EMAIL */}

            <div className="login-field-group">

              <label htmlFor="login-email">
                Email
              </label>

              <div className="login-input-wrapper">

                <User
                  size={22}
                  className="login-input-icon"
                  strokeWidth={1.8}
                />

                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="username"
                  placeholder="Enter Email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field-group">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-input-wrapper">

                <Lock
                  size={22}
                  className="login-input-icon"
                  strokeWidth={1.8}
                />

                <input
                  id="login-password"
                  type={
                    showPwd
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  placeholder="Enter Password"
                  required
                />

                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() =>
                    setShowPwd(
                      (value) => !value
                    )
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? (
                    <EyeOff
                      size={22}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={22}
                      strokeWidth={1.8}
                    />
                  )}
                </button>

              </div>

            </div>


            {/* FORGOT PASSWORD */}

            <div className="forgot-password-row">

              <Link
                to="/forgot-password"
                id="forgot-password-link"
              >
                Forgot Password?
              </Link>

            </div>


            {/* ERROR */}

            {error && (

              <div className="login-error-message">

                {error}

              </div>

            )}


            {/* LOGIN BUTTON */}

            <button
              id="login-submit-btn"
              type="submit"
              className={`secure-login-button ${ready
                ? "secure-login-button-ready"
                : ""
                }`}
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="login-spinner" />

                  <span>
                    Signing In...
                  </span>
                </>

              ) : (

                <>

                  <ShieldCheck
                    size={25}
                    strokeWidth={1.8}
                  />

                  <span>
                    Sign In Securely
                  </span>

                </>

              )}

            </button>

          </form>

        </div>

      </section>


      {/* ============================================================
          STYLES
      ============================================================ */}

      <style>{`

        /* ==========================================================
           ROOT
        ========================================================== */

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          overflow: hidden;
        }

        .finsight-login-page {
          width: 100%;
          height: 100vh;
          min-height: 100vh;

          display: grid;
          grid-template-columns: 54% 46%;

          overflow: hidden;

          background: #ffffff;

          font-family:
            Inter,
            "Segoe UI",
            Arial,
            sans-serif;
        }


        /* ==========================================================
           LEFT VISUAL
        ========================================================== */

        .finsight-login-visual {
          position: relative;

          width: 100%;
          height: 100vh;
          min-height: 0;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 72% 68%,
              rgba(15, 160, 171, 0.13),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 20%,
              rgba(21, 57, 94, 0.2),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #0d2039 0%,
              #091a30 55%,
              #061426 100%
            );
        }


        .visual-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(8, 20, 39, 0.05),
              rgba(3, 12, 26, 0.28)
            );

          pointer-events: none;
        }


        .visual-content {
          position: relative;
          z-index: 3;

          padding:
            clamp(70px, 11vw, 140px)
            clamp(55px, 7vw, 105px);
        }


        .finsight-brand {
          color: #ffffff;

          font-size:
            clamp(1.8rem, 2.5vw, 2.8rem);

          font-weight: 700;

          line-height: 1;

          letter-spacing: -0.045em;

          text-shadow:
            0 4px 20px
            rgba(0, 0, 0, 0.12);

          display: flex;
          align-items: flex-start;
        }


        .registered-symbol {
          display: inline-block;

          font-size: 1em;

          margin-left: 1px;

          vertical-align: super;

          line-height: 1;
        }


        .finsight-subtitle {
          margin-top: 13px;

          color:
            rgba(255, 255, 255, 0.84);

          font-size:
            clamp(1rem, 1.55vw, 1.5rem);

          font-weight: 400;

          letter-spacing: -0.01em;
        }


        .brand-accent-line {
          width: 68px;
          height: 4px;

          margin-top: 29px;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #35c8cd,
              #77e6df
            );

          box-shadow:
            0 0 15px
            rgba(61, 218, 216, 0.4);
        }


        .visual-heading {
          margin: 30px 0 0;

          color: #70d6d5;

          font-size:
            clamp(1.55rem, 2.35vw, 2.7rem);

          line-height: 1.35;

          font-weight: 600;

          letter-spacing: 0.01em;
        }


        /* ==========================================================
           FINANCIAL CHART
        ========================================================== */

        .financial-chart {
          position: absolute;

          z-index: 2;

          left: 9%;
          right: 7%;
          bottom: 9%;

          height: 48%;

          overflow: hidden;
        }


        .chart-grid-lines {
          position: absolute;

          inset: 0;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          padding-bottom: 0;

          border-left:
            1px solid
            rgba(98, 140, 166, 0.16);
        }


        .chart-grid-lines span {
          width: 100%;

          border-top:
            1px dashed
            rgba(98, 140, 166, 0.12);
        }


        .chart-bars {
          position: absolute;

          z-index: 1;

          left: 6%;
          right: 5%;
          bottom: 0;

          height: 100%;

          display: flex;
          align-items: flex-end;

          gap:
            clamp(8px, 1.2vw, 20px);
        }


        .chart-bars span {
          flex: 1;

          min-height: 15px;

          border-radius:
            2px 2px 0 0;

          background:
            linear-gradient(
              to top,
              rgba(13, 100, 121, 0.08),
              rgba(29, 169, 176, 0.65)
            );

          box-shadow:
            0 0 18px
            rgba(32, 192, 194, 0.12);

          opacity: 0.75;
        }


        .growth-line {
          position: absolute;

          z-index: 2;

          inset: 0;

          width: 100%;
          height: 100%;

          overflow: visible;
        }


        /* ==========================================================
           RIGHT LOGIN SECTION
        ========================================================== */

        .finsight-login-form-section {
          position: relative;

          width: 100%;
          height: 100vh;
          min-height: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          padding:
            55px
            clamp(35px, 6vw, 90px)
            75px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #fbfbfc 50%,
              #f7f8fa 100%
            );
        }


        .login-form-container {
          width: 100%;
          max-width: 450px;
        }


        /* ==========================================================
           FJ GROUP LOGO
        ========================================================== */

        .fj-group-brand {
          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 15px;
        }


        .fj-group-logo-image {
          width: 320px;
          height: auto;

          display: block;

          object-fit: contain;
        }


        /* ==========================================================
           WELCOME
        ========================================================== */

        .welcome-heading {
          margin: 0 0 28px;

          text-align: center;

          color: #14223a;

          font-size:
            clamp(1.9rem, 2.5vw, 2.4rem);

          font-weight: 700;

          letter-spacing: -0.04em;

          line-height: 1.2;
        }


        /* ==========================================================
           FORM
        ========================================================== */

        .login-form {
          width: 100%;
        }


        .login-field-group {
          margin-bottom: 26px;
        }


        .login-field-group label {
          display: block;

          margin-bottom: 10px;

          color: #374151;

          font-size: 0.95rem;

          font-weight: 500;
        }


        .login-input-wrapper {
          position: relative;

          width: 100%;

          display: flex;
          align-items: center;
        }


        .login-input-icon {
          position: absolute;

          left: 20px;

          z-index: 2;

          color: #8b95a4;

          pointer-events: none;
        }


        .login-input-wrapper input {
          width: 100%;
          height: 64px;

          border:
            1px solid
            #d3d8df;

          border-radius: 14px;

          outline: none;

          padding:
            0
            58px;

          background: #ffffff;

          color: #263247;

          font-size: 1rem;

          font-family: inherit;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }


        .login-input-wrapper input::placeholder {
          color: #a8b0bb;
        }


        .login-input-wrapper input:hover {
          border-color: #bbc4cf;
        }


        .login-input-wrapper input:focus {
          border-color: #16808a;

          box-shadow:
            0 0 0 4px
            rgba(22, 128, 138, 0.1);
        }


        /* ==========================================================
           PASSWORD BUTTON
        ========================================================== */

        .password-visibility-button {
          position: absolute;

          right: 17px;

          z-index: 3;

          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          border: none;

          background: transparent;

          color: #8b95a4;

          cursor: pointer;

          border-radius: 8px;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .password-visibility-button:hover {
          color: #4b596c;

          background:
            rgba(16, 36, 61, 0.05);
        }


        /* ==========================================================
           FORGOT PASSWORD
        ========================================================== */

        .forgot-password-row {
          display: flex;

          justify-content: flex-end;

          margin-top: -5px;
          margin-bottom: 32px;
        }


        .forgot-password-row a {
          color: #3d566b;

          text-decoration: none;

          font-size: 0.92rem;

          font-weight: 500;
        }


        .forgot-password-row a:hover {
          color: #167b85;

          text-decoration: underline;
        }


        /* ==========================================================
           ERROR
        ========================================================== */

        .login-error-message {
          margin-bottom: 18px;

          padding: 13px 15px;

          border:
            1px solid
            #fecaca;

          border-radius: 10px;

          background: #fff5f5;

          color: #b42318;

          font-size: 0.88rem;

          line-height: 1.45;
        }


        /* ==========================================================
           LOGIN BUTTON
        ========================================================== */

        .secure-login-button {
          width: 100%;
          height: 64px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 12px;

          border: none;

          border-radius: 12px;

          background:
            linear-gradient(
              90deg,
              #147982,
              #0b7e8a
            );

          color: #ffffff;

          font-family: inherit;

          font-size: 1.12rem;

          font-weight: 600;

          letter-spacing: -0.01em;

          cursor: pointer;

          box-shadow:
            0 9px 24px
            rgba(14, 119, 130, 0.18);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }


        .secure-login-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 13px 30px
            rgba(14, 119, 130, 0.28);
        }


        .secure-login-button:active:not(:disabled) {
          transform: translateY(0);
        }


        .secure-login-button:disabled {
          opacity: 0.72;

          cursor: not-allowed;
        }


        .secure-login-button-ready {
          box-shadow:
            0 0 0 4px
            rgba(65, 203, 194, 0.14),
            0 12px 30px
            rgba(14, 119, 130, 0.25);
        }


        /* ==========================================================
           SPINNER
        ========================================================== */

        .login-spinner {
          width: 19px;
          height: 19px;

          border-radius: 50%;

          border:
            2px solid
            rgba(255, 255, 255, 0.35);

          border-top-color: #ffffff;

          animation:
            finsight-login-spin
            0.75s
            linear
            infinite;
        }


        @keyframes finsight-login-spin {

          to {
            transform: rotate(360deg);
          }

        }


        /* ==========================================================
           COPYRIGHT
        ========================================================== */

        .login-copyright {
          position: absolute;

          left: 0;
          right: 0;

          bottom: 18px;

          z-index: 5;

          padding: 0 20px;

          text-align: center;

          color:
            rgba(255, 255, 255, 0.55);

          font-size: 0.78rem;

          font-weight: 400;

          line-height: 1.4;

          letter-spacing: 0.01em;

          pointer-events: none;
        }


        /* ==========================================================
           RESPONSIVE - TABLET
        ========================================================== */

        @media (max-width: 960px) {

          html,
          body,
          #root {
            height: auto;
            min-height: 100%;
          }


          body {
            overflow-x: hidden;
            overflow-y: auto;
          }


          .finsight-login-page {
            grid-template-columns: 1fr;

            height: auto;
            min-height: 100vh;

            overflow: visible;
          }


          .finsight-login-visual {
            display: none;
          }


          .finsight-login-form-section {
            height: 100vh;
            min-height: 100vh;

            padding:
              60px
              28px
              100px;

            overflow-y: auto;
          }

        }


        /* ==========================================================
           RESPONSIVE - MOBILE
        ========================================================== */

        @media (max-width: 520px) {

          .finsight-login-form-section {
            padding:
              45px
              18px
              95px;
          }


          .fj-group-brand {
            margin-bottom: 40px;
          }


          .fj-logo-symbol {
            transform: scale(0.88);
          }


          .fj-brand-name {
            font-size: 1.6rem;
          }


          .welcome-heading {
            margin-bottom: 34px;

            font-size: 2.1rem;
          }


          .login-input-wrapper input {
            height: 60px;

            border-radius: 12px;
          }


          .secure-login-button {
            height: 60px;

            font-size: 1.03rem;
          }


          .login-copyright {
            bottom: 20px;

            font-size: 0.7rem;
          }

        }


        /* ==========================================================
           SHORT DESKTOP SCREENS
           
           Keeps the copyright safely inside the viewport when
           the browser window height is small.
        ========================================================== */

        @media (min-width: 961px) and (max-height: 750px) {

          .visual-content {
            padding-top: 55px;
          }


          .financial-chart {
            bottom: 7%;

            height: 43%;
          }


          .finsight-login-form-section {
            padding-top: 35px;
            padding-bottom: 55px;
          }


          .fj-group-logo-image {
            width: 280px;
          }


          .welcome-heading {
            margin-bottom: 20px;
          }


          .login-field-group {
            margin-bottom: 18px;
          }


          .forgot-password-row {
            margin-bottom: 22px;
          }


          .login-input-wrapper input {
            height: 58px;
          }


          .secure-login-button {
            height: 58px;
          }


          .login-copyright {
            bottom: 12px;

            font-size: 0.74rem;
          }

        }

      `}</style>

    </div>
  );
}