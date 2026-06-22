import React, { useState } from 'react';
import ReviewCard from './ReviewCard';
import { ChevronDown } from 'lucide-react';

const ReviewsList = ({ reviews, onDelete }) => {
    const [sortBy, setSortBy] = useState('newest');
    const [showAll, setShowAll] = useState(false);

    // Sort reviews
    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.timestamp - a.timestamp;
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            default:
                return 0;
        }
    });

    // Show only first 3 reviews initially
    const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);

    if (reviews.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-bold text-text-main mb-2">No Reviews Yet</h3>
                <p className="text-text-muted">Be the first to review this platform!</p>
            </div>
        );
    }

    return (
        <div>
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-text-main">
                    {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none font-medium text-text-main"
                    >
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="space-y-6">
                {displayedReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onDelete={onDelete} />
                ))}
            </div>

            {/* Show More Button */}
            {reviews.length > 3 && !showAll && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => setShowAll(true)}
                        className="px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <span>Show All {reviews.length} Reviews</span>
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Show Less Button */}
            {showAll && reviews.length > 3 && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => setShowAll(false)}
                        className="px-8 py-4 bg-white border-2 border-gray-300 text-text-main font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                    >
                        Show Less
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
