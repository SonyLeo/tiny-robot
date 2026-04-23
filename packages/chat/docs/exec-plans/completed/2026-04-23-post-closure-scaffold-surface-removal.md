# Post-Closure Scaffold Surface Removal

Status: completed.

## Goal

Remove the remaining scaffold fallback and explicit scaffold helper surface from `TrChat`, while keeping the current official owner-aligned paths functional:

- `TrChat`
- `TrChat.Root + TrChat.Page`
- `TrChat.Root + primitives`

## Scope

- In scope:
  - remove `TrChat`'s remaining `ChatScaffold` fallback branch
  - remove the public `TrChat.Scaffold` / `TrChatScaffold` helper surface
  - retire scaffold-only types and tests that only existed to support that helper surface
  - tighten blackbox `TrChat` to the current official target-config contract
  - hand off or retire affected e2e and doc examples so the same functional boundaries stay covered on official paths
- Out of scope:
  - retiring `src/legacy/rootBridge.ts` or `runtimeHints.ts`
  - removing remaining official-path `useChatScaffoldContext()` reads
  - deferred standalone page-level `footer` replace-slot publishing semantics

## Frozen Inputs

- Development-stage assumption:
  - preserve official functionality, not scaffold compatibility
- Current official entry ladder:
  - `TrChat`
  - `TrChat.Root + TrChat.Page`
  - `TrChat.Root + primitives`
- Temporary internal keepers:
  - `src/legacy/rootBridge.ts`
  - `src/legacy/runtimeHints.ts`
  - current official-path `useChatScaffoldContext()` consumers

## Relevant Source Docs

- `packages/chat/README.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/components/core/Chat.vue`
  - `packages/chat/src/components/core/ChatScaffold.vue`
  - `packages/chat/src/runtime/config/blackboxEntry.ts`
  - `packages/chat/src/runtime/scaffold/**/*`
  - `packages/chat/src/index.ts`
  - `packages/chat/src/types/**/*`
  - `packages/chat/tests/**/*`
  - `packages/test/src/chat/**/*`
  - `packages/chat/README.md`
  - `docs/src/components/chat*.md`

## Work Breakdown

### 1. Tighten The Public Entry

- remove `ChatScaffold` fallback from `TrChat`
- remove `TrChat.Scaffold` / `TrChatScaffold`
- keep blackbox `TrChat` on target `TrChatConfig` only

### 2. Retire Scaffold Helper Code

- delete `ChatScaffold.vue`
- delete scaffold-only runtime helpers and tests
- keep provider helper code only if it still backs `TrChat.Provider`

### 3. Handoff Or Retire Affected Boundaries

- migrate surviving functional boundaries onto:
  - `TrChat`
  - `TrChat.Root + TrChat.Page`
  - `TrChat.Root + primitives`
  - `TrChat.Provider`
- retire only the boundaries that were scaffold-only by definition

## Exit Criteria

- [x] `TrChat` no longer falls back to `ChatScaffold`
- [x] `TrChat.Scaffold` / `TrChatScaffold` are no longer exported
- [x] scaffold-only runtime/type/test surfaces are removed or internalized
- [x] official-path tests and retained e2e gates cover the surviving boundaries
- [x] tracker, inventory, docs, and history match the new public story

## Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- targeted retained Playwright specs under `packages/test/src/chat`
- `node packages/chat/scripts/check-refactor-docs.mjs`
