# lauren.co.nz

Lauren's Film and Art portfolio, built with Astro and Sveltia CMS for Cloudflare Pages. The local technical foundation exists; final design, content migration and external integrations are unfinished.

Read [the project plan](docs/plan.md) for current work and [AGENTS.md](AGENTS.md) before editing. The working checkout is `/Users/mirko/Code/github/lauren.co.nz-planning` on `planning/audit`; the original checkout holds `main`.

## Local setup

Use Node 22.23.4, pinned in `.node-version` and `mise.toml`. With Mise installed:

```sh
mise exec node@22.23.4 -- npm ci
mise exec node@22.23.4 -- npm run dev
```

The server binds to loopback. Open the printed URL. For Sveltia, open `/admin/index.html` in a Chromium browser, choose **Work with Local Repository**, and select this worktree. Local Chrome editing, gallery/relation ordering and synthetic image upload have been verified; see [local verification](docs/local-verification.md). Remote sign-in is intentionally not configured. See the [editor guide](docs/editor-guide.md) for content and image safeguards. The pinned CMS bundle is copied from the installed package by `postinstall`; it is not downloaded from a floating CDN during use.

## Validation

With the pinned Node active (or prefix each command with `mise exec node@22.23.4 --`):

```sh
npm run check
npm test
npm run test:images
npm run test:publication
npm run build
```

The image proof builds to ignored `.verification-dist/`; it must never be deployed. The production build goes to `dist/` and checks source/draft exclusion. All pages remain `noindex`. Canonical addresses are emitted for existing pages except the 404; `sitemap.xml` lists only the implemented approved portfolio routes, omitting holding pages. Robots still blocks all crawling and does not advertise the sitemap. Film/Art now link to two approved Film projects and two Art collections; About/Contact/CV remain holding pages and the broader portfolio is unfinished. The empty artwork collection currently produces an informational loader notice.

For Cloudflare's local runtime:

```sh
npm run preview:pages
```

In a second terminal run `npm run test:pages`. It targets only `127.0.0.1:8788` and checks static/admin delivery, 404 handling and the deliberately disabled enquiry endpoint. It does not send email. Stop the local server with Ctrl-C afterwards.

