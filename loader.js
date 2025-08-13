// loader.js — full-page envelope loader (slower, covers viewport)
(function () {
  const LOADER_MIN_MS = 1000;   // minimum time loader is visible
  const FORCE_HIDE_MS = 8000;   // safety fallback
  const ANIM_CLASS_DELAY = 80;  // small delay before starting animations
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // start the visual animation shortly after insertion
  requestAnimationFrame(() => {
    setTimeout(() => loader.classList.add('start'), ANIM_CLASS_DELAY);
  });

  const startedAt = performance.now();

  function hideLoader() {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, LOADER_MIN_MS - elapsed);
    setTimeout(() => {
      // fade out
      loader.classList.add('faded');
      // remove from DOM after fade
      setTimeout(() => {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
        // reveal page content: many pages expect body.fade-in to show
        document.body.classList.add('fade-in');
      }, 650);
    }, wait);
  }

  // Hide when full page finishes loading
  window.addEventListener('load', hideLoader, { once: true });

  // fallback if load doesn't fire (rare)
  setTimeout(() => {
    if (document.body.contains(loader)) hideLoader();
  }, FORCE_HIDE_MS);

  // optional: user gesture to unlock audio, but do not force it here
  function onUserGesture() {
    window.removeEventListener('pointerdown', onUserGesture);
    window.removeEventListener('keydown', onUserGesture);
    // nothing else; developer may use this to trigger audio unlock if needed
  }
  window.addEventListener('pointerdown', onUserGesture, { once: true });
  window.addEventListener('keydown', onUserGesture, { once: true });
})();
