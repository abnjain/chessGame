//app.js
const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser"); 
require("./config/mongoDB");
const { gameSocket } = require("./controllers/gameController");

// routes
const userRouter = require("./routes/userRoute");
const gameRouter = require("./routes/gameRoute")

//development phase requirement
const dbgr = require("debug")("development:chessGame");
const config = require("./config/development.json");

//creating a server through http and converting it into express for the requirement of chess.js
const app = express();
const server = http.createServer(app);

gameSocket(server);

//public and static folders setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

//parsing the form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//get routes
app.get("/", (req, res) => {
    res.render("index", { title: "CHESS Game" })
});
app.get("/register", (req, res) => {
    res.render("register", { title: "CHESS Game" })
});
app.get("/login", (req, res) => {
    res.render("login", { title: "CHESS Game" })
});

app.use("/auth", userRouter);
app.use("/game", gameRouter);

// dbgr(process.env.NODE_ENV);
// dbgr(process.env.GAMEPORT);
server.listen(process.env.GAMEPORT, () => {
    dbgr(`Server is running on port http://localhost:${config.GAMEPORT}`);
});
