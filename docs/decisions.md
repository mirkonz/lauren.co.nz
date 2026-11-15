# Decisions and design proposal

15 November 2026. Mirko said “continue” after receiving the plan, authorising local execution of it. “Recommended” choices with separate gates below are not automatically approved. [Plan](plan.md) tracks work; this file tracks choices and authority.

| ID | Decision and recommendation | Alternatives / consequences | Status and gate |
| --- | --- | --- | --- |
| D01 | Professional name: Lauren May Stewart, matching source homepage/footer; CV instead uses Lauren May. Typographic wordmark; remove Lauren Likes to Paint branding. | Lauren Stewart is shorter but not the name consistently used by the source. Keep the existing public email unless Lauren supplies another. | Approved by Mirko on 15 November 2026: Lauren May Stewart. |
| D02 | Two editorial worlds with the fixed split landing page described below. | A single neutral gallery is simpler but weakens the requested concept; an animated expanding split adds little and harms predictable navigation. | Approved by Mirko on 15 November 2026 for local implementation of the split Film/Art design, dark Film and light Art. Image rights and public launch remain pending. |
| D03 | Astro static output, Content Collections, Sveltia, GitHub, Cloudflare Pages. Pages Function only for enquiries. | Workers Static Assets now has vendor preference and may simplify native email binding; switching would deviate from the requested stack. Retain Pages unless a compatibility spike proves a material blocker. | Approved for local foundation on 15 November; account/deployment gates remain. Any stack change needs a recorded decision. |
| D04 | GitHub App scoped to this repository with upstream Sveltia authenticator Worker. | PAT is simple for a developer but requires Lauren to manage tokens; broad OAuth app access is unnecessary. No invented browser-only PKCE flow. | Recommended; app installation, account ownership and access need approval. Local CMS trials can precede them. |
| D05 | Entry-relative Git media, optimised during build; untouched archive outside publishable paths. | R2 reduces Git growth but adds storage setup, credentials and recovery concerns. LFS is unsupported by Sveltia's GitHub backend. Measure first. | Routine recommendation; revisit only on size/build evidence. |
| D06 | Inline artwork enquiry, fixed recipient, Pages Function, Turnstile; evaluate native verified-recipient email first. | A provider such as Resend avoids binding limitations but adds another account. Native arbitrary-recipient sending currently requires paid Workers; no auto-reply is necessary. Mailto alone fails the brief. | Transport proof and authorised mailbox/account setup required. No paid service authorised. |
| D07 | Preserve illustration/jewellery as Art collections; mixed-production/theatre work as Film practice galleries. | Deleting these would violate preservation; making them top-level worlds would dilute the identity. Unfinished template pages remain archived, not automatically published. | Proposed curation; Lauren reviews presentation, omissions and publication rights. |
| D08 | CV HTML and generated PDF share structured content. | Browser print only lacks a direct download; a separately edited PDF drifts. Build-time PDF generation adds a browser dependency but keeps publication static. | Recommended; public fields and film dates require review. |
| D09 | Optional inverted comparison only with artist-approved paired images. | CSS invert is cheap but may misrepresent the intended phone-camera experience or colour transformation. A static original plus explanation works without uncertain simulation. | Default to static until Lauren verifies pairs and treatment. |
| D10 | Editorial CMS workflow with checks/previews before publication. | Direct publishing is simpler but removes review of credits and sensitive imagery. Editorial asset operations and branch rules need a real round-trip trial. | Recommended; repository owner and publishing authority unresolved. |

## Creative direction: a painted surface, two contexts

Use physical texture and image composition as the connecting idea. Film demonstrates how Lauren transforms objects and sets; Art lets viewers study the painted surface itself. Share one typographic family pairing, spacing rhythm and navigation, while changing scale, density and image rhythm.

Film: near-black `#17191c`, blue-grey `#27343a`, warm text `#f5f1e9`. Use wide process/detail images, quiet captions and clear role statements. Show the contribution before a production's wider credits. No showreel autoplay, film-grain overlay, theatrical loading screen or implication that Lauren designed a whole production.

