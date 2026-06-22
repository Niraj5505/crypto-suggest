import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, ArrowRight, Mail, Eye, EyeOff } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/common/Button';
import { forgotPasswordRequest, resetPasswordRequest } from '../services/api';

// OTP Box input
const OtpInput = ({ value, onChange, length = 6 }) => {
    const inputs = useRef([]);
    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
        const arr = value.split('');
        arr[idx] = val;
        onChange(arr.join(''));
        if (val && idx < length - 1) inputs.current[idx + 1]?.focus();
    };
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) inputs.current[idx - 1]?.focus();
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
                    className="w-11 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-primary/5 transition-all text-text-main"
                />
            ))}
        </div>
    );
};

const ResetPassword = () => {
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await forgotPasswordRequest(email);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Failed to send reset code.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setSubmitting(true);
        try {
            await resetPasswordRequest(email, otp, password);
            setStep('success');
        } catch (err) {
            setError(err.message || 'Failed to reset password. OTP may be invalid or expired.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageLayout>
            <div className="min-h-[80vh] flex items-center justify-center pt-28 pb-12 bg-slate-50">
                <div className="container-custom flex justify-center">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-premium max-w-lg w-full border border-gray-150 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-dark" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />

                        {/* ── Step: Email ───────────────────────────────────── */}
                        {step === 'email' && (
                            <div>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                        <Mail className="w-8 h-8" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-text-main">Forgot Password</h1>
                                    <p className="text-text-muted text-sm mt-2">Enter your email and we'll send you a reset code.</p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-main mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="name@domain.com"
                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-600 font-medium">{error}</p>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={submitting}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                        {submitting ? 'Sending...' : 'Send Reset Code'}
                                        {!submitting && <ArrowRight className="w-4 h-4" />}
                                    </Button>
                                </form>

                                <p className="mt-6 text-center text-sm font-semibold text-text-muted">
                                    <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
                                </p>
                            </div>
                        )}

                        {/* ── Step: OTP + New Password ──────────────────────── */}
                        {step === 'otp' && (
                            <div>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-text-main">Enter Reset Code</h1>
                                    <p className="text-text-muted text-sm mt-2">
                                        We sent a 6-digit reset code to <strong className="text-text-main">{email}</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleOtpSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-text-main mb-1 text-center">Reset Code</label>
                                        <OtpInput value={otp} onChange={setOtp} length={6} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-main mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="Min. 6 characters"
                                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main font-medium"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-600 font-medium">{error}</p>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={submitting || otp.length !== 6}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                        {submitting ? 'Resetting...' : 'Reset Password'}
                                        {!submitting && <ArrowRight className="w-4 h-4" />}
                                    </Button>

                                    <p className="text-center text-sm text-text-muted font-semibold">
                                        Didn't get the code?{' '}
                                        <button type="button" onClick={() => setStep('email')} className="text-primary hover:underline font-bold">
                                            Try again
                                        </button>
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* ── Step: Success ─────────────────────────────────── */}
                        {step === 'success' && (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-bold text-text-main mb-3">Password Reset!</h1>
                                <p className="text-text-muted mb-8">
                                    Your password has been successfully updated. You can now log in with your new credentials.
                                </p>
                                <Link to="/">
                                    <Button variant="primary" className="w-full py-4 flex items-center justify-center gap-2 font-bold hover:shadow-lg">
                                        <span>Back to Home</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ResetPassword;
