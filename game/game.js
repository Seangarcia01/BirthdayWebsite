// game.js — improved, drop-in replacement

// CONFIG
const IMAGE_COUNT = 20;                 // unique images
const TOTAL_CARDS = IMAGE_COUNT * 2;    // total tiles
const TIMEOUT_MIN = 15 * 60 * 1000;     // state expiry (15 min)

// We'll initialize after DOM is ready to be extra-safe
window.addEventListener('DOMContentLoaded', () => {
  // UI refs (safe to query now)
  const gridEl    = document.getElementById('grid');
  const messageEl = document.getElementById('message');
  const nextBtn   = document.getElementById('next-btn');
  const backBtn   = document.getElementById('back-btn');
  const feedbackEl= document.getElementById('feedback');
  const container = document.querySelector('.game-container');

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedCount = 0;

  // Preload sounds
  const correctSound = new Audio('sounds/correct.mp3');
  correctSound.volume = 1.0;
  const wrongSound = new Audio('sounds/wrong.mp3');
  wrongSound.volume = 1.0;
  correctSound.load(); wrongSound.load();

  // celebration audio element in HTML (optional)
  const celebrationEl = document.getElementById('celebration-sound');
  let celebrationUnlocked = false;

  // Unlock celebration sound once user interacts (to satisfy autoplay policies)
  function unlockCelebrationSound() {
    if (!celebrationUnlocked && celebrationEl) {
      const p = celebrationEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          celebrationEl.pause();
          celebrationEl.currentTime = 0;
          celebrationUnlocked = true;
        }).catch(()=> {
          // ignore autoplay rejection — unlocking will try again on real user gesture
        });
      }
    }
  }
  // call unlock on the first user pointer interaction
  document.addEventListener('pointerdown', () => unlockCelebrationSound(), { once: true });

  // Safe guard: if an element is missing, stop early
  if (!gridEl) {
    console.error('Missing #grid element — game cannot start.');
    return;
  }

  // Preload saved state or start fresh
  let state = JSON.parse(localStorage.getItem('matchState') || 'null');
  if (state && (Date.now() - state.timestamp) < TIMEOUT_MIN) {
    initBoard(state.shuffled);
    matchedCount = state.matchedCount || 0;
    restoreMatches(state.matched || []);
    if (matchedCount === IMAGE_COUNT) {
      // If already completed in stored state, reveal next
      showNext(true); // pass true to indicate "already complete"
    }
  } else {
    startNewGame();
  }

  // Attach a safe next button handler now (it won't navigate until visible)
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      // Prevent accidental clicks when hidden
      if (nextBtn.classList.contains('hidden')) return;
      // Navigate to final message (root-based path)
      window.location.href = '/final_message/final_message.html';
    });
  }

  // Back button
  if (backBtn) backBtn.addEventListener('click', () => history.back());

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

    // Fit grid to viewport after we inserted cards
    setTimeout(() => fitGridToViewport(), 30);
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

  // CHECK MATCH
  function checkForMatch() {
    // guards
    if (!firstCard || !secondCard) {
      console.warn('checkForMatch called without two cards.');
      return;
    }
    const src1 = firstCard.dataset?.src;
    const src2 = secondCard.dataset?.src;
    if (!src1 || !src2) {
      console.warn('card data-src missing');
      resetSelectionQuick();
      return;
    }

    const isMatch = src1 === src2;

    if (isMatch) {
      // matched
      disableCards();
      matchedCount++;
      showMessage('Correct! 🎉');
      showFeedback('correct');
      saveMatch(src1);

      // If completed, call showNext() after a short delay (so flips finish)
      if (matchedCount === IMAGE_COUNT) {
        setTimeout(() => showNext(), 700);
      } else {
        // reset selection
        firstCard = null;
        secondCard = null;
      }
    } else {
      // not matched
      showMessage('Try again…', true);
      showFeedback('wrong');
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetSelectionQuick();
        lockBoard = false;
        clearMessage();
      }, 900);
    }
  }

  function resetSelectionQuick() {
    firstCard = null;
    secondCard = null;
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
    if (vibrate && navigator.vibrate) navigator.vibrate(120);
  }
  function clearMessage() { if (messageEl) messageEl.textContent = ''; }

  // Show next + celebration
  function showNext(alreadyComplete = false) {
    if (!nextBtn) return;

    // reveal button
    nextBtn.classList.remove('hidden');
    showMessage('All matched! Click Continue 🎉');

    // Play celebration sound (attempt — may be blocked without user interaction)
    if (celebrationEl) {
      // attempt play; if autoplay blocked, it will fail silently
      celebrationEl.currentTime = 0;
      celebrationEl.play().catch(()=>{ /* ignore autoplay rejection */ });
    }

    // confetti (if confetti lib loaded)
    try { launchConfetti(); } catch(e){ /* ignore */ }

    // If page was already complete (restored state) we may want to flash the feedback
    if (alreadyComplete) {
      showFeedback('correct');
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

  // FEEDBACK (overlay)
  function showFeedback(type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = (type === 'correct') ? '🎉 Nice match!' : '❌ Try again!';
    feedbackEl.className = `feedback show ${type}`;

    // play sound
    if (type === 'correct') {
      correctSound.currentTime = 0;
      correctSound.play().catch(()=>{});
    } else {
      wrongSound.currentTime = 0;
      wrongSound.play().catch(()=>{});
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
  // Adaptively picks a column count so tiles + header + controls fit into the container.
  function fitGridToViewport() {
    const total = gridEl.children.length || TOTAL_CARDS;
    if (!total) return;

    const gap = parseFloat(getComputedStyle(gridEl).gap) || 8;
    const containerStyle = getComputedStyle(container || document.documentElement);
    const padTop = parseFloat(containerStyle.paddingTop) || 0;
    const padBottom = parseFloat(containerStyle.paddingBottom) || 0;
    const padLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const padRight = parseFloat(containerStyle.paddingRight) || 0;

    const containerW = (container ? container.clientWidth : window.innerWidth) - padLeft - padRight;
    const containerH = (container ? container.clientHeight : window.innerHeight) - padTop - padBottom;

    const headerH = 0; // if you have a header element with class .header, compute it
    const msgH = messageEl ? messageEl.getBoundingClientRect().height : 0;
    const controls = document.querySelector('.controls');
    const controlsH = controls ? controls.getBoundingClientRect().height : 0;

    const availableH = Math.max(80, containerH - headerH - msgH - controlsH - 20);
    const availableW = Math.max(120, containerW);

    let best = { cols: 1, size: 48 };
    const MIN_TILE = 48;

    for (let cols = 1; cols <= total; cols++) {
      const rows = Math.ceil(total / cols);
      const totalGapW = (cols - 1) * gap;
      const totalGapH = (rows - 1) * gap;
      const tileW = (availableW - totalGapW) / cols;
      const tileH = (availableH - totalGapH) / rows;
      const tileSize = Math.floor(Math.min(tileW, tileH));
      if (tileSize < MIN_TILE) continue;
      if (tileSize > best.size) best = { cols, size: tileSize };
    }

    if (!best || best.size < MIN_TILE) {
      const colsFallback = Math.max(1, Math.floor(availableW / (MIN_TILE + gap)));
      const rowsFallback = Math.ceil(total / colsFallback);
      const tileW = (availableW - (colsFallback - 1) * gap) / colsFallback;
      const tileH = (availableH - (rowsFallback - 1) * gap) / rowsFallback;
      best = { cols: colsFallback, size: Math.floor(Math.max(36, Math.min(tileW, tileH))) };
    }

    gridEl.style.gridTemplateColumns = `repeat(${best.cols}, ${best.size}px)`;
    gridEl.style.gridAutoRows = `${best.size}px`;
    gridEl.style.justifyContent = 'center';
    gridEl.style.alignContent = 'center';
  }

  const debounce = (fn, ms = 120) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  window.addEventListener('resize', debounce(() => fitGridToViewport(), 120));
  const observer = new MutationObserver(() => fitGridToViewport());
  observer.observe(gridEl, { childList: true });

  // initial layout fit
  setTimeout(() => fitGridToViewport(), 80);
});