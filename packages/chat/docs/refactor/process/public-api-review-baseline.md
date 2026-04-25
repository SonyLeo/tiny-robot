# Public API Review Baseline

Status: discussion baseline for reviewing the current public API before any contract cleanup or user-doc rewrite.

This file evaluates the currently exposed `packages/chat` API from a user point of view.
It is intentionally grounded in the current code, current tests, current demos, and the current generated contract artifacts.

It is not itself the source of truth for the final contract.
Use it to decide:

- what should stay as stable public contract
- what is a valid capability but is expressed poorly
- what should stop being treated as a first-class public surface

Read this together with:

- `packages/chat/README.md`
- `packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md`
- `packages/chat/docs/generated/slot-catalog.md`
- `packages/chat/docs/generated/page-region-contract.md`

## Review Frame

This review should start from the actual public surface, not from ideal future docs.

The baseline decision rule is:

- `keep`
  the API is reasonable; later work is mainly documentation or discoverability
- `keep but re-express`
  the capability is valid, but naming, typing, export shape, or hierarchy is misleading
- `do not treat as stable public contract`
  the current surface is too implicit, too legacy-shaped, or too implementation-driven to keep teaching as supported API

The intended discussion order is:

1. first freeze what the real public contract should be
2. then adjust code and typings where needed
3. only after that rewrite user-facing docs around the confirmed contract

## Evidence Base

This baseline is derived from the current shipping behavior anchors:

- package entry and public exports:
  `packages/chat/src/index.ts`
- public types:
  `packages/chat/src/types/core.ts`
  `packages/chat/src/types/ui.ts`
  `packages/chat/src/types/root.ts`
- blackbox entry:
  `packages/chat/src/components/core/Chat.vue`
- advanced provider surface:
  `packages/chat/src/components/core/ChatProvider.vue`
- whitebox page composition:
  `packages/chat/src/page/TrChatPage.vue`
- default page regions:
  `packages/chat/src/components/core/default-renderer/ChatDefaultHeaderRegion.vue`
  `packages/chat/src/components/core/default-renderer/ChatDefaultBodyRegion.vue`
  `packages/chat/src/components/core/default-renderer/ChatDefaultFooterRegion.vue`
- package intro and product layering:
  `packages/chat/README.md`
  `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md`
- generated slot and region artifacts:
  `packages/chat/docs/generated/slot-catalog.md`
  `packages/chat/docs/generated/page-region-contract.md`

## Current Surface Map

### Official entry ladder

The package README teaches three official entry levels:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

This part of the product story is directionally clear and should remain the evaluation baseline.

### Advanced retained surface

`TrChat.Provider(responseProvider)` is still present and still solves a real in-between use case:

- package-owned UI
- package-owned orchestration runtime
- user-owned transport adapter

The current question is not whether it exists.
The current question is whether its public shape and naming communicate the right support level.

### Public composition surface

The package currently exposes:

- `TrChat`
- `TrChat.Root`
- `TrChat.Page`
- `TrChat.Provider`
- many `TrChat.*` subcomponents
- several standalone advanced components such as `TrModelSelector` and `TrMcpTrigger`
- domain helpers
- lower-level hooks and config helpers

This means the user sees a broader surface than the three-level entry story alone.

## Preliminary User-Side Judgment

| Surface | Current user-facing value | Preliminary judgment |
| --- | --- | --- |
| `TrChat` | good default blackbox entry | `keep`, but tighten the typing contract |
| `TrChat.Provider(responseProvider)` | valid advanced in-between path | `keep but re-express` |
| `TrChat.Root` | valid whitebox runtime boundary | `keep` |
| `TrChat.Page` | valid official page composition layer | `keep but formalize` |
| `TrChat.*` leaf primitives | useful for whitebox composition | `keep`, but clarify which ones are first-class vs incidental |
| root-level low-level hooks and helpers | useful to some advanced users | `keep but classify`, not all should read like official entry APIs |

## Findings Requiring Discussion

