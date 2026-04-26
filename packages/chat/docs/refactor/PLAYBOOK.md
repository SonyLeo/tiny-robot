# Chat Refactor Playbook

This file contains promoted lessons that have repeated enough to guide later refactor slices.

It is a reuse layer, not a second contract source.
If this file conflicts with `design/` docs, the design docs win and this file should be updated.

## Current Promoted Lessons

### 1. Move new behavior toward runtime ownership, not scaffold relay

When a feature is being hardened or newly introduced, prefer putting the real behavior in the owning runtime module first.

Use scaffold or legacy bridge layers only as bounded compatibility paths.

Why this is promoted:

- `Phase 1A` stabilized once `sender / message / attachments` behavior moved into runtime-owned paths
- `Phase 1B` page baseline stayed reviewable because `history / models / workspace` entered through named runtime modules instead of reopening config projection in `Page`

Default question:

- "Which runtime owns this behavior?" should come before "Where can I patch the current scaffold?"

### 2. Prefer stable ids over positional semantics

When targeting messages or grouped message actions, prefer:

- `messageId`
- `messageIds`

Do not introduce new `messageIndex`-based semantics unless the code is explicitly legacy-only.

Why this is promoted:

- edit / retry / regenerate and custom actions all became more stable once they stopped depending on array position
- repeated Phase 1A work had to narrow old index fallback paths more than once

Default question:

- "Can this action survive reorder, restore, retry, or regroup?" If not, it probably still depends on position.

### 3. Keep a single owner for each public composition surface

If a public surface becomes official, it should own the default composition.

Compatibility delegates may remain, but they should not silently become a second owner.

Current application:

- `TrChat.Page` owns the default page composition
- `ChatDefaultRenderer` is a compatibility delegate

Why this is promoted:

- contract tests had to be rewritten once `Page` took over the default composition
- without this rule, page ownership would stay ambiguous and later slices would keep patching the wrong layer

Default question:

- "Is this file the owner, or just the adapter?" If it is only an adapter, keep it narrow and pin that with tests.

### 4. Expand bridge subsets only when they are implemented and evidenced

Do not declare a config field or bridge subset "supported" just because the target design intends it.

Only promote a subset into the bridge matrix when:

- the code path exists
- targeted validation exists
- the source docs and derived artifact agree

Why this is promoted:

- this prevented `createRuntimeFromConfig(config)` from becoming an aspirational catch-all instead of a reviewable subset
- it kept `Phase 1A` and `Phase 1B` additive and debuggable

Default question:

- "Is this field actually implemented, tested, and backwritten?" If not, it should not appear as supported.

### 5. When ownership moves, move the tests and lookup tables with it

If implementation ownership changes, update the corresponding contract tests and high-frequency lookup docs in the same task.

Typical pairings:

- page ownership change:
  `tests/contracts/*` + `generated/page-region-contract.md`
- bridge subset change:
  `tests/runtime/*` + `generated/config-bridge-matrix.md`
- runtime owner change:
  `tests/runtime/*` + `generated/runtime-owner-table.md`

Why this is promoted:

- repeated work in Phase 1A and Phase 1B showed that ownership shifts are where drift appears fastest

Default question:

- "What test and what lookup artifact will prove this ownership change is now real?"

### 6. Once owner inputs are explicit, compatibility relay must become explicit too

After a page or workspace owner path starts passing explicit inputs into the nearest primitive, do not leave compatibility relay silently active by default.

Prefer one of these two states:

- explicit owner input is authoritative
- compatibility relay is still enabled, but only because that component is being used through a real compatibility path

Why this is promoted:

- `ChatLayout` stopped being a mixed owner/scaffold renderer path once explicit `bubbleRenderers` became authoritative
- `ChatHeader` and `ChatHistory` became easier to reason about once the default page path explicitly disabled compatibility relay instead of leaving scaffold fallback silently active

Default question:

- "Is this fallback still protecting a real compatibility consumer, or is it just shadowing an owner path that already has explicit inputs?"

### 7. Phase reviews should package evidence and drift explicitly

When a review decides whether a phase may exit or a new phase may start, do not rely on narrative summaries alone.

Prefer packets that include both:

- an explicit evidence index
- a current drift summary

Why this is promoted:

- `Review B` and `Review C` both became easier to schedule once the key tests, completed slices, histories, and bounded follow-ups were called out directly
- without this, review meetings turn into live repository archaeology and the pass/blocked decision drifts

Default question:

- "Could a reviewer point to the exact artifacts and current drift without reconstructing the story from scratch?"

### 8. Promote legacy config only in owner-aligned slices

When old config shapes still coexist with the target blackbox path, do not promote them all at once.

