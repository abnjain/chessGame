const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateHash, compare } = require("../utils/bcrypt");
// const { isLoggedIn } = require("../middlewares/isLoggedIn");
const{ generateAccessToken, generateRefreshToken, verifyToken } = require("../utils/jwt");
const tokenBlacklist = require("../models/tokenBlacklist");
const dbgr = require("debug")("development:chessGame/userController");

module.exports = {
  register: async (req, res) => {
    const { userName, firstName, lastName, userImage, dob, age, email, password } = req.body;
    try {
      let user = await User.findOne({ userName });
      if (user) {
        req.flash('error', 'Username already exists. If it is yours, try logging in.');
        return res.redirect('/register');
      }

      user = await User.findOne({ email });
      if (user) {
        req.flash('error', 'User email already exists. If it is yours, try logging in.');
        return res.redirect('/register');
      }

      const hashedPassword = await generateHash(password);

      user = new User({ userName, firstName, lastName, userImage, dob, age, email, password: hashedPassword });
      await user.save();

      dbgr(`User registered: ${user.email}`);
      req.flash("success", "Registration successful. You can now log in.");
      res.status(201).render("login");
    } catch (error) {
      console.error("Error during registration:", error.message, error);
      req.flash("error", "Internal Server Error");
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    const { identifier, userName, email, password } = req.body;
    try {
      let user;
      if (identifier) {
            user = await User.findOne({ $or: [{ email: identifier }, { userName: identifier }] });
            if (!user) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/login');
            }
      } else {
          user = await User.findOne({ email }) || await User.findOne({ userName });
          if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
         }
      }
      
      compare (password, user.password);
      // await tokenBlacklist.deleteMany({ userId: user._id });

      if (user.isLoggedIn && user.refreshToken) {
        req.flash('error', 'You are already logged in. Logout first.');
        return res.redirect('/login');
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
        
      user.refreshToken = refreshToken;
      await user.save();

      // Set user ID in session
      req.session.userId = user._id;

      dbgr(`User logged in: ${user.email}`);
      res.cookie('token', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });
      req.flash('success', 'Login successful');
      res.render('game', { userName: user.userName });
    } catch (error) {
      console.error("Error during login:", error.message, error);
      req.flash('error', 'Internal Server Error');
      return res.redirect('/login');
    }
  },

  logout: async (req, res) => {
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    try {
        // Verify the access token to get the user's ID
        const decoded = verifyToken(accessToken);
        const userId = decoded.id;

        // Find the user in the database using the ID
        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/login");
        }

        // Blacklist the access token
        await tokenBlacklist.create({ token: accessToken });

        dbgr(`User logged out: ${user.email}`);

        // Clear cookies
        res.clearCookie("token");
        res.clearCookie("refreshToken");

        // Set flash message and redirect
        req.flash("success", "User Logout successful");
        return res.redirect("/login");
    } catch (error) {
        console.error("Error during logout:", error.message, error);
        req.flash("error", "Internal Server Error");
        return res.redirect("/login");
    }
  }
};