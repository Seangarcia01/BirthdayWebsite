// === game.js (auto-fit grid to viewport so all cards + header + controls fit) ===

// CONFIG
const IMAGE_COUNT = 20;                 // unique images
const TOTAL_CARDS = IMAGE_COUNT * 2;    // total tiles
const TIMEOUT_MIN = 15 * 60 * 1000;     // state expiry

// UI refs
const gridEl   = document.getElementById('grid');
const messageEl = document.getElementById('message');
const nextBtn  = document.getElementById('next-btn');
const backBtn  = document.getElementById('back-btn');
const feedbackEl = document.getElementById('feedback');
const container = document.querySelector('.game-container');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCount = 0;
let nextAttached = false;

// Preload sounds
const correctSound = new Audio('sounds/correct.mp3');
correctSound.volume = 1.0;
const wrongSound = new Audio('sounds/wrong.mp3');
wrongSound.volume = 1.0;
correctSound.load(); wrongSound.load();

// load celebration audio element if provided in HTML
const celebrationEl = document.getElementById('celebration-sound');

// restore or start
let state = JSON.parse(localStorage.getItem('matchState') || 'null');
if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount || 0;
  restoreMatches(state.matched || []);
  if (matchedCount === IMAGE_COUNT) showNext();
} else {
  startNewGame();
}

// START NEW GAME
function startNewGame() {
  const imgs = Array.from({ length: IMAGE_COUNT }, (_, i) => `game_images/${i+1}.jpg`);
  const pairs = imgs.concat(imgs);
  const shuffled = shuffle(pairs);
  initBoard(shuffled);
  localStorage.setItem('matchState', JSON.stringify({
    timestamp: Date.now(),
    shuffled,
    matched: [],
    matchedCount: 0
  }));
}

