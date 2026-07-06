import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Search, Shield, TrendingUp, Users, ArrowRight, Check, Star, Zap, Globe, Lock, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import WebsiteCard from '../components/website/WebsiteCard';
import { mockTestimonials } from '../data/mockData';
import { getCategories, getWebsites, subscribeNewsletter } from '../services/api';
import { useWallet } from '../contexts/WalletContext';
import WalletConnectionModal from '../components/wallet/WalletConnectionModal';

const Home = () => {
    const { isConnected } = useWallet();
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalConfig, setAuthModalConfig] = useState({ initialTab: 'register', redirectPath: '/submit' });

    const openAuthModal = (initialTab = 'register', redirectPath = '/submit') => {
        setAuthModalConfig({ initialTab, redirectPath });
        setIsAuthModalOpen(true);
    };
    const [categories, setCategories] = useState([]);
    const [featuredWebsites, setFeaturedWebsites] = useState([]);
    const [scamWebsites, setScamWebsites] = useState([]);
    const [allWebsites, setAllWebsites] = useState([]);
    const [activeTab, setActiveTab] = useState('trending');
    const [loading, setLoading] = useState(true);

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterLoading, setNewsletterLoading] = useState(false);
    const [newsletterMsg, setNewsletterMsg] = useState('');
    const [newsletterError, setNewsletterError] = useState('');

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        setNewsletterLoading(true);
        setNewsletterMsg('');
        setNewsletterError('');
        try {
            const res = await subscribeNewsletter(newsletterEmail);
            setNewsletterMsg(res.message || 'Subscribed successfully!');
            setNewsletterEmail('');
        } catch (err) {
            setNewsletterError(err.message || 'Failed to subscribe.');
        } finally {
            setNewsletterLoading(false);
        }
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [cats, sites, allSites] = await Promise.all([
                    getCategories(),
                    getWebsites({ featured: true, limit: 6 }),
                    getWebsites({ verifiedOnly: 'false' })
                ]);
                setCategories(cats);
                setFeaturedWebsites(sites);
                setAllWebsites(allSites || []);
                const scams = allSites.filter(site => site.hasScamAlert);
                setScamWebsites(scams);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const getFilteredWebsites = () => {
        if (!allWebsites || allWebsites.length === 0) return [];
        let list = [...allWebsites];
        switch (activeTab) {
            case 'trending':
                return list.filter(w => w.category?.toLowerCase() === 'mlm').sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
            case 'new':
                return list.sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded)).slice(0, 6);
            case 'highest_rated':
                return list.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)).slice(0, 6);
            case 'most_secure':
                return list.filter(w => w.verified && !w.hasScamAlert).sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)).slice(0, 6);
            case 'recently_flagged':
                return list.filter(w => w.hasScamAlert).sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded)).slice(0, 6);
            case 'editors_choice':
                return list.filter(w => w.featured).slice(0, 6);
            case 'mlm':
                return list.filter(w => w.category?.toLowerCase() === 'mlm').slice(0, 6);
            default:
                return list.slice(0, 6);
        }
    };


    const trustFactors = [
        { icon: Shield, title: 'Manual Verification', description: 'Every website is manually reviewed before listing', color: 'bg-blue-100 text-blue-600' },
        { icon: Search, title: 'Scam Detection', description: 'Continuous monitoring and community reporting', color: 'bg-red-100 text-red-600' },
        { icon: TrendingUp, title: 'Regular Updates', description: 'Listings updated daily with latest information', color: 'bg-green-100 text-green-600' },
        { icon: Users, title: 'Community Driven', description: 'Powered by user reviews and feedback', color: 'bg-purple-100 text-purple-600' }
    ];

    const getGradient = (index) => {
        const gradients = [
            'from-blue-500 to-cyan-400',
            'from-purple-500 to-indigo-500',
            'from-pink-500 to-rose-500',
            'from-orange-500 to-yellow-500',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <PageLayout>
            <div className="overflow-hidden">
                {/* Hero Section - Split Screen Modern Layout */}
                <section className="relative min-h-0 lg:min-h-screen flex items-center pt-32 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAFBFF]">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-full sm:w-[60%] h-full bg-gradient-to-l from-blue-50/80 via-purple-50/50 to-transparent z-0"></div>
                    <div className="absolute -top-24 -right-24 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-gradient-to-tr from-cyan-100/30 to-blue-100/30 rounded-full blur-3xl opacity-50"></div>

                    <div className="container-custom relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center">

                            {/* Left Side: Content */}
                            <div className="space-y-6 sm:space-y-8 max-w-2xl pt-8 sm:pt-10 lg:pt-0">
                                {/* New Badge */}
                                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white p-1 pr-3 sm:pr-4 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-default animate-fade-in-up">
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wider">New</span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-600">The most trusted crypto directory</span>
                                </div>

                                {/* Main Headline */}
                                <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight animate-fade-in-up delay-100">
                                    Discover
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                        Verified Crypto
                                    </span>
                                    <br />
                                    Projects Before They Go Viral
                                </h1>

                                {/* Subheadline */}
                                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg animate-fade-in-up delay-200">
                                    Compare exchanges, wallets, DeFi, AI and Web3 projects with scam analysis, community ratings and expert reviews.
                                </p>

                                {/* Hero Actions Buttons - Left Aligned */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 sm:mt-8 animate-fade-in-up delay-300">
                                    <Link 
                                        to="/browse"
                                        className="h-14 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Explore Projects <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            if (isConnected) {
                                                navigate('/submit');
                                            } else {
                                                openAuthModal('register', '/submit');
                                            }
                                        }}
                                        className="h-14 px-8 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
                                    >
                                        List Your Project Free
                                    </button>
                                </div>

                                {/* Trust Metrics Checklist */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 pt-4 animate-fade-in-up delay-400 max-w-lg">
                                    {[
                                        '327 Verified Projects',
                                        '12,500 Registered Investors',
                                        '95 Scam Reports Published',
                                        '4.8 Average Rating',
                                        '18 Categories'
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-gray-700 font-semibold text-sm sm:text-base">
                                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200 font-extrabold text-[10px]">✓</span>
                                            <span>{stat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: 3D Visual */}
                            <div className="relative hidden lg:flex items-center justify-center lg:p-8 xl:p-10 h-full">
                                <div className="relative w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[600px] xl:max-w-[650px] animate-float-slow drop-shadow-2xl">
                                    <img
                                        src="/hero-home.png"
                                        alt="Trusted Crypto Platforms - Verified & Scam Protected"
                                        className="w-full h-auto object-contain rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Featured Websites - White BG */}
                <section className="py-24 bg-white">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl font-bold text-text-main mb-2">Featured Websites</h2>
                                <p className="text-xl text-text-muted">Handpicked verified crypto platforms for you</p>
                            </div>
                            <Link to="/browse">
                                <Button variant="outline" className="hidden md:flex">View All</Button>
                            </Link>
                        </div>

                        {/* Clean Text-based Tab Menu with Underline */}
                        <div className="flex items-center gap-6 sm:gap-8 border-b border-gray-150 mb-10 overflow-x-auto scrollbar-none pb-0.5">
                            {[
                                { id: 'trending', label: 'Trending Today' },
                                { id: 'new', label: 'New Listings' },
                                { id: 'highest_rated', label: 'Highest Rated' },
                                { id: 'most_secure', label: 'Most Secure' },
                                { id: 'recently_flagged', label: 'Recently Flagged' },
                                { id: 'editors_choice', label: 'Editor\'s Choice' },
                                { id: 'mlm', label: 'MLM Projects' }
                            ].map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-4 text-sm sm:text-base font-bold transition-all relative whitespace-nowrap ${
                                            isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {isActive && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                /* Skeleton Loaders */
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                                            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                                            <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                                        </div>
                                    </div>
                                ))
                            ) : getFilteredWebsites().length > 0 ? (
                                getFilteredWebsites().map(website => (
                                    <WebsiteCard key={website.id || website._id} website={website} viewMode="grid" />
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center bg-slate-50 border border-gray-200/80 rounded-2xl p-8">
                                    <p className="text-gray-400 font-semibold text-base">No projects match this filter right now.</p>
                                </div>
                            )}
                        </div>

                        <Link to="/browse" className="md:hidden mt-8 block">
                            <Button variant="outline" className="w-full">View All</Button>
                        </Link>
                    </div>
                </section>

                {/* Launch Special Promo Section */}
                <section className="py-12 sm:py-16 relative overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-40 bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-40 bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="container-custom relative z-10">
                        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 md:p-10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                            
                            <div className="flex-1 space-y-4 text-center lg:text-left z-10">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 rounded-full shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                    <span className="text-xs font-black uppercase tracking-wider">Launch Special 🚀</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                    First 50 Projects get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">FREE Premium Listing</span>
                                </h2>
                                
                                {/* Features list */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {[
                                        'FREE Premium Listing',
                                        'Homepage Feature',
                                        'SEO Backlink',
                                        'Verified Badge'
                                    ].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2 justify-center lg:justify-start text-gray-700 font-semibold text-sm">
                                            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 text-xs">✓</span>
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full lg:w-auto flex-shrink-0 justify-center">
                                {/* Value Badge */}
                                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl px-6 py-4 shadow-lg text-center transform hover:scale-105 transition-transform">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 font-mono">Worth</span>
                                    <span className="text-2xl font-black tracking-tight font-mono">$99</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full mt-1">100% Free</span>
                                </div>

                                {/* CTA Button */}
                                <button 
                                    onClick={() => {
                                        if (isConnected) {
                                            navigate('/submit');
                                        } else {
                                            openAuthModal('register', '/submit');
                                        }
                                    }}
                                    className="h-16 px-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 w-full sm:w-auto active:scale-95 animate-pulse-slow"
                                >
                                    Claim Free Listing →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Categories - Light Blue Gradient with Decorative Elements */}
                <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
                    {/* Multi-layered Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-cyan-100/30"></div>

                    {/* Decorative Floating Orbs */}
                    <div className="absolute top-10 left-[5%] w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-10 right-[10%] w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-full blur-3xl animate-float-slow"></div>
                    <div className="absolute top-1/2 left-[15%] w-40 sm:w-64 h-40 sm:h-64 bg-gradient-to-br from-cyan-300/10 to-blue-300/10 rounded-full blur-2xl"></div>

                    {/* Subtle Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}></div>

                    <div className="container-custom relative z-10">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 backdrop-blur-sm border border-blue-200/50 text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 shadow-sm">Discovery</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main mb-4 sm:mb-6 drop-shadow-sm">Browse by Category</h2>
                            <p className="text-base sm:text-lg lg:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed px-4">Explore verified crypto websites across all categories, styled for easy discovery.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {categories
                                .filter(cat => cat.featured)
                                .sort((a, b) => {
                                    if (a.slug === 'mlm') return -1;
                                    if (b.slug === 'mlm') return 1;
                                    return 0;
                                })
                                .map((category, index) => {
                                    const gradient = getGradient(index);
                                    return (
                                        <Link key={category._id || category.slug} to={`/category/${category.slug}`} className="group">
                                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/60 h-full relative overflow-hidden hover:bg-white/90">
                                                {/* Decorative gradient corner */}
                                                <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20`}></div>

                                                {/* Subtle shine effect on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
                                                    {category.icon && LucideIcons[category.icon] ? (
                                                        (() => {
                                                            const IconComponent = LucideIcons[category.icon];
                                                            return <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
                                                        })()
                                                    ) : (
                                                        <img 
                                                            src={`https://www.google.com/s2/favicons?domain=${category.brandDomain}&sz=128`}
                                                            alt={category.name}
                                                            className="w-7 h-7 sm:w-9 sm:h-9 object-contain bg-white rounded-lg p-1 shadow-sm"
                                                        />
                                                    )}
                                                </div>

                                            <h3 className="text-lg sm:text-xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors relative z-10">{category.name}</h3>
                                            <p className="text-sm sm:text-base text-text-muted font-medium mb-4 sm:mb-6 relative z-10">{category.websiteCount} Verified Apps</p>

                                            <div className="flex items-center text-xs sm:text-sm font-bold text-gray-400 group-hover:text-primary transition-colors relative z-10">
                                                Explore <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="text-center mt-8 sm:mt-12">
                            <Link to="/categories">
                                <button className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-primary/30 text-primary font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base">
                                    View All Categories
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Affiliate & Partner Program Section ── */}
                <section className="py-16 sm:py-24 relative overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                    {/* Subtle dot grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
                        backgroundSize: '28px 28px'
                    }} />

                    <div className="container-custom relative z-10">
                        {/* Section Header */}
                        <div className="text-center mb-12 sm:mb-16">
                            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 px-4 py-1.5 rounded-full mb-4">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Affiliate Program</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                                Invite Partners &amp; Earn Up To{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
                                    30% Commission
                                </span>
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Join our referral program and earn recurring commissions every time someone you refer subscribes to a plan on CryptoSuggest.
                            </p>
                        </div>

                        {/* How It Works Steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
                            {[
                                {
                                    step: '01',
                                    icon: '🔗',
                                    title: 'Get Your Referral Link',
                                    desc: 'Sign up and grab your unique referral link from your dashboard instantly.'
                                },
                                {
                                    step: '02',
                                    icon: '📢',
                                    title: 'Share & Invite',
                                    desc: 'Share your link on social media, blogs, communities, or with your network.'
                                },
                                {
                                    step: '03',
                                    icon: '💰',
                                    title: 'Earn 30% Commission',
                                    desc: 'Earn up to 30% recurring commission on every successful subscription referral.'
                                }
                            ].map((item, i) => (
                                <div key={i} className="relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 group shadow-sm hover:shadow-md">
                                    {/* Step number */}
                                    <div className="absolute top-4 right-4 text-xs font-black text-gray-300 font-mono">{item.step}</div>
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                                    <h3 className="text-gray-900 font-black text-base sm:text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Commission Highlights */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
                            {[
                                { value: '30%', label: 'Max Commission' },
                                { value: '∞', label: 'Recurring Earnings' },
                                { value: '$0', label: 'Cost to Join' },
                                { value: '24h', label: 'Payout Processing' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 text-center shadow-sm">
                                    <p className="text-2xl sm:text-3xl font-black text-indigo-600 mb-1">{stat.value}</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA Card */}
                        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-center overflow-hidden shadow-xl">
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                            }} />
                            <div className="relative z-10">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3">
                                    Ready to Start Earning?
                                </h3>
                                <p className="text-indigo-100 text-sm sm:text-base mb-6 max-w-xl mx-auto">
                                    Create your account to access your unique referral link and start earning commissions today.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Link
                                        to="/dashboard"
                                        className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Join Affiliate Program <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        className="h-12 px-8 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        View Dashboard
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>



                {/* Trust & Safety - Slate-50 BG */}
                <section className="py-24 bg-slate-50 relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                    <div className="container-custom relative z-10">
                        <div className="text-center mb-16">
                            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Safety First</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-6">Why Trust Crypto Suggest?</h2>
                            <p className="text-xl text-text-muted max-w-2xl mx-auto">We take verification seriously so you can explore with confidence.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trustFactors.map((factor, index) => (
                                <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${factor.color.replace('text', 'bg').replace('600', '100')}`}>
                                        <factor.icon className={`w-10 h-10 ${factor.color.split(' ')[1]}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-main mb-3">{factor.title}</h3>
                                    <p className="text-text-muted leading-relaxed">{factor.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Live Statistics Section */}
                <section className="py-16 bg-slate-50 text-text-main relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    
                    <div className="container-custom relative z-10">
                        <div className="text-center mb-12">
                            <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-2 block">Real-Time Data</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Live Platform Statistics</h2>
                            <p className="text-text-muted max-w-xl mx-auto font-medium">Verify our track record and community activity with live performance indicators.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
                            {[
                                { label: 'Projects Listed', count: 342, color: 'text-blue-600' },
                                { label: 'Users Online', count: 167, color: 'text-emerald-600', live: true },
                                { label: 'Projects Verified Today', count: 9, color: 'text-indigo-600' },
                                { label: 'Scam Reports', count: 118, color: 'text-red-600' },
                                { label: 'Countries Covered', count: 42, color: 'text-amber-600' }
                            ].map((stat, idx) => (
                                <div key={idx} className={`bg-white border border-gray-250 rounded-2xl p-6 text-center shadow-md relative overflow-hidden group hover:border-primary/30 transition-colors`}>
                                    {stat.live && (
                                        <span className="absolute top-3 right-3 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    )}
                                    <p className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                                    <p className={`text-3xl sm:text-4xl font-black ${stat.color} font-mono`}>{stat.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works - White BG */}
                <section className="py-24 bg-white">
                    <div className="container-custom">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-6">How It Works</h2>
                            <p className="text-xl text-text-muted max-w-2xl mx-auto">Find trusted crypto platforms in 3 simple steps</p>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 border-t-2 border-dashed border-gray-200 z-0"></div>

                            {[
                                { icon: Search, title: 'Browse Categories', desc: 'Explore 15+ categories including exchanges and DeFi', badgeBg: 'bg-blue-500', borderColor: 'border-blue-50', iconColor: 'text-blue-500' },
                                { icon: Zap, title: 'Compare', desc: 'Review key features, fees, and community ratings', badgeBg: 'bg-purple-500', borderColor: 'border-purple-50', iconColor: 'text-purple-500' },
                                { icon: Check, title: 'Select & Go', desc: 'Choose the best platform and visit securely', badgeBg: 'bg-green-500', borderColor: 'border-green-50', iconColor: 'text-green-500' }
                            ].map((step, idx) => (
                                <div key={idx} className="relative z-10 text-center group">
                                    <div className="relative inline-block mb-8">
                                        <div className={`w-24 h-24 bg-white rounded-2xl border-4 ${step.borderColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                                        </div>
                                        <div className={`absolute -top-4 -right-4 w-10 h-10 rounded-full ${step.badgeBg} text-white flex items-center justify-center font-bold text-xl border-4 border-white shadow-md`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-main mb-3">{step.title}</h3>
                                    <p className="text-text-muted px-4">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter Signup - Gradient BG */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-blue-900 z-0"></div>
                    {/* Noise Pattern Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

                    <div className="container-custom relative z-20 text-center text-white">
                        <div className="max-w-4xl mx-auto">
                            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-sm font-bold mb-6">Weekly Digest</span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Stay Ahead of the Curve</h2>
                            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                Get verified listings, security alerts, and crypto insights delivered straight to your inbox.
                            </p>
                            <form onSubmit={handleNewsletterSubmit} className="max-w-lg mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 mb-6">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={newsletterEmail}
                                        onChange={e => setNewsletterEmail(e.target.value)}
                                        disabled={newsletterLoading}
                                        placeholder="Enter your email address"
                                        className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all font-medium"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={newsletterLoading}
                                        className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center min-w-[120px]"
                                    >
                                        {newsletterLoading ? (
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </div>
                            </form>

                            {newsletterMsg && (
                                <p className="text-emerald-400 font-bold text-sm mb-10 animate-fade-in">{newsletterMsg}</p>
                            )}
                            {newsletterError && (
                                <p className="text-red-400 font-bold text-sm mb-10 animate-fade-in">{newsletterError}</p>
                            )}

                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-blue-200 font-medium">
                                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /> No Spam, ever</div>
                                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /> Unsubscribe anytime</div>
                                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /> Weekly Updates</div>
                            </div>
                        </div>
                    </div>
         
             </section>

                {/* For Website Owners CTA - White BG */}
                <section className="py-24 bg-white">
                    <div className="container-custom">
                        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                                <div>
                                    <Badge variant="category" className="bg-orange-100 text-orange-600 border-orange-200 mb-6 px-4 py-1.5">For Developers</Badge>
                                    <h2 className="text-4xl font-bold text-text-main mb-6 leading-tight">
                                        Build Trust with a <br /> Verified Listing
                                    </h2>
                                    <p className="text-xl text-text-muted mb-8 leading-relaxed">
                                        Join 500+ verified platforms. Get discovered by active users and showcase your commitment to security and transparency.
                                    </p>

                                    <div className="space-y-4 mb-10">
                                        {[
                                            'Boost your SEO and brand visibility',
                                            'Gain a "Verified" badge for your platform',
                                            'Access detailed user analytics'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-orange-600" />
                                                </div>
                                                <span className="font-semibold text-text-main">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link to="/submit">
                                        <button className="px-8 py-4 bg-text-main text-white font-bold rounded-xl shadow-xl hover:bg-black transition-all flex items-center gap-2 group">
                                            Submit Your Website <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl transform rotate-3 scale-[1.02] opacity-20 blur-lg"></div>
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative">
                                        <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                                            <div>
                                                <div className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Monthly Traffic</div>
                                                <div className="text-3xl font-bold">50,000+</div>
                                            </div>
                                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Conversion Rate</div>
                                                <div className="text-3xl font-bold">4.8%</div>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                                <Users className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <WalletConnectionModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialTab={authModalConfig.initialTab}
                redirectPath={authModalConfig.redirectPath}
            />
        </PageLayout>
    );
};

export default Home;
