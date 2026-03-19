# Chat / Chat CLI Handoff

> Snapshot date: `2026-03-20`
> Purpose: help another LLM or collaborator enter the current implementation state quickly without relying on previous chat history
> Primary status boards:
> - [packages/chat/progress.md](../packages/chat/progress.md)
> - [packages/chat-cli/progress.md](../packages/chat-cli/progress.md)
> - [chat-p5-proposal.md](./chat-p5-proposal.md)
> - [chat-p5-b-api-draft.md](./chat-p5-b-api-draft.md)

---

## 1. Executive Summary

This repo currently has two related but distinct tracks:

- `packages/chat`: the runtime capability layer
- `packages/chat-cli`: the scaffold and template consumption layer

Current agreed state:

- `packages/chat` has completed `P0 / P1 / P2`
- `packages/chat` has completed `P3 / Template / CLI Consumption`
- `packages/chat` has completed `P4-A / Agent Preset + Skill Pack Foundation`
- `packages/chat` has now started `P4-B` at the first chat-side consumer-helper boundary
- `packages/chat` is intentionally paused at the first `P4-B` white-box preset entry until a real next consumer appears
- `packages/chat-cli` has started its own registry-first foundation work
- the current CLI registry and hygiene baseline is sufficient, so the next active implementation step should stay in `packages/chat`

The most important architectural rule is:

- `packages/chat` defines and stabilizes capability contracts
- `packages/chat-cli` consumes those contracts
- `chat-cli` must not invent new chat-layer abstractions before consumption is stable

This rule is active and should continue to guide implementation.

For current `P5` work, the most relevant new reference is:

- `docs/chat-p5-b-api-draft.md`

That draft captures the current minimum shell contract derived from the demo validation work.

The current runtime situation is now:

- `packages/chat` contains first formal `P5-B` component skeletons:
  - `TrChatWorkspaceShell`
  - `TrChatWorkspacePanelHost`
- the demo preview has already switched to consuming those formal components
- `fullWidth` now enters the demo through formal `viewState` consumption on `TrChatWorkspaceShell`
- `notebook` is not yet a formal runtime view-state commitment; current shell work keeps panel hosting generic so future panel types can mount without locking the API too early
- panel content is still demo-owned, but shell and host structure are no longer demo-only
- the current `P5-B` runtime contract is now stronger than the earliest demo-only shell draft:
  - shell owns region collapse state
  - shell owns region-level active-panel state
  - shell emits region collapse and panel change events
  - shell passes `panels / panelItems / activePanelId / setActivePanel` through region slot props
  - panel host supports both controlled and default active-panel inputs
- the current `P5-B` implementation also has a dedicated runtime helper layer in:
  - `packages/chat/src/components/workspace/runtime.ts`
  - this helper layer now owns:
    - region width resolution
    - collapse-state resolution
    - panel definition -> host item mapping
    - active-panel fallback and lookup semantics

One important local rule from the latest work cycle:

- do not modify `packages/components` for `P5-B` shell/layout fixes unless explicitly approved
- current shell, height-chain, and panel-host fixes should stay inside `packages/chat`

---

## 2. What Has Been Completed In `packages/chat`

### 2.1 P0: Registry Foundation

Completed:

- `ChatConfig -> Adapter -> Preset` pipeline is established
- feature resolution path is in place
- preset props can be produced from config-driven capabilities

Key files:

- `packages/chat/src/adapters/config.ts`
- `packages/chat/src/features/registry.ts`
- `packages/chat/src/features/types.ts`

### 2.2 P1: High-value feature formalization

Completed:

- `suggestions -> welcomePrompts` naming is unified
- legacy compatibility for older `suggestions` config is preserved
- `attachments` is formalized through the main feature chain
- `senderActions` is formalized through the main feature chain
- `welcomePrompts` is formalized through the main feature chain
- `createPresetChatSlices()` exists as the shared white-box consumption surface
- sender extensions are intentionally not promoted into the chat feature registry

Important boundary:

- `Sender Suggestion / Mention / Template` stays in `senderProps.extensions`
- this is passthrough territory, not first-party feature territory

Tests added / relied on:

