
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
     
     FUNCTIONALITY UNCHANGED
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
          LEFT SIDE
      ============================================================ */}

      <section className="finsight-login-visual">

        <div className="visual-overlay" />

        {/* BRAND + HEADING */}

        <div className="visual-content">

          <div className="finsight-brand">
            <img
              src="/images/FinSightLogo-Transparent.png"
              alt=""
              className="finsight-logo-image"
            />
          </div>

          <div className="finsight-accent-line" />

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

        {/* COPYRIGHT */}

        <div className="login-copyright">
          © 2026 ZeNith Data Intelligence LLC. All rights reserved.
        </div>

      </section>

      {/* ============================================================
          RIGHT SIDE - LOGIN
      ============================================================ */}

      <section className="finsight-login-form-section">

        <div className="login-form-container">

          {/* FJ GROUP LOGO */}

          <div className="fj-group-brand">
            <img
              src="/images/fj1.png.png"
              alt="FJ Group - MEP for a better living"
              className="fj-group-logo-image"
            />
          </div>

          {/* WELCOME */}

          <h2 className="welcome-heading">
            Welcome
          </h2>

          {/* LOGIN FORM */}

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

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
        }

        /* ==========================================================
           LOGIN PAGE
        ========================================================== */

        .finsight-login-page {
          width: 100%;
          min-height: 100vh;

          display: grid;

          /*
             Reference image:
             approximately 53% left / 47% right
          */
          grid-template-columns: 53.2% 46.8%;

          overflow: hidden;

          background: #ffffff;

          font-family:
            Inter,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        /* ==========================================================
           LEFT PANEL
        ========================================================== */

        .finsight-login-visual {
          position: relative;

          min-height: 100vh;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 72% 67%,
              rgba(15, 160, 171, 0.12),
              transparent 31%
            ),
            radial-gradient(
              circle at 8% 20%,
              rgba(21, 57, 94, 0.2),
              transparent 36%
            ),
            linear-gradient(
              135deg,
              #0c223b 0%,
              #091b31 54%,
              #061426 100%
            );
        }

        .visual-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(8, 20, 39, 0.02),
              rgba(3, 12, 26, 0.22)
            );

          pointer-events: none;
        }

        /* ==========================================================
   LEFT BRAND CONTENT
========================================================== */

.visual-content {
  position: relative;
  z-index: 10;

  width: 100%;

  padding:
    clamp(50px, 6vw, 80px)
    clamp(38px, 5vw, 78px);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  pointer-events: none;
}

/* ==========================================================
   FINSIGHT BRAND
========================================================== */

.finsight-brand {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  margin: 0;
  padding: 0;

  text-align: left;
}

/* ==========================================================
   FINSIGHT LOGO
========================================================== */
.finsight-logo-image {
  display: block;
  width: 380px;
  height: auto;
  max-width: 100%;
  margin: 0 0 0 -25px; /* move logo 20px left */
  padding: 0;
  object-fit: contain;
  object-position: left center;
  transform: translateY(0);
}


.finsight-accent-line {
  width: 72px;
  height: 4px;

  margin-top: 2px;     
  margin-bottom: 18px;

  align-self: flex-start;
  

  border-radius: 999px;

  background: linear-gradient(
    90deg,
    #35d7d8 0%,
    #67eeee 100%
  );

  box-shadow:
    0 0 8px rgba(53, 215, 216, 0.55),
    0 0 18px rgba(53, 215, 216, 0.25);
}

