import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Website from './models/Website.js';
import Review from './models/Review.js';
import ScamReport from './models/ScamReport.js';
import User from './models/User.js';
import Project from './models/Project.js';
import SubscriptionPayment from './models/SubscriptionPayment.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Load env variables FIRST — must be before any route or service call
dotenv.config();

// Diagnostic: confirm email creds are loaded
console.log(`📧 Email configured: ${process.env.EMAIL_USER ? '✅ ' + process.env.EMAIL_USER : '❌ NOT SET'}`);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB().then(async () => {
    console.log('🔄 Syncing website review stats...');
    try {
        const websites = await Website.find();
        await Promise.all(websites.map(async (w) => {
            const reviews = await Review.find({ websiteId: w.slug });
            const reviewCount = reviews.length;
            let newTrustScore = 0.0;
            if (reviewCount > 0) {
                const sumRatings = reviews.reduce((acc, rev) => acc + rev.rating, 0);
                newTrustScore = parseFloat(((sumRatings / reviewCount) / 20).toFixed(1));
            }
            if (w.reviewCount !== reviewCount || w.trustScore !== newTrustScore) {
                w.reviewCount = reviewCount;
                w.trustScore = newTrustScore;
                await w.save();
            }
        }));
        console.log('✅ Website review stats synced successfully!');
    } catch (err) {
        console.error('❌ Error syncing website review stats:', err);
    }
});

// API Routes

// @desc    Get all categories
// @route   GET /api/categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching categories', error: error.message });
    }
});

// @desc    Get all websites with search, filter, and sort
// @route   GET /api/websites
app.get('/api/websites', async (req, res) => {
    try {
        const { category, search, sortBy, featured, limit, verifiedOnly } = req.query;
        let query = {};

        // By default show only verified, unless verifiedOnly is specifically set to false
        if (verifiedOnly !== 'false') {
            query.verified = true;
        }

        // Filter by featured
        if (featured === 'true') {
            query.featured = true;
        }

        // Category Filter
        if (category) {
            // Flexible matching for category slug or name
            const categoryRegex = new RegExp(category.replace(/-/g, ' '), 'i');
            query.category = categoryRegex;
        }

        // Search Filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { shortDescription: searchRegex },
                { category: searchRegex }
            ];
        }

        let apiQuery = Website.find(query);

        // Sorting
        if (sortBy === 'popular') {
            apiQuery = apiQuery.sort({ reviewCount: -1 });
        } else if (sortBy === 'newest') {
            apiQuery = apiQuery.sort({ verifiedDate: -1 });
        } else if (sortBy === 'rating') {
            apiQuery = apiQuery.sort({ trustScore: -1 });
        } else if (sortBy === 'az') {
            apiQuery = apiQuery.sort({ name: 1 });
        } else {
            // Default sort by popular
            apiQuery = apiQuery.sort({ reviewCount: -1 });
        }

        // Limit
        if (limit) {
            apiQuery = apiQuery.limit(parseInt(limit));
        }

        const websites = await apiQuery;
        
        // Fetch all confirmed scam reports websiteIds in a single query
        const confirmedScams = await ScamReport.find({ status: 'confirmed' }).distinct('websiteId');
        const confirmedScamsSet = new Set(confirmedScams);

        const websitesWithScam = websites.map(w => ({
            ...w.toObject(),
            hasScamAlert: confirmedScamsSet.has(w.slug)
        }));

        res.json(websitesWithScam);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching websites', error: error.message });
    }
});

// @desc    Get a single website by slug
// @route   GET /api/websites/:slug
app.get('/api/websites/:slug', async (req, res) => {
    try {
        const website = await Website.findOne({ slug: req.params.slug });
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        
        // Dynamically add hasScamAlert flag
        const hasScam = await ScamReport.exists({ websiteId: req.params.slug, status: 'confirmed' });
        res.json({ ...website.toObject(), hasScamAlert: !!hasScam });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching website detail', error: error.message });
    }
});

