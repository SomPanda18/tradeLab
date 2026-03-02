const jwt = require('jsonwebtoken');

// Verify JWT token and attach user ID to request
exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Get token from "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
