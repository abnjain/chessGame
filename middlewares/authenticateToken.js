// middlewares/authenticateToken.js
const jwt = require("jsonwebtoken");
const config = require("../config/development.json");
const dbgr = require("debug")("development:chessGame/authenticateToken");
const User = require("../models/userModel");

const authenticateToken = async (req, res, next) => {
    dbgr(req.cookies.token);
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({ error: "A token is required for authentication" });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;

        // Check if the user is still logged in
        const user = await User.findById(decoded.id);
        if (!user || user.isLoggedIn) {
            return res.status(401).json({ error: "Invalid Token" });
        }
    } catch (err) {
        return res.status(401).json({ error: "Invalid Token" });
    }
    return next();
};

module.exports = authenticateToken;
