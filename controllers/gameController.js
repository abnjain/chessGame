// gameController.js
const socket = require("socket.io");
const {Chess} = require("chess.js");

const chess = new Chess();

let players = {};

//development phase requirement
const dbgr = require("debug")("development:chessGame");

module.exports = {
    gameSocket: (server) => {
        const io = socket(server);
        io.on("connection", (uniqueSocket) => {
            dbgr("connected");
        
            if(!players.white) {
                players.white = uniqueSocket.id;
                uniqueSocket.emit("playerRole", "w");
            } else if (!players.black) {
                players.black = uniqueSocket.id;
                uniqueSocket.emit("playerRole", "b");
            } else {
                uniqueSocket.emit("spectatorRole", "s");
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
                    if (chess.turn() === "w" && uniqueSocket.id !== players.white) return
                    if (chess.turn() === "b" && uniqueSocket.id !== players.black) return
        
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
        });
    }
}
