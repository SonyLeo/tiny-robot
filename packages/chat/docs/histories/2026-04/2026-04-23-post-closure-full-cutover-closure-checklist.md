## [2026-04-23 03:30] | Task: post-closure full cutover closure checklist

### Why Now

The package had already closed the main refactor and most post-closure cleanup slices, but the remaining work still needed a clear answer to one question: when can we honestly say the package is fully cut over, not just mostly migrated. This task turns that bar into an explicit checklist and ties future progress reporting to it.

### Files Changed

- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-full-cutover-closure.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/AGENTS.md`

### Contracts Touched

- process / completion:
  - the package now has a formal “fully cut over” checklist
  - the remaining cleanup work is organized into provider-helper retirement, legacy test retirement, and final surface cleanup
  - future progress reporting now has a stable closure percentage basis instead of relying on ad-hoc estimates alone

### Changes Overview

- Main process result:
  - created a final closure checklist for the remaining post-closure work
  - created an active execution plan that groups the remaining work into four parts
  - linked the checklist into the roadmap, tracker, docs map, source-of-truth map, and AGENTS routing
- Main planning result:
  - the remaining work is now explicitly staged as:
    - provider helper retirement
    - comparison helper retirement
    - test and scene retirement
    - final surface cleanup

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - this task stayed process-only and did not start helper deletion.
- Why:
  - the priority was to freeze the final completion bar and progress model first so the next deletion slice can report progress against a stable end-state.

### Known Limits

- no helper code was deleted in this task
- provider helper retirement is still the next implementation slice

### Follow-ups

- implement `post-closure-provider-helper-retirement`
- report both slice progress and full-cutover closure progress after each remaining slice
