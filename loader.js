// loader.js — show letter loader, animate, then hide
(function () {
  const LOADER_MIN_MS = 800;    // minimum time the loader will show
  const FORCE_HIDE_MS = 6000;   // safety fallback to hide
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // start animation shortly after insertion (gives CSS time to settle)
  requestAnimationFrame(() => {
    setTimeout(() => loader.classList.add('start'), 50);
  });

  const start = performance.now();

  function hideLoader() {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, LOADER_MIN_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('faded');
      setTimeout(() => {
        // remove loader node after fade (clean up)
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
        // reveal page content (your pages use .fade-in; we add it here)
        document.body.classList.add('fade-in');
      }, 500);
    }, wait);
  }

  // hide once full page loaded
  window.addEventListener('load', hideLoader, { once: true });

  // fallback: hide after FORCE_HIDE_MS
  setTimeout(() => {
    if (document.getElementById('page-loader')) hideLoader();
  }, FORCE_HIDE_MS);

  // optional: user gesture to unlock audio etc.
  function onUserGesture() {
    window.removeEventListener('pointerdown', onUserGesture);
    window.removeEventListener('keydown', onUserGesture);
  }
  window.addEventListener('pointerdown', onUserGesture, { once: true });
  window.addEventListener('keydown', onUserGesture, { once: true });
})();
