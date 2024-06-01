//gameRoute.js
const express = require("express");
const router = express.Router();
const { gameSocket } = require ("../controllers/gameController")

router.get ("/", (req, res) => {
    res.render("game", { title: "CHESS Game" });
});

module.exports = router;