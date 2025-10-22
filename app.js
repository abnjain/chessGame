//app.js
const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const dotenv = require("dotenv");
dotenv.config();
require("./config/mongoDB");
const { gameSocket } = require("./controllers/gameController");
const sharedSession = require("express-socket.io-session");
// const { secret } = require("./utils/crypto")

// routes
const userRouter = require("./routes/userRoute");
const gameRouter = require("./routes/gameRoute");

//development phase requirement
const dbgr = require("debug")("development:chessGame");
const { config } = require("./config/development");

//creating a server through http and converting it into express for the requirement of chess.js
const app = express();
const server = http.createServer(app);


//public and static folders setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
const sessionMiddleware = (session({
    secret: config.EXPRESS_SESSION_SECRET, // Change this to your own secret key
    resave: false,
    saveUninitialized: true
}));
app.use(sessionMiddleware);

gameSocket(server, sharedSession(sessionMiddleware, { autoSave: true }));

//parsing the form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Flash messages middleware
app.use(flash());

//get routes
app.get("/", (req, res) => {
    let error = req.flash("error");
    res.render("index", { title: "CHESS Game", error });
});
app.get("/register", (req, res) => {
    res.render("register", { title: "CHESS Game" });
});
app.get("/login", (req, res) => {
    res.render("login", { title: "CHESS Game" });
});

app.use("/auth", userRouter);
app.use("/game", gameRouter);

// dbgr(process.env.NODE_ENV);
// dbgr(process.env.GAMEPORT);

// Health check endpoint for Render or Docker
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render("404", { title: "404 - Page Not Found", message: "The page you are looking for doesn’t exist." });
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", { title: "500 - Server Error", message: "Something went wrong on our end. Please try again later.", error: process.env.NODE_ENV === "development" ? err : null });
});


const PORT = config.PORT || 3000;
server.listen(PORT, () => {
    console.log("====================================");
    console.log(`🟢 Server is running on port: ${PORT}`);
    console.log(`📂 Working directory: ${__dirname}`);
    console.log(`🌍 Environment: ${config.NODE_ENV || "development"}`);
    console.log(`🌍 MongoDB connected: ${config.MONGO_URI || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log("====================================");
    dbgr(`Server is running on port http://localhost:${config.PORT}`);
});
