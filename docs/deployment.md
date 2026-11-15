# Deployment preparation

Current scope: local configuration/tests and the explicitly authorised merge/push to the public repository [mirkonz/lauren.co.nz](https://github.com/mirkonz/lauren.co.nz). GitHub origin is configured; no Cloudflare project, CMS/mail account grants, DNS or mail resources have been created. This is the setup checklist for P02/P07/P09, not evidence of deployment.

## Repository and CMS access

The selected repository is `mirkonz/lauren.co.nz` (public). Before asking for CMS account approval, prepare Lauren's account, exact callback hostname and approved preview hosts. Then request approval for that concrete access scope. Do not use the placeholder `local-only/lauren-co-nz` as a real repository.

1. Create or connect the approved GitHub repository and confirm ownership and visibility. A private repository does not make deployed assets private.
2. Update `public/admin/config.yml` with the actual repository and upstream Sveltia authenticator `base_url`.
3. Deploy the pinned upstream authenticator to an approved Worker. Register the associated GitHub App with callback `<authenticator-url>/callback`. Install it on this repository only: contents and pull requests read/write, metadata read, no workflow access. Keep client secrets in Cloudflare secrets, never Git.
4. Set exact `ALLOWED_DOMAINS`, without an unrestricted wildcard. Prepare a separate host arrangement for local versus protected preview tests.
5. Give Lauren the intended repository access. Configure branch protection and required checks to match the CMS editorial workflow; confirm asset-library operations do not bypass that workflow.
6. Verify sign-in, denied origins, callback, session refresh, logout and unauthorised users. Then test add/edit/reorder/remove images and relationships, preview, merge/publish and rollback with a non-sensitive fixture. Source/config tests are not proof of this UI workflow.

Sveltia's [local workflow](https://sveltiacms.app/en/docs/workflows/local) uses Chromium's File System Access API, works without remote authentication, and ignores Decap's `local_backend` setting. This linked worktree opened successfully in Chrome, and a disposable draft passed edit/reorder/save/reload and synthetic image upload tests. See [local verification](local-verification.md) for the exact scope. No alternate checkout was needed.

## Scope to resolve before an account request

The requested access is one repository, one authenticator and one Pages project, with no paid service or unrestricted preview hosts. The table separates the selected repository from values still unspecified; local access does not authorise filling them from another account or from private source evidence. Record approved values here before changing remote configuration.

| Item | Required choice and intended boundary |
| --- | --- |
| GitHub owner/repository and visibility | `mirkonz/lauren.co.nz`, public; main merge/push explicitly authorised. The CMS placeholder remains until authenticated editing is prepared and authorised. |
| Editor identity | Lauren's confirmed GitHub login and intended write/publish authority. Do not infer an account from her name. |
| Cloudflare target | Confirm account and project ownership; credentials limited to the approved Pages/authenticator resources. No DNS or unrelated zone access in this grant. |
| Authenticator | Select and inspect an upstream revision, pin it, then record the exact Worker URL and callback. Existing references describe a recommendation, not a deployed or pinned Worker. |
| Hosts | Exact editor/preview origin and authenticator allowlist. Prove access protection before uploading unreleased content; `noindex` alone is insufficient. No public preview deployment is authorised. |
| GitHub App | Recommended existing scope: contents and pull requests read/write, metadata read, only this repository, no workflow editing. Reconfirm against the pinned authenticator before requesting installation. |
| Branch rules | Required `validate` check, reviewed publishing and denied direct writes; confirm that Sveltia's media operations work within that policy instead of granting a bypass. |
| Mail | Artist-approved recipient, sender identity and chosen free transport. Source contact details are not mailbox authorisation. Inspect Pages binding compatibility under the approved account before choosing a provider. |
| Verification and abuse limits | Exact protected hosts/action, secret storage, token replay handling and rate limits. No widget/secret or account is configured locally. |
| Delivery test | Separately approve one synthetic message, its recipient and readback method. Provider acceptance alone does not close inbox delivery. |

Remote CI, editor round-trip, denied access and rollback must be read back after authorised setup. If the free transport cannot meet the requirement, return with one concrete alternative and its costs; do not silently provision another account. Keep repository/account setup, preview publication, DNS changes and final launch as separate approvals.

## Cloudflare Pages

Prepare a Pages Git integration against the approved repository with Node `22.23.4`, build `npm run check && npm test && npm run test:images && npm run test:publication && npm run build`, output `dist/`. The root `functions/` directory is compiled by Pages; no Astro server adapter is required. `wrangler.toml` provides a local project name and compatibility date, with no account credentials or bindings.

Initial builds must remain local until deployment approval. Before public previews, prove access protection for any unreleased images; `noindex` is not access control. Current robots/meta/header settings intentionally disallow indexing. Launch must replace them with the reviewed production SEO policy, while `/admin/` and protected previews remain excluded. The local build now emits canonical addresses for existing pages and an eight-route sitemap for the implemented approved portfolio subset. Holding pages and the 404 are omitted from that sitemap; the 404 has no canonical. Robots still blocks all crawling and does not advertise the sitemap. Social imagery and the final indexing policy need their release review.

### Workers command used against Pages configuration

Mirko supplied a Cloudflare log where the build succeeded, then `npx wrangler deploy` warned about a Pages project and failed with “Missing entry-point to Worker script or to assets directory”. The checked-in configuration declares `pages_build_output_dir = "dist"`; this is a Pages project. The log suggests the Workers Builds setup/deploy command was selected. No account/project state was inspected or changed by the agent.

For the intended Pages Git integration, select the Pages flow, connect `mirkonz/lauren.co.nz` main, use `npm run build` (or the fuller validation command above), output `dist`, and repository root. Pages Git integration has no separate Worker deploy command. See [Cloudflare's Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/). Do not add a Worker entry point or static-assets block merely to silence this error: that changes deployment shape and does not carry the existing Pages Functions boundary through automatically. An intentionally authorised direct CLI deployment would use `wrangler pages deploy`, against the approved Pages project and account; no such deployment was executed here.

Check successful build/deployment status, exact source revision, production pages, 404 behaviour, headers and image responses. Before the first authorised deployment, record the source commit, successful build/check run, deployment identifier and the previous known-good deployment. Rehearse selecting that previous deployment in the approved Pages project and read back its route/image/header responses. Stop or pause automatic publishing only within the authorised project if a bad source revision would immediately redeploy; then repair source through review before resuming it. A Git revert alone is not proof of a deployed rollback. Changing DNS, canonical host redirects, email-related DNS or launching the site needs its explicit approval. Do not modify the old Wix site as part of this setup.

## Enquiry delivery

`functions/api/enquiry.ts` is deliberately disabled: POST returns 503 and all other methods return 405. It reads no enquiry body, sends no email and never reports success. P07 replaces this boundary after the transport and account scope are approved; it is not a fallback submission implementation.

Determine whether Cloudflare's verified-destination free sending works with the actual Pages account/binding configuration. If it does not, prepare a single transactional provider option with free-tier limits, sender verification and failure costs before requesting approval. Do not provision both providers or enable paid failover.

Before authorisation, prepare recipient, sender/domain, provider/Turnstile permissions and exact DNS changes, if any. Implementation must verify artwork IDs and state server-side, constrain recipients, validate and bound input, verify Turnstile on the server, rate limit abuse and redact logs. Successful provider acceptance is separate from inbox delivery. A live test message needs explicit authorisation, then receipt in the approved mailbox must be verified.

## Evidence retained so far

- Node 22.23.4 installed with Mise without changing the global default.
- Pinned dependencies, install lockfile, static Astro output and local Sveltia bundle.
- Local content/enquiry regression tests, Storybook form/page examples and type checks; current evidence and counts are in local-verification.md.
- Isolated responsive-image build: one 128 KB source produced 320/640/full-width WebP outputs of approximately 8/23/31 KB. This is a compatibility proof. A later isolated 19-image technical benchmark produced 48 variants totalling 5.10 MB in 3.67 seconds; a separate local editor trial saved/reloaded a 31.9 MB synthetic PNG unchanged. A later curated trial of the first ten approved images produced 24 WebP variants totalling 1.13 MB in a 2.810-second isolated cold-image-cache build. Larger selections/quality and authenticated backend upload-limit verification remain pending (local-verification.md).
- Default production build excludes the test image and archived evidence. Draft images fail publication validation because Astro otherwise emits their files.
- Local Pages runtime serves the site/admin and proper 404s, and rejects the disabled enquiry route as documented. Local Chrome editing, gallery/relation order and a distinct synthetic upload-to-Astro round-trip now pass. Remote bindings/authentication, editorial publishing/branch protection, inbox delivery and account eligibility remain unverified. See local-verification.md.
