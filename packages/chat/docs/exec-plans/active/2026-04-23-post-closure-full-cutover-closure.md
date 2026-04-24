# Post-Closure Full Cutover Closure

Status: paused pending `2026-04-23-post-closure-core-flow-stabilization.md`.

This slice is not canceled, but it is no longer the active execution priority while the branch has known regressions in model switching, sender submit continuity, and retained-gate freshness.

## Goal

Track the remaining implementation work needed before the chat package can be described as fully cut over to the new refactor model.

At the moment this closure work is paused until the stabilization baseline is green again.

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
- retire `TrChatHistorySurface` and hand its remaining history proof off to the official workspace-owner path

Current status:

- `chatKit` injection branch retired
- provider-side comparison scenes handed off to `responseProvider` or `Root`-based proof
- `TrChatHistorySurface` retired after the granular/demo/e2e history proof moved to `WorkspaceLayout` default-left owner behavior

### Part 2: Comparison Helper Retirement

- retire `useChatKit`
- retire `loadChatConfig`
- retire `createChatAdapterFromConfig`
- retire `createPresetChatProps`
- retire `createPresetChatSlices`

Current status:

- `loadChatConfig`, `createChatAdapterFromConfig`, `createPresetChatProps`, and `createPresetChatSlices` are retired from implementation, public exports, and dedicated `tests/config/*`
- their remaining renderer/message/copy/transport proof now lives in current runtime/contracts coverage
- `useChatKit` is retired from the public package surface and docs story
- the internal runtime chat-kit chain still exists as a private implementation detail, so any deeper removal belongs to a later runtime rewrite rather than this full-cutover closure slice

### Part 3: Test And Scene Retirement

- keep `tests/runtime/provider-response-provider.test.mjs` as the surviving advanced-provider proof
- remove `tests/config/*`
- retire remaining comparison-heavy `adapt` scenes/specs after boundary handoff

Current status:

- `tests/config/*` is gone
- the surviving transport and shared-copy boundaries now live in `tests/runtime/openai-compatible-transport.test.mjs` and `tests/contracts/chat-messages.test.mjs`
- the former `adapt` Playwright batch is now promoted into the retained official-path gate
- no retained scene depends on retired `chatKit`, `HistorySurface`, or config-projection helper surfaces

### Part 4: Final Surface Cleanup

- align `packages/chat/README.md`
- align docs site pages under `docs/src/components/`
- align demo scenes and retained e2e routes
- close the final process/docs loop

Current status:

- `packages/chat/README.md` and `docs/src/components/chat-advanced.md` no longer teach the retired config-projection helpers
- `packages/chat/README.md` and `docs/src/components/chat-advanced.md` no longer teach `useChatKit` as a supported helper
- process docs now record config-projection retirement, history-surface retirement, and public `useChatKit` retirement as landed
- demo routes and retained scenes no longer center retired helper usage

## Progress Model

Use these two numbers in future progress updates:

- current slice progress
- full-cutover closure progress

While this slice is paused, also report the active stabilization progress from:

- `packages/chat/docs/exec-plans/active/2026-04-23-post-closure-core-flow-stabilization.md`

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

This slice should not be closed while the stabilization baseline is still red.

- [x] `full-cutover-closure-checklist.md` is fully checked off
- [ ] retained gates are green
- [ ] the final retirement history entry has landed
