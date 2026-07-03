// Vercel Serverless Function entry point
// Wraps the Express app with a cached MongoDB connection

import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env — works both locally and on Vercel (Vercel injects env vars directly)
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// Cache the DB connection across warm serverless invocations
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('✅ MongoDB connected (serverless)');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
    }
}

// Import the Express app (no listen() called in production)
import app from '../server/index.js';

export default async function handler(req, res) {
    await connectDB();
    return app(req, res);
}
