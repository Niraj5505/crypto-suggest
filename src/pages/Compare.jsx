import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, ArrowRight, Star, ExternalLink, Shield, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useCompare } from '../contexts/CompareContext';
import clsx from 'clsx';

const Compare = () => {
    const { selectedWebsites, removeFromCompare, clearCompare } = useCompare();
    const [highlightDiff, setHighlightDiff] = useState(false);

    if (selectedWebsites.length === 0) {
        return (
            <PageLayout>
                <div className="container-custom py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative"
                    >
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                        <ArrowRight className="w-12 h-12 text-blue-500" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Start Comparing</h1>
                    <p className="text-xl text-text-muted mb-10 max-w-lg mx-auto leading-relaxed">
                        Select up to 3 platforms from the browse page to see a detailed side-by-side comparison.
                    </p>
                    <Link to="/browse">
                        <Button size="lg" className="px-10 py-4 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Browse Platforms
                        </Button>
                    </Link>
                </div>
            </PageLayout>
        );
    }

    // Helper to check if a feature row matches across all selected
    const isDifferent = (key, type = 'feature') => {
        if (selectedWebsites.length < 2) return true;

        const first = type === 'feature'
            ? selectedWebsites[0].features[key]
            : selectedWebsites[0].details[key];

        return !selectedWebsites.every(site => {
            const val = type === 'feature' ? site.features[key] : site.details[key];
            return val === first;
        });
    };

    const featuresList = ['staking', 'mobileApp', 'api', 'support247', 'kycRequired', 'fiatSupport'];
    const detailsList = [
        { key: 'fees', label: 'Trading Fees' },
        { key: 'founded', label: 'Founded' },
        { key: 'headquarters', label: 'Headquarters' },
    ];

    return (
        <PageLayout>
            <div className="bg-slate-50 min-h-screen pb-20">
                <div className="container-custom py-12">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <h1 className="text-4xl font-black mb-3 text-gray-900 tracking-tight">Compare Platforms</h1>
                            <p className="text-lg text-text-muted font-medium">
                                Analyze <span className="text-primary font-bold">{selectedWebsites.length}</span> platforms side-by-side
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setHighlightDiff(!highlightDiff)}
                                className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-primary/50 transition-colors group"
                            >
                                <span className={`text-sm font-bold ${highlightDiff ? 'text-gray-900' : 'text-gray-500'}`}>Highlight Differences</span>
                                {highlightDiff
                                    ? <ToggleRight className="w-8 h-8 text-primary" />
                                    : <ToggleLeft className="w-8 h-8 text-gray-300 group-hover:text-gray-400" />
                                }
                            </button>
                            <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                            <Button variant="outline" onClick={clearCompare} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                                Clear All
                            </Button>
                            <Link to="/browse">
                                <Button className="bg-gray-900 hover:bg-black text-white">Add More</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="overflow-x-auto pb-12 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
                            <div className="min-w-[900px]">

                                {/* Sticky Header Row */}
                                <div className="grid grid-cols-4 gap-6 mb-8 sticky top-24 z-20 pt-4 pb-2">
                                    <div className="col-span-1 flex items-end pb-4 pl-2">
                                        <div>
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Platform</span>
                                            <span className="font-extrabold text-2xl text-gray-900">Overview</span>
                                        </div>
                                    </div>
                                    {selectedWebsites.map((site, index) => (
                                        <motion.div
                                            key={site.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="col-span-1 relative bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-200/60 shadow-xl"
                                        >
                                            <button
                                                onClick={() => removeFromCompare(site.id)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 rounded-full shadow-sm transition-all z-10"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                            <div className="flex flex-col items-center">
                                                <div className="relative mb-4 group">
                                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <img
                                                        src={(() => {
                                                            try {
                                                                const domain = new URL(site.url).hostname.replace('www.', '');
                                                                return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=80&background=random`;
                                                            } catch (e) {
                                                                return `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=80&background=random`;
                                                            }
                                                        })()}
                                                        alt={site.name}
                                                        className="w-20 h-20 rounded-2xl shadow-lg relative z-10 transform group-hover:scale-105 transition-transform duration-300 object-contain bg-white p-1"
                                                    />
                                                </div>
                                                <h3 className="text-xl font-bold text-center mb-1 text-gray-900">{site.name}</h3>
                                                <Badge variant="category" className="mb-4">{site.category}</Badge>

                                                <Link to={`/website/${site.slug}`} className="w-full">
                                                    <Button size="sm" variant="outline" className="w-full border-gray-200 hover:border-primary hover:text-primary transition-all">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {/* Empty Placeholders */}
                                    {[...Array(3 - selectedWebsites.length)].map((_, i) => (
                                        <div key={`empty-${i}`} className="col-span-1 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-white/30 backdrop-blur-sm self-stretch opacity-60">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <ArrowRight className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <Link to="/browse" className="text-sm font-bold text-primary hover:underline">Add Platform</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Comparison Sections */}
                                <div className="space-y-10">

                                    {/* Ratings Scorecard */}
                                    <section>
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 pl-2">
                                            <Star className="w-6 h-6 text-yellow-500 fill-current" /> Ratings & Performance
                                        </h3>
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                            {[
                                                { label: 'Overall Rating', getValue: s => s.rating, type: 'star' },
                                                { label: 'Trust Score', getValue: s => '98/100', type: 'score' }, // Mock score 
                                                { label: 'Review Count', getValue: s => s.reviewCount, type: 'number' }
                                            ].map((row, i) => (
                                                <div key={i} className="grid grid-cols-4 gap-6 p-5 border-b border-gray-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                                                    <div className="col-span-1 font-semibold text-gray-600 flex items-center">{row.label}</div>
                                                    {selectedWebsites.map(site => (
                                                        <div key={site.id} className="col-span-1 flex justify-center items-center font-bold text-lg text-gray-900">
                                                            {row.type === 'star' && <Star className="w-5 h-5 text-yellow-400 fill-current mr-1.5" />}
                                                            {row.type === 'score' && <Shield className="w-5 h-5 text-green-500 mr-1.5" />}
                                                            {row.getValue(site)}
                                                            {row.type === 'star' && <span className="text-sm text-gray-400 ml-1 font-normal">/5</span>}
                                                        </div>
                                                    ))}
                                                    {[...Array(3 - selectedWebsites.length)].map((_, idx) => <div key={idx} className="col-span-1"></div>)}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Features - The main comparison */}
                                    <section>
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 pl-2">
                                            <Check className="w-6 h-6 text-primary" /> Features & Capabilities
                                        </h3>
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                            {featuresList.map((key) => {
                                                const different = isDifferent(key, 'feature');
                                                if (highlightDiff && !different) return null;

                                                return (
                                                    <div key={key} className={`grid grid-cols-4 gap-6 p-5 border-b border-gray-100 last:border-0 transition-colors ${different && highlightDiff ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}>
                                                        <div className="col-span-1 flex items-center">
                                                            <span className="font-semibold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                            {different && highlightDiff && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>}
                                                        </div>
                                                        {selectedWebsites.map(site => (
                                                            <div key={site.id} className="col-span-1 flex justify-center">
                                                                {site.features[key] ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-1">
                                                                            <Check className="w-6 h-6" />
                                                                        </div>
                                                                        <span className="text-xs font-bold text-green-700">Available</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center opacity-40">
                                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
                                                                            <X className="w-6 h-6" />
                                                                        </div>
                                                                        <span className="text-xs font-bold text-gray-400">Not Available</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {[...Array(3 - selectedWebsites.length)].map((_, idx) => <div key={idx} className="col-span-1"></div>)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Platform Details */}
                                    <section>
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 pl-2">
                                            <ExternalLink className="w-6 h-6 text-purple-500" /> Trading & Company Info
                                        </h3>
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                            {detailsList.map((row) => {
                                                const different = isDifferent(row.key, 'detail');
                                                if (highlightDiff && !different) return null;

                                                return (
                                                    <div key={row.key} className={`grid grid-cols-4 gap-6 p-5 border-b border-gray-100 last:border-0 transition-colors ${different && highlightDiff ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}>
                                                        <div className="col-span-1 font-semibold text-gray-700 flex items-center">{row.label}</div>
                                                        {selectedWebsites.map(site => (
                                                            <div key={site.id} className="col-span-1 text-center font-medium text-gray-800 flex items-center justify-center">
                                                                {site.details[row.key]}
                                                            </div>
                                                        ))}
                                                        {[...Array(3 - selectedWebsites.length)].map((_, idx) => <div key={idx} className="col-span-1"></div>)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Compare;
