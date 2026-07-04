import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Share2, Check, X, Shield, Star, Award, TrendingUp, Info, Heart, AlertTriangle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '../components/layout/PageLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import WebsiteReviews from '../components/reviews/WebsiteReviews';
import WebsiteCard from '../components/website/WebsiteCard'; // Import for Similar Websites
import { getWebsiteBySlug, getWebsites, submitScamReport } from '../services/api';
import { useBookmark } from '../contexts/BookmarkContext';
import { useWallet } from '../contexts/WalletContext';
import WalletConnectionModal from '../components/wallet/WalletConnectionModal';

const WebsiteDetail = () => {
    const { slug } = useParams();
    const [website, setWebsite] = useState(null);
    const [similarWebsites, setSimilarWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showExternalModal, setShowExternalModal] = useState(false);
    const [showScamModal, setShowScamModal] = useState(false);
    const { isBookmarked, toggleBookmark } = useBookmark();
    const { isConnected, walletAddress } = useWallet();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Scam form state
    const [scamFormData, setScamFormData] = useState({
        scamType: '',
        txHash: '',
        evidenceUrl: '',
        description: ''
    });
    const [scamSubmitting, setScamSubmitting] = useState(false);
    const [scamSuccess, setScamSuccess] = useState(false);
    const [scamError, setScamError] = useState('');
    
    // Trust Score Calculation (Read from website trustScore scaled from 0-5 to 0-100)
    const [trustScore, setTrustScore] = useState(0);

    useEffect(() => {
        if (website) {
            const score = Math.round(website.trustScore * 20);
            const timer = setTimeout(() => {
                setTrustScore(score);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [website]);

    useEffect(() => {
        const fetchWebsiteData = async () => {
            setLoading(true);
            try {
                const site = await getWebsiteBySlug(slug);
                setWebsite(site);
                setLoading(false);
                if (site) {
                    getWebsites({ category: site.category }).then(similar => {
                        setSimilarWebsites(similar.filter(w => w.id !== site.id).slice(0, 3));
                    }).catch(err => console.error("Error loading similar websites:", err));
                }
            } catch (error) {
                console.error("Error loading website detail:", error);
                setLoading(false);
            }
        };
        fetchWebsiteData();
    }, [slug]);

    useEffect(() => {
        if (website && isConnected && walletAddress) {
            const captureLead = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || '/api';
                    await fetch(`${API_URL}/leads`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            leadWalletAddress: walletAddress,
                            websiteSlug: website.slug
                        })
                    });
                } catch (err) {
                    console.error('Error capturing lead:', err);
                }
            };
            captureLead();
        }
    }, [website, isConnected, walletAddress]);

    const handleScamSubmit = async (e) => {
        e.preventDefault();
        setScamError('');
        setScamSubmitting(true);

        if (!isConnected) {
            setScamError('Please sign in to submit a scam report.');
            setScamSubmitting(false);
            return;
        }

        try {
            await submitScamReport(slug, {
                walletAddress,
                ...scamFormData
            });
            setScamSuccess(true);
            setTimeout(() => {
                setShowScamModal(false);
                setScamSuccess(false);
                setScamFormData({
                    scamType: '',
                    txHash: '',
                    evidenceUrl: '',
                    description: ''
                });
            }, 3000);
        } catch (err) {
            setScamError(err.message || 'Failed to submit scam report.');
        } finally {
            setScamSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="container-custom pt-40 pb-20 text-center">
                    <h2 className="text-2xl font-bold">Loading website details...</h2>
                </div>
            </PageLayout>
        );
    }

    if (!website) {
        return (
            <PageLayout>
                <div className="container-custom pt-40 pb-20 text-center">
                    <h1 className="text-4xl font-bold mb-4">Website Not Found</h1>
                    <Link to="/browse"><Button>Browse All Websites</Button></Link>
                </div>
            </PageLayout>
        );
    }

    if (!isConnected) {
        return (
            <PageLayout>
                <div className="container-custom pt-40 pb-20 flex items-center justify-center min-h-[70vh]">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-gray-100 max-w-lg w-full relative overflow-hidden"
                    >
                        {/* Ambient glow blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
                        
                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-indigo-100/50">
                            <Shield className="w-10 h-10 text-indigo-600 animate-pulse" />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 relative z-10">
                            Access Restricted 🔒
                        </h2>
                        
                        <p className="text-gray-600 mb-8 leading-relaxed relative z-10 text-sm">
                            To view detailed analysis, security audits, trust scores, and community reviews for <strong>{website?.name || 'this project'}</strong>, please sign in.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                            <Button 
                                onClick={() => setIsAuthModalOpen(true)}
                                className="px-8 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Sign In / Register
                            </Button>
                            <Link to="/browse">
                                <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-semibold border-gray-200 text-gray-700 hover:bg-gray-50">
                                    Browse Projects
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <WalletConnectionModal 
                    isOpen={isAuthModalOpen} 
                    onClose={() => setIsAuthModalOpen(false)} 
                />
            </PageLayout>
        );
    }

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: website.category, href: `/category/${website.category.toLowerCase().replace(/ /g, '-')}` },
        { label: website.name }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'features', label: 'Features' },
        { id: 'details', label: 'Details' }
    ];

    const trustColor = trustScore >= 90 ? 'text-green-500' : trustScore >= 70 ? 'text-yellow-500' : 'text-red-500';
    const trustGradient = trustScore >= 90 ? 'from-green-400 to-emerald-600' : 'from-yellow-400 to-orange-500';

    return (
        <PageLayout>
            {website.hasScamAlert && (
                <div className="bg-gradient-to-r from-red-650 to-red-600 via-rose-600 to-red-700 text-white py-4 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 mt-20 relative z-30 shadow-md">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-white" />
                    <span>
                        ⚠️ CONFIRMED SCAM WARNING: This platform has been reported and confirmed as a scam or active exploit! Do not interact with this platform or connect your wallet.
                    </span>
                </div>
            )}
            {/* Dynamic Hero Section */}
            <div className="relative bg-slate-50 overflow-hidden pt-28 pb-24 border-b border-gray-100">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 z-0"></div>
                {/* Decorative Blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>

                <div className="container-custom relative z-10">
                    <Breadcrumb items={breadcrumbItems} className="mb-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* Logo and Main Info */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col md:flex-row items-start gap-6 mb-8"
                            >
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    src={(() => {
                                        try {
                                            const domain = new URL(website.url).hostname.replace('www.', '');
                                            return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(website.name)}&size=128&background=0D6EFD&color=fff&bold=true`;
                                        } catch (e) {
                                            return `https://ui-avatars.com/api/?name=${encodeURIComponent(website.name)}&size=128&background=0D6EFD&color=fff&bold=true`;
                                        }
                                    })()}
                                    alt={website.name}
                                    className="w-32 h-32 rounded-3xl object-contain bg-white p-2 shadow-2xl border-4 border-white"
                                />
                                <div className="flex-1">
                                    <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-3">{website.name}</h1>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {website.featured && (
                                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-current" /> Featured
                                            </span>
                                        )}
                                        <Badge variant="category" className="text-sm px-3 py-1">{website.category}</Badge>
                                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm font-medium text-text-muted shadow-sm">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-text-main">
                                                {website.trustScore ? website.trustScore.toFixed(1) : '0.0'}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>
                                                {website.reviewCount || 0} {website.reviewCount === 1 ? 'review' : 'reviews'}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm font-medium text-text-muted shadow-sm">
                                            <Shield className="w-4 h-4 text-green-500" /> Verified
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm font-medium text-text-muted shadow-sm">
                                            <Eye className="w-4 h-4 text-blue-500" /> {website.views?.toLocaleString() || website.views} views
                                        </span>
                                    </div>
                                    <p className="text-xl text-text-muted leading-relaxed">{website.shortDescription}</p>
                                </div>
                            </motion.div>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => setShowExternalModal(true)}
                                    className="shadow-premium shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
                                >
                                    Visit Website <ExternalLink className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className={`bg-white border hover:bg-gray-50 hover:text-gray-900 border-gray-200 ${isBookmarked(website.id) ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100' : ''}`}
                                    onClick={() => toggleBookmark(website)}
                                >
                                    <Heart className={`w-5 h-5 mr-2 ${isBookmarked(website.id) ? 'fill-current' : ''}`} />
                                    {isBookmarked(website.id) ? 'Saved' : 'Save'}
                                </Button>
                                <Button variant="ghost" size="lg" className="bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                                    <Share2 className="w-5 h-5 mr-2" /> Share
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 font-semibold"
                                    onClick={() => setShowScamModal(true)}
                                >
                                    ⚠️ Report Scam
                                </Button>
                            </div>
                        </div>

                        {/* Trust Score & Quick Stats Card */}
                        <div className="lg:col-span-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl p-6 shadow-premium border border-gray-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full"></div>

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div>
                                        <h3 className="font-bold text-lg text-text-main">Trust Score</h3>
                                        <p className="text-sm text-text-muted">Based on 4 checks</p>
                                    </div>
                                    <div className={`relative w-16 h-16 flex items-center justify-center font-bold text-xl ${trustColor}`}>
                                        {/* Simple SVG Gauge Ring */}
                                        <svg className="absolute w-full h-full transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-100" />
                                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="176" strokeDashoffset={176 - (176 * trustScore) / 100} className="transition-all duration-1000 ease-out" />
                                        </svg>
                                        {trustScore}
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium text-sm">Security Check</span>
                                        </div>
                                        <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-5 h-5 text-purple-500" />
                                            <span className="font-medium text-sm">Community Voted</span>
                                        </div>
                                        <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-orange-500" />
                                            <span className="font-medium text-sm">Traffic Analysis</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-600">High</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-12 -mt-12 relative z-20">
                {/* Tabs, rounded and floating */}
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 inline-flex mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-md'
                                : 'text-text-muted hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <Card className="border-t-4 border-t-primary">
                                    <h2 className="text-2xl font-bold mb-4">About the Platform</h2>
                                    <p className="text-text-muted leading-relaxed whitespace-pre-line">{website.longDescription}</p>
                                </Card>

                                {/* Pros & Cons - Hidden for now */}
                                {false && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Card className="bg-green-50/50 border-green-100">
                                            <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
                                                <div className="p-1 bg-green-200 rounded-full"><Check className="w-4 h-4 text-green-700" /></div>
                                                Pros
                                            </h3>
                                            <ul className="space-y-3">
                                                {website.pros.map((pro, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                        <span>{pro}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>

                                        <Card className="bg-red-50/50 border-red-100">
                                            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
                                                <div className="p-1 bg-red-200 rounded-full"><X className="w-4 h-4 text-red-700" /></div>
                                                Cons
                                            </h3>
                                            <ul className="space-y-3">
                                                {website.cons.map((con, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                                                        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                        <span>{con}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'features' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card>
                                    <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {Object.entries(website.features).map(([key, value]) => (
                                            <div key={key} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${value ? 'border-gray-100 bg-gray-50' : 'border-dashed border-gray-200 opacity-60'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${value ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                                    {value ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                                </div>
                                                <span className="font-bold text-text-main capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'details' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card>
                                    <h2 className="text-2xl font-bold mb-6">Platform Details</h2>
                                    <div className="divide-y divide-gray-100">
                                        {[
                                            { label: 'Founded', value: website.details.founded },
                                            { label: 'Headquarters', value: website.details.headquarters },
                                            { label: 'Supported Countries', value: website.details.supportedCountries },
                                            { label: 'Languages', value: website.details.languages.join(', ') },
                                            { label: 'Blockchains', value: website.details.blockchains.join(', ') },
                                            { label: 'Fees', value: website.details.fees, highlight: true }
                                        ].map((item, i) => (
                                            <div key={i} className="grid grid-cols-2 gap-4 py-4">
                                                <span className="text-text-muted font-medium">{item.label}</span>
                                                <span className={`font-bold ${item.highlight ? 'text-primary' : 'text-text-main'}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Reviews Component */}
                        <WebsiteReviews websiteId={website.slug} />
                    </div>

                    {/* Sidebar moved to bottom on mobile, sticky on desktop */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-primary" /> Quick Info
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                                        <span className="text-sm text-text-muted">Category</span>
                                        <Badge variant="category">{website.category}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                                        <span className="text-sm text-text-muted">Status</span>
                                        <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                                        <span className="text-sm text-text-muted">Added</span>
                                        <span className="text-sm font-medium">{website.dateAdded}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-muted">Last Updated</span>
                                        <span className="text-sm font-medium">{website.lastUpdated}</span>
                                    </div>
                                </div>
                            </Card>

                            {website.socialLinks && (website.socialLinks.twitter || website.socialLinks.telegram || website.socialLinks.discord || website.socialLinks.github) && (
                                <Card className="bg-white border border-gray-100">
                                    <h3 className="font-bold mb-4 flex items-center gap-2 text-text-main">
                                        🌐 Social Communities
                                    </h3>
                                    <div className="flex flex-col gap-2.5">
                                        {website.socialLinks.twitter && (
                                            <a href={website.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 hover:bg-black hover:border-black hover:text-white text-gray-700 font-semibold text-sm transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md">
                                                {/* X / Twitter icon */}
                                                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                                <span>Twitter / X</span>
                                                <svg className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        )}
                                        {website.socialLinks.telegram && (
                                            <a href={website.socialLinks.telegram} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-[#229ED9] hover:border-[#229ED9] hover:text-white text-[#229ED9] font-semibold text-sm transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md">
                                                {/* Telegram icon */}
                                                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                                </svg>
                                                <span>Telegram</span>
                                                <svg className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        )}
                                        {website.socialLinks.discord && (
                                            <a href={website.socialLinks.discord} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white text-[#5865F2] font-semibold text-sm transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md">
                                                {/* Discord icon */}
                                                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                                </svg>
                                                <span>Discord</span>
                                                <svg className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        )}
                                        {website.socialLinks.github && (
                                            <a href={website.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-900 hover:border-gray-900 hover:text-white text-gray-800 font-semibold text-sm transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md">
                                                {/* GitHub icon */}
                                                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                                                </svg>
                                                <span>GitHub</span>
                                                <svg className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            )}


                            {/* Similar Websites Widget */}
                            <div className="pt-6">
                                <h3 className="font-bold text-lg mb-4">Similar Platforms</h3>
                                <div className="space-y-4">
                                    {similarWebsites.map(site => (
                                        <Link key={site.id} to={`/website/${site.slug}`} className="block group">
                                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 transition-all hover:shadow-md hover:border-primary/30">
                                                <img
                                                    src={(() => {
                                                        try {
                                                            const domain = new URL(site.url).hostname.replace('www.', '');
                                                            return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=64&background=random`;
                                                        } catch (e) {
                                                            return `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=64&background=random`;
                                                        }
                                                    })()}
                                                    alt={site.name}
                                                    className="w-10 h-10 rounded-lg object-contain bg-white p-0.5"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-text-main truncate group-hover:text-primary transition-colors">{site.name}</h4>
                                                    <div className="flex items-center gap-1 text-xs text-text-muted">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                        {site.rating}
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* External Link Modal */}
            <Modal
                isOpen={showExternalModal}
                onClose={() => setShowExternalModal(false)}
                title="You're Leaving Crypto Suggest"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExternalLink className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-text-muted mb-6">
                        You are about to visit an external website. Crypto Suggest is not responsible for the content or security of external sites.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm mb-8 break-all border border-gray-200">
                        {website.url}
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setShowExternalModal(false)}>
                            Cancel
                        </Button>
                        <a href={website.url} target="_blank" rel="noopener noreferrer">
                            <Button>Continue to Website</Button>
                        </a>
                    </div>
                </div>
            </Modal>

            {/* Scam Report Modal */}
            <Modal
                isOpen={showScamModal}
                onClose={() => setShowScamModal(false)}
                title={`Report Scam: ${website.name}`}
            >
                {scamSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted!</h3>
                        <p className="text-text-muted">
                            Thank you. Our investigation team will review the transaction logs and report details within 24-48 hours.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleScamSubmit} className="space-y-4">
                        {!isConnected && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium rounded-xl mb-4">
                                ⚠️ You must sign in first to submit a report.
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-1">Scam Type *</label>
                            <select
                                required
                                value={scamFormData.scamType}
                                onChange={(e) => setScamFormData({ ...scamFormData, scamType: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:border-primary"
                            >
                                <option value="">Select a scam type</option>
                                <option value="Phishing Website">Phishing / Clone Website</option>
                                <option value="Rug Pull / Exploit">Rug Pull / Smart Contract Exploit</option>
                                <option value="Fake Tokens">Fake Tokens / Honey Pot</option>
                                <option value="Impersonation">Social Media Impersonation</option>
                                <option value="Other">Other Security Concern</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-1">Transaction Hash (optional)</label>
                            <input
                                type="text"
                                value={scamFormData.txHash}
                                onChange={(e) => setScamFormData({ ...scamFormData, txHash: e.target.value })}
                                placeholder="0x..."
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:border-primary font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-1">Evidence Link (optional)</label>
                            <input
                                type="url"
                                value={scamFormData.evidenceUrl}
                                onChange={(e) => setScamFormData({ ...scamFormData, evidenceUrl: e.target.value })}
                                placeholder="e.g., screenshot link or social post link"
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:border-primary text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-1">Detailed Description *</label>
                            <textarea
                                required
                                value={scamFormData.description}
                                onChange={(e) => setScamFormData({ ...scamFormData, description: e.target.value })}
                                placeholder="Please describe the scam details, how you interacted with the contract, and any funds lost..."
                                rows={4}
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
                            />
                        </div>
                        {scamError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                {scamError}
                            </div>
                        )}
                        <div className="flex gap-3 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowScamModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={scamSubmitting || !isConnected || !scamFormData.scamType || !scamFormData.description}
                                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/25 disabled:bg-gray-300 disabled:shadow-none"
                            >
                                {scamSubmitting ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </PageLayout>
    );
};

export default WebsiteDetail;