Art: ivory `#f0e9df`, warm surface `#ebdcc7`, charcoal `#28201c`. Preserve full artwork proportions on detail pages. Use asymmetric sequencing and generous space on collection pages, with restrained labels. Derive occasional accent colours from the selected work, then check contrast. Do not apply palette filters to artwork photography.

Typography recommendation: self-hosted, licensed Manrope for navigation/wordmark/body with Newsreader for large editorial statements and collection introductions. Confirm license files and loading cost when selecting exact fonts. Limit initial weights and avoid decorative display fonts that compete with the paintings. Wordmark should be legible at mobile size. These are candidates, not a final identity.

### Landing specification

Desktop: two equal linked panels filling the available viewport beneath compact shared navigation. Film left, Art right. Following Mirko's design feedback, each panel now has one visible Film/Art label with an arrow; numbering and repeated “Enter” text are removed. One anchor per panel, no nested interactive controls. A single semantic heading spans the division: “TWO WORLDS. ONE ARTIST.” Position it on controlled dark/light solid areas; use split-colour decorative copies only if a single accessible heading remains and readability survives zoom. Avoid relying on blend modes against arbitrary imagery.

Candidate pair, after inspecting originals: the dark armour detail (`6f8b7b_e3d1ddcfc9754b16a432728814a06d90~mv2.webp`) against the pale geometric Artificial Landscapes image (`6f8b7b_b3d8cdf116b64b34a93daab139c02072~mv2.jpg`). Repeated angular structures connect the images while their tones establish the split. The inspected quarry photo includes frame, wall and foreground foliage, so it is less suitable as a tightly cropped hero. Selection remains provisional pending artist review, higher-resolution alternatives and rights clearance. Keep faces and crucial work out of the text zone. CMS stores image choice and focal point; maintain a layout-safe text area.

Mobile: Film above Art, approximately equal panel areas, statement across the horizontal boundary. Use `svh`/dynamic viewport handling and safe-area padding. Permit scrolling at large text sizes or in landscape rather than clipping content to a fixed height. Both links work with one tap and without hover. Heading must not intercept panel taps. Keep Film/Art labels distinct from the bridging statement.

Hover/focus: small contrast or underline change over about 180ms, no panel resizing or essential hover-only text. Focus rings remain visible across both themes. Reduced motion removes transitions. No entry animation or client router required. Acceptance includes keyboard traversal, touch, 200% text and 400% zoom, forced colours, reduced motion, and 320px-wide layouts.

## Reference research and limits

The table below records the initial HTTP research. A later native Chrome session made limited rendered observations of Audouy and Glaymann at desktop/phone widths, plus Barlow at phone width; see [source-browser-audit.md](source-browser-audit.md) for exact evidence and limits. Mirko then instructed the agent to stop checking external reference pages. Do not resume that browsing unless requested. Mirko subsequently ended further mobile/visual checks too, limiting browser use to necessity for locating a missing full-resolution source. The table is not a claim of completed visual or accessibility testing, and no creative approval follows from it.

