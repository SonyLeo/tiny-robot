# Chat CLI Progress

> Last updated: `2026-03-19`
> Design: [docs/chat-cli-design.md](../../docs/chat-cli-design.md)
> Review: [chat-cli-review-02.md](./chat-cli-review-02.md)
> Upstream chat status: [packages/chat/progress.md](../chat/progress.md)

## Current Status

- Current track: `P0 - Template Registry Foundation + Hygiene`
- Current judgment: `P0 is in progress`
- Current rule: let `packages/chat` stay the capability source of truth, and let `chat-cli` consume stabilized outputs instead of inventing new chat-layer abstractions

## Stable Upstream Contract

- Feature keys: `attachments / senderActions / welcomePrompts / mcp`
- Preset prop keys: `attachmentsFeature / senderActionsFeature / prompts / mcpManager / messageListVariant / roleConfigs`
- Preset slice keys: `root / layout / welcome / messageList / sender`

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
- [x] `packages/chat` now exposes a Phase C-ready CLI consumption contract through `createChatCliCapabilitySurface()`

## Remaining Work In P0

- [ ] remove any leftover `coming soon` or dead-end wording from CLI-facing docs and flows
- [ ] make `requiredChatFeatures` meaningful in template metadata instead of placeholder-only
- [ ] upgrade `validate-templates.mjs` to validate actual template hygiene boundaries
- [ ] make template hygiene checks part of the release / prepare gate
- [ ] add at least one more template path after registry and metadata rules are stable

## What Is No Longer True

- It is no longer accurate to say that `chat-cli` template selection is fully hardcoded.
- It is no longer accurate to say that the stable upstream chat contract only contains `attachments / senderActions / welcomePrompts`.
- It is no longer accurate to describe `chat-cli` as "not started".
- It is still accurate to say that template governance, feature-aware metadata, and multi-template composition are not complete yet.

## Next Step

1. Finish `P0` by closing registry hygiene and feature-aware metadata.
2. Make `requiredChatFeatures` reflect the stabilized chat capability contract.
3. Keep template generation registry-first before adding `agent-mcp` or `docs-chat`.

## Verified

- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`
