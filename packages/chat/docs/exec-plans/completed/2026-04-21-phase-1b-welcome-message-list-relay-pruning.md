# Phase 1B Welcome And MessageList Relay Pruning

## Goal

Shrink the remaining welcome/message-list compatibility relay now that the default page path has explicit opt-outs for layout, header, history, and workspace owner inputs.

## Scope

- In scope:
  - tighten one meaningful remaining scaffold fallback in `ChatWelcome` or `ChatMessageList`
  - keep the default page body owner path explicit
  - add targeted contract evidence for the relay that moves
- Out of scope:
  - removing every remaining scaffold fallback in one cut
  - blackbox `TrChat` cutover
  - standalone page-level `footer` replace slot
  - full parity closure

## Frozen Inputs

- Review / phase gate:
  - Review B remains `pass-with-follow-ups`
  - Phase 1B continues after the header/history relay pruning slice
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
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/core/ChatWelcome.vue`
  - `packages/chat/src/components/core/ChatMessageList.vue`
  - `packages/chat/src/components/core/default-renderer/*`
  - `packages/chat/src/page/*`
  - `packages/chat/tests/contracts/*`
- Intended ownership:
  - explicit page-owned body inputs stay explicit
  - compatibility relay remains available only when it still protects non-page consumers
  - the chosen cut should reduce duplicate default-value discovery rather than just moving code
  - the default page body path should be able to opt out of compatibility relay once it already provides welcome/message-list owner inputs
- Planned validation:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - pruning welcome/message-list fallback too aggressively breaks direct primitive usage
  - Mitigation:
    - keep the slice narrow and preserve fallback only where it still protects real compatibility consumers
- Risk:
  - the change becomes a broader page-body rewrite
  - Mitigation:
    - move one relay at a time and keep evidence scoped to the chosen primitive

## Exit Criteria

- [x] one high-value welcome/message-list compatibility relay is narrowed or removed
- [x] targeted tests pass
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - the chosen welcome/message-list relay cut is reflected in contract tests and the relevant design/knowledge backwrite

## Decision Log

- 2026-04-21:
  - after header/history relay pruning, the remaining obvious default-body compatibility relay sits near `ChatWelcome` and `ChatMessageList`
  - this slice chose an explicit opt-out because the default page body path already passes welcome/message-list owner inputs, while direct primitive usage may still need compatibility fallback

## Drift Backwrite

- What changed from the original slice:
  - `ChatWelcome` and `ChatMessageList` now accept an explicit compatibility-relay opt-out so the default page body path can disable scaffold fallback while leaving broader compatibility usage intact
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `api-runtime.md`
  - `page-region-contract.md`
  - `EXPERIENCE_LOG.md`
