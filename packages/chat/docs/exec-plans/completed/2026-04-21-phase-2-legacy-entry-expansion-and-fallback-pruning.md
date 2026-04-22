# Phase 2 Legacy Entry Expansion And Fallback Pruning

## Goal

Extend the now-ratified Phase 2 blackbox entry baseline beyond the narrow target-`TrChatConfig` preview while continuing to keep legacy config shapes and compatibility props explicit, reviewable fallback paths.

## Scope

- In scope:
  - identify the remaining old `ChatConfig` and compatibility-only entry paths still routed through `ChatScaffold`
  - decide which legacy blackbox shapes can be normalized into the `Root + Page` path without reopening Phase 1B owner-path contracts
  - keep fallback behavior explicit where cutover is still unsafe
  - add blackbox contract/integration proof for any newly expanded entry path
- Out of scope:
  - parity closure
  - final helper / public surface cleanup
  - standalone page-level `footer` replace-slot work

## Frozen Inputs

- Review / phase gate:
  - Review C has accepted the narrow target-`TrChatConfig` kickoff preview as the formal Phase 2 entry baseline
- Contract freeze:
  - `TrChat.Page` remains composition-only
  - `TrChat.Page` remains the owner of the default page composition
  - `ChatDefaultRenderer` remains a compatibility delegate
  - `footer-extra` remains the only frozen page-level footer slot
  - old `ChatConfig` shapes and compatibility props may remain bounded fallback paths until their cutover is actually implemented and evidenced
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/overview.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/core/Chat.vue`
  - `packages/chat/src/components/core/ChatScaffold.vue`
  - `packages/chat/src/runtime/config/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep `createRuntimeFromConfig(config) -> Root + Page` as the only target blackbox on-ramp
  - normalize or route additional safe blackbox entry shapes into that on-ramp only when code, tests, and docs all agree
  - keep any unresolved legacy shapes as explicit fallback instead of mixing contracts inside one hidden branch
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - legacy entry expansion quietly reopens config projection or broad scaffold relay
  - Mitigation:
    - keep every newly supported entry shape explicit and backed by blackbox tests
- Risk:
  - Phase 2 expands too fast and starts implying parity closure
  - Mitigation:
    - keep this slice strictly about blackbox entry expansion and fallback pruning

## Exit Criteria

- [x] at least one additional safe blackbox entry shape beyond the narrow target-`TrChatConfig` preview enters through `Root + Page`
- [x] any remaining legacy shape stays an explicit bounded fallback path
- [x] new blackbox contract or integration proof exists for the expanded entry path
- [x] docs stay aligned

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - expanded blackbox entry paths are proven through tests and backwritten docs

## Decision Log

- 2026-04-21:
  - after Review C, Phase 2 should continue by expanding blackbox entry support in reviewable slices instead of pretending the entire legacy compatibility surface has already been retired

## Drift Backwrite

- What changed from the original slice:
  - the slice narrowed itself to lifecycle-compatible callbacks only
  - `onFinish / onError` were normalized into the target lifecycle owner path
  - `onBeforeSend / onMessageAction / onModelChange` remained explicit scaffold fallback instead of joining the blackbox path
- Why:
  - this was the safest additional blackbox entry shape that mapped cleanly to already-frozen target ownership without reopening scaffold projection or Phase 1B owner-path contracts
- Which source docs need follow-up:
  - completed in:
    - `design/api-runtime.md`
    - `design/execution.md`
    - `generated/config-bridge-matrix.md`
    - `alignment-tracker.md`
