# Phase 3B History Model And MCP Parity Baseline

## Goal

Continue Phase 3B by proving that history/model/workspace linkage and MCP affordances stay stable on the mounted owner path after the workspace mobile fallback slice closed.

## Scope

- In scope:
  - harden mounted history/model/workspace linkage on the default owner path
  - keep MCP affordances page/runtime-owned on the default page path
  - add targeted parity proof for history toggle, model change, and MCP trigger visibility where applicable
- Out of scope:
  - broad legacy bridge removal
  - Review D packet work
  - new public API expansion

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are accepted and Phase 2 is closed
- Landed prerequisites:
  - Phase 3A sender/message-extension parity is closed
  - Phase 3B workspace mobile fallback parity is closed
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
  - `packages/chat/src/components/core/*`
  - `packages/chat/src/components/history/*`
  - `packages/chat/src/components/mcp/*`
  - `packages/chat/src/components/workspace/*`
  - `packages/chat/tests/contracts/*`
  - `packages/chat/tests/integration/*`
- Intended ownership:
  - keep history/model/workspace linkage driven by page inputs plus runtime owners
  - keep MCP affordances explicit on the default page path instead of depending on compatibility relay
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - history or model affordances still appear aligned only because older scaffold wiring fills gaps
  - Mitigation:
    - add mounted proof that exercises default page linkage directly on the owner path
- Risk:
  - MCP parity gets widened narratively without a stable owner-path test
  - Mitigation:
    - keep MCP proof narrow and default-page specific

## Exit Criteria

- [x] history/model/workspace linkage parity lands with targeted proof
- [x] MCP affordance parity lands with targeted proof
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - mounted proof and contract tests for history/model/workspace linkage plus MCP affordance parity

## Decision Log

- 2026-04-22:
  - after workspace mobile fallback parity closed, history/model/workspace linkage plus MCP parity became the next remaining Phase 3B slice
  - the strongest proof ended up as mounted `ChatDefaultHeaderRegion + ChatDefaultFooterRegion` with explicit owner inputs and manager/runtime injection, instead of only asserting these affordances through a full `Root + Page` render

## Drift Backwrite

- What changed from the original slice:
  - the final proof was tightened to direct mounted owner-region rendering so history, model, workspace, and MCP affordances could be evidenced without page-level relay masking gaps
- Which source docs need follow-up:
  - none
