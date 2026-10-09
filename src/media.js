export function safeUrl(value) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

// Resolve repository media relative to the deployed project, including GitHub Pages.
export function mediaUrl(value, fallback = "") {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const source = value.trim();
  const remote = safeUrl(source);
  if (remote) return remote;
  if (
    /^[a-z][a-z\d+.-]*:|^\/\/|\\/i.test(source) ||
    source.split("/").includes("..")
  )
    return fallback;
  return new URL(
    source.replace(/^\/+/, ""),
    new URL(import.meta.env.BASE_URL, document.baseURI),
  ).href;
}
