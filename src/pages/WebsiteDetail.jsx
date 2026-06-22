import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Share2, Check, X, Shield, Star, Award, TrendingUp, Info, Heart, AlertTriangle } from 'lucide-react';
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
                if (site) {
                    const similar = await getWebsites({ category: site.category });
                    setSimilarWebsites(similar.filter(w => w.id !== site.id).slice(0, 3));
                }
            } catch (error) {
                console.error("Error loading website detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWebsiteData();
    }, [slug]);

    const handleScamSubmit = async (e) => {
        e.preventDefault();
        setScamError('');
        setScamSubmitting(true);

        if (!isConnected) {
            setScamError('Please connect your wallet to submit a scam report.');
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
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(website.name)}&size=128&background=0D6EFD&color=fff&bold=true`}
                                    alt={website.name}
                                    className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-white"
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
                                            <Shield className="w-4 h-4 text-green-500" /> Verified
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
                                    <h3 className="font-bold mb-4 flex items-center gap-2">🌐 Social Communities</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {website.socialLinks.twitter && (
                                            <a href={website.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-xs font-bold text-gray-600 hover:text-blue-500 rounded-xl transition-all border border-gray-100">Twitter</a>
                                        )}
                                        {website.socialLinks.telegram && (
                                            <a href={website.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-xs font-bold text-gray-600 hover:text-blue-500 rounded-xl transition-all border border-gray-100">Telegram</a>
                                        )}
                                        {website.socialLinks.discord && (
                                            <a href={website.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-gray-600 hover:text-indigo-500 rounded-xl transition-all border border-gray-100">Discord</a>
                                        )}
                                        {website.socialLinks.github && (
                                            <a href={website.socialLinks.github} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-gray-600 hover:text-black rounded-xl transition-all border border-gray-100">GitHub</a>
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
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=64&background=random`}
                                                    alt={site.name}
                                                    className="w-10 h-10 rounded-lg"
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
                                ⚠️ You must connect your Web3 wallet first to verify your address as the reporter.
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
