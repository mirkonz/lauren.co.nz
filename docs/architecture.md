# Proposed architecture

Status: local implementation authorised by Mirko on 15 November 2026. Astro/content/CMS foundation and local Pages configuration are implemented; portfolio design, full migration and external integrations remain unfinished. The architecture below governs those next phases. [OpenSpec changes](../openspec/changes/) own development tasks; the [plan](plan.md) owns the milestone roadmap; [decisions](decisions.md) owns approval gates.

## Site and routes

Recommend static Astro output, strict TypeScript and plain CSS. Build-time content validation catches missing relationships before publication. Keep server code confined to enquiries and the separately deployed CMS authenticator. Do not add an Astro server adapter merely to receive one form.

| Route | Purpose |
| --- | --- |
| `/` | Split Film / Art gateway |
| `/film/` | Selected work, discipline links and complete filmography |
| `/film/projects/[slug]/` | Productions with verified contributions and galleries |
| `/film/practice/[slug]/` | Mixed-production scenic, props, on-set and theatre galleries |
| `/film/cv/` | HTML CV with print styles and generated PDF download |
| `/art/` | Featured art and links to all collections |
| `/art/collections/` and `/art/collections/[slug]/` | Curated collections, including illustration and jewellery |
| `/art/works/[slug]/` | Identified individual works with enquiries where enabled |
| `/about/`, `/contact/` | Shared biography and professional contact |
| `/admin/` | Static Sveltia entrypoint |
| `/api/enquiry` | POST-only Pages Function |

Explicit `projects`, `practice` and `works` segments prevent reserved-name conflicts. Do not create one “artwork” per photograph: installation/process/detail photographs belong in galleries. Keep collections without individual labels browsable until identification is approved.

Persistent navigation: wordmark/home, Film, Art, About, Contact. Film adds a visible CV link. At narrow widths wrap or use two readable rows before considering a menu. Highlight the active world with text and `aria-current`, not colour alone. About/contact use a stable neutral theme; no theme saved in browser storage is necessary. Breadcrumbs and Film/Art links make deep pages understandable without visiting `/`.

## Content model

Use `src/content.config.ts`, build-time loaders and central schemas. Prefer Markdown with YAML frontmatter for editorial records and singleton files for settings. Keep stable IDs independent of editable URL slugs. CMS forms mirror these schemas, with automated fixture checks to detect drift. Do not build a schema generator before duplication proves costly.

| Collection | Fields and boundaries |
| --- | --- |
| `film` | ID, slug, title, year label (optional), role(s), credits, contribution prose, category, optional cover/gallery, SEO. Permit credit-only entries without fabricated project stories. Store employment/production years as supplied, separate from optional verified release year. |
| `film-practice` | ID, slug, title, introduction, ordered gallery; optional references to film records. Accommodates mixed-production and theatre work without invented attribution. |
| `artworks` | Stable ID, slug, verified title, year/medium/dimensions when known, description, main image/additional images, availability, optional price/currency, enquiry settings, SEO. Unidentified items stay in migration evidence or collection galleries, not invented public titles. |
| `art-collections` | ID, slug, title, description, optional date label, cover, ordered artwork references, ordered supplementary gallery. Collection owns membership/order; do not store the same membership on each artwork. |
| `pages` | Biography and contact prose; CV summary, verified skills, education and non-film experience. Filmography references `film` rather than a second manually edited list. |
| `settings` | Professional name, public contact/social links, default SEO, ordered featured references and landing image/focal point choices, commission/similar-work enquiry switches. Keep design controls out of the CMS. |

Image records contain source, dimensions, author-written alt text, optional caption, credit and publication approval. Empty alt is deliberate only for decorative images. Gallery array order is authoritative. Require IDs to be unique, slugs safe and unique per route, referenced records/images to exist, and all public images to have permission resolved. Draft/review records must be excluded from production routes, sitemap and any public enquiry catalogue. Experimentally, Astro 7 emits image files referenced by drafts even when no page displays them. `validatePortfolio` therefore rejects image-bearing drafts in production; only local dev permits them. Keep unapproved media in the source archive until cleared. This is a deliberate build restriction, not a promise that route filtering hides assets. Revisit a custom loader only if a demonstrated private draft-preview workflow needs it.

Availability: `available`, `price-on-request`, `sold`, `not-for-sale`, `commission`, plus internal `unknown`. Unknown and not-for-sale have no purchase action. Enquiries require both the state and explicit enablement. Sold allows “Enquire about similar work” only if enabled; commissions require the global switch. Price visibility requires a valid amount and currency. Do not default old artworks to available.

## Media and build