The CI workflow runs install, type/content checks, tests and build; it also checks the isolated image build and rejects unsafe publication fixtures. `test:publication` builds a disposable copy under ignored `.audit-cache/`, then verifies that draft/review media, restricted published images and unverified published facts stop the build before a site is emitted. It removes its temporary copy afterwards. Mirko selected the public repository [mirkonz/lauren.co.nz](https://github.com/mirkonz/lauren.co.nz) and authorised merging the current work into `main` and pushing it. Check GitHub Actions after the push; local checks alone do not establish a remote result. See [deployment preparation](docs/deployment.md) for account gates and remaining checks.

## Storybook

Run `npm run storybook` with the pinned Node to start the local development catalogue at `http://127.0.0.1:6006`. The command binds only to loopback and does not open a browser automatically. Forty stories cover the split landing, Film/Art/collection indexes, two approved Film projects and two Art collections, remaining holding pages, custom 404, narrow layouts and 200% root-font examples, plus synthetic enquiry states. Use the viewport toolbar and Accessibility panel; no manual site inspection is required for the automated checks.

Astro generates the actual page HTML under ignored `.storybook/generated/site/` before Storybook starts, builds or tests. The stories use that markup and the shared site CSS, rather than maintaining duplicate templates. CSS updates live. After editing Astro templates or content while Storybook is open, run `npm run storybook:prepare` in a second terminal to refresh the HTML. Page stories reject body scripts. Enquiry stories use four routes injected only by `.storybook/astro.config.mjs`, covering purchase, similar-work, commission and disabled forms. Their renderer validates and removes the fixture's single Astro module bootstrap, then mounts the same form controller with an isolated fake transport. No story sends mail or calls the enquiry endpoint; production builds contain none of these fixture routes. Site links retain their real destinations and may leave the story iframe when activated.

```sh
npx playwright install chromium  # once per Playwright browser version
npm run check:storybook
npm run test:storybook
npm run build:storybook
```

The automated Chromium stories run axe checks and assert page headings, skip-link targets/main focusability, navigation destinations, horizontal overflow, actual image loading, gallery counts and source-size display limits. Five landscape originals are 478px wide and are not enlarged. They do not prove native fragment/route activation, screen-reader behaviour, physical touch, native text-only zoom or final-image quality. CI is configured to run them and build Storybook; its remote result must be read back in GitHub Actions. `storybook-static/` is ignored local output, separate from the portfolio's `dist/`; do not deploy it. Storybook disables telemetry, does not serve the CMS/public directory and excludes source archives. No accounts or cloud visual-testing service are needed.

## Local enquiry functionality

`EnquiryForm.astro` and its shared controller provide input validation, error focus, retained text after failures, sending/accepted states and double-submit prevention. The form stays disabled without JavaScript or when enquiries are unavailable. It is not mounted on any public page yet. Storybook exercises it with synthetic data and responses, including failed/malformed responses, timeouts and explicit retries. These are UI tests, not evidence of email delivery.

`npm run build` also generates `.generated/enquiry-catalogue.json` from the validated artwork records and site switches. It stays outside `dist/` and is currently empty. `validateEnquiryRequest` checks the configured origin, media type, bounded streamed bytes, payload and canonical artwork eligibility. It is deliberately unwired: the existing Pages endpoint still returns 405/503 and accepts no message. Server token verification, replay/rate protection, the chosen transport, privacy notice and mailbox delivery proof remain integration gates. See [the enquiry boundary](docs/architecture.md#enquiry-boundary).

## Local page-loading samples

After `npm run build`, use `npm run preview -- --port 4322` in a terminal, then `npm run measure:performance` in another. Stop that temporary preview afterwards; do not stop an unrelated listener. The sampler accepts only a loopback HTTP origin (optional command argument) and compares its root HTML to the current `dist/` before proceeding. Playwright Chromium must already be installed.

It samples six representative routes three times each at 390×844 and 1440×900, with device scale 1, fresh browser contexts, disabled HTTP cache, 150 ms network latency, 1.6 Mbps download, 750 kbps upload and a simulated 4× CPU slowdown. It checks initial-viewport LCP ≤2.5 seconds and CLS ≤0.1, plus failed/external requests, and saves individual measurements to ignored `.audit-cache/performance/current.json`. A failed or unsupported measurement exits unsuccessfully. It uses Chrome's request-throttling rules; no deprecated network-emulation fallback is installed.

These are local initial-load proxies, with warm OS/server caches and a one-second post-load observation window. They omit CDN/TLS, scrolling, later layout changes, interaction/INP, other browsers and real devices. Artificial Landscapes' first viewport measures its introduction, not gallery loading below it. Do not use a passing sample as field-performance or whole-page proof. Metric definitions and session-window handling follow [LCP](https://web.dev/articles/lcp) and [CLS](https://web.dev/articles/cls). This optional hardware-dependent check is not added to remote CI; current results are in [local verification](docs/local-verification.md).

## Content and preservation

Content schemas live in `src/lib/content-schemas.ts`, loaded by `src/content.config.ts`. Stable `key` values match entry-folder names; `url_slug` can change independently. CMS fields are in `public/admin/config.yml`; tests detect missing top-level field mappings. `npm run check:content` validates relationships, image paths, public image permissions, factual review, alt text and availability states before Astro builds. This runs independently of page rendering.

Astro emits images referenced by draft records even when their pages are not rendered. Production builds therefore reject image-bearing drafts. Keep unapproved imagery in the source archive; bring it into publishable content only after clearance. Local development may inspect draft media. CMS editorial branches must not receive public previews of restricted images. This explicit restriction avoids a custom loader; if approved editorial workflows require private image-bearing draft previews, revisit the loader with evidence.

The original Wix assets are preserved locally under ignored `source-assets/wix/` (about 1.28 GB), with manifests, ordering and recovery gaps in [the migration inventory](docs/content-migration.md). Do not delete this worktree before an owner-approved archive backup exists. Audit JSON and the CV transcription are evidence, not publishable portfolio content. The initial conversion preserved 52 source-derived drafts; [migration.json](docs/migration.json) retains that baseline. Four records now use confirmed copy and twenty images identified by [content-approvals.json](docs/content-approvals.json); the other forty-eight remain unverified drafts. `publication: published` makes the confirmed subset build-ready and does not authorise public deployment. The prior versions of those four records remain in ignored `.audit-cache/content-review/preapproval-records/`, with the raw source claims still in the audit. Run `python3 scripts/migrate-drafts.py --check` to verify the conversion and original archive hashes without network access. See the migration inventory for editing and regeneration boundaries.