| Reference | Evidence and useful direction | Limitation for Lauren |
| --- | --- | --- |
| [François Audouy](https://www.audouy.com/) | Clear professional identity and case-study navigation organise production work. | Lauren's role must stay specific; avoid adopting production-design authority or video dependence. |
| [Baptiste Glaymann](https://baptisteglaymann.com/) | Project titles sit with director/production credits and discipline filters. Useful model for factual project labels. | Commercial categories don't map directly to scenic/process galleries. |
| [Barlow Agency](https://www.barlow.agency/) | Production/year/project index makes a large film body scannable. | An agency-scale catalogue would overwhelm a single artist without curation. |
| [Tobias Kwan](https://www.tobiaskwan.com/) | Selected works plus illustration/sketch/traditional categories preserve breadth with little navigation. | No store is wanted here; medium categories should sit within Art collections. |
| [Lett Thomas](https://lett-thomas.com/gallery/) | Clear separation of exhibitions, artists and archive offers a useful model for collection context and durable older work. | A multi-artist gallery needs a much larger index than Lauren; avoid reproducing that navigation volume. |
| [T. Eberhard scenic portfolio](https://www.teberhard.com/scenic.html) | Groups work by scenic application and explicitly distinguishes collaborative work and permission limits. | Use the attribution discipline, not its older slideshow-heavy presentation. |

External reference review is curtailed at Mirko's instruction. Retain the limited findings already observed; do not treat unfinished reference checks as a reason to resume browsing or as a design approval. Do not copy reference imagery or compositions. Lauren's own images remain the basis of the provisional direction.

## Human gates

On 15 November 2026, Mirko separately authorised inspection of the local shell's layout, keyboard navigation and accessibility. This supersedes the earlier local-inspection restriction only; it does not reopen external reference/source browsing or approve facts, image rights, accounts or publication. Inspection evidence and limits are in local-verification.md.

Mirko subsequently instructed the agent to stop manual site accessibility checks and create Storybook. Ongoing UI checks use local stories and automation; manual accessibility inspection requires a new request. Storybook uses Astro-generated page HTML and the existing CSS through the HTML/Vite renderer, avoiding a second implementation of the shell. Generated fixtures must be refreshed after template/content edits; static-body scripts are rejected until their behaviour is deliberately supported. This local tooling does not authorise hosting, accounts, image publication or launch. Usage and test boundaries are in README.

Mirko then authorised preparing the first Film project and Art collection for review. [The review packet](first-content-review.md) proposes Blade Runner 2049 and Artificial Landscapes, with exact text and numbered image selections. Factual confirmation, image-specific permission/credits and selection remain separate decisions; preparing the packet grants none of them. Record any subsequent owner decisions here with their exact scope. Public deployment and launch remain separate.

The overall plan is authorised for local implementation. Mirko confirmed Lauren May Stewart and approved the proposed local visual direction on 15 November 2026. These decisions permit local implementation, without approving source facts, image rights, account access or public launch. Account integrations need approval once repository ownership, exact app permissions, hosts and mailbox are prepared. Paid services require a price/limit decision. Every production image needs a clear publication decision. Public previews, launch and DNS changes remain explicit approvals, even after the plan is approved.

No purchases, cloud resources, remote repository, app grants, external messages, DNS changes or public deployment have been made. Node 22.23.4 and pinned project dependencies were installed locally. A disabled enquiry boundary exists only for local routing verification; P07 replaces it after integration authorisation.

D11: **Production draft-media guard, implemented.** A real build emitted an unapproved draft image despite hiding its content. Production validation now rejects image-bearing drafts; local dev can inspect them. This is simpler than a custom loader and intentionally prevents deployment of such branches until media clearance or a proven protected-preview architecture. Isolated test imagery builds only into ignored `.verification-dist/`.


### First content approval

On 15 November 2026, Mirko replied “confirm” to the first-content review packet and its proposed text/image selection. This authorises local implementation of Blade Runner 2049 with F02/F03/F05/F07 and Artificial Landscapes with A01/A03/A04/A05/A06/A07, using the packet's proposed copy and descriptive alt text. The conservative proposals to omit the Film year and the Art exhibition/medium line are retained. No additional credits or restrictions were supplied; none are invented. The confirmation is recorded as Mirko's, not a separately observed reply from Lauren.

[content-approvals.json](content-approvals.json) is the exact record/image identity ledger: source pointers, original/copy hashes and approved record hashes. Only these two records become `publication: published` and `facts_verified: true`, with approved media, to permit inclusion in local static builds. That editorial state is not evidence of deployment or a grant to launch. Every other content/rights decision, landing imagery, video embedding, individual artwork facts, enquiries, account access and public launch retains its separate gate. The original migration/supplemental manifests remain historical preservation evidence; their inventory-wide unreviewed flags do not revoke or expand this narrow later approval.


### Second content approval

On 15 November 2026, Mirko replied “confirm” to the [Mulan and Oil Painting Landscapes review](next-content-review.md). This confirms the proposed title, role/contribution or introduction, descriptive alt text, and image-use selection: Mulan M03/M05/M07/M08; Oil Painting Landscapes L02/L01/L03/L04/L05/L06. Both Mulan date labels, workshop/extra-count claims and the separate Art medium field are omitted as proposed. No additional credits or restrictions were supplied; none are invented. This is Mirko's confirmation, not a separately observed reply from Lauren.

The identity ledger now contains four build-ready records and twenty image copies, with a per-record review reference. Prior versions of all four records remain in the ignored review cache. Public launch, landing imagery, other source records, video, individual artwork facts, enquiries and accounts retain their separate gates. Five selected landscape originals are only 478 pixels wide; they are displayed without enlargement, not replaced or regenerated. Higher-resolution versions and final quality qualification remain separate follow-up. Neither this approval nor local validation grants public deployment authority.


## GitHub repository and main push

Mirko supplied `https://github.com/mirkonz/lauren.co.nz` and explicitly instructed merging everything into `main` and pushing it. The repository was verified public and empty before the initial push. This authorises repository publication of the current project files and approved image copies; ignored originals, local audit caches, generated output and secrets stay local. The existing staged/unstaged work is included, with its prior staging preserved under ignored `.audit-cache/main-push-preservation/`.

This authorisation supersedes the earlier no-push instruction for this merge/push. It does not authorise Cloudflare setup, CMS/app grants, mail delivery tests, DNS changes or website launch, and it does not verify deferred source claims. The initial main push was verified, and [GitHub validation](https://github.com/mirkonz/lauren.co.nz/actions/runs/43698540679) passed for `281e4cc`. This establishes repository/CI operation, not authenticated CMS access or website deployment.


## Local organic design revision and image enquiries

Mirko requested less repetition, removal of 01/02, and a softer organic treatment, suggesting a brush stroke for Art. The local revision keeps the dark Film/light Art split and single bridging heading. The name appears in the header only; landing navigation uses About/Contact because the panels already provide Film/Art. The footer has a functional back-to-top link. Repeated card/index prompts are removed. Original decorative SVG paths add a warm brush sweep for Art and a charcoal contour for Film; subdued gradients, serif typography and asymmetric Art spacing soften the composition. These are decoration, not substituted portfolio imagery, and do not alter artwork photographs. Final visual acceptance remains Mirko's review.

Mirko answered “Yes, enquiries per displayed image.” Each currently cleared Art image therefore has an expandable form carrying its existing collection/image reference. This does not identify an individual artwork, set availability or authorise a sale. Public forms remain disabled and plainly say online enquiries are not open. No mail/widget account, live message or website deployment is authorised by this UI choice. Remaining source migration stays deferred.


Mirko subsequently requested fixed decorative backgrounds and elements on About, Contact and CV. The shared background is now viewport-fixed, with a neutral charcoal contour on About/Contact and the existing dark treatment on CV. Landing marks also remain fixed, clipped to their respective panels. This uses CSS only, keeps decoration behind content and non-interactive, and preserves forced-colour hiding. Holding-page facts and content remain unchanged.


## Distinct section decoration and parallax

Mirko requested a separate visual vocabulary for each section, multiple elements and parallax in place of the single fixed mark, and explicitly instructed merging/pushing the result. The revision uses three original SVGs per section: Film charcoal/scenic cuts, Art brush marks, About contours, Contact overlapping loops and CV paper/graphite. The two landing panels use their respective Film/Art set. Motion is gentle, bounded and disabled for reduced-motion preferences; no artwork photo is animated or filtered. This supersedes the earlier single/fixed-mark treatment.

The shared site bootstrap now owns parallax and conditionally loads enquiry enhancement for enabled forms. The separate enquiry bootstrap is superseded. Public enquiries remain disabled; no mailbox/widget/account or DNS change is included. The authorised main push may start an already connected Cloudflare build; no separate deployment command or account change is being performed. Final factual/image, live enquiry and launch qualifications retain their separate gates.
