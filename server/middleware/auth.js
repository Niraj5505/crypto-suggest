import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No authentication token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        const secret = process.env.JWT_SECRET || 'cryptosuggest_secret_key_123';
        
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired, authorization denied' });
    }
};

export default auth;
