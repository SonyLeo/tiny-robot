## [2026-04-23 21:10] | Task: post-closure core-flow stabilization kickoff

### Why Now

Late post-closure cleanup landed with regressions in the official model-switch and sender-submit flows, so the branch needed to pause further helper retirement and switch to a stabilization-first execution gate.

### Files Changed

- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/refactor/process/core-flow-stabilization-baseline.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-core-flow-stabilization.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-full-cutover-closure.md`
- `packages/chat/docs/README.md`
- `packages/chat/AGENTS.md`
- `packages/test/src/chat/README.md`
- `packages/test/playwright.config.ts`
- `packages/test/vite.config.ts`
- `packages/test/src/chat/model-switch-debug.spec.ts`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  no public runtime contract changed; process and validation routing now treat core-flow stabilization as the temporary execution gate, and the e2e harness now supports a fresh configurable server port for recovery work.

### Changes Overview

- Main implementation result:
  added fresh-server port and baseURL overrides to `packages/test` Playwright/Vite config and removed the temporary model-switch debug spec after its findings were captured.
- Main docs result:
  established `core-flow-stabilization-baseline.md` as the branch execution gate, paused the full-cutover closure slice, and routed source-of-truth docs plus e2e conventions to the stabilization-first workflow.

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - pending rerun after the kickoff backwrite and config cleanup land together

### Drift From Plan Or Review

- What drifted:
  the branch moved from continued helper retirement to stabilization-first execution.
- Why:
  the official-path model-switch and sender-submit regressions became a bigger priority than additional retirement progress.
- Backwrite status:
  active plan, tracker, source-of-truth routing, and checklist/backlog docs were updated to reflect the pause and new gate.

### Known Limits

- the retained Playwright gate still needs a fresh-server rerun before the stabilization baseline can move red rows to green.
- the branch should not claim full cutover while the stabilization baseline is still red.

### Follow-ups

- build `packages/chat` before fresh-server e2e validation
- rerun `model-switch` and `feedback` on a fresh Playwright server path
- resume `post-closure full cutover closure` only after stabilization is green again
