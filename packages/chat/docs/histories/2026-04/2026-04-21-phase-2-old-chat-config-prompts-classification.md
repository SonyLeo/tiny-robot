## [2026-04-21 23:35] | Task: Phase 2 old ChatConfig prompts classification

### Why Now

After the previous Phase 2 slices admitted the narrow old `ChatConfig` request-only, display-default, and `layout.contentLayout` subsets into the blackbox `Root + Page` path, the next step was to decide whether old `ui.prompts` had any frozen target owner path or should remain explicit scaffold fallback.

### Files Changed

- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-prompts-classification.md`

### Contracts Touched

- blackbox entry classification:
  - old `ChatConfig.ui.prompts` remains explicit scaffold fallback
  - no prompt-oriented legacy subset entered the blackbox `Root + Page` path in this slice

### Changes Overview

- Main implementation result:
  - runtime and blackbox tests now explicitly prove that old `ui.prompts` continues to route through scaffold fallback
- Main docs result:
  - the Phase 2 blackbox contract now names `ui.prompts` as an explicit fallback surface instead of leaving it implied inside a broader legacy bucket
  - the next slice is narrowed to old `shell` subset classification

### Validation

- Commands:
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed
  - runtime suite still prints the pre-existing `localStorage is not defined` warnings from `packages/kit/dist` persistence fallback, but the suite completed successfully

### Drift From Plan Or Review

- What drifted:
  - the slice ended with an explicit fallback decision instead of promoting a narrower prompt-oriented subset
- Why:
  - `ui.prompts` currently lands only in old preset / welcome-prompts projection, not in any already-frozen target owner domain
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig.ui.prompts` is still scaffold-only behavior
- old `ChatConfig.layout.variant / placements` still remain scaffold fallback
- old `ChatConfig.shell`, `features`, and `integrations` still remain scaffold fallback

### Follow-ups

- classify whether any narrow old `shell` subset can safely promote next
- keep prompt-oriented preset semantics out of the blackbox entry path until a real target owner route exists