Only admit a legacy subset when every admitted field can be normalized at the entry boundary into already-frozen target owner domains.

Prefer slices like:

- request-only subset
- display-default subset
- one narrowly named layout or lifecycle subset

Avoid slices like:

- "support old ChatConfig"
- "accept legacy UI options"
- "bring layout and shell along for convenience"

Why this is promoted:

- `Phase 2` stayed reviewable when old `ChatConfig` first promoted only `models / providers / defaults`, then separately promoted `appearance / ui.brand / ui.welcome`
- that sequencing widened blackbox support without quietly reopening scaffold projection or multi-domain adapter behavior

Default question:

- "Can I name the exact owner domains this legacy subset collapses into, and are they already frozen?"

### 9. When a legacy field has no frozen target owner, prove fallback instead of inventing a bridge

If a legacy field only feeds preset projection or other scaffold-owned shaping and there is no already-frozen target owner domain for it, prefer proving explicit fallback.

Do not invent a pseudo-normalization path just because the field looks adjacent to other admitted blackbox subsets.

Why this is promoted:

- `ui.prompts` stayed on scaffold fallback because it still belongs to old preset and welcome-prompts projection
- `layout.variant / placements` also stayed on scaffold fallback because they still belong to old message-list and role-placement projection, not a frozen target blackbox owner
- `shell.viewState` also stayed on scaffold fallback because it still describes old shell display-state semantics, not a frozen target workspace owner default

Default question:

- "Which frozen target owner would read this field after normalization?" If the answer is unclear or still scaffold-only, keep it on explicit fallback.

### 10. Let nearest extension UI fall back to runtime-owned message extension config

When `message runtime` already exposes extension config such as:

- action definitions
- action mode
- feedback enablement
- renderer config

the nearest extension UI should read those runtime-owned values before depending on page-input, message-list, or scaffold relay.

Why this is promoted:

- `ChatFeedback` stopped depending on higher-level action relay once it could read `runtime.message.getActions()` and runtime `actionMode`
- the next feedback parity slice only became real once `ChatFeedback` and the default body region could fall back to runtime-owned feedback enablement instead of assuming page-input relay had already projected it
- renderer parity only became durable once `ChatLayout` could read `runtime.message.config.renderers` directly instead of assuming page-input or scaffold projection had already happened

Default question:

- "Does the owning runtime already expose this extension setting?" If yes, the nearest extension UI should read it there first and treat relay as compatibility or override input.

### 11. Keep sender and attachments UI on runtime-owned defaults and handoff once they exist

When the runtime already exposes:

- `sender.defaults`
- `attachments.uploadConfig / listConfig`
- `sender.pendingAttachments`

the nearest sender and attachments UI should read those runtime-owned values before depending on compatibility feature presets or attachment managers.

Why this is promoted:

- sender parity only became real once `voice / wordCount` moved onto `sender runtime.defaults` instead of depending on `senderActionsFeature`
- attachments parity only became real once `ChatSender` and `ChatAttachments` could read runtime-owned upload config, list config, and pending attachments without needing attachment feature context

Default question:

- "Does this footer or attachment UI still need a compatibility feature preset, or can it now read the frozen runtime owner directly?"

### 12. Prove parity at the nearest owner region or primitive, not only through the full page

When a slice is about ownership or parity, prefer adding at least one mounted proof at the nearest owner region or primitive that is supposed to consume the contract.

Typical examples:

- `ChatLayout` for renderer ownership
- `ChatSender + ChatAttachments` for sender and attachments ownership
- `ChatWorkspaceLayout` for workspace mobile fallback
- `ChatDefaultHeaderRegion + ChatDefaultFooterRegion` for history/model/MCP affordances

Why this is promoted:

- full `Root + Page` rendering can still pass while relay or context projection hides the real owner-path gap
- repeated Phase 3A and Phase 3B slices became easier to debug once the proof mounted the nearest owner surface directly

Default question:

- "What is the narrowest owner surface that should already prove this contract without the rest of the page helping it?"

### 12. Keep workspace mobile fallback on explicit shell input or runtime workspace state

When the default page or workspace owner path already has:

- explicit page `shell` input
- runtime-owned workspace state

the nearest workspace layout and mobile sheets should resolve their fallback behavior from those owner inputs before reaching for scaffold projection.

Why this is promoted:

- `Phase 1B` narrowed the workspace owner chain onto explicit page inputs
- `Phase 3B` mobile parity only became real once `ChatWorkspaceLayout` stopped reading raw scaffold preset buckets and instead fell back from `props.shell` to runtime-derived workspace shell state

Default question:

- "Is this workspace mobile fallback still reading an owner input or runtime owner, or is it slipping back into raw scaffold presets?"
