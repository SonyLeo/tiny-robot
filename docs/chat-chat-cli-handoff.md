# Chat / Chat CLI Handoff

> Snapshot date: `2026-03-19`
> Purpose: help another LLM or collaborator enter the current implementation state quickly without relying on previous chat history
> Primary status boards:
> - [packages/chat/progress.md](../packages/chat/progress.md)
> - [packages/chat-cli/progress.md](../packages/chat-cli/progress.md)

---

## 1. Executive Summary

This repo currently has two related but distinct tracks:

- `packages/chat`: the runtime capability layer
- `packages/chat-cli`: the scaffold and template consumption layer

Current agreed state:

- `packages/chat` has completed `P0 / P1 / P2`
- `packages/chat` has completed `P3 / Template / CLI Consumption`
- `packages/chat` has completed `P4-A / Agent Preset + Skill Pack Foundation`
- `packages/chat` is now ready to define `P4-B`
- `packages/chat-cli` has started its own registry-first foundation work
- the current CLI registry and hygiene baseline is sufficient, so the next active implementation step should stay in `packages/chat`

The most important architectural rule is:

- `packages/chat` defines and stabilizes capability contracts
- `packages/chat-cli` consumes those contracts
- `chat-cli` must not invent new chat-layer abstractions before consumption is stable

This rule is active and should continue to guide implementation.

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

### 5.3 CLI implementation

1. `packages/chat-cli/src/templateRegistry.ts`
2. `packages/chat-cli/src/index.ts`
3. `packages/chat-cli/src/scaffold.ts`

### 5.4 High-value tests

Chat unit:

- `packages/chat/tests/use-chat-slices.test.mjs`

Chat E2E:

- `packages/test/src/chat/welcome-prompts.spec.ts`
- `packages/test/src/chat/sender-actions.spec.ts`
- `packages/test/src/chat/sender-extensions.spec.ts`
- `packages/test/src/chat/mcp-feature.spec.ts`
- `packages/test/src/chat/layout-config.spec.ts`
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

- `P4-B / next consumer or integration boundary not yet defined`

Later:

- `P5 / Theme / Workspace Shell`

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

### 7.1 `chat` P3 and `P4-A` are complete and `chat` can define `P4-B`

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

---

## 10. Verification Baseline

The following commands were part of the current working baseline during this implementation cycle.

Chat:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
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

3. Confirm current CLI registry state in:
   - `packages/chat-cli/src/templateRegistry.ts`
   - `packages/chat-cli/src/index.ts`

4. Pick the next task from this order:
   - define the next `P4-B` boundary in `packages/chat`
   - keep `chat-cli` follow-up work limited to hardening existing sample templates unless a new chat-side contract requires more
   - keep template generation registry-first
   - keep `docs-chat` waiting for retrieval contract clarity

5. After any change:
   - update the matching `progress.md`
   - update review only if execution rules changed
   - run the relevant test baseline

---

## 12. One-sentence Current State

`packages/chat` has already completed `P3` and `P4-A` by stabilizing both a real template-consumption contract and a first preset/skill composition foundation, while `packages/chat-cli` now has a usable registry and hygiene baseline plus two stable white-box sample templates in `basic` and `agent-mcp`.