### 1. `TrChat` has a contract mismatch across docs, runtime, and typing

Current state:

- `packages/chat/README.md` says `TrChat` accepts only target `TrChatConfig` or serialized target `TrChatConfig` JSON
- the runtime entry path already enforces target-config resolution
- `packages/chat/src/types/ui.ts` still exposes `TrChatProps.config: unknown`

User-side judgment:

- the default entry direction is correct
- the public typing is not
- this makes the default API feel less productized than the docs imply

Discussion target:

- `TrChat` should stay the default blackbox entry
- but its public typing should match the supported contract instead of keeping `unknown`

Classification:

- `keep but re-express`

### 2. `TrChat.Provider` solves a real need, but the namespace makes it look like an official fourth entry level

Current state:

- docs describe `TrChat.Provider(responseProvider)` as a bounded advanced surface
- the code exposes it at the same namespace level as `TrChat.Root` and `TrChat.Page`

User-side judgment:

- the capability is valuable
- the product signal is mixed
- users will naturally read `TrChat.Provider` as peer-level official API unless the package says otherwise very clearly

Discussion target:

- decide whether the current name and placement are acceptable
- if they are acceptable, freeze a strong support-tier explanation around them
- if they are not acceptable, treat naming or placement cleanup as a later contract task

Classification:

- `keep but re-express`

### 3. `ResponseProvider` is not a generic data-layer interface; it is a package-specific transport adapter contract

Current state:

- docs often describe the provider path as "our UI + runtime, your transport/data-access"
- `packages/chat/src/types/core.ts` defines `ResponseProvider` against `MessageRequestBody` and `ChatCompletion` streaming semantics

User-side judgment:

- the current API is not arbitrary repository or data-layer ownership
- it is a transport or provider adapter contract that already assumes the package message protocol

Discussion target:

- confirm whether the current protocol is the intended advanced contract
- if yes, later docs should describe it as adapter-level ownership rather than unconstrained data-layer ownership

Classification:

- `keep but re-express`

### 4. `TrChat.Page` currently exposes part of its API through implicit attrs instead of explicit props

Current state:

- `packages/chat/src/page/TrChatPage.vue` reads `message-list-variant` / `messageListVariant` from `useAttrs()`
- `TrChat.Page` also emits `update:show` and `update:model`
- there is no explicit public `TrChatPageProps` or page-level emits contract

User-side judgment:

- the composition layer is valid
- the public contract is not explicit enough for a whitebox surface
- users currently have to infer supported behavior from implementation details

Discussion target:

- decide which `TrChat.Page` props and emits are truly public
- remove or formalize the implicit attr behavior

Classification:

- `do not treat as stable public contract` in its current implicit form

### 5. The generated slot contract and the implemented slot contract are not currently aligned

Current state:

- `packages/chat/docs/generated/slot-catalog.md` still documents `header-before`, `header-after`, `message-before`, `message-after`, `sender-before`, `sender-after`
- current `TrChat.Page` implementation and default region components expose `header`, `header-extra`, `message-list`, `welcome`, `empty`, bubble slots, `sender`, `footer-extra`, and workspace slots

User-side judgment:

- users cannot reliably know which slot names are actually supported
- this is not only a docs problem; it blocks confident adoption of `TrChat.Page`

Discussion target:

- decide whether the implementation should move toward the generated slot catalog
- or whether the generated artifact should be corrected to match the real page contract

Classification:

- `do not treat as stable public contract` until the mismatch is resolved

### 6. Slot props are real public API, but they are not expressed as stable public types

Current state:

- the `message-list` slot currently receives `messages`
- the `sender` slot currently receives `send`, `abort`, `status`, `last-error`, `retry`
- bubble slots and workspace slots also carry implied contracts through implementation
- these slot props are not surfaced as a stable, easy-to-find public type contract

User-side judgment:

- if a whitebox page path is official, slot props are part of the official API
- users should not need to read SFC internals to know what slot props they can depend on

