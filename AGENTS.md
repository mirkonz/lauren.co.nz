# lauren.co.nz

Read [docs/plan.md](docs/plan.md) first, then the linked task inputs. That file alone owns task status. Architecture, migration evidence and decisions live in the other linked documents.

## Scope and safeguards

- Mirko authorised continuation of the plan on 15 November 2026. Local implementation may proceed. Mirko confirmed Lauren May Stewart and approved the proposed local Film/Art design. Source facts, image permissions, account grants, paid services and public publishing retain their separate gates in docs/decisions.md.
- Build one identity across Film and Art, centred on “TWO WORLDS. ONE ARTIST.” No shop, checkout, invented credits or artwork metadata, heavy animation, or recreation of Wix's layout.
- Astro, strict TypeScript, Content Collections, Sveltia CMS, GitHub and Cloudflare Pages are the requested stack. Use Astro components and CSS; JavaScript only for necessary behaviour.
- Mirko separately authorised local shell layout, keyboard and accessibility inspection on 15 November 2026. External reference/source browsing remains restricted; record inspection limits in docs/local-verification.md.
- Mirko subsequently stopped manual site accessibility checks and requested Storybook. Use its stories and automated checks for ongoing UI work; do not resume manual site accessibility inspection unless requested.
- Work in a task-specific Git worktree. Preserve unrelated work. Never push, publish restricted images, register paid services, change DNS or launch without the relevant explicit authorisation.
- Preserve all recoverable source text, images, ordering and metadata before curation. Public availability does not establish permission to republish. Missing facts remain missing.
- No external messages or form submissions without explicit authorisation. Use existing CLI/SSH access for authorised administration where appropriate; never broaden access silently.

## Execution

1. Inspect Git status, plan dependencies and decision gates. Pick the highest-priority unblocked task.
2. Read only its linked inputs and nearby code. Keep one owner per shared schema, navigation or token file.
3. Follow the task's acceptance criteria. Report failed checks and live verification gaps accurately.
4. Update task status and consequential decisions; leave the next action and blockers clear.
5. Routine extraction, markup, styling and test implementation suit economical coding models. Use stronger reasoning for architecture, unresolved ambiguity, security and release review. Parallel agents only when explicitly requested, with separate worktrees and disjoint ownership.

## Commands and evidence

Use Node 22.23.4, pinned in `.node-version`/`mise.toml`. Prefix commands with `mise exec node@22.23.4 --` if the active Node is older. No global Node default was changed.

- Install: `npm ci` (copies the pinned Sveltia bundle locally).
- Development: `npm run dev`; CMS at `/admin/index.html`, local repository mode in Chromium.
- Type/content checks: `npm run check`.
- Schema/CMS/publication regression checks: `npm test`.
- Local Storybook: `npm run storybook` (loopback port 6006); see README for generated Astro markup refresh and testing limits.
- Storybook checks: `npm run check:storybook`, `npm run test:storybook`, `npm run build:storybook`. Chromium installation is documented in README. Never deploy `storybook-static/`.
- Isolated image proof: `npm run test:images`; `.verification-dist/` must never be deployed.
- Isolated publication rejection proof: `npm run test:publication`; temporary copies are removed after testing.
- Production build and archive/draft boundary checks: `npm run build`.
- Local Cloudflare runtime: `npm run preview:pages`; then `npm run test:pages` from a second terminal. This smoke test uses loopback only and sends no email.
- Public source audit (large downloads): `python3 scripts/audit_wix.py`.
- Archive verification: `python3 scripts/verify_audit.py`.
- Patch hygiene: `git diff --check` and `git diff --cached --check`.

Production builds reject image-bearing draft/review records because Astro can emit their files even without a rendered page. Keep unapproved images in the archive. The enquiry endpoint intentionally returns 503 until authorised integration is working; the local form/catalogue tests do not enable mail. The landing remains media-free. Film/Art indexes, two approved Film projects and two Art collections are implemented locally; About/Contact/CV remain holding pages. Only the four records in docs/content-approvals.json are cleared for build inclusion; public launch remains unapproved. Local Chrome CMS edit/reorder/save/reload and synthetic image upload-to-Astro tests pass (docs/local-verification.md). Remote auth/publishing remains unverified. See [docs/deployment.md](docs/deployment.md) for exact setup gates.

`docs/audit/` contains source evidence, not publishable portfolio content. `source-assets/` contains local originals and is intentionally ignored until rights and repository size are reviewed. Do not remove it. Never include source archives in the production build. Consult the engineering writing guide at `/Users/mirko/nix/ai/shared/docs/engineering-writing.md` when available for documentation and review writing.
