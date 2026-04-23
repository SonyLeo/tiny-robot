# 2026-04-23 Post-Closure Official Handoff Batch 2

## Summary

Expanded the post-closure official-path handoff batch so cleanup can keep more functional boundaries on the new owner-aligned paths before deleting compatibility code.

## What Landed

- repaired `ui.welcome.prompts` projection on the official default page path by passing welcome prompts through:
  - `packages/chat/src/legacy/rootBridge.ts`
  - `packages/chat/tests/integration/root-page-mounted.test.mjs`
- kept `scenario-specs/welcome-prompts.spec.ts` on the official path instead of retiring it as pseudo-legacy coverage
- adapted `sender-actions.spec.ts` so it now proves official sender defaults on:
  - `TrChat`
  - `TrChat.Root + TrChat.Page`
- added an official granular `footer-right` suppression proof in:
  - `packages/test/src/chat/scenarios/SurfaceApiScene.vue`
  - `packages/test/src/chat/scenario-specs/surface-api.spec.ts`
- kept compatibility-only `wordCount` and `voice` senderActions overrides in `edge-overrides.spec.ts` temporarily, but explicitly dropped the old `senderActions.upload = false` expectation when an attachments owner is still present
- updated process docs and README so the second handoff batch is recorded consistently

## Why It Matters

- the cleanup gate now protects more real user boundaries before the first delete-now batch starts
- the repository no longer has to choose between deleting old tests too early and preserving stale compatibility assumptions
- this slice closed a real contract drift: `ui.welcome` was already admitted into the official path, but its prompt list had not actually been projected through the default page owner chain

## Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts src/chat/edge-overrides.spec.ts src/chat/scenario-specs/surface-api.spec.ts`

## Follow-ups

- use the expanded handoff batch together with the first promoted Playwright gate before deleting the first batch of compatibility-only code
- keep mapping old e2e boundaries one by one instead of deleting scenes without a surviving official-path proof or an explicit contract drop
