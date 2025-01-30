const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');
const aiToggleButton = document.getElementById('ai-toggle-button');
const hamburger = document.getElementById('hamburger');
const preferencesMenu = document.getElementById('preferences-menu');
const themeToggle = document.getElementById('theme-toggle');
const aiDifficulty = document.getElementById('ai-difficulty');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupClose = document.getElementById('popup-close');

let isGameActive = true;
let currentPlayer = X_CLASS;
let isAIEnabled = false;
let aiMode = 'easy'; // Default AI difficulty

// Load preferences from localStorage
const savedTheme = localStorage.getItem('theme');
const savedAIMode = localStorage.getItem('aiMode');

if (savedTheme) {
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    themeToggle.checked = savedTheme === 'light';
}

if (savedAIMode) {
    aiMode = savedAIMode;
    aiDifficulty.value = savedAIMode;
}

startGame();
resetButton.addEventListener('click', startGame);
aiToggleButton.addEventListener('click', toggleAI);
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    preferencesMenu.classList.toggle('active');
});

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

aiDifficulty.addEventListener('change', () => {
    aiMode = aiDifficulty.value;
    localStorage.setItem('aiMode', aiMode);
});

popupClose.addEventListener('click', () => {
    popup.classList.remove('active');
});

function startGame() {
    isGameActive = true;
    currentPlayer = X_CLASS;
    cellElements.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove(X_CLASS, O_CLASS, 'winning-cell');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    statusText.textContent = `Player ${currentPlayer.toUpperCase()}'s turn`;
    popup.classList.remove('active');
}

function toggleAI() {
    isAIEnabled = !isAIEnabled;
    aiToggleButton.textContent = isAIEnabled ? "Stop AI" : "Play with AI";
    startGame();
}

function handleClick(e) {
    const cell = e.target;
    if (!isGameActive || cell.children.length > 0) return;

    placeMark(cell, currentPlayer);

    if (checkWin(currentPlayer)) {
        endGame(true);
    } else if (isDraw()) {
        endGame(false);
    } else {
        swapTurns();
        statusText.textContent = `Player ${currentPlayer.toUpperCase()}'s turn`;

        if (isAIEnabled && currentPlayer === O_CLASS) {
            setTimeout(makeAIMove, 500); // AI moves after a short delay
        }
    }
}

function placeMark(cell, currentPlayer) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

    if (currentPlayer === X_CLASS) {
        use.setAttribute("href", "#x-icon");
        svg.classList.add("x-icon");
    } else {
        use.setAttribute("href", "#o-icon");
        svg.classList.add("o-icon");
    }

    svg.appendChild(use);
    cell.appendChild(svg);
    cell.classList.add(currentPlayer);
}

function swapTurns() {
    currentPlayer = currentPlayer === X_CLASS ? O_CLASS : X_CLASS;
}

function checkWin(currentPlayer) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentPlayer);
        });
    });
}

function endGame(isWin) {
    isGameActive = false;
    if (isWin) {
        popupMessage.textContent = `Player ${currentPlayer.toUpperCase()} Wins!`;
        highlightWinningCombination();
    } else {
        popupMessage.textContent = "Game Draw!";
    }
    popup.classList.add('active');
}

function highlightWinningCombination() {
    WINNING_COMBINATIONS.forEach(combination => {
        if (combination.every(index => 
            cellElements[index].classList.contains(currentPlayer))) {
            combination.forEach(index => {
                cellElements[index].classList.add('winning-cell');
            });
        }
    });
}

function isDraw() {
    return [...cellElements].every(cell => cell.children.length > 0);
}

function makeAIMove() {
    const availableCells = [...cellElements].filter(cell => cell.children.length === 0);
    if (availableCells.length > 0) {
        let randomCell;
        if (aiMode === 'easy') {
            randomCell = getEasyAIMove(availableCells);
        } else if (aiMode === 'medium') {
            randomCell = getMediumAIMove(availableCells);
        } else if (aiMode === 'hard') {
            randomCell = getHardAIMove(availableCells);
        }
        placeMark(randomCell, O_CLASS);

        if (checkWin(O_CLASS)) {
            endGame(true);
        } else if (isDraw()) {
            endGame(false);
        } else {
            swapTurns();
            statusText.textContent = `Player ${currentPlayer.toUpperCase()}'s turn`;
        }
    }
}

function getEasyAIMove(availableCells) {
    // Completely random move (easiest mode)
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function getMediumAIMove(availableCells) {
    // 50% chance to make a smart move, 50% chance to make a random move
    const shouldMakeSmartMove = Math.random() < 0.5;

    if (shouldMakeSmartMove) {
        // Try to win if possible
        for (let cell of availableCells) {
            cell.classList.add(O_CLASS);
            if (checkWin(O_CLASS)) {
                cell.classList.remove(O_CLASS);
                return cell;
            }
            cell.classList.remove(O_CLASS);
        }

        // Block player from winning
        for (let cell of availableCells) {
            cell.classList.add(X_CLASS);
            if (checkWin(X_CLASS)) {
                cell.classList.remove(X_CLASS);
                return cell;
            }
            cell.classList.remove(X_CLASS);
        }
    }

    // Otherwise, random move
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function getHardAIMove(availableCells) {
    // Try to win if possible
    for (let cell of availableCells) {
        cell.classList.add(O_CLASS);
        if (checkWin(O_CLASS)) {
            cell.classList.remove(O_CLASS);
            return cell;
        }
        cell.classList.remove(O_CLASS);
    }

    // Block player from winning
    for (let cell of availableCells) {
        cell.classList.add(X_CLASS);
        if (checkWin(X_CLASS)) {
            cell.classList.remove(X_CLASS);
            return cell;
        }
        cell.classList.remove(X_CLASS);
    }

    // Try to take the center
    const centerCell = cellElements[4];
    if (availableCells.includes(centerCell)) {
        return centerCell;
    }

    // Try to take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => availableCells.includes(cellElements[index]));
    if (availableCorners.length > 0) {
        return cellElements[availableCorners[Math.floor(Math.random() * availableCorners.length)]];
    }

    // Otherwise, take any available cell
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}