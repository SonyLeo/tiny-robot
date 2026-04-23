## [2026-04-23 16:05] | Task: post-closure legacy pruning closure

### Why Now

After the frozen official-path gate, the retained Playwright gate batch, the edge-scene pruning, and the blackbox-contract tightening had all landed, the remaining blocker for closing the current post-closure cleanup slice was no longer another delete-now batch.
It was making the remaining legacy surface explicit so the slice could end without pretending every helper or bridge file was already dead.

### Files Changed

- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-22-post-closure-legacy-pruning.md`
- `packages/chat/docs/README.md`
- `packages/chat/AGENTS.md`

### Contracts Touched

- process / cleanup closure:
  the post-closure cleanup slice now explicitly separates:
  - already-pruned compatibility layers
  - delete-later helper and fallback surfaces
  - keep-temporarily bridge surfaces that still power the official owner path

### Changes Overview

- Main implementation result:
  no runtime code changed in this closure backwrite; instead, the remaining legacy entry, bridge, helper, and test surfaces are now explicitly classified.
- Main docs result:
  the cleanup slice is now closable because `legacy-surface-inventory.md` records which surfaces are:
  - `already-pruned`
  - `delete-later`
  - `keep-temporarily`
  and why.

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  passed

### Drift From Plan Or Review

- What drifted:
  the slice originally stayed open because the active plan still implied that another delete-now batch was the only way to finish.
- Why:
  after inventorying `Chat.vue`, `src/legacy/*`, and the remaining test/helper surfaces, it became clear that the real missing artifact was an explicit inventory, not one more forced deletion.
- Backwrite status:
  process docs, tracker, docs map, and package-local routing are updated.

### Known Limits

- `src/legacy/rootBridge.ts` and `runtimeHints.ts` remain because the official `Root + Page / Root + primitives` implementation still depends on scaffold-context and chatKit carry-over.
- `Chat.vue` still contains a scaffold fallback branch for non-target input even though the official blackbox contract is already tighter.
- some helper- and compatibility-oriented tests remain as `delete-later` or `keep-temporarily` coverage.

### Follow-ups

- if later cleanup continues, open a new targeted slice for either:
  - removing the remaining `TrChat` scaffold fallback and explicit scaffold helper surface
  - or replacing official-path `useChatScaffoldContext()` consumers so `src/legacy/*` can retire
