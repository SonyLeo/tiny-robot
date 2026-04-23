## [2026-04-24 00:20] | Task: post-closure edge boundary handoff finalization

### Why Now

The roadmap's first open cleanup stage was still blocked on the last three `edge-overrides` holdouts: sender `wordCount = false`, sender `voice = false`, and explicit close composition. This task moved those boundaries onto official-path proof and then retired the old edge scene/spec pair.

### Files Changed

- `packages/test/src/chat/sender-actions.spec.ts`
- `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
- `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
- `packages/test/src/chat/index.vue`
- `packages/test/src/chat/testHelper.ts`
- `packages/test/src/chat/selectors.ts`
- `packages/test/src/chat/README.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/completed/2026-04-23-post-closure-edge-boundary-handoff-finalization.md`
- deleted:
  - `packages/test/src/chat/edge-overrides.spec.ts`
  - `packages/test/src/chat/scenarios/BlackboxEdgeScene.vue`

### Contracts Touched

- tests / docs / process:
  - official granular sender config now carries the `wordCount = false` and `voice = false` proof
  - official leaf composition now carries the close-action shell-removal proof
  - the old edge scene/spec no longer exists as a primary or retired gate surface

### Changes Overview

- Main implementation result:
  - `sender-actions.spec.ts` now proves official granular sender disable semantics on a dedicated official `Root + primitives` scene.
  - `surface-api.spec.ts` now proves official leaf close composition on a dedicated granular close scene.
  - `SurfaceApiScene.vue` gained those two official-path scenes.
  - `edge-overrides.spec.ts`, `BlackboxEdgeScene.vue`, and their helper wiring were removed.
- Main docs result:
  - the test boundary baseline now records the final sender/close handoff and removes `edge-overrides` from the closure batch
  - the inventory and tracker now treat the first roadmap slice as landed
  - the roadmap now starts from `rootBridge` retirement instead of edge-boundary handoff

### Validation

- Commands:
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - instead of keeping a reduced compatibility-only edge shell after handoff, the slice retired the entire edge scene/spec pair immediately.
- Why:
  - once every remaining edge boundary had either an official successor or an explicit drop, leaving the shell behind would only preserve dead cleanup surface.
- Backwrite status:
  - reflected in the completed plan, tracker, inventory, roadmap, and test-boundary baseline

### Known Limits

- the next cleanup frontier is still `rootBridge` retirement, followed by helper-surface and mixed e2e adaptation work
- this slice does not yet delete provider/comparison helper surfaces or package-local legacy sentinels

### Follow-ups

- if cleanup continues, start from `post-closure-root-bridge-retirement`
- keep deleting tests only after the same kind of handoff or explicit contract drop used here
