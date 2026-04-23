# Phase 4 Hardening And Review D Baseline

## Goal

Start Phase 4 by closing the remaining hardening drift across docs, tests, examples, helpers, and review preparation now that Phase 3B parity is closed.

## Scope

- In scope:
  - close package-level validation drift that is now outside the closed parity slices
  - tighten docs / examples / helper guidance so the refactor surface reads as one coherent package
  - prepare the evidence bundle needed for Review D without reopening closed contracts
- Out of scope:
  - new public API expansion
  - broad runtime ownership redesign
  - legacy-path deletion work that depends on post-Phase-4 decisions

## Frozen Inputs

- Review / phase gate:
  - Reviews A, B, and C are accepted
- Landed prerequisites:
  - Phase 1A, Phase 1B, Phase 2, Phase 3A, and Phase 3B are all closed
  - default blackbox, `Root + Page`, sender/message parity, and workspace/MCP parity proofs are all landed
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/reviews/review-c-phase-1b-report-and-phase-2-kickoff/*`

## Implementation Slice

- Target files:
  - `packages/chat/src/**/*`
  - `packages/chat/tests/**/*`
  - `packages/chat/docs/**/*`
  - `packages/chat/package.json`
- Intended ownership:
  - keep Phase 4 focused on hardening and closure, not on reopening runtime/page design
  - treat current package-level validation blockers as hardening work, not as parity follow-ups
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - hardening turns into another parity phase and reopens closed owner-path work
  - Mitigation:
    - keep this slice aimed at validation drift, docs/examples closure, and review readiness only
- Risk:
  - package-level type-check failures get treated as “external noise” and never re-enter the closure plan
  - Mitigation:
    - treat the current `tiny-robot-svgs` export/type drift as a Phase 4 hardening input

## Exit Criteria

- [x] package-level validation drift is reduced or explicitly bounded
- [x] docs/examples/helper guidance is aligned with the closed contracts
- [x] Review D prep is started from an explicit evidence bundle
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Contract evidence:
  - hardening work should either remove validation drift or bound it explicitly in docs/history

## Decision Log

- 2026-04-22:
  - after Phase 3B closed, the remaining work shifted from parity proof to package hardening, validation closure, and Review D preparation
  - the first hardening win was to close `@opentiny/tiny-robot-svgs` export/type drift at the owner package instead of patching `packages/chat` consumers around stale sibling exports
  - Review D prep should start as soon as package-level validation is green again so the final closure review stays evidence-backed instead of drifting into narrative recap
  - once validation returned to green, the next closure step was to align the package README, official demo routes, and helper guidance around the same `TrChat -> Root + Page -> Root + primitives` ladder instead of leaving old helper-heavy examples as the default story

## Drift Backwrite

- What changed from the original slice:
  - package-level `type-check` is green again after exporting the missing icons from `packages/svgs/src/components/index.ts` and rebuilding the sibling package artifacts
  - Review D packet preparation started in parallel with hardening instead of waiting for every Phase 4 follow-up to finish
  - the demo app and package-level guidance were narrowed onto the frozen official surfaces, and old demo-only MCP plus internal-helper scaffolding was removed instead of being left as parallel examples
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `design/execution.md`
  - `packages/chat/README.md`
