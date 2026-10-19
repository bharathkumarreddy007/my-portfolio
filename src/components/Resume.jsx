import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import { useRef } from "react";
import { mediaUrl } from "../media";
import { EASE, Reveal, SectionLabel, Tilt, useMotionEnabled } from "./ui";

function ResumeRow({ resume, index }) {
  const url = mediaUrl(resume.url);
  const isDownload = Boolean(resume.url) && !/^https?:/i.test(resume.url);

  return (
    <Tilt className="resume-row" max={4}>
      <div className="resume-row-icon">
        <FileText size={20} />
      </div>
      <div className="resume-row-info">
        <span className="eyebrow">
          {index === 0 ? "Primary résumé" : `Version ${index + 1}`}
          {isDownload ? " · PDF" : ""}
        </span>
        <h3>{resume.title}</h3>
        <p>
          {resume.detail}
          {resume.date ? ` · ${resume.date}` : ""}
        </p>
      </div>
      {url && (
        <a
          className="icon-btn"
          href={url}
          download={isDownload ? `${resume.title}.pdf` : undefined}
          target={isDownload ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={`${isDownload ? "Download" : "Open"} ${resume.title}`}
          data-cursor={isDownload ? "Download" : "Open"}
        >
          {isDownload ? <Download size={17} /> : <ArrowUpRight size={17} />}
        </a>
      )}
    </Tilt>
  );
}

export default function Resume({ resumes }) {
  const ref = useRef(null);
  const ok = useMotionEnabled();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], ok ? [10, -10] : [0, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ok ? [30, -30] : [0, 0]);

  return (
    <section id="resume" className="section resume-section" ref={ref}>
      <div className="shell resume-grid">
        <Reveal>
          <SectionLabel index="03">The on-paper version</SectionLabel>
          <h2 className="section-title">
            The person.
            <br />
            The skills.
            <br />
            <span className="serif">The PDF</span>
            <i className="dot">.</i>
          </h2>
          <p className="resume-note">
            Skills, projects and everything in between — pick the version that
            fits the conversation.
          </p>

          <motion.div
            className="resume-stack"
            style={{ rotateX: rotate, y: lift, transformPerspective: 1200 }}
            aria-hidden="true"
          >
            <span className="resume-sheet sheet-3" />
            <span className="resume-sheet sheet-2" />
            <span className="resume-sheet sheet-1">
              <i className="sheet-line" />
              <i className="sheet-line" />
              <i className="sheet-line short" />
              <i className="sheet-block" />
              <span>
                <b>GOOD ON PAPER.</b>
                <em>BETTER IN PERSON.</em>
              </span>
            </span>
            <span className="resume-sheet-glow" />
          </motion.div>
        </Reveal>

        <div className="resume-list">
          {resumes.map((resume, index) => (
            <Reveal key={resume.id} delay={0.08 * index} y={34}>
              <ResumeRow resume={resume} index={index} />
            </Reveal>
          ))}
          {!resumes.length && (
            <div className="empty">
              <h3>Your next opportunity starts here.</h3>
              <p>A résumé will be available soon.</p>
            </div>
          )}
          <motion.div
            className="resume-foot"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <FileText size={13} />
            {resumes.length} {resumes.length === 1 ? "résumé" : "résumés"} ·
            Ready when you are
          </motion.div>
        </div>
      </div>
    </section>
  );
}
