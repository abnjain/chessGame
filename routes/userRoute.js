const express = require('express');
const router = express.Router();
const { register, login, logout } = require("../controllers/userController");
const blacklistToken = require("../middlewares/blacklistToken");
const authenticateToken = require("../middlewares/authenticateToken");
const refreshTokenRouter = require('../controllers/refreshToken');

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, blacklistToken, logout);
// router.use("/refresh", refreshTokenRouter);

module.exports = router;
