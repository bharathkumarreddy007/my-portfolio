const DB = "bharath-portfolio-studio";
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("portfolio");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readPortfolio() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("portfolio", "readonly");
    const request = tx.objectStore("portfolio").get("content");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
export async function savePortfolio(content) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("portfolio", "readwrite");
    tx.objectStore("portfolio").put(content, "content");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(tx.error || new Error("Storage unavailable"));
    };
  });
}
export const MAX_FILE = 100 * 1024 * 1024;
export function checkFile(file, kind) {
  if (!file) return;
  if (file.size > MAX_FILE)
    throw new Error(
      "Please choose a file under 100 MB. You can add multiple files.",
    );
  const valid =
    kind === "image"
      ? /^image\/(jpeg|png|webp|gif|avif)$/i.test(file.type)
      : kind === "video"
        ? /^video\/(mp4|webm|ogg|quicktime)$/i.test(file.type)
        : file.type === "application/pdf";
  if (!valid)
    throw new Error(
      kind === "resume"
        ? "Please upload a PDF résumé."
        : `Please choose a supported ${kind} file.`,
    );
}
export function safeUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}
async function encode(value) {
  if (value instanceof Blob)
    return {
      __file: true,
      name: value.name || "file",
      type: value.type,
      data: await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(value);
      }),
    };
  if (Array.isArray(value)) return Promise.all(value.map(encode));
  if (value && typeof value === "object")
    return Object.fromEntries(
      await Promise.all(
        Object.entries(value).map(async ([k, v]) => [k, await encode(v)]),
      ),
    );
  return value;
}
export async function exportBackup(content) {
  const file = new Blob([JSON.stringify(await encode(content))], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function assert(ok) {
  if (!ok)
    throw new Error(
      "This is not a valid portfolio backup. Your current content has not changed.",
    );
}
function string(value) {
  assert(typeof value === "string" && value.length <= 50000);
  return value;
}
function link(value) {
  string(value);
  assert(!value || safeUrl(value));
  return value;
}
function strings(values) {
  assert(Array.isArray(values) && values.length <= 200);
  return values.map(string);
}
function file(value, kind) {
  if (value === null) return null;
  assert(
    value &&
      value.__file === true &&
      typeof value.data === "string" &&
      typeof value.type === "string" &&
      typeof value.name === "string",
  );
  assert(value.data.startsWith(`data:${value.type};base64,`));
  const encoded = value.data.split(",")[1];
  assert(encoded.length < MAX_FILE * 1.4);
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const result = new File([bytes], value.name, { type: value.type });
  checkFile(result, kind);
  return result;
}
export async function importBackup(input) {
  assert(input.size < 500 * 1024 * 1024);
  const data = JSON.parse(await input.text());
  assert(data && data.version === 1 && data.profile);
  const p = data.profile,
    profile = {};
  for (const key of [
    "name",
    "shortName",
    "role",
    "headline",
    "intro",
    "summary",
    "summaryExtra",
    "location",
    "email",
    "availability",
  ])
    profile[key] = string(p[key]);
  assert(profile.name.trim() && profile.headline.trim());
  for (const key of ["github", "linkedin"]) profile[key] = link(p[key]);
  profile.skills = strings(p.skills);
  profile.photo = file(p.photo, "image");
  const arrays = {};
  for (const key of ["projects", "resumes", "experience"]) {
    assert(Array.isArray(data[key]));
    const ids = new Set();
    arrays[key] = data[key].map((item) => {
      assert(item && typeof item === "object");
      const out = { id: string(item.id) };
      assert(out.id && !ids.has(out.id));
      ids.add(out.id);
      const fields =
        key === "projects"
          ? [
              "title",
              "category",
              "description",
              "year",
              "challenge",
              "solution",
              "outcome",
            ]
          : key === "resumes"
            ? ["title", "detail", "date"]
            : ["role", "company", "period", "description"];
      for (const field of fields) out[field] = string(item[field]);
      if (key === "projects") {
        out.tags = strings(item.tags);
        out.url = link(item.url);
        out.repo = link(item.repo);
        assert(["terminal", "chart", "movies"].includes(item.visual));
        out.visual = item.visual;
        out.video = file(item.video, "video");
        out.cover = file(item.cover, "image");
      }
      if (key === "resumes") {
        out.url = link(item.url);
        out.file = file(item.file, "resume");
        assert(out.file || out.url);
      }
      return out;
    });
  }
  return { version: 1, profile, ...arrays };
}
