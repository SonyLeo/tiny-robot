# Post-Closure Owner Input Tightening

## Goal

Replace the remaining official-path `useChatScaffoldContext()` reads with page-input or runtime-first owner inputs so the bridge keeps shrinking instead of staying silently load-bearing.

## Scope

- In scope:
  - official-path consumers that can already read `CHAT_PAGE_INPUTS_KEY` or runtime-owned defaults
  - source-contract and mounted proof updates for the tightened owner boundary
  - process backwrite for the reduced scaffold-context inventory
- Out of scope:
  - deleting `src/legacy/rootBridge.ts` or `runtimeHints.ts`
  - removing every compatibility-only edge proof
  - redesigning standalone `footer` publishing semantics

## Frozen Inputs

- Review / phase gate:
  - post-closure cleanup is already open and the blackbox contract has been tightened
- Contract freeze:
  - official package entry ladder remains `TrChat`, `TrChat.Root + TrChat.Page`, and `TrChat.Root + primitives`
  - deletion work may remove stale compatibility code, but not official-path functionality
- Required source docs:
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/core/ChatLayout.vue`
  - `packages/chat/src/components/core/ChatHeader.vue`
  - `packages/chat/src/components/core/ChatMessageList.vue`
  - `packages/chat/src/components/core/ChatSender.vue`
  - `packages/chat/src/components/core/ChatWelcome.vue`
  - `packages/chat/src/components/history/ChatHistory.vue`
  - `packages/chat/src/components/model-selector/ModelSelector.vue`
  - `packages/chat/tests/contracts/public-surface.test.mjs`
  - `packages/chat/tests/integration/root-page-mounted.test.mjs`
- Intended ownership:
  - remove official-path reads of `useChatScaffoldContext()`
  - prefer `useChatPageInputs()` or runtime-owned defaults
  - leave bridge provision in place until a later slice retires it
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - granular `Root + primitives` compositions may still depend on implicit welcome/layout/model fallbacks
- Mitigation:
  - add or tighten mounted proof that omits page-layer relay and still renders the expected official defaults

## Exit Criteria

- [x] official-path scaffold-context reads are removed for this slice's components
- [x] targeted tests pass
- [x] docs stay aligned
- [x] drift is recorded

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - `TrChat.Root + TrChat.Page` still renders owner defaults
  - `TrChat.Root + primitives` still renders welcome/message/layout defaults without scaffold-context reads
- Contract evidence:
  - `public-surface.test.mjs`
  - `root-page-mounted.test.mjs`

## Decision Log

- 2026-04-23:
  - Start from owner-input tightening rather than deleting `rootBridge` directly.
  - Remove easy official-path scaffold-context consumers first; deeper bridge retirement stays for a later slice.

## Drift Backwrite

- What changed from the original slice:
  - the slice also removed scaffold-era compatibility gating from page-input fallback itself; `page inputs` now behave as official owner inputs instead of acting like another compatibility relay
- Which source docs need follow-up:
  - none beyond the tracker, inventory, test-boundary baseline, and history backwrite landed in this slice
