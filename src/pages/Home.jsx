import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Search, Shield, TrendingUp, Users, ArrowRight, Check, Star, Zap, Globe, Lock, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import WebsiteCard from '../components/website/WebsiteCard';
import { mockTestimonials } from '../data/mockData';
import { getCategories, getWebsites } from '../services/api';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featuredWebsites, setFeaturedWebsites] = useState([]);
    const [scamWebsites, setScamWebsites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const cats = await getCategories();
                const sites = await getWebsites({ featured: true, limit: 6 });
                setCategories(cats);
                setFeaturedWebsites(sites);

                const allSites = await getWebsites({ verifiedOnly: 'false' });
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
                <section className="relative min-h-screen flex items-center py-24 sm:py-28 lg:py-0 overflow-hidden bg-[#FAFBFF]">
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
                                    Build on
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                        Verified Crypto
                                    </span>
                                    <br />
                                    Protocols
                                </h1>

                                {/* Subheadline */}
                                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg animate-fade-in-up delay-200">
                                    Discover manually verified Exchanges, Wallets, and DeFi protocols.
                                    <span className="block mt-2">No scams. Just trusted platforms.</span>
                                </p>

                                {/* Search Bar - Left Aligned */}
                                <div className="w-full max-w-lg mt-6 sm:mt-8 animate-fade-in-up delay-300">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition"></div>
                                        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-1.5 sm:p-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                                            <div className="flex items-center flex-1 min-w-0">
                                                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-3 sm:ml-4 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Search protocols..."
                                                    className="w-full h-12 sm:h-14 pl-3 sm:pl-4 pr-3 sm:pr-4 rounded-lg sm:rounded-xl text-base sm:text-lg text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            window.location.href = `/browse?search=${encodeURIComponent(e.target.value)}`;
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    const input = e.currentTarget.previousElementSibling.querySelector('input');
                                                    window.location.href = `/browse?search=${encodeURIComponent(input.value)}`;
                                                }}
                                                className="min-h-[48px] sm:h-12 px-6 sm:px-8 bg-gray-900 text-white font-bold rounded-lg sm:rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                                            >
                                                Explore <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Metrics */}
                                <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-2 sm:pt-4 animate-fade-in-up delay-400">
                                    <div className="flex -space-x-3 sm:-space-x-4">
                                        {[
                                            'https://randomuser.me/api/portraits/women/44.jpg',
                                            'https://randomuser.me/api/portraits/men/32.jpg',
                                            'https://randomuser.me/api/portraits/women/68.jpg',
                                        ].map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                alt={`User ${i + 1}`}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm object-cover"
                                            />
                                        ))}
                                        {/* +49K overflow indicator */}
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white flex items-center justify-center shadow-sm">
                                            <span className="text-[8px] sm:text-[9px] font-black text-white leading-none">+49K</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-base sm:text-lg">50,000+</p>
                                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Monthly Users</p>
                                    </div>
                                    <div className="w-px h-8 sm:h-10 bg-gray-200 hidden xs:block"></div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-base sm:text-lg">500+</p>
                                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Verified Apps</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: 3D Visual */}
                            <div className="relative flex items-center justify-center lg:p-8 xl:p-10 h-full order-first lg:order-last">
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
                            {categories.filter(cat => cat.featured).map((category, index) => {
                                const gradient = getGradient(index);
                                return (
                                    <Link key={category._id || category.slug} to={`/category/${category.slug}`} className="group">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/60 h-full relative overflow-hidden hover:bg-white/90">
                                            {/* Decorative gradient corner */}
                                            <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20`}></div>

                                            {/* Subtle shine effect on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
                                                <img 
                                                    src={`https://www.google.com/s2/favicons?domain=${category.brandDomain}&sz=128`}
                                                    alt={category.name}
                                                    className="w-7 h-7 sm:w-9 sm:h-9 object-contain bg-white rounded-lg p-1 shadow-sm"
                                                />
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

                {/* Featured Websites - White BG */}
                <section className="py-24 bg-white">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl font-bold text-text-main mb-2">Featured Websites</h2>
                                <p className="text-xl text-text-muted">Handpicked verified crypto platforms for you</p>
                            </div>
                            <Link to="/browse">
                                <Button variant="outline" className="hidden md:flex">View All</Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredWebsites.map(website => (
                                <WebsiteCard key={website.id} website={website} viewMode="grid" />
                            ))}
                        </div>

                        <Link to="/browse" className="md:hidden mt-8 block">
                            <Button variant="outline" className="w-full">View All</Button>
                        </Link>
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

                            <div className="max-w-lg mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 mb-10">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all font-medium"
                                    />
                                    <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                                        Subscribe
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-blue-200 font-medium">
                                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /> No Spam, ever</div>
                                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /> Unsubscribe anytime</div>
                                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-400" /> Weekly Updates</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Partner Program Section */}
                <section className="py-24 bg-gradient-to-b from-white to-[#FAFBFF] border-t border-gray-100">
                    <div className="container-custom">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <Badge variant="category" className="bg-indigo-100 text-indigo-600 border-indigo-200 mb-4 px-4 py-1.5">Affiliate & Partner Program</Badge>
                            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight">
                                Invite Partners &amp; Earn Up To 30% Commission
                            </h2>
                            <p className="text-lg text-gray-600 mt-4">
                                Our Partner Ranking System rewards you dynamically. Share your referral link with other crypto project developers and secure recurring monthly payouts.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left: Table mockup matching user's image exactly */}
                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" /> Partner Ranking Tiers
                                </h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                <th className="py-3 px-2 font-black">Partner Rank</th>
                                                <th className="py-3 px-2 font-black text-center">Total Referrals</th>
                                                <th className="py-3 px-2 font-black text-right">Commission</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { rank: 'Bronze', range: '1–9', commission: '15%', color: 'bg-amber-700/60' },
                                                { rank: 'Silver', range: '10–24', commission: '20%', color: 'bg-slate-400' },
                                                { rank: 'Gold', range: '25–49', commission: '25%', color: 'bg-amber-400' },
                                                { rank: 'Platinum', range: '50+', commission: '30%', color: 'bg-purple-500 animate-pulse' }
                                            ].map((tier, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-bold text-gray-800 flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${tier.color}`} />
                                                        {tier.rank}
                                                    </td>
                                                    <td className="py-4 px-2 text-center font-bold text-gray-600">{tier.range}</td>
                                                    <td className="py-4 px-2 text-right font-black text-indigo-600">{tier.commission}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right: Info cards & CTAs */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <LucideIcons.Share2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">1. Get your Invite Link</h4>
                                        <p className="text-sm text-gray-500 mt-1">Connect your wallet, access your dashboard, and generate your customized invitation link instantly.</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <LucideIcons.Gift className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">2. Share &amp; Rank Up</h4>
                                        <p className="text-sm text-gray-500 mt-1">Share on Twitter, Telegram, or blogs. Level up your rank from Bronze all the way to Platinum to boost your commission.</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <LucideIcons.Coins className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">3. Receive Monthly Commission</h4>
                                        <p className="text-sm text-gray-500 mt-1">Earn recurring commissions on their project subscription upgrades paid out monthly directly to your wallet.</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <Link to="/dashboard" className="flex-1 sm:flex-initial">
                                        <button className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary-dark hover:scale-[1.02] text-white font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 group">
                                            Join Partner Program <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
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
        </PageLayout>
    );
};

export default Home;
