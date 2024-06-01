const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/development.json")
const tokenBlacklist = require("../models/tokenBlacklist");

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

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      console.log(`User registered: ${user.email}`);
      res.status(201).json({ token, msg: "User Registered" });
    } catch (error) {
      console.error("Error during registration:", error.message, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    const { userName, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.findOne({ userName });
      }
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      console.log(`User logged in: ${user.email}`);
      res.json({ token, msg: "User Logged in" });
    } catch (error) {
      console.error("Error during login:", error.message, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  logout: async (req, res) => {
    const token = req.token;
    try {
      await tokenBlacklist.create({ token });
      console.log(`User logged out: ${req.user.email}`);
      res.status(200).json({ msg: "User Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error.message, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};