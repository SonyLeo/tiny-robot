## [2026-04-21 23:59] | Task: Phase 2 old ChatConfig shell view-state classification

### Why Now

After the previous Phase 2 slices admitted the narrow old `ChatConfig` request-only, display-default, `layout.contentLayout`, and shell-owner subsets into the blackbox `Root + Page` path, the next safest step was to decide whether `shell.viewState` also collapses directly into a frozen target workspace owner.

### Files Changed

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-shell-view-state-classification.md`

### Contracts Touched

- blackbox entry classification:
  - old `ChatConfig.shell.viewState` remains explicit scaffold fallback
  - no part of `shell.viewState` currently enters through `Root + Page`

### Changes Overview

- Main implementation result:
  - blackbox entry now names `shell.viewState` as an explicit fallback decision instead of leaving it implicit inside the generic unsupported-shape path
  - runtime, source-contract, and blackbox integration proof all now show `shell.viewState` staying on `ChatScaffold` fallback
- Main docs result:
  - the Phase 2 blackbox contract now names `shell.viewState` as explicit scaffold fallback alongside `ui.prompts` and `layout.variant / placements`
  - the recurring lesson about “no frozen target owner means explicit fallback” has been extended with the shell view-state case

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
  - the slice recorded an explicit fallback decision instead of promoting any part of `shell.viewState`
- Why:
  - `shell.viewState` still belongs to old shell display-state semantics and does not collapse one-to-one into any already-frozen target workspace owner
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- broader legacy `features` and `integrations` shapes still remain scaffold fallback
- the internal `legacy/` bridge and `ChatScaffold` fallback path still exist until later parity and hardening stages
- Phase 3 and Phase 4 remain the next closure work after this Phase 2 boundary decision

### Follow-ups

- start `Phase 3A` message and sender parity
- prepare Review D around the now-closed Phase 2 blackbox entry matrix
- keep broad legacy fallback bounded instead of reopening it during parity work
