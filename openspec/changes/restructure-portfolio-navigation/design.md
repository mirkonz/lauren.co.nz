# Design

## Context

The Film index currently lists published film records directly; Film project pages and Art collection pages already share `PortfolioDetail`. Four records are cleared for build inclusion, not automatically for new hero uses. Existing image enquiries use collection/image identity. See the proposal and [publication specification](../../specs/portfolio-publication/spec.md).

## Goals / Non-Goals

**Goals:** Make the hierarchy understandable and editable, preserve record identities and existing destinations, and make photographic detail usable across input types.

**Non-Goals:** Source recovery, broad content migration, fabricated project groupings, live enquiry delivery, external publication and account changes.

## Decisions

- Model subsections as CMS-managed content records, with the seven requested names as the initial set rather than a fixed enumeration. Editors can add and edit titles, introductions, practice, ordering, project references and curated images. Give each subsection a stable identifier independent of its display title and URL; retain or redirect previously published URLs when they change. Validate unique safe URLs, references and image permissions. Associate approved projects by reference, retaining each record as the single owner of its facts and gallery. Do not infer categories or invent projects. An unfilled subsection remains a holding state; synthetic fixtures exercise the complete design locally. Duplicating project records would risk content and enquiry drift.
- Keep existing published project and collection paths where practical; if a path must move, add a permanent, platform-compatible redirect and check it in the built/runtime output. Subsection links and back navigation reflect the new hierarchy without breaking existing links. Existing Art image enquiry targets must remain attached to their original canonical images.
- Reuse the existing layout, image optimisation and shared detail components. Build one reusable, progressively enhanced carousel rather than separate implementations. Default to manual navigation, avoiding autoplay and its motion/accessibility costs. Deliver a useful static first image and links if scripting fails; zero and single images do not expose dead controls. Pause any later approved automatic motion and honour reduced motion.
- Use the image area as the enlarged viewport, not a lens overlay. Pointer/touch holding temporarily enlarges and pans; release, cancellation or focus loss restores the normal view. A visible detail control toggles persistent mode with keyboard and touch pan controls and a clear exit, avoiding a long-press-only interface. Avoid trapping focus, interfering with scrolling or suppressing ordinary links and enquiry interactions. Zoom only where source resolution supports useful detail; preserve full original proportions in normal view. Test reduced motion and browser zoom.
- Treat new working photos and selection/order of images as editorial inputs, not implementation permission. Confirm exact image rights and approved use before inclusion. No assumptions about Lauren's presence in existing images. Five existing landscape originals are only 478px wide, so do not promise detail beyond their resolution. Existing approvals remain scoped to their recorded uses; resolve reuse rather than assuming it.

## Risks / Trade-offs

- [Few eligible hero photos or projects] → Ship honest media-free/empty states and prove the full layout with synthetic fixtures; obtain exact approvals separately.
- [Many image carousels can slow the page] → Prioritise the first visible image, lazy-load the rest, use responsive sizes and validate build output and performance.
- [Zoom conflicts with mobile scrolling or keyboard access] → Provide a persistent alternative, explicit exit and pointer cancellation; exercise interactions in automated Storybook tests. Manual accessibility inspection remains stopped unless requested.
- [Existing URLs or enquiry references break] → Test old destinations, redirects and canonical collection/image references against current records.

## Migration Plan

Implement locally only after a separate request. Add schema and CMS fields compatibly, then map only approved records, implement routes and interaction, and run checks. Keep current routes or redirects and retain publication guards. Any deployment needs separate authority; rollback is the previous authorised deployment and its matching content/configuration. Verify the actual hosting redirect behaviour before claiming it works remotely.
