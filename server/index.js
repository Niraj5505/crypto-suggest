import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Website from './models/Website.js';
import Review from './models/Review.js';
import ScamReport from './models/ScamReport.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import auth from './middleware/auth.js';
import { generateOtp, sendVerificationOtpEmail, sendPasswordResetOtpEmail } from './utils/emailService.js';

// Load env variables FIRST — must be before any route or service call
dotenv.config();

// Diagnostic: confirm email creds are loaded
console.log(`📧 Email configured: ${process.env.EMAIL_USER ? '✅ ' + process.env.EMAIL_USER : '❌ NOT SET'}`);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

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
        
        // Dynamically add hasScamAlert flag from ScamReport collection
        const websitesWithScam = await Promise.all(websites.map(async w => {
            const hasScam = await ScamReport.exists({ websiteId: w.slug, status: 'confirmed' });
            return { ...w.toObject(), hasScamAlert: !!hasScam };
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
            url: websiteUrl,
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
        const { walletAddress, scamType, txHash, evidenceUrl, description } = req.body;
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
// @desc    Get rankings grouped by category
// @route   GET /api/rankings
app.get('/api/rankings', async (req, res) => {
    try {
        const topRated = await Website.find({ verified: true }).sort({ trustScore: -1 }).limit(10);
        const trending = await Website.find({ verified: true }).sort({ reviewCount: -1 }).limit(10);
        const newListings = await Website.find({ verified: true }).sort({ verifiedDate: -1 }).limit(10);
        
        const mapWithScam = async (list) => {
            return Promise.all(list.map(async w => {
                const hasScam = await ScamReport.exists({ websiteId: w.slug, status: 'confirmed' });
                return { ...w.toObject(), hasScamAlert: !!hasScam };
            }));
        };

        res.json({
            topRated: await mapWithScam(topRated),
            trending: await mapWithScam(trending),
            newListings: await mapWithScam(newListings)
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

// ==========================================
// Authentication System Routes (OTP-based)
// ==========================================

// @desc    Register a new user & send OTP to their email
// @route   POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // If user exists and is already verified, reject
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUser && !existingUser.isVerified) {
            // Resend OTP to existing unverified user
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.emailOtp = otp;
            existingUser.emailOtpExpires = otpExpires;
            await existingUser.save();
        } else {
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                emailOtp: otp,
                emailOtpExpires: otpExpires,
                isVerified: false
            });
            await newUser.save();
        }

        // Send OTP email
        await sendVerificationOtpEmail(email, name, otp);

        console.log(`[OTP] Verification OTP sent to: ${email} → ${otp}`);
        res.status(201).json({
            success: true,
            message: `Verification OTP sent to ${email}. Please check your inbox.`
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server Error during registration', error: error.message });
    }
});

// @desc    Verify OTP for email verification
// @route   POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email address' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'This account is already verified. Please log in.' });
        }
        if (!user.emailOtp || user.emailOtp !== otp.trim()) {
            return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
        }
        if (!user.emailOtpExpires || user.emailOtpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please register again to get a new code.' });
        }

        user.isVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during OTP verification', error: error.message });
    }
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        const otp = generateOtp();
        user.emailOtp = otp;
        user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendVerificationOtpEmail(email, user.name, otp);
        console.log(`[OTP] Resent verification OTP to: ${email} → ${otp}`);

        res.json({ success: true, message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during OTP resend', error: error.message });
    }
});

// @desc    Log in user
// @route   POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                message: 'Please verify your email first.',
                needsVerification: true,
                email: user.email
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'cryptosuggest_secret_key_123',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                walletAddress: user.walletAddress,
                profileImage: user.profileImage,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during login', error: error.message });
    }
});

// @desc    Request password reset OTP via email
// @route   POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please enter your email address' });
        }

        const user = await User.findOne({ email, isVerified: true });
        if (user) {
            const otp = generateOtp();
            user.resetOtp = otp;
            user.resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await user.save();
            await sendPasswordResetOtpEmail(email, user.name, otp);
            console.log(`[OTP] Password reset OTP sent to: ${email} → ${otp}`);
        }

        // Always return success to prevent account harvesting
        res.json({ success: true, message: 'If that email is registered, a reset OTP has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during password reset request', error: error.message });
    }
});

// @desc    Verify reset OTP and reset password
// @route   POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            email,
            resetOtp: otp.trim(),
            resetOtpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during password reset', error: error.message });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
app.get('/api/auth/profile', auth, async (req, res) => {
    res.json(req.user);
});

// @desc    Update user profile details / Link MetaMask wallet
// @route   PUT /api/auth/profile
app.put('/api/auth/profile', auth, async (req, res) => {
    try {
        const { name, profileImage, walletAddress } = req.body;
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (profileImage !== undefined) user.profileImage = profileImage;

        if (walletAddress !== undefined) {
            if (walletAddress) {
                const cleanAddress = walletAddress.toLowerCase();
                const otherUser = await User.findOne({ walletAddress: cleanAddress, _id: { $ne: user._id } });
                if (otherUser) {
                    return res.status(400).json({ message: 'This crypto wallet is already linked to another profile' });
                }
                user.walletAddress = cleanAddress;
            } else {
                user.walletAddress = undefined;
            }
        }

        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            walletAddress: user.walletAddress,
            profileImage: user.profileImage,
            isVerified: user.isVerified
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating profile', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in development mode on port ${PORT}`);
});
