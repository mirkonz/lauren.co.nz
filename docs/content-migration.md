# Source audit and migration inventory

Audited 15 November 2026. Source: [existing Wix site](https://laurenlikestopaint.wixsite.com/mysite). This records preservation evidence and the local draft conversion. No portfolio content has been published.

Mirko subsequently confirmed the first Film/Art subset. [content-approvals.json](content-approvals.json) maps the four approved records and twenty exact image copies; all other source material retains its gates. The manifests below preserve the original extraction and draft baseline rather than being regenerated over later editorial decisions.

## Recovery evidence

- 13 sitemap URLs, 16 router page definitions and a dynamic jewellery prefix discovered. Root plus all 16 page SEO paths fetched: **17 URL snapshots**, including root/About aliases and the jewellery template path returning a Wix not-found page.
- **29 rendered galleries, 395 ordered entries in the initial extraction**. Wix also emits six repeater gallery templates: 35 raw gallery components are preserved, not incorrectly counted as separate galleries.
- **398 unique image URLs**, 585 renderer image occurrences plus HTML image metadata. **382 originals downloaded**, totalling **1,279,801,518 bytes**. **16 original URLs returned HTTP 403**, retained as unresolved references, not silently omitted or repeatedly retried.
- Every downloaded file's byte length and SHA-256 verified. Gallery instance counts match page counters. Lettering uses a paginated grid: `1/1` means one page containing 21 images, not one image.
- One group of byte-identical assets found. City Streets also appears in two content areas; keep all occurrences until review resolves intentional overlap.

Evidence: [page fetches and links](audit/pages.json), [router](audit/routes.json), [sitemap](audit/pages-sitemap.xml), [ordered raw galleries](audit/galleries.json), [image occurrences](audit/occurrences.json), [download manifest](audit/assets.json), [integrity report](audit/verification.json). Per-page JSON preserves extracted text, links, rendered image metadata and public renderer properties, including captions where supplied.

Originals are at `source-assets/wix/` in the planning worktree, retaining Wix media filenames. Human-readable upload filenames are preserved in source HTML image metadata where available. The archive is ignored by Git and must be backed up to an owner-approved location before the worktree is removed. It is not a cloud backup or part of the build. Do not add 1.28 GB of raw images to Git without the media-size decision. No source material has been deleted. The later [rendered review](source-browser-audit.md) found a runtime 3D Objects gallery (one video and nine image items) and video occurrences beyond this extraction. Their IDs/order, original URLs, metadata and recovery outcomes are retained in [source-media-review.json](source-media-review.json). Two additional original images and one source MP4 were recovered; one additional original returned 403. The combined inventory is 401 image URLs, 384 downloads and 17 inaccessible originals, plus one downloaded MP4. The initial manifests retain their initial counts. These discoveries do not change the verified initial archive counts or establish full source recovery.

Reproduce public extraction with `python3 scripts/audit_wix.py`; it downloads originals and can consume substantial bandwidth. Verify existing files without network access using `python3 scripts/verify_audit.py`. Recovery scripts are audit tooling, not website implementation. Raw HTML/session state is not committed.

## Page mapping

All paths in the first column are relative to `https://laurenlikestopaint.wixsite.com/mysite`. “Inventoried” means text and asset references preserved; it does not mean migrated, approved or fact-checked.

| Source | Recovered content | Proposed destination | Status / review |
| --- | --- | --- | --- |
| `/` and `/about-5` | Intro, extended biography, education summary, skills, contact email, Instagram, portrait | `/about/`, Film introduction/CV, settings | Inventoried; reconcile with older Home and CV |
| `/filmography` | 18 production credits with role and year labels; East of Eden image | `film` records, `/film/`, `/film/cv/` | Inventoried; dates conflict with CV |
| `/on-set` | Blade Runner 2049, Mulan, general on-set contribution text and galleries | Production pages for first two; `/film/practice/on-set/` | Inventoried; gallery membership is not proof of an individual image's production |
| `/scenic-props-sets` | Five galleries, Star Now/Sally Tran mention, fabrication/theatre descriptions | `/film/practice/` pages; named project where attribution verified | Inventoried; image-specific rights and credits missing |
| `/invert` | Artist statement and four groups with mediums/event description | Art collections, optional identified works | Inventoried; no assumed digital inversion |
| `/illustration` | Ten groups, client names, medium/process descriptions | Art collections with verified client labels | Inventoried; overlaps Painting/Lettering |
| `/jewellery-1` | Silver/wax-casting description and three groups | Art jewellery collections | Inventoried; sale states and individual labels unknown |
| `/painting` | Artist statement, three groups and Waikato Society of Arts exhibition mention | Art collections; About art practice excerpt | Inventoried; exhibition date not supplied |
| `/cv` | Two high-resolution CV PNG pages and decorative vectors | Structured CV, accessible HTML and generated PDF | Both raster pages visually inspected and transcribed; factual/publication verification remains |
| `/home` | Older long biography, detailed faux-finishing skills, Wellington location | Reconciled About/CV source | Inventoried; preserve original prose, do not publish competing biographies |
| `/contact` | Commissions/exhibitions/collaboration invitation and Wix form | `/contact/`, enquiry settings subject to confirmation | Inventoried; displayed success text is template UI, not evidence of message delivery |
| `/projects-8-1` | Props & Set Painting heading, six Project Name placeholders, template prose/images | Archive/review; only genuine work may become Film content | Inventoried; template text must not become Lauren's project claims |
| `/3dobjects` | Description; runtime mixed gallery with StarNow video then nine image items | Film practice content after overlap review | All ten item IDs/order and nine original-image URLs mapped; three image originals already archived, two newly downloaded and four inaccessible. Rights/attribution unresolved |
| `/lettering` | Older Lettering & Logo grid with 21 images | Art collection or merged illustration gallery after review | Inventoried; inspect all images before combining |
| `/fullscreen-page` | Empty fullscreen shell | Archive only unless browser reveals unique content | Inventoried; do not create an empty destination page |
| `/blank-1` and dynamic `/jewellery/{title}` | Router declares jewellery CMS template; direct template path shows Wix 404 | Review for public dynamic records/export | Unresolved; no detail URLs recovered from page anchors/sitemap |

No dedicated film project detail links were found beyond external Wētā references. Most source work is grouped by practice or medium. A schema assuming every image belongs to a titled production or separately labelled artwork would manufacture information.

## Ordered gallery mapping

Each row maps to the same page's component instance and item order in galleries.json. Titles/descriptions are associated through the matching Wix repeater item suffix, not guessed from image filenames. Additional per-image titles/descriptions are preserved when present; many are blank.

| Source | Groups and entry counts, in source order | Destination type |
| --- | --- | --- |
| `/on-set` | Blade Runner 2049 8; Mulan 12; Onset Painting 21 | Film projects / practice gallery |
| `/scenic-props-sets` | Props & Decorative Painting 89; Set Painting 50; Prop making 10; Furniture 3; Constellations - Set Design 4 | Film practice galleries / verified theatre project |
| `/invert` | Quarries & Mines 14; The Performance Arcade 2017 8; Portrait Drawings 10; Inverted paintings 4 | Art collections, including installation/detail photos |
| `/illustration` | Ink Illustrations 6; The Village Goldsmiths 10; Logos 4; Digital Painting & Illustration 21; Portraits 10; Murals 7; Digital Illustrations 3; Floral Illustrations 5; Fly Buys 12; City Streets Illustrations 4 | Art collections |
| `/jewellery-1` | Earrings 14; Rings 13; Necklaces & Keyring 5 | Art collections |
| `/painting` | Artificial Landscapes 14; Oil Painting Landscapes 9; City Streets Illustrations 4 | Art collections |
| `/lettering` | Lettering & Logo grid 21 | Art collection, overlap review |

Retain image sequence and all detail/process shots. Gallery entry counts are not artwork counts. Curation happens after preservation, with explicit disposition for every occurrence. The immutable audit manifests retain their original null destinations. P03 destinations and archive-only dispositions now live in [migration.json](migration.json), keyed to those original source records; null audit fields are not completion claims.

## Filmography and CV comparison

Filmography source labels, not verified release dates:

| Production | Source role | Source year label |
| --- | --- | --- |
| East of Eden | Head of Props Painting Department | 2024-2025 |
| Avatar Sequels | Onset Painter | 2018-2025 |
| Wolfman | Props Buyer & Onset Painter | 2024 |
| The Rule of Jenny Pen | Props & Set Dec Buyer | 2023 |
| Weta Workshop: Tron Ares | Painting Technician | 2023 |
| After the Party | Art Department Assistant | 2022 |
| Sweet Tooth: Season 2 | Onset Painter | 2023 |
| M3gan | Head of Department: Scenic | 2021 |
| X | Onset Painter | 2020 |
| Pearl | Onset Painter | 2023 |
| Power of The Dog | Scenic Painter | 2019 |
| Mulan | Onset Weapons Assist & Painter | 2020 |
| Weta Workshop: Alien | Painter | 2023 |
| Blade Runner 2049 | Onset Art Assistant & Scenic Painter | 2016 |
| Mortal Engines | Props Painter | 2016-2017 |
| Ghost in The Shell | Scenic & Props Painter | 2016 |
| Savage | Props Painter | 2018 |
| Time Bandits | Onset Painter | 2023 |

The CV is not missing: it is rasterised. Originals are `6f8b7b_fcae58015dee4fe4a0a988cd2c577eae~mv2.png` (CV_website_Page_1.png) and `6f8b7b_2ed2c15d745d4df79b671a0624553abd~mv2.png` (CV2.png). No downloadable PDF link was recovered.

Visual inspection of both originals found:

- CV heading uses **Lauren May**, while Home/footer use **Lauren May Stewart**. Final name needs confirmation.
- CV uses different years for After The Party (2023), Time Bandits (2022), Sweet Tooth Season 2 (2022), Pearl (2021), Power Of The Dog (2020), Mulan (2019) and Mortal Engines (2017). These may be work dates versus release dates, but that is unverified. Do not resolve by guessing.
- CV separates Weta Workshop/Mulan (2019, Painting Technician) from Mulan on-set work. It also lists Diwali Festival and Circa Theatre (2016) and several non-film jobs. Preserve these additional entries.
- CV contains skills in Film & On-Set, Workshop/Painting & Finishing, Organization & Teamwork, Digital Tools & Administration; education at Massey, Wintec and Fairfield College; languages, awards, interests and other work. A [structured transcription](audit/cv-transcription.json) now preserves these source claims, with the phone explicitly withheld from new text. Verification and migration remain separate.
- LinkedIn `https://www.linkedin.com/in/lauren-stewart-1726746b/` and IMDb `https://www.imdb.com/name/nm9071590/` appear as image text. Preserve as source links; destination availability and identity have not been independently verified. Public Instagram link: `https://www.instagram.com/curly.lines/?hl=en` (fetch throttled).
- A phone number appears in the source CV. It has not been copied into new public content; confirm intended publication. The CV's “VES Award for Outstanding Model” line must not be rewritten as a personal award without attribution clarification.

The existing email is present in About and CV; whether it remains the desired enquiry destination is unconfirmed. No test form was submitted.

## Gaps and migration risks

| ID | Gap / evidence | Required resolution / owner |
| --- | --- | --- |
| G01 | 17 original-image URLs are inaccessible: 16 in assets.json/verification.json plus one in source-media-review.json | Owner supplies originals or explicitly accepts accessible source renderings/recorded gaps. Do not bypass access restrictions. |
| G02 | Main gallery totals confirmed in Chrome; three video identities and ten-item runtime 3D gallery outside initial manifest (source-browser-audit.md / source-media-review.json) | Runtime item/original URL matching and video review ownership recorded in supplemental ledger; recover unavailable originals or original video masters from owner. Mirko stopped further mobile/visual/browser checks unless necessary for finding a source. |
| G03 | Dynamic jewellery router present; sampled desktop/mobile images open lightboxes, not dynamic detail routes; no public detail URL found and template remains 404 | Public-link discovery or owner-authorised Wix export; do not enumerate invented titles. |
| G04 | CV/date/name discrepancies; transcribed entries await verification | Lauren verifies preferred name, dates/roles, awards, public fields; preserve both versions until resolved. |
| G05 | Most images lack individual titles, captions, alt text, dates, dimensions and availability | Lauren labels work where useful. Unknown facts stay optional; unknown sale state disables enquiries. |
| G06 | Production confidentiality and image ownership unclear; source warns many projects cannot be shown | Image-by-image permission review before public preview or launch, especially production/promotional imagery. |
| G07 | Duplicate/overlapping collections, unfinished templates and older biography | Compare hashes and meaning; retain source occurrence mappings and seek curation decision for archive-only material. |
| G08 | 1.28 GB recovered archive; only local preservation so far | Owner-approved archive backup; measure proposed publishable media size and build time before Git/R2 decision. |

No evidence establishes a need for ecommerce, an inventory backend or invented artwork prices. No evidence establishes control over Wix redirects. New-host legacy-path redirects can help copied paths on lauren.co.nz; they cannot redirect the old Wix hostname. Plan an owner-approved update of old-site links if supported, without removing Wix content.

## Migration completion rules

P03 is complete only when all page and occurrence records, including later runtime-gallery/video discoveries, have destinations or reviewed dispositions, unavailable media is explicitly accounted for, source order/captions/credits are reconciled and build references resolve. Launch additionally requires artist review of factual conflicts, public contact details and permissions. A successful build, 382 files on disk or an attractive selected gallery is insufficient proof of complete migration.

## Additional evidence from local foundation work

[Gallery mapping](audit/gallery-map.json) associates all 29 gallery titles with source repeater IDs and accounts for 395 ordered entries. The two City Streets galleries reference the same four image URIs; both source occurrences remain preserved. The byte-identical pair is `6f8b7b_4983c2ed0cd74a8db9a85e29108f6990~mv2.jpg` and `6f8b7b_1bc25713095b41e4b9d84ed6ef2dc07d~mv2.jpg`, both from On-set; neither original was removed.

## Local draft conversion

[The reconciliation manifest](migration.json) maps all 17 source snapshots, 585 renderer occurrences, 398 asset URLs and 29 rendered galleries containing 395 ordered entries. It records source hashes, generated record hashes, archive paths/status, stable draft destinations, source pointers and review dispositions. Source pointers preserve the complete original captions, credit lines, metadata and ordering without copying private archive images into Astro. Six repeater templates are explicitly distinguished from rendered galleries. No raw audit files were changed.

`src/content/` now contains 52 source-derived drafts: 19 film records (18 Filmography credits plus the separate CV Weta Workshop/Mulan claim), 10 practice records, 20 art collections and About/Contact/CV. The CV page holds skills, education, languages and non-film experience; its filmography links to the film records. All 20 CV film/production claims map to records. Conflicting CV roles/dates stay separately labelled in record bodies, including the unresolved award attribution. The older Home biography stays in its source snapshot for reconciliation rather than becoming a competing About page. Contact details and professional name remain unconfirmed in source evidence; provisional settings are unchanged.

The two City Streets galleries map to one collection while retaining both four-image sequences in the manifest. This is metadata consolidation only; no original or occurrence was deleted. The byte-identical On-set pair remains duplicated in the archive pending review. No individual artworks, release dates, availability, prices, dimensions or image permissions were invented. Template projects, the fullscreen shell and inaccessible jewellery template have explicit archive/review dispositions. Dynamic jewellery records remain unresolved.

Images have archive-only dispositions pending rights review. Collection gallery arrays remain empty in Astro because production builds reject image-bearing drafts. Page-level/repeater mappings describe intended ownership, not verified attribution of each image. All 16 unavailable originals remain recorded; downloaded originals retain their original sizes and hashes. Source facts remain `facts_verified: false`; every migrated record is `publication: draft`.

Run `python3 scripts/migrate-drafts.py --check` to compare generated records/mapping with source evidence and recheck all 382 archived original hashes. The initial conversion script can reproduce the draft snapshot; it refuses to overwrite edited records. It does not download, deduplicate or publish media. `npm test` checks source coverage, gallery order, unapproved draft boundaries and conflicting CV claims. During later artist curation, revise the snapshot checks and conversion ownership deliberately; do not regenerate over editorial changes. This manifest owns migration reconciliation; raw audit JSON owns source evidence; plan.md alone owns task status.

Validation on 15 November 2026: draft reconciliation/archive hash check, `npm run check`, all 14 tests, production build/exclusion checks and staged/unstaged patch hygiene passed. The staged index and all pre-existing audit files were preserved. Full P03 acceptance still requires factual/curation review, missing-original resolution, image permissions and P02 browser/media proof. Public pages remain placeholders.

The subsequent [local browser verification](local-verification.md) confirms a CMS editing/upload round-trip and a limited On-set source sample. The newly observed Blade Runner video has an explicit review disposition there; it is outside the image-only migration manifest and has not been embedded or approved. The subsequent [source browser audit](source-browser-audit.md) extends coverage and corrects the older 3D gallery gap. The original image-only reconciliation remains scoped to its extraction; runtime matching and archival recovery outcomes now live in the supplemental ledger, with remaining original-file gaps and permissions explicit. Broader source, media-size, account and artist gates remain open.
