# 2026-04-24 Post-Closure TrChat Config Runtime Continuity Guard

## Summary

Closed `G-001` from the post-closure test-gap backlog by landing a package-local
guard for `TrChat` config-entry runtime continuity.

## What Changed

- added `src/runtime/config/useTrChatConfigRuntimeResolution.ts`
- updated `src/components/core/Chat.vue` to use the new helper instead of
  directly recreating runtime state inside the component
- added `tests/runtime/trchat-config-runtime-resolution.test.mjs`
- extended `tests/runtime/blackbox-entry.test.mjs` with a stable-cache-key proof
- updated `tests/contracts/public-surface.test.mjs` to follow the new
  `TrChat config` helper naming and to drop one stale string-level assertion

## Why

The April 23 regression showed that `TrChat` could lose core flow continuity if
equivalent config values caused runtime recreation.

This slice adds the nearest package-local guard for that path and keeps the new
source naming explicit:

- `TrChat config` entry
- not an unexplained internal `blackbox` helper name

## Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
