## [2026-04-24 23:59] | Task: post-closure generated doc index pruning

### Why Now

While reviewing `packages/chat/docs` for outdated files, the generated-artifacts directory README was the clearest safe removal candidate:

- it had become encoding-corrupted
- it no longer carried unique contract or process guidance
- the current docs map and source-of-truth files already route readers to the generated artifacts directly

### Files Changed

- `packages/chat/scripts/check-refactor-docs.mjs`
- removed `packages/chat/docs/generated/README.md`

### Contracts Touched

- docs:
  docs-governance validation only; no package contract, runtime contract, or process status changed

### Changes Overview

- Main implementation result:
  removed the corrupted generated-artifacts index page and stopped treating it as a required docs-governance file
- Main docs result:
  kept the generated artifact files themselves (`runtime-owner-table.md`, `config-bridge-matrix.md`, `slot-catalog.md`, `page-region-contract.md`) as the direct lookup surface instead of routing through an extra README

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  none
- Why:
  the cleanup stayed limited to the safest outdated docs candidate
- Backwrite status:
  this history records the removal and the validation-script adjustment

### Known Limits

- other docs that may look "old", such as completed execution slices, histories, review packets, `CURRENT_VS_TARGET_SURFACE.md`, or `core-flow-stabilization-baseline.md`, were intentionally kept because they still act as active routing docs or historical closure records

### Follow-ups

- if we want a broader docs-pruning pass later, do it as a separate routing cleanup so active source-of-truth files and intentional historical records are not mixed together