// @desc    Submit a website for review
// @route   POST /api/websites/submit
app.post('/api/websites/submit', async (req, res) => {
    try {
        const { websiteName, websiteUrl, email, category, description, role } = req.body;

        if (!websiteName || !websiteUrl || !email || !category || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Clean website URL to strip any leading numbering list flags and enforce https if protocol missing
        let cleanWebsiteUrl = websiteUrl.trim();
        cleanWebsiteUrl = cleanWebsiteUrl.replace(/^[0-9]+[\.\)]\s*/, '');
        cleanWebsiteUrl = cleanWebsiteUrl.replace(/^\[[0-9]+\]\s*/, '');
        cleanWebsiteUrl = cleanWebsiteUrl.trim();
        if (!/^https?:\/\//i.test(cleanWebsiteUrl)) {
            cleanWebsiteUrl = `https://${cleanWebsiteUrl}`;
        }

        // Map frontend categories form names to DB names
        let dbCategory = category;
        if (category === 'exchange') dbCategory = 'Crypto Exchanges';
        else if (category === 'nft') dbCategory = 'NFT Marketplaces';
        else if (category === 'wallet') dbCategory = 'Crypto Wallets';
        else if (category === 'defi') dbCategory = 'DeFi Platforms';
        else if (category === 'other') dbCategory = 'Other';

        // Check if website already exists
        const slug = websiteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const websiteExists = await Website.findOne({ slug });

        if (websiteExists) {
            return res.status(400).json({ message: 'A website with this name already exists' });
        }

        const newWebsite = new Website({
            name: websiteName,
            slug,
            url: cleanWebsiteUrl,
            category: dbCategory,
            shortDescription: description.substring(0, 120),
            longDescription: description,
            verified: false, // requires admin approval
            featured: false,
            trustScore: 3.0,
            reviewCount: 0,
            pros: ['Submitted by user'],
            cons: [],
            socialLinks: {
                twitter: `https://x.com/${slug}`,
                telegram: `https://t.me/${slug}`,
                discord: '',
                github: ''
            }
        });

        const savedWebsite = await newWebsite.save();
        res.status(201).json({ success: true, website: savedWebsite });
    } catch (error) {
        res.status(500).json({ message: 'Server Error submitting website', error: error.message });
    }
});

// @desc    Get reviews for a website
// @route   GET /api/websites/:slug/reviews
app.get('/api/websites/:slug/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ websiteId: req.params.slug }).sort({ timestamp: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching reviews', error: error.message });
    }
});

// @desc    Submit a review for a website
// @route   POST /api/websites/:slug/reviews
app.post('/api/websites/:slug/reviews', async (req, res) => {
    try {
        const { walletAddress, rating, text, title, screenshotUrl } = req.body;
        const websiteId = req.params.slug;

        if (!walletAddress || rating === undefined || !text) {
            return res.status(400).json({ message: 'Please provide all required review fields' });
        }

        // Verify website exists
        const website = await Website.findOne({ slug: websiteId });
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({ websiteId, walletAddress });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this platform' });
        }

        const newReview = new Review({
            websiteId,
            walletAddress,
            rating,
            title,
            screenshotUrl,
            text,
            timestamp: Date.now(),
            verified: true,
            helpful: 0
        });

        const savedReview = await newReview.save();

        // Update Website review statistics (reviewCount and average trustScore)
        const reviews = await Review.find({ websiteId });
        const reviewCount = reviews.length;
        const sumRatings = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        
        // Scale 0-100 average back to 0-5 for website trustScore
        const newTrustScore = parseFloat(((sumRatings / reviewCount) / 20).toFixed(1));

        website.reviewCount = reviewCount;
        website.trustScore = newTrustScore;
        await website.save();

        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server Error submitting review', error: error.message });
    }
});

