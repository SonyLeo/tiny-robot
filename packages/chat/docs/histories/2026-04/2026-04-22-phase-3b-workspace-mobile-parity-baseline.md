# Phase 3B Workspace Mobile Parity Baseline

## Task

Close the first Phase 3B slice by proving that workspace mobile fallback stays on the mounted owner path without depending on raw scaffold preset buckets.

## Why Now

After Phase 3A closed, the most obvious remaining parity gap was workspace mobile behavior. Leaving it open would make `mobile-left / mobile-right` look correct only because `ChatWorkspaceLayout` still had a scaffold-first shell fallback hidden under the default page owner path.

## Files Changed

- `packages/chat/src/components/workspace/ChatWorkspaceLayout.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/contracts/workspace-slot-contract.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Contracts Touched

- `ChatWorkspaceLayout` now resolves workspace shell fallback from `props.shell` first and then runtime-derived workspace shell state, instead of raw scaffold preset buckets.
- `mobile-left` and `mobile-right` fallback semantics are now backed by a mounted proof that renders `ChatWorkspaceLayout` directly with runtime-backed workspace state.
- Workspace mobile fallback remains an owner-path behavior: explicit page shell input wins, runtime workspace state is the fallback, and scaffold preset lookup is no longer the default source.

## Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

## Drift From Plan/Review

- The slice started as generic workspace mobile parity. The final proof was tightened to a direct `ChatWorkspaceLayout` mounted case with runtime-backed workspace state so the evidence would not be confounded by page-level relay or scaffold projection.

## Known Limits

- Phase 3B still needs dedicated parity coverage for history/model/workspace linkage and MCP.

## Follow-ups

- Continue with `2026-04-22-phase-3b-history-model-mcp-parity-baseline.md`.
