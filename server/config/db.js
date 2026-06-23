import mongoose from 'mongoose';

let cached = global._mongooseCache;
if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, reuse the connection
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => {
            console.log(`📡 MongoDB Connected: ${m.connection.host}`);
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error(`❌ Database Connection Error: ${error.message}`);
        throw error;
    }
};

export default connectDB;
