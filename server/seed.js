import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Website from './models/Website.js';
import Review from './models/Review.js';
import ScamReport from './models/ScamReport.js';

import { mockCategories } from '../src/data/mockCategories.js';
import { mockWebsites } from '../src/data/mockWebsites.js';
import { mockReviews } from '../src/data/mockReviews.js';

// Load env vars
dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing database collections
        console.log('🧹 Clearing existing collections...');
        await Category.deleteMany();
        await Website.deleteMany();
        await Review.deleteMany();
        await ScamReport.deleteMany();

        // Seed Categories
        console.log('🌱 Seeding Categories...');
        const categories = mockCategories.map(cat => {
            const { id, ...rest } = cat; // strip temporary ids if any
            return rest;
        });
        await Category.insertMany(categories);
        console.log(`✅ Seeded ${categories.length} Categories!`);

        // Seed Websites
        console.log('🌱 Seeding Websites...');
        const websites = mockWebsites.map(site => {
            const { id, ...rest } = site;
            // We can add dummy social links
            return {
                ...rest,
                socialLinks: {
                    twitter: `https://x.com/${site.slug}`,
                    telegram: `https://t.me/${site.slug}`,
                    discord: `https://discord.gg/${site.slug}`,
                    github: `https://github.com/${site.slug}`
                }
            };
        });
        await Website.insertMany(websites);
        console.log(`✅ Seeded ${websites.length} Websites!`);

        // Seed Reviews
        console.log('🌱 Seeding Reviews...');
        const reviews = mockReviews.map(rev => {
            const { id, ...rest } = rev;
            return rest;
        });
        await Review.insertMany(reviews);
        console.log(`✅ Seeded ${reviews.length} Reviews!`);

        console.log('🎉 Seeding successfully completed!');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Seeding Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

seedData();
