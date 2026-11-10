(() => {
  const splash = document.getElementById('yard-splash');
  if (!splash) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    splash.remove();
    return;
  }
  // Each page load starts a fresh intro, including browser reloads.
  splash.hidden = false;
  const start = performance.now();
  let closed = false;
  let readyTimer;
  function escape(event) {
    if (event.key === 'Escape') close();
  }
  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(readyTimer);
    clearTimeout(fallbackTimer);
    document.removeEventListener('yardcraft-ready', ready);
    document.removeEventListener('keydown', escape);
    splash.classList.add('splash-out');
    setTimeout(() => splash.remove(), 420);
  }
  function ready() {
    readyTimer = setTimeout(close, Math.max(0, 2850 - (performance.now() - start)));
  }
  document.addEventListener('yardcraft-ready', ready, {once: true});
  splash.querySelector('button').addEventListener('click', close);
  document.addEventListener('keydown', escape);
  const fallbackTimer = setTimeout(close, 3600);
})();
