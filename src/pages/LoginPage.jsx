

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  BarChart2,
  Target,
  Users,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  loginWithBackend,
} from '../services/authApi';

/* ═══════════════════════════════════════════════════════════════════
   SERVER STATUS PILL
═══════════════════════════════════════════════════════════════════ */

function ServerPill({ status }) {
  const cfg = {
    checking: {
      dot: '#818cf8',
      label: 'Connecting to server…',
      pulse: true,
    },
    online: {
      dot: '#34d399',
      label: 'Live server · Authenticated connection',
      pulse: false,
    },
    offline: {
      dot: '#64748b',
      label: 'Authentication server unavailable',
      pulse: false,
    },
  }[status] || {
    dot: '#64748b',
    label: '',
    pulse: false,
  };

  if (status === 'idle') return null;

  return (
    <div className="lp-server-pill">
      <span
        className="lp-pill-dot"
        style={{
          background: cfg.dot,
          animation: cfg.pulse
            ? 'lp-ping-indigo 1.3s ease-out infinite'
            : 'none',
        }}
      />

      <span className="lp-pill-label">
        {cfg.label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING LABEL INPUT
═══════════════════════════════════════════════════════════════════ */

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  children,
}) {
  const [focused, setFocused] = useState(false);

  const lifted = focused || value.length > 0;

  return (
    <div className="lp-fl-group">
      <div
        className="lp-fl-wrap"
        data-focused={String(focused)}
      >
        <input
          id={id}
          type={type}
          className="lp-fl-input"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          required={required}
          placeholder=" "
          style={
            type === 'password'
              ? { paddingRight: 48 }
              : undefined
          }
        />

        <label
          htmlFor={id}
          className={`lp-fl-label${lifted ? ' lp-fl-label--up' : ''
            }`}
        >
          {label}
        </label>

        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SPARKLINE
═══════════════════════════════════════════════════════════════════ */

function Sparkline({
  path,
  color,
  fill = true,
  height = 44,
}) {
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      viewBox="0 0 100 44"
      preserveAspectRatio="none"
      style={{
        width: '100%',
        height,
      }}
    >
      {fill && (
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
      )}

      {fill && (
        <path
          d={`${path} L100,44 L0,44 Z`}
          fill={`url(#${gradId})`}
        />
      )}

      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RING PROGRESS
═══════════════════════════════════════════════════════════════════ */

function RingProgress({
  pct,
  color,
  size = 60,
}) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct / 100);

  return (
    <svg
      width={size}
      height={size}
      style={{
        transform: 'rotate(-90deg)',
        flexShrink: 0,
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="5"
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="round"
        style={{
          transition:
            'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)',
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD PREVIEW — RIGHT PANEL
═══════════════════════════════════════════════════════════════════ */

function DashboardPreview() {
  const EXEC_CAPS = [
    {
      Icon: Globe,
      label: 'Real-Time Enterprise Analytics',
      sub: '14 Consolidated Entities',
    },
    {
      Icon: LayoutDashboard,
      label: 'Executive Financial Intelligence',
      sub: 'Board & CFO Reporting',
    },
  ];

  return (
    <div className="lp-dash">

      {/* Header */}
      <div className="lp-dash-hd">
        <div className="lp-dash-live">
          <span className="lp-live-dot" />
          Secure Financial Command Center
        </div>

        <h2 className="lp-dash-title">
          Executive Intelligence
          <br />
          at Your Command
        </h2>

        <p className="lp-dash-sub">
          Board-grade reporting, CFO dashboards, and real-time
          analytics
          <br />
          across 14 consolidated entities — all in one secure
          platform.
        </p>
      </div>

      {/* Metric grid */}
      <div className="lp-metric-grid">

        {/* Revenue */}
        <div
          className="lp-mc"
          style={{
            '--mc-accent': '#34d399',
            animationDelay: '0.25s',
          }}
        >
          <div className="lp-mc-top">
            <div className="lp-mc-label">
              <TrendingUp size={11} />
              Revenue Growth
            </div>

            <div className="lp-mc-badge lp-badge-up">
              +18.3%
            </div>
          </div>

          <div className="lp-mc-val">
            $4.28<sup>B</sup>
          </div>

          <div className="lp-mc-sub">
            vs $3.62B prior fiscal year
          </div>

          <div className="lp-mc-chart">
            <Sparkline
              color="#34d399"
              path="M0,38 C8,33 14,36 22,28 C30,20 36,26 46,18 C56,10 62,16 72,9 C82,3 88,6 100,2"
            />
          </div>
        </div>

        {/* Cash */}
        <div
          className="lp-mc"
          style={{
            '--mc-accent': '#22d3ee',
            animationDelay: '0.35s',
          }}
        >
          <div className="lp-mc-top">
            <div className="lp-mc-label">
              <DollarSign size={11} />
              Cash Position
            </div>

            <div className="lp-mc-badge lp-badge-up">
              +4.1%
            </div>
          </div>

          <div className="lp-mc-val">
            $892<sup>M</sup>
          </div>

          <div className="lp-mc-sub">
            Strong liquidity · MoM growth
          </div>

          <div className="lp-mc-chart">
            <Sparkline
              color="#22d3ee"
              path="M0,28 C10,24 16,30 26,22 C36,15 42,24 54,18 C64,12 70,20 82,13 C90,8 95,11 100,9"
            />
          </div>
        </div>

        {/* Forecast */}
        <div
          className="lp-mc"
          style={{
            '--mc-accent': '#a78bfa',
            animationDelay: '0.45s',
          }}
        >
          <div className="lp-mc-top">
            <div className="lp-mc-label">
              <Target size={11} />
              Forecast Accuracy
            </div>

            <div className="lp-mc-badge lp-badge-up">
              +2.1 pts
            </div>
          </div>

          <div className="lp-mc-forecast-row">
            <div>
              <div className="lp-mc-val">
                94.7<sup>%</sup>
              </div>

              <div className="lp-mc-sub">
                Predictive model · Q4 FY26
              </div>
            </div>

            <RingProgress
              pct={94.7}
              color="#a78bfa"
              size={58}
            />
          </div>
        </div>

        {/* Margin */}
        <div
          className="lp-mc"
          style={{
            '--mc-accent': '#fbbf24',
            animationDelay: '0.55s',
          }}
        >
          <div className="lp-mc-top">
            <div className="lp-mc-label">
              <BarChart2 size={11} />
              Net Margin
            </div>

            <div className="lp-mc-badge lp-badge-up">
              +1.8 pts
            </div>
          </div>

          <div className="lp-mc-val">
            23.4<sup>%</sup>
          </div>

          <div className="lp-mc-sub">
            Above industry benchmark
          </div>

          <div className="lp-mc-bars">
            {[55, 63, 58, 70, 68, 76, 74, 82, 79, 88].map(
              (h, i) => (
                <div
                  key={i}
                  className="lp-bar"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 9
                        ? '#fbbf24'
                        : 'rgba(251,191,36,0.22)',
                    animationDelay: `${0.6 + i * 0.05}s`,
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div
        className="lp-wide-chart"
        style={{ animationDelay: '0.65s' }}
      >
        <div className="lp-wc-hd">
          <div>
            <div className="lp-wc-title">
              12-Month Consolidated Revenue Trend
            </div>

            <div className="lp-wc-sub">
              FJ Group · All 14 entities · AED millions · Board view
            </div>
          </div>

          <div className="lp-wc-pill">
            FY 2025–26
          </div>
        </div>

        <svg
          viewBox="0 0 320 96"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: 96,
            display: 'block',
            marginBottom: 2,
          }}
        >
          <defs>
            <linearGradient
              id="wc-area"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#6366f1"
                stopOpacity="0.35"
              />

              <stop
                offset="75%"
                stopColor="#6366f1"
                stopOpacity="0.08"
              />

              <stop
                offset="100%"
                stopColor="#6366f1"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id="wc-line"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#818cf8"
              />

              <stop
                offset="100%"
                stopColor="#6366f1"
              />
            </linearGradient>
          </defs>

          {[24, 48, 72].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="320"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
          ))}

          <text
            x="316"
            y="20"
            textAnchor="end"
            fill="rgba(148,163,184,0.35)"
            fontSize="7"
            fontFamily="Inter,sans-serif"
          >
            High
          </text>

          <text
            x="316"
            y="68"
            textAnchor="end"
            fill="rgba(148,163,184,0.35)"
            fontSize="7"
            fontFamily="Inter,sans-serif"
          >
            Base
          </text>

          <path
            d="M0,82 C22,76 28,70 50,60 C72,50 76,64 100,51 C124,38 128,55 154,41 C180,27 184,46 210,30 C236,14 240,34 264,19 C286,6 298,16 320,3 L320,96 L0,96 Z"
            fill="url(#wc-area)"
          />

          <path
            d="M0,82 C22,76 28,70 50,60 C72,50 76,64 100,51 C124,38 128,55 154,41 C180,27 184,46 210,30 C236,14 240,34 264,19 C286,6 298,16 320,3"
            fill="none"
            stroke="url(#wc-line)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {[80, 160, 240].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="96"
              stroke="rgba(255,255,255,0.045)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}

          {[
            [80, 51],
            [160, 41],
            [240, 19],
            [320, 3],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill="#6366f1"
                style={{
                  filter:
                    'drop-shadow(0 0 4px rgba(99,102,241,0.7))',
                }}
              />

              <circle
                cx={x}
                cy={y}
                r="7"
                fill="rgba(99,102,241,0.15)"
              />
            </g>
          ))}
        </svg>

        <div className="lp-wc-months">
          {[
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
          ].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        <div className="lp-wc-quarters">
          {[
            'Q1 FY26',
            'Q2 FY26',
            'Q3 FY26',
            'Q4 FY26',
          ].map((q) => (
            <span
              key={q}
              className="lp-wc-q"
            >
              {q}
            </span>
          ))}
        </div>
      </div>

      {/* Executive capabilities */}
      <div
        className="lp-exec-caps"
        style={{ animationDelay: '0.78s' }}
      >
        {EXEC_CAPS.map(
          ({ Icon, label, sub }) => (
            <div
              key={label}
              className="lp-exec-cap"
            >
              <div className="lp-exec-cap-icon">
                <Icon size={16} />
              </div>

              <div>
                <div className="lp-exec-cap-label">
                  {label}
                </div>

                <div className="lp-exec-cap-sub">
                  {sub}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
═══════════════════════════════════════════════════════════════════ */

export default function LoginPage() {
  const {
    user,
    loginWithBackend,
    auditLog,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from?.pathname || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [backendStatus, setBackendStatus] =
    useState('idle');

  /* ═══════════════════════════════════════════════════════════════
     REDIRECT ALREADY AUTHENTICATED USER
  ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    if (!user) return;

    /*
     * ADMIN is redirected to Payables after successful backend
     * authentication.
     *
     * Do not redirect ADMIN here because the login flow handles it.
     */
    if (user.role_code === 'ADMIN') {
      return;
    }

    navigate(
      from ||
      user.defaultPage ||
      '/dashboard',
      {
        replace: true,
      }
    );
  }, [
    user,
    navigate,
    from,
  ]);

  /* ═══════════════════════════════════════════════════════════════
     READY BUTTON ANIMATION
  ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(
      () => setReady(false),
      3200
    );

    return () => clearTimeout(timer);
  }, [ready]);

  /* ═══════════════════════════════════════════════════════════════
     LOGIN
  ═══════════════════════════════════════════════════════════════ */

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);
    setBackendStatus('checking');
    setReady(false);

    try {
      const session = await loginWithBackend(
        email.trim(),
        password
      );

      setBackendStatus('online');

      const roleCode =
        session?.role_code ||
        session?.user?.role_code;

      if (roleCode === 'ADMIN') {
        const payablesOrigin =
          import.meta.env.VITE_PAYABLES_ORIGIN;

        let payablesWindow = null;

        const handlePayablesReady = (event) => {
          if (event.origin !== payablesOrigin) {
            return;
          }

          if (event.data?.type !== 'PAYABLES_READY') {
            return;
          }

          console.log(
            'Payables is ready. Sending authentication token.'
          );

          if (payablesWindow && !payablesWindow.closed) {
            payablesWindow.postMessage(
              {
                type: 'FINSIGHT_AUTH',
                token: session.access_token,
              },
              payablesOrigin
            );
          }

          window.removeEventListener(
            'message',
            handlePayablesReady
          );
        };

        window.addEventListener(
          'message',
          handlePayablesReady
        );

        payablesWindow = window.open(
          payablesOrigin,
          '_blank'
        );

        if (!payablesWindow) {
          window.removeEventListener(
            'message',
            handlePayablesReady
          );

          setError(
            'Payables window was blocked. Please allow pop-ups.'
          );

          return;
        }

        navigate(
          from || '/dashboard',
          { replace: true }
        );

        return;
      }
    
      navigate(
      from ||
      session?.defaultPage ||
      '/dashboard',
      { replace: true }
    );

  } catch (backendErr) {
    const isAuthFailure =
      backendErr?.isAuthError ||
      backendErr?.status === 401 ||
      backendErr?.status === 403 ||
      backendErr?.status === 422;

    if (isAuthFailure) {
      setBackendStatus('online');
      setError(
        backendErr.message ||
        'Invalid email or password'
      );
    } else {
      setBackendStatus('offline');
      setError(
        backendErr.message ||
        'Unable to connect to the authentication server.'
      );
    }
  } finally {
    setLoading(false);
  }
}
/* ═══════════════════════════════════════════════════════════════
   TRUST ITEMS
═══════════════════════════════════════════════════════════════ */

const TRUST_ITEMS = [
  {
    Icon: Lock,
    label: 'Enterprise Encryption',
  },
  {
    Icon: Users,
    label: 'Role-Based Access',
  },
  {
    Icon: Shield,
    label: 'Secure Auth',
  },
  {
    Icon: BarChart2,
    label: 'Real-Time Monitor',
  },
];

/* ═══════════════════════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════════════════════ */

return (
  <div className="lp-root">

    {/* Ambient orbs */}
    <div className="lp-orb lp-orb-1" />
    <div className="lp-orb lp-orb-2" />
    <div className="lp-orb lp-orb-3" />

    <div className="lp-grid">

      {/* ══════════════════════════════════════════════════════
            LEFT — LOGIN PANEL
        ══════════════════════════════════════════════════════ */}

      <div className="lp-left">

        {/* Brand */}
        <div className="lp-brand">
          <div className="lp-brand-mark">
            FS
          </div>

          <div className="lp-brand-text">
            <div className="lp-brand-name">
              Finsight
            </div>

            <div className="lp-brand-tag">
              FJ Group · Financial Intelligence Platform
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="lp-card">
          <div className="lp-card-body">

            <div className="lp-heading">
              Welcome Back
            </div>

            <p className="lp-sub-text">
              Access strategic insights, executive dashboards,
              and real-time financial intelligence.
            </p>

            <ServerPill
              status={backendStatus}
            />

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <FloatingInput
                id="login-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoComplete="username"
                required
              />

              {/* Password */}
              <FloatingInput
                id="login-password"
                label="Password"
                type={
                  showPwd
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoComplete="current-password"
                required
              >
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() =>
                    setShowPwd(
                      (value) => !value
                    )
                  }
                  aria-label="Toggle password visibility"
                  style={{
                    opacity:
                      password.length > 0
                        ? 1
                        : 0.38,
                  }}
                >
                  {showPwd ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </FloatingInput>

              {/* Forgot password */}
              <div className="lp-forgot-row">
                <Link
                  to="/forgot-password"
                  id="forgot-password-link"
                  className="lp-forgot-link"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div className="lp-error">
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                id="login-submit-btn"
                type="submit"
                className={`lp-cta-btn${ready
                  ? ' lp-cta-btn--ready'
                  : ''
                  }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="lp-loading-row">
                    <span className="lp-spinner" />
                    Authenticating…
                  </span>
                ) : (
                  <>
                    <Lock size={15} />
                    Access Platform →
                  </>
                )}
              </button>

            </form>

            {/* Trust strip */}
            <div className="lp-trust-strip">
              {TRUST_ITEMS.map(
                ({ Icon, label }) => (
                  <div
                    key={label}
                    className="lp-trust-item"
                  >
                    <Icon size={10} />
                    <span>{label}</span>
                  </div>
                )
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="lp-footer">
          <Shield size={10} />
          Protected by enterprise-grade encryption ·
          FJ Group Confidential
        </p>

      </div>

      {/* ══════════════════════════════════════════════════════
            RIGHT — DASHBOARD PREVIEW
        ══════════════════════════════════════════════════════ */}

      <div className="lp-right">
        <DashboardPreview />
      </div>

    </div>

    {/* ════════════════════════════════════════════════════════
          SCOPED STYLES
      ════════════════════════════════════════════════════════ */}

    <style>{`

        /* ── Root & Background ─────────────────────────────────── */

        .lp-root {
          min-height: 100vh;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          background:
            radial-gradient(
              ellipse at 12% 42%,
              rgba(99,102,241,0.11) 0%,
              transparent 52%
            ),
            radial-gradient(
              ellipse at 88% 15%,
              rgba(6,182,212,0.07) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse at 62% 88%,
              rgba(79,70,229,0.08) 0%,
              transparent 50%
            ),
            linear-gradient(
              158deg,
              #070f1e 0%,
              #0c1526 40%,
              #081220 100%
            );

          display: flex;
          align-items: stretch;
          position: relative;
          overflow: hidden;
        }

        /* Ambient orbs */

        .lp-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(90px);
        }

        .lp-orb-1 {
          width: 520px;
          height: 520px;
          background: rgba(99,102,241,0.09);
          top: -160px;
          left: -120px;
          animation: lp-drift 9s ease-in-out infinite;
        }

        .lp-orb-2 {
          width: 420px;
          height: 420px;
          background: rgba(6,182,212,0.06);
          bottom: -80px;
          right: -80px;
          animation: lp-drift 11s ease-in-out infinite 3.5s;
        }

        .lp-orb-3 {
          width: 280px;
          height: 280px;
          background: rgba(139,92,246,0.07);
          top: 45%;
          right: 28%;
          animation: lp-drift 13s ease-in-out infinite 6s;
        }

        /* ── Split grid ────────────────────────────────────────── */

        .lp-grid {
          display: grid;
          grid-template-columns: 492px 1fr;
          width: 100%;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        /* ── Left panel ────────────────────────────────────────── */

        .lp-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 0 40px;
          border-right: 1px solid rgba(255,255,255,0.05);
          background: rgba(7,15,30,0.55);
          backdrop-filter: blur(4px);
          overflow-y: auto;
          max-height: 100vh;
        }

        .lp-left::before,
        .lp-left::after {
          content: '';
          flex: 1 1 0;
          min-height: 20px;
          max-height: 40px;
        }

        /* Brand */

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: lp-fadeUp 0.45s ease-out both;
        }

        .lp-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #6366f1 0%,
            #4338ca 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.88rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.5px;
          box-shadow:
            0 4px 18px rgba(99,102,241,0.45),
            0 1px 0 rgba(255,255,255,0.15) inset;
          flex-shrink: 0;
        }

        .lp-brand-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .lp-brand-name {
          font-size: 1.2rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(
            130deg,
            #e2e8f0 30%,
            #a5b4fc 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-brand-tag {
          font-size: 0.62rem;
          color: rgba(148,163,184,0.6);
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        /* ── Login Card ────────────────────────────────────────── */

        .lp-card {
          background: rgba(255,255,255,0.032);
          border: 1px solid rgba(255,255,255,0.075);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.06) inset,
            0 28px 72px rgba(0,0,0,0.52),
            0 1px 0 rgba(255,255,255,0.07) inset;
          overflow: hidden;
          animation: lp-fadeUp 0.55s ease-out 0.08s both;
        }

        .lp-card-body {
          padding: 28px 30px 20px;
        }

        /* Typography */

        .lp-heading {
          font-size: 1.75rem;
          font-weight: 800;
          color: #f0f4ff;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 10px;
        }

        .lp-sub-text {
          font-size: 0.8rem;
          color: rgba(148,163,184,0.8);
          line-height: 1.68;
          margin-bottom: 24px;
          max-width: 340px;
        }

        /* Server pill */

        .lp-server-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 20px;
        }

        .lp-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .lp-pill-label {
          font-size: 0.69rem;
          color: rgba(148,163,184,0.65);
          font-weight: 500;
        }

        /* Floating inputs */

        .lp-fl-group {
          margin-bottom: 14px;
        }

        .lp-fl-wrap {
          position: relative;
          border-radius: 12px;
        }

        .lp-fl-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.038);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          color: #f0f4ff;
          font-family: inherit;
          font-size: 0.93rem;
          line-height: 1.4;
          padding: 27px 14px 10px 16px;
          height: 64px;
          outline: none;
          transition:
            border-color 0.2s ease-out,
            box-shadow 0.2s ease-out,
            background 0.2s ease-out;
          caret-color: #818cf8;
        }

        .lp-fl-input:focus {
          background: rgba(99,102,241,0.055);
          border-color: rgba(99,102,241,0.65);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.13);
        }

        .lp-fl-input::placeholder {
          color: transparent;
        }

        .lp-fl-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.78rem;
          line-height: 1;
          font-weight: 600;
          color: rgba(148,163,184,0.65);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          pointer-events: none;
          transition:
            top 0.22s ease-out,
            transform 0.22s ease-out,
            color 0.22s ease-out;
          transform-origin: left center;
          white-space: nowrap;
        }

        .lp-fl-label--up {
          top: 10px;
          transform: translateY(0) scale(0.8);
          color: #818cf8;
        }

        .lp-fl-wrap[data-focused="true"] .lp-fl-label {
          top: 10px;
          transform: translateY(0) scale(0.8);
          color: #818cf8;
        }

        /* Eye */

        .lp-eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(148,163,184,0.55);
          display: flex;
          align-items: center;
          transition:
            opacity 0.22s ease,
            color 0.18s ease;
          padding: 4px;
          border-radius: 6px;
        }

        .lp-eye-btn:hover {
          color: #a5b4fc;
        }

        /* Forgot */

        .lp-forgot-row {
          text-align: right;
          margin: -2px 0 18px;
        }

        .lp-forgot-link {
          font-size: 0.77rem;
          font-weight: 600;
          color: #818cf8;
          text-decoration: none;
          transition: color 0.15s;
        }

        .lp-forgot-link:hover {
          color: #c7d2fe;
        }

        /* Error */

        .lp-error {
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fca5a5;
          font-size: 0.8rem;
          margin-bottom: 14px;
        }

        /* CTA */

        .lp-cta-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 15px 20px;
          background: linear-gradient(
            135deg,
            #6366f1 0%,
            #4338ca 100%
          );
          border: none;
          border-radius: 12px;
          cursor: pointer;
          color: #fff;
          font-family: inherit;
          font-size: 0.93rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          box-shadow:
            0 4px 20px rgba(99,102,241,0.38),
            0 1px 0 rgba(255,255,255,0.14) inset;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            filter 0.15s ease;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }

        .lp-cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.13) 0%,
            transparent 60%
          );
          border-radius: inherit;
          pointer-events: none;
        }

        .lp-cta-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow:
            0 8px 28px rgba(99,102,241,0.5),
            0 1px 0 rgba(255,255,255,0.18) inset;
        }

        .lp-cta-btn:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow:
            0 2px 10px rgba(99,102,241,0.3);
        }

        .lp-cta-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .lp-cta-btn--ready {
          animation:
            lp-pulse-cta 1.6s ease-in-out infinite;
        }

        .lp-loading-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .lp-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(255,255,255,0.28);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin 0.72s linear infinite;
          will-change: transform;
        }

        /* Trust */

        .lp-trust-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          justify-content: center;
        }

        .lp-trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.63rem;
          font-weight: 600;
          color: rgba(100,116,139,0.75);
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 20px;
          padding: 4px 10px;
          letter-spacing: 0.02em;
          transition:
            color 0.2s,
            border-color 0.2s;
        }

        .lp-trust-item:hover {
          color: rgba(165,180,252,0.85);
          border-color: rgba(99,102,241,0.22);
        }

        /* Footer */

        .lp-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.64rem;
          color: rgba(71,85,105,0.6);
          line-height: 1.5;
        }

        /* ── Right panel ───────────────────────────────────────── */

        .lp-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          background: rgba(5,12,24,0.45);
          position: relative;
          overflow: hidden;
        }

        .lp-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              ellipse at 28% 28%,
              rgba(99,102,241,0.09) 0%,
              transparent 58%
            ),
            radial-gradient(
              ellipse at 72% 72%,
              rgba(6,182,212,0.06) 0%,
              transparent 58%
            );
          pointer-events: none;
        }

        .lp-dash {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          z-index: 1;
          animation:
            lp-fadeUp 0.65s ease-out 0.18s both;
        }

        .lp-dash-hd {
          margin-bottom: 2px;
        }

        .lp-dash-live {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.64rem;
          font-weight: 700;
          color: rgba(52,211,153,0.9);
          text-transform: uppercase;
          letter-spacing: 0.11em;
          margin-bottom: 10px;
        }

        .lp-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          display: inline-block;
          flex-shrink: 0;
          animation:
            lp-ping-green 2s ease-out infinite;
        }

        .lp-dash-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #f0f4ff;
          letter-spacing: -0.028em;
          line-height: 1.18;
          margin-bottom: 10px;
        }

        .lp-dash-sub {
          font-size: 0.77rem;
          color: rgba(148,163,184,0.62);
          line-height: 1.65;
        }

        .lp-metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .lp-mc {
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.065);
          border-top: 2px solid var(--mc-accent, #6366f1);
          border-radius: 14px;
          padding: 15px 15px 12px;
          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease;
          animation:
            lp-fadeUp 0.55s ease-out both;
        }

        .lp-mc:hover {
          transform: translateY(-3px);
          border-color: var(--mc-accent, #6366f1);
          box-shadow:
            0 8px 24px rgba(0,0,0,0.3),
            0 0 0 1px rgba(255,255,255,0.05) inset;
        }

        .lp-mc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }

        .lp-mc-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.63rem;
          font-weight: 700;
          color: rgba(148,163,184,0.6);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .lp-mc-badge {
          font-size: 0.62rem;
          font-weight: 700;
          border-radius: 20px;
          padding: 2px 7px;
          letter-spacing: 0.02em;
        }

        .lp-badge-up {
          background: rgba(52,211,153,0.14);
          color: #34d399;
          border: 1px solid rgba(52,211,153,0.22);
        }

        .lp-mc-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: #f0f4ff;
          letter-spacing: -0.025em;
          line-height: 1.05;
          margin-bottom: 4px;
        }

        .lp-mc-val sup {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(240,244,255,0.55);
          vertical-align: super;
          margin-left: 1px;
        }

        .lp-mc-sub {
          font-size: 0.63rem;
          color: rgba(100,116,139,0.7);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .lp-mc-chart {
          margin-top: 4px;
        }

        .lp-mc-forecast-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .lp-mc-bars {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 38px;
          margin-top: 10px;
        }

        .lp-bar {
          flex: 1;
          border-radius: 3px 3px 0 0;
          animation:
            lp-bar-up 0.65s ease-out both;
          transform-origin: bottom;
        }

        /* Wide chart */

        .lp-wide-chart {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 16px 14px;
          animation:
            lp-fadeUp 0.6s ease-out both;
        }

        .lp-wc-hd {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .lp-wc-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(226,232,240,0.9);
          margin-bottom: 4px;
        }

        .lp-wc-sub {
          font-size: 0.61rem;
          color: rgba(100,116,139,0.55);
        }

        .lp-wc-pill {
          font-size: 0.6rem;
          font-weight: 700;
          color: rgba(99,102,241,0.9);
          background: rgba(99,102,241,0.10);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 20px;
          padding: 3px 10px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .lp-wc-months {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          padding: 0 2px;
        }

        .lp-wc-months span {
          font-size: 0.55rem;
          color: rgba(71,85,105,0.5);
          font-weight: 500;
        }

        .lp-wc-quarters {
          display: flex;
          justify-content: space-around;
          margin-top: 5px;
          padding: 0 2px;
        }

        .lp-wc-q {
          font-size: 0.55rem;
          font-weight: 700;
          color: rgba(99,102,241,0.45);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Executive cards */

        .lp-exec-caps {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          animation:
            lp-fadeUp 0.6s ease-out both;
        }

        .lp-exec-cap {
          display: flex;
          align-items: center;
          gap: 11px;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 13px 14px;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .lp-exec-cap:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(99,102,241,0.22);
          transform: translateY(-2px);
        }

        .lp-exec-cap-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.12);
          color: #818cf8;
          flex-shrink: 0;
          border: 1px solid rgba(99,102,241,0.18);
        }

        .lp-exec-cap-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(226,232,240,0.85);
          line-height: 1.3;
          margin-bottom: 3px;
        }

        .lp-exec-cap-sub {
          font-size: 0.62rem;
          color: rgba(100,116,139,0.65);
          font-weight: 500;
        }

        /* Keyframes */

        @keyframes lp-fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lp-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes lp-drift {
          0%, 100% {
            transform: translate(0,0) scale(1);
          }

          33% {
            transform: translate(18px,-14px) scale(1.04);
          }

          66% {
            transform: translate(-10px,16px) scale(0.97);
          }
        }

        @keyframes lp-ping-indigo {
          0% {
            box-shadow:
              0 0 0 0 rgba(99,102,241,0.75);
          }

          70% {
            box-shadow:
              0 0 0 6px rgba(99,102,241,0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(99,102,241,0);
          }
        }

        @keyframes lp-ping-green {
          0% {
            box-shadow:
              0 0 0 0 rgba(52,211,153,0.75);
          }

          70% {
            box-shadow:
              0 0 0 6px rgba(52,211,153,0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(52,211,153,0);
          }
        }

        @keyframes lp-pulse-cta {
          0%, 100% {
            box-shadow:
              0 4px 20px rgba(99,102,241,0.38);
          }

          50% {
            box-shadow:
              0 4px 32px rgba(99,102,241,0.7);
          }
        }

        @keyframes lp-bar-up {
          from {
            transform: scaleY(0);
          }

          to {
            transform: scaleY(1);
          }
        }

        /* Responsive */

        @media (max-width: 960px) {
          .lp-grid {
            grid-template-columns: 1fr;
          }

          .lp-right {
            display: none;
          }

          .lp-left {
            max-height: none;
            padding: 0 22px;
          }

          .lp-left::before,
          .lp-left::after {
            min-height: 24px;
            max-height: 36px;
          }

          .lp-card-body {
            padding: 24px 22px 18px;
          }
        }

        @media (max-width: 480px) {
          .lp-trust-strip {
            gap: 5px;
          }

          .lp-trust-item {
            font-size: 0.58rem;
            padding: 3px 8px;
          }

          .lp-heading {
            font-size: 1.5rem;
          }

          .lp-left {
            padding: 0 14px;
          }

          .lp-card-body {
            padding: 20px 16px 16px;
          }
        }

      `}</style>
  </div>
);
}