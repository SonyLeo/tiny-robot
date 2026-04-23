## [2026-04-23 15:10] | Task: post-closure test boundary baseline

### Why Now

Post-closure cleanup is about to start deleting legacy-path code.
Before that happens, the repository needs one frozen official-path test boundary so every pruning slice reuses the same gate instead of renegotiating test scope.

### Files Changed

- `packages/chat/AGENTS.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-post-closure-legacy-pruning.md`
- `packages/chat/docs/histories/2026-04/2026-04-23-post-closure-test-boundary-baseline.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/scripts/check-refactor-docs.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/test/src/chat/README.md`

### Contracts Touched

- docs / tests / cleanup process:
  froze the post-closure official-path test boundary, keep/adapt/retire rules, and mounted `Root + primitives` proof

### Changes Overview

- Main implementation result:
  added a more detailed mounted `TrChat.Root + primitives` proof so the official third entry path now has both welcome-state and message-state integration coverage.
- Main docs result:
  added `test-boundary-baseline.md`, updated chat doc routing, updated the cleanup plan, and rewrote the chat e2e README around official-path keep/adapt/retire classification.

### Validation

- Commands:
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - the first post-closure cleanup slice started with test-boundary freezing instead of immediate code deletion
- Why:
  - the user explicitly wanted unit and e2e boundaries sorted first so later legacy deletion can reuse one stable gate
- Backwrite status:
  - active plan, tracker, and process docs updated

### Known Limits

- `packages/test/src/chat` is still mostly an adaptation backlog rather than a fully official-path hard gate
- no compatibility-only Playwright scene was deleted in this slice

### Follow-ups

- adapt retained Playwright scenarios toward the official entry ladder
- use the frozen boundary as the gate for the first real legacy-pruning batch
