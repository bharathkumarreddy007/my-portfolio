import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
const pdf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
const openStudio = async (page, tab) => {
  await page.getByRole("button", { name: "Edit portfolio" }).click();
  if (tab) await page.getByRole("tab", { name: tab, exact: true }).click();
};
const save = async (page) => {
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
};

test("profile, skills, photo, and experience persist after a reload", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Thoughtful code.");
  await openStudio(page);
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Bharath — Software Engineer");
  await page
    .getByLabel("Short introduction")
    .fill("I build useful software and thoughtful experiences.");
  await page
    .getByLabel("Professional summary")
    .fill("My updated professional summary.");
  await page
    .getByLabel("Skills (one per line)")
    .fill("React\nTypeScript\nPython");
  await page
    .locator(".photo-edit input[type=file]")
    .setInputFiles("profile.jpg");
  await page.getByRole("tab", { name: "Experience", exact: true }).click();
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByLabel("Role / qualification").fill("Software Developer");
  await page.getByLabel("Company / institution").fill("Example Company");
  await page.getByLabel("Period", { exact: true }).fill("2025 — Present");
  await page
    .getByLabel("Responsibilities & achievements")
    .fill("Built accessible interfaces.");
  await save(page);
  await page.reload();
  await expect(page.locator(".summary-lead")).toHaveText(
    "My updated professional summary.",
  );
  await expect(page.locator(".skills")).toHaveText("ReactTypeScriptPython");
  await expect(page.locator("#experience")).toContainText("Example Company");
  await expect(page.locator(".portrait-frame img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  expect(errors).toEqual([]);
});

test("projects support case studies, media playback, filtering, and deletion", async ({
  page,
}) => {
  await page.goto("/");
  await openStudio(page, "Projects");
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByLabel("Project title").fill("Accessible Task Board");
  await page.getByLabel("Category", { exact: true }).fill("Product");
  await page
    .getByLabel("Short description")
    .fill("A keyboard-friendly task board.");
  await page
    .getByLabel("Technologies (comma separated)")
    .fill("React,TypeScript");
  await page
    .getByLabel("The challenge", { exact: true })
    .fill("Make planning accessible.");
  await page.getByLabel("Live project URL").fill("https://example.com");
  await page
    .locator(".media-upload")
    .nth(0)
    .locator("input")
    .setInputFiles("profile.jpg");
  await page
    .locator(".media-upload")
    .nth(1)
    .locator("input")
    .setInputFiles("tests/fixtures/demo.webm");
  await save(page);
  await page.reload();
  await page.getByRole("button", { name: "Product", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "View Accessible Task Board", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Make planning accessible.",
  );
  const video = page.locator(".case-visual video");
  await expect(video).toHaveAttribute("src", /^blob:/);
  await expect
    .poll(() => video.evaluate((el) => el.readyState))
    .toBeGreaterThanOrEqual(1);
  await video.evaluate(async (el) => {
    el.muted = true;
    await el.play();
  });
  await expect
    .poll(() => video.evaluate((el) => el.currentTime))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: "Visit project" }),
  ).toHaveAttribute("href", "https://example.com/");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await openStudio(page, "Projects");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Accessible Task Board", exact: true })
    .click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Remove project", exact: true })
    .click();
  await save(page);
  await expect(
    page.getByRole("button", {
      name: "View Accessible Task Board",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("multiple PDF résumés download correctly and backups restore uploaded files", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await openStudio(page, "Résumés");
  await page.locator(".resume-upload input").setInputFiles([
    { name: "Frontend.pdf", mimeType: "application/pdf", buffer: pdf },
    { name: "Backend.pdf", mimeType: "application/pdf", buffer: pdf },
  ]);
  await page
    .locator(".editable-resume")
    .last()
    .getByRole("button", { name: "Make primary" })
    .click();
  await page.getByRole("tab", { name: "Projects", exact: true }).click();
  await page
    .locator(".media-upload")
    .nth(1)
    .locator("input")
    .setInputFiles("tests/fixtures/demo.webm");
  await save(page);
  await page.reload();
  await expect(page.locator(".resume-card")).toHaveCount(3);
  await expect(page.locator(".resume-card").first()).toContainText("Backend");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download Backend", exact: true })
    .click();
  const download = await downloadPromise;
  expect(await readFile(await download.path())).toEqual(pdf);
  await openStudio(page, "Backup");
  const backupPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const backup = await backupPromise;
  const backupPath = await backup.path();
  const exported = JSON.parse(await readFile(backupPath, "utf8"));
  expect(exported.resumes[0].file.__file).toBe(true);
  expect(exported.projects[0].video.type).toBe("video/webm");
  const other = await browser.newContext();
  const restored = await other.newPage();
  await restored.goto("/");
  await openStudio(restored, "Backup");
  restored.once("dialog", (d) => d.accept());
  await restored.locator(".backup-grid input").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: await readFile(backupPath),
  });
  await expect(restored.locator(".studio-footer")).toContainText("unsaved");
  await save(restored);
  await restored.reload();
  await expect(restored.locator(".resume-card")).toHaveCount(3);
  await expect(restored.locator(".resume-card").first()).toContainText(
    "Backend",
  );
  await restored
    .getByRole("button", { name: "View Secure Query Processing", exact: true })
    .click();
  await expect
    .poll(() =>
      restored.locator(".case-visual video").evaluate((el) => el.readyState),
    )
    .toBeGreaterThanOrEqual(1);
  await other.close();
});

test("invalid uploads and malicious backups leave saved content intact", async ({
  page,
}) => {
  await page.goto("/");
  await openStudio(page, "Résumés");
  await page.locator(".resume-upload input").setInputFiles({
    name: "bad.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText("PDF");
  await expect(page.locator(".editable-resume")).toHaveCount(1);
  await page.getByRole("tab", { name: "Backup", exact: true }).click();
  await page.locator(".backup-grid input").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      '{"version":1,"profile":{"github":"javascript:alert(1)"}}',
    ),
  });
  await expect(page.getByRole("alert")).toContainText(
    "not a valid portfolio backup",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Thoughtful code.");
});

test("mobile navigation, reduced motion, keyboard dialog close, and responsive layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("navigation")).not.toBeVisible();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole("navigation")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".ticker>div")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await openStudio(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit portfolio" }),
  ).toBeFocused();
  await page.screenshot({ path: "/tmp/portfolio-mobile.png", fullPage: true });
});
