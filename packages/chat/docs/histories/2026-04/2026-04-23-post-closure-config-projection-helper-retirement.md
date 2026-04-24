## [2026-04-23 22:10] | Task: post-closure config projection helper retirement

### Why Now

`post-closure full cutover closure` had already closed the provider `chatKit` passthrough branch and the `HistorySurface` helper, but the old config-projection family was still keeping comparison-era exports, dedicated `tests/config/*`, and stale docs alive.

This slice removes that old `ChatConfig -> adapter -> preset slices` story so the remaining comparison-helper work can focus on `useChatKit` only.

### Files Changed

- `packages/chat/src/index.ts`
- `packages/chat/src/runtime/config/index.ts`
- deleted `packages/chat/src/runtime/config/configLoader.ts`
- deleted `packages/chat/src/runtime/config/configProjection.ts`
- deleted `packages/chat/src/runtime/config/types.ts`
- `packages/chat/tests/_helpers.mjs`
- `packages/chat/tests/runtime/message-actions.test.mjs`
- `packages/chat/tests/runtime/openai-compatible-transport.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/contracts/renderer-registry.test.mjs`
- `packages/chat/tests/contracts/chat-messages.test.mjs`
- deleted `packages/chat/tests/config/config-and-features.test.mjs`
- deleted `packages/chat/tests/config/messages.test.mjs`
- deleted `packages/chat/tests/config/preset-slices.test.mjs`
- deleted `packages/chat/tests/config/provider-factories.test.mjs`
- `packages/chat/README.md`
- `docs/src/components/chat-advanced.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-full-cutover-closure.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`

### Contracts Touched

- public exports
- runtime config surface
- package-local runtime/contracts gate
- post-closure helper-retirement process docs

### Changes Overview

- Main implementation result:
  the old config-projection helper family is gone from implementation and public exports; `createRuntimeFromConfig(config)` remains the only supported config-to-runtime bridge.
- Main test result:
  `tests/config/*` is retired; surviving transport, renderer, message-action, and shared-copy proof now lives in current runtime/contracts tests.
- Main docs result:
  README, advanced docs, the closure checklist, and the legacy-retirement process docs now all describe the config-projection family as retired instead of "still public for comparison."

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/workspace-slots.spec.ts src/chat/scenario-specs/renderer-registry.spec.ts`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/mcp-feature.spec.ts src/chat/scenario-specs/message-transforms.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  all commands passed; the second Playwright batch still needed the known elevated run path on this machine because of the `EPERM: lstat C:\\Users\\SonyLeo` environment issue.

### Drift From Plan Or Review

- What drifted:
  the slice also moved the surviving transport and shared-copy proof into new runtime/contracts files instead of only deleting exports and tests.
- Why:
  deleting `tests/config/*` without handing those last two boundaries off would have left the cleanup looking complete while quietly shrinking the retained package-local gate.
- Backwrite status:
  the active plan, checklist, tracker, inventory, roadmap, and test-boundary baseline now all record the helper retirement and its new proof locations.

### Known Limits

- `useChatKit` still remains as the last unresolved comparison-era helper family.
- the final e2e/demo/docs cleanup still has to retire any remaining `useChatKit`-centric scene branches after that helper decision lands.

### Follow-ups

- retire `useChatKit`
- retire the last comparison-heavy scene/spec branches that still depend on it
- finish the final docs/demo surface cleanup after the remaining helper decision closes
