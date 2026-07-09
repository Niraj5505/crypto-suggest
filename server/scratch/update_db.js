import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Website from '../models/Website.js';
import Project from '../models/Project.js';

// Setup Google DNS to avoid querySrv ECONNREFUSED
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: 'server/.env' });

const run = async () => {
    try {
        await connectDB();
        console.log('📡 Connected to MongoDB');

        // 1. Create or update MLM category
        const mlmCategory = await Category.findOneAndUpdate(
            { slug: 'mlm' },
            {
                name: 'MLM',
                slug: 'mlm',
                icon: 'Network',
                description: 'Multi-Level Marketing and network programs in crypto',
                featured: true,
                brandDomain: 'forsage.io'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Upserted MLM category:', mlmCategory);

        // 2. Remove old 'MLM Projects' category from Category collection if it exists
        const deleteOldCategory = await Category.deleteOne({ name: 'MLM Projects' });
        console.log('✅ Deleted old MLM Projects category if any:', deleteOldCategory);

        // 3. Update category for the 5 projects to 'MLM' and set rating to 4.3 (more than 4 stars)
        const targetProjects = ['gold4x', 'shagun', 'womup', 'cryptodxb', 'copytrade'];
        
        const updateWebsites = await Website.updateMany(
            { slug: { $in: targetProjects } },
            {
                $set: {
                    category: 'MLM',
                    trustScore: 4.3,
                    verified: true
                }
            }
        );
        console.log('✅ Updated Website records:', updateWebsites);

        const updateProjects = await Project.updateMany(
            { slug: { $in: targetProjects } },
            {
                $set: {
                    category: 'MLM'
                }
            }
        );
        console.log('✅ Updated Project records:', updateProjects);

        // Check the updated websites
        const updatedWebsites = await Website.find({ slug: { $in: targetProjects } });
        console.log('Updated Websites summary:');
        updatedWebsites.forEach(w => {
            console.log(`- Slug: ${w.slug}, Category: ${w.category}, TrustScore: ${w.trustScore}`);
        });

        // Also check if any other websites have 'MLM Projects' as category and update them to 'MLM'
        const cleanupWebsites = await Website.updateMany(
            { category: 'MLM Projects' },
            { $set: { category: 'MLM' } }
        );
        console.log('✅ Cleaned up old "MLM Projects" category on other websites:', cleanupWebsites);

        // Let's count websites in each category to update Category count
        const categories = await Category.find();
        for (const cat of categories) {
            const count = await Website.countDocuments({ category: cat.name });
            await Category.updateOne({ _id: cat._id }, { $set: { websiteCount: count } });
            console.log(`✅ Category "${cat.name}" count updated to ${count}`);
        }

        mongoose.connection.close();
        console.log('👋 Database connection closed');
    } catch (e) {
        console.error('❌ Error during database update:', e);
        process.exit(1);
    }
};

run();