Discussion target:

- decide the minimum supported slot-props contract for `TrChat.Page`
- then expose it in types and docs consistently

Classification:

- `do not treat as stable public contract` until formalized

### 7. Several public leaf-component props still leak internal or transitional terms

Current state:

- `packages/chat/src/types/ui.ts` still exposes `compatibilityRelay?: boolean` on `TrChatHeaderProps`, `TrChatWelcomeProps`, and `TrChatMessageListProps`

User-side judgment:

- this prop name communicates internal migration history, not user intent
- keeping it public makes the leaf component surface feel transitional rather than intentional

Discussion target:

- decide whether these props are truly meant to stay public
- if not, plan either removal, hiding, or deprecation

Classification:

- `keep but re-express` at best

### 8. The package root export surface is wider than the official product story

Current state:

- `packages/chat/src/index.ts` exports the official entries
- it also exports many lower-level hooks, helpers, registries, and config utilities

Examples:

- `useDefaultBubbleConfig`
- `useFloatingDropdown`
- `useKeyboardNavigation`
- `useHistoryState`
- `useSlotFilter`
- `CHAT_FEATURE_REGISTRY`
- `resolveChatFeatures`
- `resolveChatMessages`
- `KNOWN_PROVIDERS`

User-side judgment:

- a broad export surface is not automatically wrong
- but without support-tier classification, users cannot distinguish official entry API from advanced helper from incidental low-level export

Discussion target:

- decide whether the package wants explicit support tiers
- if yes, later docs should group exports by support level instead of presenting a flat surface

Classification:

- `keep but classify`

### 9. The whitebox runtime contract is capable, but too heavy for first-time evaluation

Current state:

- `packages/chat/src/types/root.ts` defines a strong runtime model
- but the package does not make the minimum viable runtime shape obvious when evaluating `Root + Page` or `Root + primitives`

User-side judgment:

- the contract itself is not obviously wrong
- but it is hard to estimate adoption cost from the public API alone

Discussion target:

- decide whether the team wants to define a minimum supported runtime subset for whitebox adoption

Classification:

- `keep`, but later explain the minimum viable contract much more clearly

### 10. Public naming still contains a few avoidable inconsistencies

Current state:

- `TrChatRootUiConfig` uses `ui.copy`
- provider or UI-facing types use `messages?: ChatMessagesOverrides`
- some primitives are under `TrChat.*`, while others remain standalone such as `TrModelSelector` and `TrMcpTrigger`

User-side judgment:

- none of these is individually fatal
- together they make the API feel less curated

Discussion target:

- decide which naming inconsistencies are worth contract cleanup
- avoid treating every inconsistency as equally urgent

Classification:

- `keep but re-express` selectively

## External Reference: AI SDK

The current package should still be judged first as a component package and a packaged chat product surface.
However, the official AI SDK docs are useful as a secondary reference for chat-specific runtime, transport, and message-model design.

Relevant references:

