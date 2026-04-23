# `@opentiny/tiny-robot-chat`

## Official Entry Surfaces

Use the package through one of these three official entry levels:

1. `TrChat`
   The blackbox entry. Pass a target `TrChatConfig` directly.
2. `TrChat.Root + TrChat.Page`
   The official whitebox page path. Use this when you want to own runtime creation but keep the official page composition.
3. `TrChat.Root + primitives`
   The granular whitebox path. Use this when you want to compose the page yourself from the public building blocks.

`TrChat` now accepts only:

- a target `TrChatConfig` object
- a serialized target `TrChatConfig` JSON string

If you need explicit runtime injection, provider wiring, or granular composition, upgrade to `TrChat.Root + TrChat.Page`, `TrChat.Root + primitives`, or `TrChat.Provider` directly.

## Official Bridge Helper

- `createRuntimeFromConfig(config)`
  The official `config -> { runtime, ui }` bridge helper for moving from target `TrChatConfig` into `TrChat.Root`.

## Compatibility And Comparison Helpers

These helpers remain public for bounded compatibility, comparison, or advanced migration work, but they are not the default on-ramp:

- `createChatAdapterFromConfig`
- `createPresetChatProps`
- `createPresetChatSlices`
- `useChatKit`
- `useMcpManager`

If you are teaching or documenting the package, prefer the three official entry levels first and introduce these helpers only when the task truly depends on compatibility behavior.

The current keep/delete decision baseline for these helper surfaces lives in:

- `docs/refactor/process/provider-helper-decision-baseline.md`

## Internal Surface

- `@opentiny/tiny-robot-chat/internal`

Treat this as internal-only. It exists for package internals and targeted tests, not as a normal application entry point.

## Demo Routes

The demo app mirrors the official entry ladder:

- `#/blackbox`
  `TrChat`
- `#/whitebox`
  `TrChat.Root + TrChat.Page`
- `#/granular`
  `TrChat.Root + primitives`

## Validation Shortcuts

- `pnpm -F @opentiny/tiny-robot-chat check:demo`
- `pnpm -F @opentiny/tiny-robot-chat check:phase-4`

Use `check:phase-4` when you need the current full package closure baseline for docs, tests, demos, and refactor doc governance.
