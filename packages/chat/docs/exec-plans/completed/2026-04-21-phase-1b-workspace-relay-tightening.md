# Phase 1B Workspace Relay Tightening

## Goal

Continue Phase 1B by shrinking the remaining workspace/sidebar/mobile-sheet scaffold relay assumptions now that `TrChat.Page` and its nearest default primitives consume explicit page-owned inputs.

## Scope

- In scope:
  - tighten scaffold-derived reads in workspace-facing compatibility components such as sidebar, mobile sheets, and nearby workspace helpers
  - keep the default workspace shell path aligned with `workspace + ui` ownership
  - add targeted contract or integration coverage for the relay paths that move
- Out of scope:
  - blackbox `TrChat` cutover
  - standalone page-level `footer` replace slot
  - full workspace/MCP parity closure
  - removing scaffold context from every remaining compatibility path in one cut

## Frozen Inputs

- Review / phase gate:
  - Review B remains `pass-with-follow-ups`
  - Phase 1B continues immediately after the default-page primitive tightening slice
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
- `packages/chat/docs/generated/runtime-owner-table.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/workspace/*`
  - `packages/chat/src/components/history/*`
  - `packages/chat/src/page/*`
  - `packages/chat/src/shared/context/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - `Root` keeps the `{ runtime, ui }` boundary
  - `Page` and `WorkspaceShell` keep explicit ownership of default workspace composition
  - compatibility relay remains bounded and should move closer to explicit inputs instead of broad scaffold buckets
- Planned validation:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - workspace relay tightening accidentally reopens a second page owner through sidebar or sheet helpers
  - Mitigation:
    - keep changes centered on explicit owner inputs and contract tests
- Risk:
  - relay tightening silently changes mobile fallback behavior
  - Mitigation:
    - pin slot fallback and mounted integration behavior with tests in the same slice

## Exit Criteria

- [x] at least one meaningful workspace/sidebar/mobile-sheet scaffold relay path is replaced with an explicit owner input
- [x] targeted tests pass
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - the mounted `Root + Page` proof still passes
- Contract evidence:
  - `page-region-contract.md` and nearby contract tests remain aligned with the new workspace-facing reads

## Decision Log

- 2026-04-21:
  - `TrChat.Page` and its nearest default primitives no longer read raw preset buckets directly
  - the next tightening slice should focus on the remaining workspace/sidebar/mobile-sheet compatibility relays

## Drift Backwrite

- What changed from the original slice:
  - `ChatWorkspaceLayout` now passes explicit `appearance` and `sidebarTitle` defaults into the default sidebar and mobile sheet path
  - `ChatWorkspaceSidebar`, `ChatWorkspaceLeftSheet`, and `ChatWorkspaceRightSheet` no longer rediscover those defaults through raw scaffold reads in the default page path
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `api-runtime.md`
  - `page-region-contract.md`
