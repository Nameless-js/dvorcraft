(() => {
  const splash = document.getElementById('yard-splash');
  let seen = false;
  try { seen = sessionStorage.getItem('yardcraft-intro-v2') === '1'; } catch {}
  if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    splash.remove();
    return;
  }
  try { sessionStorage.setItem('yardcraft-intro-v2', '1'); } catch {}
  splash.hidden = false;
  const start = performance.now();
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    splash.classList.add('splash-out');
    setTimeout(() => splash.remove(), 420);
  }
  function ready() { setTimeout(close, Math.max(0, 2850 - (performance.now() - start))); }
  document.addEventListener('yardcraft-ready', ready, {once: true});
  splash.querySelector('button').addEventListener('click', close);
  document.addEventListener('keydown', function escape(event) {
    if (event.key === 'Escape') { close(); document.removeEventListener('keydown', escape); }
  });
  setTimeout(close, 3600);
})();
