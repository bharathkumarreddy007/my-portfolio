# Bharath — a motion-first portfolio

A dark, cinematic portfolio built with **React, Vite, Framer Motion and Three.js**.
A WebGL sculpture sits behind the hero, the type unfolds word by word, cards tilt in
3D under the cursor, case studies lift off the page, and a small pet named Mochi
rides along with you the whole way down.

Everything you read on the site comes from **`src/data.js`** — no CMS, no editor,
no credentials.

## Run it in VS Code

Requires Node 20.19+ or 22.12+ (Node 24 is used by the deploy workflow).

```
npm ci
npm run dev
```

Build with `npm run build` (output lands in `dist/`) and check the result with
`npm run preview`. Fonts, the 3D scene and every illustration are bundled or
generated locally, so the site needs no external services at runtime.

## Make it yours

Open `src/data.js` and edit. Commit and push to `main`; GitHub Actions rebuilds
and publishes the site.

- `profile` — name, role, headline (`\n` starts a new line), intro, summary,
  availability, location, contact links, photo, skills, plus the about-section
  `stats` and `capabilities` cards.
- `projects` — one object per project. Each becomes a card and a case study:
  `id`, `title`, `category`, `description`, `tags`, `year`, `visual`, `url`,
  `repo`, and the `challenge` / `solution` / `outcome` narrative.
- `resumes` — `id`, `title`, `detail`, `date`, `url`. The first one is primary.
- `experience` — add `{ id, role, company, period, description }` entries and the
  timeline section appears automatically. Leave it empty to hide the section.

`visual` picks the generated artwork when a project has no cover image:
`terminal`, `chart` or `movies`.

### Photos, videos and PDFs

Drop files into `public/media/` (on GitHub: **Add file → Upload files**) and point
to them from `src/data.js` as `"media/filename.ext"`. Full HTTPS URLs work too.

```
photo: "media/profile.jpg",     // profile
cover: "media/project.webp",    // project artwork
video: "media/demo.mp4",        // project walkthrough
url:   "media/resume.pdf",      // résumé (downloads instead of opening)
```

JPG/PNG/WebP images, MP4/WebM video and PDF résumés are recommended. Videos use
controls and never autoplay. The bundled `profile.jpg` is the fallback photo when
`profile.photo` is `null`.

### Change the design

- `src/styles.css` — the full design system: colour tokens, typography, layout,
  responsive rules and reduced-motion guards.
- `src/components/HeroScene.jsx` — the WebGL sculpture. Its shape is displaced by
  a shader in `vertexShader`; colours live in the `uniforms` object, and
  `targetX` controls how far it slides aside to frame the headline.
- `src/components/ui.jsx` — the shared motion vocabulary: `Reveal`,
  `SplitText`, `Magnetic`, `Tilt`, `Marquee`.
- `src/components/*` — one file per section; `src/App.jsx` stitches them together.

### Mochi, the portfolio pet

A little SVG creature lives in the bottom-right corner and reacts to almost
everything you do. It is drawn entirely with paths and gradients — no images.

```
src/components/pet/Pet.jsx          the character: expressions, arms, artwork
src/components/pet/PetCompanion.jsx behaviour, speech, sparkles, apology flow
src/components/pet/pet.css          styles for the bubble, form and effects
src/components/Finale.jsx           the "Good boy." closing section
```

- **Moods** — `idle`, `happy`, `love`, `excited`, `curious`, `smug`, `angry`,
  `shocked`, `wink`, `akanbe`, `laugh`, `sleepy`, `dizzy`, `proud`. Each is a row
  in the `EXPRESSIONS` map at the top of `Pet.jsx`; the eyes and mouth are picked
  by name, and the arms come from `ARM_POSE`.
- **Idle life** — the eyes follow the pointer, it blinks, it waves on its own, it
  speeds up while you scroll and barrel-rolls on long scrolls.
- **Petting** — hover it: hearts float up and it melts. Click it: sparkles.
  Click it five times quickly and it gets cranky, demands an apology, then pulls
  a face and laughs at you. Scroll to the end and it introduces you.
- **Reduce or remove it** — pass `expression`, `action`, `motionState` and `size`
  to `<Pet />` to reuse the character anywhere (the finale renders a second,
  calm copy). To remove the companion for good, delete `<PetCompanion />` from
  `src/App.jsx`.

## Publish

`.github/workflows/deploy.yml` builds on every push to `main` (and can be started
from the Actions tab). In **Settings → Pages**, set the source to **GitHub
Actions**. The site lives at
`https://bharathkumarreddy007.github.io/my-portfolio/`; `base: "./"` in
`vite.config.js` keeps asset paths working for both the repository subdirectory
and a custom domain.

## Interaction, performance and accessibility

The 3D scene only renders while it is on screen and the tab is visible, its pixel
ratio is capped, and it degrades to a soft gradient when WebGL is unavailable.
Touch devices keep vertical scrolling, and the custom cursor never appears on
coarse pointers.

The pause button in the header stops the decorative motion, and the operating
system's reduced-motion setting is respected everywhere. Case studies are real
dialogs: focus moves to the close button, Escape closes them, and the page behind
is locked while they are open.