Start with repository-managed, entry-relative images under `src/content/.../[id]/`, using Astro image schemas and responsive Image/Picture output. Preserve untouched originals separately. Shared images can live in `src/assets/` when a demonstrated reuse requires them. Keep `public/` for admin and intentionally unprocessed files, not the default artwork library. The [Sveltia Astro guide](https://sveltiacms.app/en/docs/frameworks/astro) documents static admin files, entry-relative media and omitting empty optional fields; verify upload/reorder/delete round trips before migrating everything.

Create a small fixed set of output widths, retain aspect ratios and intrinsic dimensions, and reserve eager/high-priority loading for the landing hero or first meaningful image. Avoid loading entire galleries immediately. No Wix hotlinks in production. The recovered originals already total 1.28 GB, so do not commit that archive. P02 must measure a representative publishable library (after lossless preservation and practical image-size optimisation), editor upload limits and build duration before confirming Git media. A local single-file trial saved/reloaded a 31.9 MB synthetic PNG unchanged; it establishes neither an upper limit nor remote-backend behaviour (local-verification.md). Record size thresholds and reconsider R2 if the test fails. Git LFS is not a substitute here; the [GitHub backend](https://sveltiacms.app/en/docs/backends/github) currently does not support it. R2 is an alternative only if measured size/build limits justify another storage system and its credentials/operations.

## CMS, source control and deployment

Use `public/admin/index.html` plus `config.yml`, with a pinned Sveltia release. Develop at `/admin/index.html`. Configure an editorial workflow so a content change can receive checks and a preview before publication. Verify asset operations against branch protection: do not assume the asset library uses the same workflow as entries.

Recommend the upstream [Sveltia authenticator](https://github.com/sveltia/sveltia-cms-auth) on a small Worker, using a GitHub App installed only on this repository. Grant contents and pull-request access, no workflow editing. Store the secret in Cloudflare, restrict allowed domains to the exact approved hosts, and test denied origins, callback, logout and expired-session refresh. Lauren needs repository write access. Current documentation says browser-only GitHub PKCE is unavailable; local editing can be tested without remote authentication. The scoped authenticator/GitHub App setup and login are recorded in deployment.md; editorial publishing, session/denied-user checks and editor handover remain unverified. Further account changes remain approval-bound.

Keep Cloudflare Pages as requested: Git integration, `npm run build`, output `dist`, pinned supported Node runtime, production branch `main`, preview branches. Protect previews containing unreleased images and set `noindex`. A preview URL is still a public deployment unless access controls are proven. CI runs checks before merging; confirm a failed build retains the last good site. Roll back to a known successful deployment, then repair/revert the source separately so the next build does not reintroduce the problem.

Current [Astro hosting guidance](https://docs.astro.build/en/guides/deploy/cloudflare/) recommends Workers for new projects, while [Cloudflare's Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) still covers Pages. Static Pages plus a Function avoids tying rendering to adapter versions. P02 must demonstrate build and local Pages compatibility before proceeding.

## Enquiry boundary

Prefer an inline form on the artwork page. Show the concise artwork or collection/image reference; keep stable IDs and canonical target URLs in the validated catalogue; submit only the stable ID plus visitor name/email/message and spam token. A hidden field is untrusted. Generate a server-side catalogue of approved works and allowed enquiry states from the same build content; derive the title/URL/recipient on the server. Reject unknown IDs and disabled enquiries.

Local implementation now separates pure catalogue/payload rules (`src/lib/enquiries.ts`), bounded request validation (`enquiry-request.ts`) and the reusable Astro form/controller. The content checker and catalogue generator share the same filesystem loader and validation. `npm run build` writes `.generated/enquiry-catalogue.json` outside `dist/`; it contains the approved collection/image references, while no individual artwork records exist. A future authorised Function bundle must import the artifact from that same build, never accept client titles, URLs or recipients, and fail closed if catalogue generation fails. The current disabled Function does not import it or the request validator.

Mirko explicitly selected enquiries per displayed image. Those targets are `kind: image`, use the unchanged collection key and entry-relative image filename, and link to that figure's fragment. Titles remain collection/image references, never invented artwork titles or availability claims. Reordering a gallery preserves these IDs; renaming image files changes them and needs reference/redirect review. The shared validated source loader supplies both route forms and the server-only catalogue. Duplicate canonical IDs fail generation. Existing identified-artwork availability/commission/sold rules remain separate and unchanged.

The form's verification slot and `enquiry:verification-reset` event are the integration points for the future authorised widget. Every attempted request consumes the local token; a retry requires a new one. A successful response requires both an HTTP success and `{ "success": true }`; confirmation means acceptance, never inbox delivery. No automatic retry occurs after ambiguous failures. The approved Art galleries now mount disabled forms in native disclosure elements per image. Synthetic Storybook fixtures exercise the real Astro markup/controller with fake responses. The renderer accepts only the reviewed site bootstrap and mounts its actual parallax controller; enquiry fixtures additionally mount the form controller with fake transport. Before enabling sending, add the approved recipient/processors/retention notice, verification widget and enabled-form state; the server must add verification/replay/rate protection and one working transport. None of these is established by the local validation tests.

Use a Pages Function with bounded request size, length limits, email validation, fixed recipient/sender, safe text construction, origin checks, honeypot, server-verified Turnstile hostname/action and abuse rate limiting. [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) is mandatory; a widget alone proves nothing. Escape any HTML, reject header newlines, keep visitor email in Reply-To, and never log message bodies or tokens. Use request IDs and redacted operational errors. No database or attachments.

Email transport remains conditional: first prove Cloudflare's free verified-destination sending can meet this fixed-recipient use case on Pages. [Cloudflare Email Service](https://developers.cloudflare.com/email-service/) distinguishes free verified destinations from paid arbitrary-recipient sending. If binding compatibility/account setup cannot meet requirements, compare a transactional HTTP email provider under an explicitly approved free tier. Do not add both implementations or enable paid fallback. No visitor auto-reply is required; the website shows confirmation only after provider acceptance, without promising inbox delivery. Test delivery to Lauren's approved mailbox separately.

Failures preserve entered text and show actionable errors; prevent accidental double submits. Do not automatically retry ambiguous email timeouts, which can duplicate messages. Add a short privacy notice describing recipient, processors and retention. Account verification and any sending-domain DNS changes require approval before execution.

## UI boundaries, CV and quality

Shared components: document/SEO layout, navigation, footer, image/gallery primitives, links/buttons, enquiry fields and focus styling. Film and Art own their editorial compositions; do not force one card/grid template across both. CSS tokens own colours, typography, spacing and short transitions. The shared site bootstrap runs decorative parallax and conditionally imports enquiry enhancement only for enabled forms. Native enquiry disclosures need no script. Optional verified image comparisons remain separate. No frontend framework or client router by default.

Generate the downloadable CV from the HTML CV during build using a pinned headless browser and print CSS. Verify text extraction, pagination, links, selectable text and absence of private contact/referee details. There is one content source. Browser print alone is useful but does not satisfy the PDF download requirement.

P02 has established Node 22.23.4, a lockfile, `npm ci`, development, type/content checks, schema/permission/relationship tests, an isolated responsive-image build and local Pages routing checks. Local CMS editing/upload proof passes; remote editorial publishing, complete content reconciliation and accessibility/link checks for the actual portfolio remain outstanding. See README.md for commands and deployment.md for remote setup. Target WCAG 2.2 AA. Check narrow/standard phones, tablets, desktop and large screens, keyboard, touch, reduced motion, zoom and both palettes. Aim for LCP <=2.5s, CLS <=0.1 and INP <=200ms; prelaunch lab results are proxies, with field data after approved launch. Use Storybook and automated checks for ongoing UI qualification. Mirko stopped manual site accessibility inspection; any later manual qualification requires a new request. SEO includes canonical URLs, descriptions, social cards, sitemap, robots and accurate Person/CreativeWork data without invented claims. Never place private source evidence into build output.

## Decorative motion

`SectionDecor.astro` composes three original SVG marks for an explicit Film/Art/About/Contact/CV identity. They remain behind content and non-interactive, with separate clipping on each landing panel. `parallax.ts` applies depth-dependent translations over the complete document scroll range, bounded to 72 CSS pixels. One passive scroll listener and a coalesced animation frame serve all layers; resize and disclosure changes recalculate the range. Reduced-motion changes detach listeners, cancel a pending frame and reset offsets; CSS also disables transforms under that preference. Without enhancement the marks stay static. No animation loop, framework or external asset is used. Forced colours hide decoration entirely.

## Implemented contracts and current limits

Entry folders use permanent `key` values; editable `url_slug` is separate. Film, practice, artworks, art collections, pages and settings use the schemas in `src/lib/content-schemas.ts`. Relationships use stable keys and are checked by `scripts/check-content.ts`/`validatePortfolio` before Astro builds, independently of page rendering. Gallery membership/order has one source on collections. CMS forms match all top-level schema fields; the local edit/reorder/save/reload round trip passes (local-verification.md), while remote publishing remains unverified. P03 has converted 52 source-derived text drafts alongside site settings. Source/occurrence ownership and ordered archive media references live in docs/migration.json; unapproved images stay outside the content loader. Only the four records in content-approvals.json have subsequently received scoped factual/image approval; the other forty-eight remain unverified drafts. The source image used for optimisation is confined to `tests/fixtures/` and isolated test copies/output.

The current `/` implements the approved split design without media; the 404 shares its layout. Film/Art indexes now expose two approved projects and two collections, with collection browsing at /art/collections/. About/Contact/CV remain holding pages; all other source records remain excluded until cleared. Local design approval is recorded in decisions.md; final imagery and manual accessibility/layout verification remain outstanding. `functions/api/enquiry.ts` is a disabled boundary until P07, not a working form handler. GitHub CI is configured as source only; it has not run remotely.
