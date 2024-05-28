const express = require("express");
const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path");
const dbgr = require("debug")("development:chessGame");
const config = require("./config/development.json")

const app = express();
const server = http.createServer(app);

const io = socket(server);

const chess = new Chess();

let players = {};
let currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", {title: "CHESS Game"});
});

io.on("connection", (uniqueSocket) => {
    dbgr("connected");

    if(!players.white) {
        players.white = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "W");
    } else if (!players.black) {
        players.black = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "B");
    } else {
        uniqueSocket.emit("spectatorRole");
    }

    uniqueSocket.on("disconnect", () => {
        if (uniqueSocket.id === players.white) {
            delete players.white;
            dbgr("White Player Disconnected");
        } else if (uniqueSocket.id === players.black) {
            delete players.black;
            dbgr("Black Player Disconnected");
        } else {
            dbgr("Spectator Disconnected");
        }
    });

    uniqueSocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniqueSocket !== players.white) return
            if (chess.turn() === "b" && uniqueSocket !== players.black) return

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            } else {
                dbgr("Invalid Move", move);
                uniqueSocket.emit("invalidMove", move);
            }
        } catch (error) {
            console.log(error);
            uniqueSocket.emit("Invalid Move :", move);
        }
    });
})
// console.log(process.env.NODE_ENV);
// console.log(process.env.GAMEPORT);
server.listen(process.env.GAMEPORT, () => {
    dbgr(`Server is running on port ${config.GAME_URI}${process.env.GAMEPORT}`);
})