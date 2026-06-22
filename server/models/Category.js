import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    icon: {
        type: String,
        default: 'Globe'
    },
    description: {
        type: String,
        trim: true
    },
    websiteCount: {
        type: Number,
        default: 0
    },
    subCategories: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
