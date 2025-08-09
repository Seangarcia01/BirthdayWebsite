// game.js (replace whole file)

// ================== CONFIG ==================
const IMAGE_COUNT = 20;                     // number of unique images
const PAIRS = IMAGE_COUNT;                  // total pairs
const TIMEOUT_MIN = 15 * 60 * 1000;         // 15 minutes

// ================== UI ==================
const gridEl   = document.getElementById('grid');
const msgEl    = document.getElementById('message');
const nextBtn  = document.getElementById('next-btn');
const backBtn  = document.getElementById('back-btn');
const feedbackEl = document.getElementById('feedback');

if (!gridEl || !msgEl || !nextBtn || !backBtn) {
  console.error('Missing required DOM elements (grid/message/next/back).');
}

// ================== STATE ==================
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCount = 0;
let nextAttached = false;

// ================== AUDIO (preload + safe fallback) ==================
const correctSound = new Audio('sounds/correct.mp3');
correctSound.preload = 'auto';
correctSound.volume = 1.0;

const wrongSound = new Audio('sounds/wrong.mp3');
wrongSound.preload = 'auto';
wrongSound.volume = 1.0;

// try to use celebration audio element if present, otherwise fallback to Audio()
let celebrationSoundElem = document.getElementById('celebration-sound');
let celebrationSound = celebrationSoundElem || new Audio('sounds/celebration.mp3');
if (!celebrationSoundElem) {
  celebrationSound.preload = 'auto';
  celebrationSound.volume = 1.0;
}

// ================== CONFETTI LOADER ==================
function loadConfettiIfNeeded() {
  return new Promise((resolve) => {
    if (window.confetti) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      console.warn('Could not load confetti library.');
      resolve();
    };
    document.head.appendChild(s);
  });
}

function launchConfetti() {
  if (!window.confetti) {
    // if not loaded, try to load then fire
    return loadConfettiIfNeeded().then(() => {
      if (window.confetti) {
        _doConfetti();
      }
    });
  }
  _doConfetti();
}

function _doConfetti() {
  try {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }});
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 }});
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 }});
    }, 500);
  } catch (e) {
    console.warn('Confetti failed:', e);
  }
}

// ================== PERSISTENCE ==================
function saveState(obj) {
  localStorage.setItem('matchState', JSON.stringify(obj));
}

function readState() {
  return JSON.parse(localStorage.getItem('matchState') || 'null');
}

// ================== BOOT (restore or start new) ==================
let state = readState();
if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount || 0;
  // restoreMatches requires cards to exist, so call after initBoard
  restoreMatches(state.matched || []);
  if (matchedCount === PAIRS) {
    // small delay so UI is ready
    setTimeout(showNext, 200);
  }
} else {
  startNewGame();
}

function startNewGame() {
  matchedCount = 0;
  const imgs = Array.from({length: IMAGE_COUNT}, (_, i) => `game_images/${i+1}.jpg`);
  const pairs = imgs.concat(imgs);
  const shuffled = shuffle(pairs);
  initBoard(shuffled);
  saveState({ timestamp: Date.now(), shuffled, matched: [], matchedCount: 0 });
  nextBtn.classList.add('hidden');
}

// ================== BOARD RENDER ==================
function initBoard(shuffled) {
  if (!gridEl) return;
  gridEl.innerHTML = '';
  shuffled.forEach((src) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.src = src;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back" style="background-image:url('${src}')"></div>
      </div>
    `;
    card.addEventListener('click', onCardClick);
    gridEl.appendChild(card);
  });
}

// ================== INTERACTION ==================
function onCardClick() {
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
  if (!firstCard || !secondCard) return; // safety check
  const isMatch = firstCard.dataset.src === secondCard.dataset.src;

  if (isMatch) {
    // correct
    disableCards();
    showMessage('Correct! 🎉');
    showFeedback('correct');
    matchedCount++;
    saveMatch(firstCard.dataset.src);
    // if finished
    if (matchedCount === PAIRS) {
      showNext();
    }
  } else {
    // wrong
    showMessage('Try again…', true);
    showFeedback('wrong');
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard = null;
      secondCard = null;
      lockBoard = false;
      clearMessage();
    }, 1000);
  }
}

function disableCards() {
  if (firstCard) firstCard.removeEventListener('click', onCardClick);
  if (secondCard) secondCard.removeEventListener('click', onCardClick);
  firstCard = secondCard = null;
}

// ================== FEEDBACK ==================
function showMessage(text, vibrate = false) {
  if (!msgEl) return;
  msgEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(200);
}
function clearMessage() { if (msgEl) msgEl.textContent = ''; }

function showFeedback(type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = (type === 'correct') ? '🎉 Nice match!' : '❌ Try again!';
  feedbackEl.className = `feedback show ${type}`;

  try {
    if (type === 'correct') {
      correctSound.currentTime = 0;
      correctSound.play().catch(()=>{});
    } else {
      wrongSound.currentTime = 0;
      wrongSound.play().catch(()=>{});
    }
  } catch (e) {
    console.warn('Audio play failed', e);
  }

  if (navigator.vibrate) navigator.vibrate(type === 'correct' ? 100 : [100,50,100]);

  setTimeout(() => {
    if (feedbackEl) {
      feedbackEl.classList.remove('show', 'correct', 'wrong');
      feedbackEl.textContent = '';
    }
  }, 1200);
}

// ================== SHOW NEXT (end-of-game) ==================
function showNext() {
  if (!nextBtn) return;

  // reveal button once
  nextBtn.classList.remove('hidden');
  showMessage('All matched! Click Continue 🎉');

  // play celebration sound (safe)
  try {
    if (celebrationSound) {
      celebrationSound.currentTime = 0;
      celebrationSound.play().catch(() => {});
    }
  } catch (e) {
    console.warn('Celebration sound play failed', e);
  }

  // confetti (load if needed)
  launchConfetti();

  // attach event only once
  if (!nextAttached) {
    nextAttached = true;
    nextBtn.addEventListener('click', () => {
      window.location.href = 'final_message.html';
    }, { once: true });
  }
}

// ================== SAVE / RESTORE HELPERS ==================
function saveMatch(src) {
  const st = readState() || { timestamp: Date.now(), shuffled: [], matched: [], matchedCount: 0 };
  st.matched = st.matched || [];
  if (!st.matched.includes(src)) st.matched.push(src);
  st.matchedCount = matchedCount;
  saveState(st);
}

function restoreMatches(matched = []) {
  if (!Array.isArray(matched)) return;
  document.querySelectorAll('.card').forEach(card => {
    if (matched.includes(card.dataset.src)) {
      card.classList.add('flipped');
      card.removeEventListener('click', onCardClick);
    }
  });
}

// ================== UTILS ==================
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================== BUTTONS ==================
if (backBtn) backBtn.addEventListener('click', () => history.back());