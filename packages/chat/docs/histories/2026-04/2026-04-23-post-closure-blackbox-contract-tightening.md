## [2026-04-23 15:20] | Task: post-closure blackbox contract tightening

### Why Now

Post-closure cleanup had already frozen the official test boundary and promoted the first official-path Playwright gate.
The next highest-value delete-now slice was the blackbox entry itself: `TrChat` no longer needs to promote narrow old-`ChatConfig` subsets in this development branch, so the blackbox contract could be tightened to the official target-config ladder before deeper bridge pruning starts.

### Files Changed

- `packages/chat/src/runtime/config/blackboxEntry.ts`
- `packages/chat/tests/runtime/blackbox-entry.test.mjs`
- `packages/chat/tests/integration/trchat-blackbox-root-page.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-post-closure-legacy-pruning.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- blackbox / config / docs:
  `TrChat` blackbox now accepts only target `TrChatConfig` (object or serialized target config) plus lifecycle-compatible callbacks on the `Root + Page` path; old `ChatConfig` shapes are no longer a promoted development-branch entry contract.

### Changes Overview

- Main implementation result:
  `resolveRootPageBlackboxConfig(...)` no longer normalizes old `ChatConfig` request/display/layout/shell subsets into `Root + Page`. It now only:
  - accepts target `TrChatConfig`
  - accepts serialized target `TrChatConfig`
  - composes `onFinish / onError` into `config.lifecycle.afterReceive / error`
  - returns `null` for old `ChatConfig`, scaffold-only callbacks, runtime input, and preset overrides so `TrChat` falls back to `ChatScaffold`
- Main docs result:
  active contract docs, tracker, and cleanup-plan notes now describe the tightened blackbox contract instead of the earlier Phase 2 promoted legacy subsets.

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/request-lifecycle.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  all passed; the Playwright gate required an escalated rerun because the sandboxed run hit the existing local `EPERM: lstat C:\\Users\\SonyLeo` environment issue instead of a test failure.

### Drift From Plan Or Review

- What drifted:
  post-closure cleanup originally assumed the next delete-now batch might stay on `edge-overrides`-style scene pruning or move inward to `src/legacy` first.
- Why:
  after inventorying `Chat.vue`, `blackboxEntry`, and the frozen official gate, the cleanest delete-now seam turned out to be the blackbox contract itself: official blackbox scenes already use target `TrChatConfig`, so keeping old `ChatConfig` promoted subsets alive was pure compatibility debt.
- Backwrite status:
  the contract and process docs have been updated in the same slice.

### Known Limits

- `ChatScaffold` fallback still exists for old config shapes, scaffold-only callbacks, runtime input, and preset overrides.
- deeper bridge cleanup under `packages/chat/src/legacy` has not started yet.

### Follow-ups

- inventory `Chat.vue`, `blackboxEntry`, and `packages/chat/src/legacy/*` together as the next delete-now / keep-temporarily batch
- decide how much of the remaining blackbox fallback surface can be deleted before touching the bridge layer
