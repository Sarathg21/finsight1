import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid

  useEffect(() => {
    // Simulate token validation
    const timer = setTimeout(() => {
      // In production: validate token against backend
      // For demo: treat missing token as invalid, any token as valid
      setTokenValid(!!token);
    }, 500);
    return () => clearTimeout(timer);
  }, [token]);

  function getPasswordStrength(pwd) {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  }

  const strength = getPasswordStrength(newPassword);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSuccess(true);
  }

  /* ── Token checking skeleton ── */
  if (tokenValid === null) {
    return (
      <div className="login-page">
        <div className="login-bg-glow login-bg-glow-1" />
        <div className="login-bg-glow login-bg-glow-2" />
        <div className="login-card animate-in" style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, margin: '0 auto 16px',
            border: '3px solid var(--clr-border)',
            borderTopColor: 'var(--clr-primary)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>Validating your reset link…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Invalid / Expired token ── */
  if (!tokenValid) {
    return (
      <div className="login-page">
        <div className="login-bg-glow login-bg-glow-1" />
        <div className="login-bg-glow login-bg-glow-2" />
        <div className="login-card animate-in" style={{ textAlign: 'center' }}>
          <div className="login-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <div className="logo-mark">FS</div>
            <div className="logo-text">
              <span className="brand gradient-text">Finsight</span>
              <span className="tagline">FJ Group Finance Intelligence</span>
            </div>
          </div>

          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>

          <h1 className="login-heading" style={{ textAlign: 'center', marginBottom: 10 }}>
            Link Expired
          </h1>
          <p style={{
            fontSize: '0.85rem', color: 'var(--clr-text-muted)',
            lineHeight: 1.65, marginBottom: 28,
          }}>
            This password reset link is invalid or has expired. Reset links are valid for 15 minutes.
          </p>

          <Link
            to="/forgot-password"
            id="request-new-link-btn"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', marginBottom: 16, textDecoration: 'none' }}
          >
            Request a New Link
          </Link>

          <div style={{ paddingTop: 4 }}>
            <Link
              to="/login"
              id="expired-back-to-login"
              style={{
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--clr-text-muted)', textDecoration: 'none',
              }}
            >
              Back to Login
            </Link>
          </div>

          <p className="login-hint">
            <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
            Secured with role-based access control · FJ Group confidential
          </p>
        </div>
      </div>
    );
  }

  /* ── Success State ── */
  if (success) {
    return (
      <div className="login-page">
        <div className="login-bg-glow login-bg-glow-1" />
        <div className="login-bg-glow login-bg-glow-2" />
        <div className="login-card animate-in" style={{ textAlign: 'center' }}>
          <div className="login-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <div className="logo-mark">FS</div>
            <div className="logo-text">
              <span className="brand gradient-text">Finsight</span>
              <span className="tagline">FJ Group Finance Intelligence</span>
            </div>
          </div>

          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={30} color="#10b981" />
          </div>

          <h1 className="login-heading" style={{ textAlign: 'center', marginBottom: 10 }}>
            Password Reset Successful
          </h1>
          <p style={{
            fontSize: '0.85rem', color: 'var(--clr-text-muted)',
            lineHeight: 1.65, marginBottom: 28,
          }}>
            Your password has been updated. You can now sign in with your new password.
          </p>

          <Link
            to="/login"
            id="goto-login-after-reset"
            className="btn btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', textDecoration: 'none',
            }}
          >
            <Shield size={15} /> Go to Login
          </Link>

          <p className="login-hint">
            <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
            Secured with role-based access control · FJ Group confidential
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Main Reset Form ── */
  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card animate-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-mark">FS</div>
          <div className="logo-text">
            <span className="brand gradient-text">Finsight</span>
            <span className="tagline">FJ Group Finance Intelligence</span>
          </div>
        </div>

        <h1 className="login-heading">Set New Password</h1>
        <p className="login-sub">Create a secure new password for your account.</p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                required
                autoFocus
                style={{ paddingLeft: '40px', paddingRight: '42px' }}
              />
              <Lock size={15} style={{
                position: 'absolute', left: 13, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--clr-text-dim)', pointerEvents: 'none',
              }} />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center',
                }}
                aria-label="Toggle new password visibility"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength bar */}
            {newPassword && strength && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 4, background: 'var(--clr-surface-2)',
                  borderRadius: 99, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: strength.width,
                    background: strength.color,
                    borderRadius: 99, transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600, marginTop: 4, display: 'block' }}>
                  {strength.label} password
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                required
                style={{ paddingLeft: '40px', paddingRight: '42px' }}
              />
              <Lock size={15} style={{
                position: 'absolute', left: 13, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--clr-text-dim)', pointerEvents: 'none',
              }} />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center',
                }}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 600, marginTop: 4, display: 'block',
                color: newPassword === confirmPassword ? '#10b981' : '#ef4444',
              }}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
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
            id="reset-password-btn"
            type="submit"
            className="btn btn-primary w-full"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block',
                }} />
                Resetting…
              </span>
            ) : (
              <>
                <Lock size={15} /> Reset Password
              </>
            )}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 18, textAlign: 'center' }}>
          <Link
            to="/login"
            id="reset-back-to-login"
            style={{
              fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--clr-text-muted)', textDecoration: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-muted)'}
          >
            Back to Login
          </Link>
        </div>

        <p className="login-hint">
          <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
          Secured with role-based access control · FJ Group confidential
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
