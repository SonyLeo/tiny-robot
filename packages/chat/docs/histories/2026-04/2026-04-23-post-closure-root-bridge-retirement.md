## [2026-04-23 02:10] | Task: post-closure root bridge retirement

### Why Now

The roadmap's second slice was the last file-level legacy bridge question: `src/legacy/rootBridge.ts` still carried active bootstrap wiring even after scaffold fallback, scaffold helper exports, scaffold provision, and runtime hints were already gone. This task moved that surviving behavior under `src/root/` so the official ladder no longer depended on any `src/legacy/*` file.

### Files Changed

- `packages/chat/src/root/TrChatRoot.vue`
- `packages/chat/src/root/createRootBootstrapState.ts`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/IMPLEMENTATION_ROUTING.md`
- `packages/chat/docs/refactor/CODE_MAP.md`
- `packages/chat/docs/exec-plans/completed/2026-04-23-post-closure-root-bridge-retirement.md`
- deleted:
  - `packages/chat/src/legacy/rootBridge.ts`
  - `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-root-bridge-retirement.md`

### Contracts Touched

- runtime / bootstrap:
  - the official `Root` bootstrap path now lives under `src/root/` instead of `src/legacy/`
  - no `src/legacy/*` file remains in the chat package
- process / cleanup:
  - root-bridge retirement is now considered complete
  - the remaining cleanup backlog has narrowed to helper/test retirement and final surface cleanup

### Changes Overview

- Main implementation result:
  - `createLegacyRootBridge(...)` is gone.
  - `TrChatRoot.vue` now uses `createRootBootstrapState(...)`.
  - the remaining bootstrap output stays the same shape for the official ladder: page inputs, provider-facing props, fallback `chatKit`, and runtime-backed attachment helpers.
- Main docs result:
  - process docs no longer treat `src/legacy/rootBridge.ts` as live cleanup debt
  - execution/routing docs no longer point new work at `src/legacy/`

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - the slice ended up backwriting active process/design routing docs as part of completion, not just tracker/inventory/roadmap.
- Why:
  - those docs still named `src/legacy/rootBridge.ts` as a live current boundary, which would have immediately reintroduced stale guidance after the code deletion landed.
- Backwrite status:
  - reflected in the completed plan, tracker, inventory, roadmap, execution/routing docs, and this history entry

### Known Limits

- this slice does not decide the final fate of provider/comparison helper surfaces
- it also does not retire the remaining mixed `adapt` Playwright group or package-local legacy sentinels

### Follow-ups

- if cleanup continues, start from `post-closure-provider-helper-decision`
- only retire old tests after the same kind of boundary handoff or contract drop used in earlier cleanup slices
