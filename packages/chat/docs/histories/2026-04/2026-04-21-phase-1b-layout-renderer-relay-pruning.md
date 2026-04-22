## [2026-04-21 19:21] | Task: Phase 1B layout renderer relay pruning

### Why Now

After the default page path and the default workspace path were both moved onto explicit owner inputs, `ChatLayout` still had one important mixed path left.
Even when `TrChat.Page` passed explicit `bubbleRenderers`, `ChatLayout` still merged those with raw scaffold renderer buckets, so the nearest primitive was not yet treating owner inputs as authoritative.

### Files Changed

- `packages/chat/src/components/core/ChatLayout.vue`
- `packages/chat/tests/contracts/renderer-registry.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-layout-renderer-relay-pruning.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- layout renderer ownership:
  when `Page` already passes explicit `bubbleRenderers` into `ChatLayout`, those explicit renderer defaults now win and are no longer silently merged with raw scaffold renderer buckets
- compatibility fallback:
  `ChatLayout` still falls back to scaffold-derived renderer defaults when explicit renderer inputs are absent
- docs:
  this authoritative-input rule is now recorded in the tracker, design contract, page-region contract, and experience log

### Changes Overview

- Main implementation result:
  `ChatLayout` now resolves `bubbleRenderers` through a single authoritative path: explicit prop first, scaffold fallback only when that prop is absent.
  This removes the old mixed path where the default owner chain looked explicit on the surface but still merged raw scaffold renderer buckets one layer lower.
- Main test result:
  `renderer-registry.test.mjs` now asserts that `ChatLayout` keeps a single resolved renderer input and no longer concatenates scaffold renderer matches back into explicit owner input.
- Main docs result:
  Updated the completed execution slice, tracker, API/runtime contract, page-region contract, and experience log.

### Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - the original generic compatibility-relay slice was narrowed to the `ChatLayout` renderer path instead of spanning multiple primitives
- Why:
  - this was the highest-value remaining relay that still mixed explicit owner input with raw scaffold defaults
- Backwrite status:
  - completed slice, tracker, API/runtime contract, page-region contract, and experience log updated in the same task

### Known Limits

- `ChatHeader`, `ChatHistory`, `ChatWelcome`, and `ChatMessageList` still retain scaffold fallbacks for broader compatibility paths
- this slice does not attempt full primitive-level scaffold retirement

### Follow-ups

- continue with the highest-value remaining header/history compatibility relay
- keep treating explicit owner inputs as authoritative whenever a narrowing boundary already exists
