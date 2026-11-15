const active = new WeakMap<Document | HTMLElement, () => void>();

/** A single passive listener and one pending frame serve every decorative layer. */
export function enhanceParallax(root: Document | HTMLElement): () => void {
  const previous = active.get(root);
  if (previous) return previous;
  const layers = [...root.querySelectorAll<HTMLElement>('[data-parallax-depth]')].map((element) => {
    const depth = Number(element.dataset.parallaxDepth);
    if (!Number.isFinite(depth) || Math.abs(depth) > 0.12) throw new Error('Invalid decorative parallax depth.');
    return { element, depth };
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame: number | undefined;
  const reset = () => layers.forEach(({ element }) => element.style.removeProperty('--parallax-y'));
  const update = () => {
    frame = undefined;
    if (motion.matches) { reset(); return; }
    const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
    for (const { element, depth } of layers) {
      element.style.setProperty('--parallax-y', `${Math.max(-72, Math.min(72, progress * depth * 720))}px`);
    }
  };
  const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
  const detach = () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    root.removeEventListener('toggle', schedule, true);
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const configure = () => {
    detach();
    if (motion.matches) reset();
    else {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      root.addEventListener('toggle', schedule, true);
      update();
    }
  };
  motion.addEventListener('change', configure);
  configure();
  const cleanup = () => {
    detach();
    motion.removeEventListener('change', configure);
    reset();
    active.delete(root);
  };
  active.set(root, cleanup);
  return cleanup;
}
