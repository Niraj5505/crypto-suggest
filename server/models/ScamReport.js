import mongoose from 'mongoose';

const scamReportSchema = new mongoose.Schema({
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
    scammerWalletAddress: {
        type: String,
        trim: true
    },
    scamType: {
        type: String,
        required: true,
        trim: true
    },
    txHash: {
        type: String,
        trim: true
    },
    evidenceUrl: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_investigation', 'confirmed', 'resolved'],
        default: 'pending'
    },
    timestamp: {
        type: Number,
        default: Date.now
    }
}, { timestamps: true });

const ScamReport = mongoose.model('ScamReport', scamReportSchema);
export default ScamReport;