- `packages/chat/tests/use-chat-slices.test.mjs`
- `packages/test/src/chat/welcome-prompts.spec.ts`
- `packages/test/src/chat/sender-actions.spec.ts`
- `packages/test/src/chat/sender-extensions.spec.ts`
- `packages/test/src/chat/index.spec.ts`

### 2.3 P1 blackbox / white-box alignment

Completed:

- `createPresetChatSlices()` is now the stable white-box default consumption surface
- priority between `preset slices`, props, and slots was verified around:
  - welcome prompts
  - sender defaults
  - sender actions
- sender extensions are verified only at passthrough level in blackbox and white-box scenarios

Important rule:

- do not convert sender extensions into resolver / preset features unless design changes explicitly

### 2.4 P2: MCP + Layout formalization

Completed:

- `mcp` is now a first-party chat feature
- `features.mcp.manager` flows through:
  - config
  - resolver
  - preset props
  - preset slices
- `layout.variant` and `layout.placements` are formalized
- explicit placements override variant defaults
- `workspace` is now a pure layout variant

Important boundary:

- `workspace` is presentation only
- `workspace` is not a hidden shell bundle
- `layout` must stay separate from feature enablement

Key files:

- `packages/chat/src/adapters/config.ts`
- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/components/chat/Chat.vue`
- `packages/chat/src/components/chat/ChatRoot.vue`
- `packages/chat/src/components/chat/ChatMcpPanel.vue`
- `packages/chat/src/styles/layout.css`
- `packages/chat/src/types.ts`

Tests added / relied on:

- `packages/chat/tests/use-chat-slices.test.mjs`
- `packages/test/src/chat/mcp-feature.spec.ts`
- `packages/test/src/chat/layout-config.spec.ts`
- `packages/test/src/chat/index.spec.ts`

### 2.5 P3: Template / CLI Consumption

Completed:

- a stable CLI-facing capability contract now exists in `packages/chat/src/adapters/chatCli.ts`
- contract outputs now cover:
  - feature keys: `attachments / senderActions / welcomePrompts / mcp / history / feedback`
  - preset prop keys: `attachmentsFeature / senderActionsFeature / prompts / mcpManager / messageListVariant / roleConfigs / showHistory / historyProps / showFeedback`
  - preset slice keys: `root / layout / header / welcome / messageList / sender / history / modelSelector`
- template-facing consumption is now proven by two stable templates:
  - `basic`
  - `agent-mcp`
- scaffold / smoke verification is green for the current stable templates

### 2.6 P4-A: Agent Preset + Skill Pack Foundation

Completed:

- `packages/chat/src/presets` now exists as the first preset-composition layer
- `AgentPreset` and `SkillPack` types now exist
- `resolveAgentPreset()` now resolves preset and skill input into standard chat config patches
- `createChatAdapterFromAgentPreset()` proves preset output can flow back into the existing adapter chain
- merge rules are now explicit for:
  - `defaults`
  - `ui.brand`
  - `ui.welcome`
  - `ui.prompts`
  - `layout.variant`
  - `layout.placements`
  - nested feature config objects
  - `mcp` object / boolean priority
- `AgentPreset.extends` now supports minimal preset inheritance
- built-in catalog now exists for internal reference:
  - presets: `assistant-base / docs-reader / tool-agent`
  - skill packs: `conversation-core / docs-layout / tool-agent-core`
- internal authoring guidance now exists in `packages/chat/src/presets/README.md`
- unit tests now cover both resolver semantics and preset consumption through preset props / slices

Important boundary:

- `P4-A` is still a chat-side composition foundation
- it does not yet introduce CLI input, workflow runtime, marketplace, or remote skill installation

### 2.7 P4-B: First consumer helper boundary

Completed so far:

- `createPresetConsumptionFromAgentPreset()` now exists
- it returns:
  - `resolvedPreset`
  - `chatConfig`
  - `adapter`
  - `presetProps`
  - `presetSlices`
- it supports `presetOverrides`, so callers can still shape the final props / slices without bypassing the existing chain

Why this matters:

- `P4-A` no longer stops at resolver-only proof
- `packages/chat` now has a first explicit preset consumer helper
- the next preset consumer step can stay chat-led instead of jumping too early into CLI-driven expansion

### 2.8 P4-B: First white-box preset entry

Completed:

- `TrChat.PresetRoot` now exists as the first white-box preset entry inside `packages/chat`
- it consumes:
  - `baseConfig`
  - `preset`
  - optional `presets`
  - optional `skillPacks`
  - optional `presetOverrides`
  - either `chatKit` or `responseProvider`
- it exposes scoped-slot consumption for:
  - `resolvedPreset`
  - `chatConfig`
  - `adapter`
  - `presetProps`
  - `presetSlices`
  - `chatKit`
- a dedicated `preset-entry` demo/test scenario now exists in:
  - `packages/test/src/chat/index.vue`
- `packages/test/src/chat/preset-entry.spec.ts` now verifies:
  - built-in preset id exposure
  - resolved welcome and prompt rendering
  - prompt click keeps the injected `chatKit` live
  - `docs` layout placement survives after prompt consumption

Important boundary:

- `TrChat.PresetRoot` is a chat-side white-box consumer entry
- it is not a new parallel runtime
- it must continue to resolve through:
  - preset resolver
  - adapter
  - preset props
  - preset slices

---

## 3. What Has Been Completed In `packages/chat-cli`

### 3.1 Registry foundation is now real

Completed:

- `ChatCliTemplateDefinition` exists
- `templateRegistry.ts` exists
- CLI no longer uses a purely hardcoded template list in `src/index.ts`

Current registry shape:

- `id`
- `label`
- `description`
- `status`
- `templateDir`
- `supportedProviders`
- `requiredChatFeatures`
- `contractUsage`
- `postScaffoldSteps`

Current registry contents:

- `basic`
- `agent-mcp`
- `status: stable`
- `supportedProviders: openai / deepseek / custom`

Key files:

- `packages/chat-cli/src/templateRegistry.ts`
- `packages/chat-cli/src/index.ts`

### 3.2 What the CLI entry now reads from registry

Completed:

- `--template` validation
- interactive template selection
- help output available template list
- `templateDir` resolution
- provider compatibility validation

This means the following old statement is now false:

- "template selection is still fully hardcoded"

### 3.3 What is still incomplete in `chat-cli`

Still pending:

- sample-template hardening is still incomplete:
  - metadata/source alignment is now enforced at a minimal white-box level, but can be strengthened
  - README tutorialization has improved, but stable template guidance can still be refined
  - UI-level sample smoke is still in progress and is not yet part of the accepted baseline
- registry shape is now proven across two stable templates, but broader multi-template governance is still incomplete

Current next target inside `chat-cli`:

- keep follow-up work narrow and treat `basic` and `agent-mcp` as sample templates to harden rather than expanding template count
- `basic` already consumes `chatCapabilitySurface.presetSlices` through a white-box composition path
- `agent-mcp` already proves the second template path using the current `mcp` contract, local MCP bridge starter, and explicit `contractUsage`
- current follow-up themes in `chat-cli` are:
  - metadata/source alignment
  - README tutorialization
  - stable template governance
  - UI-level sample smoke when ready

---

## 4. Stable Chat Capability Contract For CLI Consumption

This is one of the most important current facts.

`packages/chat` now exposes a stable CLI-facing capability surface in:

- `packages/chat/src/adapters/chatCli.ts`

Exports:

- `CHAT_CLI_CONSUMABLE_FEATURE_KEYS`
- `CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS`
- `CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS`
- `createChatCliCapabilitySurface()`

Current stable feature keys:

- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `history`
- `feedback`

Current stable preset prop keys:

- `attachmentsFeature`
- `senderActionsFeature`
- `prompts`
- `mcpManager`
- `messageListVariant`
- `roleConfigs`
- `showHistory`
- `historyProps`
- `showFeedback`

Current stable preset slice keys:

- `root`
- `layout`
- `header`
- `welcome`
- `messageList`
- `sender`
- `history`
- `modelSelector`

This contract is the current bridge between `packages/chat` and `packages/chat-cli`.

If a future change affects template consumption, this is the first file to inspect.

Contract verification lives in:

- `packages/chat/tests/use-chat-slices.test.mjs`

---

## 5. Key Files To Read First

If another LLM needs to continue work quickly, read in this order.

### 5.1 Status and rules

1. `packages/chat/progress.md`
2. `packages/chat-cli/progress.md`
3. `packages/chat/chat-kit-review-02.md`
4. `packages/chat-cli/chat-cli-review-02.md`

### 5.2 Chat runtime implementation

1. `packages/chat/src/adapters/config.ts`
2. `packages/chat/src/adapters/chatCli.ts`
3. `packages/chat/src/adapters/types.ts`
4. `packages/chat/src/features/registry.ts`
5. `packages/chat/src/features/types.ts`
6. `packages/chat/src/components/chat/Chat.vue`
7. `packages/chat/src/types.ts`
8. `packages/chat/src/components/workspace/WorkspaceShell.vue`
9. `packages/chat/src/components/workspace/WorkspacePanelHost.vue`
10. `packages/chat/src/components/workspace/runtime.ts`

### 5.3 CLI implementation

1. `packages/chat-cli/src/templateRegistry.ts`
2. `packages/chat-cli/src/index.ts`
3. `packages/chat-cli/src/scaffold.ts`

### 5.4 High-value tests

Chat unit:

- `packages/chat/tests/use-chat-slices.test.mjs`
- `packages/chat/tests/workspace-runtime.test.mjs`

Chat E2E:

- `packages/test/src/chat/welcome-prompts.spec.ts`
- `packages/test/src/chat/sender-actions.spec.ts`
- `packages/test/src/chat/sender-extensions.spec.ts`
- `packages/test/src/chat/mcp-feature.spec.ts`
- `packages/test/src/chat/layout-config.spec.ts`
- `packages/test/src/chat/preset-entry.spec.ts`
- `packages/test/src/chat/index.spec.ts`
- `packages/test/src/chat/index.vue`

CLI tests:

- `packages/test/src/chat-cli/scaffold.spec.ts`
- `packages/test/src/chat-cli/release.spec.ts`
- `packages/test/src/chat-cli/smoke.spec.ts`

---

## 6. Current Phase Breakdown

### 6.1 `packages/chat`

Done:

- `P0 / Registry Foundation`
- `P1 / High-value Features`
- `P2 / MCP + Layout`
- `P3 / Template / CLI Consumption`
- `P4-A / Agent Preset + Skill Pack Foundation`

Current:

- `P4-B / first preset consumer boundary has started`

Current concrete shape:

- first consumer helper: `createPresetConsumptionFromAgentPreset()`
- first white-box entry: `TrChat.PresetRoot`

Later:

- `P5 / Theme + Workspace Shell + Content Navigation`

### 6.2 `packages/chat-cli`

Current:

- `P0 / Template Registry Foundation + Hygiene`

Later:

- `P1 / Agent MCP Template`
- `P2 / Retrieval / Docs Template`
- `P3 / Platform Evolution`

---

## 7. Recommended Next Steps

This is the currently agreed execution order.

### 7.1 `chat` P3 and `P4-A` are complete, and `P4-B` has now started at the first consumer helper boundary

What this means:

- the stable capability consumption path for CLI is in place
- `feature -> template / preset` mapping is explicit
- template generation is based on existing chat capability outputs
- the implementation path remained chat-led while `chat-cli` only followed where the contract needed to be proven in real generation

Current `P4` entry judgment:

- `P3` is complete
- `chat-cli` is already a real consumer of stable chat capabilities
- no current `P4` idea requires reopening the Phase B or Phase C contract
- `AgentPreset / SkillPack` can now be modeled as capability consumers on top of the existing chain

Current `P4-A` completion judgment:

- `AgentPreset / SkillPack` types exist
- resolver and merge rules are explicit and test-covered
- built-in preset catalog exists
- authoring guide exists
- built-in presets can flow through adapter -> preset props -> preset slices
- `P4-A` should now be treated as complete, and any further work should be framed as `P4-B`

Current `P4-B` early judgment:

- `createPresetConsumptionFromAgentPreset()` is the first explicit chat-side consumer helper
- preset output can now be consumed as:
  - adapter
  - preset props
  - preset slices
- the helper is additive and does not replace the existing resolver or adapter chain

Current `P4-B` next judgment:

- `TrChat.PresetRoot` now proves there is a real white-box consumer entry inside `packages/chat`
- the project is currently paused at this point on purpose
- the next `P4-B` step should only begin when a real consumer need appears and should stay additive while answering one of these:
  - whether a blackbox preset entry is needed at all
  - whether model/history/feedback should get preset-host level convenience composition
  - whether the next consumer should remain runtime-side before any broader CLI preset input

### 7.2 Keep `chat-cli` in small follow-up mode until the next chat-side increment is clear

Most immediate CLI work:

- keep template generation registry-first
- harden the two existing sample templates before adding more
- only add narrow consumer updates that match the current chat contract

### 7.3 `agent-mcp` is now established as the second stable template

What this proves:

- `mcp` in chat is stable enough for a second template
- the current registry and scaffold path can carry a second white-box contract consumer

What it does not prove yet:

- broader multi-template governance is complete
- `docs-chat` is ready

### 7.4 `docs-chat` should still wait for retrieval contract clarity

Reason:

- layout formalization is done
- retrieval contract is not the same thing as docs-looking UI

### 7.5 Current `P5-B` next-step judgment

Current `P5-B` has already moved past pure visual validation.

What is already true:

- `WorkspaceShell` is a formal runtime surface
- `WorkspacePanelHost` is a formal runtime surface
- `fullWidth` is already consumed as formal shell `viewState`
- region panel metadata now flows through shell runtime state before reaching the panel host
- unit coverage now exists for core runtime semantics

What is still not formalized:

- a shell-owned built-in region host renderer
- persistence for collapsed state or active panel state
- drag-to-resize
- multi-panel split view
- a public custom-panel registration protocol

Recommended immediate next task for another LLM:

1. keep `P5-B` additive and runtime-focused
2. avoid reopening `P2 layout`
3. prefer formalizing one more shell/runtime contract step before expanding demo semantics
4. likely best next target:
   - either add minimal E2E verification for current shell/panel-host runtime behavior
   - or document and formalize the public slot/emit contract more explicitly before adding more features

---

## 8. Important Design Boundaries

These boundaries are active and should not be casually reopened.

### 8.1 Sender boundary

- first-party chat features currently are:
  - `attachments`
  - `senderActions`
  - `welcomePrompts`
  - `mcp`
- sender extensions remain in:
  - `senderProps.extensions`

Do not:

- move `Suggestion / Mention / Template` into the feature registry by default
- add resolver / preset feature work for sender extensions without an explicit design decision

### 8.2 Layout boundary

- `layout` is presentation-level only
- `workspace` is a pure layout variant

Do not:

- grow shell behavior into `layout`
- hide capability enablement inside layout variants

### 8.4 P5 boundary

- `P5` should be treated as:
  - theme and appearance
  - workspace shell and regions
  - content navigation and view state
- future navigation should attach to the center content host layer
- user navigation and assistant navigation may share a host, but must not share one source model

Do not:

- treat `P5` as a continuation of `P2 layout`
- put notebook, full-width mode, or content navigation into `layout.variant`
- let theme tokens own shell structure

### 8.3 CLI boundary

- `chat-cli` is a consumer
- `chat-cli` is not the place to define new chat runtime abstractions

Do not:

- fork page-level wiring if stable chat outputs already exist
- make template-specific logic override the chat capability contract

---

## 9. Known Risks And Caveats

### 9.1 Not all old documents are trustworthy

Some older documents still contain outdated statements or encoding issues.

Treat these as authoritative first:

- `packages/chat/progress.md`
- `packages/chat-cli/progress.md`
- `packages/chat/chat-kit-review-02.md`
- `packages/chat-cli/chat-cli-review-02.md`
- `docs/chat-cli-design.md`

Be careful with older review files or strategy notes that may still mention:

- no registry in CLI
- fully hardcoded template selection
- old feature contract that stops at `welcomePrompts`

### 9.2 Encoding history

Some markdown files in this repo previously had encoding problems during edits.

Practical guidance:

- prefer ASCII-safe edits for new handoff and status documents
- verify final file content after writing

### 9.3 Demo is not the main priority

There is known demo-specific friction in `packages/chat/demo`.

Current agreed rule:

- prioritize `packages/chat` capability work
- treat demo as a verification aid, not the release-critical path

### 9.4 Demo currently validates formal `P5-B` runtime, but does not define final panel semantics

The current demo page:

- already consumes formal `WorkspaceShell`
- already consumes formal `WorkspacePanelHost`
- no longer owns the shell-width logic for `fullWidth`
- still owns example panel content and presentation copy

Interpretation rule:

- treat demo as proof that the current runtime contract works
- do not treat the current `history / sources / pinned / notes / mcp / outline` panel examples as final product semantics

---

## 10. Verification Baseline

The following commands were part of the current working baseline during this implementation cycle.

Chat:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/preset-entry.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- --workers=1 src/chat/sender-extensions.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/layout-config.spec.ts src/chat/mcp-feature.spec.ts src/chat/index.spec.ts`

