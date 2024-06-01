//app.js
const express = require("express");
const http = require("http");
const path = require("path");
require("./config/mongoDB");
const { gameSocket } = require("./controllers/gameController");

// routes
const userRouter = require("./routes/userRoute");
const gameRouter = require("./routes/gameRoute")

//development phase requirement
const dbgr = require("debug")("development:chessGame");
const config = require("./config/development.json")

const app = express();
const server = http.createServer(app);

gameSocket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', userRouter);
app.use('/game', gameRouter);

// dbgr(process.env.NODE_ENV);
// dbgr(process.env.GAMEPORT);
server.listen(process.env.GAMEPORT, () => {
    dbgr(`Server is running on port ${config.GAME_URI}${process.env.GAMEPORT}`);
})