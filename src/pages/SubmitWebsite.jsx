import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Check, Upload, ChevronRight, ChevronLeft, Sparkles, PartyPopper, Lock, Crown, ArrowLeft, AlertCircle, CreditCard } from 'lucide-react';
import { submitWebsite, getDbUser } from '../services/api';
import { useWallet } from '../contexts/WalletContext';

// Simple CSS Confetti Component
const Confetti = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full animate-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10px`,
                        backgroundColor: ['#1F8FE5', '#4FC3F7', '#FFD700', '#FF6B6B', '#4ADE80'][Math.floor(Math.random() * 5)],
                        animationDuration: `${Math.random() * 3 + 2}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    );
};

const SubmitWebsite = () => {
    const navigate = useNavigate();
    const { isConnected, walletAddress } = useWallet();
    const [hasSubscription, setHasSubscription] = useState(null); // null = checking, true, false
    const [checkingSub, setCheckingSub] = useState(false);

    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        websiteName: '',
        websiteUrl: '',
        email: '',
        category: '',
        description: '',
        role: ''
    });

    useEffect(() => {
        const checkUserSubscription = async () => {
            if (!isConnected || !walletAddress) {
                setHasSubscription(false);
                return;
            }
            setCheckingSub(true);
            try {
                const user = await getDbUser(walletAddress);
                if (user && user.subscribedPlan) {
                    setHasSubscription(true);
                } else {
                    setHasSubscription(false);
                }
            } catch (err) {
                console.error("Error verifying subscription:", err);
                setHasSubscription(false);
            } finally {
                setCheckingSub(false);
            }
        };

        checkUserSubscription();
    }, [isConnected, walletAddress]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);

        try {
            await submitWebsite(formData);
            setIsSubmitted(true);
            // Reset after 5 seconds for demo purposes
            setTimeout(() => {
                setIsSubmitted(false);
                setStep(1);
                setFormData({
                    websiteName: '',
                    websiteUrl: '',
                    email: '',
                    category: '',
                    description: '',
                    role: ''
                });
            }, 5000);
        } catch (error) {
            setSubmitError(error.message || 'Failed to submit website.');
        } finally {
            setSubmitting(false);
        }
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const benefits = [
        { title: 'Increase Visibility', description: 'Reach crypto enthusiasts actively searching for platforms like yours', icon: <Sparkles className="w-6 h-6 text-yellow-500" /> },
        { title: 'Build Trust', description: 'Verified badge adds credibility to your platform', icon: <Check className="w-6 h-6 text-green-500" /> },
        { title: 'Targeted Traffic', description: 'Users specifically interested in your niche', icon: <TrendingUpIcon /> },
        { title: 'Free Listing', description: 'Basic listing at no cost with optional featured upgrades', icon: <AwardIcon /> }
    ];

    if (checkingSub) {
        return (
            <PageLayout>
                <div className="container-custom pt-32 pb-12 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-bold text-sm">Verifying your subscription status...</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (!isConnected) {
        return (
            <PageLayout>
                <div className="container-custom pt-32 pb-12 relative flex items-center justify-center min-h-[65vh]">
                    <div className="max-w-xl w-full mx-auto">
                        <Card className="text-center p-10 shadow-2xl border-0 ring-1 ring-gray-100/50 relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/30 to-purple-50/30 -z-10"></div>
                            
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-inner">
                                <Lock className="w-10 h-10 animate-bounce" />
                            </div>
                            
                            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Connect Your Wallet</h2>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                To submit a crypto or blockchain website, you must connect your wallet and have an active subscription plan.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Home
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (!hasSubscription) {
        return (
            <PageLayout>
                <div className="container-custom pt-32 pb-12 relative flex items-center justify-center min-h-[65vh]">
                    <div className="max-w-xl w-full mx-auto">
                        <Card className="text-center p-10 shadow-2xl border-0 ring-1 ring-gray-100/50 relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-50/20 to-orange-50/20 -z-10"></div>
                            
                            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-inner">
                                <Crown className="w-10 h-10 animate-pulse" />
                            </div>
                            
                            <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                                <AlertCircle className="w-3.5 h-3.5" /> Subscription Required
                            </div>
                            
                            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Unlock Platform Listing</h2>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                                Listing your platform on Crypto Suggest is a premium feature. Please choose a subscription plan in your dashboard to submit websites.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Home
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" /> Subscribe on Dashboard
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            {isSubmitted && <Confetti />}
            <div className="container-custom pt-32 pb-12 relative">
                <div className="max-w-4xl mx-auto">

                    {isSubmitted ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-primary/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce">
                                <PartyPopper className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4 relative z-10">Submission Received!</h2>
                            <p className="text-xl text-gray-600 mb-8 relative z-10">
                                Thank you for submitting <strong>{formData.websiteName}</strong>. Our team will verify it shortly.
                            </p>
                            <Button onClick={() => setIsSubmitted(false)}>Submit Another</Button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="text-center mb-12">
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="inline-block"
                                >
                                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-4 leading-tight">
                                        Get Your Crypto Website Listed
                                    </h1>
                                </motion.div>
                                <p className="text-xl text-text-muted">
                                    Join 500+ verified crypto platforms and get discovered by thousands of users
                                </p>
                            </div>

                            <div className="grid md:grid-cols-4 gap-6 mb-12">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="text-center h-full hover:shadow-lg transition-all border-t-4 border-t-transparent hover:border-t-primary">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                {benefit.icon}
                                            </div>
                                            <h3 className="font-bold mb-2">{benefit.title}</h3>
                                            <p className="text-sm text-text-muted">{benefit.description}</p>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            <Card className="overflow-hidden shadow-2xl border-0 ring-1 ring-gray-100">
                                <div className="mb-10 bg-gray-50/50 p-6 -mx-6 -mt-6 border-b border-gray-100">
                                    <div className="flex justify-between items-center relative">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                                        {/* Active Progress */}
                                        <motion.div
                                            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-purple-500 -z-10 rounded-full"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${((step - 1) / 2) * 100}%` }}
                                        />

                                        {[1, 2, 3].map((s) => (
                                            <div key={s} className="flex flex-col items-center relative z-10 bg-white px-2">
                                                <motion.div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-colors duration-500 ${step >= s ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-400'}`}
                                                    animate={{ scale: step === s ? 1.2 : 1 }}
                                                >
                                                    {step > s ? <Check className="w-6 h-6" /> : s}
                                                </motion.div>
                                                <span className={`text-xs mt-2 font-medium ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                                                    {s === 1 ? 'Basic Info' : s === 2 ? 'Details' : 'Verification'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="min-h-[300px]">
                                    <AnimatePresence mode="wait" initial={false}>
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-6"
                                            >
                                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary p-1 rounded-lg"><InfoIcon /></span> Basic Information
                                                </h2>

                                                <InputField
                                                    label="Website Name"
                                                    name="websiteName"
                                                    value={formData.websiteName}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Binance"
                                                />
                                                <InputField
                                                    label="Website URL"
                                                    name="websiteUrl"
                                                    type="url"
                                                    value={formData.websiteUrl}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com"
                                                />
                                                <InputField
                                                    label="Official Email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="contact@example.com"
                                                />

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                                                    <select
                                                        required
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className="input hover:border-primary focus:border-primary transition-colors cursor-pointer"
                                                    >
                                                        <option value="">Select a category</option>
                                                        <option value="exchange">Crypto Exchange</option>
                                                        <option value="nft">NFT Marketplace</option>
                                                        <option value="wallet">Crypto Wallet</option>
                                                        <option value="defi">DeFi Platform</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>

                                                <Button type="button" onClick={nextStep} className="w-full h-12 text-lg group">
                                                    Next Step <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-6"
                                            >
                                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary p-1 rounded-lg"><TrendingUpIcon /></span> Additional Details
                                                </h2>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                                                    <textarea
                                                        required
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        className="input min-h-[150px] resize-none focus:ring-2 focus:ring-primary/20"
                                                        placeholder="Describe your platform in 150-500 characters..."
                                                    />
                                                    <p className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
                                                </div>

                                                <div className="flex gap-4">
                                                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12">
                                                        <ChevronLeft className="w-5 h-5 mr-2" /> Back
                                                    </Button>
                                                    <Button type="button" onClick={nextStep} className="flex-1 h-12 group">
                                                        Next Step <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-6"
                                            >
                                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary p-1 rounded-lg"><Check /></span> Final Verification
                                                </h2>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Role *</label>
                                                    <select
                                                        required
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        className="input"
                                                    >
                                                        <option value="">Select your role</option>
                                                        <option value="founder">Founder</option>
                                                        <option value="marketing">Marketing</option>
                                                        <option value="developer">Developer</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-gray-200">
                                                    <Checkbox label="I confirm this is an official submission" />
                                                    <Checkbox label="I agree to terms and conditions" />
                                                    <Checkbox label="I understand verification may take 3-5 business days" />
                                                </div>

                                                {submitError && (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl">
                                                        ❌ {submitError}
                                                    </div>
                                                )}

                                                <div className="flex gap-4">
                                                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12">
                                                        <ChevronLeft className="w-5 h-5 mr-2" /> Back
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={submitting}
                                                        className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/30 disabled:bg-gray-300 disabled:shadow-none"
                                                    >
                                                        {submitting ? 'Submitting...' : 'Submit for Review'}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

// Helper Components for simple clean code
const InputField = ({ label, type = "text", ...props }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label} *</label>
        <div className="relative">
            <input
                type={type}
                required
                className="input focus:ring-2 focus:ring-primary/20 transition-all pl-4"
                {...props}
            />
            {props.value && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
        </div>
    </div>
);

const Checkbox = ({ label }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" required className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
        <span className="text-sm group-hover:text-primary transition-colors">{label}</span>
    </label>
);

// Icon components to avoid cluttering imports if not all used
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-6 h-6 text-orange-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
const AwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award w-6 h-6 text-purple-500"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>;

export default SubmitWebsite;
