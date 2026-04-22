## [2026-04-21 23:40] | Task: Phase 2 old ChatConfig shell subset classification

### Why Now

After the previous Phase 2 slices admitted the narrow old `ChatConfig` request-only, display-default, and `layout.contentLayout` subsets into the blackbox `Root + Page` path, the next safest step was to classify whether any `shell` fields also collapse directly into the target workspace owner domain.

### Files Changed

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-shell-subset-classification.md`

### Contracts Touched

- blackbox entry classification:
  - old `ChatConfig.shell.variant / shell.leftRegion / shell.rightRegion` now enter through `Root + Page`
  - the admitted subset is limited to owner-aligned shell fields on top of the already-promoted request-only, display-default, and `layout.contentLayout` subsets
  - `shell.viewState` remains explicit scaffold fallback

### Changes Overview

- Main implementation result:
  - the blackbox entry helper now classifies the narrow legacy shell-owner subset and normalizes it into target `config.workspace.defaultView / left / right`
  - object and serialized forms of that shell subset now have runtime and blackbox proof
- Main docs result:
  - the Phase 2 blackbox contract now names the admitted shell-owner subset and the remaining `shell.viewState` fallback surface
  - the next slice is narrowed to `layout.variant / placements` classification instead of broad old shell parity

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
  - the slice promoted only `shell.variant / shell.leftRegion / shell.rightRegion`, instead of trying to carry broader legacy shell semantics
- Why:
  - those fields collapse one-to-one into target `workspace.defaultView / left / right`, while `shell.viewState` still has no frozen target owner path
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig.ui.prompts` still remains scaffold fallback
- old `ChatConfig.layout.variant / placements` still remain scaffold fallback
- old `ChatConfig.shell.viewState`, `features`, and `integrations` still remain scaffold fallback

### Follow-ups

- classify whether any old `ChatConfig.layout.variant / placements` subset can safely promote next or should stay explicit fallback
- keep broader legacy shell semantics out of the blackbox entry path until each subset is explicitly evidenced
