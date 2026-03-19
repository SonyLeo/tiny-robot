# Chat Kit Progress

> Last updated: `2026-03-18`
> Design: [docs/chat-kit-design.md](../../docs/chat-kit-design.md)
> Review: [chat-kit-review-02.md](./chat-kit-review-02.md)
> P5 Draft: [docs/chat-p5-proposal.md](../../docs/chat-p5-proposal.md)
> P5-B API Draft: [docs/chat-p5-b-api-draft.md](../../docs/chat-p5-b-api-draft.md)

## Current Status

- Current track: `P4 - Agent Preset + Skill Pack`
- Current judgment: `P3 is complete`
- Current rule: keep `packages/chat` as the source capability layer, treat `P3` as complete, and only let higher-level preset or skill work build on the already-stable capability contract instead of reopening it
- Current pause point: stop at the first `P4-B` white-box preset entry and wait for a real next consumer before extending preset runtime APIs

## Phase Status

| Phase | Status | Notes |
|:--|:--|:--|
| P0 / Registry Foundation | `done` | `config -> adapter -> preset` pipeline is established |
| P1 / High-value Features | `done` | `attachments / senderActions / welcomePrompts` are formalized; blackbox and white-box defaults are aligned |
| P2 / MCP + Layout | `done` | `mcp`, `layout.variant`, `layout.placements`, and `workspace` layout variant are formalized |
| P3 / Template / CLI Consumption | `done` | stable capability contract, explicit template mapping, and registry-backed consumers are in place |
| P4 / Agent Preset + Skill Pack | `in progress` | `P4-A` is complete; `P4-B` has started with chat-side preset consumption |
| P5 / Theme + Workspace Shell + Content Navigation | `later` | boundaries are now drafted; not on the active path yet |

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
- `workspace` remains a pure content-layout variant, not a shell bundle
- future `P5` navigation should attach to center content as a host-level layer, not reopen `P2 layout`
- `chat-cli` should consume stable chat capability outputs, not invent new chat-layer abstractions

## Next Step

1. Keep the current stop point at `P4-B` until a real next consumer appears.
2. If the next need is still inside `packages/chat`, continue `P4-B` in an additive way on top of the current resolver and preset-slice chain.
3. If the next need is shell or theming, define `P5` boundaries first instead of growing preset APIs speculatively.
4. Do not let `chat-cli` consume broader `P4` outputs until the next preset boundary is explicit and test-covered.

## P5 Draft Direction

- `P5` is now framed as three internal tracks:
  - `P5-A / Theme & Appearance`
  - `P5-B / Workspace Shell & Regions`
  - `P5-C / Content Navigation & View State`
- `P5-B` now has a minimum API draft covering:
  - region host config
  - panel definition config
  - top-bar and center-layout config
  - `fullWidth` view-state config
- `packages/chat` now has first formal `P5-B` runtime skeletons:
  - `TrChatWorkspaceShell`
  - `TrChatWorkspacePanelHost`
- `P5-B` runtime state is now one step more formal:
  - shell owns controlled/uncontrolled region collapse
  - shell owns region-level active-panel state
  - shell emits region collapse and panel change events
  - panel host supports `activePanelId` and `defaultActivePanelId`
- a dedicated workspace runtime unit test now covers:
  - region width resolution
  - collapse-state resolution
  - panel definition -> host item mapping
  - active-panel fallback and lookup behavior
- the demo `P5` preview now consumes the formal shell and panel-host components instead of local-only shell wrappers
- `fullWidth` is now consumed through formal `WorkspaceShell.viewState` instead of a demo-only page class
- `notebook` is intentionally not formalized yet; current shell direction is to reserve generic panel hosts and slots for future panel content
- `region.panels` now flows through shell runtime slot props before reaching the demo panel host
- current screenshot usage is intentionally narrow:
  - visual shell spacing
  - radius
  - clipping
  - page-level polish
- current first demo goal for `P5` is also intentionally narrow:
  - add a demo-visible workspace shell treatment
  - verify margin and rounded-card presentation
  - avoid treating the first demo as proof of final panel contracts
- `P2 layout` stays limited to chat content layout:
  - `bubble / docs / workspace`
  - role placements
  - message-list presentation
- `P5` should own:
  - shell regions
  - notebook or right-panel hosting
  - docked composer hosting
  - content-attached navigation
  - runtime view toggles such as notebook and full-width mode
- `P5` should not:
  - move shell concerns back into `layout.variant`
  - collapse user navigation and assistant navigation into one source model
  - let theme own shell structure

## P3 Current Progress

- [x] `P3-A` has started on the chat side.
- [x] `createChatCliCapabilitySurface()` now exposes the stable Phase C contract for CLI consumption.
- [x] The current contract now covers:
  - feature keys: `attachments / senderActions / welcomePrompts / mcp / history / feedback`
  - preset props: `attachmentsFeature / senderActionsFeature / prompts / mcpManager / messageListVariant / roleConfigs / showHistory / historyProps / showFeedback`
  - preset slices: `root / layout / header / welcome / messageList / sender / history / modelSelector`
