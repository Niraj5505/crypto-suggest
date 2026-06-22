import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple users to have undefined/null walletAddress
        trim: true,
        lowercase: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // OTP fields for email verification
    emailOtp: {
        type: String
    },
    emailOtpExpires: {
        type: Date
    },
    // OTP fields for password reset
    resetOtp: {
        type: String
    },
    resetOtpExpires: {
        type: Date
    },
    profileImage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
