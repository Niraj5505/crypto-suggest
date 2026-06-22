import mongoose from 'mongoose';

const featuresSchema = new mongoose.Schema({
    mobileApp: { type: Boolean, default: false },
    kycRequired: { type: Boolean, default: false },
    fiatSupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    multiChain: { type: Boolean, default: false },
    openSource: { type: Boolean, default: false },
    twoFA: { type: Boolean, default: false },
    coldStorage: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false }
}, { _id: false });

const detailsSchema = new mongoose.Schema({
    founded: { type: Number },
    headquarters: { type: String },
    supportedCountries: { type: Number },
    languages: [{ type: String }],
    blockchains: [{ type: String }],
    fees: { type: String }
}, { _id: false });

const socialLinksSchema = new mongoose.Schema({
    twitter: { type: String, default: '' },
    telegram: { type: String, default: '' },
    discord: { type: String, default: '' },
    github: { type: String, default: '' }
}, { _id: false });

const websiteSchema = new mongoose.Schema({
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
    url: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategory: {
        type: String,
        trim: true
    },
    verified: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    verifiedDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    dateAdded: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    lastUpdated: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    longDescription: {
        type: String,
        trim: true
    },
    trustScore: {
        type: Number,
        default: 4.0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    features: {
        type: featuresSchema,
        default: () => ({})
    },
    details: {
        type: detailsSchema,
        default: () => ({})
    },
    socialLinks: {
        type: socialLinksSchema,
        default: () => ({})
    },
    pros: [{ type: String }],
    cons: [{ type: String }]
}, { timestamps: true });

const Website = mongoose.model('Website', websiteSchema);
export default Website;
