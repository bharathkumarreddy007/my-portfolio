import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import portrait from "../../profile.jpg";
import { mediaUrl } from "../media";
import { EASE, Reveal, SectionLabel } from "./ui";
import Pet from "./pet/Pet";
import "./finale.css";

const LINES = [
  "Hope you enjoyed petting my pet. Now, the introduction.",
  "I'm your friendly neighbourhood AI engineer and full-stack developer — aggressively researching the tools, patterns and workflows that actually ship. I build agents, contribute to open source on GitHub, and spend an unreasonable amount of time making interfaces feel alive.",
  "Hey — don't forget to drop me a message. I'll help you build it bigger, better and a little more fun.",
];

function Typewriter({ lines, start, speed = 11 }) {
  const reduced = useReducedMotion();
  const full = lines.join("\n\n");
  const [count, setCount] = useState(0);
  const done = count >= full.length;

  useEffect(() => {
    if (!start) return undefined;
    if (reduced) {
      setCount(full.length);
      return undefined;
    }
    let i = 0;
    let raf = 0;
    let last = 0;
    const tick = (now) => {
      if (!last) last = now;
      const step = Math.max(1, Math.round((now - last) / speed));
      last = now;
      i = Math.min(full.length, i + step);
      setCount(i);
      if (i < full.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, full, speed, reduced]);

  const parts = full.slice(0, count).split("\n\n");
  const ghost = full.split("\n\n");

  return (
    <div className="finale-type-wrap">
      <p className="sr-only">{full}</p>
      <div
        className="finale-type"
        aria-hidden="true"
        onClick={() => setCount(full.length)}
      >
        <div className="finale-type-live">
          {parts.map((part, index) => (
            <p key={index}>
              {part}
              {index === parts.length - 1 && (
                <span
                  className={`finale-caret ${done ? "is-done" : ""}`}
                  aria-hidden="true"
                />
              )}
            </p>
          ))}
        </div>
        <div className="finale-type-ghost">
          {ghost.map((part, index) => (
            <p key={index}>{part}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Finale({ profile }) {
  const photo = mediaUrl(profile.photo, portrait);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="hello" className="section finale">
      <span className="finale-glow" aria-hidden="true" />
      <span className="finale-grid-lines" aria-hidden="true" />

      <div className="shell" ref={ref}>
        <Reveal>
          <div className="finale-top">
            <SectionLabel index="05">One last thing</SectionLabel>
            <span className="chip">
              <i className="status-dot" />
              {profile.availability}
            </span>
          </div>
        </Reveal>

        <div className="finale-grid">
          <Reveal className="finale-visual" delay={0.05}>
            <motion.div
              className="finale-portrait"
              whileHover={{ y: -6, rotate: -0.6 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="finale-frame">
                <img src={photo} alt={profile.name} loading="lazy" />
                <span className="finale-frame-glow" aria-hidden="true" />
              </div>

              <span className="finale-tag">certified good human</span>

              <div className="finale-pet">
                <Pet
                  expression="proud"
                  action="wave"
                  motionState="float"
                  size={132}
                />
                <span className="finale-pet-note">good boy.</span>
              </div>
            </motion.div>
          </Reveal>

          <div className="finale-copy">
            <Reveal delay={0.1}>
              <h2 className="finale-title">
                Good <em className="serif">boy</em>.
              </h2>
            </Reveal>

            <Typewriter lines={LINES} start={inView} />

            <Reveal delay={0.15} className="finale-actions">
              <a
                className="btn btn-primary"
                href="#contact"
                data-cursor="Say hi"
              >
                Say hello
                <ArrowUpRight size={16} />
              </a>
              <a
                className="finale-mail"
                href={`mailto:${profile.email}`}
                data-cursor="Write to me"
              >
                <Mail size={15} />
                {profile.email}
              </a>
            </Reveal>

            <Reveal delay={0.2} className="finale-sign">
              <span className="finale-sign-line" aria-hidden="true" />
              <span>
                {profile.name} · {profile.location}
              </span>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
