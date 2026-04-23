# Provider And Comparison Helper Decision Baseline

Status: active decision baseline for the next post-closure cleanup slice.

This file turns the remaining provider/comparison helper question into concrete keep/delete recommendations.

It does not itself delete code.
Use it to decide which surviving helper surfaces should become explicitly supported advanced APIs, and which ones should keep moving toward retirement.

Read this together with:

- `./legacy-retirement-roadmap.md`
- `./legacy-surface-inventory.md`
- `./test-boundary-baseline.md`

## Decision Rule

Every remaining helper-like surface must end up in exactly one bucket:

- `promote`
  keep it public, document it as an advanced but supported surface, and keep dedicated tests
- `retire`
  remove it from the public story, then delete the implementation and the tests that only exist to protect it

Do not leave a helper in a vague “temporary but public” state once the official entry ladder has already closed.

## Current Recommendation Table

| Surface cluster | Concrete files / exports | Recommendation | Why | Follow-up |
| --- | --- | --- | --- | --- |
| advanced provider surface | `TrChat.Provider`, `TrChatProvider`, `ChatProvider.vue`, `resolveProviderChatKit.ts`, `TrChatProviderProps` | `promote` | explicit provider wiring still fills a real advanced use case between `TrChat.Root + primitives` and raw internal assembly, and the package README already teaches it as a bounded advanced path | keep it public, but document it as advanced rather than default |
| provider `responseProvider` branch | `TrChatProviderPropsA`, `resolveProviderChatKit(... responseProvider ...)` | `promote` | this is the cleanest advanced branch because it does not require callers to own the old chat-kit helper directly | keep tests, keep docs, and prefer this branch over `chatKit` injection in future examples |
| provider `chatKit` injection branch | `TrChatProviderPropsB`, `resolveProviderChatKit(... chatKit ...)`, provider scenes that only prove injected `chatKit` passthrough | `retire` | this branch keeps the old `useChatKit` mental model alive, which is no longer part of the official package story | hand off any still-real behavior to `responseProvider` or `Root`-based proof, then delete the branch and its dedicated tests |
| old chat-kit helper | `useChatKit`, `UseChatKitOptions`, `UseChatKitReturn`, `UseChatKitRuntimeBridge`, `tests/runtime/provider-chat-kit.test.mjs` | `retire` | it is the clearest remaining old runtime/conversation helper anchor and keeps comparison-heavy assembly paths alive after the main refactor has closed | remove it from the public package surface after provider/chatKit branch handoff |
| config projection helpers | `loadChatConfig`, `createChatAdapterFromConfig`, `createPresetChatProps`, `createPresetChatSlices`, `tests/config/*` | `retire` | these helpers exist to preserve old blackbox/provider projection stories, not the final target-config plus `createRuntimeFromConfig(config)` story | delete them together with the config tests that only protect old projection behavior |
| owner-aligned MCP helper | `useMcpManager`, `UseMcpManager*` types | `promote` | this helper still maps cleanly onto an admitted owner domain (`mcp runtime`) and is already useful for advanced whitebox composition | keep public and document as a domain helper instead of a comparison helper |
| owner-aligned attachments helper | `useChatAttachments`, `UseChatAttachments*` types | `promote` | this helper still maps cleanly onto the attachments owner domain and remains useful for advanced composition or explicit attachment management | keep public and document as a domain helper instead of a comparison helper |
| history surface helper branch | `TrChatHistorySurface`, `TrChatHistorySurfaceProps.chatKit` | `retire` | it still depends on the old `chatKit` helper shape and is not part of the official entry ladder or README story | delete it in the same retirement batch as `useChatKit` unless a new owner-aligned need appears |
| comparison-heavy e2e scenes | `surface-api.spec.ts`, `sender-extensions.spec.ts`, `mcp-feature.spec.ts`, scene branches under `packages/test/src/chat/scenarios/*` that still use `TrChat.Provider + useChatKit` | `retire` after handoff | these scenes are still useful while the old helper branches exist, but they should not become the long-term public proof once the helper branches are removed | move retained behavior onto `responseProvider`, `Root + Page`, or `Root + primitives`, then delete the comparison-only scene branches |

## Practical Reading Of The Table

The recommended end state is:

1. keep a small advanced provider/helper surface that is still owner-aligned:
   - `TrChat.Provider` with the `responseProvider` branch
   - `useMcpManager`
   - `useChatAttachments`
2. retire the old comparison/projection surface:
   - `useChatKit`
   - provider `chatKit` injection
   - `TrChatHistorySurface`
   - `loadChatConfig`
   - `createChatAdapterFromConfig`
   - `createPresetChatProps`
   - `createPresetChatSlices`

## Why This Split Is Recommended

This split keeps one thing clear:

- advanced helper APIs may survive when they still map to a current owner domain
- comparison-era helpers should not survive just because they are already exported

In the current package:

- `useMcpManager` and `useChatAttachments` still line up with stable owner domains
- `useChatKit` and the config-projection helpers mostly preserve old assembly stories that the official entry ladder has already replaced

## Immediate Execution Implication

The next implementation slice should start by proving or migrating these two branches:

1. provider `responseProvider` branch stays
2. provider `chatKit` branch retires

Once that split is proved, the helper retirement batch can delete:

- `useChatKit`
- `TrChatHistorySurface`
- config projection helpers
- their dedicated package-local tests

## Required Validation For The Decision Slice

Before turning these recommendations into deletions, keep this baseline green:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/workspace-slots.spec.ts src/chat/scenario-specs/renderer-registry.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts src/chat/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/mcp-feature.spec.ts src/chat/scenario-specs/message-transforms.spec.ts`
