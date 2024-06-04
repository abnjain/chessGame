const jwt = require('jsonwebtoken');
const config = require('../config/development.json');
// const dbgr = require('debug')('development:chessGame/authenticateToken');
const TokenBlacklist = require('../models/tokenBlacklist');

module.exports = authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication' });
    }

    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
        return res.status(401).json({ error: 'Token has been blacklisted' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
};

