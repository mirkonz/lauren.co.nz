# Proposal

## Why

Existing publication safeguards live in source, tests and historical planning,
with no accepted OpenSpec requirements. Capture a narrow baseline before further
enquiry or editorial integration so later changes preserve those safeguards.

## What Changes

- Add reviewed requirements for existing content/media and prelaunch boundaries.
- Reconcile each scenario with existing source and relevant automated evidence.
- Keep all website code, content, deployment settings and accounts unchanged.
- Treat any discovered defect as a separately scoped change, not permission to fix
  it during this baseline. Do not resume deferred migration.

## Capabilities

### New Capabilities

- `portfolio-publication`: production content/media eligibility, excluded source
  evidence, prelaunch indexing and disabled enquiry responses. New to OpenSpec;
  the behaviour is already implemented.

### Modified Capabilities

None. There are no accepted main specs yet.

## Impact

Only OpenSpec artifacts and, if needed, corrections to existing evidence links.
Inputs: [architecture](../../../../docs/architecture.md),
[decisions](../../../../docs/decisions.md),
[content approvals](../../../../docs/content-approvals.json) and
[local verification](../../../../docs/local-verification.md).
Historical P02/P07/P08 supply context, not a parallel task list.

Review this proposal before requesting execution. Local baseline verification
needs no new account, rights or publishing grant. Remote writes, deployment,
messages, DNS, content migration and launch remain outside this change.
