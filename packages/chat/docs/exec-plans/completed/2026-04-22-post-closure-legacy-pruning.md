# Post-Closure Legacy Pruning

## Goal

Start post-closure cleanup by inventorying and then pruning legacy-path code that no longer needs to survive in the development branch, while keeping the official package surfaces functional:

- `TrChat`
- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`

## Scope

- In scope:
  - inventory the remaining legacy-path entry, bridge, and compatibility layers
  - classify each remaining legacy path as `delete now`, `delete later`, or `keep temporarily`
  - inventory and retire outdated unit and e2e coverage that only protects compatibility-only behavior
  - remove the first batch of low-risk legacy code that no longer owns real functionality
  - keep docs, tracker, and tests aligned with the reduced legacy surface
- Out of scope:
  - new features or parity work
  - standalone page-level `footer` replace-slot publishing semantics
  - preserving old API or path compatibility as a goal by itself

## Frozen Inputs

- Review / closure gate:
  - Reviews A, B, C, and D are all accepted
  - the refactor is recorded as `closure-ready-with-follow-ups`
- Development-stage assumption:
  - this branch does not optimize for legacy compatibility
  - functionality of the official owner-aligned paths is the primary gate
  - if a legacy path no longer provides unique functional value, it should be deleted rather than preserved
- Landed prerequisites:
  - `Phase 1A`, `Phase 1B`, `Phase 2`, `Phase 3A`, and `Phase 3B` are closed
  - `Phase 4` closure and official demo/helper alignment are closed
- Required source docs:
  - `packages/chat/docs/refactor/design/api-runtime.md`
  - `packages/chat/docs/refactor/design/execution.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`
  - `packages/chat/README.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/README.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/legacy/**/*`
  - `packages/chat/src/components/core/Chat.vue`
  - `packages/chat/src/runtime/config/blackboxEntry.ts`
  - `packages/chat/src/index.ts`
  - `packages/chat/src/types/**/*`
  - `packages/chat/tests/**/*`
  - `packages/test/src/chat/**/*`
  - `packages/chat/docs/**/*`
- Intended ownership:
  - remove compatibility-first code only when the official owner path already has equivalent functional proof
  - prefer deleting dead or compatibility-only branches before rewriting stable owner-path code
  - freeze the official-path test boundary before deleting compatibility code; do not use mixed legacy e2e coverage as an undifferentiated gate
  - treat docs and tests as part of the deletion slice, not as follow-up chores
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - adapted official-path Playwright scenarios under `packages/test/src/chat`, once promoted from `test-boundary-baseline.md`
  - `pnpm.cmd -F @opentiny/tiny-robot-chat check:phase-4`

## Work Breakdown

### 1. Inventory

- map remaining legacy entry and bridge files
- map the post-closure test boundary before deleting code
- classify `packages/chat/tests` and `packages/test/src/chat` as `hard gate`, `secondary`, `adapt`, or `retire`
- classify outdated tests as `delete now`, `delete later`, or `keep temporarily` alongside the code they still protect
- identify which official path each legacy branch still serves, if any
- record whether each branch is:
  - compatibility-only
  - still functionally required
  - blocked by a deferred contract decision

### 2. Delete The First Safe Layer

Prioritize low-risk removals in this order:

1. blackbox entry branches that only preserve old compatibility shapes with no remaining functional requirement
2. retired test cases and scene fixtures that only preserve compatibility-only behavior
3. helper or bridge code that is now redundant because the official owner path is directly consumed
4. docs/demo references that still imply legacy-first usage

### 3. Re-Prove Official Paths

- keep `TrChat`, `Root + Page`, and `Root + primitives` green after each deletion batch
- run the frozen `packages/chat/tests` hard gate before every deletion batch
- promote or adapt the nearest retained Playwright scenario before using it as a blocker for a user-visible deletion slice
- if a deletion breaks functionality on an official path, restore behavior in the owner path rather than reviving the old compatibility layer

## Risks

- Risk:
  - deleting a compatibility layer that still carries real functionality
  - Mitigation:
    - require an explicit inventory classification before each deletion batch
- Risk:
  - post-closure cleanup silently reintroduces compatibility code while fixing regressions
  - Mitigation:
    - fix regressions in the official owner path, not by restoring deleted shims
- Risk:
  - deferred `footer` semantics get mixed into generic cleanup and stall pruning
  - Mitigation:
    - keep `footer` publishing semantics out of this slice unless a deletion is directly blocked by it

## Exit Criteria

- [x] remaining legacy-path surface is explicitly inventoried
- [x] official-path test boundary is explicitly frozen before deletion
- [x] first batch of compatibility-only code is deleted
- [x] official package surfaces still pass targeted validation
- [x] tracker and docs describe the reduced legacy surface accurately

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - adapted official-path Playwright scenarios from `packages/test/src/chat`, as classified in `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `pnpm.cmd -F @opentiny/tiny-robot-chat check:phase-4`
- Contract evidence:
  - the official package entry ladder in `packages/chat/README.md`
  - blackbox, mounted, and contract proof that the official paths still work without the deleted legacy layer

