## [2026-04-24 10:15] | Task: close granular smoke coverage gaps

### Why Now

`test-gap-backlog.md` still had `G-002` and `G-003` open after stabilization. The retained smoke suite covered `TrChat` and `Root + Page`, but the official `Root + primitives` path still lacked browser-level request lifecycle, feedback, and attachments proof.

### Files Changed

- `packages/test/src/chat/attachments.spec.ts`
- `packages/test/src/chat/feedback.spec.ts`
- `packages/test/src/chat/request-lifecycle.spec.ts`
- `packages/test/src/chat/scenarios/GranularScene.vue`
- `packages/test/src/chat/README.md`
- `packages/chat/docs/refactor/process/test-gap-backlog.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-test-expansion-and-suite-normalization.md`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  retained smoke coverage for the official `Root + primitives` path, plus the explicit feedback after-slot handoff in the granular leaf-composition scene.

### Changes Overview

- Main implementation result:
  added retained granular smoke proof for attachments, assistant feedback, abort/optimistic/retry request lifecycle, and mounted `TrChatFeedback` explicitly in `GranularScene.vue` so the browser proof matches the supported leaf-composition contract.
- Main docs result:
  closed `G-002` and `G-003`, updated the retained gate inventory, and advanced the active test-expansion slice to `G-004`.

### Validation

- Commands:
  - `pnpm.cmd -F tiny-robot-test build`
  - `pnpm.cmd -F @opentiny/tiny-robot-chat build`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/attachments.spec.ts src/chat/feedback.spec.ts src/chat/request-lifecycle.spec.ts --workers=4`
- Result:
  targeted retained smoke passed (`21 passed`).

### Drift From Plan Or Review

- What drifted:
  the first granular feedback attempt failed because `GranularScene.vue` did not mount the feedback after-slot that the default body region uses.
- Why:
  `TrChat.MessageList` alone does not render `ChatFeedback`; leaf composition has to wire that slot explicitly.
- Backwrite status:
  reflected in the active backlog and retained gate docs.

### Known Limits

- `G-004` is still open for the retained advanced `TrChat.Provider(responseProvider)` mounted proof.

### Follow-ups

- land `G-004`
- then continue `N-001` smoke-suite support normalization
