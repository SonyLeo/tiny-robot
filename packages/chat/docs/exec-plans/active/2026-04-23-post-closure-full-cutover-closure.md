# Post-Closure Full Cutover Closure

## Goal

Track the remaining implementation work needed before the chat package can be described as fully cut over to the new refactor model.

## Scope

- In scope:
  - finish helper retirement decisions in code, not just in process docs
  - retire old helper families and the tests/scenes that only protect them
  - align docs, demos, and retained gates around the same final package story
- Out of scope:
  - new feature work
  - reopening old `ChatConfig` compatibility
  - deferred standalone `footer` publishing semantics

## Governing Docs

- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`

## Remaining Parts

### Part 1: Provider Helper Retirement

- keep `TrChat.Provider` as an advanced surface
- keep the `responseProvider` branch
- retire the `chatKit` injection branch
- retire `TrChatHistorySurface` if no owner-aligned successor is needed

### Part 2: Comparison Helper Retirement

- retire `useChatKit`
- retire `loadChatConfig`
- retire `createChatAdapterFromConfig`
- retire `createPresetChatProps`
- retire `createPresetChatSlices`

### Part 3: Test And Scene Retirement

- remove `tests/runtime/provider-chat-kit.test.mjs`
- remove `tests/config/*`
- retire remaining comparison-heavy `adapt` scenes/specs after boundary handoff

### Part 4: Final Surface Cleanup

- align `packages/chat/README.md`
- align docs site pages under `docs/src/components/`
- align demo scenes and retained e2e routes
- close the final process/docs loop

## Progress Model

Use these two numbers in future progress updates:

- current slice progress
- full-cutover closure progress

Suggested closure milestones:

- `0-25%`
  helper decision baseline exists, but helper retirement has not started in code
- `25-55%`
  provider helper story is narrowed and the first comparison helper branches are retired
- `55-80%`
  old helper families and their package-local tests are mostly gone
- `80-100%`
  remaining e2e scenes, docs, and demos have been aligned with the final package story

## Exit Criteria

- [ ] `full-cutover-closure-checklist.md` is fully checked off
- [ ] retained gates are green
- [ ] the final retirement history entry has landed
