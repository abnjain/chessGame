const User = require("../models/userModel");
const { verifyToken } = require("../utils/jwt");

module.exports = async function (req, res, next) {
    if(!req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        let decoded = verifyToken(req.cookies.token);
        let user = await User.findOne({email: decoded.email}).select("-password");
        req.user = user; 
        next;
    } catch (error) {
        req.flash("error", "Something Went Wrong");
        res.redirect("/");
    }
}