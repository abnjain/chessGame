//gameRoute.js
const express = require("express");
const router = express.Router();
// const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", (req, res) => {
    const userName = req.session.userId ? req.session.userName : { userName: "Guest" };
    res.render("game", { title: "CHESS Game", userName });
});

module.exports = router;
