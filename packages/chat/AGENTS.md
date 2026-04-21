# AGENTS.md

Package-level instructions for coding agents working in `packages/chat`.

This file exists to help future agents build context quickly before editing the chat package.

## 1. Scope

This file applies to:

- `packages/chat/**`
- chat-related docs updated as part of the same task:
  - `docs/src/components/chat.md`
  - `docs/src/components/chat-features.md`
  - `docs/src/components/chat-advanced.md`
  - any chat-specific demo or component doc touched by the change

If a future nested `AGENTS.md` appears under a chat subdirectory, the nested file wins for that subtree.

## 2. Package Role

`@opentiny/tiny-robot-chat` is the high-level packaged chat UX layer in this monorepo.

It sits above:

- `@opentiny/tiny-robot`: UI primitives such as sender, bubble list, theme, buttons
- `@opentiny/tiny-robot-kit`: conversation, request, plugin, tool, and storage runtime

This package exposes two main usage styles:

Current shipping surface:

- blackbox: `TrChat`
- whitebox / compound composition: `TrChat.Scaffold`, `TrChat.Provider`, `TrChat.Layout`, `TrChat.WorkspaceLayout`, `TrChat.Header`, `TrChat.MessageList`, `TrChat.Sender`, etc.

Refactor target surface:

- blackbox: `TrChat`
- advanced runtime entry: `TrChat.Root`
- official preset page layer: `TrChat.Page`

Current refactor-development default:

- for refactor design, review, and implementation work, prioritize the target-surface contracts in the refactor docs
- treat the current shipping surface mainly as a capability boundary and test anchor
- do not let shipping export shape or publish-stage concerns override a better target-surface contract during active development

It also exposes runtime/config helpers such as:

- `useChatKit`
- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `createPresetChatSlices`
- `useMcpManager`
- `useChatAttachments`

## 3. First Read Order

When starting a non-trivial task in this package, build context in roughly this order:

For active refactor-next work, read the four `ARCHITECTURE_REFACTOR_*.md` docs before diving into shipping implementation files, then inspect current code only to confirm old boundaries, tests, and reusable logic.

- `packages/chat/docs/README.md` and `packages/chat/docs/SOURCE_OF_TRUTH.md`
  Use these first when you need to know which document category owns the answer.
- `packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md`
  Read this before touching shipping docs or explaining the relationship between current usage guidance and target refactor contracts.

1. `packages/chat/src/index.ts`
   Understand the real public surface first.
2. `packages/chat/src/types/*.ts`
   Check whether the change affects public contracts.
3. `packages/chat/src/components/core/Chat.vue`
   This is the thin blackbox entry.
4. `packages/chat/src/components/core/ChatScaffold.vue`
   This is the main config -> preset -> provider bridge.
5. `packages/chat/src/components/core/ChatProvider.vue`
   This is the runtime/ui context root.
6. `packages/chat/src/runtime/config/*`
   Read this when the task touches config, features, providers, or preset projection.
7. `packages/chat/src/runtime/chat-kit/*`
   Read this when the task touches send/retry/edit/regenerate/message state/runtime behavior.
8. `packages/chat/src/components/core/default-renderer/*`
   Read this when the task changes default layout composition.
9. `packages/chat/src/components/workspace/*`
   Read this when the task touches workspace shell, responsive behavior, history drawer/sheets, or side panels.
10. The relevant feature folder:
   `attachments`, `feedback`, `history`, `mcp`, `model-selector`, or `renderers`.

## 4. Fast Source Of Truth

For chat package work, use these sources in this order:

1. current code under `packages/chat/src`
2. chat package tests under `packages/chat/tests`
3. chat package demos under `packages/chat/demo`
4. chat docs under `docs/src/components/chat*.md`
5. root repo guidance such as `AGENTS.md`, `CONTRIBUTING.md`, `.editorconfig`

Important:

- the chat docs are valuable and fairly current, but code and tests still win if there is drift
- if code and docs disagree on public behavior, update the stale side in the same task when practical
- if the task is explicitly about the future refactor plan under `ARCHITECTURE_REFACTOR_*.md`, keep those design docs aligned with each other before partially switching `AGENTS.md`, demos, or public guidance

