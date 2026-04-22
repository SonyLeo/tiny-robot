## [2026-04-21 22:45] | Task: Phase 2 old ChatConfig display-default classification

### Why Now

After the previous Phase 2 slice admitted the narrow old `ChatConfig` request-only subset into the blackbox `Root + Page` path, the next safest step was to classify whether a similarly narrow set of display defaults could also promote without reopening preset or layout projection.

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
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-display-default-classification.md`

### Contracts Touched

- blackbox entry classification:
  - the narrow old `ChatConfig` display-default subset now enters through `Root + Page`
  - the admitted subset is limited to `appearance` plus `ui.brand / ui.welcome` on top of the already-promoted request-only subset
  - `ui.prompts`, `layout`, `shell`, `features`, and `integrations` remain explicit scaffold fallback

### Changes Overview

- Main implementation result:
  - the blackbox entry helper now classifies a narrow legacy display-default subset and normalizes it into target `config.ui`
  - object and serialized forms of that display-default subset now have runtime and blackbox proof
- Main docs result:
  - the Phase 2 blackbox contract now names the admitted display-default subset and the remaining broader fallback surface
  - the next slice is narrowed to old `layout.contentLayout` classification instead of broad legacy layout parity

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
  - the slice promoted only `appearance` plus `ui.brand / ui.welcome`, instead of trying to carry other old display defaults along
- Why:
  - those fields collapse one-to-one into target `ui`, while `ui.prompts`, `layout`, and `shell` would have reopened preset and page relay semantics
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig.ui.prompts` still remains scaffold fallback
- old `ChatConfig.layout`, `shell`, `features`, and `integrations` still remain scaffold fallback
- old multi-provider `ChatConfig` shapes still remain scaffold fallback because target `request.transport` is singular

### Follow-ups

- classify whether old `layout.contentLayout` can safely promote next
- keep broader legacy layout and prompt semantics out of the blackbox entry path until each subset is explicitly evidenced
