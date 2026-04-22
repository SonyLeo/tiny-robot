# Phase 1B Layout Renderer Relay Pruning

## Goal

Pick and shrink the highest-value remaining compatibility relay in the post-page-baseline path now that the default page owner chain and default workspace owner chain both consume explicit inputs.

## Scope

- In scope:
  - tighten the remaining renderer-oriented scaffold fallback in `ChatLayout`
  - keep the official default owner path explicit while reducing duplicate relay logic
  - add targeted contract evidence for the relay that moves
- Out of scope:
  - removing all remaining scaffold fallbacks in one cut
  - blackbox `TrChat` cutover
  - standalone page-level `footer` replace slot
  - full parity closure

## Frozen Inputs

- Review / phase gate:
  - Review B remains `pass-with-follow-ups`
  - Phase 1B continues after the workspace relay tightening slice
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
  - `packages/chat/src/components/core/ChatLayout.vue`
  - `packages/chat/tests/contracts/*`
- Intended ownership:
  - explicit owner paths stay explicit
  - compatibility relay remains available only where it still adds real migration value
  - when `Page` already passes explicit layout inputs into `ChatLayout`, those inputs should stay authoritative instead of silently merging raw scaffold renderer defaults back in
- Planned validation:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - pruning compatibility relay too aggressively breaks non-page consumers
  - Mitigation:
    - choose one relay at a time and keep targeted contract/runtime evidence for the preserved compatibility path
- Risk:
  - relay pruning turns into broad cleanup with unclear owner gain
  - Mitigation:
    - each cut must name the owner, the old fallback, and the evidence that the new boundary is real

## Exit Criteria

- [x] one high-value remaining compatibility relay is narrowed or removed
- [x] targeted tests pass
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - the `ChatLayout` relay cut is reflected in `renderer-registry.test.mjs` plus the relevant design/knowledge backwrite

## Decision Log

- 2026-04-21:
  - the default page owner chain and the default workspace owner chain now both consume explicit inputs
  - the next Phase 1B cut should pick the highest-value remaining compatibility relay rather than trying to remove all remaining scaffold fallbacks at once
  - `ChatLayout` was chosen for this slice because it still merged explicit `bubbleRenderers` with raw scaffold renderer buckets, which meant the default owner path was not yet authoritative for renderer defaults

## Drift Backwrite

- What changed from the original slice:
  - narrowed the slice to `ChatLayout` so that explicit `bubbleRenderers` now win over scaffold relay instead of being merged with it in the default owner path
  - kept compatibility fallback only for the case where explicit renderer inputs are absent
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `api-runtime.md`
  - `page-region-contract.md`
  - `EXPERIENCE_LOG.md`
