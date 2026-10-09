# Bharath — a creative developer portfolio

A public, view-only portfolio built with React, Vite, Framer Motion, and Three.js. It includes a playful profile collage, project case studies, video support, a résumé library, skills, an optional experience timeline, and an interactive 3D sculpture with scroll-driven movement.

## Run in VS Code

Requires Node.js 20.19+ or 22.12+; Node 24 is used by the deployment workflow.

```sh
npm ci
npm run dev
```

Build with `npm run build`; the production output is in `dist/`. Use `npm run preview` to check that build locally. Fonts and 3D lighting are bundled or generated locally, so the site needs no runtime credentials or external font/3D services.

## Make your own changes

**All portfolio content comes from `src/data.js`.** Edit it in VS Code or on GitHub, then commit and push to `main`. The GitHub Actions workflow tests, builds, and publishes the updated site for everyone.

- `profile`: your name, role, headline, introduction, professional summary, availability, location, contact links, photo, and skills.
- `projects`: add as many project objects as you need, each with a unique `id`, category, tags, description, challenge, solution, outcome, live link, and code link. Categories automatically become filters.
- `resumes`: add résumé objects with a unique `id`, title, detail, date, and document URL. The first résumé is marked primary.
- `experience`: add work, internship, or education entries with `id`, `role`, `company`, `period`, and `description`. The section appears when entries exist.

The public site has no editor, upload forms, or content-saving endpoints. It ignores content left in IndexedDB by the old browser editor. Visitor interactions only change presentation, such as a color mood or the angle of the 3D sculpture. The color preference is stored locally; content is always loaded from the published source.

### Add photos, videos, and PDFs

Place files in `public/media/`. On GitHub, open that directory and choose **Add file → Upload files**. Then update `src/data.js` with the path relative to the public directory:

```js
// Profile
photo: "media/profile.jpg",

// Within a project
cover: "media/project-cover.webp",
video: "media/project-demo.mp4",

// Within a résumé object
url: "media/full-stack-resume.pdf",
```

Full HTTPS URLs also work. JPG/PNG/WebP images, MP4/WebM videos, and PDF résumés are recommended. Local résumé paths download directly; external résumé links open in a new tab. Videos use controls and never autoplay. The existing profile image remains the fallback if `profile.photo` is `null`.

Everything in `public/` is publicly accessible. GitHub's browser uploader accepts files up to 25 MiB and regular Git rejects files larger than 100 MiB. Use compressed videos or an HTTPS video-hosting URL for large media. Prefer filenames without spaces and keep `id` values unique.

### Change the design

- `src/styles.css`: colors, typography, layout, and responsive rules.
- `src/CreativeHero.jsx`: profile collage, draggable shapes, color moods, and 3D section copy.
- `src/ThreeScene.jsx`: sculpture geometry, materials, lighting, camera, and scene interactions.
- `src/App.jsx`: public sections and project dialogs.

## Publish

The workflow in `.github/workflows/deploy.yml` runs on every push to `main` and can also be started from the Actions tab. In **Settings → Pages**, use **GitHub Actions** as the source to avoid competing deployments from the old branch-based setup.

Site address: `https://bharathkumarreddy007.github.io/my-portfolio/`. Check the latest workflow's deployment result after a push. Relative asset paths support the repository subdirectory and a custom domain.

## Interaction, performance, and accessibility

The 3D scene loads when its section approaches the viewport. Rendering pauses when it leaves the screen or the browser tab becomes hidden. Pixel density is capped to limit GPU work. The scene includes drag, arrow-key, and button controls, plus a static-art fallback if WebGL is unavailable. Vertical touch gestures remain available for page scrolling.

The animation control pauses the decorative animations. The operating system's reduced-motion setting also disables automatic movement and scroll effects while keeping manual interaction available. Case studies use native modal dialogs for focus containment and Escape handling.

## Verify

```sh
npm test
npm run build
```

The seven Playwright tests cover removal of editing controls, stale browser-data isolation, project filtering and dialogs, color and motion controls, source-defined video/PDF assets, responsive layouts, actual WebGL rendering and keyboard controls, and the no-WebGL fallback. Tests use isolated contexts and a software WebGL renderer. If `/usr/bin/chromium` is unavailable, install the browser with `npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Use `npm run format` to format source files. Generated dependencies, build output, and test results are ignored by Git.
