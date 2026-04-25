# `@opentiny/tiny-robot-chat`

## Official Entry Surfaces

Use the package through one of these three official entry levels:

1. `TrChat`
   The `TrChat` config entry. Pass a target `TrChatConfig` directly.
2. `TrChat.Root + TrChat.Page`
   The official whitebox page path. Use this when you want to own runtime creation but keep the official page composition.
3. `TrChat.Root + primitives`
   The granular whitebox path. Use this when you want to compose the page yourself from the public building blocks.

`TrChat` now accepts only:

- a target `TrChatConfig` object
- a serialized target `TrChatConfig` JSON string

If you need explicit runtime injection, provider wiring, or granular composition, upgrade to `TrChat.Root + TrChat.Page`, `TrChat.Root + primitives`, or `TrChat.Provider` directly.

`TrChat.Provider` is the bounded advanced helper surface.
It now accepts a transport-style setup:

- preferred:
  `transportAdapter`
- supported compatibility alias:
  `responseProvider`

Direct `chatKit` passthrough is no longer part of the supported package story.

## Three-Layer Product Model

The supported package story is intentionally three-layered, not just "UI vs data":

- UI / page composition
- orchestration runtime
- transport / data-access

The entry surfaces map to those layers like this:

- `TrChat`
  package-owned UI, package-owned orchestration runtime, package-owned transport bridge through `TrChatConfig`
- `TrChat.Provider(transportAdapter)`
  package-owned UI, package-owned orchestration runtime, user-owned transport / data-access through `transportAdapter`
- `TrChat.Root + TrChat.Page`
  package-owned UI, user-owned runtime, user-owned transport as part of that runtime
- `TrChat.Root + primitives`
  package-owned primitives, user-owned runtime, user-owned transport as part of that runtime

Use `TrChat` by default.
Use `TrChat.Provider(transportAdapter)` when teams want our UI and chat behavior but need their own transport adapter or data-access edge.
`responseProvider` remains supported as a compatibility alias for the same advanced path.

## Official Bridge Helper

- `createRuntimeFromConfig(config)`
  The official advanced `config -> { runtime, ui }` bridge helper for moving from target `TrChatConfig` into `TrChat.Root`.
  This is a whitebox upgrade helper, not the normal `TrChat` entry.

## Advanced Standalone Surface

These standalone exports remain public only where they still map cleanly onto a current advanced owner-domain or adjunct surface:

- `useMcpManager`
- `TrMcpTrigger`
- `TrChatFeedback`

If you are teaching or documenting the package, prefer the three official entry levels first and introduce these surfaces only when the task truly depends on explicit advanced composition.

The current keep/delete decision baseline for these helper surfaces lives in:

- `docs/refactor/process/provider-helper-decision-baseline.md`

## Internal Surface

- `@opentiny/tiny-robot-chat/internal`

Treat this as internal-only. It exists for package internals and targeted tests, not as a normal application entry point.

## Demo Routes

The demo app mirrors the official entry ladder:

- `#/trchat`
  `TrChat`
- `#/whitebox`
  `TrChat.Root + TrChat.Page`
- `#/granular`
  `TrChat.Root + primitives`

## Validation Shortcuts

- `pnpm -F @opentiny/tiny-robot-chat test:coverage`
  formal package-local coverage reporting for `packages/chat/tests` (`runtime`, `contracts`, `integration`) against `packages/chat/src`; Playwright e2e remains the separate retained gate under `packages/test/src/chat`
- `pnpm -F @opentiny/tiny-robot-chat check:demo`
- `pnpm -F @opentiny/tiny-robot-chat check:phase-4`

Use `check:phase-4` when you need the current full package closure baseline for docs, tests, demos, and refactor doc governance.