CLI:

- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -F create-tiny-robot prepare:templates`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`

If a future change touches both chat capability contract and CLI registry logic, re-run both groups.

---

## 11. Practical Resume Checklist For Another LLM

If another LLM needs to resume implementation, the fastest safe path is:

1. Read:
   - `packages/chat/progress.md`
   - `packages/chat-cli/progress.md`
   - this handoff document

2. Confirm current upstream contract in:
   - `packages/chat/src/adapters/chatCli.ts`
   - `packages/chat/src/components/workspace/WorkspaceShell.vue`
   - `packages/chat/src/components/workspace/WorkspacePanelHost.vue`
   - `packages/chat/src/components/workspace/runtime.ts`

3. Confirm current CLI registry state in:
   - `packages/chat-cli/src/templateRegistry.ts`
   - `packages/chat-cli/src/index.ts`

4. Pick the next task from this order:
   - extend the first `P4-B` consumer-helper boundary only if the next consumer need is explicit
   - keep `chat-cli` follow-up work limited to hardening existing sample templates unless a new chat-side contract requires more
   - keep template generation registry-first
   - keep `docs-chat` waiting for retrieval contract clarity
   - for `P5-B`, prefer formal runtime closeout over adding more demo-only affordances

5. After any change:
   - update the matching `progress.md`
   - update review only if execution rules changed
   - run the relevant test baseline