## 5. Architecture Mental Model

Use this mental model before making changes:

1. `TrChat` is only a thin wrapper.
   It forwards `config`, `runtime`, `callbacks`, `presetOverrides`, and named slots into `ChatScaffold`.

2. `ChatScaffold` is the main orchestration layer.
   It creates the adapter from config, resolves models/default model, optionally creates `chatKit`, manages current model, creates preset props/slices, and provides scaffold-level context such as `onBeforeSend`.

3. `ChatProvider` is the runtime root.
   It resolves or creates `chatKit`, creates `chatUi`, resolves copy/messages, and provides context for chat kit, history, attachments, sender actions, and MCP.

4. `runtime/config` is the declarative config pipeline.
   The normal flow is:
   `loadChatConfig` -> `resolveChatFeatures` -> `createChatAdapterFromConfig` -> `createPresetChatProps` -> `createPresetChatSlices`.

5. `runtime/chat-kit` is the chat runtime facade.
   `useChatKit` wraps `tiny-robot-kit` conversation behavior with chat-specific semantics such as retry, regenerate, optimistic turns, edit rollback, response provider updates, and normalized errors.

6. `ChatLayout` plus `useDefaultBubbleConfig` define the default rendering chain.
   This is where default bubble renderers, role config, appearance scoping, and bubble provider wiring come together.

7. `ChatDefaultRenderer` composes the default page shell.
   It decides whether the package is rendering stacked chat or workspace chat, then wires header, welcome/body, footer tools, model selector, MCP trigger, and history placement.

8. `createChatUiContext` owns workspace and history UI state.
   This includes left/right region state, responsive host measurement, mobile behavior, and history visibility semantics.

9. message rendering is annotation-based, not copy-based.
   `chatRenderMessages.ts` annotates source messages and indexes; `chatMessageState.ts` stores transient runtime state like error, editing, optimistic, and turn id.

## 6. Directory Map

- `src/components/core`
  Main composition surface for blackbox and whitebox chat.
  Start here for `Chat.vue`, `ChatScaffold.vue`, `ChatProvider.vue`, `ChatLayout.vue`, `ChatHeader.vue`, `ChatMessageList.vue`, `ChatSender.vue`, `ChatWelcome.vue`, and the default renderer.

- `src/components/workspace`
  Workspace shell, left/right rail/panel/sheet components, and workspace UI state helpers.
  Sensitive area for responsive logic and side-panel behavior.

- `src/components/history`
  Conversation history UI, history surface extraction, management state, and drawer rendering.

- `src/components/attachments`
  Attachment manager hook and attachment list integration inside chat.

- `src/components/feedback`
  Default feedback actions such as copy, edit, and regenerate, plus action merging with user-provided `messageActions`.

- `src/components/mcp`
  MCP panel, trigger, and manager abstraction used by tool/plugin workflows.

- `src/components/model-selector`
  Model selection state, floating dropdown behavior, keyboard navigation, and provider icon display.

- `src/components/renderers`
  Specialized renderers for markdown stream, tool calls, attachments, edit input, and error states.

- `src/runtime/chat-kit`
  Runtime facade around `tiny-robot-kit`.

- `src/runtime/config`
  Config loading, feature resolution, preset projection, provider factories.

- `src/runtime/scaffold`
  Glue helpers that keep scaffold behavior small and testable.

- `src/shared/context`
  Injection keys and scaffold/provider shared context helpers.

- `src/shared/messages`
  Centralized built-in copy.
  Public copy changes here usually require docs/tests awareness.

- `src/types`
  Public contracts.
  High-scrutiny area.

- `src/styles`
  Package-wide chat CSS and tokens.

- `demo`
  Best reference for intended blackbox and whitebox usage patterns.

- `tests`
  Contract tests for public surface, config/runtime behavior, and workspace UI semantics.

## 7. Docs And Demo Anchors

