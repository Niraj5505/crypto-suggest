import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, User, Lock, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';

const WelcomePromoModal = () => {
    const { isConnected, register } = useWallet();
    const navigate = useNavigate();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form fields
    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpMobile, setSignUpMobile] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Show only if not connected and hasn't dismissed yet
        const hasSeenPromo = localStorage.getItem('hasSeenPromo_v2');
        if (!isConnected && hasSeenPromo !== 'true') {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1500); // Trigger after 1.5 seconds
            return () => clearTimeout(timer);
        }
    }, [isConnected]);

    if (!mounted || !isOpen || isConnected) return null;

    const handleClose = () => {
        localStorage.setItem('hasSeenPromo_v2', 'true');
        setIsOpen(false);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!signUpUsername || !signUpEmail || !signUpMobile || !signUpPassword) {
            setErrorMsg('All fields are required.');
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
                ''
            );
            if (result.success) {
                localStorage.setItem('hasSeenPromo_v2', 'true');
                setIsOpen(false);
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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden animate-fade-in border border-slate-100 z-10 flex flex-col md:flex-row min-h-[500px]">
                {/* Left Side: Launch Special Promo */}
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Background Highlights */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Launch Special 🚀</span>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black leading-tight tracking-tight">
                                First 50 Projects get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">FREE Premium Listing</span>
                            </h3>
                            <p className="text-sm text-gray-300 font-medium">
                                Register your account now to claim a complimentary premium website submission.
                            </p>
                        </div>

                        {/* Features list */}
                        <div className="space-y-3.5 pt-2">
                            {[
                                'FREE Premium Listing',
                                'Homepage Feature Section',
                                'Dofollow SEO Backlink',
                                'Verified Safety Badge'
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center gap-3 text-gray-200 font-semibold text-sm">
                                    <span className="w-5 h-5 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10 text-xs">✓</span>
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Value Indicator Footer */}
                    <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Value</p>
                            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 font-mono">$99</p>
                        </div>
                        <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-wider text-emerald-400">
                            100% Free
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Form */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center relative">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-150 text-gray-500 hover:text-gray-800 rounded-full transition-colors z-20"
                        aria-label="Close dialog"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="mb-6">
                        <h4 className="text-2xl font-black text-gray-900 tracking-tight">Create Free Account</h4>
                        <p className="text-sm text-gray-500 mt-1">Get instant access to claim your promotion.</p>
                    </div>

                    {/* Error Msg */}
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
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
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
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
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
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
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={signUpPassword}
                                    onChange={(e) => setSignUpPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-150 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating Account...' : 'Register & Claim Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WelcomePromoModal;
