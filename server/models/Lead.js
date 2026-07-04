import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    websiteSlug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    websiteName: {
        type: String,
        required: true
    },
    projectOwnerWallet: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    leadWalletAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    leadUsername: {
        type: String,
        default: ''
    },
    leadEmail: {
        type: String,
        default: ''
    },
    clickedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
