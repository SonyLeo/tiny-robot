# Post-Closure Scene Welcome Helper Standardization

Date: 2026-04-23

## Summary

Standardized repeated scene-local welcome/message-list visibility checks onto one shared helper.

## What Landed

- Added:
  - `packages/test/src/chat/scenarios/useSceneWelcomeState.ts`
- Updated retained scenes to consume the helper:
  - `GranularScene.vue`
  - `SenderExtensionsScene.vue`
  - `LayoutConfigScene.vue`
  - `SurfaceApiScene.vue`
- Updated:
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

## Why

- reduce repeated `messages.value.length === 0` scene branches
- keep retained scene support surfaces explicit and shared
- make later scene cleanup more mechanical and less error-prone

## Validation

- `pnpm.cmd -F tiny-robot-test build`
- `node packages/chat/scripts/check-refactor-docs.mjs`