6. For `P5-B` specifically:
   - do not modify `packages/components` unless explicitly approved
   - keep shell/layout fixes inside `packages/chat`
   - preserve the boundary:
     - `layout.variant` handles content presentation
     - `WorkspaceShell` handles shell regions and shell state

---

## 12. One-sentence Current State

`packages/chat` has already completed `P3` and `P4-A`, and has now started `P4-B` with both a first preset consumer helper and a first white-box preset entry, while `packages/chat-cli` stays in a narrow follow-up role with two stable white-box sample templates in `basic` and `agent-mcp`.

---

## 13. Latest P5 Discussion Snapshot

The most recent `P5` discussion added three practical execution rules:

- referenced screenshots currently act as visual shell references first
- the near-term demo goal is visual validation, not shell-contract proof
- the first implementation step should favor outer-shell polish before panel semantics

What the screenshots are currently being used for:

- margin around the workspace shell
- larger shell radius
- cleaner clipping and page-level breathing room
- a more refined "chat inside a workspace card" presentation

What they are not being used for yet:

- locking left and right panel semantics
- locking notebook behavior
- locking navigation source models
- defining the final `P5-B` public API

Practical implication:

- when implementation resumes, start from demo-visible shell polish
- confirm visual direction first
- only then decide whether to formalize regions, panel hosts, and panel state

Current implementation has now moved beyond that initial discussion point:

- shell, panel host, and `fullWidth` are already formal runtime surfaces in `packages/chat`
- the current remaining `P5-B` work is now about stabilizing runtime contract details rather than proving visual direction
- current runtime verification should focus on:
  - collapse control
  - region panel metadata flow
  - active-panel state flow
  - shell-to-demo consumption boundaries

Concretely, the latest finished `P5-B` step is:

- shell slot props now expose:
  - `collapsed`
  - `toggle`
  - `region`
  - `panels`
  - `panelItems`
  - `activePanelId`
  - `setActivePanel`
- shell now emits:
  - `update:leftCollapsed`
  - `update:rightCollapsed`
  - `update:leftActivePanelId`
  - `update:rightActivePanelId`
  - `left-panel-change`
  - `right-panel-change`
- panel host now supports:
  - `activePanelId`
  - `defaultActivePanelId`
  - `update:activePanelId`
  - `change`
- unit tests now lock the helper semantics behind those runtime behaviors
