# Bharath — an editable portfolio

A responsive portfolio built with React, Vite, Framer Motion, and Lucide icons. It includes a profile, professional summary, filterable project case studies, project videos, a résumé library, an optional experience timeline, and a browser-based editing studio.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Node 24 is verified).

```sh
npm ci
npm run dev
```

Build and serve the production output:

```sh
npm run build
npm run preview
```

The production site is generated in `dist/`. Fonts, icons, and the initial profile photo are bundled locally. No runtime API keys or external font requests are needed.

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests, builds, and deploys the site whenever `main` changes. In the repository's **Settings → Pages**, set the build source to **GitHub Actions** once to avoid competing deployments from the old branch-based setup. Run **Publish portfolio to GitHub Pages** from the Actions tab if necessary. The deployment workflow does not change repository settings.

The expected address for this repository is `https://bharathkumarreddy007.github.io/my-portfolio/`. Check the deployment result in Actions before treating that address as live. Relative asset URLs support this project path and custom domains.

Publishing includes the default profile and project content in `src/data.js`. Browser-only edits and uploaded files remain local; they are not automatically included in GitHub deployments.

## Edit your portfolio

Select **Edit portfolio**, choose a tab, make changes, then select **Save changes**.

- **Profile:** name, photo, role, availability, headline, summary, contact links, and skills.
- **Projects:** add or remove projects, write challenge/approach/outcome case studies, add live and code links, and upload a cover and a video for each project. Custom categories become filters automatically.
- **Résumés:** upload several PDFs at once or add document links. Rename each version, add its target role, and choose a primary résumé.
- **Experience:** add work, internships, education, or other milestones. This section stays hidden until an entry is added.
- **Backup:** export your portfolio, including uploaded files, to JSON. Import it into another browser, review the draft, and save to restore it.

The first version uses **IndexedDB in the current browser**, as requested. Changes persist after refresh on the same website address. They do not sync across devices or change the content seen by other visitors. Clearing site data removes local changes; export backups regularly. The editing studio is not an authenticated online CMS.

There is no application limit on the number of projects or résumés you can create; browser storage quota is the practical limit. Each uploaded file must be under 100 MB. PDF is supported for résumés; JPEG, PNG, WebP, GIF, and AVIF for images. MP4 and WebM are recommended for video playback; Ogg and QuickTime depend on browser codec support. Backups include files and can be large (imports are limited to 500 MB). Videos load on demand and never autoplay.

The initial content is in `src/data.js`. Change that file to update the defaults included in a future public build. Browser backups are intended for portability, not deployment. Contact opens your email app; there is no server-side contact form or email delivery service.

## Motion and accessibility

Scroll reveals and the reading-progress indicator use Framer Motion. Native smooth scrolling, hover interactions, and the animated banner respect the reduced-motion preference. Dialogs use the native modal element for focus containment and Escape handling. Inputs are labelled; menus and filters expose their state.

## Verify

```sh
npm test
npm run build
```

The Playwright suite covers profile/photo/experience persistence, project uploads and video playback, filtering and deletion, multiple PDF uploads and downloads, backup restoration into a separate browser context, invalid input handling, and mobile navigation. It uses `/usr/bin/chromium` when available; otherwise install Playwright Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to your browser binary. Tests use isolated browser contexts and do not change real user data.

`npm run format` formats the source. Repository source is in `src/`, test fixtures are in `tests/fixtures/`, and generated build/test output is ignored by Git.