// @desc    Submit a scam report for a website
// @route   POST /api/websites/:slug/scam-report
app.post('/api/websites/:slug/scam-report', async (req, res) => {
    try {
        const { walletAddress, scammerWalletAddress, scamType, txHash, evidenceUrl, description } = req.body;
        const websiteId = req.params.slug;

        if (!walletAddress || !scamType || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Verify website exists
        const website = await Website.findOne({ slug: websiteId });
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        const newReport = new ScamReport({
            websiteId,
            walletAddress,
            scammerWalletAddress,
            scamType,
            txHash,
            evidenceUrl,
            description,
            status: 'pending',
            timestamp: Date.now()
        });

        const savedReport = await newReport.save();
        res.status(201).json({ success: true, report: savedReport });
    } catch (error) {
        res.status(500).json({ message: 'Server Error submitting scam report', error: error.message });
    }
});
// @desc    Get scam reports filed by a wallet address
// @route   GET /api/scam-reports/my-reports?walletAddress=0x...
app.get('/api/scam-reports/my-reports', async (req, res) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress) {
            return res.status(400).json({ message: 'walletAddress query param required' });
        }
        const reports = await ScamReport.find({ walletAddress }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching user scam reports', error: error.message });
    }
});

// @desc    Get rankings grouped by category
// @route   GET /api/rankings
app.get('/api/rankings', async (req, res) => {
    try {
        const topRated = await Website.find({ verified: true }).sort({ trustScore: -1 }).limit(10);
        const trending = await Website.find({ verified: true }).sort({ reviewCount: -1 }).limit(10);
        const mostReviewed = await Website.find({ verified: true }).sort({ reviewCount: -1 }).limit(10);
        const newListings = await Website.find({ verified: true }).sort({ verifiedDate: -1 }).limit(10);
        
        // Fetch all confirmed scam reports websiteIds in a single query
        const confirmedScams = await ScamReport.find({ status: 'confirmed' }).distinct('websiteId');
        const confirmedScamsSet = new Set(confirmedScams);
        
        const mapWithScam = (list) => {
            return list.map(w => ({
                ...w.toObject(),
                hasScamAlert: confirmedScamsSet.has(w.slug)
            }));
        };

        res.json({
            topRated: mapWithScam(topRated),
            trending: mapWithScam(trending),
            mostReviewed: mapWithScam(mostReviewed),
            newListings: mapWithScam(newListings)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching rankings', error: error.message });
    }
});

// Admin Panel Routes

// @desc    Get all websites (verified and unverified)
// @route   GET /api/admin/websites
app.get('/api/admin/websites', async (req, res) => {
    try {
        const websites = await Website.find().sort({ createdAt: -1 });
        res.json(websites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching admin websites', error: error.message });
    }
});

// @desc    Verify/Approve a website
// @route   PUT /api/admin/websites/:slug/verify
app.put('/api/admin/websites/:slug/verify', async (req, res) => {
    try {
        const website = await Website.findOne({ slug: req.params.slug });
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        website.verified = true;
        website.verifiedDate = new Date().toISOString().split('T')[0];
        await website.save();
        
        // Increment websiteCount in Category
        await Category.findOneAndUpdate(
            { name: website.category },
            { $inc: { websiteCount: 1 } }
        );

        res.json({ success: true, website });
    } catch (error) {
        res.status(500).json({ message: 'Server Error verifying website', error: error.message });
    }
});

// @desc    Reject/Delete a website
// @route   DELETE /api/admin/websites/:slug
app.delete('/api/admin/websites/:slug', async (req, res) => {
    try {
        const website = await Website.findOneAndDelete({ slug: req.params.slug });
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        // If it was verified, decrement category count
        if (website.verified) {
            await Category.findOneAndUpdate(
                { name: website.category },
                { $inc: { websiteCount: -1 } }
            );
        }
        res.json({ success: true, message: 'Website deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting website', error: error.message });
    }
});

// @desc    Get all scam reports
// @route   GET /api/admin/scam-reports
app.get('/api/admin/scam-reports', async (req, res) => {
    try {
        const reports = await ScamReport.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching scam reports', error: error.message });
    }
});

// @desc    Update scam report status
// @route   PUT /api/admin/scam-reports/:id/status
app.put('/api/admin/scam-reports/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const report = await ScamReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Scam report not found' });
        }
        report.status = status;
        await report.save();
        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating scam report status', error: error.message });
    }
});

