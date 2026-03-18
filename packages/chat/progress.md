# Chat Kit Progress

> Last updated: `2026-03-19`
> Design: [docs/chat-kit-design.md](../../docs/chat-kit-design.md)
> Review: [chat-kit-review-02.md](./chat-kit-review-02.md)

## Current Status

- Current track: `P3 - Template / CLI Consumption`
- Current judgment: `P2 is complete`
- Current rule: keep `packages/chat` as the source capability layer, and let `chat-cli` consume stabilized outputs instead of driving new chat abstractions first

## Phase Status

| Phase | Status | Notes |
|:--|:--|:--|
| P0 / Registry Foundation | `done` | `config -> adapter -> preset` pipeline is established |
| P1 / High-value Features | `done` | `attachments / senderActions / welcomePrompts` are formalized; blackbox and white-box defaults are aligned |
| P2 / MCP + Layout | `done` | `mcp`, `layout.variant`, `layout.placements`, and `workspace` layout variant are formalized |
| P3 / Template / CLI Consumption | `next` | let `chat-cli` consume stable chat capabilities and slices |
| P4 / Agent Preset + Skill Pack | `later` | not on the active path yet |
| P5 / Theme / Workspace Shell | `later` | not on the active path yet |

## P1 Result

- [x] `suggestions -> welcomePrompts` naming is unified, with legacy config compatibility preserved
- [x] `attachments` is formalized through `features -> resolver -> preset -> TrChat`
- [x] `senderActions` is formalized through `features -> resolver -> preset -> TrChat`
- [x] `welcomePrompts` is formalized through `features -> resolver -> preset -> prompts`
- [x] `createPresetChatSlices()` is established as the shared white-box consumption surface
- [x] `Sender Suggestion / Mention / Template` stays at `senderProps.extensions` passthrough level and does not enter the chat feature registry
- [x] slot / props / preset-slice priority around welcome and sender defaults is covered by tests

## P2 Result

- [x] `mcp` is formalized through `features -> resolver -> preset -> root slices`
- [x] `createPresetChatProps()` and `createPresetChatSlices()` both consume `features.mcp.manager`
- [x] blackbox and white-box `TrChatMcpPanel` injection are verified
- [x] `layout.variant` and `layout.placements` are formalized through `ChatConfig -> Adapter -> Preset`
- [x] explicit placements override `docs` variant defaults
- [x] `workspace` is formalized as a pure layout variant
- [x] blackbox and white-box tests verify that `workspace` affects layout presentation without coupling to feature enablement

## Stable Boundaries

- First-party chat features are currently: `attachments`, `senderActions`, `welcomePrompts`, `mcp`
- Sender extensions remain: `senderProps.extensions`
- White-box default consumption surface remains: `createPresetChatSlices()`
- `layout` is responsible for presentation-level variant and placement decisions only
- `chat-cli` should consume stable chat capability outputs, not invent new chat-layer abstractions

## Next Step

1. Start `P3` and define the stable `feature -> template / preset` consumption path for `chat-cli`.
2. Keep `layout` and feature enablement separated while introducing template-facing capability mapping.
3. Continue using `packages/chat` outputs as the single source of truth for template consumption.

## P3 Current Progress

- [x] `P3-A` has started on the chat side.
- [x] `createChatCliCapabilitySurface()` now exposes the stable Phase C contract for CLI consumption.
- [x] The current contract now covers:
  - feature keys: `attachments / senderActions / welcomePrompts / mcp`
  - preset props: `attachmentsFeature / senderActionsFeature / prompts / mcpManager / messageListVariant / roleConfigs`
  - preset slices: `root / layout / welcome / messageList / sender`
- [x] `P3-B` has started with a minimal template registry foundation in `chat-cli`
- [ ] `P3-B` feature-aware template metadata and mapping closeout
- [ ] `P3-C` capability-driven template wiring
- [ ] `P3-D` scaffold and smoke closeout

## P3 Execution Order

### P3-A. Lock the chat-side consumption contract

- First expand the `chat-cli` consumable surface from the current Phase B feature set to the full stable Phase C capability set.
- The contract should be explicit about:
  - consumable feature keys
  - preset prop keys
  - preset slice keys
  - template-facing layout and mcp inputs
- Goal: let `chat-cli` consume stable outputs from `packages/chat` instead of inferring behavior from page-level code.

### P3-B. Define `feature -> template` mapping in `chat-cli`

- Introduce or finish the template registry and template metadata path in `packages/chat-cli`.
- Make `requiredChatFeatures` and related template metadata read from the stabilized chat contract instead of hard-coded page assumptions.
- Keep the first round small:
  - `basic`
  - currently stabilized chat capabilities
  - no early `agent preset / skill pack` input

### P3-C. Replace handwritten template wiring with capability consumption

- Let templates consume:
  - feature config outputs
  - preset prop outputs
  - preset slice outputs
- Prefer reusing `createChatAdapterFromConfig()`, `createPresetChatProps()`, `createPresetChatSlices()`, and `createChatCliCapabilitySurface()`.
- Do not introduce new chat abstractions in CLI just to make scaffolding easier.

### P3-D. Close the loop with scaffold and smoke verification

- Verify generated templates actually consume the capability contract instead of duplicating demo/page logic.
- Keep the first round focused on stable generation and maintainability, not on adding more templates.

## P3 Test Order

1. Chat unit tests first.
   - Extend contract-level tests around `createChatCliCapabilitySurface()`.
   - Verify `attachments / senderActions / welcomePrompts / mcp / layout` are exposed in the expected template-facing shape.

2. `chat-cli` registry and mapping tests second.
   - Verify template registry metadata can consume the stable chat contract.
   - Verify `requiredChatFeatures` and template selection logic stay aligned with the contract.

3. Scaffold and smoke tests last.
   - Verify generated projects build with the intended capability combination.
   - Verify template output no longer depends on handwritten page-level wiring.

## P3 Done When

- `chat-cli` consumes stabilized outputs from `packages/chat` instead of relying on handwritten template logic.
- `feature -> template / preset` mapping is explicit and test-covered.
- The current stable capability set is consumable in CLI:
  - `attachments`
  - `senderActions`
  - `welcomePrompts`
  - `mcp`
  - `layout`
- Generated template output uses the existing chat capability pipeline rather than inventing a parallel one.
- Scaffold / smoke verification is green.

## P4 Entry Criteria

- `P3` is complete.
- `chat-cli` is already a real consumer of stable chat capabilities.
- No new P4 idea requires reopening the Phase B or Phase C contract.
- `AgentPreset / SkillPack` can be modeled as capability consumers on top of the existing chain, not as a replacement for it.

## Verified

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/layout-config.spec.ts src/chat/mcp-feature.spec.ts src/chat/index.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/sender-extensions.spec.ts`
