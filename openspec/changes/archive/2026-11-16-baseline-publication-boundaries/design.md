# Design

## Context

See [proposal.md](proposal.md) for motivation. Production content validation,
build-output checks and a disabled Pages Function already exist. This baseline
crosses content, build and HTTP boundaries, so it needs an explicit evidence
strategy even though it changes no implementation.

## Goals / Non-Goals

Establish a small accepted contract whose scenarios can be traced to the current
repository. Do not claim a freshly verified deployment or broader content rights.
UI design, transport selection and editorial writes are separate changes.

## Decisions

Use one `portfolio-publication` capability because these requirements jointly
control what this prelaunch portfolio may expose. Expand only when a later change
needs a distinct contract; do not baseline the entire product speculatively.

Capture existing behaviour as ADDED requirements, meaning newly recorded in
OpenSpec. This adds no product feature. Link existing architecture and approval
sources rather than copying image ledgers or account runbooks into specs.

Use existing content tests, `test:publication`, `build` and the loopback-only
`test:pages` smoke test as applicable. Check listener ownership before starting a
Pages runtime. Reuse prior evidence for unchanged areas where appropriate and
label it as prior evidence. Do not add duplicate tests merely for spec adoption.

## Risks / Trade-offs

- Existing tests may not prove every scenario: record the gap and narrow an
  unsupported assertion before acceptance; do not mark verification complete.
- Noindex discourages indexing but does not protect private previews: source
  exclusion and publication permission remain independent requirements.
- Future authorised sending or launch will change this baseline: update the same
  capability through a reviewed delta rather than introducing a parallel spec.

## Migration Plan

Review, reconcile and verify the baseline, then use native archive/spec sync to
establish the main spec. There is no deployment or content migration. Before
archive, revise the proposal if rejected; after archive, change requirements
through another OpenSpec change. Do not reset unrelated Git work.

## Scenario evidence

All six scenarios match existing implementation. No website defect or behaviour
change is required for this baseline.

| Scenario | Existing implementation and verification |
| --- | --- |
| Image-bearing draft or review | [Portfolio validation](../../../../src/lib/content-integrity.ts) rejects covers/galleries outside published records; [publication build fixtures](../../../../scripts/test-publication-build.mjs) exercise a draft cover and review gallery and require no emitted site. |
| Restricted images or unverified facts | [Shared schemas](../../../../src/lib/content-schemas.ts) enforce factual review and image permission; [content tests](../../../../tests/content.test.ts) cover restricted/unreviewed cover and gallery media; publication build fixtures check restricted media and unverified facts end to end. |
| Production output exclusion | [Build verifier](../../../../scripts/verify-build.mjs) checks every output path for source/audit/test/Storybook/internal-catalogue leakage and all twelve portfolio HTML pages for Wix hotlinks; [Pages smoke tests](../../../../scripts/smoke-pages.mjs) check excluded paths return 404. |
| Prelaunch indexing | Build verifier checks noindex across all twelve portfolio pages, response-header configuration and crawler blocking without sitemap advertising; Pages smoke tests check served noindex headers on valid routes. Noindex is not access control. |
| Disabled POST | [Existing Function](../../../../functions/api/enquiry.ts) returns 503 with no accepted message; Pages smoke tests check failure/no success; baseline HTTP readback also verifies the exact message and Allow header. |
| Unsupported method | The Function rejects every non-POST method with 405 and Allow POST; Pages smoke tests exercise GET, with further loopback methods checked during qualification. |

The [four-record ledger](../../../../docs/content-approvals.json) and its review
references cover Blade Runner 2049, Mulan, Artificial Landscapes and Oil Painting
Landscapes, with twenty image copies. The [migration regression tests](../../../../tests/migration.test.ts)
compare approved record/image hashes and ensure every other retained record stays
a draft. This baseline preserves those decisions. The ledger's initial no-deploy
wording is historical: the later narrow public Pages-preview grant in
[decisions.md](../../../../docs/decisions.md#authorised-pages-preview) permits that
preview only and does not grant custom-domain launch or additional image rights.

Current local check results and limits are recorded in
[local verification](../../../../docs/local-verification.md#openspec-publication-baseline).
