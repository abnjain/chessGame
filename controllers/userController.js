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

      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1h" });

      dbgr(`User registered: ${user.email}`);
      res.status(201).json({ token, msg: "User Registered" });
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

      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1h" });
      user.isLoggedIn = true;
      await user.save();
      dbgr(`User logged in: ${user.email}`);
      res.cookie("token", token, { httpOnly: true });
      return res.redirect("/game");
    } catch (error) {
      console.error("Error during login:", error.message, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  logout: async (req, res) => {
    try {
      // Clear the authentication token from cookies
      res.clearCookie("token");

      // Log the user out by setting isLoggedIn to false
      const user = await User.findById(req.user.id);
      if (user) {
          user.isLoggedIn = false;
          await user.save();
      }
      dbgr(`User logged out: ${req.user.userName}`);
      return res.status(200).json({ msg: "User logged out successfully" });
  } catch (error) {
      console.error("Error during logout:", error.message, error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
  }
};