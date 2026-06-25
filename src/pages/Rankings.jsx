import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, Calendar, Star, ArrowUpRight, Award, MessageSquare } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import { getRankings } from '../services/api';
import Badge from '../components/common/Badge';

const Rankings = () => {
    const [rankings, setRankings] = useState({ topRated: [], trending: [], mostReviewed: [], newListings: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('topRated'); // 'topRated' | 'trending' | 'mostReviewed' | 'newListings'

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            try {
                const data = await getRankings();
                setRankings(data);
            } catch (error) {
                console.error('Error fetching rankings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, []);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Rankings' }
    ];

    const getRankBadge = (index) => {
        if (index === 0) {
            return (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-md font-bold text-sm border-2 border-white">
                    🥇
                </div>
            );
        }
        if (index === 1) {
            return (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 flex items-center justify-center text-white shadow-md font-bold text-sm border-2 border-white">
                    🥈
                </div>
            );
        }
        if (index === 2) {
            return (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center text-white shadow-md font-bold text-sm border-2 border-white">
                    🥉
                </div>
            );
        }
        return (
            <span className="text-gray-400 font-bold text-sm pl-2">
                #{index + 1}
            </span>
        );
    };

    const getTrustColor = (score) => {
        const percentage = score * 20;
        if (percentage >= 85) return 'text-green-600 bg-green-50 border-green-100';
        if (percentage >= 70) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const getActiveList = () => {
        if (activeTab === 'topRated') return rankings.topRated;
        if (activeTab === 'trending') return rankings.trending;
        if (activeTab === 'mostReviewed') return rankings.mostReviewed;
        return rankings.newListings;
    };

    const currentList = getActiveList();

    return (
        <PageLayout>
            <div className="relative pb-20">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
                    <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl"></div>
                </div>

                <div className="container-custom relative z-10 pt-28 pb-12">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4 tracking-tight">
                            Protocol & Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Leaderboards</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl">
                            Compare platforms dynamically by community trust score, review popularity, and newest verification launches.
                        </p>
                    </div>

                    {/* Tabs navigation */}
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200/60 max-w-3xl mb-10 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('topRated')}
                            className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'topRated' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Trophy className={`w-5 h-5 ${activeTab === 'topRated' ? 'text-primary fill-primary/10' : ''}`} />
                            <span>Top Rated</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('trending')}
                            className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'trending' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Flame className={`w-5 h-5 ${activeTab === 'trending' ? 'text-primary fill-primary/10' : ''}`} />
                            <span>Trending</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('mostReviewed')}
                            className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'mostReviewed' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <MessageSquare className={`w-5 h-5 ${activeTab === 'mostReviewed' ? 'text-primary fill-primary/10' : ''}`} />
                            <span>Most Reviewed</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('newListings')}
                            className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'newListings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Calendar className={`w-5 h-5 ${activeTab === 'newListings' ? 'text-primary fill-primary/10' : ''}`} />
                            <span>New Listings</span>
                        </button>
                    </div>

                    {/* Table View */}
                    {loading ? (
                        <div className="bg-white rounded-3xl p-20 shadow-premium border border-gray-100 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-text-muted font-medium">Loading rankings...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-premium border border-gray-150 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                            <th className="py-5 px-6 w-20">Rank</th>
                                            <th className="py-5 px-6">Platform</th>
                                            <th className="py-5 px-6">Category</th>
                                            <th className="py-5 px-6 text-center">Trust Score</th>
                                            <th className="py-5 px-6 text-center">Reviews</th>
                                            <th className="py-5 px-6 text-center">Status</th>
                                            <th className="py-5 px-6 text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentList.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-20 text-gray-500 font-medium">
                                                    No platforms found in this listing.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentList.map((site, index) => {
                                                let domain = '';
                                                try {
                                                    domain = new URL(site.url).hostname.replace('www.', '');
                                                } catch (e) {}
                                                const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=96&background=0D6EFD&color=fff&bold=true`;
                                                return (
                                                    <tr key={site.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                                        {/* Rank */}
                                                        <td className="py-6 px-6 font-semibold text-text-main">
                                                            {getRankBadge(index)}
                                                        </td>

                                                        {/* Platform Info */}
                                                        <td className="py-6 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={logoUrl}
                                                                    alt={site.name}
                                                                    className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-sm flex-shrink-0"
                                                                />
                                                                <div>
                                                                    <Link to={`/website/${site.slug}`} className="font-bold text-text-main hover:text-primary transition-colors text-base block">
                                                                        {site.name}
                                                                    </Link>
                                                                    <span className="text-xs text-text-muted line-clamp-1 max-w-[200px] md:max-w-xs">{site.shortDescription}</span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Category */}
                                                        <td className="py-6 px-6">
                                                            <span className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 text-gray-600 rounded-lg text-xs font-semibold">
                                                                {site.category}
                                                            </span>
                                                        </td>

                                                        {/* Trust Score */}
                                                        <td className="py-6 px-6 text-center">
                                                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold shadow-sm select-none bg-white text-text-main border-slate-100">
                                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                                                <span>{site.rating?.toFixed(1) || site.trustScore?.toFixed(1) || '0.0'}</span>
                                                                <span className="text-gray-400 font-normal">/ 5.0</span>
                                                            </div>
                                                        </td>

                                                        {/* Reviews */}
                                                        <td className="py-6 px-6 text-center text-text-main font-semibold">
                                                            {site.reviewCount || 0}
                                                        </td>

                                                        {/* Status Banners */}
                                                        <td className="py-6 px-6 text-center">
                                                            <div className="flex flex-col gap-1 items-center">
                                                                {site.hasScamAlert ? (
                                                                    <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-full select-none animate-pulse">
                                                                        ⚠️ Scam Warning
                                                                    </span>
                                                                ) : site.verified ? (
                                                                    <span className="px-2.5 py-1 bg-green-50 border border-green-150 text-green-700 text-xs font-bold rounded-full select-none">
                                                                        ✓ Verified
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-150 text-yellow-700 text-xs font-bold rounded-full select-none">
                                                                        ⏳ Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Details link */}
                                                        <td className="py-6 px-6 text-right">
                                                            <Link
                                                                to={`/website/${site.slug}`}
                                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors py-2 px-4 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                                                            >
                                                                <span>View</span>
                                                                <ArrowUpRight className="w-4 h-4" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default Rankings;