// @desc    Get all reviews for moderation
// @route   GET /api/admin/reviews
app.get('/api/admin/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching admin reviews', error: error.message });
    }
});

// @desc    Delete a review (moderation or user delete)
// @route   DELETE /api/admin/reviews/:id
app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        // Recalculate website stats
        const websiteId = review.websiteId;
        const website = await Website.findOne({ slug: websiteId });
        if (website) {
            const reviews = await Review.find({ websiteId });
            const reviewCount = reviews.length;
            if (reviewCount > 0) {
                const sumRatings = reviews.reduce((acc, rev) => acc + rev.rating, 0);
                website.trustScore = parseFloat(((sumRatings / reviewCount) / 20).toFixed(1));
            } else {
                website.trustScore = 3.0; // default
            }
            website.reviewCount = reviewCount;
            await website.save();
        }
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting review', error: error.message });
    }
});


// =========================================================================
// User Profile & Project API Routes
// =========================================================================

const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

// @desc    Get user profile (creates if not exists)
// @route   GET /api/users/:walletAddress
app.get('/api/users/:walletAddress', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        let user = await User.findOne({ walletAddress });
        if (!user) {
            // Check for a referrer code
            const referrerAddress = req.query.ref ? req.query.ref.trim() : null;
            let referredBy = null;
            
            if (referrerAddress && referrerAddress.toLowerCase() !== walletAddress) {
                const referrer = await User.findOne({
                    $or: [
                        { referralCode: referrerAddress.toUpperCase() },
                        { walletAddress: referrerAddress.toLowerCase() },
                        { username: referrerAddress.toLowerCase() }
                    ]
                });
                if (referrer) {
                    referredBy = referrer.walletAddress;
                    referrer.referralCount = (referrer.referralCount || 0) + 1;
                    await referrer.save();
                }
            }
            
            const referralCode = generateReferralCode();
            user = new User({ 
                walletAddress,
                referredBy,
                referralCode
            });
            await user.save();
        } else if (!user.referralCode) {
            let referralCode = generateReferralCode();
            let codeExists = await User.exists({ referralCode });
            while (codeExists) {
                referralCode = generateReferralCode();
                codeExists = await User.exists({ referralCode });
            }
            user.referralCode = referralCode;
            await user.save();
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching user profile', error: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/:walletAddress
app.put('/api/users/:walletAddress', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        const { displayName, bio, location, website, twitter, github, linkedin, avatarEmoji, avatarBg } = req.body;
        
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = new User({ walletAddress });
        }
        
        if (displayName !== undefined) user.displayName = displayName;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (website !== undefined) user.website = website;
        if (twitter !== undefined) user.twitter = twitter;
        if (github !== undefined) user.github = github;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (avatarEmoji !== undefined) user.avatarEmoji = avatarEmoji;
        if (avatarBg !== undefined) user.avatarBg = avatarBg;
        
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating user profile', error: error.message });
    }
});

// @desc    Update user subscription (direct - admin bypass)
// @route   PUT /api/users/:walletAddress/subscription
app.put('/api/users/:walletAddress/subscription', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        const { planId, subscribedAt } = req.body;
        
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = new User({ walletAddress });
        }
        
        user.subscribedPlan = planId; // 'starter', 'pro', 'enterprise', or null
        user.subscribedAt = subscribedAt || (planId ? Date.now() : null);
        
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating user subscription', error: error.message });
    }
});

