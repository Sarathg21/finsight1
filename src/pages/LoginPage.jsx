import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../context/AuthContext';
import { Shield, Eye, EyeOff, ChevronDown, Smartphone, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BACKEND_HOST } from '../services/authApi';

/* ── Tiny server status pill (non-blocking) ──────────────────────── */
function ServerPill({ status }) {
  const cfg = {
    checking: { dot: '#6366f1', label: 'Connecting to server…', pulse: true  },
    online:   { dot: '#10b981', label: 'Live server connected',  pulse: false },
    offline:  { dot: '#94a3b8', label: `Demo mode · ${BACKEND_HOST} unreachable`, pulse: false },
  }[status] || { dot: '#94a3b8', label: '', pulse: false };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      marginBottom: 18,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot, flexShrink: 0, display: 'inline-block',
        animation: cfg.pulse ? 'ping 1.2s ease-out infinite' : 'none',
      }} />
      <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>
        {cfg.label}
      </span>
    </div>
  );
}

/* ── Main LoginPage ────────────────────────────────────────────────── */
export default function LoginPage() {
  const { user, verifyCredentials, completeLogin, loginWithBackend, auditLog } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // 'checking' only while login is in-flight; 'online' / 'offline' after attempt
  const [backendStatus, setBackendStatus] = useState('idle');

  // MFA state
  const [mfaStep,  setMfaStep]  = useState(false);
  const [mfaCode,  setMfaCode]  = useState('');
  const [mfaInput, setMfaInput] = useState('');
  const [mfaUser,  setMfaUser]  = useState(null);

  // ── Redirect if already logged in ───────────────────────────────
  useEffect(() => {
    if (user && !mfaStep) navigate(from || user.defaultPage || '/dashboard', { replace: true });
  }, [user, mfaStep, navigate, from]);

  // ── Helpers ─────────────────────────────────────────────────────
  function generateMfaCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function goToMfa(sessionUser) {
    const code = generateMfaCode();
    setMfaCode(code);
    setMfaUser(sessionUser);
    setMfaStep(true);
  }

  // ── Submit handler ───────────────────────────────────────────────
  // Strategy: ALWAYS try the real backend first (no pre-check).
  // If it succeeds → real JWT session.
  // If it fails with a network/timeout error → silently fall back to demo.
  // If it fails with 401/403 → show credential error (wrong password).
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setBackendStatus('checking');

    try {
      // ── Path A: Try real backend ─────────────────────────────────
      try {
        const session = await loginWithBackend(email.trim(), password);
        setBackendStatus('online');
        goToMfa(session);
        return;
      } catch (backendErr) {
        console.error('[Login] Backend login failed:', backendErr);
        const isAuthFailure =
          backendErr?.isAuthError ||
          backendErr?.status === 401 ||
          backendErr?.status === 403;

        if (isAuthFailure) {
          // Backend is up but credentials are wrong or we got an HTTP error
          setBackendStatus('online');
          setError(backendErr.message || 'Invalid email or password');
          return;
        }
        // Network error / timeout → backend is down, fall through to demo
        console.warn('[Login] Network/Timeout error, falling through to demo mode. Error:', backendErr);
        setBackendStatus('offline');
      }

      // ── Path B: Backend unreachable → try demo credentials ───────
      const result = verifyCredentials(email, password);
      if (result.success) {
        goToMfa(result.user);
      } else {
        setError('Invalid credentials. Check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ── MFA verify ───────────────────────────────────────────────────
  function handleMfaVerify(e) {
    e.preventDefault();
    if (mfaInput.trim() === mfaCode) {
      completeLogin(mfaUser);
      auditLog?.('login_mfa', { userId: mfaUser?.id, userName: mfaUser?.name, userRole: mfaUser?.role });
      navigate(from || mfaUser?.defaultPage || '/dashboard', { replace: true });
    } else {
      auditLog?.('mfa_failed', { userId: mfaUser?.id, userName: mfaUser?.name });
      setError('Incorrect verification code. Please try again.');
    }
  }

  function fillDemo(u) {
    setEmail(u.email);
    setPassword(u.password);
    setShowDemo(false);
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      {/* ── MFA Step ── */}
      {mfaStep ? (
        <div className="login-card animate-in">
          <div className="login-logo">
            <div className="logo-mark" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Smartphone size={22} color="#fff" />
            </div>
            <div className="logo-text">
              <span className="brand gradient-text">MFA Verification</span>
              <span className="tagline">Multi-Factor Authentication Required</span>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            A verification code has been sent to your registered device. Enter it below to complete sign-in.
          </p>

          {/* Demo code badge */}
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px dashed rgba(16,185,129,0.4)',
            borderRadius: 10, padding: '10px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Demo Code (visible for testing)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.25em', color: '#059669', fontFamily: 'monospace' }}>{mfaCode}</div>
            </div>
            <button type="button" onClick={() => { setMfaCode(generateMfaCode()); setMfaInput(''); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }} title="Regenerate code">
              <RefreshCw size={16} />
            </button>
          </div>

          <form onSubmit={handleMfaVerify}>
            <div className="form-group">
              <label className="form-label" htmlFor="mfa-input">6-Digit Verification Code</label>
              <input
                id="mfa-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="form-input"
                placeholder="000000"
                value={mfaInput}
                onChange={e => { setMfaInput(e.target.value.replace(/\D/g, '')); setError(''); }}
                required
                autoFocus
                style={{ letterSpacing: '0.3em', fontSize: '1.3rem', textAlign: 'center', fontFamily: 'monospace' }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                color: 'var(--clr-danger)', fontSize: '0.82rem', marginBottom: '16px',
              }}>{error}</div>
            )}

            <button id="mfa-verify-btn" type="submit" className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '12px' }}>
              <Shield size={15} /> Verify &amp; Sign In
            </button>
          </form>

          <button type="button" onClick={() => { setMfaStep(false); setMfaInput(''); setError(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', fontSize: '0.78rem', width: '100%', textAlign: 'center', textDecoration: 'underline' }}>
            ← Back to login
          </button>
        </div>

      ) : (
        <div className="login-card animate-in">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-mark">FS</div>
            <div className="logo-text">
              <span className="brand gradient-text">Finsight</span>
              <span className="tagline">FJ Group Finance Intelligence</span>
            </div>
          </div>

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-sub">Sign in to access your financial dashboards</p>

          {/* ── Server status pill (tiny, non-blocking) ── */}
          <ServerPill status={backendStatus} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@fjgroup.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute', right: 12, bottom: 11,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center',
                }}
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 18 }}>
              <Link
                to="/forgot-password"
                id="forgot-password-link"
                style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-primary)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                color: 'var(--clr-danger)', fontSize: '0.82rem', marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in…
                </span>
              ) : (
                <><Wifi size={14} /> Sign In Securely</>
              )}
            </button>
          </form>

          {/* ── Demo accounts — tiered ── */}
          <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16 }}>
            <button
              id="demo-accounts-toggle"
              type="button"
              onClick={() => setShowDemo(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--clr-text-muted)', fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              Demo Accounts – Quick Access
              <ChevronDown
                size={14}
                style={{ transform: showDemo ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            {showDemo && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TierSection
                  tier="Board" icon="♛" color="#f59e0b"
                  gradient="linear-gradient(135deg,#f59e0b,#d97706)"
                  users={DEMO_USERS.filter(u => u.layer === 0)}
                  onSelect={fillDemo}
                />
                <TierSection
                  tier="Executive" icon="◆" color="#8b5cf6"
                  gradient="linear-gradient(135deg,#8b5cf6,#6d28d9)"
                  users={DEMO_USERS.filter(u => u.layer === 1 || u.layer === 2)}
                  onSelect={fillDemo}
                />
                <TierSection
                  tier="Management" icon="▲" color="#3b82f6"
                  gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)"
                  users={DEMO_USERS.filter(u => u.layer === 3 || u.layer === 4)}
                  onSelect={fillDemo}
                />
                <TierSection
                  tier="Finance" icon="●" color="#10b981"
                  gradient="linear-gradient(135deg,#10b981,#059669)"
                  users={DEMO_USERS.filter(u => u.layer === 5 || u.layer === 6)}
                  onSelect={fillDemo}
                />
              </div>
            )}
          </div>

          <p className="login-hint">
            <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
            Secured with role-based access control · FJ Group confidential
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes ping  {
          0%   { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
          70%  { box-shadow: 0 0 0 6px transparent; opacity: 0.3; }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 0; }
        }
        .tier-user-btn:hover {
          border-color: var(--clr-border-hover) !important;
          background: var(--clr-surface-2) !important;
        }
      `}</style>
    </div>
  );
}

/* ── Tier Section component ──────────────────────────────────────── */
function TierSection({ tier, icon, color, gradient, users, onSelect }) {
  return (
    <div style={{ borderRadius: '10px', border: `1px solid ${color}30`, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px',
        background: `${color}18`,
        borderBottom: `1px solid ${color}28`,
      }}>
        <span style={{
          width: 20, height: 20, background: gradient, borderRadius: '5px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', color: '#fff', flexShrink: 0,
        }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {tier}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.63rem', color: `${color}99`, fontWeight: 500 }}>
          {users.length} {users.length === 1 ? 'account' : 'accounts'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '6px' }}>
        {users.map(u => (
          <button
            key={u.id}
            type="button"
            className="tier-user-btn"
            onClick={() => onSelect(u)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 8px', background: 'transparent',
              border: '1px solid transparent', borderRadius: '7px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s', color: 'var(--clr-text)',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.62rem', fontWeight: 700, color: '#fff', flexShrink: 0,
              boxShadow: `0 2px 8px ${color}40`,
            }}>{u.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{u.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 1 }}>
                {u.roleLabel}
              </div>
            </div>
            <div style={{
              padding: '2px 8px', background: `${color}20`,
              border: `1px solid ${color}40`, borderRadius: '20px',
              fontSize: '0.62rem', fontWeight: 700, color, flexShrink: 0,
            }}>
              {u.layer === 0 ? 'BOARD' : `L${u.layer}`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
