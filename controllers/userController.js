const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../models/tokenBlacklist");
const config = require("../config/development.json");
const dbgr = require("debug")("development:chessGame/userController");

module.exports = {
  register: async (req, res) => {
    const { userName, firstName, lastName, userImage, dob, age, email, password } = req.body;
    try {
      let user = await User.findOne({ userName });
      if (user) {
        return res.status(400).json({ error: "Username already exists. If yours, try logging in" });
      }

      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User email already exists. If yours, try logging in" });
      }

      user = new User({ userName, firstName, lastName, userImage, dob, age, email, password });
      await user.save();

      dbgr(`User registered: ${user.email}`);
      res.status(201).render("login");
    } catch (error) {
      console.error("Error during registration:", error.message, error);
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
            return res.status(400).json({ error: "Invalid credentials" });
        }
      } else {
        user = await User.findOne({ email });
        if (!user) {
          user = await User.findOne({ userName });
        }
        if (!user) {
          return res.status(400).json({ error: "Invalid credentials" });
        }
      } 
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      let accessToken, refreshToken;
      // await tokenBlacklist.deleteMany({ userId: user._id });
      if (accessToken && refreshToken) {
        res.status(400).render("login")
      } else (
        accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '15m' })
      )
      refreshToken = jwt.sign({ id: user._id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      
      user.refreshToken = refreshToken;
      await user.save();
      if (!user.isLoggedIn || !refreshToken  ) {
        user.isLoggedIn = true;
        await user.save();
      } else {
        res.status(400).render("login")
        return new Error ("Logout First");
      }
      dbgr(`User logged in: ${user.email}`);
      res.cookie('token', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });
      return res.render("game", { userName: user.userName });
    } catch (error) {
      console.error("Error during login:", error.message, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  logout: async (req, res) => {
      const accessToken = req.cookies.token;
      const refreshToken = req.cookies.refreshToken;
  
      try {
          // Decode the access token to get the user's ID
          const decoded = jwt.verify(accessToken, config.JWT_SECRET);
          const userId = decoded.id;
  
          // Find the user in the database using the ID
          const user = await User.findById(userId);
          if (!user) {
              return res.status(400).json({ error: "User not found" });
          }
  
          // Set isLoggedIn to false and save the user
          user.isLoggedIn = false;
          await user.save();
  
          // Blacklist the access token
          await tokenBlacklist.create({ token: accessToken });
  
          dbgr(`User logged out: ${user.email}`);
  
          // Clear cookies
          res.clearCookie('token');
          res.clearCookie('refreshToken');
          
          return res.status(200).redirect("/login");
      } catch (error) {
          console.error("Error during logout:", error.message, error);
          res.status(500).json({ error: "Internal Server Error" });
      }
  }
};