## Decision Log

- 2026-04-22:
  - after Review D closure, the next step is no longer phase execution but post-closure cleanup
  - for this development-stage branch, preserving official functionality is required, but preserving legacy compatibility is not
- 2026-04-23:
  - test-boundary classification must land before code deletion so later pruning can reuse one frozen official-path gate instead of rediscovering test scope slice by slice
- the first retained Playwright batch should be adapted in place around the official `TrChat -> Root + Page -> Root + primitives` ladder instead of being rewritten as a brand-new e2e folder
- the first promoted Playwright gate batch is now `index.spec.ts`, `history.spec.ts`, `request-lifecycle.spec.ts`, `workspace-slots.spec.ts`, and `renderer-registry.spec.ts`; later slices should reuse that batch before broadening the e2e gate again
- outdated unit or e2e cases may be deleted only after their functional boundary is either handed off to an official-path proof or explicitly dropped from the supported contract
- official-path handoff now includes:
  - `ui.welcome.prompts` on `TrChat` and `Root + Page`
  - official sender default proof on `TrChat` and `Root + Page`
  - granular `footer-right` suppression proof on `Root + primitives`
- the compatibility-only `senderActions.upload = false` override no longer survives as a retained boundary when an attachments owner still exists; that behavior is now an explicit contract drop instead of a deletion blocker
- the first delete-now batch has now landed on the edge compatibility scene/spec:
  - removed edge-only `senderProps.maxLength`
  - removed edge-only `roleConfigs` placement override
  - removed edge-only header/footer extra slot proof
  - kept only compatibility senderActions `wordCount`/`voice` disable plus explicit close composition while those boundaries remain un-handed-off
- the next delete-now batch has now landed on the blackbox entry contract:
  - removed old `ChatConfig` request/display/layout/shell promoted subsets from `resolveRootPageBlackboxConfig`
  - kept only target `TrChatConfig`, serialized target config, and lifecycle-compatible callbacks on the official `Root + Page` path
  - all old `ChatConfig` shapes now return to explicit `ChatScaffold` fallback instead of remaining partly promoted in the development branch

## Drift Backwrite

- What changed from the original slice:
- the slice now starts by freezing the official-path test boundary across `packages/chat/tests` and `packages/test/src/chat` before deleting compatibility code
- the slice now promotes one retained Playwright batch into the official-path gate before deleting compatibility code, instead of waiting for the whole e2e folder to be rewritten
- test retirement is now boundary-aware: delete stale specs only after the boundary they used to cover has a surviving official-path proof or has been intentionally de-scoped
- the adapted handoff batch now also covers `layout-config`, `welcome-prompts`, `sender-actions`, and the official granular `footer-right` slot proof before the first delete-now batch starts
- the first delete-now batch now prunes already-handed-off assertions and fixture code from `edge-overrides`, while leaving only the still-unresolved compatibility proofs behind
- the current delete-now batch further tightens the blackbox entry itself: old `ChatConfig` promoted subsets are no longer treated as supported development-branch blackbox behavior, so runtime/integration/source-contract proof now only keeps target-config acceptance plus explicit fallback
- the closure backwrite now records the remaining legacy surface explicitly in `legacy-surface-inventory.md`, splitting it into `already-pruned`, `delete-later`, and `keep-temporarily` buckets so this slice can close without pretending every bridge/helper file is dead today
- Which source docs need follow-up:
  - none for this slice; later optional cleanup should open a new targeted plan
