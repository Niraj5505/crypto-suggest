import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import RatingSlider from './RatingSlider';

const ReviewForm = ({ websiteId, onClose, onSubmit, reviews = [] }) => {
    const { isConnected, walletAddress, getTruncatedAddress } = useWallet();
    const [rating, setRating] = useState(75);
    const [reviewTitle, setReviewTitle] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MIN_LENGTH = 50;
    const MAX_LENGTH = 500;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!isConnected) {
            setError('Please connect your wallet to submit a review');
            return;
        }

        const alreadyReviewed = reviews.some(
            r => r.walletAddress && r.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
        if (alreadyReviewed) {
            setError('You have already reviewed this website');
            return;
        }

        if (reviewText.length < MIN_LENGTH) {
            setError(`Review must be at least ${MIN_LENGTH} characters (currently ${reviewText.length})`);
            return;
        }

        if (reviewText.length > MAX_LENGTH) {
            setError(`Review cannot exceed ${MAX_LENGTH} characters (currently ${reviewText.length})`);
            return;
        }

        // Submit review
        setIsSubmitting(true);

        try {
            await onSubmit({
                walletAddress,
                rating,
                text: reviewText,
                title: reviewTitle.trim() || undefined,
                screenshotUrl: screenshotUrl.trim() || undefined
            });
        } catch (err) {
            setError(err.message || 'Failed to submit review');
            setIsSubmitting(false);
        }
    };

    const characterCount = reviewText.length;
    const isValid = characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-text-main mb-3">Write Your Review</h2>
                    {isConnected && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-text-muted">Connected:</span>
                            <span className="font-mono font-semibold text-text-main">{getTruncatedAddress()}</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating Slider */}
                    <div>
                        <RatingSlider value={rating} onChange={setRating} />
                    </div>

                    {/* Review Title */}
                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                            Review Title <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="Summarize your experience (e.g. Great interface, fast transactions)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main"
                            maxLength={50}
                        />
                    </div>

                    {/* Screenshot URL */}
                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                            Evidence Screenshot URL <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            value={screenshotUrl}
                            onChange={(e) => setScreenshotUrl(e.target.value)}
                            placeholder="https://example.com/screenshot.png"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-text-main"
                        />
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience with this platform. What did you like? What could be improved?"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${error && !isValid
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-200 focus:border-primary'
                                }`}
                            rows={5}
                            maxLength={MAX_LENGTH}
                        />

                        {/* Character Count */}
                        <div className="flex items-center justify-between mt-2">
                            <div className={`text-sm ${characterCount < MIN_LENGTH
                                    ? 'text-red-500'
                                    : characterCount > MAX_LENGTH
                                        ? 'text-red-500'
                                        : 'text-green-600'
                                }`}>
                                {characterCount < MIN_LENGTH && (
                                    <span>{MIN_LENGTH - characterCount} more characters needed</span>
                                )}
                                {characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH && (
                                    <span>✓ Good length</span>
                                )}
                            </div>
                            <span className={`text-sm font-medium ${characterCount > MAX_LENGTH ? 'text-red-500' : 'text-text-muted'
                                }`}>
                                {characterCount}/{MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border-2 border-gray-300 text-text-main font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 ${isValid && !isSubmitting
                                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
