import React, { useState, useEffect } from 'react';
import RatingDisplay from './RatingDisplay';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import WriteReviewButton from './WriteReviewButton';
import { getReviews, submitReview, deleteReview } from '../../services/api';

const WebsiteReviews = ({ websiteId }) => {
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [averageRating, setAverageRating] = useState(0);

    // Load reviews from backend
    const fetchReviews = async () => {
        try {
            const data = await getReviews(websiteId);
            setReviews(data);

            // Calculate average rating
            if (data.length > 0) {
                const sum = data.reduce((acc, review) => acc + review.rating, 0);
                setAverageRating(Math.round(sum / data.length));
            } else {
                setAverageRating(0);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [websiteId]);

    const handleSubmitReview = async (reviewDetails) => {
        try {
            await submitReview(websiteId, {
                walletAddress: reviewDetails.walletAddress,
                rating: reviewDetails.rating,
                text: reviewDetails.text,
                title: reviewDetails.title,
                screenshotUrl: reviewDetails.screenshotUrl
            });

            // Reload reviews from backend
            await fetchReviews();

            // Close form and show success
            setShowReviewForm(false);
            alert('✅ Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(`❌ Failed to submit review: ${error.message}`);
        }
    };

    const handleDeleteReview = async (id) => {
        if (window.confirm("Are you sure you want to delete your review?")) {
            try {
                await deleteReview(id);
                // Reload reviews from backend
                await fetchReviews();
                alert('✅ Review deleted successfully!');
            } catch (error) {
                console.error('Error deleting review:', error);
                alert(`❌ Failed to delete review: ${error.message}`);
            }
        }
    };

    return (
        <div className="py-16 bg-gray-50">
            <div className="container-custom">
                <div className="max-w-5xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-4">
                            Reviews & Ratings
                        </h2>
                        <p className="text-xl text-text-muted">
                            See what the community thinks about this platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Rating Display */}
                        <div className="lg:col-span-1">
                            <RatingDisplay rating={averageRating} totalReviews={reviews.length} />
                            <div className="mt-6">
                                <WriteReviewButton onClick={() => setShowReviewForm(true)} />
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-2">
                            <ReviewsList reviews={reviews} onDelete={handleDeleteReview} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <ReviewForm
                    websiteId={websiteId}
                    onClose={() => setShowReviewForm(false)}
                    onSubmit={handleSubmitReview}
                    reviews={reviews}
                />
            )}
        </div>
    );
};

export default WebsiteReviews;
