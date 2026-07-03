import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Star, ArrowRight, Layers, Heart } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useCompare } from '../../contexts/CompareContext';
import { useBookmark } from '../../contexts/BookmarkContext';

const WebsiteCard = ({ website, viewMode = 'grid', className = '' }) => {
    let domain = '';
    try {
        domain = new URL(website.url).hostname.replace('www.', '');
    } catch (e) {}
    const primaryLogo = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(website.name)}&size=128&background=0D6EFD&color=fff&bold=true`;

    const getCategoryColor = (category) => {
        // Simple hash to pick a color
        const colors = [
            'bg-blue-50 text-blue-600 border-blue-100',
            'bg-purple-50 text-purple-600 border-purple-100',
            'bg-indigo-50 text-indigo-600 border-indigo-100',
            'bg-pink-50 text-pink-600 border-pink-100',
            'bg-orange-50 text-orange-600 border-orange-100',
        ];
        return colors[category.length % colors.length];
    };

    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const { isBookmarked, toggleBookmark } = useBookmark();
    const isSelected = isInCompare(website.id);
    const bookmarked = isBookmarked(website.id);

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelected) {
            removeFromCompare(website.id);
        } else {
            addToCompare(website);
        }
    };

    const handleBookmarkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(website);
    };

    if (viewMode === 'list') {
        return (
            <div className={`bg-slate-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group ${className}`}>
                <img
                    src={primaryLogo || fallbackLogo}
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackLogo; }}
                    alt={website.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0 rounded-2xl object-contain bg-white p-1 shadow-lg group-hover:scale-105 transition-transform duration-300"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-text-main group-hover:text-primary transition-colors truncate">{website.name}</h3>
                            {website.featured && (
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm flex items-center gap-1 w-fit">
                                    <Star className="w-3 h-3 fill-current" /> Featured
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleBookmarkClick}
                                className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-red-50 transition-colors ${bookmarked ? 'text-red-500 bg-red-50' : 'text-gray-400'}`}
                                aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                            >
                                <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                            </button>
                            <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border ${getCategoryColor(website.category)}`}>
                                {website.category}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm sm:text-base text-text-muted mb-4 line-clamp-2">{website.shortDescription}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {website.features.mobileApp && <span className="text-xs px-2.5 py-1.5 bg-white text-gray-600 rounded-md font-medium border border-gray-200">📱 Mobile App</span>}
                        {!website.features.kycRequired && <span className="text-xs px-2.5 py-1.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-200">🔓 No KYC</span>}
                        {website.features.fiatSupport && <span className="text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-md font-medium border border-indigo-200">💳 Fiat</span>}
                    </div>

                    <div className="flex flex-col xs:flex-row gap-3">
                        <Link to={`/website/${website.slug}`} className="min-h-[44px] px-4 py-2.5 text-center rounded-lg hover:shadow-md bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all">
                            Details
                        </Link>
                        <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 font-medium"
                        >
                            Visit Site <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <Link to={`/website/${website.slug}`} className={`group block h-full bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
            <div className="p-4 sm:p-6 h-full flex flex-col relative">
                {/* Selection Overlay Effect */}
                {isSelected && (
                    <div className="absolute inset-0 border-2 border-primary rounded-2xl sm:rounded-3xl pointer-events-none z-10 bg-primary/5"></div>
                )}

                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <img
                            src={primaryLogo || fallbackLogo}
                            onError={(e) => { e.target.onerror = null; e.target.src = fallbackLogo; }}
                            alt={website.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-contain bg-white p-0.5 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-text-main group-hover:text-primary transition-colors truncate">{website.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-text-muted">
                                <span className="flex items-center gap-1 flex-shrink-0">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    {website.rating}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="flex-shrink-0">{website.reviewCount} reviews</span>
                                <span className="text-gray-300">•</span>
                                <span className="flex-shrink-0">{website.views?.toLocaleString() || website.views} views</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleBookmarkClick}
                        className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full hover:bg-red-50 transition-colors z-20 relative flex-shrink-0 ${bookmarked ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400'}`}
                        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                        <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <p className="text-text-muted text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow group-hover:text-text-main transition-colors">
                    {website.shortDescription}
                </p>

                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                    <Badge className={getCategoryColor(website.category)}>{website.category}</Badge>
                    {website.featured && (
                        <div className="relative">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm relative z-10">
                                Featured
                            </span>
                            <span className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCompareClick}
                        className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 border hover:bg-slate-100 hover:text-gray-900 text-xs sm:text-sm ${isSelected ? 'bg-primary/10 text-primary border-primary/30' : 'border-slate-200 text-text-muted'}`}
                    >
                        <Layers className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                        <span className="hidden xs:inline">{isSelected ? 'Added' : 'Compare'}</span>
                    </Button>
                    <Button size="sm" className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 group-hover:from-primary group-hover:to-accent transition-all duration-300 shadow-md group-hover:shadow-primary/30 text-xs sm:text-sm">
                        Details <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Link>
    );
};

export default WebsiteCard;
