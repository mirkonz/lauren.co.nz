# Editing the portfolio

This guide describes the local editor and the intended reviewed publishing workflow. Remote sign-in, previews and publishing have not been verified. Use [the plan](plan.md) for current priorities and [deployment preparation](deployment.md) for account setup. Do not treat saving a file or a successful build as permission to publish it.

## Open and save locally

Use the Node version and commands in [README](../README.md#local-setup). In Chromium, open the loopback development site's `/admin/index.html`, choose **Work with Local Repository** and select `/Users/mirko/Code/github/lauren.co.nz-planning`. Confirm this exact folder before allowing file access. Local saves write directly into that worktree; they do not send changes to GitHub or publish the site.

The Film and Art collection pages are generated from their records. Edit the existing record rather than creating another copy. Keep the stable reference ID and folder name unchanged; changing the URL name can break existing links and needs a redirect plan. Gallery array order controls the displayed order. Save, reload the editor and reopen the record to confirm persisted text, image references and ordering. The earlier local round-trip trials establish this workflow for their tested cases, not every future file or browser.

## Facts and images

Only the four entries identified in [content-approvals.json](content-approvals.json) are currently cleared for build inclusion. The remaining drafts and source archive preserve evidence; their text, dates, credits and images are not automatically cleared. The remaining migration is deferred, so do not use this guide to start another content batch.

Keep unknown year, price, medium, dimensions or attribution fields empty. An artwork's availability starts as unknown and enquiries off. A published record requires verified facts, approved image permissions and useful image descriptions. These editor switches record a human decision; they cannot establish rights themselves. No individual artwork pages or working enquiry delivery are currently connected. The cleared collection images have disabled enquiry disclosures using their existing references; keep image filenames stable so these references survive reordering. Turning on a CMS enquiry switch does not enable email.

Upload an approved image into its own entry, not the raw source archive. Keep the untouched original separately. Describe the visible work in alt text; use an empty description only when the image is deliberately decorative. Captions and credits need their own factual/permission clearance. Preserve full proportions and check the generated result instead of stretching a small original. A previous local save/reload accepted one 31.9 MB synthetic PNG; that is not a recommended upload size, an upper limit, or evidence of GitHub acceptance.

Six draft titles contain `[IMAGES MISSING]`. Preserve those markers and their mappings in source-media-review.json. Remove one only after every mapped original has been recovered and verified. A preview image is not a replacement original.

## Before remote publishing

An authorised maintainer must first verify the account/editor workflow, protected preview access and branch rules described in deployment.md. The `publication` field controls which records can enter a build; the remote editorial review/merge is a separate operation. A public preview can expose restricted images even if search engines are blocked.

For an approved change, review the exact changed facts, image permissions, gallery order and generated route. The maintainer runs the documented checks and verifies the protected preview before an authorised merge/publication. Keep evidence of the previous successful source revision and deployment for rollback. Never upload the ignored source archive, audit evidence, test output or Storybook build as the portfolio.

If a save appears lost, stop editing that record and verify the selected folder and reopened file before making another copy. If a build rejects facts, permissions or draft media, correct the record or ask the maintainer; do not disable the check. If a deployment fails, use the approved rollback procedure and verify the previous version is actually serving before resuming publication.
