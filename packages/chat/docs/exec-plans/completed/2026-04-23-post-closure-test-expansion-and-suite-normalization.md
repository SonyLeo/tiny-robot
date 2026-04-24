# Post-Closure Test Expansion And Suite Normalization

Status: completed after the retained hard gate, smoke/scenario gate, and suite-normalization backlog all closed green.

## Goal

Turn the now-stable chat test surface into the long-lived working baseline for future cleanup and feature work.

This slice is about strengthening the test system itself:

- adding missing coverage on the supported package story
- retiring outdated tests only after boundary handoff
- making suite structure, support files, and gate commands easier to maintain

## Scope

- In scope:
  - audit and close coverage gaps in `packages/chat/tests`
  - audit and close coverage gaps in `packages/test/src/chat`
  - retire outdated tests and helpers only after a documented handoff
  - continue normalizing scene/support structure around the retained gate
- Out of scope:
  - new package feature work
  - deeper runtime rewrite work
  - reopening retired legacy helper surfaces

## Governing Docs

- `packages/chat/docs/refactor/process/test-governance-standard.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`

## Work Parts

### Part 1: Gap Inventory

- turn the current audit into a concrete missing-coverage backlog
- identify where the supported package story still lacks:
  - runtime proof
  - contract proof
  - mounted integration proof
  - retained smoke/scenario proof
- landed in:
  - `packages/chat/docs/refactor/process/test-gap-backlog.md`

### Part 2: Hard-Gate Additions

- add missing package-local tests in:
  - `packages/chat/tests/runtime`
  - `packages/chat/tests/contracts`
  - `packages/chat/tests/integration`
- prefer nearest-owner proof over broad browser duplication

### Part 3: E2E Gap Additions And Handoff

- add missing retained smoke/scenario coverage for the supported entry ladder
- retire old e2e branches only after:
  - an official-path successor exists
  - or the contract drop is recorded

### Part 4: Suite Normalization

- continue shrinking unused support surface
- standardize shared scene helpers where repetition remains
- normalize file placement and naming only after boundary ownership is clear

## Current Status

- core-flow stabilization is complete
- retained hard gates are green:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat build`
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- retained Playwright gates are green:
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
  - `pnpm.cmd -F tiny-robot-test test:chat:scenario:full`
- test governance, file-level audit, frozen gate commands, and scene-support baselines are all landed
- the concrete Part 1 gap backlog in `packages/chat/docs/refactor/process/test-gap-backlog.md` is fully closed
- this slice now serves as completed closure evidence, not an active landing queue

## Validation

Required package-local gate:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

Preferred retained Playwright gate:

- `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
- `pnpm.cmd -F tiny-robot-test test:chat:scenario:full`

Stable fallback when local worker or web-server instability appears:

- `pnpm.cmd -F tiny-robot-test test:chat:smoke`
- `pnpm.cmd -F tiny-robot-test test:chat:scenario`

Documentation gate:

- `node packages/chat/scripts/check-refactor-docs.mjs`

## Progress Model

Use these two numbers in future progress updates:

- current test-expansion slice progress
- overall full-cutover closure progress

Suggested milestones:

- `0-20%`
  gap inventory and active backlog are explicit
- `20-50%`
  missing hard-gate package-local tests are landing
- `50-80%`
  retained smoke/scenario gaps and handoffs are landing
- `80-100%`
  suite normalization and obsolete-test retirement are complete for this slice

## Exit Criteria

- [x] a concrete gap backlog is recorded in the active process docs
- [x] missing hard-gate package-local tests for the supported story are landed for `G-001`
- [x] missing retained smoke/scenario tests for the supported story are landed for `G-002` and `G-003`
- [x] the retained advanced `TrChat.Provider(responseProvider)` path has a nearest-owner mounted proof for `G-004`
- [x] smoke-suite support normalization has landed for `N-001`
- [x] any retired test/helper/scene in this slice has a documented handoff or contract drop
- [x] retained preferred and stable-fallback gates remain green
- [x] a closing history entry has landed
