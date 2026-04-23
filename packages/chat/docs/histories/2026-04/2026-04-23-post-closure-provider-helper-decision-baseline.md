## [2026-04-23 03:05] | Task: post-closure provider helper decision baseline

### Why Now

After scaffold fallback, scaffold helper exports, `rootBridge`, and the last `src/legacy/*` file were all removed, the remaining unresolved cleanup question was no longer architecture. It was helper fate: which public provider/comparison helpers still deserve to survive, and which ones should keep moving toward retirement.

### Files Changed

- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/README.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/refactor/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/AGENTS.md`

### Contracts Touched

- process / cleanup:
  - the next cleanup frontier is now split into concrete helper clusters instead of the vague label “provider/comparison helper surfaces”
  - the package now has an explicit recommendation baseline for which helper families should be promoted versus retired

### Changes Overview

- Main process result:
  - created `provider-helper-decision-baseline.md`
  - recommended promoting the bounded advanced/provider-aligned helpers:
    - `TrChat.Provider` via the `responseProvider` branch
    - `useMcpManager`
    - `useChatAttachments`
  - recommended retiring the comparison-era helper families:
    - provider `chatKit` injection
    - `useChatKit`
    - `TrChatHistorySurface`
    - `loadChatConfig`
    - `createChatAdapterFromConfig`
    - `createPresetChatProps`
    - `createPresetChatSlices`
- Main routing result:
  - docs map, source-of-truth map, and package AGENTS routing now all point to the new decision baseline

### Validation

- Commands:
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - passed

### Drift From Plan Or Review

- What drifted:
  - this slice stayed documentation-only instead of deleting any helper code.
- Why:
  - the purpose of the slice is to remove ambiguity first so the next implementation slice can delete helper surfaces from an explicit baseline instead of from intuition.

### Known Limits

- this slice does not yet delete `useChatKit`, config-projection helpers, or comparison-heavy scenes
- it also does not yet narrow `TrChat.Provider` to the recommended `responseProvider`-first supported story

### Follow-ups

- if cleanup continues, the next implementation slice should start from the promoted-vs-retired split in `provider-helper-decision-baseline.md`
- after that, retire the old helper-specific tests and comparison scenes that only exist to protect the retired branches
