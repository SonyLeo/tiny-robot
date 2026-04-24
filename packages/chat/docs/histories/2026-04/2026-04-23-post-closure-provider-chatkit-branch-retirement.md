## [2026-04-23 18:25] | Task: post-closure provider chatKit branch retirement

### Why Now

The main refactor and the first post-closure cleanup batches are already closed.
The next full-cutover closure bar was to stop treating `TrChat.Provider` as a mixed old/new surface and retire the public `chatKit` passthrough branch before deleting the remaining comparison helpers.

### Files Changed

- `packages/chat/src/root/RootBootstrapProvider.vue`
- `packages/chat/src/root/TrChatRoot.vue`
- `packages/chat/src/runtime/provider/resolveProviderChatKit.ts`
- `packages/chat/src/shared/utils/typeGuards.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/tests/runtime/provider-response-provider.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/test/src/chat/scenario-specs/sender-extensions.spec.ts`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
- `packages/test/src/chat/scenarios/SenderExtensionsScene.vue`
- `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- `packages/chat/README.md`
- `docs/src/components/chat-advanced.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-full-cutover-closure.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/test/src/chat/README.md`

### Contracts Touched

- provider / root / docs / tests:

### Changes Overview

- Main implementation result:
  public `TrChat.Provider` now accepts only the `responseProvider` path; the public injected-`chatKit` branch is gone, while `TrChat.Root` keeps its fallback chat-kit wiring private through `RootBootstrapProvider.vue`.
- Main docs result:
  the provider helper decision, full-cutover closure checklist, test boundary baseline, README, and advanced docs now all describe `TrChat.Provider` as a bounded advanced `responseProvider` surface instead of a mixed old/new helper.

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/surface-api.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  all commands passed; the retained Playwright batch still requires the known elevated run path on this machine because of the `EPERM: lstat C:\\Users\\SonyLeo` environment issue.

### Drift From Plan Or Review

- What drifted:
  `TrChatHistorySurface` was not deleted in the same slice.
- Why:
  the current official granular left-slot story still uses it in retained scenes, demo routes, and mounted owner-path proof, so deleting it now would have reopened an unresolved public boundary instead of closing one.
- Backwrite status:
  the active full-cutover plan, decision baseline, checklist, and tracker now all record that `HistorySurface` remains the open item inside Part 1.

### Known Limits

- `useChatKit`, `TrChatHistorySurface`, and config projection helpers still exist and still keep the final helper-retirement work open.

### Follow-ups

- Decide and then retire or replace `TrChatHistorySurface`.
- Start the comparison-helper retirement batch for `useChatKit` and config projection helpers after the `HistorySurface` decision lands.
