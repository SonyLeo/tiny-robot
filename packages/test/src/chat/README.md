# Chat Test Conventions

This folder contains the E2E-facing chat demo entry, scenario fixtures, and Playwright specs used to verify `packages/chat`.

## Directory Layout

- `index.vue`
  - Demo entry only.
  - Owns `chatMode` routing and mounts scene components.
- `scenarios/`
  - Demo scene components and shared fixtures.
  - Put demo-only Vue scenes here, not Playwright specs.
- `scenario-specs/`
  - Specs for independent scene pages that are entered with `?chatMode=...`.
  - Current examples: `layout-config`, `mcp-feature`, `sender-extensions`, `surface-api`, `welcome-prompts`.
- top-level `*.spec.ts`
  - Keep entry smoke specs, main-entry capability specs, and cross-scene regression specs here.
  - Current examples:
    - `index.spec.ts`
    - `attachments.spec.ts`
    - `history.spec.ts`
    - `request-lifecycle.spec.ts`
    - `feedback.spec.ts`
    - `edge-overrides.spec.ts`
    - `model-switch.spec.ts`
    - `sender-actions.spec.ts`
- `testHelper.ts`
  - Shared chat interaction helpers and assertions.
- `selectors.ts`
  - Stable selectors for reusable chat DOM access.

## File Placement Rules

- Add a new file under `scenarios/` when you need a new demo scene or fixture page.
- Add a new file under `scenario-specs/` when the spec targets one dedicated `chatMode` scene.
- Keep a spec at the top level only when it verifies:
  - the main entry switching flow
  - a main-entry capability that still uses the shared blackbox/whitebox demo entry
  - behavior spanning multiple scenes
  - shared helper behavior
- Do not mix Vue scene code and Playwright spec code in the same file.

## Spec Writing Pattern

Use this structure for new specs:

```ts
import { expect, test } from '@playwright/test'
import { createChatTestHelper } from '../testHelper'

test.describe('Feature Name', () => {
  let helper: ReturnType<typeof createChatTestHelper>

  test.beforeEach(async ({ page }) => {
    await page.goto('/?chatMode=target-scene')
    await page.locator('nav').getByRole('link').nth(2).click()
    await expect(page.locator('h2')).toContainText('Chat')
    helper = createChatTestHelper(page)
    await page.locator('[data-testid="scene-root"]').waitFor()
  })
})
```

When a test still depends on the top-level demo entry, use `helper.switchToBlackbox()`, `helper.switchToWhitebox()`, or `helper.switchToBlackboxEdge()` instead of open-coded button clicks.

## Selector Rules

- Prefer `testHelper` methods first.
- Prefer `selectors.ts` for reusable DOM lookups.
- Prefer `data-testid` for scene roots and demo-only controls.
- Prefer semantic selectors already used by the component when they are stable enough across specs.
- Do not add ad-hoc long CSS chains into multiple specs. If a selector is reused, move it into `selectors.ts` or a helper method.

## Assertion Rules

- One test should verify one behavior slice.
- Keep test names behavior-first:
  - good: `blackbox layout config should drive docs variant and custom placements`
  - avoid: `test layout config`
- Assert the smallest stable signal that proves the behavior:
  - visible state
  - count
  - attribute
  - text
  - event side effect rendered in the demo
- Prefer root-scoped assertions like `const root = '[data-testid="..."] .tr-chat'` to avoid cross-scene leakage.

## Flake Reduction

- Always wait for the scene root before interacting.
- Use helper methods such as `waitForAssistantReply()` and `waitForStreamingComplete()` instead of raw timeouts.
- Avoid `page.waitForTimeout(...)` unless the UI behavior is animation-bound and there is no stable DOM signal.
- Do not make width or position assertions stricter than the rendered UI needs. If pixel rounding is possible, prefer a tolerant assertion.
- Keep each spec focused on one scene and one state flow.

## Scene Conventions

- Scene components should preserve existing `data-testid` values once a spec depends on them.
- Shared scene data belongs in `scenarios/sharedDemoFixtures.ts` when reused across multiple scenes.
- `index.vue` should remain a thin scene router, not a large fixture dump.

## E2E Coverage Checklist

Use this checklist when changing `packages/chat` public behavior.

- `TrChat` blackbox scaffold flow
  - `config` drives brand, welcome, prompts, appearance, layout variant, role placement, and providerId-based model routing.
  - `callbacks` cover `onFinish`, `onError`, `onMessageAction`, and `onModelChange`.
  - `presetOverrides` cover placeholder, maxLength, sender mode, history, feedback, and role config overrides.
  - local blackbox scenarios should prefer the adapter-owned runtime path backed by the test app's `/api/*` mock endpoints, not legacy provider-factory injection.
- `TrChat` default renderer slots
  - `header`
  - `header-extra`
  - `welcome`
  - `empty`
  - `message-list`
  - `sender`
  - `footer-extra`
  - workspace panel slots: `left`, `left-rail`, `right`, `mobile-left`, `mobile-right`
  - bubble passthrough slots: `prefix`, `suffix`, `after`, `content-footer`
- workspace panel behavior
  - blackbox `TrChat` should forward panel-level workspace slots through the default renderer chain
  - `mobile-left` should fall back to `left`, then default sidebar
  - `mobile-right` should fall back to `right`, then default right panel
- `TrChat.Scaffold`
  - slot props expose `chatKit`, `adapter`, `presetProps`, `presetSlices`, `currentModel`, and `selectModel`
  - custom composition still renders and model switching still works
- `TrChat.Provider`
  - `chatKit` branch
  - `responseProvider` branch
  - feature/message injections remain available to descendants
- Leaf component surfaces
  - `TrChat.Layout`
  - `TrChat.Header`
  - `TrChat.Welcome`
  - `TrChat.MessageList`
  - `TrChat.Footer`
  - `TrChat.Sender`
  - `TrChat.Attachments`
  - `TrChat.History`
  - `TrChat.HistorySurface`
  - `TrMcpTrigger`
  - `TrModelSelector`
  - `TrChatFeedback`
  - `TrChatMcpPanel`

## Helper Conventions

- Add a helper method only when the interaction is reused or non-trivial.
- Keep helper names action-oriented: `sendMessage`, `clickPrompt`, `expectDrawerOpen`.
- If a new helper is scene-specific and only used once, keep it local to that spec first.

## Commands

Common targeted runs:

```powershell
pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts
pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/layout-config.spec.ts
```

When moving or adding specs:

1. run the affected spec before changes
2. make the move or refactor
3. rerun the affected spec on the new path
4. update any docs or progress notes that hardcode the old path

## Historical Note

`workspace` scenes and legacy preset-root coverage were removed after the underlying chat package APIs were deleted. New demo scenes and Playwright specs should target the retained `TrChat`, `TrChat.Scaffold`, `ChatProvider`, and `ChatLayout` surfaces.
