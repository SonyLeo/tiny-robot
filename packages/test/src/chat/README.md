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

The first promoted official-path Playwright gate now includes:

- `index.spec.ts`
- `history.spec.ts`
- `request-lifecycle.spec.ts`
- `scenario-specs/workspace-slots.spec.ts`
- `scenario-specs/renderer-registry.spec.ts`

The next adapted official-path handoff batch is now green, but not yet promoted into the default gate:

- `scenario-specs/layout-config.spec.ts`
- `scenario-specs/welcome-prompts.spec.ts`
- `sender-actions.spec.ts`
- `scenario-specs/surface-api.spec.ts`
- `scenario-specs/sender-extensions.spec.ts`
- `scenario-specs/mcp-feature.spec.ts`
- `scenario-specs/message-transforms.spec.ts`

## Directory Layout

- `index.vue`
  - demo entry and `chatMode` router only
- `scenarios/`
  - scene components and shared demo fixtures
- `scenario-specs/`
  - specs that target one dedicated `chatMode` scene
- top-level `*.spec.ts`
  - entry smoke specs, shared-flow specs, and cross-scene regression specs
- `testHelper.ts`
  - shared chat interaction helpers
- `selectors.ts`
  - stable selectors reused across specs

## Current Gate Role

### Official-path gate after adaptation

These are the user-visible behaviors that should survive post-closure cleanup:

- blackbox `TrChat` request flow
- `Root + Page` page-shell behavior
- `Root + primitives` granular composition behavior
- sender, attachments, history, model switching, workspace slots
- renderer registry, message transforms, request lifecycle, MCP affordances

### Mixed or legacy-oriented coverage

Current reality:

- some scenes still use `TrChat.Provider` or comparison-oriented helper setup
- that setup is still useful while cleanup is in progress
- it should not be treated as one undifferentiated hard gate

Default rule:

- keep or adapt only the specs that still prove official-path behavior
- retire specs that only protect explicit compatibility or already-deferred legacy behavior

## File Placement Rules

- add a file under `scenarios/` when you need a new scene or fixture page
- add a file under `scenario-specs/` when a spec targets one dedicated `chatMode` scene
- keep a spec at the top level only when it verifies:
  - main-entry scene switching
  - a shared blackbox or whitebox user flow
  - behavior spanning multiple scenes
- do not mix Vue scene code and Playwright spec code in the same file

## Scene Rules

- prefer scenes that start from the official entry ladder
- keep `index.vue` as a thin router, not a large fixture dump
- preserve `data-testid` values once a spec depends on them
- keep shared target-config defaults in `scenarios/officialSceneConfig.ts` when reused

If a scene still uses helper-heavy compatibility setup:

- keep it narrow
- document why it still exists
- do not let it become the default example for new specs

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

- `helper.switchToBlackbox()`
- `helper.switchToWhitebox()`
- `helper.switchToGranular()`

instead of open-coded button clicks.

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

When updating this suite for cleanup:

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

The old `edge-overrides.spec.ts` file has now retired.
Keep following the same rule it used to model:

- hand off official-path boundaries first
- delete the legacy spec and scene as soon as nothing unresolved remains
- do not keep a compatibility-only scene alive once every remaining branch has either an official successor or an explicit contract drop

## Commands

Common targeted runs:

```powershell
pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts
pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/workspace-slots.spec.ts
```

When moving or adapting specs:

1. run the affected spec before changes if it still represents real behavior
2. adapt the scene or assertion
3. rerun the affected spec
4. update `test-boundary-baseline.md` if its keep/adapt/retire status changed
