## [2026-04-23 23:55] | Task: post-closure bridge de-scaffolding

### Why Now

The previous cleanup slices had already removed official-path scaffold consumers and the explicit scaffold helper surface, but the bootstrap path still carried dead internal scaffold provision and a separate runtime-hints channel. This task removed that baggage before attempting any full bridge retirement.

### Files Changed

- `packages/chat/src/shared/context/index.ts`
- `packages/chat/src/internal.ts`
- `packages/chat/src/root/TrChatRoot.vue`
- `packages/chat/src/legacy/rootBridge.ts`
- `packages/chat/src/legacy/runtimeHints.ts`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/exec-plans/completed/2026-04-23-post-closure-bridge-descaffolding.md`

### Contracts Touched

- runtime / root / page / docs:
  - internal scaffold provision is no longer part of the bootstrap path
  - runtime objects no longer carry `__legacyPhase1ABridge`
  - `rootBridge` now derives its remaining output directly from runtime-owned state

### Changes Overview

- Main implementation result:
  - `TrChatRoot` no longer provides an internal scaffold context key.
  - `rootBridge` no longer builds or returns `scaffoldContext`.
  - `createRuntimeFromConfig` no longer attaches legacy bridge hints to runtime objects.
  - attachment helpers, page inputs, shell config, and fallback `chatKit` are now derived directly from runtime state inside `rootBridge`.
- Main docs result:
  - the legacy inventory now records scaffold provision and runtime hints as already pruned
  - the tracker now treats `rootBridge` itself as the remaining bridge question
  - the test-boundary baseline now explicitly treats absence-of-scaffold/absence-of-hints proof as part of the hard gate

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - the slice also tightened `rootBridge` to stop carrying dead scaffold-era model update wiring and to use runtime-derived page inputs directly.
- Why:
  - once scaffold provision and runtime hints were removed, keeping extra scaffold-shaped branches in the bridge would only preserve dead compatibility shape instead of active official-path behavior.
- Backwrite status:
  - reflected in the completed plan, tracker, inventory, and test-boundary baseline

### Known Limits

- `src/legacy/rootBridge.ts` still remains because the official `Root + Page / Root + primitives` ladder still consumes its page-input assembly, fallback `chatKit`, and provider-facing props.
- provider/comparison helper surfaces and the reduced compatibility-only edge proofs remain later cleanup themes.

### Follow-ups

- if cleanup continues, start from retiring `rootBridge` itself rather than reopening scaffold provision or runtime hints
- keep provider/comparison helper surfaces and the reduced compatibility-only edge proofs as their own later cleanup theme