// INIT BOARD (create DOM)
function initBoard(shuffled) {
  gridEl.innerHTML = '';
  shuffled.forEach(src => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.src = src;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back" style="background-image: url('${src}')"></div>
      </div>
    `;
    card.addEventListener('click', onCardClick);
    gridEl.appendChild(card);
  });

  // after cards exist, fit the grid
  fitGridToViewport();
}

// CARD CLICK
function onCardClick(e) {
  if (lockBoard) return;
  if (this.classList.contains('flipped')) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }
  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  const [firstCard, secondCard] = flippedCards;
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    firstCard.removeEventListener('click', onCardClick);
    secondCard.removeEventListener('click', onCardClick);
    matchedPairs++;

    if (matchedPairs === totalPairs) {
      endGameCelebration();
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
    }, 1000);
  }
  flippedCards = [];
}

function endGameCelebration() {
  // Show Continue button
  const nextBtn = document.getElementById('next-btn');
  nextBtn.classList.remove('hidden');

  // Celebration sound
  const celebrationSound = document.getElementById('celebration-sound');
  if (celebrationSound) {
    celebrationSound.currentTime = 0;
    celebrationSound.play().catch(() => {});
  }

  // Confetti
  launchConfetti();

  // Button click to go to secret message page
  nextBtn.addEventListener('click', () => {
    window.location.href = 'final_message.html';
  }, { once: true });
}

function launchConfetti() {
  confetti({
    particleCount: 200,
    spread: 80,
    origin: { y: 0.6 }
  });
}

// DISABLE matched cards
function disableCards() {
  if (firstCard) firstCard.removeEventListener('click', onCardClick);
  if (secondCard) secondCard.removeEventListener('click', onCardClick);
  firstCard = secondCard = null;
}

// MESSAGES
function showMessage(text, vibrate = false) {
  if (messageEl) messageEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(180);
}
function clearMessage() { if (messageEl) messageEl.textContent = ''; }

// Reveal next, celebrate
function showNext() {
  if (!nextBtn) return;
  nextBtn.classList.remove('hidden');
  showMessage('All matched! Click Continue 🎉');

  // play celebration sound if provided
  try {
    if (celebrationEl) {
      celebrationEl.currentTime = 0;
      celebrationEl.play().catch(()=>{});
    }
  } catch(e){/* ignore */ }

  // confetti (requires confetti lib loaded on page)
  try { launchConfetti(); } catch(e){}

  if (!nextAttached) {
    nextAttached = true;
    nextBtn.addEventListener('click', () => {
      window.location.href = 'final_message.html';
    }, { once: true });
  }
}

// SAVE / RESTORE
function saveMatch(src) {
  let st = JSON.parse(localStorage.getItem('matchState') || '{}');
  if (!st.matched) st.matched = [];
  st.matched.push(src);
  st.matchedCount = matchedCount;
  localStorage.setItem('matchState', JSON.stringify(st));
}
function restoreMatches(matched) {
  document.querySelectorAll('.card').forEach(card => {
    if (matched.includes(card.dataset.src)) {
      card.classList.add('flipped');
      card.removeEventListener('click', onCardClick);
    }
  });
}

// SHUFFLE
function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// BACK BUTTON
if (backBtn) backBtn.addEventListener('click', () => history.back());

// FEEDBACK (overlay)
function showFeedback(type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = (type === 'correct') ? '🎉 Nice match!' : '❌ Try again!';
  feedbackEl.className = `feedback show ${type}`;

  // play sound
  if (type === 'correct') {
    correctSound.currentTime = 0; correctSound.play().catch(()=>{});
  } else {
    wrongSound.currentTime = 0; wrongSound.play().catch(()=>{});
  }

  // vibrate
  if (navigator.vibrate) navigator.vibrate(type === 'correct' ? 120 : [80,40,80]);

  setTimeout(() => {
    feedbackEl.classList.remove('show', type);
    feedbackEl.textContent = '';
  }, 1100);
}

// CONFETTI helper (expects canvas-confetti lib loaded)
function launchConfetti() {
  if (typeof confetti !== 'function') return;
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }});
  setTimeout(()=> {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 }});
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 }});
  }, 450);
}

// ===================== FIT GRID TO VIEWPORT =====================
// Goal: compute best columns (1..TOTAL) to maximize tile size while fitting
function fitGridToViewport() {
  const total = gridEl.children.length || TOTAL_CARDS;
  if (!total) return;

  const gap = parseFloat(getComputedStyle(gridEl).gap) || 10;
  const containerStyle = getComputedStyle(container);
  const padTop = parseFloat(containerStyle.paddingTop) || 0;
  const padBottom = parseFloat(containerStyle.paddingBottom) || 0;
  const padLeft = parseFloat(containerStyle.paddingLeft) || 0;
  const padRight = parseFloat(containerStyle.paddingRight) || 0;

  // compute available area for grid inside container
  const containerW = container.clientWidth - padLeft - padRight;
  const containerH = container.clientHeight - padTop - padBottom;

  // header + message + controls heights (these are flex children)
  const header = document.querySelector('.header');
  const headerH = header ? header.getBoundingClientRect().height : 0;
  const msgH = messageEl ? messageEl.getBoundingClientRect().height : 0;
  const controls = document.querySelector('.controls');
  const controlsH = controls ? controls.getBoundingClientRect().height : 0;

  const availableH = Math.max(50, containerH - headerH - msgH - controlsH - 20); // 20px buffer
  const availableW = Math.max(50, containerW);

  let best = { cols: 1, size: 20 };

  // minimal acceptable tile size
  const MIN_TILE = 48;

  // iterate columns 1..total and pick layout producing the largest tile that fits
  for (let cols = 1; cols <= total; cols++) {
    const rows = Math.ceil(total / cols);
    const totalGapW = (cols - 1) * gap;
    const totalGapH = (rows - 1) * gap;
    const tileW = (availableW - totalGapW) / cols;
    const tileH = (availableH - totalGapH) / rows;
    const tileSize = Math.floor(Math.min(tileW, tileH));

    if (tileSize < MIN_TILE) continue; // too small

    if (tileSize > best.size) {
      best = { cols, size: tileSize };
    }
  }

  // if we didn't find bigger than MIN_TILE, pick columns that produce smallest overflow but reasonable
  if (best.size === 20) {
    // fallback: calculate columns to make tile ~MIN_TILE
    const colsFallback = Math.max(1, Math.floor(availableW / (MIN_TILE + gap)));
    const rowsFallback = Math.ceil(total / colsFallback);
    const tileW = (availableW - (colsFallback - 1) * gap) / colsFallback;
    const tileH = (availableH - (rowsFallback - 1) * gap) / rowsFallback;
    best = { cols: colsFallback, size: Math.floor(Math.max(32, Math.min(tileW, tileH))) };
  }

  // apply to grid
  gridEl.style.gridTemplateColumns = `repeat(${best.cols}, ${best.size}px)`;
  gridEl.style.gridAutoRows = `${best.size}px`;
  gridEl.style.justifyContent = 'center';
  gridEl.style.alignContent = 'center';
}

// Debounce utility and resize handling
function debounce(fn, ms = 120) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

window.addEventListener('resize', debounce(() => {
  fitGridToViewport();
}, 120));

// When DOM changes (cards added), refit
const observer = new MutationObserver(() => fitGridToViewport());
observer.observe(gridEl, { childList: true });

// ensure initial fit after load
window.addEventListener('load', () => {
  setTimeout(() => fitGridToViewport(), 60);
});