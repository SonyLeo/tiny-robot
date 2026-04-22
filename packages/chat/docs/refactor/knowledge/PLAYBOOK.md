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
