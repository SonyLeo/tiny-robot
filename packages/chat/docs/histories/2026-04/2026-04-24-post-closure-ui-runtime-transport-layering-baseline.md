## [2026-04-24 03:05] | Task: post-closure UI / runtime / transport layering baseline

### Why Now

After the main `TrChat` refactor and post-closure stabilization had already closed, a remaining design question kept resurfacing in discussion:

- how should the package balance "use our full packaged chat ability"
- against "use our UI, but keep your own data-access layer"
- without collapsing the package into only two vague buckets like "UI" and "data"

The current package already supports multiple integration depths, but the background, tradeoffs, and recommended balance were still spread across chat discussion, package README guidance, and helper-retirement notes.

### Files Changed

- `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/AGENTS.md`

### Contracts Touched

- docs:
  product-layering guidance, supported entry-surface balance, and follow-up scope framing

### Changes Overview

- Main implementation result:
  no runtime or package code changed
- Main docs result:
  added one design-level baseline that:
  - defines the recommended three-layer model
  - maps the current official entry surfaces onto that model
  - explains what the package should continue to own at the orchestration-runtime layer
  - distinguishes low/medium/high-cost follow-up scopes
  - records the recommendation to keep the middle `Provider(responseProvider)` product tier

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  no active execution slice or review packet changed
- Why:
  this task only baseline-documents product-layering guidance after closure
- Backwrite status:
  docs routing and source-of-truth references were updated in the same task

### Known Limits

- this is a design baseline, not a reopened implementation plan
- it does not itself resume the optional follow-ups around code coverage, deeper private runtime cleanup, or footer publishing semantics

### Follow-ups

- if future work resumes deeper private runtime cleanup, evaluate it against this design rule:
  preserve the middle "our UI + runtime, your transport" integration tier instead of pushing orchestration complexity onto integrators
