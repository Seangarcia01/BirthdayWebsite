// Configuration
const IMAGE_COUNT = 20;                    // number of unique images
const PAIRS = IMAGE_COUNT;                 // total pairs
const TIMEOUT_MIN = 15 * 60 * 1000;        // 15 minutes

// UI elements
const gridEl   = document.getElementById('grid');
const msgEl    = document.getElementById('message');
const nextBtn  = document.getElementById('next-btn');
const backBtn  = document.getElementById('back-btn');

let firstCard   = null;
let secondCard  = null;
let lockBoard   = false;
let matchedCount = 0;

// Preload audio
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');
correctSound.load();
wrongSound.load();

// Load or initialize state
let state = JSON.parse(localStorage.getItem('matchState') || 'null');
if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount;
  restoreMatches(state.matched);
  if (matchedCount === PAIRS) showNext();
} else {
  startNewGame();
}

// Start a fresh game
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

// Build the card grid
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

// Handle card click
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

// Check if two selected cards match
function checkForMatch() {
  const isMatch = firstCard.dataset.src === secondCard.dataset.src;
  if (isMatch) {
    disableCards();
    showMessage('Correct! 🎉');
    showFeedback('correct'); // ← ADD THIS
    matchedCount++;
    saveMatch(firstCard.dataset.src);
    if (matchedCount === PAIRS) showNext();
  } else {
    showMessage('Try again…', true);
    showFeedback('wrong'); // ← ADD THIS
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

// Prevent matched cards from being clicked again
function disableCards() {
  firstCard.removeEventListener('click', onCardClick);
  secondCard.removeEventListener('click', onCardClick);
  firstCard = secondCard = null;
}

// Show feedback message (and optional vibration)
function showMessage(text, vibrate = false) {
  msgEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(200);
}

// Clear the feedback message
function clearMessage() {
  msgEl.textContent = '';
}

// Reveal the Continue button when done
function showNext() {
  nextBtn.classList.remove('hidden');
  showMessage('All matched! Click Continue 🎉');
  nextBtn.addEventListener('click', () => {
    window.location.href = 'final_message.html';
  }, { once: true });
}

// Save a matched card to localStorage
function saveMatch(src) {
  let st = JSON.parse(localStorage.getItem('matchState'));
  st.matched.push(src);
  st.matchedCount = matchedCount;
  localStorage.setItem('matchState', JSON.stringify(st));
}

// Restore previously matched cards on reload
function restoreMatches(matched) {
  document.querySelectorAll('.card').forEach(card => {
    if (matched.includes(card.dataset.src)) {
      card.classList.add('flipped');
      card.removeEventListener('click', onCardClick);
    }
  });
}

// Fisher–Yates shuffle
function shuffle(array) {
  let a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Back button handler
backBtn.addEventListener('click', () => history.back());

function showFeedback(type) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  // Set the message text
  feedback.textContent = type === 'correct' ? 'Correct!' : 'Wrong!';

  // Set the class for styling
  feedback.className = 'feedback show ' + type;

  // Play preloaded sound
  if (type === 'correct') {
    correctSound.currentTime = 0;
    correctSound.play();
  } else if (type === 'wrong') {
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  // Vibration feedback (optional)
  if (navigator.vibrate) {
    navigator.vibrate(type === 'correct' ? 100 : [100, 50, 100]);
  }

  // Hide feedback after 1.2 seconds
  setTimeout(() => {
    feedback.classList.remove('show', type);
    feedback.textContent = ''; // clear message
  }, 1200);
}