# Chat Test Suite Audit Baseline

Status: active working inventory.

This file is the file-level audit of the current chat test suites.

Use it together with:

- `./test-governance-standard.md`
  for the lasting design rules
- `./test-boundary-baseline.md`
  for the current gate policy and boundary handoff matrix
- `./test-gap-backlog.md`
  for the concrete missing-coverage and suite-normalization queue derived from this audit

This file answers one narrower question:

- where does every current test or test-support file belong right now?

It is intentionally more detailed and more inventory-like than `test-boundary-baseline.md`.

## Audit Fields

Each file is tagged with:

- `layer`
  runtime / contracts / integration / smoke / scenario / support
- `status`
  keep / adapt / retire / support
- `gate`
  hard / smoke / scenario / secondary / none
- `path`
  which official or retained advanced path it primarily protects

## `packages/chat/tests` Audit

### Runtime

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `runtime/trchat-config-entry.test.mjs` | runtime | keep | hard | `TrChat` | `TrChat` config-entry classification and target-config contract |
| `runtime/composables.test.mjs` | runtime | keep | hard | runtime-owned conversation/request/sender | core runtime flow proof, including first-send conversation creation and provider continuity |
| `runtime/message-actions.test.mjs` | runtime | keep | hard | runtime message extensions | built-in/custom message action ownership |
| `runtime/message-runtime.test.mjs` | runtime | keep | hard | runtime message identity | `messageId` view-state, edit, copy, retry bridge |
| `runtime/message-transforms.test.mjs` | runtime | keep | hard | runtime transforms | chunk/final transform semantics |
| `runtime/openai-compatible-transport.test.mjs` | runtime | keep | hard | transport factory | supported request transport and error surface |
| `runtime/provider-response-provider.test.mjs` | runtime | keep | hard | retained advanced `TrChat.Provider` | supported `responseProvider` branch only |
| `runtime/render-message-normalization.test.mjs` | runtime | keep | hard | runtime render messages | normalized render-message/source-message mapping |
| `runtime/root-runtime.test.mjs` | runtime | keep | hard | `Root + Page`, `Root + primitives` | root bootstrap, sender/history/model/runtime ownership |
| `runtime/trchat-config-runtime-resolution.test.mjs` | runtime | keep | hard | `TrChat` | same-config runtime continuity guard for the `TrChat` config entry |

### Contracts

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `contracts/appearance-runtime.test.mjs` | contracts | keep | hard | official display config | appearance/runtime contract alignment |
| `contracts/chat-messages.test.mjs` | contracts | keep | hard | shared copy contract | centralized text/messages contract |
| `contracts/chat-ui-context.test.mjs` | contracts | keep | hard | workspace UI context contract | narrow responsive-host/mobile shell behavior and reactive shell-sync proof for the official workspace path |
| `contracts/mcp-panel-positioning.test.mjs` | contracts | keep | hard | MCP UI contract | panel positioning and MCP-facing affordances |
| `contracts/public-surface.test.mjs` | contracts | keep | hard | public package surface | export contract and retired-surface proof |
| `contracts/renderer-registry.test.mjs` | contracts | keep | hard | renderer contract | runtime-owned renderer registry proof |
| `contracts/theme-token-contract.test.mjs` | contracts | keep | hard | appearance/theming | theme token contract |
| `contracts/workspace-slot-contract.test.mjs` | contracts | keep | hard | workspace slot contract | desktop/mobile slot rules and owner region inputs |

### Integration

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `integration/root-page-mounted.test.mjs` | integration | keep | hard | `Root + Page`, `Root + primitives`, retained advanced provider | mounted owner-path, granular composition, and retained `TrChat.Provider(responseProvider)` leaf-composition proof |
| `integration/trchat-entry-root-page.test.mjs` | integration | keep | hard | `TrChat` | `TrChat`-to-Root+Page handoff proof |

### Support Files

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `run-all.mjs` | support | support | none | n/a | package-local test runner |
| `_harness.mjs` | support | support | none | n/a | minimal runner/harness |
| `_helpers.mjs` | support | support | none | n/a | shared imports/helpers for package tests |
| `css-loader.mjs` | support | support | none | n/a | loader helper for style-bearing mounted tests |
| `_stubs/empty-module.mjs` | support | support | none | n/a | SSR/import stub |
| `_stubs/markstream-vue.mjs` | support | support | none | n/a | SSR/import stub |
| `_stubs/tiny-robot.mjs` | support | support | none | mounted contract proof | component stub used by package-local mounted tests |

## `packages/test/src/chat` Audit

