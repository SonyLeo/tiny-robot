# Chat Test Boundary Baseline

Status: active post-closure process baseline.

This file fixes which tests protect the official chat package paths during post-closure cleanup.

It exists so legacy pruning can start from a stable baseline instead of rediscovering test scope on every slice.

For the remaining implementation-side inventory after the first delete-now batches, also see:

- `./legacy-surface-inventory.md`

## Role

Use this file to answer:

- which tests are the hard gate before deleting compatibility code
- which tests are still useful but are not the primary deletion gate
- which e2e cases must be adapted before they can guard the official path
- which e2e cases only preserve legacy compatibility and should retire from the primary gate

This file does not define runtime, slot, or page contract.
Those still belong to:

- `../design/api-runtime.md`
- `../design/execution.md`

## Official Gate Surfaces

The post-closure cleanup gate is built around the same three official entry levels as `packages/chat/README.md`:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

If a test does not help prove one of these three official paths, it should not block legacy deletion by default.

Outdated tests may be deleted, but only after one of these is true:

1. the same functional boundary is already proved through an official-path test
2. the boundary is explicitly removed from the supported contract

## Layer Split

### `packages/chat/tests`

This is the primary pre-delete gate.

Use it for:

- fast runtime and contract feedback
- mounted owner-path proof
- blackbox entry classification proof
- source-contract proof at the nearest owner boundary

Every legacy-pruning slice should keep this layer green.

### `packages/test/src/chat`

This is the slower user-path gate.

Use it for:

- user-visible end-to-end behavior
- blackbox and whitebox scene wiring
- full-page interaction flows
- regression proof after a deletion batch changes entry wiring or visible behavior

Current reality:

- this suite is still mixed with official-path coverage and legacy-oriented scenes
- it should not be treated as one undifferentiated hard gate
- retained official-path scenarios should be adapted first, then promoted into the cleanup gate

## Current `packages/chat/tests` Classification

### Hard Gate Now

These files directly protect the official owner-aligned paths and should stay green before deleting compatibility code:

| Area | Files | Why they stay hard-gate |
| --- | --- | --- |
| runtime entry and owner proof | `runtime/blackbox-entry.test.mjs`, `runtime/root-runtime.test.mjs`, `runtime/composables.test.mjs` | prove the tightened blackbox entry contract (`target TrChatConfig` plus serialized target config only), the absence of runtime legacy hints on the active bootstrap path, and runtime-owned request, conversation, sender, and workspace behavior |
| message extension proof | `runtime/message-actions.test.mjs`, `runtime/message-runtime.test.mjs`, `runtime/message-transforms.test.mjs`, `runtime/render-message-normalization.test.mjs` | prove message id, actions, renderer, transform, and normalized render behavior on the official runtime path |
| source contracts | `contracts/public-surface.test.mjs`, `contracts/renderer-registry.test.mjs`, `contracts/workspace-slot-contract.test.mjs`, `contracts/appearance-runtime.test.mjs`, `contracts/mcp-panel-positioning.test.mjs`, `contracts/theme-token-contract.test.mjs` | pin the public owner surface, region wiring, renderer ownership, theme tokens, MCP-facing affordances, and the absence of internal scaffold-context exports on the official bootstrap path |
| mounted owner-path proof | `integration/trchat-blackbox-root-page.test.mjs`, `integration/root-page-mounted.test.mjs` | prove `TrChat`, `Root + Page`, and mounted owner regions on the official path instead of only through documentation; post-closure cleanup now uses this layer to prove the config-only blackbox path, the surviving owner-aligned whitebox paths, and page-input-backed defaults on the granular `Root + primitives` route |

### Secondary Or Temporary Coverage

These files are still useful, but they are not the primary post-closure deletion gate:

| Area | Files | Current role |
| --- | --- | --- |
| config and preset legacy sentinels | `config/config-and-features.test.mjs`, `config/messages.test.mjs`, `config/preset-slices.test.mjs`, `config/provider-factories.test.mjs` | still useful while legacy entry/helper code survives, but not the first gate for owner-path cleanup |
| legacy helper/runtime sentinels | `runtime/provider-chat-kit.test.mjs` | keep as bounded helper coverage while provider/comparison helper deletion is still pending |
| ui context sentinel | `ui/chat-ui-context.test.mjs` | useful local proof, but lower priority than mounted owner-path and public-surface coverage |

These package-local secondary files are now part of post-closure cleanup scope:

- delete them when the helper, scaffold, or config-projection code they exclusively protect is deleted
- do not keep them alive after the associated compatibility-only implementation is removed

The concrete helper-side keep/delete recommendation now lives in:

- `./provider-helper-decision-baseline.md`

## Current `packages/test/src/chat` Classification

### Retained Official-Path Gate Now

These specs now follow the official entry ladder closely enough to act as the first promoted Playwright gate during post-closure cleanup:

| Status | Files | Why they now stay in the gate |
| --- | --- | --- |
| `gate` | `index.spec.ts`, `history.spec.ts`, `request-lifecycle.spec.ts` | these now exercise `TrChat`, `Root + Page`, and `Root + primitives` directly instead of treating helper-heavy blackbox/whitebox scenes as the default story |
| `gate` | `scenario-specs/workspace-slots.spec.ts`, `scenario-specs/renderer-registry.spec.ts` | these now verify official workspace-slot and renderer-registry behavior through target-config scenes instead of preset-slice or provider-heavy fixtures |

### Adapt Into The Official E2E Gate

These specs still verify behavior that matters after cleanup, but their scene setup or assertions must move toward the official entry ladder before they should block deletion:

