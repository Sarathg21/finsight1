import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, LockKeyhole, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { getStoredToken } from '../services/authApi';
import { getApiBaseUrl } from '../utils/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// Change Password Modal
// POST /api/auth/change-password
// On success: show confirmation → logout → redirect to /login
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = getApiBaseUrl();
const CHANGE_PASSWORD_URL = `${API_BASE}/api/auth/change-password`;

function PasswordField({ id, label, value, onChange, placeholder, error, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--clr-text)',
          marginBottom: 6,
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={id === 'cp-current' ? 'current-password' : 'new-password'}
          style={{
            width: '100%',
            padding: '10px 42px 10px 14px',
            border: `1.5px solid ${error ? '#ef4444' : 'var(--clr-border, #e2e8f0)'}`,
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.875rem',
            color: 'var(--clr-text)',
            background: disabled ? 'var(--clr-surface-muted, #f8fafc)' : 'var(--clr-surface, #fff)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => {
            if (!error) e.target.style.borderColor = 'var(--clr-primary, #7c3aed)';
          }}
          onBlur={e => {
            if (!error) e.target.style.borderColor = 'var(--clr-border, #e2e8f0)';
          }}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          disabled={disabled}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'var(--clr-text-muted, #64748b)',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p style={{ marginTop: 5, fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ChangePasswordModal({ onClose, onSuccessLogout }) {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const overlayRef = useRef(null);
  const timerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting && !success) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [submitting, success, onClose]);

  // Auto-logout countdown after success
  useEffect(() => {
    if (!success) return;
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          onSuccessLogout();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [success, onSuccessLogout]);

  const setField = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field-level error on input
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  // ── Frontend validation ───────────────────────────────────────────
  const validate = useCallback(() => {
    const errs = {};
    if (!form.current.trim()) {
      errs.current = 'Current password is required.';
    }
    if (!form.newPwd) {
      errs.newPwd = 'New password is required.';
    } else if (form.newPwd.length < 12) {
      errs.newPwd = 'New password must be at least 12 characters.';
    } else if (form.newPwd === form.current) {
      errs.newPwd = 'New password must not be identical to the current password.';
    }
    if (!form.confirm) {
      errs.confirm = 'Please confirm your new password.';
    } else if (form.newPwd && form.confirm !== form.newPwd) {
      errs.confirm = 'Passwords do not match.';
    }
    return errs;
  }, [form]);

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const token = getStoredToken();
      const res = await fetch(CHANGE_PASSWORD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_password: form.current,
          new_password: form.newPwd,
          confirm_password: form.confirm,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        return;
      }

      // ── Map backend errors to friendly messages ───────────────
      const detail = body?.detail || body?.message || body?.error || '';
      const detailStr = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map(d => (typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d))).join('. ')
          : JSON.stringify(detail);

      if (res.status === 401) {
        if (detailStr.toLowerCase().includes('current') || detailStr.toLowerCase().includes('incorrect') || detailStr.toLowerCase().includes('wrong')) {
          setErrors(prev => ({ ...prev, current: 'Incorrect current password.' }));
        } else {
          // Expired/invalid token
          setApiError('Your session has expired. Please log in again.');
          setTimeout(() => { onSuccessLogout(); }, 2500);
        }
      } else if (res.status === 403) {
        if (detailStr.toLowerCase().includes('locked') || detailStr.toLowerCase().includes('restrict') || detailStr.toLowerCase().includes('temporar')) {
          setApiError('Your account has been temporarily restricted due to multiple failed attempts. Please try again later.');
        } else {
          setApiError('Access denied. Your session may be invalid.');
          setTimeout(() => { onSuccessLogout(); }, 2500);
        }
      } else if (res.status === 422) {
        // Validation errors from backend
        if (detailStr.toLowerCase().includes('confirm') || detailStr.toLowerCase().includes('match')) {
          setErrors(prev => ({ ...prev, confirm: detailStr || 'Passwords do not match.' }));
        } else if (detailStr.toLowerCase().includes('new') || detailStr.toLowerCase().includes('password')) {
          setErrors(prev => ({ ...prev, newPwd: detailStr || 'Invalid new password.' }));
        } else {
          setApiError(detailStr || 'Validation error. Please check your input.');
        }
      } else if (res.status >= 500) {
        setApiError('A server error occurred. Please try again shortly.');
      } else {
        setApiError(detailStr || 'Password change failed. Please try again.');
      }
    } catch (err) {
      if (err?.name === 'AbortError' || err?.message?.includes('fetch')) {
        setApiError('Network error. Please check your connection and try again.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || success;

  // ── Success screen ────────────────────────────────────────────────
  const successScreen = (
    <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
      <div style={{
        width: 62, height: 62, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 18px',
      }}>
        <CheckCircle size={30} color="#10b981" />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 10 }}>
        Password Changed Successfully
      </h3>
      <p style={{ fontSize: '0.84rem', color: 'var(--clr-text-muted)', lineHeight: 1.65, marginBottom: 20 }}>
        Password changed successfully. Please log in again.
      </p>
      <div style={{
        background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 'var(--radius-md, 8px)', padding: '10px 16px',
        fontSize: '0.8rem', color: 'var(--clr-text-muted)',
      }}>
        Redirecting to login in <strong style={{ color: '#10b981' }}>{countdown}</strong> second{countdown !== 1 ? 's' : ''}…
      </div>
    </div>
  );

  const modal = (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current && !isDisabled) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cp-modal-title"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--clr-surface, #fff)',
          borderRadius: 'var(--radius-lg, 14px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: 440,
          padding: '28px 28px 24px',
          position: 'relative',
          border: '1px solid var(--clr-border, #e2e8f0)',
          animation: 'cpModalIn 0.22s ease-out',
        }}
      >
        {/* Keyframe injection */}
        <style>{`@keyframes cpModalIn { from { opacity:0; transform:scale(0.95) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        {/* Close */}
        {!success && (
          <button
            type="button"
            onClick={onClose}
            disabled={isDisabled}
            aria-label="Close"
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer',
              color: 'var(--clr-text-muted, #64748b)', padding: 4,
              borderRadius: 6, display: 'flex', alignItems: 'center',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        {!success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed22, #6366f122)',
              border: '1px solid #7c3aed33',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LockKeyhole size={18} color="#7c3aed" strokeWidth={1.8} />
            </div>
            <div>
              <h2
                id="cp-modal-title"
                style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text)', margin: 0 }}
              >
                Change Password
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--clr-text-muted)', margin: 0 }}>
                Update your account password securely.
              </p>
            </div>
          </div>
        )}

        {/* API-level error banner */}
        {apiError && !success && (
          <div style={{
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 8,
            fontSize: '0.8rem', color: '#dc2626',
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form / Success */}
        {success ? successScreen : (
          <form onSubmit={handleSubmit} noValidate>
            <PasswordField
              id="cp-current"
              label="Current Password"
              value={form.current}
              onChange={setField('current')}
              placeholder="Enter your current password"
              error={errors.current}
              disabled={isDisabled}
            />
            <PasswordField
              id="cp-new"
              label="New Password"
              value={form.newPwd}
              onChange={setField('newPwd')}
              placeholder="Minimum 12 characters"
              error={errors.newPwd}
              disabled={isDisabled}
            />
            <PasswordField
              id="cp-confirm"
              label="Confirm New Password"
              value={form.confirm}
              onChange={setField('confirm')}
              placeholder="Re-enter your new password"
              error={errors.confirm}
              disabled={isDisabled}
            />

            {/* Password rule hint */}
            <p style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Password must be at least <strong>12 characters</strong> long and different from your current password.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isDisabled}
                style={{
                  padding: '9px 20px', borderRadius: 8,
                  border: '1.5px solid var(--clr-border, #e2e8f0)',
                  background: 'transparent', color: 'var(--clr-text)',
                  fontSize: '0.84rem', fontWeight: 600,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1,
                  transition: 'all 0.15s',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDisabled}
                style={{
                  padding: '9px 24px', borderRadius: 8,
                  background: isDisabled
                    ? 'var(--clr-primary-muted, #7c3aed88)'
                    : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.84rem', fontWeight: 700,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
                  transition: 'all 0.15s',
                  minWidth: 140,
                  justifyContent: 'center',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Changing…
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={14} />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
