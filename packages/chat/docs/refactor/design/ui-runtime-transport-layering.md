# Chat UI / Runtime / Transport Layering

Status: settled background and recommendation baseline for the current supported package story.

Use this file when the question is not "what does a specific prop do?" but:

- how should `TrChat` be explained as a product surface
- how should UI, orchestration runtime, and transport responsibilities be separated
- how should we balance "use our UI only" vs "use our full packaged chat ability"
- what level of follow-up cleanup is worth doing next

Use `api-runtime.md` for contract detail and `execution.md` for implementation sequencing.

## 1. Why This Document Exists

The current refactor has already closed the main cutover and the stabilization / test-expansion work.
What remains is no longer "can the package run?".
The open design question is how to explain and preserve the package as a usable product surface.

The recurring user request is not one-dimensional:

- some users want the full packaged chat experience as a black-box entry
- some users want to keep their own transport / data-access layer but reuse our UI and orchestration ability
- some users want to reuse only the UI layer and bring their own runtime

If we describe this as only "UI layer vs data layer", we hide an important middle layer:

- conversation orchestration
- retry / regenerate
- edit and rerun
- optimistic message flow
- history state
- sender / attachments pending state

Those abilities are not "pure UI", and they are also not the same thing as raw network transport.

## 2. The Recommended Three-Layer Model

The package should be described in three layers, not two.

### 2.1 UI / Page Composition Layer

This layer owns:

- page composition
- layout
- workspace shell
- header / welcome / message list / footer / sender
- history panel UI
- feedback UI
- model selector UI
- attachments UI
- MCP UI

This is the layer users consume when they want the visual and interaction shell.

### 2.2 Orchestration Runtime Layer

This layer owns:

- conversation creation and switching
- message lifecycle
- edit and rerun
- retry / regenerate
- optimistic state
- history state
- sender state
- attachment pending / upload coordination
- feedback action context
- model switch continuity

This is the layer that makes chat behavior feel complete.

It is the most important distinction from "transport only".

### 2.3 Transport / Data-Access Layer

This layer owns:

- request routing
- provider selection
- auth and headers
- endpoint wiring
- server payload mapping
- streaming protocol adaptation
- error payload adaptation

This is the layer many integrating teams actually want to replace.

## 3. Official Entry Surfaces Mapped To The Three Layers

The current supported package story already fits this model.

### 3.1 `TrChat`

`TrChat` is the default packaged entry.

It is best described as:

- UI layer: package-owned
- orchestration runtime layer: package-owned
- transport bridge: package-owned through `TrChatConfig`

This is the fastest path and should remain the default story.

### 3.2 `TrChat.Provider(responseProvider)`

`TrChat.Provider` is the bounded advanced helper surface.

It is best described as:

- UI layer: package-owned
- orchestration runtime layer: package-owned
- transport / data-access layer: user-owned through `responseProvider`

This is the recommended answer for teams that say:

- "we want your UI"
- "we want your chat behavior"
- "but our own data-access layer is the source of truth"

This surface should not be treated as legacy as long as that product need exists.

### 3.3 `TrChat.Root + TrChat.Page`

This is the official owner-aligned page path.

It is best described as:

- UI layer: package-owned
- orchestration runtime layer: user-provided through `runtime`
- transport / data-access layer: user-owned as part of that runtime

This path is for teams that want to own the runtime contract but still keep the official page composition.

### 3.4 `TrChat.Root + primitives`

This is the official granular path.

It is best described as:

- UI layer: package-owned primitives
- orchestration runtime layer: user-provided through `runtime`
- transport / data-access layer: user-owned as part of that runtime

This path is for the highest-customization cases.

## 4. Product Guidance: What The Package Should Continue To Own

For the middle path (`TrChat.Provider(responseProvider)`), the package should continue to own orchestration ability.

That means integrating teams should not be forced to hand-write:

- edit-and-rerun semantics
- retry / regenerate
- optimistic message flow
- conversation and history state
- sender draft state
- attachment pending state
- feedback operation context
- model-switch continuity

If we remove internal runtime machinery in a way that pushes these responsibilities onto `responseProvider` users, the package becomes harder to adopt, not cleaner.

## 5. Product Guidance: What Users Should Be Able To Own

The package should make it easy for integrating teams to own:

- transport selection
- provider routing
- auth and headers
- request serialization
- server payload mapping
- stream parsing / adaptation
- service-level error mapping

This is the common enterprise need behind "we want to use our own data layer".

In most cases, these teams are not asking to own the entire chat orchestration engine.

## 6. Recommended Balance

The recommended balance is:

1. keep `TrChat` as the full packaged black-box entry
2. keep `TrChat.Provider(responseProvider)` as the "use our UI and runtime, own your transport" entry
3. keep `TrChat.Root + TrChat.Page` and `TrChat.Root + primitives` as the advanced runtime-injection entries

This gives the package three usable product stories without forcing every advanced user into the same depth of customization.

## 7. What "Deeper Runtime Cleanup" Should And Should Not Mean

The recorded optional follow-up around deeper private runtime cleanup should be interpreted carefully.

It should mean:

- reduce leakage of private runtime terminology into public semantics
- keep internal runtime machinery more private
- gradually replace public or cross-layer references that expose implementation detail

It should not mean:

- delete orchestration ability
- force `responseProvider` users to implement edit / retry / rollback behavior themselves
- collapse the middle product tier

In other words:

- removing `chatKit` as a public mental model is reasonable
- removing the capabilities currently carried by that layer is not

## 8. Cost And Risk By Ambition Level

There are three realistic scopes of work.

### 8.1 Scope A: Product Story And Docs Only

Work:

- explain the three-layer model
- align docs and demos
- align tests with the three supported integration stories

Cost:

- low to medium

Risk:

- low

### 8.2 Scope B: Public-Surface Cleanup Around The Three Layers

Work:

- reduce public leakage of private runtime terms
- tighten type names and helper boundaries
- keep the three supported entry stories explicit

Cost:

- medium

Risk:

- medium but manageable

### 8.3 Scope C: Deep Internal Runtime Re-architecture

Work:

- rework internal runtime layering so the orchestration engine is no longer visibly shaped like the current private `chatKit` chain

Cost:

- medium to high

Risk:

- high, because it touches edit / retry / regenerate / history / attachments / model-switch continuity

## 9. Current Recommendation

For the current package state, the recommended path is:

- do Scope A
- optionally do Scope B
- defer Scope C unless there is a concrete product or maintenance reason

This preserves the most valuable user-facing balance:

- a default black-box path
- a middle path for "our UI and runtime, your transport"
- a deep customization path for "our runtime too"

## 10. Relationship To Current Follow-Ups

This document does not reopen the currently deferred follow-ups.

It provides the design baseline for evaluating them:

- formal code coverage reporting
- deeper private runtime / `chat-kit` cleanup
- deferred standalone page-level `footer` publishing semantics

If those follow-ups resume later, they should be judged against this rule:

- do they clarify the three-layer product story
- or do they accidentally collapse one of the supported product tiers