// @desc    Submit subscription payment for admin approval
// @route   POST /api/users/:walletAddress/subscription-payment
app.post('/api/users/:walletAddress/subscription-payment', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        const { planId, planPrice, network, txHash } = req.body;

        if (!planId || !planPrice || !network || !txHash) {
            return res.status(400).json({ message: 'planId, planPrice, network, and txHash are all required.' });
        }

        // Prevent duplicate txHash submissions
        const exists = await SubscriptionPayment.findOne({ txHash });
        if (exists) {
            return res.status(400).json({ message: 'This transaction hash has already been submitted.' });
        }

        const user = await User.findOne({ walletAddress });

        const payment = new SubscriptionPayment({
            walletAddress,
            userId: user?._id,
            username: user?.username,
            email: user?.email,
            planId,
            planPrice,
            network,
            txHash: txHash.trim(),
            status: 'pending'
        });

        await payment.save();
        res.status(201).json({ success: true, message: 'Payment submitted for admin review. Your plan will be activated shortly.', payment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error submitting payment', error: error.message });
    }
});

// @desc    Get pending subscription payments for a user
// @route   GET /api/users/:walletAddress/subscription-payment
app.get('/api/users/:walletAddress/subscription-payment', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        const payments = await SubscriptionPayment.find({ walletAddress }).sort({ createdAt: -1 }).limit(5);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching payment history', error: error.message });
    }
});

// @desc    Get all subscription payment requests (Admin)
// @route   GET /api/admin/subscription-payments
app.get('/api/admin/subscription-payments', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const payments = await SubscriptionPayment.find(filter).sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching subscription payments', error: error.message });
    }
});

// @desc    Approve or reject a subscription payment (Admin)
// @route   PUT /api/admin/subscription-payments/:id
app.put('/api/admin/subscription-payments/:id', async (req, res) => {
    try {
        const { action, adminNote } = req.body; // action: 'approve' | 'reject'
        const payment = await SubscriptionPayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        if (action === 'approve') {
            payment.status = 'approved';
            payment.reviewedAt = new Date();
            payment.adminNote = adminNote || '';

            // Activate the user's subscription
            const user = await User.findOne({ walletAddress: payment.walletAddress });
            if (user) {
                user.subscribedPlan = payment.planId;
                user.subscribedAt = Date.now();
                await user.save();
            }
        } else if (action === 'reject') {
            payment.status = 'rejected';
            payment.reviewedAt = new Date();
            payment.adminNote = adminNote || '';
        } else {
            return res.status(400).json({ message: 'action must be approve or reject' });
        }

        await payment.save();
        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error reviewing payment', error: error.message });
    }
});

// @desc    Get user reviews
// @route   GET /api/users/:walletAddress/reviews
app.get('/api/users/:walletAddress/reviews', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        
        // Find reviews by user
        const reviews = await Review.find({ walletAddress }).sort({ timestamp: -1 });
        
        // Find matching websites to get names/urls for logos
        const websiteIds = reviews.map(r => r.websiteId);
        const websites = await Website.find({ slug: { $in: websiteIds } });
        
        // Create a lookup map of website slug -> website details
        const websiteMap = {};
        websites.forEach(w => {
            websiteMap[w.slug] = {
                name: w.name,
                url: w.url,
                category: w.category
            };
        });
        
        // Combine them
        const reviewsWithWebsites = reviews.map(r => {
            const site = websiteMap[r.websiteId] || { name: r.websiteId, url: '', category: '' };
            return {
                ...r.toObject(),
                websiteName: site.name,
                websiteUrl: site.url,
                websiteCategory: site.category
            };
        });
        
        res.json(reviewsWithWebsites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching user reviews', error: error.message });
    }
});

// @desc    Get users referred by this wallet
// @route   GET /api/users/:walletAddress/referrals
app.get('/api/users/:walletAddress/referrals', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        const referrals = await User.find({ referredBy: walletAddress })
            .select('walletAddress createdAt subscribedPlan')
            .sort({ createdAt: -1 });
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching referrals', error: error.message });
    }
});

// @desc    Get user projects
// @route   GET /api/users/:walletAddress/projects
app.get('/api/users/:walletAddress/projects', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        const projects = await Project.find({ walletAddress }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching projects', error: error.message });
    }
});

