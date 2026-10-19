import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, X } from "lucide-react";
import { mediaUrl, safeUrl } from "../media";
import ProjectArt from "./ProjectArt";
import { EASE } from "./ui";
import { lockScroll } from "../scroll";

/* A case study that unfolds in 3D — a card lifting off the page toward you. */
export default function ProjectModal({ project, onClose }) {
  const close = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    close.current?.focus();
    lockScroll(true);
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, [onClose]);

  const video = mediaUrl(project.video);
  const live = safeUrl(project.url);
  const repo = safeUrl(project.repo);
  const sections = [
    ["The challenge", project.challenge],
    ["The approach", project.solution],
    ["The takeaway", project.outcome],
  ].filter(([, text]) => Boolean(text));

  return createPortal(
    <div className="modal-layer">
      <motion.button
        type="button"
        className="modal-backdrop"
        aria-label="Close case study"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      />

      <div className="modal-stage">
        <motion.div
          className="modal-panel"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          style={{ transformPerspective: 1700 }}
          initial={{ opacity: 0, y: 90, rotateX: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, rotateX: -8, scale: 0.97 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="modal-head">
            <div className="modal-head-meta">
              <span className="tag">{project.category}</span>
              <span className="modal-year">{project.year}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              ref={close}
              aria-label="Close case study"
              data-cursor="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <h2 className="modal-title">{project.title}</h2>
            <p className="modal-lede">{project.description}</p>

            <div className="modal-visual">
              {video ? (
                <video
                  src={video}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${project.title} walkthrough`}
                />
              ) : (
                <ProjectArt project={project} detailed />
              )}
            </div>

            <div className="modal-tags">
              {project.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="modal-sections">
              {sections.map(([title, text], i) => (
                <motion.div
                  className="modal-section"
                  key={title}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: 0.25 + i * 0.08,
                  }}
                >
                  <span className="modal-section-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </motion.div>
              ))}
            </div>

            <div className="modal-actions">
              {live && (
                <a
                  className="btn btn-primary"
                  href={live}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Visit the project</span>
                  <ArrowUpRight size={16} />
                </a>
              )}
              {repo && (
                <a
                  className="btn btn-ghost"
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} />
                  <span>Source code</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
