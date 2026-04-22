## [2026-04-21 23:55] | Task: Phase 2 old ChatConfig layout variant and placements classification

### Why Now

After the previous Phase 2 slices admitted the narrow old `ChatConfig` request-only, display-default, `layout.contentLayout`, and shell-owner subsets into the blackbox `Root + Page` path, the next safest step was to decide whether `layout.variant / placements` also collapse directly into a frozen target blackbox owner.

### Files Changed

- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-layout-variant-placements-classification.md`

### Contracts Touched

- blackbox entry classification:
  - old `ChatConfig.layout.variant / placements` remain explicit scaffold fallback
  - no part of `layout.variant / placements` currently enters through `Root + Page`

### Changes Overview

- Main implementation result:
  - runtime and integration proof now explicitly show that `layout.variant / placements` stay on the scaffold fallback path
  - the blackbox target path stays limited to admitted owner-aligned legacy subsets only
- Main docs result:
  - the Phase 2 blackbox contract now names `layout.variant / placements` as explicit fallback instead of leaving them as an unresolved broad legacy shape
  - the recurring lesson about “no frozen target owner means explicit fallback” has been promoted into the playbook

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed
  - runtime suite still prints the pre-existing `localStorage is not defined` warnings from `packages/kit/dist` persistence fallback, but the suite completed successfully

### Drift From Plan Or Review

- What drifted:
  - the slice recorded an explicit fallback decision instead of promoting any part of `layout.variant / placements`
- Why:
  - those fields still belong to old message-list and role-placement projection; they do not collapse one-to-one into any already-frozen target blackbox owner domain
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig.ui.prompts` still remains scaffold fallback
- old `ChatConfig.shell.viewState`, `features`, and `integrations` still remain scaffold fallback
- no target blackbox API has been added for legacy role-placement semantics

### Follow-ups

- classify whether any old `ChatConfig.shell.viewState` subset can safely promote next or should stay explicit fallback
- keep broad legacy layout projection out of the blackbox entry path until a real target owner exists
