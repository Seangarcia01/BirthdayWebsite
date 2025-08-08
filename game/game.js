// Configuration
const IMAGE_COUNT = 20;     // number of unique images
const PAIRS = IMAGE_COUNT;  // total pairs
const GRID_SIZE = PAIRS * 2;
const TIMEOUT_MIN = 15 * 60 * 1000; // 15 minutes

const gridEl = document.getElementById('grid');
const msgEl  = document.getElementById('message');
const nextBtn= document.getElementById('next-btn');

let firstCard = null, secondCard = null;
let lockBoard = false;
let matchedCount = 0;

// Load or initialize state
let state = JSON.parse(localStorage.getItem('matchState') || 'null');
if (state && Date.now() - state.timestamp < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount;
  restoreMatches(state.matched);
  if (matchedCount === PAIRS) showNext();
} else {
  startNewGame();
}

function startNewGame() {
  const imgs = Array.from({length: IMAGE_COUNT}, (_,i) => `game_images/${i+1}.jpg`);
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
  shuffled.forEach((src, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.src = src;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back" style="background-image:url('${src}')"></div>
      </div>`;
    card.addEventListener('click', onCardClick);
    gridEl.appendChild(card);
  });
}

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
  const match = firstCard.dataset.src === secondCard.dataset.src;
  if (match) {
    disableCards();
    showMessage('Correct! 🎉');
    matchedCount++;
    saveMatch(firstCard.dataset.src);
    if (matchedCount === PAIRS) showNext();
  } else {
    showMessage('Try again…', true);
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      // ← Reset pointers here so old cards don’t stick around
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

function showMessage(text, vibrate = false) {
  msgEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(200);
}

function clearMessage() {
  msgEl.textContent = '';
}

function showNext() {
  nextBtn.classList.remove('hidden');
  nextBtn.addEventListener('click', () => {
    window.location.href = 'final_message.html';
  });
}

// Persistence helpers
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

// Fisher–Yates shuffle
function shuffle(array) {
  let a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}