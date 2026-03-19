# Chat CLI Review 02

> Snapshot date: `2026-03-18`
> Design: [../../docs/chat-cli-design.md](../../docs/chat-cli-design.md)
> Chat progress: [../chat/progress.md](../chat/progress.md)
> CLI progress: [./progress.md](./progress.md)

---

## 1. Current Execution Baseline

Current agreed status:

- `packages/chat` has completed `P0 / P1 / P2`.
- `packages/chat` is now in `P3 / Template / CLI Consumption`.
- `packages/chat-cli` has started its own `P0 / Template Registry Foundation + Hygiene`.
- `chat-cli` already has a minimal template registry foundation and is no longer in a "not started" state.
- the current CLI registry and hygiene baseline is sufficient for now, so active execution should stay chat-led

What is already true in code:

- `packages/chat` exposes a stable Phase C-ready CLI consumption contract through:
  - `CHAT_CLI_CONSUMABLE_FEATURE_KEYS`
  - `CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS`
  - `CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS`
  - `createChatCliCapabilitySurface()`
- `packages/chat-cli` now has:
  - `ChatCliTemplateDefinition`
  - `templateRegistry.ts`
  - registry-driven `--template` validation
  - registry-driven interactive template selection
  - registry-driven help output
  - registry-driven template directory resolution
  - meaningful `requiredChatFeatures` metadata for `basic`
  - explicit `contractUsage` metadata for `basic`
  - template validation that reads registry metadata together with template files
  - prepare gating that blocks invalid template hygiene

What is not complete yet:

- some CLI-facing docs and flows still contain stale placeholder wording.
- capability-driven template wiring is still not fully in place.
- the registry currently proves the mechanism with `basic`, not the full future template system.
- `agent-mcp`, `docs-chat`, and `assistant-workbench` are not ready to be treated as stable templates.
- the next CLI changes should stay small and contract-following while `packages/chat` remains the active mainline.

---

## 2. Responsibilities And Boundaries

### 2.1 What `packages/chat` owns

`packages/chat` is still the source capability layer.

It owns:

- feature formalization
- feature resolution
- preset props
- preset slices
- the stable contract that CLI and templates consume

It does not own:

- template packaging
- scaffold governance
- CLI interaction design
- template lifecycle management

### 2.2 What `packages/chat-cli` owns

`packages/chat-cli` owns the template-facing consumption layer.

It should own:

- template registry
- template metadata
- scaffold engine
- template hygiene validation
- CLI command flow
- template-level provider support policy

It should not:

- invent new chat-layer abstractions
- bypass `packages/chat` with handwritten page-level capability logic
- redefine feature semantics that already belong to `packages/chat`

### 2.3 Rule Between The Two Packages

The rule is:

- `packages/chat` stabilizes capability outputs first.
- `packages/chat-cli` consumes those outputs second.
- higher-level template and workflow concepts can be built only after that consumption path is real and test-covered.

---

## 3. Current Implementation Snapshot

### 3.1 Upstream contract currently exposed by `packages/chat`

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

This means CLI can now reason about both:

- feature enablement
- template-facing layout and MCP inputs

### 3.2 What the current registry foundation already solves

The current registry foundation already centralizes:

- available stable templates
- template label and description
- template directory lookup
- supported providers
- post-scaffold steps

This removes the earlier hardcoded template list from the CLI entry path.

### 3.3 What still remains before the registry is considered stable

The registry is not fully mature until:

- CLI-facing wording no longer points to dead ends or outdated assumptions
- capability-driven template wiring consumes the current chat outputs instead of handwritten page logic
- at least one more non-trivial template path proves the metadata shape

The first item above is now partly addressed for `basic`:

- its required feature set is explicit
- its contract consumption mode is explicit
- its consumed preset slices are explicit

---

## 4. Outdated Statements That Must Not Guide Execution

The following statements are now outdated and should not guide implementation:

- "`chat-cli` has not started."
- "Template selection is still fully hardcoded."
- "The stable upstream chat contract only includes `attachments / senderActions / welcomePrompts`."
- "CLI can only see `root / welcome / sender` on the white-box side."

The following statements are still valid:

- "Registry hygiene is not complete."
- "Feature-aware template metadata is not complete."
- "Multi-template governance is not complete."
- "Template generation must stay registry-first."

---

## 5. Recommended Execution Order

### 5.1 Phase A: Keep Registry Foundation + Hygiene Stable

Priority items:

- close leftover placeholder wording and dead-end assumptions
- keep registry metadata and validation aligned with the current chat contract
- only make narrow consumer updates when a chat-side capability change requires them

Why this is first:

- without this, adding more templates only grows drift
- however, this should now be maintenance work, not the active driver of the next implementation step

### 5.2 Phase B: `agent-mcp`

Only start after Phase A is stable.

Expected dependency:

- consume `mcp` through the stable chat contract
- do not wire MCP by bypassing the existing config / adapter / preset chain

### 5.3 Phase C: `docs-chat`

Only start after:

- retrieval contract is clear
- docs template is not just a UI shell over ad hoc page logic

Expected dependency:

- consume stabilized layout and retrieval-facing capability inputs

### 5.4 Phase D: `base + feature packs + add`

This is later work.

It should build on:

- a stable registry
- real template metadata
- at least one or two proven feature-aware templates

It should not arrive before the basic registry and governance path is trustworthy.

---

## 6. Acceptance Standards

### 6.1 Phase A is done when

- registry is the single source of truth for stable template selection
- CLI help, interactive selection, and validation all read from registry
- `requiredChatFeatures` is aligned with the stable chat contract
- invalid template structure is caught by template validation
- prepare / release flow treats template hygiene failures as blockers

### 6.2 Phase B or later template work may start when

- the above Phase A rules are green
- the upstream chat contract is not being reopened for the template at hand
- the new template can consume existing chat capabilities instead of reintroducing handwritten page wiring

---

## 7. Testing Baseline

Current useful verification layers:

1. `packages/chat` contract-level unit tests
   - verify the CLI consumption surface exposed by chat

2. `packages/chat-cli` typecheck and build
   - verify registry and CLI entry stay internally consistent

3. CLI scaffold / release / smoke tests
   - verify generated output still works with the registry-driven path

Recommended commands:

- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F create-tiny-robot typecheck`
- `pnpm.cmd -F create-tiny-robot build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts src/chat-cli/release.spec.ts src/chat-cli/smoke.spec.ts`

---

## 8. Documentation Split

Document roles should stay clear:

- [progress.md](./progress.md): short status board, next step, verified commands
- this review: execution rules, boundaries, sequencing, acceptance standards
- [../../docs/chat-cli-design.md](../../docs/chat-cli-design.md): long-lived architecture and target model

When state changes:

- update `progress.md` first
- update this review if the execution rule or acceptance standard changes
- update the design doc only if the target architecture changes
