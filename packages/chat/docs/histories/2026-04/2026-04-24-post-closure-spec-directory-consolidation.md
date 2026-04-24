## [2026-04-24 13:05] | Task: consolidate retained Playwright specs under scenario-specs

### Why Now

The retained Playwright gate had already been normalized in behavior, but `packages/test/src/chat` still mixed top-level smoke specs with `scenario-specs/*`. The package story was support-first at the top level, so the remaining file-placement split had become unnecessary noise.

### Files Changed

- `packages/test/src/chat/scenario-specs/index.spec.ts`
- `packages/test/src/chat/scenario-specs/history.spec.ts`
- `packages/test/src/chat/scenario-specs/request-lifecycle.spec.ts`
- `packages/test/src/chat/scenario-specs/attachments.spec.ts`
- `packages/test/src/chat/scenario-specs/feedback.spec.ts`
- `packages/test/src/chat/scenario-specs/model-switch.spec.ts`
- `packages/test/src/chat/scenario-specs/sender-actions.spec.ts`
- `packages/test/package.json`
- `packages/test/src/chat/README.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/test-gap-backlog.md`
- `packages/chat/docs/refactor/process/test-governance-standard.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-test-expansion-and-suite-normalization.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  no runtime contract changed; this is suite-structure normalization for the retained Playwright gate.

### Changes Overview

- Main implementation result:
  moved the retained smoke specs and `sender-actions.spec.ts` into `packages/test/src/chat/scenario-specs/`, updated their relative helper imports, and rewired the frozen smoke/scenario commands to the new paths.
- Main docs result:
  updated the current process docs and suite README so the directory layout, gate commands, and file-level audit all point to the consolidated spec location.

### Validation

- Commands:
  - `pnpm.cmd -F tiny-robot-test build`
  - `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
  - `pnpm.cmd -F tiny-robot-test test:chat:scenario:full`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  all listed commands passed.

### Drift From Plan Or Review

- What drifted:
  `N-002` was originally framed as only a `sender-actions.spec.ts` placement decision.
- Why:
  once the user asked for a cleaner `packages/test/src/chat` root, it was safer to move the whole retained spec set into one folder than to keep a mixed top-level/sibling layout.
- Backwrite status:
  reflected in `test-gap-backlog.md`, the file-level audit, and the active plan.

### Known Limits

- `N-001` smoke-suite support normalization is still open; this slice only cleaned file placement, not duplicated smoke helper/setup code.

### Follow-ups

- land `N-001`
- keep using the frozen `test:chat:smoke(:full)` and `test:chat:scenario(:full)` scripts as the retained gate
