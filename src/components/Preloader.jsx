import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "./ui";

const PANELS = [0, 1, 2, 3, 4];

export default function Preloader({ name, role, onDone }) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1500;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2.4);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setComplete(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!complete) return;
    const timer = setTimeout(onDone, 180);
    return () => clearTimeout(timer);
  }, [complete, onDone]);

  return (
    <motion.div
      className="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 1, transition: { duration: 1.2 } }}
      aria-hidden="true"
    >
      <div className="preloader-curtain">
        {PANELS.map((panel) => (
          <motion.span
            className="curtain-panel"
            key={panel}
            initial={{ y: "0%" }}
            exit={{
              y: "-101%",
              rotateX: 14,
              transition: {
                duration: 1,
                ease: EASE,
                delay: 0.06 * panel,
              },
            }}
          />
        ))}
      </div>

      <motion.div
        className="preloader-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          y: -40,
          filter: "blur(14px)",
          transition: { duration: 0.5, ease: EASE },
        }}
      >
        <div className="preloader-mark">
          <motion.span
            className="preloader-glyph"
            initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          <motion.span
            className="preloader-glow"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.1 }}
          />
        </div>

        <h1 className="preloader-name">
          {(name || "Portfolio").split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.08 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="preloader-role"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          {role}
        </motion.p>

        <div className="preloader-meter">
          <div className="preloader-meter-head">
            <span>LOADING EXPERIENCE</span>
            <span className="preloader-count">
              {String(progress).padStart(3, "0")}
            </span>
          </div>
          <div className="preloader-bar">
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>
      </motion.div>

      <span className="preloader-ghost" aria-hidden="true">
        {String(progress).padStart(2, "0")}
      </span>
    </motion.div>
  );
}
