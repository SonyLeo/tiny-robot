## [2026-04-24 18:25] | Task: record optional post-closure follow-ups

### Why Now

The current supported package story is already closed and green, but three later tasks still need a
durable place in process docs so they do not get lost in chat history:

- formal code-coverage reporting
- optional deeper private-runtime `chat-kit` cleanup
- deferred standalone page-level `footer` publishing semantics

### Files Changed

- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  no runtime or public contract changed; this is process-only recording of later follow-up work.

### Changes Overview

- Main implementation result:
  none.
- Main docs result:
  the three follow-ups are now explicitly recorded as optional, non-active work in the tracker,
  the legacy-retirement roadmap, and the full-cutover checklist.

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  passed

### Drift From Plan Or Review

- What drifted:
  nothing.
- Why:
  this was a pure backwrite slice.
- Backwrite status:
  complete.

### Known Limits

- this record does not create a new active execution slice
- priority order is advisory and can be changed later if a stronger business need appears

### Follow-ups

- open a new scoped slice only when one of the three recorded items becomes active work
