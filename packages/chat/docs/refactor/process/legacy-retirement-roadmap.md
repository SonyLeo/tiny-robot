# Legacy Retirement Roadmap

Status: active post-closure cleanup roadmap with the root-bridge-retirement stage landed.

This file defines the ordered path from the current `closure-ready` refactor state to a stricter end-state where old usage patterns, compatibility-only helper paths, and their related files are retired.

It is not a new runtime contract source.
Contracts still belong to:

- `../design/api-runtime.md`
- `../design/execution.md`

Use this file when the question is:

- what still remains after the main refactor closed
- what should be deleted next
- what must be proved before a legacy file or test can disappear
- how to reach a “fully retired” implementation without breaking the official entry ladder

## Target End State

For this branch, “complete refactor plus legacy retirement” means all of the following are true:

1. the only official package entry ladder is:
   - `TrChat`
   - `TrChat.Root + TrChat.Page`
   - `TrChat.Root + primitives`
2. no source file remains only to preserve scaffold-era or compatibility-era behavior
3. `src/legacy/*` is gone
4. compatibility-only helper surfaces are either:
   - promoted into the supported package surface with explicit docs and tests
   - or deleted together with their dedicated tests
5. outdated unit and e2e cases are removed only after boundary handoff or explicit contract drop
6. package README, docs site, demo scenes, and retained tests all describe the same official usage model
7. the retained validation baseline stays green

## Current Residual Surface

Read this together with:

- `./legacy-surface-inventory.md`
- `./test-boundary-baseline.md`

At the current point in cleanup, the remaining non-closed surfaces are:

| Area | Current state | Why it still exists |
| --- | --- | --- |
| provider/comparison helper surfaces | `delete-later` | still public or still tested, but no longer part of the main refactor contract |
| mixed e2e `adapt` group | `delete-later` | still useful coverage, but not yet clean official-path gate |
| secondary package-local legacy sentinels | `delete-later` | still attached to helper/config projection surfaces that have not yet been removed |

## Guardrails

Two rules stay fixed for every deletion slice:

1. delete outdated tests, not outdated boundaries
2. every legacy deletion must satisfy one of these first:
   - the same boundary is already covered by an official-path test
   - the boundary has been explicitly removed from the supported contract

Never delete a file just because it looks old if it still carries one of the official ladder paths.

## Required Validation Gate

Before deleting implementation-side compatibility code, keep this hard gate green:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

When a slice changes entry wiring, visible behavior, or helper scenes, also rerun the retained Playwright gate:

- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/workspace-slots.spec.ts src/chat/scenario-specs/renderer-registry.spec.ts`

When a slice changes helper/comparison scenes, slot passthrough, or remaining compatibility proofs, also rerun the current closure batch:

- `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/mcp-feature.spec.ts src/chat/scenario-specs/message-transforms.spec.ts`

If the environment hits the known Playwright `EPERM: lstat C:\Users\SonyLeo` issue, rerun the same retained batch outside the sandbox instead of changing the scope of the gate.

## Recommended Sequence

### Stage 1: Finish Boundary Handoff

Status:

- completed

Goal:

- remove ambiguity about which remaining compatibility-only boundaries are still real

Work:

- finish handoff or explicit contract drop for the remaining `edge-overrides` holdouts:
  - `senderActions.wordCount = false`
  - `senderActions.voice = false`
  - explicit close composition
- move any still-valid user-facing boundary into:
  - an official-path e2e scene
  - or a package-local mounted/runtime proof
- record every drop in:
  - `test-boundary-baseline.md`
  - `legacy-surface-inventory.md`

Exit criteria:

- `edge-overrides.spec.ts` no longer protects anything without a documented successor or drop

### Stage 2: Retire `rootBridge`

Status:

- completed

Goal:

- remove the last runtime-to-legacy bridge file

Work:

- inventory every remaining consumer of `createLegacyRootBridge(...)`
- replace bridge-provided fields with direct owner-aligned inputs:
  - page inputs
  - runtime-backed attachments helper
  - provider-facing props
  - fallback `chatKit` behavior if it is still truly needed
- remove `rootBridge.ts`
- update the nearest runtime, source-contract, and mounted tests rather than preserving bridge-shaped proof

Questions to resolve during this stage:

- should fallback `chatKit` stay as a formal helper path, move elsewhere, or retire with the bridge
- which provider-facing props still need a compatibility shape after the bridge is gone

Exit criteria:

- `src/legacy/rootBridge.ts` is deleted
- `TrChat.Root`, `Root + Page`, and `Root + primitives` still pass the hard gate

### Stage 3: Decide Provider/Comparison Helper Fate

Status:

- active next slice

Goal:

- stop carrying helper surfaces in an undecided state

Work:

- audit helper/public surfaces that are not part of the official user ladder
- for each one, choose exactly one:
  - `promote`
  - `delete`
- if promoted:
  - document it in `packages/chat/README.md`
  - keep dedicated tests
- if deleted:
  - remove the implementation and the tests that only protect it

Likely files involved:

- provider/comparison helper source
- `tests/runtime/provider-chat-kit.test.mjs`
- `tests/config/*` files that only exist for old projection/helper paths
- `provider-helper-decision-baseline.md`

Exit criteria:

- helper surfaces are no longer “temporary but public”

### Stage 4: Retire Obsolete Test Fixtures And Scenes

Goal:

- make the test suite describe the new package shape instead of dragging legacy scenes forever

Work:

- move remaining `adapt` e2e specs into one of:
  - retained official gate
  - retired/deleted
- delete old scenes and fixture helpers once no retained spec still uses them
- retire package-local secondary legacy sentinels when their target implementation is gone

Delete rule:

- do not keep a legacy spec alive after its implementation surface is removed
- do not delete a legacy spec until a handoff or contract drop is recorded

Exit criteria:

- `packages/test/src/chat` no longer has a mixed “official vs legacy” identity
- package-local test folders no longer contain helper/config tests with no surviving implementation target

### Stage 5: Final Surface Cleanup

Goal:

- align source, docs, demos, and tests around the same final package story

Work:

- remove stale references to bridge-era or helper-era surfaces from:
  - `packages/chat/README.md`
  - docs site pages under `docs/src/components/`
  - demo scenes/config helpers
  - process docs that still speak about temporary legacy surfaces
- rerun the retained validation baseline
- write a final cleanup history entry that marks legacy retirement complete

Exit criteria:

- docs, demos, and retained tests all describe the same final usage model

## Suggested Slice Backlog

If this roadmap is executed as slices, the clean sequence is:

1. `post-closure-provider-helper-decision`
2. `post-closure-legacy-test-retirement`
3. `post-closure-final-surface-cleanup`

These should be opened one at a time.
Do not reopen the old post-closure slices once a new one starts.

## What Does Not Belong In This Roadmap

These are separate tasks and should not block legacy retirement:

- deferred standalone page-level `footer` replace-slot publishing semantics
- new feature work
- re-expanding old `ChatConfig` compatibility

## Completion Checklist

Use this before claiming full retirement:

- [x] `rootBridge.ts` is gone
- [x] no `src/legacy/*` file remains
- [ ] helper surfaces are explicitly either supported or deleted
- [ ] package-local legacy-only tests are removed
- [ ] legacy-only e2e scenes/specs are removed or retired
- [ ] official-path gate is green
- [ ] package README, docs pages, demo routes, and tests agree on the final usage model
- [ ] final retirement history has been written

For the live progress bar against those remaining items, use:

- `./full-cutover-closure-checklist.md`
