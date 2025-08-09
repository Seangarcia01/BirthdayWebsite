// ================== CONFIGURATION ==================
const IMAGE_COUNT = 20;                    // number of unique images
const PAIRS = IMAGE_COUNT;                 // total pairs
const TIMEOUT_MIN = 15 * 60 * 1000;         // 15 minutes

// ================== UI ELEMENTS ==================
const gridEl   = document.getElementById('grid');
const msgEl    = document.getElementById('message');
const nextBtn  = document.getElementById('next-btn');
const backBtn  = document.getElementById('back-btn');
const celebrationSound = document.getElementById('celebration-sound');

let firstCard   = null;
let secondCard  = null;
let lockBoard   = false;
let matchedCount = 0;
let nextAttached = false;

// ================== AUDIO ==================
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound   = new Audio('sounds/wrong.mp3');

correctSound.volume = 1.0;
wrongSound.volume   = 1.0;

correctSound.load();
wrongSound.load();

// ================== STATE LOAD ==================
let state = JSON.parse(localStorage.getItem('matchState') || 'null');
if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
  initBoard(state.shuffled);
  matchedCount = state.matchedCount;
  restoreMatches(state.matched);
  if (matchedCount === PAIRS) showNext();
} else {
  startNewGame();
}

// ================== NEW GAME ==================
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

// ================== INIT BOARD ==================
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

// ================== CARD CLICK ==================
function onCardClick() {
  if (lockBoard || this.classList.contains('flipped')) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }
  secondCard = this;
  checkForMatch();
}

// ================== CHECK MATCH ==================
function checkForMatch() {
  if (!firstCard || !secondCard) {
    resetBoard();
    return;
  }

  const isMatch = firstCard.dataset.src === secondCard.dataset.src;
  if (isMatch) {
    disableCards();
    showMessage('Correct! 🎉');
    showFeedback('correct');
    matchedCount++;
    saveMatch(firstCard.dataset.src);

    if (matchedCount === PAIRS) {
      showNext();
    }
  } else {
    showMessage('Try again…', true);
    showFeedback('wrong');
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
      clearMessage();
    }, 1000);
  }
}

// ================== RESET BOARD STATE ==================
function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// ================== DISABLE MATCHED CARDS ==================
function disableCards() {
  firstCard.removeEventListener('click', onCardClick);
  secondCard.removeEventListener('click', onCardClick);
  resetBoard();
}

// ================== MESSAGES ==================
function showMessage(text, vibrate = false) {
  msgEl.textContent = text;
  if (vibrate && navigator.vibrate) navigator.vibrate(200);
}
function clearMessage() {
  msgEl.textContent = '';
}

// ================== NEXT BUTTON ==================
function showNext() {
  if (!nextBtn) return;
  nextBtn.classList.remove('hidden');
  showMessage('All matched! Click Continue 🎉');

  try {
    if (celebrationSound) {
      celebrationSound.currentTime = 0;
      celebrationSound.play().catch(() => {});
    }
  } catch (e) {
    console.warn('Celebration sound play failed', e);
  }

  launchConfetti();

  if (!nextAttached) {
    nextAttached = true;
    nextBtn.addEventListener('click', () => {
      window.location.href = 'final_message.html';
    }, { once: true });
  }
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

// ================== FEEDBACK ==================
function showFeedback(type) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  feedback.textContent = type === 'correct' ? 'Correct!' : 'Wrong!';
  feedback.className = 'feedback show ' + type;

  const sound = type === 'correct' ? correctSound : wrongSound;
  sound.currentTime = 0;
  sound.play();

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

// ================== SHUFFLE ==================
function shuffle(array) {
  let a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================== BACK BUTTON ==================
backBtn.addEventListener('click', () => history.back());