If you need user-facing intent, start with these docs:

For the current shipping surface:

- `docs/src/components/chat.md`
  Best first read for `TrChat`, `config`, `runtime`, `callbacks`, and `presetOverrides`.
- `docs/src/components/chat-features.md`
  Best source for `models`, `providers`, `shell`, `layout`, `features`, and config-layer responsibilities.
- `docs/src/components/chat-advanced.md`
  Best source for `Scaffold`, `Provider`, workspace panel slots, `messageActions`, `bubbleRenderers`, `messageTransforms`, and MCP integration.

For the refactor target surface, also read:

- `packages/chat/ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md`
- `packages/chat/ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`
- `packages/chat/ARCHITECTURE_REFACTOR_DESIGN.md`
- `packages/chat/ARCHITECTURE_REFACTOR_API_RUNTIME.md`
- `packages/chat/ARCHITECTURE_REFACTOR_EXECUTION.md`
- `packages/chat/ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`

When doing that work:

- for development-stage refactor work, prefer contract clarity and implementation routing over publish-stage planning
- for refactor review/alignment work, read `ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md` before reading stage details; use it as the stable method doc for review scope, meeting shape, and output expectations
- use `ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md` as the process/state doc for what has already been aligned, what remains open, and which review milestone is current
- keep a strict split between:
  normative docs (`DESIGN / API_RUNTIME / EXECUTION / IMPLEMENTATION_BLUEPRINT`),
  method docs (`REVIEW_SCHEME`),
  and process docs (`ALIGNMENT_TRACKER`)
- do not let old shipping guidance become the decision source for new refactor structure work
- keep a visible distinction between current shipping guidance and target-architecture guidance until the package explicitly enters publish stage
- treat `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md` as the Phase 0.5 implementation source of truth once it narrows an ambiguity left by the older docs
- do not reintroduce `ui.page`, `ui.messages`, or `ui.slots` after the blueprint freezes `ui` as display-only
- keep refactor slot vocabulary aligned to the finalized catalog; do not maintain `page-*` and unprefixed slot names in parallel
- for next-surface implementation planning, prefer the new-target directories documented in the refactor docs such as `src/root`, `src/page`, `src/primitives`, `src/runtime/*`, and `src/legacy`; do not silently mix those with shipping-path assumptions
- when touching `docs/src/components/chat*.md`, preserve a clear "current shipping surface vs target refactor surface" note until the publish stage is explicitly entered

Authoritative freeze anchors:

- runtime owner / primitive read-boundary tables:
  `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md section 6.2` and `ARCHITECTURE_REFACTOR_API_RUNTIME.md section 9`
- slot catalog / slot-provider contract:
  `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md section 6.3-6.4` and `ARCHITECTURE_REFACTOR_API_RUNTIME.md section 6.5D-6.5E / section 10`
- old export / helper boundary reference:
  `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md section 7.7` and `ARCHITECTURE_REFACTOR_EXECUTION.md` old-boundary reference table

Refactor review anchors:

- review method / cadence / fixed meeting template:
  `ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md`
- current milestone / open questions / stage status:
  `ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`

When preparing or updating refactor review materials:

- preserve the fixed main storyline:
  `TrChat` -> `TrChat.Root + TrChat.Page` -> `TrChat.Root + primitives`
- preserve the four-layer framing:
  direction / contract / phase / implementation constraints
- preserve the four-review cadence defined in `ARCHITECTURE_REFACTOR_REVIEW_SCHEME.md`
- do not create a second contract source of truth inside tracker docs, review briefs, or phase packets
- for current two-person refactor reviews, prefer a three-doc set:
  `OWNER_RUNBOOK` + `SPEC_DETAIL` + `REVIEWER_MEMO`
- keep status, follow-ups, and conclusions in `ARCHITECTURE_REFACTOR_ALIGNMENT_TRACKER.md`
- review materials should summarize and reference the normative docs rather than duplicate them
- for `Review A`, explicitly separate content into:
  `Must Freeze Now`, `Freeze Semantics Now`, and `Defer To Review B`
