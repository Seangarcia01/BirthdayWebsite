// ================== CONFIGURATION ==================
const IMAGE_COUNT = 20;                    // number of unique images
const PAIRS = IMAGE_COUNT;                 // total pairs
const TIMEOUT_MIN = 15 * 60 * 1000;        // 15 minutes

// ================== UI ELEMENTS ==================
const gridEl   = document.getElementById('grid');
const msgEl    = document.getElementById('message');
const nextBtn  = document.getElementById('next-btn');
const backBtn  = document.getElementById('back-btn');

// ================== STATE VARIABLES ==================
let firstCard   = null;
let secondCard  = null;
let lockBoard   = false;
let matchedCount = 0;

// ================== SOUNDS ==================
const correctSound = new Audio('sounds/correct.mp3');
correctSound.volume = 1.0;

const wrongSound = new Audio('sounds/wrong.mp3');
wrongSound.volume = 1.0;

correctSound.load();
wrongSound.load();

// ================== LOAD GAME STATE ==================
let state = JSON.parse(localStorage.getItem('matchState') || 'null');
if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount;
  restoreMatches(state.matched);
  if (matchedCount === PAIRS) showNext();
} else {
  startNewGame();
}

// ================== GAME INITIALIZATION ==================
function startNewGame() {
  const imgs = Array.from({ length: IMAGE_COUNT }, (_, i) => `game_images/${i+1}.jpg`);
  let pairs = imgs.concat(imgs);
  let shuffled = shuffle(pairs);
  initBoard(shuffled);
  localStorage.setItem('matchState', JSON.stringify({
    timestamp: Date.now(),
    shuffled,
    matched: [],
    matchedCount: 0
  }));
}

function initBoard(shuffled) {
  gridEl.innerHTML = '';
  shuffled.forEach(src => {
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

// ================== GAME LOGIC ==================
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
  const isMatch = firstCard.dataset.src === secondCard.dataset.src;
  if (isMatch) {
    disableCards();
    showMessage('Correct! 🎉');
    showFeedback('correct');
    matchedCount++;
    saveMatch(firstCard.dataset.src);
    if (matchedCount === PAIRS) showNext();
  } else {
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
  firstCard.removeEventListener('click', onCardClick);
  secondCard.removeEventListener('click', onCardClick);
  firstCard = secondCard = null;
}

// ================== UI FEEDBACK ==================
function showMessage(text, vibrate = false) {
  msgEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(200);
}

function clearMessage() {
  msgEl.textContent = '';
}

function showNext() {
  nextBtn.classList.remove('hidden');
  showMessage('All matched! Click Continue 🎉');

  // Play celebration sound
  const celebrationSound = document.getElementById('celebration-sound');
  celebrationSound.currentTime = 0;
  celebrationSound.play();

  // Launch confetti
  launchConfetti();

  nextBtn.addEventListener('click', () => {
    window.location.href = 'final_message.html';
  }, { once: true });
}

function showFeedback(type) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  feedback.textContent = type === 'correct' ? 'Correct!' : 'Wrong!';
  feedback.className = 'feedback show ' + type;

  if (type === 'correct') {
    correctSound.currentTime = 0;
    correctSound.play();
  } else if (type === 'wrong') {
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  if (navigator.vibrate) {
    navigator.vibrate(type === 'correct' ? 100 : [100, 50, 100]);
  }

  setTimeout(() => {
    feedback.classList.remove('show', type);
    feedback.textContent = '';
  }, 1200);
}

// ================== CONFETTI ==================
function launchConfetti() {
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 }
  });
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 } });
  }, 500);
}

// ================== SAVE / RESTORE ==================
function saveMatch(src) {
  let st = JSON.parse(localStorage.getItem('matchState'));
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

// ================== UTILS ==================
function shuffle(array) {
  let a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================== BUTTON HANDLERS ==================
backBtn.addEventListener('click', () => history.back());