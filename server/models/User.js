import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    displayName: {
        type: String,
        trim: true,
        default: ''
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    website: {
        type: String,
        trim: true,
        default: ''
    },
    twitter: {
        type: String,
        trim: true,
        default: ''
    },
    github: {
        type: String,
        trim: true,
        default: ''
    },
    linkedin: {
        type: String,
        trim: true,
        default: ''
    },
    avatarEmoji: {
        type: String,
        default: '🦊'
    },
    avatarBg: {
        type: String,
        default: 'from-blue-500 to-indigo-600'
    },
    subscribedPlan: {
        type: String,
        default: null
    },
    subscribedAt: {
        type: Number,
        default: null
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