- do not let `Review A` stop at abstract direction only; it must freeze the immediate API / props / slot contract that Phase 1A coding will directly depend on
- treat slot discussion as layered:
  `Review A` freezes slot contract,
  `Review B` freezes which slot scope enters `Phase 1B`,
  `Review C` validates slot implementation results

If you need real usage examples, start with these demos:

- `packages/chat/demo/src/components/BlackboxDemo.vue`
  Best blackbox integration example.
- `packages/chat/demo/src/components/WhiteboxDemo.vue`
  Best whitebox composition example.
- `packages/chat/demo/src/components/GranularWorkspaceDemo.vue`
  Best workspace-slot and custom-panel example.

Do not copy demo-only tradeoffs into package runtime unless the logic is clearly reusable.

## 8. Change Routing Guide

Use this routing table before editing:

For refactor-next implementation, prefer this route first:

- contract / owner / runtime normalize changes:
  start with `ARCHITECTURE_REFACTOR_IMPLEMENTATION_BLUEPRINT.md`, then `src/runtime/core/*` and the owning runtime module under `src/runtime/*`.
- Root wiring and provide/inject boundaries:
  start with `src/root/*`.
- official default page composition and slot-provider behavior:
  start with `src/page/*`.
- primitive-level UI contracts:
  start with `src/primitives/*`.
- old shipping files under `src/components/core/*`:
  only touch them when a boundary anchor, comparison test, or temporary legacy adapter actually requires it.

- Add or change a declarative config field:
  update `src/runtime/config/types.ts`, `configLoader.ts`, `configProjection.ts`, and the relevant tests under `tests/config`.

- Add or change a built-in feature switch:
  update `src/runtime/config/featureTypes.ts`, `registry.ts`, preset projection, and config tests.

- Change provider/request behavior:
  update `src/runtime/config/openaiCompatibleTransport.ts`, relevant runtime types, and provider factory tests.

- Change send / retry / regenerate / edit semantics:
  update `src/runtime/chat-kit/useChatKit.ts`, `useChatMessages.ts`, `chatMessageState.ts`, and tests under `tests/runtime`.

- Change default message rendering:
  start with `src/components/core/useDefaultBubbleConfig.ts`, `src/components/renderers/*`, and `ChatMessageList.vue`.

- Change default page composition:
  start with `src/components/core/default-renderer/*`, then `ChatLayout.vue` or `ChatWorkspaceLayout.vue` if needed.

- Change workspace side panels or responsive behavior:
  start with `src/components/workspace/chatUiContext.ts`, then related workspace components, then `tests/ui/chat-ui-context.test.mjs`.

- Change model selector behavior:
  update `src/components/model-selector/*`, and keep scaffold model-management behavior in mind.

- Change attachments or sender action behavior:
  update `src/components/attachments/*`, `src/components/core/ChatSender.vue`, and feature config projection if the behavior is configurable.

- Change history behavior:
  update `src/components/history/*` and validate both stacked history drawer and workspace history behavior.

- Change public exports:
  update `src/index.ts`, `src/types/index.ts`, and `tests/contracts/public-surface.test.mjs`.

- Change internal context or injection keys:
  update `src/shared/context/index.ts` carefully and review every consumer before shipping.

## 9. Preferred Extension Paths

Before hard-coding new branches into the package, check whether the requirement already fits one of these extension points:

- `config`
  for stable scenario defaults
- top-level `runtime`
  for page-instance objects such as `chatKit`, `plugins`, `storage`, `mcpManager`, `messageTransforms`
- `presetOverrides`
  for page-level behavior and light UI differences
- slots
  for localized structure replacement
- `messageActions`
  for message-level business actions
- `bubbleRenderers`
  for renderer selection
- `messageTransforms`
  for runtime message shaping before render

For active refactor-target work, add two clarifications:

- treat the `top-level runtime` and `messageTransforms` bullets above as current-shipping extension guidance
- do not carry them over as the target-surface owner model; in the refactor docs, `config.messages.transforms` is frozen under the `message runtime` extension pipeline