- [x] `P3-B` has started with a minimal template registry foundation in `chat-cli`
- [x] the minimal `chat-cli` registry and hygiene baseline is now in place:
  - `requiredChatFeatures` is meaningful for `basic`
  - `contractUsage` now makes `basic`'s contract consumption mode and consumed slice keys explicit
  - template validation reads registry metadata and template files
  - prepare gate blocks invalid template hygiene
- [x] `basic` now consumes `history` through `features.history` instead of a template-local `showHistory` override
- [x] `basic` now consumes `chatCapabilitySurface.presetSlices` through a white-box template path instead of binding a handwritten `chatPreset` blackbox object
- [x] `P3-B` explicit feature-aware mapping closeout is now real for `basic`
- [x] `P3-C` capability-driven template wiring is now real for `basic`
- [x] `P3-D` scaffold and smoke closeout is green for the current `basic` consumer path
- [x] `agent-mcp` now exists as a second registry-backed template that consumes the current `mcp` contract through explicit `contractUsage`

## P3 Result

- [x] `createChatCliCapabilitySurface()` now exposes the stable template-facing contract for CLI consumption
- [x] stable consumable feature keys now cover:
  - `attachments`
  - `senderActions`
  - `welcomePrompts`
  - `mcp`
  - `history`
  - `feedback`
- [x] stable consumable preset prop keys now cover:
  - `attachmentsFeature`
  - `senderActionsFeature`
  - `prompts`
  - `mcpManager`
  - `messageListVariant`
  - `roleConfigs`
  - `showHistory`
  - `historyProps`
  - `showFeedback`
- [x] stable consumable preset slices now cover:
  - `root`
  - `layout`
  - `header`
  - `welcome`
  - `messageList`
  - `sender`
  - `history`
  - `modelSelector`
- [x] template registry metadata is explicit and validated through `requiredChatFeatures` and `contractUsage`
- [x] `basic` and `agent-mcp` both consume the stable contract through registry-backed white-box template paths
- [x] scaffold and smoke verification are green for the current stable templates

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
- Keep this as support work, not the active design driver.
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
- Only make the smallest `chat-cli` edits needed to consume the current chat outputs.
- Do not introduce new chat abstractions in CLI just to make scaffolding easier.

### P3-D. Close the loop with scaffold and smoke verification

- Verify generated templates actually consume the capability contract instead of duplicating demo/page logic.
- Keep the first round focused on stable generation and maintainability, not on adding more templates.

## P3 Test Order

1. Chat unit tests first.
   - Extend contract-level tests around `createChatCliCapabilitySurface()`.
   - Verify `attachments / senderActions / welcomePrompts / mcp / history / feedback / layout` are exposed in the expected template-facing shape.

2. `chat-cli` registry and mapping tests second.
   - Verify template registry metadata can consume the stable chat contract.
   - Verify `requiredChatFeatures` and template selection logic stay aligned with the contract.

3. Scaffold and smoke tests last.
   - Verify generated projects build with the intended capability combination.
   - Verify template output no longer depends on handwritten page-level wiring.

## P3 Done When

- `chat-cli` consumes stabilized outputs from `packages/chat` instead of relying on handwritten template logic.
- `feature -> template / preset` mapping is explicit and test-covered.
- the active implementation path remained chat-led rather than template-led
- The current stable capability set is consumable in CLI:
  - `attachments`
  - `senderActions`
  - `welcomePrompts`
  - `mcp`
  - `history`
  - `feedback`
  - `layout`
  - `header`
  - `modelSelector`
- Generated template output uses the existing chat capability pipeline rather than inventing a parallel one.
- Scaffold / smoke verification is green.

## P4 Entry Criteria

- [x] `P3` is complete.
- [x] `chat-cli` is already a real consumer of stable chat capabilities.
- [x] No new P4 idea requires reopening the Phase B or Phase C contract.
- [x] `AgentPreset / SkillPack` can be modeled as capability consumers on top of the existing chain, not as a replacement for it.

## P4 Acceptance Standard

- `AgentPreset` or `SkillPack` input is defined as a higher-level composition layer, not a parallel runtime path.
- `P4` outputs resolve back into the existing capability chain:
  - feature config
  - prompts
  - mcp manager or mcp hints
  - layout hints when needed
- the resolver boundary is explicit and test-covered on the chat side before any broad CLI expansion depends on it.
- no `P4` work reopens:
  - `senderProps.extensions` boundary
  - `layout` as presentation-only
  - the stable `chat-cli` consumption contract established in `P3`
- at least one concrete `P4` shape is consumable without bypassing:
  - `ChatConfig`
  - adapter
  - feature registry
  - preset / preset slices

## P4 Current Plan

