import mongoose from 'mongoose';

const subscriptionPaymentSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    planId: {
        type: String,
        required: true,
        enum: ['starter', 'pro', 'enterprise']
    },
    planPrice: {
        type: Number,
        required: true
    },
    network: {
        type: String,
        required: true,
        enum: ['ERC20', 'TRC20']
    },
    txHash: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const SubscriptionPayment = mongoose.model('SubscriptionPayment', subscriptionPaymentSchema);
export default SubscriptionPayment;