Preferred escalation order:

Current shipping order:

1. `TrChat`
2. `presetOverrides`
3. slots
4. `TrChat.Scaffold`
5. `TrChat.Provider`

Do not move straight to `Provider` when `TrChat` or `Scaffold` already fits the job.

Refactor target order:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. slots
4. `TrChat.Root + primitives`

For internal refactor work, follow the refactor target order.
For user-facing guidance, keep the current-shipping note until the package explicitly enters publish stage.

Implementation routing during Phase 1A / 1B:

- keep shipping wrappers (`Chat.vue`, `ChatScaffold.vue`, `ChatProvider.vue`) on legacy internals unless the phase table explicitly allows reroute
- prefer writing new next-surface code into `src/root`, `src/page`, `src/primitives`, `src/runtime/*`, and `src/legacy`
- when implementing directly after `Review A`, do not reopen already-frozen entry API, `Root` props, bridge subset, or core slot contract in code review unless the issue is escalated back to review docs

## 10. Public Contract Guardrails

These files deserve extra scrutiny:

- `src/index.ts`
- `src/internal.ts`
- `src/types/*.ts`
- `src/runtime/config/*`
- `src/runtime/chat-kit/useChatKit.ts`
- `src/components/core/ChatScaffold.vue`
- `src/components/core/ChatProvider.vue`
- `src/components/workspace/chatUiContext.ts`
- `src/shared/messages/index.ts`

When changing them:

- avoid unrelated refactors
- update tests in the same task
- update docs when public behavior, naming, or recommended usage changes

## 11. Skills And Implementation Style

If the current agent session exposes TinyRobot-related skills, prefer these when working in this package:

- `vue-best-practices`
  Use for Vue SFC and component/composable boundary decisions.
- `vue`
  Use for Vue 3 Composition API and `<script setup lang="ts">` patterns.
- `vueuse-functions`
  Use only when a VueUse composable clearly simplifies existing state/effect code without fighting current patterns.

Package style expectations:

- prefer Vue 3 Composition API
- prefer `<script setup lang="ts">`
- keep entry components thin and compositional
- favor explicit props/emits/injection contracts over hidden coupling
- do not introduce Options API or JSX unless the existing file already requires it

## 12. Validation

Run the narrowest meaningful validation for the area you touched.

Preferred commands:

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm -F @opentiny/tiny-robot-chat build`
- `pnpm -F @opentiny/tiny-robot-chat test`

If you changed demo-facing behavior or demo code:

- `pnpm -F @opentiny/tiny-robot-chat-demo type-check`
- `pnpm -F @opentiny/tiny-robot-chat-demo build`

If you changed chat docs or docs demos in a meaningful way, use the narrowest docs validation available for the touched area.

Do not skip validation silently.

## 13. Docs Sync Rules

Update chat docs in the same task when you change:

- public exports
- `TrChat` usage expectations
- `config / runtime / callbacks / presetOverrides` responsibilities
- `shell` or `layout` semantics
- built-in `features`
- `messageActions`, `bubbleRenderers`, or `messageTransforms` recommended extension paths
- workspace slot or side-panel behavior
- MCP integration expectations
- documentation routing or the ownership split between normative docs, tracker docs, review packets, and generated artifacts

For refactor-target work, also sync `packages/chat/ARCHITECTURE_REFACTOR_*.md` when you change:

- `messages.transforms` owner or lifecycle order
- `conversation.persistence` vs `history runtime` boundaries
- `TrChat.Page` region composition, footer companion region, or slot degrade rules
- public-surface freeze level versus review appendix scope

Minimum likely doc targets:

- `docs/src/components/chat.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`
- `packages/chat/docs/README.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
- `packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md`

## 14. Working Defaults

When in doubt inside this package:

- keep changes package-local
- prefer extending existing config/runtime hooks over inventing parallel APIs
- prefer adapting docs and tests alongside public behavior changes
- prefer whitebox composition only when blackbox usage no longer fits
- prefer targeted runtime/config tests over repo-wide validation during iteration
