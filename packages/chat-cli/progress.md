# Chat CLI Progress

> Last updated: `2026-03-26`
> Design: [docs/chat-cli-design.md](../../docs/chat-cli-design.md)
> Strategy: [review/template-strategy.md](./review/template-strategy.md)
> Review: [chat-cli-review-02.md](./chat-cli-review-02.md)
> Release Playbook: [release-playbook.md](./release-playbook.md)
> Split Guide Redirect: [review/refactor-and-release-guide.md](./review/refactor-and-release-guide.md)
> Upstream chat status: [packages/chat/progress.md](../chat/progress.md)

## Current Status

- Current track: `P0 - Template Registry Foundation + Hygiene`
- Current judgment: `P0 is in progress`
- Current rule: let `packages/chat` stay the capability source of truth, keep `chat-cli` in consumer mode, and only make narrow follow-up changes when the next chat-side contract increment requires them

## Stable Upstream Contract

- Feature keys: `attachments / senderActions / welcomePrompts / mcp / history / feedback`
- Preset prop keys: `attachmentsFeature / senderActionsFeature / prompts / mcpManager / messageListVariant / roleConfigs / showHistory / historyProps / showFeedback`
- Preset slice keys: `root / layout / header / welcome / messageList / sender / history / modelSelector`

## Phase Status

| Phase | Status | Notes |
|:--|:--|:--|
| P0 / Template Registry Foundation + Hygiene | `in progress` | minimal registry is live; hygiene and metadata closeout remain |
| P1 / Agent MCP Template | `later` | wait until registry and chat consumption path are stable |
| P2 / Retrieval / Docs Template | `later` | depends on retrieval contract, not just docs UI |
| P3 / Platform Evolution | `later` | `base + feature packs + add` should follow stable registry and template composition |

## Completed So Far

- [x] `ChatCliTemplateDefinition` and template registry foundation are added in `packages/chat-cli/src/templateRegistry.ts`
- [x] CLI template selection now reads from registry, not a hardcoded template list in `src/index.ts`
- [x] `--template` validation uses stable template ids from registry
- [x] interactive template selection uses stable template metadata from registry
- [x] help output reads available templates from registry
- [x] template directory resolution reads `templateDefinition.templateDir`
- [x] provider validation reads `templateDefinition.supportedProviders`
- [x] `requiredChatFeatures` now reflects the current stable chat contract for `basic`
- [x] `contractUsage` now makes the `basic` template's consumption mode and consumed preset slices explicit
- [x] `validate-templates.mjs` now validates registry metadata together with template files
- [x] template hygiene checks are part of the current prepare gate
- [x] `packages/chat` now exposes a Phase C-ready CLI consumption contract through `createChatCliCapabilitySurface()`
- [x] `basic` now consumes `history` through `features.history` instead of a template-local `showHistory` override
- [x] the current stable CLI contract now also exposes `feedback` through `featureKeys` and `showFeedback`
- [x] the current stable CLI contract now also exposes `header` and `modelSelector` as template-facing preset slices
- [x] `basic` now consumes `chatCapabilitySurface.presetSlices` through a white-box composition path
- [x] `agent-mcp` now exists as a second stable registry-backed template and builds through the current scaffold/smoke path

## Remaining Work In P0

- [ ] remove any leftover `coming soon` or dead-end wording from CLI-facing docs and flows
- [x] make `requiredChatFeatures` meaningful in template metadata instead of placeholder-only
- [x] make the current template-to-contract mapping explicit in registry metadata
- [x] upgrade `validate-templates.mjs` to validate actual template hygiene boundaries
- [x] make template hygiene checks part of the release / prepare gate
- [ ] keep the next CLI changes limited to contract-following consumption work while `packages/chat` remains the active mainline
- [x] add at least one more template path only after the next chat-side capability increment is stable

## What Is No Longer True

- It is no longer accurate to say that `chat-cli` template selection is fully hardcoded.
- It is no longer accurate to say that the stable upstream chat contract only contains `attachments / senderActions / welcomePrompts`.
- It is no longer accurate to describe `chat-cli` as "not started".
- It is still accurate to say that template governance, feature-aware metadata, and multi-template composition are not complete yet.

## Next Step

1. Keep `chat-cli` in follow-up mode while `packages/chat` continues the active mainline.
2. Remove leftover placeholder wording from CLI-facing docs and flows.
3. Keep the second-template path (`agent-mcp`) small and contract-following before evaluating any broader template expansion.

## Verified

- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -F create-tiny-robot prepare:templates`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`
