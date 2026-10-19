import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { EASE, Magnetic, useMotionEnabled } from "./ui";
import { lockScroll } from "../scroll";

const LINKS = [
  { id: "work", label: "Work", index: "01" },
  { id: "about", label: "About", index: "02" },
  { id: "resume", label: "Résumé", index: "03" },
  { id: "contact", label: "Contact", index: "04" },
];

export default function Nav({ profile, onToggleMotion }) {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("home");
  const motionOk = useMotionEnabled();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => setStuck(value > 48));

  useEffect(() => {
    const sections = ["home", ...LINKS.map((l) => l.id)]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  return (
    <>
      <header className={`site-header ${stuck ? "is-stuck" : ""}`}>
        <div className="header-shell">
          <a className="wordmark" href="#home" aria-label="Back to top">
            <span className="wordmark-glyph" aria-hidden="true">
              <span />
            </span>
            <span className="wordmark-text">
              {profile.shortName.toLowerCase()}
              <i>.</i>
            </span>
          </a>

          <nav className="main-nav" aria-label="Primary">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={current === link.id ? "is-active" : ""}
                data-cursor=""
              >
                <span className="nav-label">
                  {link.label.split("").map((char, i) => (
                    <em key={i} style={{ "--i": i }}>
                      {char}
                    </em>
                  ))}
                </span>
                <i className="nav-dot" />
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="motion-toggle"
              onClick={onToggleMotion}
              aria-label={motionOk ? "Pause animations" : "Play animations"}
              data-cursor={motionOk ? "Pause" : "Play"}
            >
              {motionOk ? <Pause size={13} /> : <Play size={13} />}
            </button>

            <Magnetic strength={0.22} className="header-cta-wrap">
              <a className="header-cta" href="#contact" data-cursor="Say hi">
                <span>Let’s talk</span>
                <ArrowUpRight size={15} />
              </a>
            </Magnetic>

            <button
              type="button"
              className={`burger ${open ? "is-open" : ""}`}
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="mobile-menu-inner">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 40, rotateX: -40 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: EASE,
                    delay: 0.12 + i * 0.06,
                  }}
                >
                  <span>{link.label}</span>
                  <i>{link.index}</i>
                </motion.a>
              ))}
              <motion.div
                className="mobile-menu-foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                <span>
                  <i className="status-dot" />
                  {profile.availability}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