- [AI SDK `useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK transport](https://ai-sdk.dev/docs/ai-sdk-ui/transport)
- [AI SDK `DirectChatTransport`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/direct-chat-transport)
- [AI SDK storing messages](https://ai-sdk.dev/docs/ai-sdk-ui/storing-messages)
- [AI SDK `UIMessage`](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message)
- [AI SDK troubleshooting: custom request options moved under transport](https://ai-sdk.dev/docs/troubleshooting/use-chat-custom-request-options)

### What AI SDK reinforces

#### A. Transport is a clearer advanced abstraction than a bare provider callback

AI SDK treats transport as a first-class customization boundary.
The default path uses a default transport, while advanced users can swap or customize transport behavior without fully replacing the rest of the chat stack.

Implication for `packages/chat`:

- the current three-layer story still makes sense
- but the advanced contract is easier to explain in transport terms than in `ResponseProvider` terms
- `ResponseProvider` currently reads wider than it really is

This strengthens Findings 2 and 3:

- `TrChat.Provider` likely needs stronger support-tier framing
- `ResponseProvider` may not be the clearest long-term public name for this boundary

#### B. There is value in a lighter middle layer between blackbox config and full transport replacement

AI SDK supports request-level customization without forcing every advanced user to replace the whole transport object immediately.
That creates a smoother slope:

- default path
- request customization
- transport replacement

Implication for `packages/chat`:

- `TrChat` currently gives mostly static request transport config
- `TrChat.Provider(responseProvider)` is already a much lower-level jump
- there may be a missing middle tier for teams that want our UI and runtime but only need request shaping, auth headers, or message filtering

This does not mean the package should copy AI SDK directly.
It does suggest that the current gap between `TrChat` and `TrChat.Provider` deserves explicit discussion.

#### C. UI message should be the public state truth; provider or model messages should stay boundary-facing

AI SDK strongly centers `UIMessage` for rendering and persistence, and treats model or protocol messages as boundary conversions.

Implication for `packages/chat`:

- `ChatUIMessage` is already the right direction
- but some advanced contracts still expose lower-level `ChatMessage` shapes more directly than ideal

This strengthens the case for keeping the public mental model centered on:

- UI or runtime state for rendering and persistence
- transport or protocol objects only at the edge

#### D. Message identity should be `messageId`-first

AI SDK advanced operations are organized around stable message identity rather than list position.

Implication for `packages/chat`:

- the package has already moved in the right direction
- but several public action payloads and contexts still preserve `messageIndex` as a visible concept

This supports continued tightening toward `messageId`-first public contracts.

#### E. Advanced customization should feel like one increasing ladder, not unrelated branches

AI SDK does not solve UI component API design, but it does show a clean progressive shape for advanced chat customization.

Implication for `packages/chat`:

- the package's official three entry levels are still valid
- the main ambiguity is the retained advanced in-between surface
- users should be able to understand when they are moving from config-driven usage to transport-driven usage without feeling like they have discovered a separate fourth product

### What not to copy from AI SDK

The package should not overfit to AI SDK because the product responsibilities differ:

- AI SDK is not a page-composition component library
- AI SDK does not define `Page` slots, slot props, or visual primitives
- AI SDK therefore cannot answer the component-library questions around `TrChat.Page`, region slots, and leaf-component prop naming

For this review, the right split is:

- use component-library references to judge props, emits, slots, naming, and support tiers
- use AI SDK as secondary evidence for transport boundaries, message-model boundaries, and advanced chat-runtime layering

### AI SDK-driven discussion additions

After the package decides the core `TrChat` and `TrChat.Page` contracts, the next discussion questions should include:

1. Should the advanced boundary be taught in transport terms rather than `responseProvider` terms?
2. Is there a missing middle tier between static `TrChatConfig.request.transport` and full `TrChat.Provider(responseProvider)`?
3. Which public contracts should still expose lower-level `ChatMessage` versus `ChatUIMessage`?
4. Which public payloads should continue carrying `messageIndex`, and which should become `messageId`-first?

## Recommended Discussion Order

To keep the review efficient, decide these items in order:

1. What exactly counts as stable public contract for `TrChat`?
2. Is `TrChat.Provider` merely retained advanced API, or should it read as a peer entry level?
3. What are the official `TrChat.Page` props, emits, slots, and slot props?
4. Which leaf-component props are intentional public API, and which are migration residue?
5. Does the package want support tiers for root exports?
6. Which naming inconsistencies are worth changing in code versus only clarifying in docs?
7. After the surface contract is clearer, should the advanced path be reframed around transport and request customization?

## Non-Goals For This Review

This review should not reopen:

- deep runtime re-architecture
- whether the three-layer model exists
- whether `TrChat` remains the default entry
- whether `TrChat.Root + TrChat.Page` and `TrChat.Root + primitives` remain the official whitebox paths

Those are already the current baseline.
The point of this review is narrower:

- make the current public API feel intentional
- decide what is truly supported
- only then update user-facing documentation around those decisions
