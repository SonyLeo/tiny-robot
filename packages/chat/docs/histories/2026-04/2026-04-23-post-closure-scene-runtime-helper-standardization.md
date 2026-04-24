# Post-Closure Scene Runtime Helper Standardization

Date: 2026-04-23

## Summary

Standardized `packages/test/src/chat/scenarios/*.vue` runtime resolution onto one shared helper instead of mixing `computed(() => createRuntimeFromConfig(...))` with scene-local watcher variants.

## What Landed

- Added:
  - `packages/test/src/chat/scenarios/useStableSceneRuntime.ts`
- Updated scenes to consume the shared helper:
  - `WhiteboxScene.vue`
  - `GranularScene.vue`
  - `SurfaceApiScene.vue`
  - `SenderExtensionsScene.vue`
  - `MessageTransformsScene.vue`
  - `WelcomePromptsScene.vue`
  - `RendererRegistryScene.vue`
  - `LayoutConfigScene.vue`
- Updated:
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

## Why

- keep retained smoke/scenario scenes on one stable runtime-bootstrap path
- avoid reintroducing the earlier split between stable `shallowRef + watch` scenes and unstable `computed(runtime)` scenes
- make future scene cleanup easier by centralizing the runtime-resolution pattern

## Validation

- `pnpm.cmd -F tiny-robot-test build`
- `node packages/chat/scripts/check-refactor-docs.mjs`
