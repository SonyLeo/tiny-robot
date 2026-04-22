# Phase 1B Header And History Relay Pruning

## Goal

Shrink the next highest-value compatibility relay in the default page path by tightening the remaining header/history scaffold fallback without reopening a broader page rewrite.

## Scope

- In scope:
  - tighten the remaining default-page compatibility relay in `ChatHeader` and `ChatHistory`
  - keep the default page owner path explicit for header/history affordances
  - add targeted contract evidence for the relay that moves
- Out of scope:
  - removing all remaining scaffold fallbacks in one cut
  - blackbox `TrChat` cutover
  - standalone page-level `footer` replace slot
  - full parity closure

## Frozen Inputs

- Review / phase gate:
  - Review B remains `pass-with-follow-ups`
  - Phase 1B continues after the layout renderer relay pruning slice
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
  - `packages/chat/src/components/core/ChatHeader.vue`
  - `packages/chat/src/components/history/ChatHistory.vue`
  - `packages/chat/src/components/core/default-renderer/*`
  - `packages/chat/src/page/*`
  - `packages/chat/tests/contracts/*`
- Intended ownership:
  - explicit page-owned header/history inputs stay explicit
  - compatibility fallback remains available only when it still protects non-page consumers
  - the chosen cut should reduce duplicate default-value discovery rather than just moving code
  - the default page path should be able to opt out of compatibility relay once it already provides header/history owner inputs
- Planned validation:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - pruning header/history fallback too aggressively breaks direct primitive usage under compatibility paths
  - Mitigation:
    - keep the slice narrow and preserve fallback only where it still protects real non-page consumers
- Risk:
  - the change becomes another broad page rewrite
  - Mitigation:
    - only move one relay and keep contract evidence tightly scoped

## Exit Criteria

- [x] one high-value header/history compatibility relay is narrowed or removed
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
  - the chosen header/history relay cut is reflected in contract tests and the relevant design/knowledge backwrite

## Decision Log

- 2026-04-21:
  - after `ChatLayout` stopped merging explicit renderer input with raw scaffold buckets, the next highest-value remaining relay sits near header/history compatibility paths
  - this slice chose an explicit opt-out because the default page path already passes header/history owner inputs, while direct primitive usage may still need compatibility fallback

## Drift Backwrite

- What changed from the original slice:
  - `ChatHeader` and `ChatHistory` now accept an explicit compatibility-relay opt-out so the default page path can disable scaffold fallback while leaving broader compatibility usage intact
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `api-runtime.md`
  - `page-region-contract.md`
  - `PLAYBOOK.md`
  - `EXPERIENCE_LOG.md`
