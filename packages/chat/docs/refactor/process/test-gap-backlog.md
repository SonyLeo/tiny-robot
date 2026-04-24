# Chat Test Gap Backlog

Status: active working backlog.

This file turns the current test audit into a concrete landing queue.

Use it together with:

- `./test-governance-standard.md`
  for the lasting layer rules
- `./test-boundary-baseline.md`
  for the current retained gate and handoff policy
- `./test-suite-audit-baseline.md`
  for the file-level inventory behind each backlog item

This file answers one narrower question:

- what missing coverage or suite-normalization work should land next?

It should stay concrete.
If an item is not backed by the current audit, recent regression evidence, or an explicit supported-path gap, it does not belong here.

## Prioritization Rules

Use this order when pulling the next item:

1. protect the official entry ladder first:
   `TrChat`, `TrChat.Root + TrChat.Page`, `TrChat.Root + primitives`
2. prefer nearest-owner proof before broader browser duplication
3. fill supported-path gaps before retiring more old helpers, tests, or scenes
4. treat bounded advanced surfaces such as `TrChat.Provider` with `responseProvider` as lower priority than official-path regressions, but higher priority than broad support-surface cleanup

## Active Backlog

| ID | State | Priority | Area | Path | Gap | Evidence Now | Proposed Landing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `G-001` | `done` | `P0` | package-local hard gate | `TrChat` | add a nearest-owner regression guard for `TrChat` config-entry runtime continuity so local UI state changes do not accidentally recreate the runtime and drop message flow | the April 23 regression first surfaced through `model-switch.spec.ts`; current package-local runtime/integration tests prove entry classification and mounted handoff, but they did not pin `Chat.vue` against same-config runtime churn | completed through `src/runtime/config/useTrChatConfigRuntimeResolution.ts` and `tests/runtime/trchat-config-runtime-resolution.test.mjs`, plus the source-contract update in `contracts/public-surface.test.mjs` |
| `G-002` | `done` | `P0` | retained e2e | `Root + primitives` | add browser-level request lifecycle and feedback proof for the official granular path | the gap is now closed: `request-lifecycle.spec.ts` covers granular abort/optimistic/retry, `feedback.spec.ts` covers granular assistant feedback visibility, and `GranularScene.vue` now mounts the feedback after-slot explicitly on the official leaf-composition path | completed through retained granular smoke additions plus the `TrChatFeedback` handoff in `packages/test/src/chat/scenarios/GranularScene.vue` |
| `G-003` | `done` | `P1` | retained e2e | `Root + primitives` | add browser-level attachments proof for the official granular path | the gap is now closed: `attachments.spec.ts` covers upload visibility, pending attachment rendering, send clearing, and new-chat clearing on the retained granular route | completed through retained granular smoke additions in `packages/test/src/chat/attachments.spec.ts` |
| `G-004` | `done` | `P1` | package-local hard gate | retained advanced `TrChat.Provider` with `responseProvider` | add a nearest-owner mounted proof for the retained advanced provider surface | the gap is now closed: `integration/root-page-mounted.test.mjs` mounts `TrChat.Provider` directly and proves the supported leaf-composition contract without depending on browser routing | completed through the new mounted provider proof in `packages/chat/tests/integration/root-page-mounted.test.mjs` |

## Normalization Follow-Ups

These are not the next missing-coverage blockers, but they should follow once the active gaps above are closed.

| ID | State | Priority | Area | Goal | Why It Waits |
| --- | --- | --- | --- | --- | --- |
| `N-001` | `done` | `P2` | smoke-suite support | thin repeated chat-entry and mode-open boilerplate in smoke specs without changing gate semantics | the normalization is now complete: retained smoke specs share one helper for entering the chat app and switching into `TrChat`, `Root + Page`, or `Root + primitives`, while keeping the same assertions and gate commands; the helper now supports both `demo-nav` and `component-test` entry variants | completed through `packages/test/src/chat/scenario-specs/openChatSmokeScene.ts` plus the smoke-spec rewrites onto that helper |
| `N-002` | `done` | `P2` | file placement | consolidate retained Playwright specs under `scenario-specs/` so `packages/test/src/chat` stays support-first at the top level | the file-placement cleanup is now complete: smoke specs and `sender-actions.spec.ts` live under `scenario-specs/`, and the gate commands/docs now point at the new paths | completed by moving the retained Playwright specs into `packages/test/src/chat/scenario-specs/` and updating the frozen gate scripts/docs |

## Pull Order

Until a stronger blocker appears, pull the next items in this order:

1. next normalization or retirement slice should be chosen from the current audit instead of this backlog

## Done Rule

An item is done only when:

1. the successor test is landed
2. the nearest required gate is green
3. the relevant inventory docs are updated

Do not mark an item done just because a note was added to the tracker.
