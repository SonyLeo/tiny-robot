## [2026-04-22 23:18] | Task: Phase 4 official demo and helper closure

### Why Now

Phase 4 had already restored package-level validation and started Review D prep, but the package still taught two different stories. The refactor contracts said the official ladder was `TrChat -> Root + Page -> Root + primitives`, while the demo app and package guidance still defaulted to helper-heavy compatibility examples. Closing that drift was the next necessary closure step before Review D.

### Files Changed

- `packages/chat/README.md`
- `packages/chat/AGENTS.md`
- `pnpm-lock.yaml`
- `packages/chat/package.json`
- `packages/chat/scripts/check-refactor-docs.mjs`
- `packages/chat/demo/package.json`
- `packages/chat/demo/tsconfig.json`
- `packages/chat/demo/src/App.vue`
- `packages/chat/demo/src/constants.ts`
- `packages/chat/demo/src/data/officialConfig.ts`
- `packages/chat/demo/src/components/BlackboxDemo.vue`
- `packages/chat/demo/src/components/WhiteboxDemo.vue`
- `packages/chat/demo/src/components/GranularWorkspaceDemo.vue`
- `packages/chat/docs/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/exec-plans/completed/2026-04-22-phase-4-hardening-review-d-baseline.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-phase-4-review-d-closure.md`
- `packages/chat/docs/refactor/REFACTOR_COLLAB_GUIDE.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/refactor/reviews/review-d-phase-2-report-and-phase-3-4-closure/REVIEW_D_OWNER_RUNBOOK.md`
- `packages/chat/docs/refactor/reviews/review-d-phase-2-report-and-phase-3-4-closure/REVIEW_D_SPEC_DETAIL.md`
- `packages/chat/docs/refactor/reviews/review-d-phase-2-report-and-phase-3-4-closure/REVIEW_D_REVIEWER_MEMO.md`

### Files Removed

- `packages/chat/demo/src/components/GranularWorkspaceSidebar.vue`
- `packages/chat/demo/src/data/mcpServers.ts`
- `packages/chat/demo/src/utils/mcpBridge.ts`

### Contracts Touched

- package entry and helper guidance:
  - `packages/chat/README.md` now owns the official package entry ladder, helper boundary, and demo route map
- docs routing:
  - `AGENTS.md`, `docs/README.md`, `SOURCE_OF_TRUTH.md`, and `REFACTOR_COLLAB_GUIDE.md` now all route package-entry questions through the new README
- review evidence:
  - Review D packet now includes the official demo/helper closure evidence instead of treating it as still-open drift

### Changes Overview

- Main implementation result:
  - the demo app now teaches only the frozen official entry surfaces:
    - `TrChat`
    - `TrChat.Root + TrChat.Page`
    - `TrChat.Root + primitives`
  - old demo-only MCP wiring, internal imports, scaffold-first examples, and helper-heavy whitebox examples were removed from the official demo routes
- Main docs result:
  - package-level guidance, docs routing, check scripts, and Review D packet now all describe the same official entry ladder and helper boundary

### Validation

- Commands:
  - `pnpm.cmd -C packages/chat/demo exec vite build`
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - the closure work went beyond prose cleanup and deleted several demo-only compatibility files because leaving them alongside the new official examples would have kept the old story visually alive
- Why:
  - the package no longer needed those files once the official demos moved onto the frozen public surfaces
- Backwrite status:
  - completed in the Phase 4 active plan, the tracker, the Review D packet, and the knowledge log

### Known Limits

- Review D has not been held yet.
- legacy-path deletion remains a later cleanup step.
- deferred standalone `footer` replace-slot publishing semantics remain outside this slice.

### Follow-Ups

- run Review D from the now-aligned packet
- keep later closure work focused on decision capture and bounded follow-ups, not on reopening closed parity slices
