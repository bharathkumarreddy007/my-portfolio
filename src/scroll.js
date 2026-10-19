import Lenis from "lenis";

/* Inertial smooth scrolling with a graceful fallback: if anything about
 * Lenis dislikes the environment we simply fall back to native scrolling. */

let instance = null;
let frame = 0;

export function initSmoothScroll() {
  if (instance || typeof window === "undefined") return instance;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return null;

  try {
    instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.7,
      wheelMultiplier: 1,
      anchors: true,
    });
  } catch {
    instance = null;
    return null;
  }

  const loop = (time) => {
    instance?.raf(time);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
  document.documentElement.classList.add("has-smooth-scroll");
  return instance;
}

export function destroySmoothScroll() {
  cancelAnimationFrame(frame);
  frame = 0;
  instance?.destroy();
  instance = null;
  document.documentElement.classList.remove("has-smooth-scroll");
}

// Pause the page while an overlay (menu, case study) owns the screen.
export function lockScroll(locked) {
  const root = document.documentElement;
  root.classList.toggle("is-locked", locked);
  if (!instance) document.body.style.overflow = locked ? "hidden" : "";
  if (locked) instance?.stop();
  else instance?.start();
}
