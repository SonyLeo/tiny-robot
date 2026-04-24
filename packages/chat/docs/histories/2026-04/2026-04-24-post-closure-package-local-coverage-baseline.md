## [2026-04-24 21:37] | Task: post-closure package-local coverage baseline

### Why Now

The active post-closure follow-up slice starts with formal code-coverage reporting so the package no longer relies only on behavior-coverage language when describing test evidence.

### Files Changed

- `packages/chat/package.json`
- `packages/chat/scripts/run-coverage.mjs`
- `packages/chat/README.md`
- `packages/chat/docs/refactor/process/test-governance-standard.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-24-post-closure-coverage-story-and-surface-cleanup.md`

### Contracts Touched

- docs:
  package-local validation and coverage reporting guidance only; no runtime, root, page, or public API contract changed

### Changes Overview

- Main implementation result:
  added `pnpm -F @opentiny/tiny-robot-chat test:coverage`, backed by `packages/chat/scripts/run-coverage.mjs`, to produce formal package-local coverage artifacts for `packages/chat/tests` against `packages/chat/src`
- Main docs result:
  clarified that the new coverage baseline reuses the existing `runtime`, `contracts`, and `integration` suites, while Playwright e2e under `packages/test/src/chat` remains the separate retained user-path gate

### Validation

- Commands:
  - `pnpm.cmd type-check`
  - `node tests/run-all.mjs tests/runtime`
  - `node tests/run-all.mjs tests/contracts`
  - `node tests/run-all.mjs tests/integration`
  - `pnpm.cmd -F @opentiny/tiny-robot-chat test:coverage`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all package-local suites passed
  - `test:coverage` completed and wrote `packages/chat/coverage/summary.json`, `packages/chat/coverage/files.json`, and `packages/chat/coverage/text-summary.txt`
  - current package-local baseline reports `80 / 98` loaded source files, `90.51%` loaded-source line coverage, and `91.85%` loaded-source byte coverage

### Drift From Plan Or Review

- What drifted:
  no drift from the active slice boundary; Part 1 stayed package-local
- Why:
  the existing package-local harness was enough to produce the new report without creating another test tier
- Backwrite status:
  README, test-governance guidance, tracker, and the active slice now reflect that boundary

### Known Limits

- the formal coverage report currently measures `packages/chat/tests` only; it does not merge Playwright browser coverage from `packages/test/src/chat`
- coverage percentages are reported for source files loaded by the package-local suites, and unloaded source files are listed separately instead of being hidden
- package-local test output still includes the existing non-blocking `localStorage is not defined` runtime warning from `packages/kit`

### Follow-ups

- continue Part 2 of the active slice by aligning README / docs / retained evidence around the settled three-layer model
- then move into the public-surface leakage audit before taking any deeper private-runtime cleanup batch
