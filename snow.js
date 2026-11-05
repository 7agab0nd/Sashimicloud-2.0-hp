// A low-resolution decorative canvas keeps snow separate from the mountain art.
(() => {
  'use strict';
  const canvas = document.querySelector('.pixel-snow');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('.snow-toggle');
  let width = 0, height = 0, flakes = [], frame = 0, last = 0, elapsed = 0;
  let paused = false, visible = true;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    // One canvas pixel per two CSS pixels, independent of device pixel ratio.
    width = canvas.width = Math.max(1, Math.ceil(rect.width / 2));
    height = canvas.height = Math.max(1, Math.ceil(rect.height / 2));
    const count = Math.min(72, Math.max(24, Math.round(width * height / 4800)));
    flakes = Array.from({ length: count }, (_, i) => {
      const depth = i % 3;
      return { x: Math.random() * width, y: Math.random() * height,
        depth, speed: 4 + depth * 3 + Math.random() * 2, phase: Math.random() * Math.PI * 2 };
    });
  }
  function tick(now) {
    frame = 0;
    if (!last) last = now;
    // Cap rendering at 30fps and prevent jumps after suspension.
    if (now - last >= 1000 / 30) {
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now; elapsed += dt;
      ctx.clearRect(0, 0, width, height);
      const wind = Math.sin(elapsed / 7) * 2 + Math.sin(elapsed / 2.7) * 0.7;
      for (const flake of flakes) {
        flake.y = (flake.y + flake.speed * dt) % height;
        flake.x = (flake.x + (wind + Math.sin(elapsed + flake.phase) * 0.5) * (1 + flake.depth * 0.5) * dt + width) % width;
        ctx.fillStyle = ['#d1e0fa38', '#dce8fa55', '#eef4ff80'][flake.depth];
        const size = flake.depth === 2 ? 2 : 1;
        ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), size, size);
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    ctx.clearRect(0, 0, width, height);
    if (!paused && !motion.matches && !document.hidden && visible) frame = requestAnimationFrame(tick);
    if (button) {
      button.disabled = motion.matches;
      button.textContent = motion.matches ? 'Snowfall off · reduced motion' : paused ? 'Resume snowfall' : 'Pause snowfall';
      button.setAttribute('aria-pressed', String(paused || motion.matches));
    }
  }
  button?.addEventListener('click', () => { paused = !paused; sync(); });
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(() => { resize(); sync(); }).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(canvas);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', sync);
  resize(); sync();
})();
