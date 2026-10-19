import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { BriefcaseBusiness } from "lucide-react";
import { EASE, Reveal, SectionLabel } from "./ui";

/* Appears automatically once `experience` has entries in src/data.js. */
export default function Experience({ experience }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  if (!experience?.length) return null;

  return (
    <section id="experience" className="section experience-section" ref={ref}>
      <div className="shell">
        <div className="section-head">
          <Reveal>
            <SectionLabel index="✳">The journey</SectionLabel>
            <h2 className="section-title">
              Learning. Building.
              <br />
              <span className="serif">Moving forward</span>
              <i className="dot">.</i>
            </h2>
          </Reveal>
        </div>

        <div className="timeline">
          <span className="timeline-rail" aria-hidden="true">
            <motion.i style={{ scaleY: progress }} />
          </span>
          {experience.map((entry, i) => (
            <Reveal key={entry.id} delay={0.05 * i} className="timeline-row">
              <span className="timeline-node" aria-hidden="true">
                <BriefcaseBusiness size={15} />
              </span>
              <span className="timeline-period">{entry.period}</span>
              <div className="timeline-card">
                <h3>{entry.role}</h3>
                <p className="timeline-company">{entry.company}</p>
                <p>{entry.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <motion.div
        className="timeline-glow"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
      />
    </section>
  );
}