- `P4-A` first delivers:
  - `AgentPreset` types
  - `SkillPack` types
  - a resolver that returns standard chat config patches
  - unit tests for merge rules and output boundaries
- `P4-A` does not yet deliver:
  - CLI flags
  - template marketplace
  - remote skill installation
  - workflow runtime
- Only after `P4-A` is stable should any `chat-cli` follow-up consumer work begin.

## P4 Current Progress

- [x] `P4-A` has started on the chat side.
- [x] `packages/chat/src/presets` now exists as the first preset-composition layer.
- [x] `AgentPreset` and `SkillPack` types now exist.
- [x] `resolveAgentPreset()` now resolves preset and skill inputs into standard chat config patches.
- [x] `createChatAdapterFromAgentPreset()` now proves preset output can flow back into the existing adapter chain.
- [x] merge rules now cover:
  - `defaults`
  - `ui.brand`
  - `ui.welcome`
  - `ui.prompts`
  - `layout.variant`
  - `layout.placements`
  - nested feature config objects
- [x] prompt and mcp resolver semantics are now explicit and test-covered:
  - `ui.prompts` defaults to replace
  - `ui.promptMode = 'append'` appends prompts to inherited or skill-provided prompts
  - `mcp` object overrides `mcp: true`
  - `mcp: false` explicitly disables mcp for the final resolved patch
- [x] `AgentPreset` now supports minimal preset inheritance through `extends`
- [x] built-in example preset and skill pack catalog now exists for internal reference:
  - `assistant-base`
  - `docs-reader`
  - `tool-agent`
  - `conversation-core`
  - `docs-layout`
  - `tool-agent-core`
- [x] `packages/chat/src/presets/README.md` now documents the current authoring contract for presets and skill packs
- [x] unit tests now cover:
  - skill pack ordering
  - preset-last override behavior
  - missing skill failure
  - missing inherited preset failure
  - circular preset inheritance detection
  - adapter consumption through the existing chain
  - nested config merge behavior against both skill packs and base config
  - built-in example resolution behavior
  - built-in preset consumption through `createPresetChatProps()` and `createPresetChatSlices()`

## P4-A Result

- [x] `AgentPreset` and `SkillPack` types are defined as a higher-level composition layer on top of the stable chat contract
- [x] preset resolution now supports:
  - skill pack merge
  - preset inheritance through `extends`
  - nested config merge
  - explicit prompt merge rules
  - explicit mcp merge rules
- [x] `createChatAdapterFromAgentPreset()` proves preset output can flow back into the existing adapter chain
- [x] built-in preset and skill pack examples now exist as internal reference shapes
- [x] internal authoring guidance now exists in `packages/chat/src/presets/README.md`
- [x] unit tests now cover both resolver semantics and preset consumption through preset props / slices
- [x] the first `P4-B` chat-side consumer helper now exists:
  - `createPresetConsumptionFromAgentPreset()`
  - output now includes `resolvedPreset / chatConfig / adapter / presetProps / presetSlices`
  - `presetOverrides` can shape the final preset props and slices without bypassing the existing chain

## P4-A Done When

- preset and skill pack composition resolves only into the existing chat capability chain
- merge rules are explicit and test-covered
- inheritance boundaries and failure cases are explicit and test-covered
- built-in examples and authoring guidance exist for internal reuse
- no `P4-A` work requires reopening the `P3` chat-cli consumption contract

## P4-A Status

- [x] `P4-A` is complete.

## P4-B Early Boundary

- `P4-B` has now started at the smallest useful consumer boundary inside `packages/chat`.
- The first consumer helper is:
  - `createPresetConsumptionFromAgentPreset()`
- Its purpose is:
  - consume `AgentPreset` through the existing preset resolver layer
  - return ready-to-use adapter output
  - return ready-to-use preset props
  - return ready-to-use preset slices
- This keeps preset consumption chat-led and avoids pushing the next integration step into `chat-cli` too early.

## P4-B Current Progress

- [x] `TrChat.PresetRoot` now exists as the first white-box preset entry.
- [x] `TrChat.PresetRoot` consumes:
  - `baseConfig`
  - `preset`
  - optional preset catalog inputs
  - optional `presetOverrides`
- [x] `TrChat.PresetRoot` exposes scoped-slot consumption for:
  - `resolvedPreset`
  - `chatConfig`
  - `adapter`
  - `presetProps`
  - `presetSlices`
  - `chatKit`
- [x] a dedicated `preset-entry` verification scenario now exists in `packages/test/src/chat/index.vue`
- [x] `packages/test/src/chat/preset-entry.spec.ts` verifies:
  - built-in preset metadata reaches the white-box entry
  - resolved welcome and prompt content render through preset slices
  - prompt click keeps the injected `chatKit` live
  - `docs` layout placement behavior survives after prompt consumption

## Verified

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/layout-config.spec.ts src/chat/mcp-feature.spec.ts src/chat/index.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/sender-extensions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/preset-entry.spec.ts`
