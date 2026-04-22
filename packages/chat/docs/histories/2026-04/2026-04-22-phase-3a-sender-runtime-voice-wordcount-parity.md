## [2026-04-22 10:35] | Task: phase 3a sender runtime voice wordcount parity

### Why Now

`Phase 2` has closed the blackbox entry matrix, so the next highest-value parity gap is sender ownership. The execution contract already assigns `sender voice / wordCount` to `config.sender.*`, but the default owner path was still relying on legacy `senderActionsFeature` fallback for those affordances.

### Files Changed

- `packages/chat/src/types/root.ts`
- `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
- `packages/chat/src/components/core/ChatSender.vue`
- `packages/chat/tests/_stubs/tiny-robot.mjs`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/exec-plans/active/2026-04-21-phase-3a-message-and-sender-parity-baseline.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- runtime:
  `sender runtime.defaults` now includes `voice` alongside `placeholder / mode / maxLength / wordCount`
- config:
  `TrChatSenderConfig` now matches the documented `voice` owner path instead of leaving voice stranded in legacy sender-actions feature config
- page / primitive owner path:
  default `ChatSender` now prefers runtime-owned defaults before scaffold `senderActionsFeature` fallback
- docs:
  sender defaults ownership and current bridge notes are backwritten

### Changes Overview

- Main implementation result:
  - `createRuntimeFromConfig(config)` now projects `config.sender.voice` into `sender runtime.defaults`
  - `ChatSender` now consumes runtime-owned sender defaults first for `mode`, `placeholder`, `maxLength`, `wordCount`, and `voice`
  - legacy `senderActionsFeature` remains compatibility fallback, not the default owner path
- Main docs result:
  - `api-runtime.md`, `config-bridge-matrix.md`, and `alignment-tracker.md` now reflect the landed sender parity slice

### Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all commands passed

### Drift From Plan Or Review

- What drifted:
  - the active Phase 3A baseline slice landed as a focused sender parity cut before broader message parity work
- Why:
  - `voice / wordCount` were the clearest owner mismatch between the frozen contract and the actual default owner path
- Backwrite status:
  - completed

### Known Limits

- `senderActionsFeature` still exists as compatibility fallback for legacy paths.
- This slice does not close attachments, message actions, feedback, renderers, or transforms parity yet.

### Follow-ups

- Continue Phase 3A with the next highest-value message or sender parity slice.
- Keep later sender work moving into runtime ownership instead of re-widening feature-first fallback.
