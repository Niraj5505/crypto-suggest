import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true
    },
    mobile: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    plainPassword: {
        type: String,
        default: ''
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
    },
    referralCode: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    referredBy: {
        type: String,
        lowercase: true,
        trim: true,
        default: null
    },
    referralCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
