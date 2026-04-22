## [2026-04-21 15:20] | Task: Phase 2 serialized target config classification

### Why Now

After the previous Phase 2 slice admitted lifecycle-compatible callbacks into the `Root + Page` blackbox path, the next safest entry-shape classification was the serialized form of the same target `TrChatConfig`.

### Files Changed

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-2-legacy-config-shape-classification.md`

### Contracts Touched

- blackbox entry classification:
  - target `TrChatConfig` now enters through `Root + Page` both as an object and as its serialized JSON form
  - serialized old `ChatConfig` remains explicit scaffold fallback

### Changes Overview

- Main implementation result:
  - the blackbox entry helper now parses serialized config input once and promotes it only when it still matches target `TrChatConfig`
  - the serialized target path now has runtime, contract, and integration proof
- Main docs result:
  - the Phase 2 entry contract now explicitly names serialized target config as a supported outer shell
  - the next slice has been narrowed to old `ChatConfig` request-subset classification instead of broad fallback pruning

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- Result:
  - all passed
  - runtime suite still prints the pre-existing `localStorage is not defined` warnings from `packages/kit/dist` persistence fallback, but the suite completed successfully

### Drift From Plan Or Review

- What drifted:
  - the slice chose serialized target config as the next promoted shape instead of touching old `ChatConfig`
- Why:
  - it widened the supported blackbox surface without reopening legacy config projection or Phase 1B owner-path contracts
- Backwrite status:
  - completed in design docs, tracker, history, and the completed execution slice

### Known Limits

- old `ChatConfig` object and string forms still fall back to `ChatScaffold`
- no old `features.*` or `integrations.*` subset entered the `Root + Page` path in this slice

### Follow-ups

- classify whether any narrow request-oriented old `ChatConfig` subset can safely promote next
- keep serialization support limited to target `TrChatConfig` rather than treating all string input as blackbox-ready
