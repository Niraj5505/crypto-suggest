import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const projects = await Project.find();
        console.log(`TOTAL PROJECTS: ${projects.length}`);
        projects.forEach(p => {
            console.log(`Project: ${p.name}, Owner: ${p.walletAddress}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
