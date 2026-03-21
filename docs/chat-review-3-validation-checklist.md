# Chat Review-3 Validation Checklist

This checklist is for the post-implementation validation pass after review-3 lands in `packages/chat`.

The goal is not only to prove that the package still builds, but to confirm that the core chat capability chains still behave correctly:

- `config -> feature -> preset -> slice`
- request lifecycle and conversation state
- workspace, navigation, and MCP extension surfaces

## 1. Baseline Gates

- [ ] `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- [ ] `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- [ ] `pnpm.cmd -F tiny-robot-test build`

If any of the three commands above fail, stop and fix them before running the deeper test matrix.

## 2. Unit And Runtime Integration

### 2.1 Conversation Core

- [ ] `node ./tests/composables.test.mjs` in `packages/chat`
- [ ] Confirm send, retry, error, optimistic update, and conversation switching still pass
- [ ] Pay extra attention if review-3 touched `useChatKit.ts`, `useChatConversation.ts`, `useChatRequest.ts`, or `useChatMessages.ts`

### 2.2 Config And Feature Contract

- [ ] `node ./tests/config-and-features.test.mjs` in `packages/chat`
- [ ] Confirm feature normalization still covers:
  - `attachments`
  - `senderActions`
  - `welcomePrompts`
  - `mcp`
  - `history`
  - `feedback`
- [ ] Confirm config changes did not break feature enable/disable defaults

### 2.3 Preset And Slice Resolution

- [ ] `node ./tests/presets.test.mjs` in `packages/chat`
- [ ] `node ./tests/preset-slices.test.mjs` in `packages/chat`
- [ ] `node ./tests/use-chat-slices.test.mjs` in `packages/chat`
- [ ] Confirm:
  - built-in `SkillPack` merge order still works
  - `AgentPreset` resolution still works
  - preset props and slices still line up with feature switches

### 2.4 Workspace And Content Navigation Runtime

- [ ] `node ./tests/workspace-runtime.test.mjs` in `packages/chat`
- [ ] `node ./tests/content-navigation-runtime.test.mjs` in `packages/chat`
- [ ] Confirm:
  - region collapse and active-panel state stay stable
  - navigation item resolution still works
  - outline and turn-navigation data still stay in sync

### 2.5 External Contract Surface

- [ ] `node ./tests/chat-cli-contract.test.mjs` in `packages/chat`
- [ ] Confirm chat exports and template-facing capability surface did not regress

## 3. E2E Browser Validation

Run Playwright with `--workers=1` first when review-3 changes are large.

### 3.1 Entry And Root Smoke

- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/index.spec.ts`
- [ ] Confirm:
  - blackbox entry still renders header, footer, welcome, and brand
  - welcome prompt still transitions into the message list
  - whitebox root slices still mount and submit correctly

### 3.2 Request Lifecycle

- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/request-lifecycle.spec.ts`
- [ ] Confirm:
  - abort still works
  - optimistic bubble appears and clears
  - edge error surface still works
  - retry still works
  - whitebox status and `onFinish` still work

### 3.3 Conversation, History, And Attachments

- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/history.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/attachments.spec.ts`
- [ ] Confirm:
  - history drawer still opens and closes
  - new chat still resets conversation state
  - finished conversation still enters history
  - attachments area still appears and clears correctly

### 3.4 Feature-Level UI

- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/feedback.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/sender-actions.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/model-switch.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/edge-overrides.spec.ts`
- [ ] Confirm:
  - feedback timing and callback hooks still work
  - sender action overrides still win over defaults
  - model switching still changes provider behavior
  - edge prop and slot passthrough still work

### 3.5 Workspace Shell

- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/workspace-shell.spec.ts`
- [ ] Confirm:
  - left and right regions still collapse and restore
  - rails still appear in the rail-mode preview
  - panel switching and metadata stay in sync
  - full-width toggling does not break chat
  - in-flight requests survive shell state changes

### 3.6 Scenario Specs

- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/scenario-specs/layout-config.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/scenario-specs/welcome-prompts.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/scenario-specs/sender-extensions.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/scenario-specs/preset-entry.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/scenario-specs/mcp-feature.spec.ts`
- [ ] `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/scenario-specs/content-navigation.spec.ts`
- [ ] Confirm:
  - layout config still drives variant and placement
  - welcome prompt resolution priority is unchanged
  - sender extension passthrough still works
  - preset entry still exposes built-in preset slices
  - MCP panel still receives manager-backed data
  - content navigation and assistant outline still work

## 4. Targeted Retest Matrix By Review-3 Change Area

### 4.1 If review-3 changes `WorkspaceShell` or workspace regions

- [ ] rerun `workspace-runtime.test.mjs`
- [ ] rerun `workspace-shell.spec.ts`
- [ ] rerun `content-navigation-runtime.test.mjs`
- [ ] rerun `content-navigation.spec.ts`

### 4.2 If review-3 changes `types.ts`, preset wiring, or config normalization

- [ ] rerun `config-and-features.test.mjs`
- [ ] rerun `presets.test.mjs`
- [ ] rerun `preset-slices.test.mjs`
- [ ] rerun `use-chat-slices.test.mjs`
- [ ] rerun `layout-config.spec.ts`
- [ ] rerun `preset-entry.spec.ts`
- [ ] rerun `welcome-prompts.spec.ts`

### 4.3 If review-3 changes request lifecycle, optimistic turn identity, or retry

- [ ] rerun `composables.test.mjs`
- [ ] rerun `request-lifecycle.spec.ts`
- [ ] rerun `history.spec.ts`
- [ ] manually test duplicate-message input once

### 4.4 If review-3 changes message copy, i18n wiring, or messages injection

- [ ] rerun `feedback.spec.ts`
- [ ] rerun `history.spec.ts`
- [ ] rerun `welcome-prompts.spec.ts`
- [ ] manually verify button labels and empty states in blackbox mode

## 5. Manual Smoke Pass

Only do this after the automated matrix is green.

- [ ] Blackbox chat:
  - send message
  - click prompt
  - open history
  - start new chat
  - upload attachment
  - trigger retry path
- [ ] Whitebox chat:
  - verify root slices still compose
  - verify prompt consumption still works
  - verify new chat still resets the UI
- [ ] Workspace shell:
  - collapse left and right regions
  - switch panels
  - toggle full width
  - send while shell state changes
- [ ] Scenario pages:
  - `layout-config`
  - `preset-entry`
  - `mcp-feature`
  - `content-navigation`

## 6. Release Bar

Review-3 is ready to merge only when:

- [ ] baseline gates pass
- [ ] all touched unit/runtime tests pass
- [ ] all touched E2E specs pass
- [ ] manual smoke pass is green
- [ ] no failing case is waived as "just a selector issue" unless the selector contract was intentionally changed and the test was updated accordingly
