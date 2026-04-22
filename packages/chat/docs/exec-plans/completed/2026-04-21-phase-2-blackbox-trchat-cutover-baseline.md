# Phase 2 Blackbox TrChat Cutover Baseline

## Goal

Start the smallest safe Phase 2 slice by routing the target-shaped blackbox `TrChat` path through `createRuntimeFromConfig(config) -> Root + Page` without reopening the now-closed Phase 1B default-owner-path contracts.

## Scope

- In scope:
  - identify the current blackbox `TrChat` default-path entry wiring
  - cut the target `TrChatConfig` blackbox path over to `Root + Page`
  - keep remaining compatibility projection narrow and explicit
  - add blackbox-level integration proof for the new default path
- Out of scope:
  - full default cutover for old shipping `ChatConfig` shapes
  - removing all compatibility-only props from the blackbox entry
  - full parity closure
  - standalone page-level `footer` replace-slot work
  - final helper / public surface cleanup

## Frozen Inputs

- Review / phase gate:
  - Review C is ready to schedule and must accept the completed Phase 1B evidence bundle before this slice exits
- Contract freeze:
  - `TrChat.Page` remains composition-only
  - `TrChat.Page` remains the owner of the default page composition
  - `ChatDefaultRenderer` remains a compatibility delegate
  - `footer-extra` remains the only frozen page-level footer slot
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/overview.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/index.ts`
  - `packages/chat/src/components/core/Chat.vue`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/src/root/*`
  - `packages/chat/src/page/*`
  - `packages/chat/src/components/core/default-renderer/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - target-shaped blackbox `TrChat` input should use `createRuntimeFromConfig(config)` as the default on-ramp
  - old config shapes and compatibility-only props should stay as explicit `ChatScaffold` fallback until Review C ratifies the next cutover step
  - target blackbox path should flow through `Root + Page`, not reopen config projection or broad scaffold relay
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - blackbox cutover quietly reopens closed Phase 1B owner-path contracts
  - Mitigation:
    - keep the completed Phase 1B evidence bundle explicit and treat relay widening as a contract regression
- Risk:
  - default `TrChat` path drags parity / helper cleanup into the kickoff slice
  - Mitigation:
    - keep this slice focused on default-path entry wiring and blackbox proof only

## Exit Criteria

- [x] target-shaped blackbox `TrChat` path enters through `createRuntimeFromConfig(config) -> Root + Page`
- [x] old config shapes and compatibility-only props stay as explicit `ChatScaffold` fallback
- [x] no closed Phase 1B owner-path contracts are reopened
- [x] blackbox-level integration proof exists for the target path
- [x] Review C has ratified this kickoff slice as the formal Phase 2 blackbox entry baseline
- [x] docs stay aligned

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - default blackbox path is proven through tests and backwritten docs

## Decision Log

- 2026-04-21:
  - Phase 2 kickoff should start at the blackbox default path, not by reopening Phase 1B page-owner-path work
  - because current shipping blackbox usage still mixes target `TrChatConfig`, old `ChatConfig`, and compatibility props, the first landed slice should route only the fully target-shaped input through `Root + Page` and keep the rest as explicit fallback

## Drift Backwrite

- What changed from the original slice:
  - the first landed slice is a target-config blackbox kickoff preview, not the full legacy-compatible default cutover
- Why:
  - current shipping blackbox usage still mixes old config shape and compatibility-only props, so collapsing them into the new path in one step would hide legacy drift inside the kickoff slice
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `design/execution.md`
  - `review-c-phase-1b-report-and-phase-2-kickoff/*`
