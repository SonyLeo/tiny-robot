## [2026-04-23 21:35] | Task: post-closure history surface retirement

### Why Now

The active full-cutover closure plan still had one open provider-helper item: `TrChatHistorySurface`.
That helper depended on `chatKit`, but the last user-facing boundary it carried could now be handed off to the official `WorkspaceLayout` default-left owner path.

### Files Changed

- `packages/chat/src/index.ts`
- `packages/chat/src/types/ui.ts`
- deleted:
  - `packages/chat/src/components/history/ChatHistorySurface.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
- `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- `packages/test/src/chat/scenarios/GranularScene.vue`
- `packages/chat/demo/src/components/GranularWorkspaceDemo.vue`
- `packages/test/src/chat/README.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-full-cutover-closure.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`

### Contracts Touched

- provider helpers / official granular path / retained e2e:
  - `TrChatHistorySurface` is no longer a public compound or named export
  - the surviving history proof now lives on `WorkspaceLayout` default-left owner behavior
  - the active full-cutover plan now treats Part 1 as closed

### Changes Overview

- Main implementation result:
  the package no longer exports `TrChat.HistorySurface`, `TrChatHistorySurface`, or `TrChatHistorySurfaceProps`. The official granular/demo/e2e history branch now composes `TrChat.WorkspaceLayout` directly and lets the default left owner path render history UI.
- Main docs result:
  the provider-helper decision baseline, full-cutover checklist, tracker, roadmap, inventory, and test-boundary baseline all now record that `HistorySurface` is retired and that the next remaining helper work is comparison-helper retirement.

### Validation

- Commands:
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  all listed commands passed. A broader `type-check` and retained Playwright batch (`index.spec.ts` + `history.spec.ts`) still hit the already-known `tiny-robot-svgs` export/dist drift on this machine, so they were treated as pre-existing environment/package noise rather than a blocker for the `HistorySurface` handoff itself.

### Drift From Plan Or Review

- What drifted:
  no contract drift; the slice landed exactly where the active plan said Part 1 should end.
- Why:
  once the history proof had an owner-aligned successor, keeping `TrChatHistorySurface` public would only preserve an old helper mental model.
- Backwrite status:
  the active plan, checklist, roadmap, inventory, tracker, and this history entry all reflect the retirement.

### Known Limits

- `useChatKit` and the config-projection helpers still remain for the next comparison-helper retirement batch.
- mixed `adapt` e2e scenes still need a later keep/promote/retire pass after those helper families are removed.

### Follow-ups

- Start the comparison-helper retirement batch for `useChatKit` and config-projection helpers.
- Keep retiring tests and scenes only after the same kind of boundary handoff used here.