.visual-heading {
  position: relative;
  z-index: 20;

  display: block;

  width: 100%;
  max-width: 560px;

  margin: 0;
  padding: 0;

  align-self: flex-start;
 

  color: #70d9d9;

  font-size: clamp(1.65rem, 2.2vw, 2.55rem);
  line-height: 1.25;
  font-weight: 600;

  letter-spacing: 0.005em;
  text-align: left;

  white-space: normal;
  overflow: visible;

  text-shadow:
    0 0 18px rgba(67, 215, 216, 0.08);
}

        /* ==========================================================
           CHART
        ========================================================== */

        .financial-chart {
          position: absolute;

          z-index: 2;

          left: 8%;

          right: 7%;

          bottom: 9%;

          height: 46%;

          overflow: hidden;
        }

        .chart-grid-lines {
          position: absolute;

          inset: 0;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          border-left:
            1px solid
            rgba(98, 140, 166, 0.15);
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

          left: 5%;

          right: 4%;

          bottom: 0;

          height: 100%;

          display: flex;

          align-items: flex-end;

          gap:
            clamp(
              7px,
              1vw,
              17px
            );
        }

        .chart-bars span {
          flex: 1;

          min-height: 13px;

          border-radius:
            2px 2px 0 0;

          background:
            linear-gradient(
              to top,
              rgba(13, 100, 121, 0.08),
              rgba(29, 169, 176, 0.63)
            );

          box-shadow:
            0 0 18px
            rgba(32, 192, 194, 0.1);

          opacity: 0.74;
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
           COPYRIGHT
        ========================================================== */

        .login-copyright {
          position: absolute;

          left: 0;

          right: 0;

          bottom: 25px;

          z-index: 6;

          padding: 0 20px;

          text-align: center;

          color:
            rgba(
              255,
              255,
              255,
              0.55
            );

          font-size: 0.76rem;

          font-weight: 400;

          letter-spacing: 0.01em;
        }

        /* ==========================================================
           RIGHT LOGIN PANEL
        ========================================================== */

        .finsight-login-form-section {
          position: relative;

          min-height: 100vh;

          display: flex;

          align-items: center;

          justify-content: center;

          padding:
            45px
            clamp(
              35px,
              5.8vw,
              88px
            )
            70px;

          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #fdfdfd 52%,
              #f8f9fa 100%
            );
        }

        /* ==========================================================
           FORM CONTAINER
        ========================================================== */

        .login-form-container {
          width: 100%;

          max-width: 465px;

          margin: 0 auto;
        }

        /* ==========================================================
           FJ GROUP LOGO
        ========================================================== */

        .fj-group-brand {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 12px;
        }

        .fj-group-logo-image {
          width: min(
            315px,
            76%
          );

          height: auto;

          display: block;

          object-fit: contain;
        }

        /* ==========================================================
           WELCOME
        ========================================================== */

        .welcome-heading {
          margin:
            0
            0
            30px;

          text-align: center;

          color: #14243d;

          font-size:
            clamp(
              1.9rem,
              2.45vw,
              2.35rem
            );

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
          margin-bottom: 25px;
        }

        .login-field-group label {
          display: block;

          margin-bottom: 9px;

          color: #344054;

          font-size: 0.92rem;

          font-weight: 500;
        }

        /* ==========================================================
           INPUT
        ========================================================== */

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

          color: #8995a5;

          pointer-events: none;
        }

        .login-input-wrapper input {
          width: 100%;

          height: 64px;

          border:
            1px solid
            #d4dce7;

          border-radius: 13px;

          outline: none;

          padding:
            0
            58px;

          /*
             Reference has a subtle light blue input.
          */
          background:
            #eef5ff;

          color: #263247;

          font-size: 0.96rem;

          font-family: inherit;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .login-input-wrapper input::placeholder {
          color: #a5afbd;
        }

        .login-input-wrapper input:hover {
          border-color: #bdc8d5;

          background:
            #edf4fd;
        }

        .login-input-wrapper input:focus {
          border-color: #238b95;

          background: #ffffff;

          box-shadow:
            0 0 0 3px
            rgba(
              35,
              139,
              149,
              0.09
            );
        }

        /* ==========================================================
           PASSWORD VISIBILITY
        ========================================================== */

        .password-visibility-button {
          position: absolute;

          right: 15px;

          z-index: 3;

          width: 38px;

          height: 38px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          background: transparent;

          color: #8793a3;

          cursor: pointer;

          border-radius: 8px;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .password-visibility-button:hover {
          color: #4b596c;

          background:
            rgba(
              16,
              36,
              61,
              0.05
            );
        }

        /* ==========================================================
           FORGOT PASSWORD
        ========================================================== */

        .forgot-password-row {
          display: flex;

          justify-content: flex-end;

          margin-top: -4px;

          margin-bottom: 31px;
        }

        .forgot-password-row a {
          color: #496278;

          text-decoration: none;

          font-size: 0.86rem;

          font-weight: 500;

          transition:
            color 0.2s ease;
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

          padding:
            12px
            14px;

          border:
            1px solid
            #fecaca;

          border-radius: 10px;

          background: #fff5f5;

          color: #b42318;

          font-size: 0.86rem;

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

          gap: 11px;

          border: none;

          border-radius: 12px;

          background:
            linear-gradient(
              90deg,
              #15858d 0%,
              #0c8992 100%
            );

          color: #ffffff;

          font-family: inherit;

          font-size: 1.05rem;

          font-weight: 600;

          letter-spacing: -0.01em;

          cursor: pointer;

          box-shadow:
            0 9px 23px
            rgba(
              14,
              119,
              130,
              0.2
            );

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .secure-login-button:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 13px 28px
            rgba(
              14,
              119,
              130,
              0.27
            );
        }

        .secure-login-button:active:not(:disabled) {
          transform:
            translateY(0);
        }

        .secure-login-button:disabled {
          opacity: 0.72;

          cursor: not-allowed;
        }

        .secure-login-button-ready {
          box-shadow:
            0 0 0 4px
            rgba(
              65,
              203,
              194,
              0.14
            ),
            0 12px 30px
            rgba(
              14,
              119,
              130,
              0.25
            );
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
            rgba(
              255,
              255,
              255,
              0.35
            );

          border-top-color:
            #ffffff;

          animation:
            finsight-login-spin
            0.75s
            linear
            infinite;
        }

        @keyframes finsight-login-spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* ==========================================================
           TABLET
        ========================================================== */

        @media (max-width: 1100px) {

          .finsight-login-page {
            grid-template-columns:
              51%
              49%;
          }

          .visual-content {
            padding:
              55px
              50px;
          }

          .finsight-logo-image {  
         width: 450px;
         height: 105px;
       }
          

          .visual-heading {
            font-size: 2rem;
          }

          .finsight-login-form-section {
            padding:
              40px
              45px
              70px;
          }

          .login-form-container {
            max-width: 420px;
          }

        }

        /* ==========================================================
           MOBILE / SMALL TABLET
        ========================================================== */

        @media (max-width: 960px) {

          .finsight-login-page {
            display: block;

            min-height: 100vh;

            overflow-y: auto;
          }

          .finsight-login-visual {
            display: none;
          }

          .finsight-login-form-section {
            min-height: 100vh;

            padding:
              55px
              28px
              70px;
          }

          .login-form-container {
            max-width: 450px;
          }

        }

        /* ==========================================================
           MOBILE
        ========================================================== */

        @media (max-width: 520px) {

          .finsight-login-form-section {
            padding:
              42px
              18px
              55px;
          }

          .fj-group-brand {
            margin-bottom: 15px;
          }

          .fj-group-logo-image {
            width: 270px;
            max-width: 82%;
          }

          .welcome-heading {
            margin-bottom: 30px;

            font-size: 2rem;
          }

          .login-field-group {
            margin-bottom: 22px;
          }

          .login-input-wrapper input {
            height: 60px;

            border-radius: 12px;
          }

          .secure-login-button {
            height: 60px;

            font-size: 1rem;
          }

        }

      `}</style>

    </div>
  );
}