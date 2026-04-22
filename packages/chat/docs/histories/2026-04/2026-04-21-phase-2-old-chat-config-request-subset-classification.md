## [2026-04-21 22:10] | Task: Phase 2 old ChatConfig request subset classification

### Why Now

After the previous Phase 2 slices admitted lifecycle-compatible callbacks and serialized target config into the blackbox `Root + Page` path, the next safest classification was the smallest old `ChatConfig` shape that still stayed inside the request owner domain.

### Files Changed

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/tests/_stubs/chat-scaffold.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-old-chat-config-request-subset-classification.md`

### Contracts Touched

- blackbox entry classification:
  - the narrow old `ChatConfig` request-only subset now enters through `Root + Page`
  - the admitted subset is limited to `models / providers / defaults` with a single provider map
  - broader old `ChatConfig` shapes stay explicit scaffold fallback

### Changes Overview

- Main implementation result:
  - the blackbox entry helper now classifies a narrow legacy request subset and normalizes it into target `TrChatConfig.request`
  - object and serialized forms of that request-only subset now have runtime and blackbox proof
- Main docs result:
  - the Phase 2 blackbox contract now names the admitted legacy request-only subset and the remaining broader fallback surface
  - the next slice is narrowed to old display-default subset classification instead of broad legacy parity

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
  - the slice promoted the request-only legacy subset directly, instead of first classifying a broader old `ChatConfig` shape
- Why:
  - it stayed inside one target owner domain and avoided reopening preset projection or multi-provider adapter semantics
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig` display-default fields like `ui`, `appearance`, `layout`, and `shell` still remain scaffold fallback
- old multi-provider `ChatConfig` shapes still remain scaffold fallback because target `request.transport` is singular

### Follow-ups

- classify whether any narrow old `ChatConfig` display-default subset can safely promote next
- keep broader old `ChatConfig` parity work out of the blackbox entry path until each subset is explicitly evidenced
