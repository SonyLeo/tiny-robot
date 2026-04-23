# Post-Closure Root Bridge Retirement

## Goal

Retire `src/legacy/rootBridge.ts` by moving the remaining official-path bootstrap wiring into a non-legacy root helper.

## Scope

- In scope:
  - replace `createLegacyRootBridge(...)` with a root-local bootstrap helper under `src/root/`
  - delete `src/legacy/rootBridge.ts`
  - keep `TrChat.Root`, `Root + Page`, and `Root + primitives` behavior green
  - update tests and docs so the retired bridge is no longer described as active cleanup debt
- Out of scope:
  - deleting provider/comparison helper surfaces
  - deleting package-local secondary legacy sentinels
  - broad e2e adaptation outside the retained official gate

## Frozen Inputs

- Review / phase gate:
  - post-closure cleanup is now following `legacy-retirement-roadmap.md`
- Contract freeze:
  - official entry ladder stays `TrChat`, `TrChat.Root + TrChat.Page`, and `TrChat.Root + primitives`
  - fallback `chatKit` behavior may survive as a helper shape, but not inside `src/legacy/*`
- Required source docs:
  - `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/root/TrChatRoot.vue`
  - `packages/chat/src/root/createRootBootstrapState.ts`
  - `packages/chat/src/legacy/rootBridge.ts`
  - `packages/chat/tests/runtime/root-runtime.test.mjs`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
  - `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`
- Intended ownership:
  - preserve the active bootstrap behavior while removing the last file under `src/legacy/`
  - avoid pushing deleted-bridge logic back into `TrChatRoot.vue` itself
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - deleting the legacy file but preserving the same helper shape may hide unresolved helper/public-surface debt
- Mitigation:
  - keep this slice scoped to retiring the legacy file only, then let the roadmap continue with helper/public-surface decisions separately

## Exit Criteria

- [x] `src/legacy/rootBridge.ts` is deleted
- [x] root bootstrap behavior still passes the hard gate
- [x] retained entry-path e2e still passes
- [x] docs stay aligned

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - `TrChat.Root` still provides page inputs, attachments, history, model, and welcome/message state through the official ladder
- Contract evidence:
  - `packages/chat/tests/runtime/root-runtime.test.mjs`
  - `packages/chat/tests/integration/root-page-mounted.test.mjs`

## Decision Log

- 2026-04-23:
  - move surviving bootstrap logic into `src/root/` instead of keeping it in `src/legacy/`

## Drift Backwrite

- What changed from the original slice:
  - the surviving bootstrap behavior moved into `src/root/createRootBootstrapState.ts`, and the slice also backwrote the active process/design docs that still named `src/legacy/rootBridge.ts` as a live boundary.
- Which source docs need follow-up:
  - `legacy-retirement-roadmap.md` now points to provider/helper decision as the next slice
  - `legacy-surface-inventory.md` now classifies the bridge as already pruned
  - `alignment-tracker.md` now treats helper/test retirement as the remaining cleanup theme
