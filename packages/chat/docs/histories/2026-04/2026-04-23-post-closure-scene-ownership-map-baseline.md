# Post-Closure Scene Ownership Map Baseline

Date: 2026-04-23

## Summary

Made the retained `packages/test/src/chat/scenarios/*.vue` ownership map explicit so later cleanup work does not guess which scene fixtures are safe to merge or retire.

## What Landed

- Added a new `Scene Ownership And Reuse Map` section to:
  - `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- Updated:
  - `packages/test/src/chat/README.md`
  - `packages/chat/docs/refactor/process/alignment-tracker.md`

## Current Conclusion

- `BlackboxScene.vue`, `WhiteboxScene.vue`, and `GranularScene.vue` are shared official root scenes for the smoke gate.
- `SurfaceApiScene.vue` is a shared advanced/leaf-composition fixture that is still consumed by more than one retained spec.
- Every remaining feature scene is still consumed by a dedicated retained scenario spec.
- There is currently no orphan retained scene fixture that can be deleted outright without first rewriting its consuming spec.

## Validation

- `node packages/chat/scripts/check-refactor-docs.mjs`