// @desc    Add user project
// @route   POST /api/users/:walletAddress/projects
app.post('/api/users/:walletAddress/projects', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();
        
        // Block creation if user has no subscription
        const user = await User.findOne({ walletAddress });
        if (!user || !user.subscribedPlan) {
            return res.status(403).json({ message: 'Active subscription is required to add projects.' });
        }
        
        const { name, description, url, githubUrl, category, status, tags, gradient } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }
        
        const project = new Project({
            walletAddress,
            name,
            description,
            url,
            githubUrl,
            category,
            status,
            tags,
            gradient
        });
        
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error creating project', error: error.message });
    }
});

// @desc    Update user project
// @route   PUT /api/users/:walletAddress/projects/:projectId
app.put('/api/users/:walletAddress/projects/:projectId', async (req, res) => {
    try {
        const { name, description, url, githubUrl, category, status, tags, gradient } = req.body;
        
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (url !== undefined) project.url = url;
        if (githubUrl !== undefined) project.githubUrl = githubUrl;
        if (category !== undefined) project.category = category;
        if (status !== undefined) project.status = status;
        if (tags !== undefined) project.tags = tags;
        if (gradient !== undefined) project.gradient = gradient;
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating project', error: error.message });
    }
});

// @desc    Delete user project
// @route   DELETE /api/users/:walletAddress/projects/:projectId
app.delete('/api/users/:walletAddress/projects/:projectId', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting project', error: error.message });
    }
});

// Admin Panel extra routes

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching admin users', error: error.message });
    }
});

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/block
app.put('/api/admin/users/:id/block', async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBlocked = isBlocked;
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating user block status', error: error.message });
    }
});

// @desc    Toggle verify status of a user
// @route   PUT /api/admin/users/:id/verify
app.put('/api/admin/users/:id/verify', async (req, res) => {
    try {
        const { isVerified } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isVerified = isVerified;
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating user verify status', error: error.message });
    }
});

// @desc    Get all user projects (Admin)
// @route   GET /api/admin/projects
app.get('/api/admin/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching admin projects', error: error.message });
    }
});

// @desc    Create project (Admin)
// @route   POST /api/admin/projects
app.post('/api/admin/projects', async (req, res) => {
    try {
        const { walletAddress, name, description, url, githubUrl, category, status, tags, gradient } = req.body;
        if (!walletAddress || !name || !description) {
            return res.status(400).json({ message: 'Wallet address, name, and description are required' });
        }
        const project = new Project({
            walletAddress: walletAddress.toLowerCase(),
            name, description, url, githubUrl, category, status, tags, gradient
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error creating project', error: error.message });
    }
});

// @desc    Update project (Admin)
// @route   PUT /api/admin/projects/:id
app.put('/api/admin/projects/:id', async (req, res) => {
    try {
        const { walletAddress, name, description, url, githubUrl, category, status, tags, gradient } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        
        if (walletAddress !== undefined) project.walletAddress = walletAddress.toLowerCase();
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (url !== undefined) project.url = url;
        if (githubUrl !== undefined) project.githubUrl = githubUrl;
        if (category !== undefined) project.category = category;
        if (status !== undefined) project.status = status;
        if (tags !== undefined) project.tags = tags;
        if (gradient !== undefined) project.gradient = gradient;
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating project', error: error.message });
    }
});

// @desc    Delete project (Admin)
// @route   DELETE /api/admin/projects/:id
app.delete('/api/admin/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting project', error: error.message });
    }
});

// Helper to generate deterministic mock wallet address
const generateMockWallet = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const cleanHash = Math.abs(hash).toString(16).padEnd(40, 'f').slice(0, 40);
    return `0x${cleanHash}`;
};