| Status | Files | Why adaptation is needed |
| --- | --- | --- |
| `adapt` | `attachments.spec.ts`, `feedback.spec.ts`, `model-switch.spec.ts`, `sender-actions.spec.ts` | these still depend on top-level scenes that mix official-path assertions with helper-first fixture setup and need the same official-entry tightening as the first promoted batch |
| `adapt` | `scenario-specs/layout-config.spec.ts`, `scenario-specs/welcome-prompts.spec.ts`, `scenario-specs/mcp-feature.spec.ts`, `scenario-specs/message-transforms.spec.ts`, `scenario-specs/sender-extensions.spec.ts`, `scenario-specs/surface-api.spec.ts` | each scene now carries at least one owner-aligned official-path proof, but some still mix retained user behavior with `Provider` or comparison-oriented helper setup that should not become the primary cleanup gate automatically |

### Retire From The Primary Gate

There are currently no unresolved files in the primary `retire` bucket.
The old `edge-overrides.spec.ts` and `BlackboxEdgeScene.vue` pair is now fully retired after the last remaining boundaries were handed off.

Retired e2e should be removed from the default test app once no retained spec or helper still depends on their scene.
Retiring a test file is not enough by itself; every retired file should first be mapped to either:

- an official-path successor proof
- an explicit contract drop

## Boundary Handoff Matrix For Legacy-Oriented Specs

Use this matrix before deleting a legacy-oriented spec or scene.

| Legacy-oriented file | Boundary | Handoff status |
| --- | --- | --- |
| `scenario-specs/layout-config.spec.ts` | official content-layout and appearance-mode rendering | handed off to the same file after adapting it to `TrChat`, `Root + Page`, and `Root + primitives` with `ui.contentLayout` |
| `scenario-specs/layout-config.spec.ts` | old `layout.variant / placements` semantics | explicit contract drop; these remain fallback-only and are not part of the official gate |
| `scenario-specs/welcome-prompts.spec.ts` | official welcome prompt rendering, empty prompt state, prompt click transition, and `#welcome` slot replacement | handed off to the same file after adapting it to target `ui.welcome.prompts` on `TrChat` and `Root + Page` |
| `scenario-specs/welcome-prompts.spec.ts` | legacy `ui.prompts` replacement semantics | explicit contract drop; `ui.prompts` is no longer part of the official owner-path contract |
| `edge-overrides.spec.ts` | sender `maxLength` disable-without-truncation behavior | handed off to `sender-actions.spec.ts` on the official blackbox path and deleted from the edge scene/spec |
| `sender-actions.spec.ts` | official sender `maxLength`, `wordCount`, default upload action, and default voice action behavior | handed off to the same file after adapting it to `TrChat` and `Root + Page` |
| `sender-actions.spec.ts` | sender config semantics for `wordCount = false` and `voice.enabled = false` on the official granular path | handed off to the same file through the official `Root + primitives` sender-config scene |
| `sender-actions.spec.ts` | compatibility `senderActions.upload = false` while an attachments owner is still present | explicit contract drop; runtime-first sender + attachments ownership now leaves upload visibility with the attachments owner instead of the old senderActions compatibility branch |
| `sender-actions.spec.ts` | custom `footer-right` suppression of default sender actions | handed off to `scenario-specs/surface-api.spec.ts` on an official `Root + primitives` granular footer-right surface |
| `edge-overrides.spec.ts` | header extra / footer extra slot rendering | already covered by `scenario-specs/surface-api.spec.ts` and deleted from the edge scene/spec |
| `edge-overrides.spec.ts` | edge-only role-placement overrides | explicit contract drop; old placement override semantics are no longer part of the official contract and no longer block cleanup |
| `edge-overrides.spec.ts` | explicit close-button composition | handed off to `scenario-specs/surface-api.spec.ts` on an official leaf-composition granular close scene |

## Immediate Gate Policy

Until the retained Playwright specs are adapted to the official ladder:

1. every cleanup slice must keep the hard-gate subset in `packages/chat/tests` green
2. any slice that changes visible user behavior should adapt or rerun the nearest retained Playwright scenario before deleting the next layer
3. legacy-only Playwright coverage should not veto deletion by itself

## Current Validation Baseline

### Required Before Deletion

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

### Required When A Slice Touches Demo-Level Or User-Visible Flow

Run the nearest retained Playwright scenario after adapting it to the official ladder.

Current candidates to promote first:

- `src/chat/index.spec.ts`
- `src/chat/history.spec.ts`
- `src/chat/request-lifecycle.spec.ts`
- `src/chat/scenario-specs/workspace-slots.spec.ts`
- `src/chat/scenario-specs/renderer-registry.spec.ts`

These files are now the first promoted official-path Playwright gate and should be rerun first when a deletion slice changes entry wiring or visible behavior.

When a cleanup slice touches scaffold/helper entry wiring, slot passthrough, or provider/comparison helper scenes, also rerun the current closure batch:

- `src/chat/scenario-specs/layout-config.spec.ts`
- `src/chat/scenario-specs/welcome-prompts.spec.ts`
- `src/chat/sender-actions.spec.ts`
- `src/chat/scenario-specs/surface-api.spec.ts`
- `src/chat/scenario-specs/sender-extensions.spec.ts`
- `src/chat/scenario-specs/mcp-feature.spec.ts`
- `src/chat/scenario-specs/message-transforms.spec.ts`

## Change Rule

If a cleanup slice changes this classification:

1. update this file first
2. update `packages/test/src/chat/README.md`
3. update the active cleanup plan if the gate commands or promotion order changed
