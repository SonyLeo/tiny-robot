# Phase 3B History Model And MCP Parity Baseline

## Task

Close the remaining Phase 3B slice by proving that history/model/workspace linkage and MCP affordances stay stable on the mounted owner path after workspace mobile fallback parity landed.

## Why Now

Once workspace mobile fallback closed, the biggest remaining parity gap was no longer layout structure; it was whether the default owner path still needed hidden relay/context help to keep history, model selection, workspace toggle, and MCP affordances alive.

## Files Changed

- `packages/chat/src/components/core/default-renderer/ChatDefaultFooterRegion.vue`
- `packages/chat/src/components/model-selector/useFloatingDropdown.ts`
- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Contracts Touched

- `TrChat.Page` now passes `modelSelectorInput` through the nearest default footer region on both stacked and workspace owner paths.
- The default owner-path header/footer affordances are now backed by a mounted proof that renders `ChatDefaultHeaderRegion + ChatDefaultFooterRegion` directly with runtime, UI, and MCP manager inputs.
- `ModelSelector` floating dropdown no longer assumes `document` exists during SSR, so mounted owner-path parity proof can run without browser-only globals.

## Validation

- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `node packages/chat/scripts/check-refactor-docs.mjs`

## Drift From Plan/Review

- The slice started as generic history/model/MCP parity. The final proof was narrowed to the nearest owner regions because full `Root + Page` rendering alone was too coarse and could hide relay/context leakage.

## Known Limits

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check` is still blocked by a pre-existing `@opentiny/tiny-robot-svgs` export/type mismatch in `ChatHeader`, workspace sidebar components, and `shared/utils/iconMap.ts`; this is now a Phase 4 hardening input rather than a Phase 3B parity blocker.

## Follow-ups

- Continue with `2026-04-22-phase-4-hardening-review-d-baseline.md`.
