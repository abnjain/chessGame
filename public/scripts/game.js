const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessBoard");
const roleName = document.querySelector(".roleName p");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");
            
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
    
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                            draggedPiece = pieceElement;
                            sourceSquare = { row: rowIndex, col: squareIndex };
                            e.dataTransfer.setData("text/plain", "")
                    };
                });
    
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
    
                squareElement.appendChild(pieceElement);
            };

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource  = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
    
                    handleMove(sourceSquare, targetSource);
                };
            });
            boardElement.append(squareElement);
        });

    });

    if(playerRole=== "b"){
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };
    return unicodePieces[piece.type] || "";
};

const printRole = (role) => {
    console.log(role);
    if (role === "w") {
        roleName.innerHTML = " as White Player";
    } else if (role === "b") {
        roleName.innerHTML = " as Black Player";
    } else {
        roleName.innerHTML = " as a Spectator";
    }
}

socket.on("playerRole", (role) => {
    playerRole = role;
    printRole(role);
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

const gameEndMessage = document.querySelector(".gameEndMessage");
const messageElement = document.querySelector(".gameEndMessage .message");
const lossMessageElement = document.querySelector(".gameEndMessage .lossMessage");
const replayButton = document.querySelector(".replayButton");

socket.on("gameEnd", (result, currentPlayer) => {
    messageElement.innerText = `Game Over: ${result}`;
    if (result === "Checkmate" && currentPlayer==="w") {
        lossMessageElement.innerText = `White lost`;
    }
    if (result === "Checkmate" && currentPlayer==="b") {
        lossMessageElement.innerText = `Black lost`;
    }
    gameEndMessage.style.display = "block";
});

replayButton.addEventListener("click", () => {
    socket.emit("replayGame");
    gameEndMessage.style.display = "none";
    chess.reset();
    renderBoard();
});

renderBoard();

// Remove flash messages after 10 seconds
const alertSuccess = document.querySelector(".alertSuccess")
const alertDanger = document.querySelector(".alertDanger")
setTimeout(() => {
    const flashMessage = document.querySelector('.flashMessage');
    if (flashMessage) {
        if (alertSuccess) {
            alertSuccess.style.backgroundColor = 'rgba(34, 197, 94, 0.5)';
            alertSuccess.style.display = 'none';
        } else if (alertDanger) {
            alertDanger.style.display = 'none';
        }
    }
}, 10000);
