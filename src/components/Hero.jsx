import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Github, Linkedin } from "lucide-react";
import HeroScene from "./HeroScene";
import { Magnetic, SplitText, EASE, useMotionEnabled } from "./ui";

export default function Hero({ profile, motionEnabled, ready = true }) {
  const ref = useRef(null);
  const ok = useMotionEnabled();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, ok ? -110 : 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, ok ? 0 : 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, ok ? 0.94 : 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, ok ? 8 : 0]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);
  const [lineOne, lineTwo] = String(profile.headline || "").split("\n");

  // Everything in the hero waits for the curtain: same delay, different doors.
  const enter = (delay, offset = 26) => ({
    initial: { opacity: 0, y: offset },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: offset },
    transition: { duration: 0.9, ease: EASE, delay: ready ? delay : 0 },
  });

  return (
    <section id="home" className="hero" ref={ref}>
      <div className="hero-bg">
        <HeroScene active={motionEnabled && ready} />
        <span className="hero-glow hero-glow-a" aria-hidden="true" />
        <span className="hero-glow hero-glow-b" aria-hidden="true" />
        <span className="hero-grid" aria-hidden="true" />
        <span className="hero-veil" aria-hidden="true" />
      </div>

      <motion.div
        className="hero-content"
        style={{ y, opacity, scale, filter }}
      >
        <motion.div className="hero-top" {...enter(0.1, 20)}>
          <span className="chip">
            <i className="status-dot" />
            {profile.availability}
          </span>
          <span className="chip chip-ghost">
            {profile.location} · {profile.role}
          </span>
        </motion.div>

        <h1 className="hero-title">
          <SplitText
            className="hero-line"
            text={lineOne}
            play={ready}
            delay={0.18}
            stagger={0.06}
          />
          <SplitText
            className="hero-line hero-line-accent"
            text={lineTwo}
            play={ready}
            delay={0.34}
            stagger={0.06}
          />
        </h1>

        <div className="hero-foot">
          <motion.p className="hero-intro" {...enter(0.62)}>
            {profile.intro}
          </motion.p>

          <motion.div className="hero-actions" {...enter(0.72)}>
            <Magnetic strength={0.2}>
              <a className="btn btn-primary" href="#work" data-cursor="Explore">
                <span>Selected work</span>
                <ArrowUpRight size={17} />
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a className="btn btn-ghost" href="#contact" data-cursor="Say hi">
                <span>Start a conversation</span>
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      <div className="hero-rail hero-rail-left" aria-hidden="true">
        <span>PORTFOLIO — {new Date().getFullYear()}</span>
      </div>

      <div className="hero-rail hero-rail-right">
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          data-cursor="GitHub"
        >
          <Github size={15} />
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          data-cursor="LinkedIn"
        >
          <Linkedin size={15} />
        </a>
        <i className="rail-line" />
      </div>

      <motion.a className="scroll-cue" href="#work" {...enter(1.05, 12)}>
        <span>SCROLL</span>
        <i className="scroll-cue-line">
          <ArrowDown size={13} />
        </i>
      </motion.a>
    </section>
  );
}
