import { useState } from 'react';
import { Mail, ArrowLeft, Send, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

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

        {submitted ? (
          /* ── Success State ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Mail size={28} color="#10b981" />
            </div>

            <h1 className="login-heading" style={{ textAlign: 'center', marginBottom: 8 }}>
              Check your inbox
            </h1>
            <p style={{
              fontSize: '0.85rem', color: 'var(--clr-text-muted)',
              lineHeight: 1.65, marginBottom: 28,
            }}>
              If an account exists for <strong style={{ color: 'var(--clr-text)' }}>{email}</strong>,
              a password reset link has been sent.
            </p>

            <div style={{
              background: 'rgba(16,185,129,0.07)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '0.8rem',
              color: 'var(--clr-text-muted)',
              marginBottom: 28,
              lineHeight: 1.6,
            }}>
              <Shield size={12} style={{ display: 'inline', marginRight: 5, color: '#10b981' }} />
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </div>

            <Link
              to="/login"
              id="back-to-login-success"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--clr-primary)', textDecoration: 'none',
              }}
            >
              <ArrowLeft size={15} /> Back to Login
            </Link>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <h1 className="login-heading">Forgot Password</h1>
            <p className="login-sub">
              Enter your registered email to receive a password reset link.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    placeholder="you@fjgroup.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    required
                    autoComplete="email"
                    autoFocus
                    style={{ paddingLeft: '40px' }}
                  />
                  <Mail
                    size={15}
                    style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--clr-text-dim)', pointerEvents: 'none',
                    }}
                  />
                </div>
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
                id="send-reset-link-btn"
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
                    Sending…
                  </span>
                ) : (
                  <>
                    <Send size={15} /> Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 18, textAlign: 'center' }}>
              <Link
                to="/login"
                id="back-to-login-link"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--clr-text-muted)', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-muted)'}
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </>
        )}

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
