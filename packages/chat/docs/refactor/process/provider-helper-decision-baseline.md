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
| advanced provider surface | `TrChat.Provider`, `TrChatProvider`, `ChatProvider.vue`, `resolveProviderRuntime.ts`, `TrChatProviderProps` | `promote` | explicit provider wiring still fills a real advanced use case between `TrChat.Root + primitives` and raw internal assembly, and the package README already teaches it as a bounded advanced path | keep it public, but document it as advanced rather than default |
| provider `responseProvider` branch | `TrChatProviderProps`, `resolveProviderRuntime(... responseProvider ...)`, `tests/runtime/provider-response-provider.test.mjs` | `promote` | this is the cleanest advanced branch because it does not require callers to own the old chat-kit helper directly | keep tests, keep docs, and prefer this branch over any comparison helper path |
| provider `chatKit` injection branch | retired public `TrChat.Provider :chat-kit` passthrough branch, injected-chatKit provider scenes | `retire` | this branch kept the old `useChatKit` mental model alive, which is no longer part of the official package story | completed: behavior handed off to `responseProvider` or `Root`-based proof, branch deleted from the public provider surface |
| old chat-kit helper | retired public `useChatKit`, retired public `UseChatKitOptions`, retired public `UseChatKitReturn`, retired public `UseChatKitRuntimeBridge` | `retire` | it was the clearest remaining old runtime/conversation helper anchor and kept comparison-heavy assembly paths alive after the main refactor closed | completed for the public package story: top-level exports and docs are gone; the internal runtime chat-kit chain remains a private implementation detail until any deeper headless rewrite |
| config projection helpers | retired `loadChatConfig`, retired `createChatAdapterFromConfig`, retired `createPresetChatProps`, retired `createPresetChatSlices`, retired `tests/config/*` | `retire` | these helpers existed only to preserve old blackbox/provider projection stories, not the final target-config plus `createRuntimeFromConfig(config)` story | completed: implementation, public exports, and dedicated config tests are gone; runtime/message/renderer proof now rides on current runtime-owned contracts |
| owner-aligned MCP helper | `useMcpManager`, `UseMcpManager*` types | `promote` | this helper still maps cleanly onto an admitted owner domain (`mcp runtime`) and is already useful for advanced whitebox composition | keep public and document as a domain helper instead of a comparison helper |
| owner-aligned attachments helper | `useChatAttachments`, `UseChatAttachments*` types | `promote` | this helper still maps cleanly onto the attachments owner domain and remains useful for advanced composition or explicit attachment management | keep public and document as a domain helper instead of a comparison helper |
| history surface helper branch | retired `TrChatHistorySurface`, retired `TrChatHistorySurfaceProps.chatKit` | `retire` | it depended on the old `chatKit` helper shape and was never part of the official entry ladder or README story | completed: the official granular left-slot story now rides on `WorkspaceLayout` default-left owner behavior, so the helper export and its dedicated scene branch are gone |
| comparison-heavy e2e scenes | `surface-api.spec.ts`, `sender-extensions.spec.ts`, `mcp-feature.spec.ts`, scene branches under `packages/test/src/chat/scenarios/*` that previously carried comparison-helper proof | `retire` after handoff | these scenes were only worth keeping while the old helper branches still existed; they should survive only where they now prove official-path or bounded advanced-provider behavior | completed for the retained gate: surviving provider scenes now use `responseProvider` or `Root`-based diagnostics only, and no retained scene depends on retired helper surfaces |

## Practical Reading Of The Table

The recommended end state is:

1. keep a small advanced provider/helper surface that is still owner-aligned:
   - `TrChat.Provider` with the `responseProvider` branch
   - `useMcpManager`
   - `useChatAttachments`
2. retire the old comparison/projection surface:
   - retired public `useChatKit`
   - provider `chatKit` injection
   - retired `TrChatHistorySurface`
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
- the old public `useChatKit` surface and the config-projection helpers mostly preserved assembly stories that the official entry ladder has already replaced

## Immediate Execution Implication

The current implementation slice should start by proving or migrating these two branches:

1. provider `responseProvider` branch stays
2. provider `chatKit` branch retires

That split has now landed in code.
The config projection helper family and the public `useChatKit` helper surface are now retired.
The public package story is now closed on the helper side.
Any remaining work is optional deeper private-runtime follow-up only if the branch wants to go beyond public cutover.

## Required Validation For The Decision Slice

Before turning these recommendations into deletions, keep this baseline green:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/index.spec.ts src/chat/scenario-specs/history.spec.ts src/chat/scenario-specs/request-lifecycle.spec.ts src/chat/scenario-specs/workspace-slots.spec.ts src/chat/scenario-specs/renderer-registry.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts src/chat/scenario-specs/sender-actions.spec.ts src/chat/scenario-specs/surface-api.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/mcp-feature.spec.ts src/chat/scenario-specs/message-transforms.spec.ts`
