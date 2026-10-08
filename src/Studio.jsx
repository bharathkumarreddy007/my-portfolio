import React, { useState } from "react";
import {
  UserRound,
  Layers,
  FileText,
  BriefcaseBusiness,
  HardDrive,
  Upload,
  Plus,
  Trash2,
  Save,
  Download,
  ImagePlus,
  Video,
  Check,
  AlertCircle,
} from "lucide-react";
import { Modal, useFileUrl } from "./ui";
import { checkFile, exportBackup, importBackup, safeUrl } from "./storage";
import portrait from "../profile.jpg";
const uid = () => crypto.randomUUID();
const tabs = [
  ["Profile", UserRound],
  ["Projects", Layers],
  ["Résumés", FileText],
  ["Experience", BriefcaseBusiness],
  ["Backup", HardDrive],
];
const today = () => new Date().toISOString().slice(0, 10);
function Field({ label, value, onChange, multiline = false, ...props }) {
  const Component = multiline ? "textarea" : "input";
  return (
    <label className={`field ${multiline ? "field-wide" : ""}`}>
      <span>{label}</span>
      <Component
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
}
function FileUpload({
  label,
  accept,
  onFile,
  multiple = false,
  icon: Icon = Upload,
  children,
}) {
  return (
    <label className="upload-button">
      <Icon size={17} />
      <span>{label}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          onFile(multiple ? Array.from(e.target.files) : e.target.files[0]);
          e.target.value = "";
        }}
      />
      {children}
    </label>
  );
}
function FilePreview({ file, kind }) {
  const url = useFileUrl(file);
  if (!url) return null;
  return kind === "video" ? (
    <video src={url} className="studio-video" controls preload="metadata" />
  ) : (
    <img src={url} className="studio-cover" alt="Uploaded project cover" />
  );
}
export default function Studio({ data, initialTab, onSave, onClose, notify }) {
  const [draft, setDraft] = useState(() => structuredClone(data)),
    [tab, setTab] = useState(initialTab),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(data.projects[0]?.id || ""),
    [resumeLink, setResumeLink] = useState(""),
    [resumeTitle, setResumeTitle] = useState("");
  const profilePhoto = useFileUrl(draft.profile.photo, portrait);
  function change(fn) {
    setDraft((current) => fn(current));
    setDirty(true);
    setError("");
  }
  function profile(key, value) {
    change((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));
  }
  function updateItem(collection, id, key, value) {
    change((d) => ({
      ...d,
      [collection]: d[collection].map((x) =>
        x.id === id ? { ...x, [key]: value } : x,
      ),
    }));
  }
  function remove(collection, id) {
    if (
      window.confirm("Remove this item? The change takes effect when you save.")
    )
      change((d) => ({
        ...d,
        [collection]: d[collection].filter((x) => x.id !== id),
      }));
  }
  function upload(file, kind, callback) {
    if (!file) return;
    try {
      checkFile(file, kind);
      callback(file);
    } catch (e) {
      setError(e.message);
    }
  }
  function close() {
    if (busy) return;
    if (!dirty || window.confirm("Discard your unsaved changes?")) onClose();
  }
  async function save(e) {
    e.preventDefault();
    setError("");
    if (
      !draft.profile.name.trim() ||
      !draft.profile.shortName.trim() ||
      !draft.profile.headline.trim()
    ) {
      setTab("Profile");
      setError("Add your name, preferred name, and headline before saving.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.profile.email)) {
      setTab("Profile");
      setError("Enter a valid contact email address before saving.");
      return;
    }
    if (draft.resumes.some((resume) => !resume.file && !safeUrl(resume.url))) {
      setTab("Résumés");
      setError("Each résumé needs a PDF or a valid document link.");
      return;
    }
    const links = [
      draft.profile.github,
      draft.profile.linkedin,
      ...draft.projects.flatMap((p) => [p.url, p.repo]),
      ...draft.resumes.map((r) => r.url),
    ];
    if (links.some((url) => url && !safeUrl(url))) {
      setError("Use a complete http:// or https:// address for every link.");
      return;
    }
    if (
      draft.projects.some((p) => !p.title.trim()) ||
      draft.resumes.some((r) => !r.title.trim()) ||
      draft.experience.some((e) => !e.role.trim())
    ) {
      setError(
        "Give every project, résumé, and experience entry a title before saving.",
      );
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...draft,
        profile: {
          ...draft.profile,
          skills: draft.profile.skills.map((s) => s.trim()).filter(Boolean),
        },
        projects: draft.projects.map((p) => ({
          ...p,
          tags: p.tags.map((t) => t.trim()).filter(Boolean),
        })),
      });
    } catch (e) {
      setError(
        e.name === "QuotaExceededError"
          ? "Your browser storage is full. Remove a large upload or use smaller files, then save again."
          : "Could not save. Keep this window open and export a backup before retrying. Your changes are still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function backup() {
    setBusy(true);
    setError("");
    try {
      await exportBackup(draft);
      notify("Backup downloaded, including your uploaded files.");
    } catch {
      setError(
        "Backup could not be created. Try removing large videos before exporting.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function restore(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const next = await importBackup(file);
      if (
        window.confirm(
          "Load this backup into the editor? It will replace the current draft. Click Save changes to keep it.",
        )
      ) {
        setDraft(next);
        setSelected(next.projects[0]?.id || "");
        setDirty(true);
        notify("Backup loaded for review. Save changes to keep it.");
      }
    } catch (e) {
      setError(e.message || "Unable to read backup.");
    } finally {
      setBusy(false);
    }
  }
  function addProject() {
    const id = uid();
    change((d) => ({
      ...d,
      projects: [
        ...d.projects,
        {
          id,
          title: "Untitled project",
          category: "Full-stack",
          description: "",
          tags: [],
          year: String(new Date().getFullYear()),
          visual: "terminal",
          url: "",
          repo: "",
          video: null,
          cover: null,
          challenge: "",
          solution: "",
          outcome: "",
        },
      ],
    }));
    setSelected(id);
  }
  const project =
    draft.projects.find((x) => x.id === selected) || draft.projects[0];
  return (
    <Modal title="Your portfolio studio" onClose={close} wide>
      <form onSubmit={save} className="studio-form">
        <div className="studio-banner">
          <HardDrive size={16} />
          <span>
            Saved on this browser. Export a backup to move your work to another
            device.
          </span>
        </div>
        <div
          className="studio-tabs"
          role="tablist"
          aria-label="Editing sections"
        >
          {tabs.map(([name, Icon]) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === name}
              tabIndex={tab === name ? 0 : -1}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const index = tabs.findIndex(([item]) => item === name);
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : (index +
                          (event.key === "ArrowRight" ? 1 : -1) +
                          tabs.length) %
                        tabs.length;
                setTab(tabs[next][0]);
                document.getElementById(`tab-${tabs[next][0]}`)?.focus();
              }}
              aria-controls="studio-panel"
              id={`tab-${name}`}
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </div>
        <div
          className="studio-body"
          id="studio-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
        >
          {tab === "Profile" && (
            <>
              <div className="studio-section-heading">
                <h3>A little more you.</h3>
                <p>Your introduction, your voice, your next opportunity.</p>
              </div>
              <div className="photo-edit">
                <img src={profilePhoto || undefined} alt="Profile preview" />
                <div>
                  <FileUpload
                    label="Upload profile photo"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    icon={ImagePlus}
                    onFile={(f) =>
                      upload(f, "image", (f) => profile("photo", f))
                    }
                  />
                  <small>
                    JPG, PNG, WebP, GIF, or AVIF. A portrait works best.
                  </small>
                  {draft.profile.photo && (
                    <button
                      type="button"
                      className="subtle-button"
                      onClick={() => profile("photo", null)}
                    >
                      Use original photo
                    </button>
                  )}
                </div>
              </div>
              <div className="field-grid">
                <Field
                  label="Full name"
                  value={draft.profile.name}
                  onChange={(v) => profile("name", v)}
                  required
                  maxLength={120}
                />
                <Field
                  label="Preferred name / wordmark"
                  value={draft.profile.shortName}
                  onChange={(v) => profile("shortName", v)}
                  required
                  maxLength={30}
                />
                <Field
                  label="Professional role"
                  value={draft.profile.role}
                  onChange={(v) => profile("role", v)}
                  maxLength={150}
                />
                <Field
                  label="Availability"
                  value={draft.profile.availability}
                  onChange={(v) => profile("availability", v)}
                  maxLength={100}
                />
                <Field
                  label="Hero headline (new line for the italic line)"
                  multiline
                  rows={2}
                  value={draft.profile.headline}
                  onChange={(v) => profile("headline", v)}
                  required
                  maxLength={180}
                />
                <Field
                  label="Short introduction"
                  multiline
                  rows={3}
                  value={draft.profile.intro}
                  onChange={(v) => profile("intro", v)}
                  maxLength={600}
                />
                <Field
                  label="Professional summary"
                  multiline
                  rows={4}
                  value={draft.profile.summary}
                  onChange={(v) => profile("summary", v)}
                  maxLength={3000}
                />
                <Field
                  label="A little more about you"
                  multiline
                  rows={3}
                  value={draft.profile.summaryExtra}
                  onChange={(v) => profile("summaryExtra", v)}
                  maxLength={3000}
                />
                <Field
                  label="Location"
                  value={draft.profile.location}
                  onChange={(v) => profile("location", v)}
                  maxLength={100}
                />
                <Field
                  label="Contact email"
                  type="email"
                  value={draft.profile.email}
                  onChange={(v) => profile("email", v)}
                  required
                />
                <Field
                  label="GitHub URL"
                  type="url"
                  value={draft.profile.github}
                  onChange={(v) => profile("github", v)}
                  placeholder="https://github.com/you"
                />
                <Field
                  label="LinkedIn URL"
                  type="url"
                  value={draft.profile.linkedin}
                  onChange={(v) => profile("linkedin", v)}
                  placeholder="https://linkedin.com/in/you"
                />
                <Field
                  label="Skills (one per line)"
                  multiline
                  rows={5}
                  value={draft.profile.skills.join("\n")}
                  onChange={(v) => profile("skills", v.split("\n"))}
                />
              </div>
            </>
          )}
          {tab === "Projects" && (
            <>
              <div className="studio-section-heading heading-with-action">
                <div>
                  <h3>Show the work. Tell the story.</h3>
                  <p>
                    Add case studies, project links, and video walkthroughs.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-dark button-small"
                  onClick={addProject}
                >
                  <Plus size={16} />
                  Add project
                </button>
              </div>
              {draft.projects.length > 0 ? (
                <>
                  <div className="project-selector">
                    {draft.projects.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={project?.id === p.id ? "active" : ""}
                        onClick={() => setSelected(p.id)}
                      >
                        {p.title || "Untitled project"}
                      </button>
                    ))}
                  </div>
                  {project && (
                    <div className="project-edit" key={project.id}>
                      <div className="field-grid">
                        <Field
                          label="Project title"
                          value={project.title}
                          onChange={(v) =>
                            updateItem("projects", project.id, "title", v)
                          }
                          required
                          maxLength={120}
                        />
                        <Field
                          label="Category"
                          value={project.category}
                          onChange={(v) =>
                            updateItem("projects", project.id, "category", v)
                          }
                          placeholder="Full-stack, Data & AI, Design…"
                          maxLength={50}
                        />
                        <Field
                          label="Short description"
                          multiline
                          rows={3}
                          value={project.description}
                          onChange={(v) =>
                            updateItem("projects", project.id, "description", v)
                          }
                        />
                        <Field
                          label="Technologies (comma separated)"
                          value={project.tags.join(",")}
                          onChange={(v) =>
                            updateItem(
                              "projects",
                              project.id,
                              "tags",
                              v.split(","),
                            )
                          }
                        />
                        <Field
                          label="Year / project label"
                          value={project.year}
                          onChange={(v) =>
                            updateItem("projects", project.id, "year", v)
                          }
                        />
                        <Field
                          label="Live project URL"
                          type="url"
                          value={project.url}
                          onChange={(v) =>
                            updateItem("projects", project.id, "url", v)
                          }
                        />
                        <Field
                          label="Code repository URL"
                          type="url"
                          value={project.repo}
                          onChange={(v) =>
                            updateItem("projects", project.id, "repo", v)
                          }
                        />
                        <label className="field">
                          <span>Default cover design</span>
                          <select
                            value={project.visual}
                            onChange={(e) =>
                              updateItem(
                                "projects",
                                project.id,
                                "visual",
                                e.target.value,
                              )
                            }
                          >
                            <option value="terminal">Midnight code</option>
                            <option value="chart">Lavender analytics</option>
                            <option value="movies">Peach cinema</option>
                          </select>
                        </label>
                        <Field
                          label="The challenge"
                          multiline
                          rows={3}
                          value={project.challenge}
                          onChange={(v) =>
                            updateItem("projects", project.id, "challenge", v)
                          }
                        />
                        <Field
                          label="Your approach"
                          multiline
                          rows={3}
                          value={project.solution}
                          onChange={(v) =>
                            updateItem("projects", project.id, "solution", v)
                          }
                        />
                        <Field
                          label="Outcome / impact"
                          multiline
                          rows={3}
                          value={project.outcome}
                          onChange={(v) =>
                            updateItem("projects", project.id, "outcome", v)
                          }
                        />
                      </div>
                      <div className="media-upload-grid">
                        <div className="media-upload">
                          <ImagePlus size={25} />
                          <h4>Make a first impression.</h4>
                          <p>Add a screenshot or custom cover.</p>
                          <FileUpload
                            label={
                              project.cover ? "Replace cover" : "Upload cover"
                            }
                            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                            onFile={(f) =>
                              upload(f, "image", (f) =>
                                updateItem("projects", project.id, "cover", f),
                              )
                            }
                          />
                          {project.cover && (
                            <>
                              <FilePreview file={project.cover} kind="image" />
                              <button
                                type="button"
                                className="subtle-button"
                                onClick={() =>
                                  updateItem(
                                    "projects",
                                    project.id,
                                    "cover",
                                    null,
                                  )
                                }
                              >
                                Remove cover
                              </button>
                            </>
                          )}
                        </div>
                        <div className="media-upload">
                          <Video size={25} />
                          <h4>Let your work do the talking.</h4>
                          <p>
                            MP4 or WebM recommended. Up to 100 MB per video.
                          </p>
                          <FileUpload
                            label={
                              project.video
                                ? "Replace video"
                                : "Upload project video"
                            }
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            onFile={(f) =>
                              upload(f, "video", (f) =>
                                updateItem("projects", project.id, "video", f),
                              )
                            }
                          />
                          {project.video && (
                            <>
                              <FilePreview file={project.video} kind="video" />
                              <button
                                type="button"
                                className="subtle-button"
                                onClick={() =>
                                  updateItem(
                                    "projects",
                                    project.id,
                                    "video",
                                    null,
                                  )
                                }
                              >
                                Remove video
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => remove("projects", project.id)}
                      >
                        <Trash2 size={15} />
                        Remove project
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="studio-empty">
                  <Layers size={30} />
                  <p>Start with something you’re proud of.</p>
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={addProject}
                  >
                    Create your first project <Plus size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {tab === "Résumés" && (
            <>
              <div className="studio-section-heading">
                <h3>A résumé for every opportunity.</h3>
                <p>
                  Add as many versions as your browser storage allows. The first
                  is your primary résumé.
                </p>
              </div>
              <div className="resume-upload">
                <FileText size={32} />
                <h4>Your next chapter, attached.</h4>
                <p>Upload multiple PDFs at once. Up to 100 MB per file.</p>
                <FileUpload
                  label="Choose PDF files"
                  accept="application/pdf,.pdf"
                  multiple
                  onFile={(files) => {
                    try {
                      files.forEach((f) => checkFile(f, "resume"));
                      change((d) => ({
                        ...d,
                        resumes: [
                          ...d.resumes,
                          ...files.map((f) => ({
                            id: uid(),
                            title: f.name.replace(/\.pdf$/i, ""),
                            detail: "",
                            date: today(),
                            url: "",
                            file: f,
                          })),
                        ],
                      }));
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                />
              </div>
              <div className="resume-link-form">
                <Field
                  label="Or add a résumé link — title"
                  value={resumeTitle}
                  onChange={setResumeTitle}
                  placeholder="Full-stack résumé"
                />
                <Field
                  label="Document URL"
                  type="url"
                  value={resumeLink}
                  onChange={setResumeLink}
                  placeholder="https://…"
                />
                <button
                  className="button button-outline button-small"
                  type="button"
                  onClick={() => {
                    if (!safeUrl(resumeLink) || !resumeTitle.trim()) {
                      setError(
                        "Add a title and a complete http:// or https:// document URL.",
                      );
                      return;
                    }
                    change((d) => ({
                      ...d,
                      resumes: [
                        ...d.resumes,
                        {
                          id: uid(),
                          title: resumeTitle,
                          detail: "",
                          date: today(),
                          url: resumeLink,
                          file: null,
                        },
                      ],
                    }));
                    setResumeTitle("");
                    setResumeLink("");
                  }}
                >
                  <Plus size={16} />
                  Add link
                </button>
              </div>
              <div className="editable-resumes">
                {draft.resumes.map((r, i) => (
                  <div className="editable-resume" key={r.id}>
                    <div className="editable-item-heading">
                      <span className="eyebrow">
                        {i === 0 ? "PRIMARY RÉSUMÉ" : `VERSION ${i + 1}`}
                      </span>
                      <div>
                        {i > 0 && (
                          <button
                            type="button"
                            className="subtle-button"
                            onClick={() =>
                              change((d) => ({
                                ...d,
                                resumes: [
                                  r,
                                  ...d.resumes.filter((x) => x.id !== r.id),
                                ],
                              }))
                            }
                          >
                            Make primary
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-button danger"
                          aria-label={`Remove ${r.title}`}
                          onClick={() => remove("resumes", r.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Résumé title"
                        value={r.title}
                        onChange={(v) =>
                          updateItem("resumes", r.id, "title", v)
                        }
                        required
                      />
                      <Field
                        label="Description / target role"
                        value={r.detail}
                        onChange={(v) =>
                          updateItem("resumes", r.id, "detail", v)
                        }
                      />
                      {!r.file && (
                        <Field
                          label="Résumé URL"
                          type="url"
                          value={r.url}
                          onChange={(v) =>
                            updateItem("resumes", r.id, "url", v)
                          }
                          required
                        />
                      )}
                      <Field
                        label="Date"
                        type="date"
                        value={r.date}
                        onChange={(v) => updateItem("resumes", r.id, "date", v)}
                      />
                    </div>
                    {r.file && (
                      <small className="attached-file">
                        <Check size={13} />
                        {r.file.name} · {(r.file.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </small>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "Experience" && (
            <>
              <div className="studio-section-heading heading-with-action">
                <div>
                  <h3>Your journey deserves a place.</h3>
                  <p>Jobs, internships, education, or meaningful milestones.</p>
                </div>
                <button
                  type="button"
                  className="button button-dark button-small"
                  onClick={() =>
                    change((d) => ({
                      ...d,
                      experience: [
                        ...d.experience,
                        {
                          id: uid(),
                          role: "",
                          company: "",
                          period: "",
                          description: "",
                        },
                      ],
                    }))
                  }
                >
                  <Plus size={16} />
                  Add entry
                </button>
              </div>
              {!draft.experience.length && (
                <div className="studio-empty">
                  <BriefcaseBusiness size={35} />
                  <p>
                    Add your first experience. This section appears on your
                    portfolio once it has content.
                  </p>
                </div>
              )}
              {draft.experience.map((e) => (
                <div className="experience-edit" key={e.id}>
                  <div className="field-grid">
                    <Field
                      label="Role / qualification"
                      value={e.role}
                      onChange={(v) =>
                        updateItem("experience", e.id, "role", v)
                      }
                      required
                    />
                    <Field
                      label="Company / institution"
                      value={e.company}
                      onChange={(v) =>
                        updateItem("experience", e.id, "company", v)
                      }
                    />
                    <Field
                      label="Period"
                      value={e.period}
                      onChange={(v) =>
                        updateItem("experience", e.id, "period", v)
                      }
                      placeholder="2024 — Present"
                    />
                    <Field
                      label="Responsibilities & achievements"
                      multiline
                      rows={3}
                      value={e.description}
                      onChange={(v) =>
                        updateItem("experience", e.id, "description", v)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => remove("experience", e.id)}
                  >
                    <Trash2 size={15} />
                    Remove entry
                  </button>
                </div>
              ))}
            </>
          )}
          {tab === "Backup" && (
            <>
              <div className="studio-section-heading">
                <h3>Your work. Always yours.</h3>
                <p>
                  A portable copy of your portfolio, including photos, résumés,
                  and videos.
                </p>
              </div>
              <div className="backup-grid">
                <div>
                  <Download size={27} />
                  <h4>Take it with you.</h4>
                  <p>
                    Download a backup of everything currently in the editor,
                    including unsaved changes.
                  </p>
                  <button
                    type="button"
                    className="button button-dark button-small"
                    onClick={backup}
                    disabled={busy}
                  >
                    <Download size={16} />
                    Export backup
                  </button>
                </div>
                <div>
                  <Upload size={27} />
                  <h4>Pick up where you left off.</h4>
                  <p>
                    Import a portfolio backup, review it, then save. Your
                    existing content stays until you save.
                  </p>
                  <FileUpload
                    label="Import backup"
                    accept="application/json,.json"
                    onFile={restore}
                  />
                </div>
              </div>
              <div className="storage-explainer">
                <HardDrive size={22} />
                <div>
                  <h4>A note about your personal studio</h4>
                  <p>
                    Your changes live in this browser on this website address.
                    Clearing site data removes them. They don’t sync to other
                    devices or update what other visitors see. Export backups
                    regularly, especially before changing devices or website
                    addresses.
                  </p>
                  <p>
                    There’s no fixed limit on the number of résumés or projects;
                    available browser storage sets the limit. Individual uploads
                    are limited to 100 MB. Online publishing and account-based
                    editing can be added later.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        {error && (
          <div className="studio-error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}
        <footer className="studio-footer">
          <span>
            <span className={`save-dot ${dirty ? "unsaved" : ""}`} />
            {busy
              ? "Working…"
              : dirty
                ? "You have unsaved changes"
                : "All changes saved"}
          </span>
          <div>
            <button
              type="button"
              className="button button-outline button-small"
              onClick={close}
              disabled={busy}
            >
              Close
            </button>
            <button
              type="submit"
              className="button button-dark button-small"
              disabled={busy}
            >
              <Save size={16} />
              {busy ? "Please wait…" : "Save changes"}
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
