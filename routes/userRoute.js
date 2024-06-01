const express = require("express");
const router = express.Router();
const { register, login, logout } = require ("../controllers/userController");
const authenticateUser = require('../middlewares/authenticateUser');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateUser, logout);

module.exports = router;