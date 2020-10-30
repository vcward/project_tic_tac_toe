const player = (name, marker, turn, isComputer) => { return { name, marker, turn, isComputer } };

const renderBoard = (() => {
    const board = new Array(9).fill('');
    document.getElementById('game-board').innerHTML = board.map((cell, index) => {
        return `<div id=cell${index} class="cell mb-2 text-center">${cell}</div>`;
    }).join('');
})();

const startGame = (event) => {
    event.preventDefault();
    const player1 = player(event.target.elements.player1.value, 'X', true, false);
    const player2 = player(event.target.elements.player2.value, 'O', true, false)
    const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const getCurrentPlayer = (player1, player2) => player1.turn ? player1 : player2;
    let currentPlayer = getCurrentPlayer(player1, player2);
    const cells = document.querySelectorAll('.cell');

    // check if game is over
    const checkBoardFull = (cells) => [...cells].filter(cell => cell.innerHTML === '').length === 0;
    const checkForWin = (cells, wins) => {
        let gameWon = false;
        for (let winningCombo of wins) {
            if (cells[winningCombo[0]].innerHTML !== '' && cells[winningCombo[0]].innerHTML === cells[winningCombo[1]].innerHTML && cells[winningCombo[1]].innerHTML === cells[winningCombo[2]].innerHTML) {
                gameWon = true;
                break;
            }
        }
        return gameWon;
    }
    
    // continue playing until there is a winner or until the game is a tie
    const checkGameStatus = () => {
        const gameWon = checkForWin(cells, winConditions);
        const boardFull = checkBoardFull(cells);
        if (gameWon) {
            alert(`Game over. ${currentPlayer.name} wins!`);
            preventAdditionalMoves(cells);
        }
        if (boardFull && !gameWon) {
            alert(`It's a tie!`);
            preventAdditionalMoves(cells);
        }
        if (!gameWon && !boardFull) {
            player1.turn = !player1.turn;
            player2.turn = !player2.turn;
            currentPlayer = getCurrentPlayer(player1, player2);
        }
        return (gameWon || boardFull) ? true : false;
    }

    const addPlayerMarker = (event) => {
        if (event.target.innerHTML === '') {
            event.target.innerHTML = currentPlayer.marker;
            checkGameStatus();
            return;    
        }
        if (event.target.innerHTML !== '') {
            alert('Invalid move. Please try again.');
        }
    }

    cells.forEach(cell => cell.addEventListener('click', addPlayerMarker));

    const preventAdditionalMoves = (cells) => cells.forEach(cell => cell.removeEventListener('click', addPlayerMarker));

}