//gameRoute.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", authenticateToken, (req, res) => {
    res.render("game", { title: "CHESS Game" });
});

module.exports = router;
