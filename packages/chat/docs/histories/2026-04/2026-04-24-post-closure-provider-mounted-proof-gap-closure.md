## [2026-04-24 12:05] | Task: close retained provider mounted-proof gap

### Why Now

`test-gap-backlog.md` still had `G-004` open after the `TrChat`, `Root + Page`, and granular gaps were closed. The retained advanced `TrChat.Provider(responseProvider)` path still depended on runtime helper tests and browser routing, but it lacked a nearest-owner mounted proof inside `packages/chat/tests`.

### Files Changed

- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/process/test-gap-backlog.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-test-expansion-and-suite-normalization.md`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  retained advanced `TrChat.Provider(responseProvider)` now has a mounted leaf-composition proof at the nearest owner boundary.

### Changes Overview

- Main implementation result:
  added a mounted integration proof that renders `TrChat.Provider` directly with `responseProvider`, `TrChat.Layout`, `TrChat.Header`, `TrChat.MessageList`, and `TrChat.Sender`, and proves the supported retained leaf-composition contract without depending on Playwright routing.
- Main docs result:
  closed `G-004`, updated the hard-gate inventory to include the retained advanced provider mounted proof, and moved the active pull order to `N-001` / `N-002`.

### Validation

- Commands:
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  integration gate passed; docs check passed.

### Drift From Plan Or Review

- What drifted:
  the first provider mounted assertion assumed an immediate rendered message/feedback path.
- Why:
  the retained provider branch does not auto-create a conversation during SSR render, so the mounted proof had to stay at the nearest stable leaf-composition contract instead of asserting browser-only message flow.
- Backwrite status:
  reflected in the backlog closure and the integration inventory docs.

### Known Limits

- the mounted proof intentionally stays SSR-level; browser-level provider behavior is still covered by `scenario-specs/surface-api.spec.ts`.

### Follow-ups

- land `N-001` smoke-suite support normalization
- then decide `N-002` file placement cleanup
