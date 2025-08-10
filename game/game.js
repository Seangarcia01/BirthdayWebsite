// game.js — fixed and cleaned version

'use strict';

// CONFIG
const IMAGE_COUNT = 20;                 // unique images
const TOTAL_CARDS = IMAGE_COUNT * 2;    // total tiles
const TIMEOUT_MIN = 15 * 60 * 1000;     // state expiry (ms)

// UI refs (assumes script runs after DOM)
const gridEl      = document.getElementById('grid');
const messageEl   = document.getElementById('message');
const nextBtn     = document.getElementById('next-btn');
const backBtn     = document.getElementById('back-btn');
const feedbackEl  = document.getElementById('feedback');
const container   = document.querySelector('.game-container');

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
correctSound.load();
wrongSound.load();

// Celebration audio element in HTML (optional)
const celebrationEl = document.getElementById('celebration-sound');

// Restore or start new
let state = JSON.parse(localStorage.getItem('matchState') || 'null');
if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount || 0;
  // restoreMatches expects the DOM cards to exist
  // call it after a short tick so MutationObserver/fit can run
  setTimeout(() => restoreMatches(state.matched || []), 50);
  if (matchedCount === IMAGE_COUNT) showNext();
} else {
  startNewGame();
}

// Start new game
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

// Initialize board DOM
function initBoard(shuffled) {
  if (!gridEl) return;
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
    // use regular function so `this` is the element
    card.addEventListener('click', onCardClick);
    gridEl.appendChild(card);
  });

  // Fit grid to viewport after DOM insertion
  setTimeout(fitGridToViewport, 50);
}

// Card click handler
function onCardClick() {
  if (lockBoard) return;
  if (this.classList.contains('flipped')) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  // second pick
  secondCard = this;
  checkForMatch();
}

// Compare two picks
function checkForMatch() {
  if (!firstCard || !secondCard) {
    // safety guard
    firstCard = secondCard = null;
    return;
  }

  const isMatch = firstCard.dataset.src === secondCard.dataset.src;

  if (isMatch) {
    // matched
    disableCards();
    matchedCount++;
    saveMatch(firstCard.dataset.src);
    showMessage('Correct! 🎉');
    showFeedback('correct');

    if (matchedCount === IMAGE_COUNT) {
      // game complete
      showNext();
    }
  } else {
    // not matched
    showMessage('Try again…', true);
    showFeedback('wrong');
    lockBoard = true;
    setTimeout(() => {
      if (firstCard) firstCard.classList.remove('flipped');
      if (secondCard) secondCard.classList.remove('flipped');
      firstCard = secondCard = null;
      lockBoard = false;
      clearMessage();
    }, 900);
  }
}

// Prevent matched cards from future clicks
function disableCards() {
  if (firstCard) firstCard.removeEventListener('click', onCardClick);
  if (secondCard) secondCard.removeEventListener('click', onCardClick);
  firstCard = secondCard = null;
}

// Messages in page
function showMessage(text, vibrate = false) {
  if (messageEl) messageEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(160);
}
function clearMessage() { if (messageEl) messageEl.textContent = ''; }

// Reveal Next + celebration
function showNext() {
  if (!nextBtn) return;
  nextBtn.classList.remove('hidden');
  showMessage('All matched! Click Continue 🎉');

  // play celebration sound (element or fallback)
  try {
    if (celebrationEl) {
      celebrationEl.currentTime = 0;
      celebrationEl.play().catch(() => {});
    } else {
      // fallback to "celebration" file in sounds folder if present
      const fallback = new Audio('sounds/celebration.mp3');
      fallback.volume = 1.0;
      fallback.play().catch(() => {});
    }
  } catch (e) { /* ignore */ }

  // confetti (if loaded)
  try { launchConfetti(); } catch (e) {}

  if (!nextAttached) {
    nextAttached = true;
    nextBtn.addEventListener('click', () => {
      window.location.href = 'final_message.html';
    }, { once: true });
  }
}

// Save matched src into localStorage
function saveMatch(src) {
  let st = JSON.parse(localStorage.getItem('matchState') || '{}');
  if (!st.matched) st.matched = [];
  // avoid duplicates in matched[] (just in case)
  if (!st.matched.includes(src)) st.matched.push(src);
  st.matchedCount = matchedCount;
  // keep shuffled and timestamp if present
  if (!st.shuffled && gridEl) {
    const imgs = Array.from({ length: IMAGE_COUNT }, (_, i) => `game_images/${i+1}.jpg`);
    st.shuffled = shuffle(imgs.concat(imgs));
  }
  st.timestamp = Date.now();
  localStorage.setItem('matchState', JSON.stringify(st));
}

