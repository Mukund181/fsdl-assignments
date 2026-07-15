/* =============================================
   TIC TAC TOE – PREMIUM EDITION
   script.js
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

// Win-line coordinates (x1,y1 → x2,y2) as percentages of board 300×300
const WIN_LINE_COORDS = {
  '0,1,2': [16, 50, 284, 50],
  '3,4,5': [16, 150, 284, 150],
  '6,7,8': [16, 250, 284, 250],
  '0,3,6': [50, 16, 50, 284],
  '1,4,7': [150, 16, 150, 284],
  '2,5,8': [250, 16, 250, 284],
  '0,4,8': [16, 16, 284, 284],
  '2,4,6': [284, 16, 16, 284],
};

// ─────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────
let board        = Array(9).fill(null); // null | 'X' | 'O'
let currentPlayer = 'X';
let gameOver     = false;
let vsAI         = false;
let scores       = { X: 0, O: 0, draw: 0 };

// ─────────────────────────────────────────────
//  DOM references
// ─────────────────────────────────────────────
const cells         = Array.from(document.querySelectorAll('.cell'));
const boardEl       = document.getElementById('board');
const statusMsg     = document.getElementById('status-msg');
const statusInd     = document.getElementById('status-indicator');
const scoreX        = document.getElementById('score-x');
const scoreO        = document.getElementById('score-o');
const scoreDraw     = document.getElementById('score-draw');
const scoreCardX    = document.getElementById('score-card-x');
const scoreCardO    = document.getElementById('score-card-o');
const btnRestart    = document.getElementById('btn-restart');
const btnReset      = document.getElementById('btn-reset-scores');
const aiToggle      = document.getElementById('ai-toggle');
const winLineSVG    = document.getElementById('win-line-svg');
const winLine       = document.getElementById('win-line');
const modalOverlay  = document.getElementById('modal-overlay');
const modalEmoji    = document.getElementById('modal-emoji');
const modalTitle    = document.getElementById('modal-title');
const modalSub      = document.getElementById('modal-sub');
const modalPlayAgain= document.getElementById('modal-play-again');
const modalClose    = document.getElementById('modal-close');

// ─────────────────────────────────────────────
//  Initialization
// ─────────────────────────────────────────────
function init() {
  updateTurnUI();
  cells.forEach((cell, idx) => {
    cell.addEventListener('click',    () => handleCellClick(idx));
    cell.addEventListener('keydown',  (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleCellClick(idx);
    });
  });
  btnRestart.addEventListener('click',   restartGame);
  btnReset.addEventListener('click',     resetScores);
  aiToggle.addEventListener('change',    toggleAI);
  modalPlayAgain.addEventListener('click', () => { closeModal(); restartGame(); });
  modalClose.addEventListener('click',   closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// ─────────────────────────────────────────────
//  Cell click handler
// ─────────────────────────────────────────────
function handleCellClick(idx) {
  if (gameOver || board[idx]) return;
  placeMove(idx, currentPlayer);

  const result = checkResult();
  if (result) { handleEnd(result); return; }

  switchPlayer();
  if (vsAI && currentPlayer === 'O' && !gameOver) {
    boardEl.classList.add('locked');
    setTimeout(() => {
      const aiIdx = getBestMove();
      placeMove(aiIdx, 'O');
      const res = checkResult();
      boardEl.classList.remove('locked');
      if (res) { handleEnd(res); return; }
      switchPlayer();
    }, 450);
  }
}

// ─────────────────────────────────────────────
//  Place a move on the board
// ─────────────────────────────────────────────
function placeMove(idx, player) {
  board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add(`${player.toLowerCase()}-cell`, 'taken');
  cell.setAttribute('aria-label', `Cell ${idx + 1}: ${player}`);
}

// ─────────────────────────────────────────────
//  Switch current player
// ─────────────────────────────────────────────
function switchPlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnUI();
}

// ─────────────────────────────────────────────
//  UI Updates
// ─────────────────────────────────────────────
function updateTurnUI() {
  const isX = currentPlayer === 'X';

  boardEl.classList.toggle('turn-x', isX);
  boardEl.classList.toggle('turn-o', !isX);

  statusMsg.textContent = `Player ${currentPlayer}'s Turn`;
  statusInd.classList.toggle('o-turn', !isX);
  statusInd.classList.remove('win', 'draw');

  scoreCardX.classList.toggle('active', isX);
  scoreCardO.classList.toggle('active', !isX);
}

function updateScoreUI() {
  scoreX.textContent    = scores.X;
  scoreO.textContent    = scores.O;
  scoreDraw.textContent = scores.draw;
}

function bumpScore(el) {
  el.classList.remove('bump');
  void el.offsetWidth; // reflow
  el.classList.add('bump');
}

// ─────────────────────────────────────────────
//  Check for win or draw
// ─────────────────────────────────────────────
function checkResult() {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(Boolean)) return { winner: null };
  return null;
}

// ─────────────────────────────────────────────
//  Handle game end
// ─────────────────────────────────────────────
function handleEnd(result) {
  gameOver = true;
  boardEl.classList.add('locked');
  statusInd.classList.add(result.winner ? 'win' : 'draw');
  statusInd.classList.remove('o-turn');

  if (result.winner) {
    const { winner, combo } = result;
    animateWinLine(combo);
    highlightWinnerCells(combo);
    statusMsg.textContent = `Player ${winner} Wins! 🎉`;
    scores[winner]++;
    updateScoreUI();
    bumpScore(winner === 'X' ? scoreX : scoreO);

    setTimeout(() => {
      showModal(
        winner === 'X' ? '🏆' : '🎊',
        `Player ${winner} Wins!`,
        winner === 'X' ? 'Excellent strategy! You dominated.' : 'Brilliant play! Well deserved.',
      );
    }, 900);
  } else {
    statusMsg.textContent = "It's a Draw! 🤝";
    scores.draw++;
    updateScoreUI();
    bumpScore(scoreDraw);
    setTimeout(() => {
      showModal('🤝', "It's a Draw!", 'So close! Give it another shot.');
    }, 600);
  }
}

// ─────────────────────────────────────────────
//  Win line animation
// ─────────────────────────────────────────────
function animateWinLine(combo) {
  const key = combo.join(',');
  const coords = WIN_LINE_COORDS[key];
  if (!coords) return;

  const [x1, y1, x2, y2] = coords;
  winLine.setAttribute('x1', (x1 / 300 * 100) + '%');
  winLine.setAttribute('y1', (y1 / 300 * 100) + '%');
  winLine.setAttribute('x2', (x2 / 300 * 100) + '%');
  winLine.setAttribute('y2', (y2 / 300 * 100) + '%');

  // Calculate the length for proper dasharray
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  winLine.style.strokeDasharray  = len;
  winLine.style.strokeDashoffset = len;
  // Force reflow then draw
  void winLine.getBoundingClientRect();
  winLine.classList.add('drawn');
}

function highlightWinnerCells(combo) {
  combo.forEach(idx => cells[idx].classList.add('winner-cell'));
}

// ─────────────────────────────────────────────
//  Restart game
// ─────────────────────────────────────────────
function restartGame() {
  board         = Array(9).fill(null);
  gameOver      = false;
  currentPlayer = 'X';

  cells.forEach((cell, idx) => {
    // Trigger reset animation
    cell.style.transition = 'none';
    cell.style.opacity    = '0';
    cell.style.transform  = 'scale(0.8)';

    setTimeout(() => {
      cell.textContent = '';
      cell.className   = 'cell';
      cell.setAttribute('aria-label', `Cell ${idx + 1}`);
      cell.style.transition = '';
      cell.style.opacity    = '1';
      cell.style.transform  = '';
    }, idx * 40);
  });

  // Reset win line
  winLine.classList.remove('drawn');
  winLine.style.strokeDashoffset = winLine.style.strokeDasharray;

  boardEl.classList.remove('locked', 'turn-o', 'turn-x');

  setTimeout(() => {
    boardEl.classList.add('turn-x');
    updateTurnUI();
    statusInd.classList.remove('win', 'draw', 'o-turn');
  }, cells.length * 40 + 50);
}

// ─────────────────────────────────────────────
//  Reset scores
// ─────────────────────────────────────────────
function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreUI();
  restartGame();
}

// ─────────────────────────────────────────────
//  Toggle AI mode
// ─────────────────────────────────────────────
function toggleAI() {
  vsAI = aiToggle.checked;
  const labels = document.querySelectorAll('.mode-label');
  labels[0].classList.toggle('active', !vsAI);
  labels[1].classList.toggle('active', vsAI);
  restartGame();
}

// ─────────────────────────────────────────────
//  Modal helpers
// ─────────────────────────────────────────────
function showModal(emoji, title, sub) {
  modalEmoji.textContent = emoji;
  modalTitle.textContent = title;
  modalSub.textContent   = sub;
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

// ─────────────────────────────────────────────
//  AI: Minimax with alpha-beta pruning
// ─────────────────────────────────────────────
function getBestMove() {
  let bestScore = -Infinity;
  let bestIdx   = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestIdx   = i;
      }
    }
  }
  return bestIdx;
}

function minimax(state, depth, isMaximizing, alpha, beta) {
  const result = evaluateBoard(state);
  if (result !== null) return result;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!state[i]) {
        state[i] = 'O';
        best = Math.max(best, minimax(state, depth + 1, false, alpha, beta));
        state[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!state[i]) {
        state[i] = 'X';
        best = Math.min(best, minimax(state, depth + 1, true, alpha, beta));
        state[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

function evaluateBoard(state) {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return state[a] === 'O' ? 10 : -10;
    }
  }
  if (state.every(Boolean)) return 0;
  return null; // game still going
}

// ─────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────
init();
