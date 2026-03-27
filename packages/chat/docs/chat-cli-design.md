# Chat CLI Design

> Last updated: `2026-03-27`
> Review: [../packages/chat-cli/chat-cli-review-02.md](../packages/chat-cli/chat-cli-review-02.md)
> Progress: [../packages/chat-cli/progress.md](../packages/chat-cli/progress.md)
> Related: [Chat Sidebar Shell 默认布局规划](./chat-sidebar-shell-plan.md)

---

## 1. Goal

`packages/chat-cli` should be the scaffold and template consumption layer for TinyRobot chat applications.

Its job is to:

- present stable templates to users
- scaffold projects from template metadata
- validate template hygiene
- consume stable chat capabilities from `packages/chat`

It should not become a second chat architecture.

---

## 2. Core Principle

The core principle is:

- `packages/chat` defines and stabilizes capabilities
- `packages/chat-cli` consumes those capabilities through template metadata

This keeps the direction clear:

- chat owns runtime capability contracts
- CLI owns template packaging and project generation

---

## 3. Current Upstream Contract

As of `2026-03-18`, the stable contract exposed by `packages/chat` for CLI consumption is:

### 3.1 Feature keys

- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `history`
- `feedback`

### 3.2 Preset prop keys

- `attachmentsFeature`
- `senderActionsFeature`
- `prompts`
- `mcpManager`
- `messageListVariant`
- `roleConfigs`
- `showHistory`
- `historyProps`
- `showFeedback`

### 3.3 Preset slice keys

- `root`
- `layout`
- `header`
- `welcome`
- `messageList`
- `sender`
- `history`
- `modelSelector`

CLI should treat this as the current stable upstream surface.

### 3.4 Planned upstream expansion

`packages/chat` is now planning a sidebar-shell default-layout upgrade.

The important CLI rule is:

- CLI must not invent its own sidebar abstraction ahead of `packages/chat`
- templates should consume the future upstream `shell` contract after it stabilizes
- template authors should not fork page-level shell logic inside `basic` / `agent-mcp` just to get ahead of the package contract

Until that shell contract lands, the list above remains the current stable surface.

---

## 4. CLI Architecture

The intended CLI architecture has four layers.

### 4.1 Commands

The CLI entry handles:

- flags
- interactive selection
- provider choice
- overwrite / install flow

### 4.2 Template Registry

The registry is the single source of truth for:

- stable template ids
- labels and descriptions
- template directories
- supported providers
- required chat capabilities
- post-scaffold steps

### 4.3 Scaffold Engine

The scaffold engine handles:

- copying template files
- replacing variables
- writing project output
- running optional install flow

### 4.4 Validation / Governance

Validation should enforce:

- template structure
- ignored build artifacts
- required metadata
- release and prepare hygiene

---

## 5. Template Metadata Model

The current registry model is based on `ChatCliTemplateDefinition`.

Each template definition should eventually describe:

- `id`
- `label`
- `description`
- `status`
- `templateDir`
- `supportedProviders`
- `requiredChatFeatures`
- `contractUsage`
- `postScaffoldSteps`

The short-term goal is not to make this infinitely flexible.

The short-term goal is:

- enough metadata to remove hardcoded CLI assumptions
- enough metadata to align template expectations with the stable chat contract

---

## 6. Phase Plan

### Phase A: Template Registry Foundation + Hygiene

Objectives:

- establish registry as the template source of truth
- remove hardcoded template selection logic
- make template hygiene checks reliable
- make `requiredChatFeatures` meaningful

### Phase B: `agent-mcp`

Objectives:

- scaffold a template that consumes stabilized `mcp`
- avoid bypassing the chat config / adapter / preset chain

### Phase C: `docs-chat`

Objectives:

- scaffold a template that consumes stabilized layout inputs
- depend on a real retrieval contract, not only docs-facing UI
- avoid baking template-local sidebar shell behavior before the upstream shell contract is stable

### Phase D: `base + feature packs + add`

Objectives:

- support more composable template evolution
- build on proven registry and template metadata

---

## 7. Execution Rules

Rules that should guide implementation:

- registry-first before adding more templates
- consume chat capabilities, do not re-specify them in CLI
- do not add template-specific runtime behavior into `packages/chat`
- do not let CLI invent new chat abstractions just to simplify scaffolding
- do not start `agent-mcp` or `docs-chat` on top of unstable template metadata

---

## 8. Done Criteria

`chat-cli` is in a healthy state when:

- template selection is registry-driven
- registry metadata is aligned with the stable chat contract
- validation catches broken templates before release
- scaffold / smoke tests prove the generated projects still work
- new templates consume existing chat capabilities instead of forking page logic

---

## 9. Relationship To Later Phases

After CLI can stably consume existing chat capabilities:

- `packages/chat` can continue into `P4 / Agent Preset + Skill Pack`
- sidebar-shell formalization should be consumed as an upstream chat capability rather than reimplemented inside template code
- broader theme / workspace-shell evolution can then layer on top of that stabilized shell contract
- CLI can then grow broader template packs and workflow tooling without reopening the lower-level contract

This ordering is intentional.
