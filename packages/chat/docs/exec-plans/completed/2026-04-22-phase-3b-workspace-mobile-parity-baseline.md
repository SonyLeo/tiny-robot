# Phase 3B Workspace Mobile Parity Baseline

## Goal

Start Phase 3B by proving that the mounted owner path keeps workspace mobile fallback semantics stable without reopening scaffold-first ownership.

## Scope

- In scope:
  - harden mounted workspace mobile fallback behavior on the default owner path
  - keep `workspace runtime` and page shell inputs authoritative
  - add targeted parity proof for mobile-left/mobile-right fallback and shell interaction
- Out of scope:
  - MCP parity beyond what is needed to keep workspace tests stable
  - broad legacy bridge removal
  - Review D packet work

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are accepted and Phase 2 is closed
- Landed prerequisites:
  - Phase 3A sender, message-extension, and sender-plus-attachments parity are all closed
  - Phase 1B page/workspace owner baseline remains the default page composition owner path
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/workspace/*`
  - `packages/chat/src/page/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep workspace mobile fallback behavior page/runtime-owned
  - avoid reopening raw scaffold relay as the default mobile-shell source
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - workspace mobile fallback still appears correct only because scaffold relay happens to fill gaps
  - Mitigation:
    - add mounted proof that exercises page shell fallback directly on the owner path
- Risk:
  - mobile-left/mobile-right semantics drift away from the frozen page region contract
  - Mitigation:
    - backwrite the exact fallback behavior into `page-region-contract.md`

## Exit Criteria

- [x] workspace mobile fallback parity lands with targeted proof
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - mounted proof and contract tests for workspace mobile fallback semantics

## Decision Log

- 2026-04-22:
  - after Phase 3A closed, workspace mobile fallback became the first Phase 3B parity slice
  - `ChatWorkspaceLayout` now resolves fallback from explicit page `shell` input first and then runtime-derived workspace shell state, while a mounted proof covers `mobile-left / mobile-right` fallback without scaffold preset buckets

## Drift Backwrite

- What changed from the original slice:
  - the strongest parity proof ended up as direct `ChatWorkspaceLayout` rendering with runtime-backed workspace state instead of relying on `Root + Page`, so the evidence would not be confounded by page-level relay
- Which source docs need follow-up:
  - none
