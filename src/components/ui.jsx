import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

/* ------------------------------------------------------------------ *
 * Motion primitives shared across the site
 * ------------------------------------------------------------------ */

// Expo-out — the house easing. Everything premium uses a long tail.
export const EASE = [0.16, 1, 0.3, 1];
export const EASE_SOFT = [0.22, 1, 0.36, 1];

export const MotionContext = createContext(true);

// True when the visitor allows motion: our toggle is on *and* the OS agrees.
export function useMotionEnabled() {
  const allowed = useContext(MotionContext);
  const reduced = useReducedMotion();
  return allowed && !reduced;
}

/* --------------------------- Reveal ------------------------------- */

// Scroll-in reveal with a gentle 3D lift. The perspective lives on the
// element itself so nested transforms cannot flatten it.
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 46,
  rotate = 9,
  duration = 0.95,
  amount = 0.25,
  once = true,
  style,
}) {
  const ok = useMotionEnabled();
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1400, ...style }}
      initial={ok ? { opacity: 0, y, rotateX: rotate } : false}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: ok ? duration : 0,
        delay: ok ? delay : 0,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------- SplitText ----------------------------- */

// Word-by-word mask reveal. Each word rides up from behind a clipping mask
// with a little rotateX so the type feels like it is unfolding in space.
// The in-view observer lives on the root (never clipped) and the variants
// cascade down to the words — observing the masked word itself would never
// fire, because a fully clipped element has no intersection at all.
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.05,
  amount = 0.3,
  once = true,
  as: Tag = "span",
  play,
}) {
  const ok = useMotionEnabled();
  const Root = motion[Tag] ?? motion.span;
  const lines = String(text ?? "").split("\n");
  // `play` switches the reveal from scroll-triggered to controlled, which is
  // what the hero needs so the words wait for the intro curtain to lift.
  const trigger =
    typeof play === "boolean"
      ? { animate: play ? "show" : "hidden" }
      : { whileInView: "show", viewport: { once, amount } };

  const container = {
    hidden: {},
    show: { transition: { delayChildren: delay, staggerChildren: stagger } },
  };

  const word = {
    hidden: ok ? { y: "115%", opacity: 0, rotateX: -62 } : false,
    show: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
      transition: { duration: ok ? 1.05 : 0, ease: EASE },
    },
  };

  return (
    <Root
      className={className}
      variants={container}
      initial="hidden"
      {...trigger}
    >
      {lines.map((line, lineIndex) => (
        <span className="split-line" key={lineIndex}>
          {line.split(" ").map((value, i) => (
            <span className="split-word" key={i}>
              <motion.span className="split-inner" variants={word}>
                {value}
                {"\u00A0"}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </Root>
  );
}

/* -------------------------- Magnetic ------------------------------ */

// Pulls its child toward the pointer — the classic "premium button" feel.
export function Magnetic({ children, className = "", strength = 0.28 }) {
  const ok = useMotionEnabled();
  const x = useSpring(0, { stiffness: 220, damping: 20, mass: 0.5 });
  const y = useSpring(0, { stiffness: 220, damping: 20, mass: 0.5 });

  const move = (event) => {
    if (!ok) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`magnetic ${className}`}
      style={{ x, y }}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------- Tilt -------------------------------- */

// Pointer-driven 3D tilt with a soft light that follows the cursor.
export function Tilt({
  children,
  className = "",
  max = 8,
  scale = 1.015,
  glare = true,
}) {
  const ok = useMotionEnabled();
  const rx = useSpring(0, { stiffness: 170, damping: 20, mass: 0.6 });
  const ry = useSpring(0, { stiffness: 170, damping: 20, mass: 0.6 });
  const s = useSpring(1, { stiffness: 200, damping: 24 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glareX = useMotionTemplate`${gx}%`;
  const glareY = useMotionTemplate`${gy}%`;
  const glareBackground = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255,255,255,0.16), transparent 62%)`;

  const move = (event) => {
    if (!ok) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * max * 2);
    rx.set((0.5 - py) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const enter = () => ok && s.set(scale);
  const leave = () => {
    rx.set(0);
    ry.set(0);
    s.set(1);
  };

  return (
    <motion.div
      className={`tilt ${className}`}
      style={{
        rotateX: rx,
        rotateY: ry,
        scale: s,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      {children}
      {glare && (
        <motion.span
          className="tilt-glare"
          aria-hidden="true"
          style={{ background: glareBackground }}
        />
      )}
    </motion.div>
  );
}

/* -------------------------- Marquee ------------------------------- */

export function Marquee({
  items,
  duration = 26,
  reverse = false,
  className = "",
  separator = "✦",
}) {
  const row = (
    <div className="marquee-row" aria-hidden="true">
      {items.map((item, i) => (
        <span className="marquee-item" key={i}>
          {item}
          <i className="marquee-sep">{separator}</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${className}`}>
      <div
        className="marquee-track"
        style={{
          "--marquee-duration": `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

/* ------------------------ Section pieces -------------------------- */

export function SectionLabel({ index, children }) {
  return (
    <span className="eyebrow">
      <i className="eyebrow-index">{index}</i>
      {children}
    </span>
  );
}

export function StatusDot({ label }) {
  return (
    <span className="status">
      <i className="status-dot" />
      {label}
    </span>
  );
}

export function useCountUp(target, active) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const numeric = parseFloat(String(target).replace(/[^\d.]/g, "")) || 0;
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1400, 1);
      setValue(Math.round(numeric * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);
  return value;
}
