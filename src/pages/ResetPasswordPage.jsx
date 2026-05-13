import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Shield } from 'lucide-react';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Read token using both React Router's hook and native URLSearchParams as a
    // bulletproof fallback — ensures the token is captured even if the router
    // has not fully initialised yet when the component first mounts.
    const token =
        searchParams.get('token') ||
        new URLSearchParams(window.location.search).get('token') ||
        '';

    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [tokenMissing, setTokenMissing] = useState(false);
    const [tokenInvalid, setTokenInvalid] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenMissing(true);
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        const pwdValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.newPassword);
        if (!pwdValid) {
            setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
            return;
        }

        setIsLoading(true);

        try {
            // Use axios directly (not the intercepted `api` instance) so that
            // a 400/401/422 from the reset endpoint NEVER triggers a redirect to /login.
            const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
            await axios.post(`${baseURL}/auth/reset-password`, {
                token,
                new_password: formData.newPassword,
            }, {
                headers: { 'ngrok-skip-browser-warning': 'true' },
            });
            setSuccess(true);
        } catch (err) {
            const status = err?.response?.status;
            const detail = err?.response?.data?.detail;

            if (status === 400 || status === 404 || status === 422) {
                // Token is invalid or expired — switch to the dedicated error state
                setTokenInvalid(true);
            } else {
                setError(detail || 'Something went wrong. Please try again or request a new reset link.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── Shared invalid/expired token card (reused for missing token AND API rejection) ──
    if (tokenMissing || tokenInvalid) {
        return (
            <div className="min-h-screen flex relative overflow-auto bg-gradient-to-br from-[#4c00d4] via-[#6d28d9] to-[#a855f7] select-none">
                <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(135deg,transparent,transparent_100px,#ffffff_100px,#ffffff_102px)]" />

                <div className="flex-1 flex items-center justify-center z-[2] px-4 py-8 min-h-screen">
                    <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
                            <XCircle size={32} className="text-rose-500" />
                        </div>
                        <h1 className="text-[1.35rem] font-bold text-[#1e1b4b] mb-2 tracking-tight">Reset Link Invalid or Expired</h1>
                        <p className="text-[0.87rem] text-slate-500 leading-[1.75] mb-6">
                            This password reset link is invalid or has expired. Please request a new reset link.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-right text-white rounded-xl text-[0.88rem] font-semibold tracking-widest shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] mb-3"
                        >
                            Request New Link
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft size={15} /> Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex relative overflow-auto bg-gradient-to-br from-[#4c00d4] via-[#6d28d9] to-[#a855f7] select-none">
            {/* Background Effects */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(135deg,transparent,transparent_100px,#ffffff_100px,#ffffff_102px)]" />

            {/* ─── LEFT SIDE (hidden on mobile) ─── */}
            <div className="flex-[0_0_50%] w-1/2 flex-col justify-between p-14 relative overflow-hidden z-[2] hidden lg:flex">
                <div className="relative z-[1] flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-[120px] h-[120px] flex items-center justify-center mb-8 self-center">
                        <img
                            src="/images/logo.png"
                            alt="Tascade Logo"
                            className="w-[110%] h-[110%] object-contain block"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <h1 className="text-[3.5rem] font-semibold text-white tracking-[-0.02em] mb-1">Tascade®</h1>
                    <h2 className="text-[1.75rem] font-semibold text-white mb-3 tracking-[-0.01em]">Track. Measure. Succeed.</h2>
                    <p className="text-base text-white/85 leading-[1.8] max-w-[500px] mx-auto font-normal">
                        Elevate productivity by tracking and measuring task performance.
                        Turn goals into achievements with Tascade®.
                    </p>
                </div>
                <p className="text-[0.85rem] text-white/70 m-0 text-left">
                    © 2026 Zenith Data Intelligence, LLC. All rights reserved.
                </p>
            </div>

            {/* ─── RIGHT SIDE ─── */}
            <div className="flex-1 flex items-center justify-center z-[2] px-4 py-8 sm:py-12 min-h-screen">
                <div className="w-full max-w-[480px] bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col">

                    {/* Logo — reduced size & margin to tighten top spacing */}
                    <div className="flex justify-center mb-3 self-center">
                        <img
                            src="/images/fj1.png.png"
                            alt="FJ Group logo"
                            className="h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] object-contain block"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>

                    {/* Mobile brand tagline */}
                    <div className="flex flex-col items-center mb-3 lg:hidden">
                        <p className="text-[11px] font-semibold text-slate-400 tracking-widest capitalize">Tascade® — Track. Measure. Succeed.</p>
                    </div>

                    {success ? (
                        /* ── Success State ── */
                        <div className="flex flex-col items-center text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                                <CheckCircle size={32} className="text-emerald-500" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e1b4b] mb-2 tracking-tight">Password Reset Successful</h1>
                            <p className="text-[0.88rem] text-slate-500 leading-[1.75] mb-6 max-w-[320px]">
                                Your password has been updated successfully. You can now sign in with your new password.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-right text-white rounded-xl text-[0.88rem] font-semibold tracking-widest cursor-pointer shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <>
                            <h1 className="text-[1.45rem] font-bold text-[#1e1b4b] mb-1.5 text-center tracking-tight">Set New Password</h1>
                            <p className="text-[0.83rem] text-slate-400 text-center mb-5 leading-[1.65]">
                                Create a new password for your Tascade account.
                            </p>

                            {/* Inline validation / generic error banner */}
                            {error && (
                                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-2">
                                    <XCircle size={15} className="text-rose-500 mt-0.5 shrink-0" />
                                    <p className="text-[0.82rem] text-rose-600 font-medium leading-[1.6]">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[10px] font-medium text-slate-500 capitalize tracking-widest pl-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            id="new-password"
                                            type={showNew ? 'text' : 'password'}
                                            name="newPassword"
                                            placeholder="••••••••••••"
                                            autoComplete="new-password"
                                            className="w-full pl-11 pr-12 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[0.9rem] sm:text-[0.95rem] text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                            onClick={() => setShowNew(!showNew)}
                                            aria-label={showNew ? 'Hide password' : 'Show password'}
                                        >
                                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[10px] font-medium text-slate-500 capitalize tracking-widest pl-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            id="confirm-password"
                                            type={showConfirm ? 'text' : 'password'}
                                            name="confirmPassword"
                                            placeholder="••••••••••••"
                                            autoComplete="new-password"
                                            className="w-full pl-11 pr-12 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[0.9rem] sm:text-[0.95rem] text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {/* Live mismatch inline message */}
                                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                        <p className="text-[0.78rem] pl-1 font-medium text-rose-500 flex items-center gap-1">
                                            <XCircle size={11} className="shrink-0" /> Passwords do not match
                                        </p>
                                    )}
                                    {/* Password rule hint */}
                                    <p className="text-[0.75rem] text-slate-400 pl-1 leading-[1.6] mt-0.5">
                                        Password must be at least 8 characters and include uppercase, lowercase, and a number.
                                    </p>
                                </div>

                                <button
                                    id="reset-password-btn"
                                    type="submit"
                                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-right text-white rounded-xl text-[0.85rem] sm:text-[0.9rem] font-semibold capitalize tracking-widest cursor-pointer shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Updating…
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>

                            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft size={15} /> Back to Login
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-1.5 text-[0.75rem] text-slate-300">
                                <Shield size={11} />
                                <span>Secured with role-based access control</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
