## [2026-04-21 18:45] | Task: Phase 1B mounted Root + Page integration proof

### Why Now

The page/history/models/workspace baseline slice had already landed, but Phase 1B still lacked a direct mounted proof that `TrChat.Root + TrChat.Page` could consume that baseline end to end.
Without that proof, page ownership and workspace/history consumption were still protected mostly by source contracts and runtime-only tests.

### Files Changed

- `packages/chat/tests/_helpers.mjs`
- `packages/chat/tests/_stubs/tiny-robot.mjs`
- `packages/chat/tests/_stubs/markstream-vue.mjs`
- `packages/chat/tests/_stubs/empty-module.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/package.json`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-mounted-root-page-integration.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- root / page:
  direct mounted proof now exists for `TrChat.Root + TrChat.Page`
- validation:
  `packages/chat/tests/integration/*` is now the dedicated home for mounted page-shell proofs
- docs:
  Phase 1B execution and tracker state now record mounted integration coverage as landed evidence

### Changes Overview

- Main implementation result:
  Added a dedicated integration test that loads `TrChatRoot.vue` and `TrChatPage.vue` through Vite SSR, renders them together, and proves the Phase 1B workspace baseline is consumed by the real page shell.
  The proof stays narrowly scoped by aliasing `@opentiny/tiny-robot` and `markstream-vue` to test-only stubs, so the test verifies chat package page ownership instead of getting blocked by unrelated upstream component-package SSR issues.
- Main docs result:
  Recorded the mounted proof as completed Phase 1B evidence, updated execution/tracker status, and added the new evidence to the recurring-experience log.

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
  - the mounted proof uses narrow test stubs for `@opentiny/tiny-robot` and `markstream-vue` instead of the full upstream component implementation
- Why:
  - direct SSR loading of the real upstream component package currently fails on unrelated module-resolution issues, and the Phase 1B goal here is to prove chat-owned page composition plus runtime consumption
- Backwrite status:
  - tracker, execution notes, completed execution slice, and recurring-experience log updated in the same task

### Known Limits

- the mounted proof is SSR-backed, not a browser DOM mount
- upstream component-package SSR issues are not solved by this slice; they are intentionally isolated away from the page-shell proof
- scaffold-only assumptions inside the current default page path still need further tightening in later Phase 1B work

### Follow-ups

- start the next Phase 1B slice to shrink scaffold relay assumptions in the default page path
- decide whether upstream `@opentiny/tiny-robot` SSR issues need their own isolated follow-up or should remain outside the chat package refactor scope
