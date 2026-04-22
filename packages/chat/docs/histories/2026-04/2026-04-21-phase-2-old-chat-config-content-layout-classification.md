## [2026-04-21 23:10] | Task: Phase 2 old ChatConfig content-layout classification

### Why Now

After the previous Phase 2 slices admitted the narrow old `ChatConfig` request-only and display-default subsets into the blackbox `Root + Page` path, the next safest step was to classify whether `layout.contentLayout` could also promote without reopening broader layout projection.

### Files Changed

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-content-layout-classification.md`

### Contracts Touched

- blackbox entry classification:
  - old `ChatConfig.layout.contentLayout` now enters through `Root + Page`
  - the admitted subset is limited to `layout.contentLayout` on top of the already-promoted request-only and display-default subsets
  - `layout.variant` and `layout.placements` remain explicit scaffold fallback

### Changes Overview

- Main implementation result:
  - the blackbox entry helper now classifies the narrow legacy content-layout subset and normalizes it into target `config.ui.contentLayout`
  - object and serialized forms of that content-layout subset now have runtime and blackbox proof
- Main docs result:
  - the Phase 2 blackbox contract now names the admitted content-layout subset and the remaining broader layout fallback surface
  - the next slice is narrowed to `ui.prompts` classification instead of broad old layout parity

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
  - the slice promoted only `layout.contentLayout`, instead of carrying broader old layout defaults into the blackbox path
- Why:
  - `contentLayout` collapses one-to-one into target `ui.contentLayout`, while `variant` and `placements` would reopen broader layout projection and role-placement relay
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig.ui.prompts` still remains scaffold fallback
- old `ChatConfig.layout.variant / placements` still remain scaffold fallback
- old `ChatConfig.shell`, `features`, and `integrations` still remain scaffold fallback

### Follow-ups

- classify whether old `ChatConfig.ui.prompts` can safely promote next or should stay explicit fallback
- keep broader legacy layout semantics out of the blackbox entry path until each subset is explicitly evidenced
