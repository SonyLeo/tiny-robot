## [2026-04-23 23:05] | Task: post-closure owner-input tightening

### Why Now

The scaffold-surface-removal slice had already removed `TrChat` scaffold fallback and the explicit scaffold helper surface, but official-path primitives still read `useChatScaffoldContext()`. This task closed that consumer-side gap before any deeper bridge retirement.

### Files Changed

- `packages/chat/src/components/core/ChatLayout.vue`
- `packages/chat/src/components/core/ChatHeader.vue`
- `packages/chat/src/components/core/ChatMessageList.vue`
- `packages/chat/src/components/core/ChatSender.vue`
- `packages/chat/src/components/core/ChatWelcome.vue`
- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/model-selector/ModelSelector.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/contracts/renderer-registry.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
- `packages/chat/docs/exec-plans/completed/2026-04-23-post-closure-owner-input-tightening.md`

### Contracts Touched

- runtime / root / page / slot / config / docs:
  - official-path primitives now consume `page inputs`, runtime-owned defaults, or explicit props instead of `useChatScaffoldContext()`
  - `page inputs` now behave as first-class owner inputs even on granular `Root + primitives` compositions

### Changes Overview

- Main implementation result:
  - `ChatLayout`, `ChatHeader`, `ChatMessageList`, `ChatWelcome`, `ChatHistory`, and `ModelSelector` now fall back to `useChatPageInputs()` instead of scaffold slices.
  - `ChatSender` no longer reads scaffold sender slices and stays on runtime-owned sender defaults plus surviving attachment/sender feature inputs.
  - the mounted granular proof now omits explicit welcome/layout handoff and still renders the expected owner defaults.
- Main docs result:
  - the legacy inventory now marks official-path scaffold-context consumers as already pruned
  - the tracker now points the next optional cleanup at bridge retirement instead of consumer replacement
  - the test-boundary baseline now records the strengthened mounted owner proof

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - the slice also corrected the semantics of `page inputs` fallback so it is no longer gated behind scaffold-era compatibility toggles
- Why:
  - once `page inputs` became the frozen owner boundary, treating them like compatibility relay would have kept granular official paths artificially coupled to scaffold-era semantics
- Backwrite status:
  - reflected in the completed plan, tracker, inventory, test-boundary baseline, and `EXPERIENCE_LOG.md`

### Known Limits

- `src/legacy/rootBridge.ts` and `runtimeHints.ts` still remain because they continue to provide `CHAT_PAGE_INPUTS_KEY`, provider props, and fallback `chatKit` shape for the official owner ladder.
- `CHAT_SCAFFOLD_KEY` is now effectively internal delete-later surface, but it was not retired in this slice.

### Follow-ups

- if cleanup continues, start from retiring `rootBridge`, `runtimeHints`, and the remaining internal scaffold provision
- keep the reduced compatibility-only edge proofs and helper surfaces as their own later cleanup theme
