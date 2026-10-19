import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import portrait from "../../profile.jpg";
import { mediaUrl } from "../media";
import { EASE, Marquee, Reveal, SectionLabel, Tilt } from "./ui";

export default function About({ profile }) {
  const photo = mediaUrl(profile.photo, portrait);
  const skills = profile.skills || [];
  const stats = profile.stats || [];
  const capabilities = profile.capabilities || [];

  return (
    <section id="about" className="section about-section">
      <div className="shell">
        <div className="section-head">
          <Reveal>
            <SectionLabel index="02">A little about me</SectionLabel>
            <h2 className="section-title">
              Big curiosity.
              <br />
              <span className="serif">Bigger ideas</span>
              <i className="dot">.</i>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="section-aside">
            <p>
              I build at the intersection of software, data and design — and I
              care a lot about how the finished thing feels in your hands.
            </p>
          </Reveal>
        </div>

        <div className="about-grid">
          <Reveal className="about-portrait-wrap">
            <Tilt className="about-portrait" max={7}>
              <div className="portrait-frame">
                <img src={photo} alt={profile.name} loading="lazy" />
                <span className="portrait-glow" aria-hidden="true" />
              </div>
              <span className="portrait-chip portrait-chip-a">
                <i className="status-dot" />
                {profile.availability}
              </span>
              <span className="portrait-chip portrait-chip-b">
                <MapPin size={13} /> {profile.location}
              </span>
              <span className="portrait-ring" aria-hidden="true" />
            </Tilt>
          </Reveal>

          <div className="about-copy">
            <Reveal delay={0.05}>
              <p className="about-lead">{profile.summary}</p>
              <p className="about-body">{profile.summaryExtra}</p>
              <div className="about-signature">
                <span className="serif">
                  {(profile.shortName || "").toLowerCase()}.
                </span>
                <span>{profile.role}</span>
              </div>
            </Reveal>

            <div className="stat-grid">
              {stats.map((stat, i) => (
                <Reveal
                  className="stat-card"
                  key={stat.label}
                  delay={0.08 * i}
                  y={26}
                  rotate={5}
                >
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {capabilities.length > 0 && (
          <div className="capability-grid">
            {capabilities.map((item, i) => (
              <Reveal key={item.title} delay={0.06 * i} y={40}>
                <motion.article
                  className="capability-card"
                  whileHover={{ y: -8 }}
                >
                  <span className="capability-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <div className="tag-row">
                    {(item.tags || []).map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="capability-sheen" aria-hidden="true" />
                </motion.article>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <div className="skill-marquees">
        <Marquee items={skills} duration={34} />
        <Marquee
          items={[...skills].reverse()}
          duration={42}
          reverse
          separator="◦"
        />
      </div>

      <div className="shell">
        <Reveal className="toolkit-note">
          <span className="eyebrow">
            <i className="eyebrow-index">✳</i>
            The tools change. The curiosity stays.
          </span>
          <motion.i
            className="toolkit-line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
        </Reveal>
      </div>
    </section>
  );
}
