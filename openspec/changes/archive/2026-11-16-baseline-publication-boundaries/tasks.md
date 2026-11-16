# Tasks

Mirko requested continuation on 16 November 2026. Local baseline reconciliation and qualification are complete; see the design evidence table and docs/local-verification.md. Website source and content remain unchanged.

## 1. Reconcile the baseline

- [x] 1.1 Trace every publication scenario to the current content validators, build verification or disabled endpoint and existing tests; record exact evidence references in the design and resolve specification mismatches without changing website code.
- [x] 1.2 Check the four-record approval ledger and decision scope against the baseline wording; verify it neither expands image permissions nor treats the preview as launch authority.

## 2. Qualify the contracts

- [x] 2.1 Run the relevant existing content/publication/build checks for unresolved evidence; record command exit results and verification limits in the existing local-verification document, without duplicating unchanged evidence.
- [x] 2.2 If HTTP behaviour needs fresh evidence, check listener ownership, start the existing loopback Pages runtime, run `npm run test:pages`, stop only that owned runtime and record the result; send no email and change no remote service.
- [x] 2.3 Run `npm run openspec -- validate baseline-publication-boundaries --strict --no-interactive` and review every scenario/evidence link; leave gaps explicit and scope any implementation defect separately.

## Workflow follow-up

- After review and completed verification tasks, archive through the native workflow to establish the accepted spec and read back the result.
- Report the milestone to the existing owning Paperclip issue only if reporting is authorised; include the change and evidence links, without copying these tasks.
