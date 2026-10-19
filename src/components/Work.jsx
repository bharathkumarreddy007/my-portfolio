import React, { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { mediaUrl } from "../media";
import ProjectArt from "./ProjectArt";
import ProjectModal from "./ProjectModal";
import { EASE, Reveal, SectionLabel, Tilt } from "./ui";

function ProjectCard({ project, index, total, onOpen }) {
  const video = mediaUrl(project.video);
  const badge = video ? "Watch walkthrough" : project.category;
  return (
    <motion.article
      layout
      className={`project-card ${index === 0 ? "is-featured" : ""}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 3) * 0.06 }}
    >
      <Tilt className="project-surface" max={6}>
        <button
          type="button"
          className="project-art-button"
          onClick={() => onOpen(project)}
          data-cursor="Open case"
          aria-label={`${badge} — open the ${project.title} case study`}
        >
          <ProjectArt project={project} />
          <span className="project-badge">
            {video ? (
              <>
                <Play size={12} /> {badge.toUpperCase()}
              </>
            ) : (
              project.category
            )}
          </span>
        </button>

        <div className="project-body">
          <div className="project-meta">
            <span>
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            <span>{project.year}</span>
          </div>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-text">{project.description}</p>
          <div className="tag-row">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="link-arrow"
            onClick={() => onOpen(project)}
          >
            <span>Read the case study</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </Tilt>
    </motion.article>
  );
}

export default function Work({ projects }) {
  const [filter, setFilter] = useState("All work");
  const [active, setActive] = useState(null);

  const filters = useMemo(
    () => [
      "All work",
      ...new Set(projects.map((p) => p.category).filter(Boolean)),
    ],
    [projects],
  );
  const visible = projects.filter(
    (project) => filter === "All work" || project.category === filter,
  );

  return (
    <section id="work" className="section work-section">
      <div className="shell">
        <div className="section-head">
          <Reveal>
            <SectionLabel index="01">The project files</SectionLabel>
            <h2 className="section-title">
              Less talking.
              <br />
              <span className="serif">More making</span>
              <i className="dot">.</i>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="section-aside">
            <p>
              From a “what if” to a working thing — a collection of ideas I
              actually shipped and learned from.
            </p>
            <div
              className="filter-row"
              role="group"
              aria-label="Filter projects"
            >
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter ${filter === item ? "is-active" : ""}`}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {filter === item && (
                    <motion.span
                      layoutId="filter-pill"
                      className="filter-pill"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="filter-label">{item}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <LayoutGroup>
          <motion.div layout className="project-grid">
            <AnimatePresence mode="popLayout">
              {visible.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  total={visible.length}
                  onOpen={setActive}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {!projects.length && (
          <div className="empty">
            <h3>Great things start with a first project.</h3>
            <p>New work is taking shape — check back soon.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <ProjectModal project={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