// Restore previously matched cards
function restoreMatches(matched) {
  if (!matched || !matched.length) return;
  document.querySelectorAll('.card').forEach(card => {
    if (matched.includes(card.dataset.src)) {
      card.classList.add('flipped');
      card.removeEventListener('click', onCardClick);
    }
  });
}

// Fisher–Yates shuffle
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Back button
if (backBtn) backBtn.addEventListener('click', () => history.back());

// Feedback overlay
function showFeedback(type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = (type === 'correct') ? '🎉 Nice match!' : '❌ Try again!';
  feedbackEl.className = `feedback show ${type}`;

  // play sound
  try {
    if (type === 'correct') {
      correctSound.currentTime = 0;
      correctSound.play().catch(() => {});
    } else {
      wrongSound.currentTime = 0;
      wrongSound.play().catch(() => {});
    }
  } catch (e) {}

  // vibrate
  if (navigator.vibrate) navigator.vibrate(type === 'correct' ? 120 : [80, 40, 80]);

  setTimeout(() => {
    if (feedbackEl) {
      feedbackEl.classList.remove('show', type);
      feedbackEl.textContent = '';
    }
  }, 1100);
}

// Confetti (requires canvas-confetti loaded)
function launchConfetti() {
  if (typeof confetti !== 'function') return;
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }});
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 }});
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 }});
  }, 450);
}

// ===================== FIT GRID TO VIEWPORT =====================
// Makes tiles square and fits all content (header/message/controls)
function fitGridToViewport() {
  if (!gridEl || !container) return;

  const total = gridEl.children.length || TOTAL_CARDS;
  if (!total) return;

  // gap value (px)
  let gap = 8;
  try {
    const cs = getComputedStyle(gridEl);
    gap = parseFloat(cs.gap) || gap;
  } catch (e) {}

  const containerStyle = getComputedStyle(container);
  const padTop = parseFloat(containerStyle.paddingTop) || 0;
  const padBottom = parseFloat(containerStyle.paddingBottom) || 0;
  const padLeft = parseFloat(containerStyle.paddingLeft) || 0;
  const padRight = parseFloat(containerStyle.paddingRight) || 0;

  // container inner size
  const containerW = container.clientWidth - padLeft - padRight;
  const containerH = container.clientHeight - padTop - padBottom;

  // header / message / controls heights
  const header = container.querySelector('h1');
  const headerH = header ? header.getBoundingClientRect().height : 0;
  const msgH = messageEl ? messageEl.getBoundingClientRect().height : 0;
  const controls = container.querySelector('.controls');
  const controlsH = controls ? controls.getBoundingClientRect().height : 0;

  const availableH = Math.max(80, containerH - headerH - msgH - controlsH - 24); // buffer
  const availableW = Math.max(80, containerW);

  // choices
  let best = { cols: 1, size: 40 };
  const MIN_TILE = 48;

  for (let cols = 1; cols <= total; cols++) {
    const rows = Math.ceil(total / cols);
    const totalGapW = (cols - 1) * gap;
    const totalGapH = (rows - 1) * gap;
    const tileW = (availableW - totalGapW) / cols;
    const tileH = (availableH - totalGapH) / rows;
    const tileSize = Math.floor(Math.min(tileW, tileH));
    if (tileSize < MIN_TILE) continue;

    if (tileSize > best.size) {
      best = { cols, size: tileSize };
    }
  }

  // fallback if none found
  if (best.size === 40) {
    const colsFallback = Math.max(1, Math.floor(availableW / (MIN_TILE + gap)));
    const rowsFallback = Math.ceil(total / colsFallback);
    const tileW = (availableW - (colsFallback - 1) * gap) / colsFallback;
    const tileH = (availableH - (rowsFallback - 1) * gap) / rowsFallback;
    best = { cols: colsFallback, size: Math.max(32, Math.floor(Math.min(tileW, tileH))) };
  }

  // apply
  gridEl.style.gridTemplateColumns = `repeat(${best.cols}, ${best.size}px)`;
  gridEl.style.gridAutoRows = `${best.size}px`;
  gridEl.style.justifyContent = 'center';
  gridEl.style.alignContent = 'center';
}

// debounce + resize handling
function debounce(fn, ms = 120) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

window.addEventListener('resize', debounce(() => fitGridToViewport(), 120));

// observe DOM changes to refit
const observer = new MutationObserver(() => fitGridToViewport());
if (gridEl) observer.observe(gridEl, { childList: true });

// initial fit
window.addEventListener('load', () => setTimeout(() => fitGridToViewport(), 60));