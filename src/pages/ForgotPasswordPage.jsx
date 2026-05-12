import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Shield, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
        } catch (err) {
            // Intentionally swallow errors — always show the generic success message
            // to avoid revealing whether an email exists in the system.
            console.warn('[ForgotPassword] Request error (suppressed for security):', err?.response?.status);
        } finally {
            setIsLoading(false);
            setSubmitted(true);
        }
    };

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

                    {/* Logo */}
                    <div className="flex justify-center mb-6 sm:mb-8 self-center">
                        <img
                            src="/images/fj1.png.png"
                            alt="FJ Group logo"
                            className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] object-contain block"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>

                    {/* Mobile brand tagline */}
                    <div className="flex flex-col items-center mb-3 lg:hidden">
                        <p className="text-[11px] font-semibold text-slate-400 tracking-widest capitalize">Tascade® — Track. Measure. Succeed.</p>
                    </div>

                    {submitted ? (
                        /* ── Success State ── */
                        <div className="flex flex-col items-center text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                                <CheckCircle size={32} className="text-emerald-500" />
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e1b4b] mb-3 tracking-tight">Check your inbox</h1>
                            <p className="text-[0.88rem] text-slate-500 leading-[1.75] mb-5 max-w-[340px]">
                                If an account exists for this email, a reset link has been sent.
                            </p>

                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-[0.8rem] text-slate-500 leading-[1.65] mb-7 w-full text-left">
                                <Shield size={12} className="inline mr-1.5 text-emerald-500" />
                                Didn't receive it? Check your spam folder or wait a few minutes before trying again.
                            </div>

                            <button
                                type="button"
                                onClick={() => { setSubmitted(false); setEmail(''); }}
                                className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 mb-3 transition-colors"
                            >
                                Try a different email
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft size={15} /> Back to Login
                            </button>
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e1b4b] mb-2 text-center tracking-tight">Forgot Password</h1>
                            <p className="text-[0.85rem] text-slate-400 text-center mb-6 leading-[1.7]">
                                Enter your registered email and we'll send you a reset link.
                            </p>

                            {error && (
                                <p className="text-[#ef4444] text-[0.85rem] text-center mb-4 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100">
                                    {error}
                                </p>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[10px] font-medium text-slate-500 capitalize tracking-widest pl-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            placeholder="you@company.com"
                                            className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[0.9rem] sm:text-[0.95rem] text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            required
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    id="send-reset-link-btn"
                                    type="submit"
                                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-right text-white rounded-xl text-[0.85rem] sm:text-[0.9rem] font-semibold capitalize tracking-widest cursor-pointer shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} /> Send Reset Link
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft size={15} /> Back to Login
                                </button>
                            </div>
                        </>
                    )}

                    <p className="mt-6 text-center text-[10px] text-white/50 lg:hidden">
                        © 2026 Zenith Data Intelligence, LLC.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