### Smoke Specs

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `scenario-specs/index.spec.ts` | smoke | keep | smoke | entry ladder | top-level scene switching and official entry visibility |
| `scenario-specs/history.spec.ts` | smoke | keep | smoke | `TrChat` / Root + Page / granular | history, reset, mobile drawer, retained conversation flow |
| `scenario-specs/request-lifecycle.spec.ts` | smoke | keep | smoke | `TrChat` / Root + Page / granular | send, abort, retry, optimistic state, lifecycle logs, including retained granular request proof |
| `scenario-specs/attachments.spec.ts` | smoke | keep | smoke | `TrChat` / granular | upload, pending list, send/reset clearing on retained `TrChat` and granular paths |
| `scenario-specs/feedback.spec.ts` | smoke | keep | smoke | `TrChat` / Root + Page / granular | assistant feedback visibility and custom operations, including retained granular feedback proof |
| `scenario-specs/model-switch.spec.ts` | smoke | keep | smoke | `TrChat` / Root + Page | dropdown behavior, model switch continuity, provider alignment |

### Extended Flow Specs

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `scenario-specs/sender-actions.spec.ts` | scenario | keep | scenario | `TrChat` / Root + Page / granular | sender config and retained sender affordance proof |

### Scenario Specs

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `scenario-specs/layout-config.spec.ts` | scenario | keep | scenario | `TrChat` / Root + Page / granular | current display/layout contract only; old layout.variant/placements semantics already dropped |
| `scenario-specs/mcp-feature.spec.ts` | scenario | keep | scenario | retained advanced + granular | MCP trigger and panel behavior |
| `scenario-specs/message-transforms.spec.ts` | scenario | keep | scenario | `TrChat` / Root + Page / granular | visible transform behavior on official paths |
| `scenario-specs/renderer-registry.spec.ts` | scenario | keep | scenario | `TrChat` / Root + Page / granular | renderer registry in real browser flows |
| `scenario-specs/sender-extensions.spec.ts` | scenario | keep | scenario | granular + retained advanced provider | sender suggestion/extensibility flows |
| `scenario-specs/surface-api.spec.ts` | scenario | keep | scenario | official ladder + retained advanced provider | slots, provider branch, granular composition, runtime diagnostics |
| `scenario-specs/welcome-prompts.spec.ts` | scenario | keep | scenario | `TrChat` / Root + Page | prompt rendering, prompt send, welcome slot boundary |
| `scenario-specs/workspace-slots.spec.ts` | scenario | keep | scenario | `TrChat` workspace | slot/fallback behavior for desktop and mobile workspace regions |

### Support Specs / App Entrypoint

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `index.vue` | support | support | none | test app router | top-level demo/test-app entry, should stay thin |

### Shared Fixtures And Helpers

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `mockChatApiPlugin.ts` | support | support | none | request mocking | app-level transport stub for browser tests |
| `mockProvider.ts` | support | support | none | retained advanced provider | provider fixture for provider-branch scenes |
| `selectors.ts` | support | keep | none | shared locator contract | now narrowed to selectors used by the retained smoke/scenario gate; old workspace-shell-only selectors, the unused top-level surface-api switch selector, and zero-call convenience selectors have retired |
| `testHelper.ts` | support | keep | none | shared actions/waits | stays action-focused for the retained gate; old workspace-shell-only helpers, the unused top-level surface-api switch helper, and zero-call convenience assertions have retired |
| `scenario-specs/openChatSmokeScene.ts` | support | keep | none | smoke chat-entry bootstrap | shared smoke-only chat-entry and mode-switch helper for `TrChat` / `Root + Page` / `Root + primitives`, including both `demo-nav` and `component-test` entry variants |
| `README.md` | support | keep | none | suite guidance | suite-specific usage and routing |
| `scenarios/useStableSceneRuntime.ts` | support | keep | none | scene runtime bootstrap | shared stable runtime-resolution helper for scene-local `createRuntimeFromConfig(config)` usage |
| `scenarios/useSceneWelcomeState.ts` | support | keep | none | scene welcome visibility | shared welcome-state helper for retained scenes that gate between welcome and message-list regions |

### Scene Fixtures

| File | Layer | Status | Gate | Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `scenarios/officialSceneConfig.ts` | support | keep | none | shared official config | canonical scene config defaults |
| `scenarios/TrChatScene.vue` | support | keep | none | `TrChat` | official `TrChat` scene root |
| `scenarios/WhiteboxScene.vue` | support | keep | none | `Root + Page` | official whitebox scene root |
| `scenarios/GranularScene.vue` | support | keep | none | `Root + primitives` | official granular scene root |
| `scenarios/LayoutConfigScene.vue` | support | keep | none | feature scene | layout/display scene fixture |
| `scenarios/McpFeatureScene.vue` | support | keep | none | feature scene | MCP scene fixture |
| `scenarios/MessageTransformsScene.vue` | support | keep | none | feature scene | transform scene fixture |
| `scenarios/RendererRegistryScene.vue` | support | keep | none | feature scene | renderer scene fixture |
| `scenarios/SenderExtensionsScene.vue` | support | keep | none | feature scene | sender extension scene fixture |
| `scenarios/SurfaceApiScene.vue` | support | keep | none | feature + retained advanced scene | slot/provider/runtime diagnostics scene fixture |
| `scenarios/WelcomePromptsScene.vue` | support | keep | none | feature scene | welcome prompts fixture |
| `scenarios/WorkspaceSlotsScene.vue` | support | keep | none | feature scene | workspace slot fixture |

### Scene Ownership And Reuse Map

