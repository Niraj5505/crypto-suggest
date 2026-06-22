import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { verifyOtp, resendOtp, forgotPasswordRequest, resetPasswordRequest } from '../../services/api';
import Button from '../common/Button';

// ─── OTP Input Component ─────────────────────────────────────────────────────
const OtpInput = ({ value, onChange, length = 6 }) => {
    const inputs = useRef([]);

    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
        const arr = value.split('');
        arr[idx] = val;
        onChange(arr.join(''));
        if (val && idx < length - 1) {
            inputs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) {
            inputs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted.padEnd(length, '').slice(0, length));
        inputs.current[Math.min(pasted.length, length - 1)]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center my-4">
            {Array.from({ length }).map((_, idx) => (
                <input
                    key={idx}
                    ref={el => inputs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[idx] || ''}
                    onChange={e => handleChange(e, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    className="w-11 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-primary/5 transition-all text-text-main caret-transparent"
                    style={{ caretColor: 'transparent' }}
                />
            ))}
        </div>
    );
};

// ─── Resend Countdown Timer ───────────────────────────────────────────────────
const ResendTimer = ({ email, onResent }) => {
    const [countdown, setCountdown] = useState(60);
    const [resending, setResending] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        setResending(true);
        setMsg('');
        try {
            await resendOtp(email);
            setCountdown(60);
            setMsg('✅ New OTP sent!');
            onResent?.();
        } catch (err) {
            setMsg(`❌ ${err.message}`);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="text-center text-sm mt-3">
            {msg && <p className="text-xs font-semibold text-green-600 mb-2">{msg}</p>}
            {countdown > 0 ? (
                <p className="text-gray-400 font-semibold">
                    Resend code in <span className="text-primary font-black">{countdown}s</span>
                </p>
            ) : (
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-primary font-bold hover:underline flex items-center gap-1.5 mx-auto disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend Code'}
                </button>
            )}
        </div>
    );
};

// ─── Main AuthModal ───────────────────────────────────────────────────────────
const AuthModal = ({ onClose }) => {
    const { login, register } = useAuth();

    // modes: 'login' | 'register' | 'verify-otp' | 'forgot' | 'reset-otp'
    const [mode, setMode] = useState('login');

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    // UI state
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setError('');
        setSuccessMsg('');
        setOtp('');
    };

    const switchMode = (newMode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSubmitting(true);

        try {
            // ── Login ──────────────────────────────────────────────────────
            if (mode === 'login') {
                try {
                    await login(email, password);
                    onClose();
                } catch (err) {
                    // If unverified, redirect to OTP screen
                    if (err.message && err.message.toLowerCase().includes('verify')) {
                        setMode('verify-otp');
                        setError('');
                        setSuccessMsg(`⚠️ Your email is not verified yet. Please enter the OTP sent to ${email}.`);
                    } else {
                        throw err;
                    }
                }

            // ── Register ───────────────────────────────────────────────────
            } else if (mode === 'register') {
                if (password.length < 6) throw new Error('Password must be at least 6 characters.');
                await register(name, email, password);
                setMode('verify-otp');
                setSuccessMsg(`📧 A 6-digit OTP has been sent to ${email}. Check your inbox!`);

            // ── Verify OTP (after register) ───────────────────────────────
            } else if (mode === 'verify-otp') {
                if (otp.length !== 6) throw new Error('Please enter the complete 6-digit OTP.');
                await verifyOtp(email, otp);
                setMode('login');
                setPassword('');
                setOtp('');
                setSuccessMsg('✅ Email verified! You can now sign in with your credentials.');

            // ── Forgot Password (send OTP) ────────────────────────────────
            } else if (mode === 'forgot') {
                await forgotPasswordRequest(email);
                setMode('reset-otp');
                setSuccessMsg(`📧 A password reset OTP has been sent to ${email}. Check your inbox!`);

            // ── Reset Password (verify OTP + set new password) ────────────
            } else if (mode === 'reset-otp') {
                if (otp.length !== 6) throw new Error('Please enter the complete 6-digit OTP.');
                if (newPassword.length < 6) throw new Error('New password must be at least 6 characters.');
                await resetPasswordRequest(email, otp, newPassword);
                setMode('login');
                setOtp('');
                setNewPassword('');
                setSuccessMsg('✅ Password reset! You can now sign in with your new password.');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Title & subtitle per mode ───────────────────────────────────────────
    const titles = {
        login: 'Sign In',
        register: 'Create Account',
        'verify-otp': 'Verify Email',
        forgot: 'Forgot Password',
        'reset-otp': 'Reset Password'
    };
    const subtitles = {
        login: 'Access your reviews, watchlist, and verify projects.',
        register: 'Join and write reviews for crypto platforms.',
        'verify-otp': `Enter the 6-digit code sent to ${email}`,
        forgot: 'Enter your email to receive a password reset code.',
        'reset-otp': `Enter the reset code sent to ${email} and set a new password.`
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 sm:p-10 max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in">
                {/* Gradient accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r from-primary via-accent to-primary-dark" />

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
                </button>

                {/* Header */}
                <div className="text-center mb-6 mt-2">
                    {mode === 'verify-otp' && (
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                    )}
                    <h2 className="text-3xl font-black text-text-main">{titles[mode]}</h2>
                    <p className="text-sm text-text-muted mt-2 leading-relaxed">{subtitles[mode]}</p>
                </div>

                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold leading-relaxed">
                        {successMsg}
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 font-semibold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── OTP Verification Mode ───────────────────────────── */}
                    {mode === 'verify-otp' && (
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-1 text-center">
                                Enter 6-Digit Verification Code
                            </label>
                            <OtpInput value={otp} onChange={setOtp} length={6} />
                            <ResendTimer email={email} onResent={() => setSuccessMsg('New OTP sent to your email!')} />
                        </div>
                    )}

                    {/* ── Reset OTP Mode ──────────────────────────────────── */}
                    {mode === 'reset-otp' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-1 text-center">
                                    Enter 6-Digit Reset Code
                                </label>
                                <OtpInput value={otp} onChange={setOtp} length={6} />
                                <ResendTimer email={email} onResent={() => setSuccessMsg('New reset OTP sent!')} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main font-semibold"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Name (Register only) ────────────────────────────── */}
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main font-semibold"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Email (login, register, forgot) ─────────────────── */}
                    {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@domain.com"
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main font-semibold"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Password (login, register) ───────────────────────── */}
                    {(mode === 'login' || mode === 'register') && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-text-main">Password</label>
                                {mode === 'login' && (
                                    <button type="button" onClick={() => switchMode('forgot')}
                                        className="text-xs font-bold text-primary hover:underline">
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main font-semibold"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Submit Button ──────────────────────────────────────── */}
                    <Button
                        type="submit"
                        disabled={submitting || (mode === 'verify-otp' && otp.length !== 6) || (mode === 'reset-otp' && otp.length !== 6)}
                        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-100 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span>
                            {submitting ? 'Please wait...' : (
                                {
                                    'login': 'Sign In',
                                    'register': 'Create Account & Send OTP',
                                    'verify-otp': 'Verify Email',
                                    'forgot': 'Send Reset Code',
                                    'reset-otp': 'Reset Password'
                                }[mode]
                            )}
                        </span>
                        {!submitting && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </form>

                {/* Footer links */}
                <div className="mt-6 text-center text-sm font-semibold text-text-muted border-t border-gray-100 pt-5 space-y-1">
                    {mode === 'login' && (
                        <p>Don't have an account?{' '}
                            <button onClick={() => switchMode('register')} className="text-primary hover:underline font-bold">Register here</button>
                        </p>
                    )}
                    {mode === 'register' && (
                        <p>Already have an account?{' '}
                            <button onClick={() => switchMode('login')} className="text-primary hover:underline font-bold">Sign In</button>
                        </p>
                    )}
                    {mode === 'verify-otp' && (
                        <p>
                            <button onClick={() => switchMode('login')} className="text-gray-500 hover:text-primary font-bold">← Back to Sign In</button>
                        </p>
                    )}
                    {(mode === 'forgot' || mode === 'reset-otp') && (
                        <p>
                            <button onClick={() => switchMode('login')} className="text-gray-500 hover:text-primary font-bold">← Back to Sign In</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
