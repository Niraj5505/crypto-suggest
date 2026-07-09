import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
    ipHash: {
        type: String,
        required: true,
        index: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    path: {
        type: String,
        default: '/'
    },
    visitedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);
export default Visitor;
