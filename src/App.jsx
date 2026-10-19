import React, { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { initialData } from "./data";
import { destroySmoothScroll, initSmoothScroll } from "./scroll";
import { Marquee, MotionContext } from "./components/ui";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Work from "./components/Work";
import About from "./components/About";
import Experience from "./components/Experience";
import Resume from "./components/Resume";
import Contact from "./components/Contact";
import Finale from "./components/Finale";
import Footer from "./components/Footer";
import PetCompanion from "./components/pet/PetCompanion";

const TICKER = [
  "FULL-STACK DEVELOPMENT",
  "DATA & AI",
  "INTERFACE CRAFT",
  "SHIP IT",
  "STAY CURIOUS",
];

export default function App() {
  const data = initialData;
  const profile = data.profile;
  const [booting, setBooting] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(true);

  const { scrollYProgress } = useScroll();
  const glow = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.6,
  });

  useEffect(() => {
    document.title = `${profile.shortName} — ${profile.role}`;
  }, [profile]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (booting) return undefined;
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, [booting]);

  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <MotionContext.Provider value={motionEnabled}>
      <MotionConfig reducedMotion="user">
        <div className="page-bg" aria-hidden="true">
          <span className="page-aurora page-aurora-a" />
          <span className="page-aurora page-aurora-b" />
          <span className="page-aurora page-aurora-c" />
          <span className="page-noise" />
        </div>

        <AnimatePresence>
          {booting && (
            <Preloader
              key="preloader"
              name={profile.shortName}
              role={profile.role}
              onDone={finishBoot}
            />
          )}
        </AnimatePresence>

        <Cursor />

        <motion.div
          className="scroll-rail"
          aria-hidden="true"
          style={{ scaleY: glow }}
        />

        <Nav
          profile={profile}
          onToggleMotion={() => setMotionEnabled((value) => !value)}
        />

        <motion.main
          initial={false}
          animate={{
            opacity: booting ? 0 : 1,
            y: booting ? 24 : 0,
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            delay: booting ? 0 : 0.05,
          }}
        >
          <Hero
            profile={profile}
            motionEnabled={motionEnabled}
            ready={!booting}
          />

          <div className="ticker">
            <Marquee items={TICKER} duration={30} separator="✳" />
          </div>

          <Work projects={data.projects} />
          <About profile={profile} />
          <Experience experience={data.experience} />
          <Resume resumes={data.resumes} />
          <Contact profile={profile} />
          <Finale profile={profile} />
        </motion.main>

        <Footer profile={profile} />

        <PetCompanion />
      </MotionConfig>
    </MotionContext.Provider>
  );
}
