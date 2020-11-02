const player = (name, marker, turn, isComputer) => {
    return { name, marker, turn, isComputer };
};

const createBoard = () => new Array(9).fill('');

let board = createBoard();

const renderBoard = () => {
    document.getElementById('game-board').innerHTML = board
        .map((cell, index) => {
            return `<div id=cell${index} class="cell mb-2 text-center">${cell}</div>`;
        })
        .join('');
};

const displayGameOptions = () => {
    const buttons = document.getElementById('game-options-buttons');
    buttons.classList.remove('d-none');
}

const removeGameOptions = () => {
    const buttons = document.getElementById('game-options-buttons');
    buttons.classList.add('d-none');
}

const displaySinglePlayerForm = () => {
    removeGameOptions();
    const playerForm = document.getElementById('player-setup');
    playerForm.classList.remove('d-none');
}

const displayTwoPlayerForm = () => {
    removeGameOptions();
    const playerForm = document.getElementById('two-player-setup');
    playerForm.classList.remove('d-none');
}

const removePlayerForm = (id) => {
    const form = document.getElementById(id);
    form.classList.add('d-none')
}

const restartGame = () => {
    board = createBoard();
    renderBoard();
    document.getElementById('game-status').classList.add('d-none');
    document.getElementById('restart-button').classList.add('d-none');
    displayGameOptions();
}

const updateDifficulty = difficulty => difficulty.value;

const startGame = (event) => {
    event.preventDefault();
    removePlayerForm(event.target.id);
    const updateStatusMessage = (msg) => {
        const statusMsgContainer = document.getElementById('game-status');
        statusMsgContainer.classList.remove('d-none');
        statusMsgContainer.innerHTML = msg;
    }

    const player1 = player(event.target.elements.player1.value, "X", true, false);
    const player2 = event.target.elements.player2 ? player(
        event.target.elements.player2.value,
        "O",
        false,
        false
    ) : player('Computer', 'O', false, true);
    const gameDifficulty = () => {
        const radios = document.getElementsByName('difficultyOptions');
        return [...radios].find(r => r.checked).value;
    }
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    const getCurrentPlayer = (player1, player2) => player1.turn ? player1 : player2;
    let currentPlayer = getCurrentPlayer(player1, player2);
    const cells = document.querySelectorAll('.cell');
    updateStatusMessage(`${currentPlayer.name}'s turn.`)
    document.getElementById('restart-button').classList.remove('d-none');
    // check if game is over
    const checkBoardFull = board => !board.filter(cell => cell === '').length;

    const checkForWin = (board, wins) => {
        let gameWon = false;
        for (let winningCombo of wins) {
            if (
                board[winningCombo[0]] !== '' &&
                board[winningCombo[0]] === board[winningCombo[1]] &&
                board[winningCombo[1]] === board[winningCombo[2]]
            ) {
                gameWon = true;
                break;
            }
        }
        return gameWon;
    };

    let nodes = 0;
    const minimaxStrategy = (board, maximizing) => {
        nodes++;
        const boardFull = checkBoardFull(board);
        const gameWon = checkForWin(board, winConditions);
        if (gameWon) {
            // [-1, board] if player wins; [1, board] if AI wins
            return maximizing ? [-1, board] : [1, board];
        }
        if (boardFull && !gameWon) {
            return [0, board]; // tie
        }
        if (!gameWon && !boardFull) {
            let nextVal = null;
            let nextBoard = null;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = maximizing ? 'O' : 'X';
                    const value = minimaxStrategy(board, !maximizing)[0];
                    if ((maximizing && (nextVal == null || value > nextVal)) || (!maximizing && (nextVal == null || value < nextVal))) {
                        nextBoard = board.map(arr => arr.slice());
                        nextVal = value;
                    }
                    board[i] = '';
                }
            }
            return [nextVal, nextBoard];
        }
    }

    const minimaxMove = (board) => {
        nodes = 0;
        return minimaxStrategy(board, true)[1];
    }

    const computerMove = () => {
        const difficulty = gameDifficulty();
        if (currentPlayer.isComputer && currentPlayer.turn && difficulty === 'easy') {
            const availableMoves = [...cells].filter(cell => cell.innerHTML === '');
            const rng = Math.floor(Math.random() * Math.floor(availableMoves.length));
            availableMoves[rng].innerHTML = currentPlayer.marker;
            board[availableMoves[rng].id.substr(-1, 1)] = currentPlayer.marker
            checkGameStatus();
        }
        if (currentPlayer.isComputer && currentPlayer.turn && difficulty === 'hard') {
            board = minimaxMove(board);
            board.forEach((marker, index) => {
                document.getElementById(`cell${index}`).innerHTML = marker;
            });
            checkGameStatus();
        }
    }

    // continue playing until there is a winner or until the game is a tie
    const checkGameStatus = () => {
        const gameWon = checkForWin(board, winConditions);
        const boardFull = checkBoardFull(board);
        if (gameWon) {
            const statusMsg = `Game over. ${currentPlayer.name} wins!`
            updateStatusMessage(statusMsg);
            preventAdditionalMoves(cells);
        }
        if (boardFull && !gameWon) {
            const statusMsg = `It's a tie!`
            updateStatusMessage(statusMsg);
            preventAdditionalMoves(cells);
        }
        if (!gameWon && !boardFull) {
            player1.turn = !player1.turn;
            player2.turn = !player2.turn;
            currentPlayer = getCurrentPlayer(player1, player2);
            const statusMsg = `${currentPlayer.name}'s turn.`
            updateStatusMessage(statusMsg)
            if (currentPlayer.isComputer) {
                computerMove();
            }
        }
        return gameWon || boardFull ? true : false;
    };

    const addPlayerMarker = (event) => {
        if (event.target.innerHTML === "") {
            event.target.innerHTML = currentPlayer.marker;
            board[event.target.id.substr(-1, 1)] = currentPlayer.marker;
            checkGameStatus();
            return;
        }
        if (event.target.innerHTML !== "") {
            alert("Invalid move. Please try again.");
        }
    };

    cells.forEach((cell) => cell.addEventListener("click", addPlayerMarker));

    const preventAdditionalMoves = (cells) =>
        cells.forEach((cell) => cell.removeEventListener("click", addPlayerMarker));
};

renderBoard();