Use this map before touching `scenarios/*.vue`.
Its goal is to make the current reuse pattern explicit so future cleanup does not guess which scene is safe to merge or retire.

| Scene | Consuming specs | Role now | Retirement note |
| --- | --- | --- | --- |
| `TrChatScene.vue` | `scenario-specs/index.spec.ts`, `scenario-specs/history.spec.ts`, `scenario-specs/request-lifecycle.spec.ts`, `scenario-specs/attachments.spec.ts`, `scenario-specs/feedback.spec.ts`, `scenario-specs/model-switch.spec.ts`, `scenario-specs/sender-actions.spec.ts` | shared official `TrChat` root scene | do not retire or merge while the smoke gate still switches through the top-level router |
| `WhiteboxScene.vue` | `scenario-specs/index.spec.ts`, `scenario-specs/history.spec.ts`, `scenario-specs/request-lifecycle.spec.ts`, `scenario-specs/feedback.spec.ts`, `scenario-specs/model-switch.spec.ts`, `scenario-specs/sender-actions.spec.ts` | shared official `Root + Page` root scene | do not retire or merge while smoke specs still prove the whitebox ladder |
| `GranularScene.vue` | `scenario-specs/index.spec.ts`, `scenario-specs/history.spec.ts` | shared official `Root + primitives` root scene | keep as the shared granular root until a dedicated smoke replacement exists |
| `LayoutConfigScene.vue` | `scenario-specs/layout-config.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec; eligible only if that spec retires or is absorbed elsewhere |
| `McpFeatureScene.vue` | `scenario-specs/mcp-feature.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec; keep while MCP remains in the retained scenario gate |
| `MessageTransformsScene.vue` | `scenario-specs/message-transforms.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec |
| `RendererRegistryScene.vue` | `scenario-specs/renderer-registry.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec |
| `SenderExtensionsScene.vue` | `scenario-specs/sender-extensions.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec |
| `SurfaceApiScene.vue` | `scenario-specs/surface-api.spec.ts`, `scenario-specs/sender-actions.spec.ts` | shared advanced/leaf-composition fixture | not an orphan; keep while both the surface-api gate and granular sender-config proof rely on it |
| `WelcomePromptsScene.vue` | `scenario-specs/welcome-prompts.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec |
| `WorkspaceSlotsScene.vue` | `scenario-specs/workspace-slots.spec.ts` | dedicated feature fixture | one-to-one with its scenario spec |

Current conclusion:

- there is no orphan `scenarios/*.vue` file in the retained gate
- the next safe scene cleanup slice should target duplication inside a concrete scene pair, not broad scene deletion

## Current Cleanup Recommendations

### Frozen Gate Commands

The retained Playwright gate is now frozen into named package scripts:

- smoke:
  `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`
- smoke stable fallback:
  `pnpm.cmd -F tiny-robot-test test:chat:smoke`
- scenario:
  `pnpm.cmd -F tiny-robot-test test:chat:scenario:full`
- scenario stable fallback:
  `pnpm.cmd -F tiny-robot-test test:chat:scenario`

### Safe To Keep As-Is

- all current hard-gate package tests
- the current smoke gate
- the current scenario gate
- official scene fixtures and support helpers

### Support Surface Already Trimmed

- `packages/chat/tests/_stubs/chat-scaffold.mjs` has retired
- `packages/test/src/chat/selectors.ts` no longer carries the old workspace-shell-only selector branch
- `packages/test/src/chat/testHelper.ts` no longer exports the old workspace-shell-only action/assertion branch
- the top-level `surface-api` demo mode still exists in `index.vue`, but it is no longer mirrored as a shared switch helper because retained specs route to that scene directly
- zero-call convenience assertions such as prompt-layout, avatar, unused accessibility checks, and unused message-count helpers have also retired from `testHelper.ts`
- retained `scenarios/*.vue` files that own `createRuntimeFromConfig(config)` now share `scenarios/useStableSceneRuntime.ts` instead of mixing `computed(runtime)` and scene-local watcher variants
- retained scenes that switch between welcome and message-list regions now share `scenarios/useSceneWelcomeState.ts` instead of repeating the same message-count computed branch
- retained smoke specs now share `scenario-specs/openChatSmokeScene.ts` instead of repeating the same chat-entry and mode-open boilerplate

### Adapt Next

- no unresolved file-level `adapt` item remains inside `packages/chat/tests`

### Do Not Retire Yet

- any scene or helper that is still required by a retained smoke/spec file
- `mockProvider.ts` while `surface-api.spec.ts`, `sender-extensions.spec.ts`, or `mcp-feature.spec.ts` still prove retained advanced-provider behavior
- the remaining package-local `_stubs/*` files, because they still back SSR/import isolation in mounted integration tests

## Recommended Next Sequence

1. keep the retained Playwright smoke/scenario gates green while test expansion and suite normalization proceeds
2. use this audit together with `test-gap-backlog.md` to decide where missing coverage should land before opening another broad feature-scene retirement batch
3. only after that, open the next legacy-test or helper-retirement slice
