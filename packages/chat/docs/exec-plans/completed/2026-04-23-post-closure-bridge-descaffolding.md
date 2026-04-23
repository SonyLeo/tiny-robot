# Post-Closure Bridge De-Scaffolding

## Goal

Retire internal scaffold provision and legacy runtime hints so the remaining bridge only carries active owner-path wiring instead of scaffold-era baggage.

## Scope

- In scope:
  - remove `CHAT_SCAFFOLD_KEY`, `useChatScaffoldContext`, and internal scaffold-context provision
  - remove `runtimeHints.ts` and `__legacyPhase1ABridge` attachment to runtime objects
  - simplify `rootBridge` so it derives page inputs, shell, attachments manager, and fallback `chatKit` directly from runtime
  - update runtime/contract/integration proof and process docs
- Out of scope:
  - deleting `src/legacy/rootBridge.ts` itself
  - deleting provider/comparison helper surfaces
  - deleting the remaining compatibility-only edge proofs

## Frozen Inputs

- Review / phase gate:
  - post-closure cleanup is active and the official-path consumer layer no longer reads scaffold context
- Contract freeze:
  - official entry ladder stays `TrChat`, `TrChat.Root + TrChat.Page`, and `TrChat.Root + primitives`
  - official paths must remain functional while internal bridge baggage is reduced
- Required source docs:
  - `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  - `packages/chat/docs/refactor/process/legacy-surface-inventory.md`

## Relevant Source Docs

- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`

## Implementation Slice

- Target files:
  - `packages/chat/src/root/TrChatRoot.vue`
  - `packages/chat/src/shared/context/index.ts`
  - `packages/chat/src/internal.ts`
  - `packages/chat/src/legacy/rootBridge.ts`
  - `packages/chat/src/legacy/runtimeHints.ts`
  - `packages/chat/src/runtime/config/createRuntimeFromConfig.ts`
  - `packages/chat/tests/runtime/root-runtime.test.mjs`
  - `packages/chat/tests/contracts/public-surface.test.mjs`
  - `packages/chat/tests/integration/root-page-mounted.test.mjs`
- Intended ownership:
  - reduce bridge shape to what the official ladder still consumes today
  - remove dead internal scaffold surfaces instead of leaving them as inert exports
- Planned validation:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`

## Risks

- Risk:
  - removing bridge hints may subtly change history or new-session behavior on mounted official paths
- Mitigation:
  - keep runtime and mounted proof green, then rerun the nearest retained Playwright batch that exercises blackbox/history/granular surfaces

## Exit Criteria

- [x] internal scaffold provision is removed
- [x] runtime no longer carries legacy bridge hints
- [x] targeted tests pass
- [x] docs stay aligned

## Validation

- Commands:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/history.spec.ts src/chat/request-lifecycle.spec.ts src/chat/scenario-specs/surface-api.spec.ts`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Demo / baseline checks:
  - blackbox target-config path still renders
  - `Root + Page` and `Root + primitives` still support history, welcome/message state, attachments, sender defaults, and model selection
- Contract evidence:
  - `tests/runtime/root-runtime.test.mjs`
  - `tests/contracts/public-surface.test.mjs`
  - `tests/integration/root-page-mounted.test.mjs`

## Decision Log

- 2026-04-23:
  - remove dead scaffold provision and runtime hints before attempting full bridge deletion

## Drift Backwrite

- What changed from the original slice:
  - `rootBridge` now carries only runtime-derived page inputs, provider-facing props, fallback `chatKit`, and attachment helpers; the internal scaffold provision and runtime hint channel were removed entirely.
- Which source docs need follow-up:
  - `alignment-tracker.md`
  - `legacy-surface-inventory.md`
  - `test-boundary-baseline.md`
