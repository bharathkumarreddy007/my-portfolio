import React, { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Code2,
  Github,
  Linkedin,
  MapPin,
  Pause,
  FileText,
  Download,
  Play,
  X,
  Menu,
  Layers,
  Sparkles,
  Check,
  Copy,
  Circle,
  BriefcaseBusiness,
} from "lucide-react";
import portrait from "../profile.jpg";
import { initialData } from "./data";
import { mediaUrl, safeUrl } from "./media";
import { Reveal, Modal, ExternalLink } from "./ui";
import CreativeHero, { Tilt, Playground, Burst } from "./CreativeHero";
import { MotionPreference } from "./ui";

function ProjectVisual({ project }) {
  const cover = mediaUrl(project.cover);
  if (cover)
    return (
      <img
        src={cover}
        alt={`${project.title} project cover`}
        className="project-cover"
        loading="lazy"
      />
    );
  return (
    <div className={`project-art art-${project.visual}`} aria-hidden="true">
      {project.visual === "terminal" ? (
        <div className="terminal-window">
          <div className="window-bar">
            <i />
            <i />
            <i />
            <span>secure-query.java</span>
          </div>
          <div className="code-lines">
            <p>
              <span>public class</span> SecureQuery {"{"}
            </p>
            <p>
              &nbsp; <span>private</span> String encrypt(data);
            </p>
            <p>
              &nbsp; <em>// privacy, by design.</em>
            </p>
            <p>
              &nbsp; return <b>possibilities</b>;
            </p>
            <p>{"}"}</p>
          </div>
          <div className="terminal-status">
            <span className="status-dot" /> CONNECTION ENCRYPTED{" "}
            <Code2 size={16} />
          </div>
        </div>
      ) : project.visual === "chart" ? (
        <div className="analytics-window">
          <div className="analytics-heading">
            <span>
              <i /> OVERVIEW
            </span>
            <Layers size={16} />
          </div>
          <div className="chart-caption">A clearer perspective.</div>
          <div className="bars">
            {[28, 46, 37, 65, 52, 76, 64, 95, 83].map((h, i) => (
              <div key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="chart-bottom">
            <span>DATA</span>
            <span>INTO INSIGHT ↗</span>
          </div>
        </div>
      ) : (
        <div className="movie-art">
          <div className="movie-ticket ticket-one">
            <div className="ticket-orbit" />
            <span>
              THE NEXT
              <br />
              <b>GREAT STORY.</b>
            </span>
            <div className="ticket-footer">
              CURATED FOR YOU <Sparkles size={16} />
            </div>
          </div>
          <div className="movie-ticket ticket-two">
            <Play size={28} fill="currentColor" />
            <span>
              PRESS PLAY
              <br />
              ON POSSIBILITY.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
function ProjectCard({ project, index, onOpen }) {
  return (
    <Reveal
      delay={(index % 2) * 0.08}
      className={`project-card ${index === 0 ? "featured-project" : ""}`}
    >
      <Tilt className="project-card-surface" intensity={2}>
        <button
          className="project-image-button"
          onClick={() => onOpen(project)}
          aria-label={`View ${project.title}`}
        >
          <ProjectVisual project={project} />
          <span className="project-float-tag">
            {project.video ? (
              <>
                <Play size={13} /> WATCH THE WALKTHROUGH
              </>
            ) : (
              project.category
            )}
          </span>
          <span className="project-open">
            <ArrowUpRight size={25} />
          </span>
        </button>
        <div className="project-card-body">
          <div className="project-meta">
            <span>PROJECT / {String(index + 1).padStart(2, "0")}</span>
            <span>{project.year}</span>
          </div>
          <button className="project-title" onClick={() => onOpen(project)}>
            <h3>{project.title}</h3>
            <ArrowUpRight size={22} />
          </button>
          <p className="project-description">{project.description}</p>
          <div className="tags">
            {project.tags.map((tag, i) => (
              <span key={i}>{tag}</span>
            ))}
          </div>
          <button
            className="project-case-link text-link"
            onClick={() => onOpen(project)}
          >
            Explore the project <ArrowRight size={16} />
          </button>
        </div>
      </Tilt>
    </Reveal>
  );
}
function ProjectDetail({ project, onClose }) {
  const video = mediaUrl(project.video);
  return (
    <Modal title={project.title} onClose={onClose} wide>
      <div className="case-study">
        <div className="case-visual">
          {video ? (
            <video
              src={video}
              controls
              playsInline
              preload="metadata"
              aria-label={`${project.title} walkthrough`}
            />
          ) : (
            <ProjectVisual project={project} />
          )}
        </div>
        <div className="tags">
          {project.tags.map((tag, i) => (
            <span key={i}>{tag}</span>
          ))}
        </div>
        <p className="case-intro">{project.description}</p>
        {[
          ["The challenge", project.challenge],
          ["The approach", project.solution],
          ["The takeaway", project.outcome],
        ].map(
          ([label, text]) =>
            text && (
              <div className="case-section" key={label}>
                <h3>{label}</h3>
                <p>{text}</p>
              </div>
            ),
        )}
        <div className="button-row">
          {safeUrl(project.url) && (
            <ExternalLink
              href={safeUrl(project.url)}
              className="button button-dark"
            >
              Visit project
            </ExternalLink>
          )}
          {safeUrl(project.repo) && (
            <ExternalLink
              href={safeUrl(project.repo)}
              className="button button-outline"
            >
              <Github size={17} /> View code
            </ExternalLink>
          )}
        </div>
      </div>
    </Modal>
  );
}
function ResumeCard({ resume, index }) {
  const url = mediaUrl(resume.url);
  const isDownload = !!resume.url && !/^https?:/i.test(resume.url);
  return (
    <div className="resume-card">
      <div className="resume-icon">
        <FileText size={25} />
      </div>
      <div className="resume-info">
        <span className="eyebrow">
          {index === 0
            ? "PRIMARY RÉSUMÉ"
            : `VERSION ${String(index + 1).padStart(2, "0")}`}
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
          href={url}
          download={isDownload ? `${resume.title}.pdf` : undefined}
          target={isDownload ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="icon-button"
          aria-label={`${isDownload ? "Download" : "Open"} ${resume.title}`}
        >
          {isDownload ? <Download size={21} /> : <ArrowUpRight size={21} />}
        </a>
      )}
    </div>
  );
}
export default function App() {
  const data = initialData;
  const [activeProject, setActiveProject] = useState(null),
    [filter, setFilter] = useState("All work"),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [copying, setCopying] = useState(false);
  const [mood, setMood] = useState(() => {
    try {
      return ["violet", "blue", "pink"].includes(
        localStorage.getItem("portfolio-mood"),
      )
        ? localStorage.getItem("portfolio-mood")
        : "violet";
    } catch {
      return "violet";
    }
  });
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const reducedMotion = useReducedMotion();
  const motionActive = animationEnabled && !reducedMotion;
  useEffect(() => {
    document.documentElement.dataset.mood = mood;
    try {
      localStorage.setItem("portfolio-mood", mood);
    } catch {}
  }, [mood]);
  useEffect(() => {
    document.documentElement.dataset.motion = motionActive
      ? "active"
      : "paused";
  }, [motionActive]);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const photo = mediaUrl(data.profile.photo, portrait);
  const p = data.profile;
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    document.title = `${p.name} — ${p.role}`;
  }, [p.name, p.role]);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(p.email);
      setCopying(true);
      setToast("Email address copied.");
      setTimeout(() => setCopying(false), 2000);
    } catch {
      setToast(`Email: ${p.email}`);
    }
  }
  const filters = [
    "All work",
    ...new Set(data.projects.map((x) => x.category).filter(Boolean)),
  ];
  const visible = data.projects.filter(
    (x) =>
      filter === "All work" ||
      !filters.includes(filter) ||
      x.category === filter,
  );
  return (
    <MotionPreference.Provider value={motionActive}>
      <MotionConfig reducedMotion={motionActive ? "user" : "always"}>
        <motion.div
          className="scroll-progress"
          style={{ scaleX: motionActive ? progress : scrollYProgress }}
        />
        <header className="site-header">
          <a className="wordmark" href="#home" aria-label="Go to top">
            <span className="brand-mark" aria-hidden="true">
              <Burst />
            </span>
            {p.shortName.toLowerCase()}
            <span className="brand-dot">.</span>
          </a>
          <nav
            className={menu ? "main-nav is-open" : "main-nav"}
            aria-label="Main navigation"
          >
            {[
              ["Work", "work"],
              ["About", "about"],
              ["Résumé", "resume"],
              ["Contact", "contact"],
            ].map(([text, id]) => (
              <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>
                {text}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="motion-toggle icon-button"
              aria-label={
                reducedMotion
                  ? "Reduced motion is enabled on your device"
                  : motionActive
                    ? "Pause animations"
                    : "Enable animations"
              }
              title={
                reducedMotion
                  ? "Your device prefers reduced motion"
                  : motionActive
                    ? "Pause animations"
                    : "Enable animations"
              }
              disabled={!!reducedMotion}
              onClick={() => setAnimationEnabled(!animationEnabled)}
            >
              {motionActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <a className="header-contact" href="#contact">
              Let’s talk <ArrowUpRight size={16} />
            </a>
            <button
              className="menu-button icon-button"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        <main>
          <CreativeHero
            profile={p}
            photo={photo}
            mood={mood}
            setMood={setMood}
          />
          <div className="ticker" aria-hidden="true">
            <div>
              {[
                "BUILD SOMETHING GOOD",
                "MAKE IT A LITTLE DIFFERENT",
                "STAY CURIOUS",
                "BUILD SOMETHING GOOD",
                "MAKE IT A LITTLE DIFFERENT",
                "STAY CURIOUS",
              ].map((t, i) => (
                <React.Fragment key={i}>
                  <span>{t}</span>
                  <b>
                    <Sparkles size={24} />
                  </b>
                </React.Fragment>
              ))}
            </div>
          </div>
          <section id="work" className="section-shell work-section">
            <Reveal className="section-heading">
              <div>
                <span className="eyebrow">01 — THE PROJECT FILES</span>
                <h2>
                  Less talking.
                  <br />
                  <span className="serif">
                    More making<span className="orange-dot">.</span>
                  </span>
                </h2>
              </div>
              <p>
                From a “what if” to a working thing.
                <br />A collection of ideas I brought to life.
              </p>
            </Reveal>
            <div className="work-toolbar">
              <div className="filter-list" aria-label="Filter projects">
                {filters.map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "filter active" : "filter"}
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                    {f === "All work" && (
                      <span>
                        {data.projects.length.toString().padStart(2, "0")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <span className="small-label">A COLLECTION IN PROGRESS ↗</span>
            </div>
            <div className="project-grid">
              {visible.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onOpen={setActiveProject}
                />
              ))}
            </div>
            {!data.projects.length && (
              <div className="empty-public">
                <Layers size={30} />
                <h3>Great things start with a first project.</h3>
                <p>New ideas are taking shape. Check back soon.</p>
              </div>
            )}
            <div className="work-footnote">
              <span>Always making room for the next idea.</span>
              {safeUrl(p.github) && (
                <ExternalLink className="text-link" href={safeUrl(p.github)}>
                  More on GitHub
                </ExternalLink>
              )}
            </div>
          </section>
          <Playground />
          <section id="about" className="about-section">
            <div className="section-shell">
              <Reveal className="about-grid">
                <div>
                  <span className="eyebrow">02 — A LITTLE ABOUT ME</span>
                  <h2>
                    Big curiosity.
                    <br />
                    <span className="serif">Bigger ideas.</span>
                    <span className="about-asterisk" aria-hidden="true">
                      <Burst />
                    </span>
                  </h2>
                  <div className="about-location">
                    <MapPin size={17} />
                    {p.location}
                    <span> / </span>Open to what’s next
                  </div>
                </div>
                <div className="about-copy">
                  <p className="summary-lead">{p.summary}</p>
                  <p>{p.summaryExtra}</p>
                  <div className="about-signature">
                    <span className="signature">{p.shortName}.</span>
                    <span>{p.role}</span>
                  </div>
                </div>
              </Reveal>
              <Reveal className="toolkit">
                <div>
                  <span className="eyebrow">MY EVERYDAY TOOLKIT</span>
                  <p>
                    The tools change.
                    <br />
                    The curiosity stays.
                  </p>
                </div>
                <div className="skills">
                  {p.skills.map((skill, i) => (
                    <span key={i}>
                      <span className="skill-dot" />
                      {skill}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
          {data.experience.length > 0 && (
            <section
              id="experience"
              className="section-shell experience-section"
            >
              <Reveal className="section-heading">
                <div>
                  <span className="eyebrow">THE JOURNEY</span>
                  <h2>
                    Learning. Building.
                    <br />
                    <span className="serif">Moving forward.</span>
                  </h2>
                </div>
              </Reveal>
              {data.experience.map((e) => (
                <Reveal className="experience-row" key={e.id}>
                  <span>{e.period}</span>
                  <div>
                    <h3>{e.role}</h3>
                    <p className="experience-company">{e.company}</p>
                    <p>{e.description}</p>
                  </div>
                  <BriefcaseBusiness size={23} />
                </Reveal>
              ))}
            </section>
          )}
          <section id="resume" className="section-shell resume-section">
            <Reveal className="resume-grid">
              <div>
                <span className="eyebrow">03 — THE ON-PAPER VERSION</span>
                <h2>
                  The person.
                  <br />
                  The skills.
                  <br />
                  <span className="serif">The PDF.</span>
                </h2>
                <p>
                  Skills, experience, and everything in between.
                  <br />
                  Find the résumé that fits the conversation.
                </p>
                <div className="resume-decoration" aria-hidden="true">
                  <FileText size={47} />
                  <span>
                    GOOD ON PAPER.
                    <br />
                    BETTER IN PERSON.
                  </span>
                  <ArrowUpRight size={24} />
                </div>
              </div>
              <div className="resume-list">
                {data.resumes.map((resume, i) => (
                  <ResumeCard key={resume.id} resume={resume} index={i} />
                ))}
                {!data.resumes.length && (
                  <div className="empty-public">
                    <FileText size={30} />
                    <h3>Your next opportunity starts here.</h3>
                    <p>A résumé will be available here soon.</p>
                  </div>
                )}
                <div className="resume-note">
                  <FileText size={14} />
                  {data.resumes.length}{" "}
                  {data.resumes.length === 1 ? "résumé" : "résumés"} · Ready for
                  your next opportunity
                </div>
              </div>
            </Reveal>
          </section>
          <section id="contact" className="contact-section">
            <div className="section-shell">
              <Reveal>
                <div className="contact-top">
                  <span className="eyebrow">
                    04 — YOUR IDEA. OUR NEXT CONVERSATION.
                  </span>
                  <span>
                    <span className="status-dot" />
                    {p.availability}
                  </span>
                </div>
                <h2>
                  Good things
                  <br />
                  start with <span className="serif">hello.</span>
                  <span className="contact-star" aria-hidden="true">
                    <Burst />
                  </span>
                </h2>
                <div className="contact-bottom">
                  <div>
                    <p>A good conversation is where great things begin.</p>
                    <div className="email-row">
                      <a className="email-link" href={`mailto:${p.email}`}>
                        {p.email}
                        <ArrowUpRight size={25} />
                      </a>
                      <button
                        className="icon-button"
                        onClick={copyEmail}
                        aria-label="Copy email address"
                      >
                        {copying ? <Check size={17} /> : <Copy size={17} />}
                      </button>
                    </div>
                  </div>
                  <div className="social-links">
                    {safeUrl(p.github) && (
                      <ExternalLink href={safeUrl(p.github)}>
                        <Github size={17} />
                        GitHub
                      </ExternalLink>
                    )}
                    {safeUrl(p.linkedin) && (
                      <ExternalLink href={safeUrl(p.linkedin)}>
                        <Linkedin size={17} />
                        LinkedIn
                      </ExternalLink>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
        <footer className="site-footer section-shell">
          <span>
            © {new Date().getFullYear()} {p.name}
          </span>
          <span>Built with curiosity. A little differently.</span>
          <a href="#home">
            BACK TO TOP <ArrowUpRight size={14} />
          </a>
        </footer>
        {activeProject && (
          <ProjectDetail
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />
        )}
        <div
          role="status"
          aria-live="polite"
          className={`toast ${toast ? "visible" : ""}`}
        >
          {toast && (
            <>
              <Circle size={11} fill="currentColor" />
              {toast}
            </>
          )}
        </div>
      </MotionConfig>
    </MotionPreference.Provider>
  );
}
