import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        trim: true,
        default: ''
    },
    githubUrl: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        default: 'development'
    },
    tags: {
        type: [String],
        default: []
    },
    gradient: {
        type: String,
        default: 'from-blue-500 to-indigo-600'
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
