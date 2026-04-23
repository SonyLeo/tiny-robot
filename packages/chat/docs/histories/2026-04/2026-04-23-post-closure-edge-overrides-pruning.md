# 2026-04-23 Post-Closure Edge Overrides Pruning

## Summary

Landed the first real delete-now cleanup batch by pruning the edge compatibility scene and spec down to only the boundaries that still lack an official-path successor or an explicit contract drop.

## What Landed

- deleted already-handed-off branches from `packages/test/src/chat/edge-overrides.spec.ts`:
  - edge `senderProps.maxLength`
  - edge `roleConfigs` placement override
  - edge header/footer extra slot rendering
- simplified `packages/test/src/chat/scenarios/BlackboxEdgeScene.vue` so it no longer carries:
  - edge `senderProps.maxLength`
  - edge placement override via `presetOverrides.roleConfigs`
  - edge header/footer extra slot fixtures
  - edge attachments feature wiring that only existed to support the already-dropped upload-disable expectation
- kept only the remaining unresolved compatibility boundaries:
  - senderActions `wordCount` disable
  - senderActions `voice` disable
  - explicit close-button composition

## Why It Matters

- cleanup has now moved from boundary planning into actual compatibility-code deletion
- the retained official-path gate is already strong enough to let old branches disappear immediately once their handoff is closed
- later delete-now slices can now follow the same pattern on entry and bridge code instead of preserving entire old scenes after most of their boundaries are already gone

## Validation

- `pnpm.cmd -F tiny-robot-test test -- src/chat/edge-overrides.spec.ts src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts`

## Follow-ups

- inventory the next delete-now layer under `packages/chat/src/components/core/Chat.vue`, `packages/chat/src/runtime/config/blackboxEntry.ts`, and `packages/chat/src/legacy/*`
- either hand off or explicitly drop the remaining close-button composition proof before retiring `edge-overrides.spec.ts` completely