// Middleware to authenticate JWT token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cryptosuggest_jwt_secret_key_123');
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, mobile, password, referrer } = req.body;

        if (!username || !email || !mobile || !password) {
            return res.status(400).json({ message: 'All registration fields (username, email, mobile, password) are required.' });
        }

        // Check if username, email or mobile already exists
        const userExists = await User.findOne({
            $or: [
                { username: username.toLowerCase().trim() },
                { email: email.toLowerCase().trim() },
                { mobile: mobile.trim() }
            ]
        });

        if (userExists) {
            if (userExists.username === username.toLowerCase().trim()) {
                return res.status(400).json({ message: 'Username is already taken.' });
            }
            if (userExists.email === email.toLowerCase().trim()) {
                return res.status(400).json({ message: 'Email is already registered.' });
            }
            if (userExists.mobile === mobile.trim()) {
                return res.status(400).json({ message: 'Mobile number is already registered.' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const walletAddress = generateMockWallet(username.toLowerCase().trim());

        // Generate unique referralCode
        let referralCode = generateReferralCode();
        let codeExists = await User.exists({ referralCode });
        while (codeExists) {
            referralCode = generateReferralCode();
            codeExists = await User.exists({ referralCode });
        }

        // Check for referredBy logic (referrals system)
        let referredBy = null;
        if (referrer) {
            const referrerAddress = referrer.trim();
            const referrerUser = await User.findOne({
                $or: [
                    { referralCode: referrerAddress.toUpperCase() },
                    { walletAddress: referrerAddress.toLowerCase() },
                    { username: referrerAddress.toLowerCase() },
                    { email: referrerAddress.toLowerCase() }
                ]
            });
            if (referrerUser && referrerUser.walletAddress !== walletAddress) {
                referredBy = referrerUser.walletAddress;
                referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
                await referrerUser.save();
            }
        }

        const newUser = new User({
            walletAddress,
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            password: hashedPassword,
            displayName: username,
            referredBy,
            referralCode
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, walletAddress: newUser.walletAddress, email: newUser.email },
            process.env.JWT_SECRET || 'cryptosuggest_jwt_secret_key_123',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser._id,
                walletAddress: newUser.walletAddress,
                username: newUser.username,
                email: newUser.email,
                mobile: newUser.mobile,
                displayName: newUser.displayName,
                referralCode: newUser.referralCode
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error registering user', error: error.message });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email, mobile, or username

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and password are required.' });
        }

        const trimmedIdentifier = identifier.trim().toLowerCase();

        // Find user by username, email, or mobile
        const user = await User.findOne({
            $or: [
                { username: trimmedIdentifier },
                { email: trimmedIdentifier },
                { mobile: identifier.trim() }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. User not found.' });
        }

        // Compare password
        if (!user.password) {
            return res.status(400).json({ message: 'Invalid credentials. Password is not set for this account.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, walletAddress: user.walletAddress, email: user.email },
            process.env.JWT_SECRET || 'cryptosuggest_jwt_secret_key_123',
            { expiresIn: '30d' }
        );

        // Ensure referralCode exists for legacy users logging in
        if (!user.referralCode) {
            let referralCode = generateReferralCode();
            let codeExists = await User.exists({ referralCode });
            while (codeExists) {
                referralCode = generateReferralCode();
                codeExists = await User.exists({ referralCode });
            }
            user.referralCode = referralCode;
            await user.save();
        }

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                displayName: user.displayName,
                subscribedPlan: user.subscribedPlan,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error logging in', error: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
app.get('/api/auth/profile', protect, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching user profile', error: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
app.put('/api/auth/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const { displayName, bio, location, website, twitter, github, linkedin, avatarEmoji, avatarBg } = req.body;
            if (displayName !== undefined) user.displayName = displayName;
            if (bio !== undefined) user.bio = bio;
            if (location !== undefined) user.location = location;
            if (website !== undefined) user.website = website;
            if (twitter !== undefined) user.twitter = twitter;
            if (github !== undefined) user.github = github;
            if (linkedin !== undefined) user.linkedin = linkedin;
            if (avatarEmoji !== undefined) user.avatarEmoji = avatarEmoji;
            if (avatarBg !== undefined) user.avatarBg = avatarBg;
            
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating user profile', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

// Only start listening when run directly (local dev), not when imported as serverless
if (process.env.NODE_ENV !== 'production' || process.argv[1]?.includes('index.js')) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in development mode on port ${PORT}`);
    });
}

export default app;
