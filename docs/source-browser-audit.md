# Rendered source audit

Observed 15 November 2026 using native Chrome. The browser access host was unavailable. This extends the earlier [On-set sample](local-verification.md#source-browser-sample); [plan.md](plan.md) owns task status and [decisions.md](decisions.md) owns approvals. No source account, form or content was changed.

Mirko subsequently narrowed the task to full-resolution source recovery: **no further mobile, visual or browser checks unless necessary to locate a missing source**. Browser observations below are historical evidence, not outstanding work. Recovery after that instruction used one targeted HTTP page fetch and the original media URLs.

## Coverage and limits

Desktop checks covered Jewellery, Scenic/Props/Sets, 3D Objects, Inverted Paintings, Illustration, Painting and Lettering. Mobile-sized checks used Chrome's iPhone SE preset at **375 × 667 CSS pixels**, including a reload for Wix's mobile navigation. Painting, Jewellery, On-set, Lettering and Scenic were sampled. Projects, the standalone fullscreen shell and the declared jewellery template were also opened at phone width. This is desktop browser emulation, not a physical-phone touch or assistive-technology test. The custom desktop preset labelled `1920x1080` actually reported **1920 × 900**; initial source checks also used the ordinary desktop window.

These checks verify headings, counters, media presence and selected controls. They do not establish image-by-image attribution, complete caption accuracy, mobile coverage of every source page, reduced-motion support or an accessibility pass. Galleries advance during inspection, so a counter change alone is not proof of a click response. Screenshots and accessibility observations were inspected in the session; no screenshot archive was saved.

## Galleries and jewellery

The following rendered headings and totals agree with [the preserved ordered mapping](audit/gallery-map.json):

| Page | Observed gallery totals, in source order |
| --- | --- |
| Jewellery | Earrings 14; Rings 13; Necklaces & Keyring 5 |
| Scenic, Props & Sets | Props & Decorative Painting 89; Set Painting 50; Prop making 10; Furniture 3; Constellations - Set Design 4 |
| Inverted Paintings | Quarries & Mines 14; The Performance Arcade 2017 8; Portrait Drawings 10; Inverted paintings 4 |
| Illustration | Ink Illustrations 6; The Village Goldsmiths 10; Logos 4; Digital Painting & Illustration 21; Portraits 10; Murals 7; Digital Illustrations 3; Floral Illustrations 5; Fly Buys 12; City Streets Illustrations 4 |
| Painting | Artificial Landscapes 14; Oil Painting Landscapes 9; City Streets Illustrations 4 |
| On-set, mobile follow-up | Blade Runner 2049 8; Mulan 12; Onset Painting 21 |

Lettering exposes 21 image controls and `1/1` on desktop. At phone width its initial grid exposes ten image controls and `1/3`. Those are **pagination counts**, not conflicting artwork totals. Some thumbnails displayed broken-image placeholders. Mobile pages 2 and 3 were not traversed; the original ordered 21-entry snapshot remains the preservation source.

Jewellery's sampled desktop earring and mobile necklace images open lightboxes on `/jewellery-1`, adding `lightbox=dataItem-...` rather than navigating to `/jewellery/{title}`. The desktop sample used `dataItem-m9yo2jv1`; the mobile necklace sample used `dataItem-m9yo90ab2`. The mobile Next control responded and the gallery also advanced automatically. The mobile image is proportionally contained between black areas with overlaid arrows. No individual title, availability or sale claim was visible in these samples.

Escape did not dismiss either sampled jewellery lightbox. The desktop Close button worked. Mobile had a visible X which closed with a pointer action, but no Close button appeared in that lightbox's accessibility tree. The replacement needs labelled controls, reliable Escape dismissal and focus restoration. Do not copy the source behaviour.

`/blank-1` renders Wix's “There's Nothing Here” page. Public menu/gallery sampling found no dynamic jewellery detail link. This narrows the discovery gap; it does not prove the CMS has no records. Do not guess slugs. Resolution still needs a public link supplied by the owner or an authorised export.

## Video and older-gallery discoveries

[The supplemental media ledger](source-media-review.json) preserves URLs, source IDs, order, proposed review ownership and explicit unapproved status. It supplements the immutable image audit and `migration.json`; it does not change their counts.

- Scenic, Props & Sets renders the StarNow advert `Q0zfVh7vUng`, credited by the player to StarNow, beside the source claim about props for Sally Tran's advert. It plays with autoplay/mute/loop embed parameters. The same video opens as the first item in the older 3D Objects gallery. Keep one media identity with both source occurrences; the source contribution claim still requires verification.
- Inverted Paintings renders a roughly seven-second portrait video demonstrating a painting and a screen showing an inverted view. The player has the placeholder title “Your Video Title” and plays muted in a loop. The existing snapshot identifies its Wix MP4, duration 7.17 seconds and poster description `private`. That label needs owner clarification. The source MP4 was subsequently downloaded to the ignored archive as described below; no embed or publication was approved. This observation does not approve CSS inversion or establish paired artwork files.
- **3D Objects is populated at runtime.** Its expanded gallery exposes ten ordered item IDs: one StarNow video followed by nine image items. The last expanded item has Previous and no Next. The first image item (second gallery item overall) initially displayed a broken image; the final item displayed colourful objects with light trails. A subsequent targeted public page-source fetch recovered all nine image URLs and their original metadata. The source warmup data also confirms `totalItemsCount: 10`. Recovery and archive matching are recorded below; attribution and rights remain unapproved.

This corrects the earlier implication that the older page had no gallery. The existing **29 galleries / 395 ordered image entries** describe the first extraction's coverage, not the entire rendered source. The additional mixed gallery is preserved by ID and original URL in the supplemental ledger. Its recovery outcomes supplement the original manifest. P01/P03 remain incomplete because original-file gaps and artist review remain unresolved.

The Projects page still presents six Project Name headings with editing-instruction template prose. It supplies no verified project identities. The standalone fullscreen URL exposes a Wix Pro Gallery frame without a selected item in the sampled state; it is not evidence of an additional collection.

## Full-resolution source recovery

After the scope correction, a single HTTP fetch of `/3dobjects` exposed `wix-warmup-data`, including the public gallery's full item metadata. No login, invented API query, thumbnail substitution or access-control workaround was used. The supplemental ledger retains that gallery data, filenames, dimensions, ordering and source URLs; the original `docs/audit/` files and migration manifest remain unchanged.

The nine image occurrences match three already-downloaded originals, two additional downloadable originals, three previously recorded 403 URLs and one newly found 403 URL. The video poster also matches an existing downloaded image. Source metadata labels the uploaded images `private`; this is preserved and requires owner clarification before any reuse.

Recovered into ignored `source-assets/wix/`:

| Original source file | Verified recovery |
| --- | --- |
| `6f8b7b_2fa2bc7e1f674ea39873df16676e8632~mv2.webp` | 1083 × 1444 pixels; 192,016 bytes |
| `6f8b7b_a1bf645b69c940e990aeb6e03bfed990~mv2.jpg` | 1602 × 1193 pixels; 352,319 bytes |
| `6f8b7b_998e199f9f5f43209d1ef7500cbf13d4-1080p.mp4` | Source-provided 1080p MP4; 5,673,261 bytes; video dimensions not independently decoded |

The new original `6f8b7b_e665fbc1b1c14d07a5a85141f2f5842a~mv2.jpg` returned HTTP 403 on one request. Previously failed URLs were not retried. No alternate preview is represented as an original. The two YouTube videos remain link-only; a public embed does not provide an original video master.

The combined URL inventory now contains **401 original-image URLs: 384 downloaded and 17 inaccessible**, plus one downloaded source MP4. The unchanged initial manifest still describes 398 URLs, 382 downloads and 16 gaps; the supplemental ledger owns the additions. Do not regenerate migration drafts merely to absorb this evidence. Artist facts, permissions and curation remain separate.

Validation: new file sizes and SHA-256 hashes verified; downloaded image dimensions read from files. The staged Git tree, all 26 initial audit files, all 55 existing content files and all 382 original archive files matched their pre-edit hashes. `migrate-drafts.py --check` passed for the original 52-record reconciliation. No original was overwritten or deleted. Runtime website tests were not repeated for these documentation/archive additions.

## Owner-file checkpoint

A follow-up inspection of the saved evidence found no additional untested original media URLs. The only remaining filename-derived candidate, `6f8b7b_5b75a314610c44b8ba4eb27fdf98f182~mv2.webp`, appears in the metadata of an already recovered 3D image. One request to its normal original-file URL returned HTTP 403. It does not resolve a missing original or establish an additional gallery asset, so confirmed totals remain unchanged. No browser, full crawl, known-403 retry or preview substitution was used.

[The owner-file request](source-recovery-needed.md) identifies all 17 missing originals by URL, gallery position, source item ID and available source filename/dimensions. It also identifies the two link-only videos and the limits of jewellery discovery. Remaining recovery requires owner-supplied files or an authorised export. The supplemental ledger records the candidate attempt separately; no original manifest or draft was regenerated.

Validation at this checkpoint: all 385 archive files match their recorded sizes and SHA-256 hashes; the 401 confirmed image URLs reconcile to 384 downloads and 17 gaps. The staged Git tree, original audit/migration manifests, draft content and pre-existing archive files are unchanged. Factual, permission, design and publication flags remain false. Patch whitespace checks passed. Application tests were not repeated for documentation-only changes.

## Layout observations and reference boundary

Lauren's sampled desktop pages use warm neutral backgrounds, white image panels, sans-serif headings and serif descriptions. Phone-width pages stack content vertically and replace desktop navigation with an overlay menu. The sampled Painting menu exposed Film/Art groups and Art child links. Long contribution prose wraps at phone width; image containers can occupy substantial vertical space. Source animation and delayed media loading caused transient blank areas during scrolling. These observations support explicit loading space and stable controls in the replacement; they do not justify recreating Wix's layout.

Mirko stopped external reference checking during this session. **Do not resume external reference browsing unless requested.** Before that instruction, only limited observations were made:

| Reference | Directly observed | Limit |
| --- | --- | --- |
| François Audouy homepage | Desktop 1920 × 900 and phone 375 × 667; large serif statement, small spaced sans-serif navigation, full-area moving video; mobile hamburger. Tab reached the identity link and an unnamed `javascript:void(0)` menu link. | Enter/click on that menu link did not visibly open it in the attempted sequence. No case-study, touch or reduced-motion qualification. Avoid a video-dependent entrance. |
| Baptiste Glaymann homepage | Desktop three-column image cards become one column at 375px; bold sans-serif type, ruled category navigation, project/director/production captions remain beneath imagery. Tab produced a visible dashed focus outline on the identity link. Thumbnail frames changed while observing. | No full keyboard traversal, physical touch or reduced-motion test. Visible role captions are useful; the category volume and moving thumbnails need not transfer. |
| Barlow Agency homepage | Phone-width image collage, delayed header/menu appearance; menu button opened Home/Work/About links. | Desktop review and catalogue navigation unfinished. Collage motion and delayed controls offer little value for Lauren's requested predictable entrance. |

Tobias Kwan, Lett Thomas and T. Eberhard received no rendered review in this session. Earlier HTTP findings remain labelled as such in decisions.md. Incomplete external reference review is now a scope boundary, not an instruction to keep browsing or a design approval. Final name, creative direction, facts, image rights and public launch remain unapproved.
