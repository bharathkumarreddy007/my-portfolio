import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("public portfolio ignores old browser edits and has no editing controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open("bharath-portfolio-studio", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("portfolio");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result,
          tx = db.transaction("portfolio", "readwrite");
        tx.objectStore("portfolio").put(
          {
            profile: {
              name: "Unpublished private edit",
              headline: "Private browser content",
            },
          },
          "content",
        );
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
    });
  });
  await page.goto("/#studio");
  await expect(page.locator("h1")).toContainText("Build things.");
  await expect(page.locator(".portrait-caption")).toContainText(
    "Bharath Kumar Reddy",
  );
  await expect(page.getByText("Unpublished private edit")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: /edit portfolio|add project|manage résumés|save changes/i,
    }),
  ).toHaveCount(0);
  await expect(page.locator("input[type=file]")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("project filters and keyboard-accessible case studies work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Data & AI", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(2);
  await page
    .getByRole("button", { name: "View E-Commerce Dashboard", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("The challenge");
  await expect(page.getByRole("link", { name: "View code" })).toHaveAttribute(
    "href",
    "https://github.com/bharathkumarreddy007",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "View E-Commerce Dashboard",
      exact: true,
    }),
  ).toBeFocused();
  await page.getByRole("button", { name: /All work/ }).click();
  await expect(page.locator(".project-card")).toHaveCount(3);
});

test("color moods persist, playful controls respond, and motion can be paused", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Hot pink mood" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mood", "pink");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Hot pink mood" }),
  ).toHaveAttribute("aria-pressed", "true");
  const shape = page.locator(".shape-0");
  const before = await shape.evaluate((el) => getComputedStyle(el).transform);
  await page.getByRole("button", { name: "Shuffle the shapes" }).click();
  await expect
    .poll(() => shape.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
  await page.getByRole("button", { name: "Make something happen" }).click();
  await expect(page.locator(".playground-message")).toHaveText(
    "A little curiosity goes a long way.",
  );
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  expect(
    await page
      .locator(".ticker>div")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "Make something happen" }).click();
  await expect(page.locator(".playground-message")).toHaveText(
    "Make something that makes you smile.",
  );
  await expect(page.locator(".confetti")).toHaveCount(0);
  await page.getByRole("button", { name: "Enable animations" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "active");
});

test("source-defined project video, cover, and PDF work as repository assets", async ({
  page,
}) => {
  // Simulate the owner editing src/data.js; the public app must use these paths.
  await page.route("**/src/data.js", async (route) => {
    const response = await route.fetch();
    let source = await response.text();
    source = source.replace(
      /video:\s*null/,
      'video: "tests/fixtures/demo.webm"',
    );
    source = source.replace(/cover:\s*null/, 'cover: "profile.jpg"');
    source = source.replace(
      /https:\/\/drive\.google\.com\/file\/d\/[^"\s]+/,
      "tests/fixtures/resume.pdf",
    );
    await route.fulfill({ response, body: source });
  });
  await page.goto("/");
  await expect(page.locator(".project-cover")).toHaveAttribute(
    "src",
    /\/profile.jpg$/,
  );
  await page
    .getByRole("button", { name: "View Secure Query Processing", exact: true })
    .click();
  const video = page.locator(".case-visual video");
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
  await page.keyboard.press("Escape");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download My résumé", exact: true })
    .click();
  const download = await downloadPromise;
  expect(await readFile(await download.path())).toEqual(
    await readFile("tests/fixtures/resume.pdf"),
  );
  const urls = await page.evaluate(async () => {
    const { mediaUrl } = await import("/src/media.js");
    return [
      mediaUrl("javascript:alert(1)"),
      mediaUrl("//example.com/x"),
      mediaUrl("../private"),
      mediaUrl("media/resume.pdf"),
    ];
  });
  expect(urls.slice(0, 3)).toEqual(["", "", ""]);
  expect(urls[3]).toMatch(/\/media\/resume.pdf$/);
});

test("responsive layouts and reduced motion support phones, tablets, and desktop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.screenshot({ path: "/tmp/creative-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole("navigation")).not.toBeVisible();
  expect(
    await page
      .locator(".ticker>div")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await expect(
    page.getByRole("button", {
      name: "Reduced motion is enabled on your device",
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Make something happen" }).click();
  await expect(page.locator(".confetti")).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: "/tmp/creative-mobile.png", fullPage: true });
});

test("live WebGL sculpture renders, rotates by keyboard, and changes composition", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".playground").scrollIntoViewIfNeeded();
  await expect(page.locator(".three-experience")).toHaveAttribute(
    "data-scene-status",
    "ready",
    { timeout: 20000 },
  );
  const canvas = page.locator(".three-canvas canvas");
  await expect(canvas).toHaveAttribute("data-rendered", "true");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-rotation", "0.2");
  await page.getByRole("button", { name: "Reset sculpture view" }).click();
  await expect(canvas).toHaveAttribute("data-rotation", "0");
  await page.getByRole("button", { name: "Make something happen" }).click();
  await expect(canvas).toHaveAttribute("data-pose", "1");
  expect(errors).toEqual([]);
});

test("unsupported WebGL falls back to artwork without breaking the portfolio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto("/");
  await page.locator(".playground").scrollIntoViewIfNeeded();
  await expect(page.locator(".three-experience")).toHaveAttribute(
    "data-scene-status",
    "fallback",
  );
  await expect(page.locator(".three-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Make something happen" }).click();
  await expect(page.locator(".playground-message")).toHaveText(
    "A little curiosity goes a long way.",
  );
  await expect(
    page.getByRole("button", { name: "Rotate sculpture right" }),
  ).toHaveCount(0);
});
