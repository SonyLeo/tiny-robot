# Phase 3A Renderer Runtime Owner Fallback

## Task

Close the remaining Phase 3A renderer parity slice by proving that the nearest renderer owner path can read `runtime.message.config.renderers` without depending on page-input or scaffold relay.

## Why Now

Message-action fallback, feedback enablement fallback, and formal-path transform proof were already landed. Renderer parity was the last open message-extension slice that could still drift back toward prop relay or scaffold projection.

## Files Changed

- `packages/chat/src/components/core/ChatLayout.vue`
- `packages/chat/tests/_stubs/tiny-robot.mjs`
- `packages/chat/tests/runtime/root-runtime.test.mjs`
- `packages/chat/tests/contracts/renderer-registry.test.mjs`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/integration/root-page-mounted.test.mjs`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/execution.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

## Contracts Touched

- `ChatLayout` now falls back to `runtime.message.config.renderers` before scaffold relay when explicit `bubbleRenderers` props are absent.
- The mounted proof for renderer parity no longer relies on `Root + Page`, because `Root` bridge slices still also project renderer config. The stronger proof is a mounted `ChatLayout` that only receives `CHAT_RUNTIME_KEY`.
- The frozen default renderer ordering remains intact; runtime-owned renderer config only extends the configured bubble renderer matches.

## Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

## Drift From Plan/Review

- The slice started as a generic renderer parity closure, but the final proof was tightened to an isolated `ChatLayout` mounted case so the evidence would not be confounded by bridge-projected page inputs.

## Known Limits

- This slice closes renderer parity only. Sender plus attachments parity still needs its own dedicated Phase 3A hardening slice.

## Follow-ups

- Continue with `2026-04-22-phase-3a-sender-attachments-parity-hardening.md`.
