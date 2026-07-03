import React, { useState } from 'react';
import { X, Mail, Phone, User, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';

const WalletConnectionModal = ({ isOpen, onClose }) => {
    const { login, register } = useWallet();
    const navigate = useNavigate();
    
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Sign In Fields
    const [loginId, setLoginId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Sign Up Fields
    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpMobile, setSignUpMobile] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpReferrer, setSignUpReferrer] = useState('');

    if (!isOpen) return null;

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginId || !loginPassword) {
            setErrorMsg('Please enter both your identifier and password.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        try {
            const result = await login(loginId, loginPassword);
            if (result.success) {
                onClose();
                navigate('/dashboard');
            } else {
                setErrorMsg(result.error || 'Failed to sign in. Please check your credentials.');
            }
        } catch (error) {
            setErrorMsg('An unexpected error occurred. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!signUpUsername || !signUpEmail || !signUpMobile || !signUpPassword) {
            setErrorMsg('All fields except referral are required.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        try {
            const result = await register(
                signUpUsername,
                signUpEmail,
                signUpMobile,
                signUpPassword,
                signUpReferrer
            );
            if (result.success) {
                onClose();
                navigate('/dashboard');
            } else {
                setErrorMsg(result.error || 'Registration failed. Try a different username/email.');
            }
        } catch (error) {
            setErrorMsg('An unexpected error occurred. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-slate-100 z-10">
                {/* Visual Top Bar */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors z-20"
                    aria-label="Close dialog"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8">
                    {/* Brand / Logo Mockup */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
                            💎
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isLoginTab ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isLoginTab 
                                ? 'Sign in to access your dashboard & verify platforms' 
                                : 'Join our community of crypto enthusiasts & partners'}
                        </p>
                    </div>

                    {/* Auth Toggle Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
                            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                                isLoginTab 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
                            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                                !isLoginTab 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error Alerts */}
                    {errorMsg && (
                        <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-150 rounded-2xl p-3.5 text-red-700 text-xs font-medium animate-shake">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-650" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Forms */}
                    {isLoginTab ? (
                        /* ── SIGN IN FORM ── */
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username, Email, or Mobile</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        placeholder="e.g. satoshi / admin@site.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* ── REGISTER FORM ── */
                        <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={signUpUsername}
                                        onChange={(e) => setSignUpUsername(e.target.value)}
                                        placeholder="e.g. cryptoking"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={signUpEmail}
                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={signUpMobile}
                                        onChange={(e) => setSignUpMobile(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={signUpPassword}
                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Referrer username (Optional)</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                                    <input
                                        type="text"
                                        value={signUpReferrer}
                                        onChange={(e) => setSignUpReferrer(e.target.value)}
                                        placeholder="Referrer's username or code"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-3 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer terms */}
                <div className="bg-slate-50 py-4 px-8 text-center border-t border-slate-100">
                    <p className="text-[10px] text-gray-400">
                        By continuing, you agree to our Terms of Service & Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletConnectionModal;
