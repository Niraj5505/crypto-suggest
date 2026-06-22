import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    websiteId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    walletAddress: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    title: {
        type: String,
        trim: true
    },
    screenshotUrl: {
        type: String,
        trim: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Number,
        default: Date.now
    },
    verified: {
        type: Boolean,
        default: true
    },
    helpful: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure a user can only review a website once
reviewSchema.index({ websiteId: 1, walletAddress: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
