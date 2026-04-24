## [2026-04-24 14:05] | Task: normalize smoke demo-entry boilerplate

### Why Now

`N-001` was the last queued normalization item in `test-gap-backlog.md`. The retained smoke suite was already green, but several smoke specs still repeated the same demo-entry and mode-switch setup before they could reach `TrChat`, `Root + Page`, or `Root + primitives`.

### Files Changed

- `packages/test/src/chat/scenario-specs/openChatSmokeScene.ts`
- `packages/test/src/chat/scenario-specs/index.spec.ts`
- `packages/test/src/chat/scenario-specs/history.spec.ts`
- `packages/test/src/chat/scenario-specs/request-lifecycle.spec.ts`
- `packages/test/src/chat/scenario-specs/attachments.spec.ts`
- `packages/test/src/chat/scenario-specs/feedback.spec.ts`
- `packages/test/src/chat/scenario-specs/model-switch.spec.ts`
- `packages/test/src/chat/README.md`
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/test-gap-backlog.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-test-expansion-and-suite-normalization.md`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  no runtime contract changed; this is smoke-suite support normalization only.

### Changes Overview

- Main implementation result:
  added `scenario-specs/openChatSmokeScene.ts` and rewired the retained smoke specs to share one helper for entering the chat app and switching into the requested official path.
  The helper now supports both the default `demo-nav` path and the narrower `component-test` path used by attachments/feedback smoke coverage.
- Main docs result:
  closed `N-001` and updated the suite README plus audit/backlog docs so the shared smoke helper is part of the current retained support surface.

### Validation

- Commands:
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  smoke full passed; docs check passed.

### Drift From Plan Or Review

- What drifted:
  none.
- Why:
  the helper only absorbs repeated page-open and mode-switch setup; it does not change any smoke assertion or route ownership.
- Backwrite status:
  complete.

### Known Limits

- this slice does not change scenario-spec support structure beyond the smoke suite.

### Follow-ups

- pick the next normalization or retirement slice from the current audit instead of the old backlog queue
