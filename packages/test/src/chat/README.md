# Chat E2E Conventions

This folder contains the Playwright-facing chat demo entry, scene fixtures, and end-to-end specs used to verify `packages/chat`.

Post-closure cleanup treats this suite as the slower user-path gate.
The fast pre-delete gate lives in `packages/chat/tests`.

The current official entry ladder is:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

Use that ladder as the default mental model for new scenes and spec updates.

The detailed keep/adapt/retire classification lives in:

- `packages/chat/docs/refactor/process/test-boundary-baseline.md`

The lasting test-layer, smoke/scenario, selector, helper, and retirement rules live in:

- `packages/chat/docs/refactor/process/test-governance-standard.md`

The current file-level audit inventory lives in:

- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`

The promoted official-path Playwright gate now includes:

- `scenario-specs/index.spec.ts`
- `scenario-specs/history.spec.ts`
- `scenario-specs/request-lifecycle.spec.ts`
- `scenario-specs/workspace-slots.spec.ts`
- `scenario-specs/renderer-registry.spec.ts`
- `scenario-specs/attachments.spec.ts`
- `scenario-specs/feedback.spec.ts`
- `scenario-specs/model-switch.spec.ts`
- `scenario-specs/sender-actions.spec.ts`
- `scenario-specs/layout-config.spec.ts`
- `scenario-specs/welcome-prompts.spec.ts`
- `scenario-specs/surface-api.spec.ts`
- `scenario-specs/sender-extensions.spec.ts`
- `scenario-specs/mcp-feature.spec.ts`
- `scenario-specs/message-transforms.spec.ts`

## Directory Layout

- `index.vue`
  - demo entry and `chatMode` router only
- `scenarios/`
  - scene components and shared demo fixtures
- `smoke-specs/`
  - smoke-level Playwright specs (entry, history, lifecycle, attachments, feedback, model-switch)
- `scenario-specs/`
  - feature-specific Playwright specs
- `testHelper.ts`
  - shared chat interaction helpers
- `scenario-specs/openChatSmokeScene.ts`
  - shared smoke-only chat-entry and mode-open helper for both `demo-nav` and `component-test` entry variants (now in `smoke-specs/`)
- `selectors.ts`
  - stable selectors reused across specs
- `scenarios/useStableSceneRuntime.ts`
  - shared runtime-resolution helper for scene-local `createRuntimeFromConfig(config)` usage
- `scenarios/useSceneWelcomeState.ts`
  - shared welcome/message-list visibility helper for retained scenes

## Current Gate Role

### Official-path gate after adaptation

These are the user-visible behaviors that should survive post-closure cleanup:

- `TrChat` request flow
- `Root + Page` page-shell behavior
- `Root + primitives` granular composition behavior
- sender, attachments, history, model switching, workspace slots
- renderer registry, message transforms, request lifecycle, MCP affordances

### Mixed or legacy-oriented coverage

Current reality:

- some scenes still use advanced surfaces like `TrChat.Provider`
- that setup is now part of the supported advanced story, not a retired helper fallback
- the retained gate should stay centered on the official entry ladder plus bounded advanced-provider proof

Default rule:

- keep or adapt only the specs that still prove official-path behavior
- retire specs that only protect explicit compatibility or already-deferred legacy behavior

## File Placement Rules

- add a file under `scenarios/` when you need a new scene or fixture page
- add every Playwright `*.spec.ts` file under `scenario-specs/`
- use naming and helper usage to distinguish smoke vs scenario responsibilities instead of relying on top-level placement
- do not mix Vue scene code and Playwright spec code in the same file

## Scene Rules

- prefer scenes that start from the official entry ladder
- keep `index.vue` as a thin router, not a large fixture dump
- preserve `data-testid` values once a spec depends on them
- keep shared target-config defaults in `scenarios/officialSceneConfig.ts` when reused
- if a scene owns runtime creation from config, prefer `scenarios/useStableSceneRuntime.ts` over scene-local `computed(() => createRuntimeFromConfig(...))`
- if a scene gates between welcome and message-list regions from runtime state, prefer `scenarios/useSceneWelcomeState.ts` over repeating the same message-count computed branch
- if a smoke spec just needs to enter the chat app and open `TrChat` / `Root + Page` / `Root + primitives`, prefer `scenario-specs/openChatSmokeScene.ts` over repeating the same top-nav click plus mode-switch setup
- use the default `demo-nav` entry unless the smoke spec specifically needs the narrower component-test entry before switching modes

Current ownership map:

- `TrChatScene.vue`, `WhiteboxScene.vue`, and `GranularScene.vue`
  - shared official root scenes for the smoke gate
- `SurfaceApiScene.vue`
  - shared advanced/leaf-composition fixture used by both `scenario-specs/surface-api.spec.ts` and the granular sender-config branch in `scenario-specs/sender-actions.spec.ts`
- all other `scenarios/*.vue`
  - currently one-to-one with a dedicated `scenario-specs/*.spec.ts` file

Do not delete or merge a scene only because it looks feature-specific.
First confirm its consumers in `test-suite-audit-baseline.md`.
At the current retained gate, there is no orphan scene fixture waiting to be deleted outright.

If a scene still uses a non-default advanced setup:

- keep it narrow
- document why it still exists
- do not let it overshadow the default `TrChat -> Root + Page -> Root + primitives` ladder

## Spec Writing Pattern

Use this structure for new specs:

```ts
import { expect, test } from '@playwright/test'
import { createChatTestHelper } from './testHelper'

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

When a test still depends on the top-level demo entry, prefer:

- `helper.switchToTrChat()`
- `helper.switchToWhitebox()`
- `helper.switchToGranular()`

instead of open-coded button clicks.

For feature scenes such as `surface-api`, prefer routing directly with `/?chatMode=surface-api`
instead of adding more top-level switch helpers into `testHelper.ts`.

## Selector And Assertion Rules

- prefer `testHelper` methods first
- prefer `selectors.ts` for reusable DOM lookups
- prefer `data-testid` for scene roots and demo-only controls
- keep assertions focused on the smallest stable signal:
  - visible state
  - count
  - attribute
  - text
  - rendered side effect
- scope assertions to one scene root whenever possible

## Flake Reduction

- always wait for the scene root before interacting
- use helper waits such as `waitForAssistantReply()` and `waitForStreamingComplete()`
- avoid raw timeouts when a DOM signal exists
- keep width or position assertions tolerant when pixel rounding is possible

## Post-Closure Adaptation Policy

When updating this suite for later cleanup:

1. check `test-boundary-baseline.md`
2. adapt retained specs toward the official entry ladder
3. only then promote them into the post-closure deletion gate

Do not spend cleanup time preserving specs that only prove:

- `ui.prompts`
- old `layout.variant / placements`
- broad edge override compatibility
- helper-heavy setup that is no longer part of the official package story

If a compatibility-only assertion is intentionally dropped during handoff, record that contract drop in
`packages/chat/docs/refactor/process/test-boundary-baseline.md` before deleting or rewriting the old spec branch.

The old `edge-overrides.spec.ts` file has now retired, and the retained official-path gate has absorbed the surviving boundaries.
Keep following the same rule for any future legacy scene:

- hand off official-path boundaries first
- delete the legacy spec and scene as soon as nothing unresolved remains
- do not keep a compatibility-only scene alive once every remaining branch has either an official successor or an explicit contract drop

## Commands

Frozen retained gates:

```powershell
pnpm.cmd -F tiny-robot-test test:chat:smoke:full
pnpm.cmd -F tiny-robot-test test:chat:scenario:full
pnpm.cmd -F tiny-robot-test test:chat:smoke
pnpm.cmd -F tiny-robot-test test:chat:scenario
```

Preferred execution order:

1. try the `:full` command first
   - current baseline is `4` Playwright workers
2. if the local environment shows worker or web-server instability, fall back to the non-`full` command
   - this remains the stable gate variant

Common targeted runs:

```powershell
pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/index.spec.ts
pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/workspace-slots.spec.ts
```

When moving or adapting specs:

1. run the affected spec before changes if it still represents real behavior
2. adapt the scene or assertion
3. rerun the affected spec
4. update `test-boundary-baseline.md` if its keep/adapt/retire status changed

Current support-surface note:

- `selectors.ts` and `testHelper.ts` are intentionally narrower than the full demo router
- do not add top-level mode-switch helpers unless a retained smoke/spec actually needs them
- if a selector only serves a zero-call helper branch, retire the helper and selector together in the same slice
