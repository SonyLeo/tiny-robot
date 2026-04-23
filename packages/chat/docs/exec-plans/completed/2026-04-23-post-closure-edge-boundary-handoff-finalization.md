# Post-Closure Edge Boundary Handoff Finalization

## Goal

Finish the remaining `edge-overrides` boundary handoff so compatibility-only edge scenes stop carrying official-path behavior and can retire cleanly.

## Scope

- In scope:
  - resolve the remaining `edge-overrides` holdouts:
    - `senderActions.wordCount = false`
    - `senderActions.voice = false`
    - explicit close composition
  - move any still-supported behavior into official-path scenes/specs
  - record explicit contract drops when a boundary is no longer supported
  - delete `edge-overrides.spec.ts` and `BlackboxEdgeScene.vue` if no unresolved boundary remains
  - remove edge-only selector/helper wiring if the edge scene retires
- Out of scope:
  - retiring `rootBridge.ts`
  - deleting provider/comparison helper surfaces
  - adapting the entire remaining `packages/test/src/chat` `adapt` group

## Frozen Inputs

- Review / phase gate:
  - post-closure cleanup is complete enough that legacy retirement now follows the roadmap
- Contract freeze:
  - official entry ladder remains `TrChat`, `TrChat.Root + TrChat.Page`, and `TrChat.Root + primitives`
  - outdated tests can disappear only after boundary handoff or explicit contract drop
- Required source docs:
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`

## Implementation Slice

- Target files:
  - `packages/test/src/chat/edge-overrides.spec.ts`
  - `packages/test/src/chat/scenarios/BlackboxEdgeScene.vue`
  - `packages/test/src/chat/sender-actions.spec.ts`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
  - `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
  - `packages/test/src/chat/index.vue`
  - `packages/test/src/chat/testHelper.ts`
  - `packages/test/src/chat/selectors.ts`
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`
- Intended ownership:
  - move the last still-valid edge boundaries into official-path proof
  - delete the edge-only scene and spec once it no longer protects anything unique
- Planned validation:
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - a remaining edge-only assertion may still be the only proof for a real granular composition boundary
- Mitigation:
  - add the successor official-path proof first, then delete the edge scene/spec in the same slice

## Exit Criteria

- [x] remaining edge-only boundaries are either handed off or explicitly dropped
- [x] `edge-overrides.spec.ts` no longer protects any undocumented boundary
- [x] targeted tests pass
- [x] docs stay aligned

## Validation

- Commands:
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - official granular sender config can suppress `wordCount` and `voice`
  - official leaf close composition can hide its shell after the close action
- Contract evidence:
  - `packages/test/src/chat/sender-actions.spec.ts`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`

## Decision Log

- 2026-04-23:
  - prefer migrating remaining valid edge behavior into official scenes over keeping a dedicated edge scene alive

## Drift Backwrite

- What changed from the original slice:
  - the slice fully retired `edge-overrides.spec.ts` and `BlackboxEdgeScene.vue` instead of leaving a reduced compatibility-only shell behind, because the final `wordCount` / `voice` disable and close-composition boundaries all gained official-path successors in the same batch.
- Which source docs need follow-up:
  - `test-boundary-baseline.md`
  - `legacy-surface-inventory.md`
  - `alignment-tracker.md`
