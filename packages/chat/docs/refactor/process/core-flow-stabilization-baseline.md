# Core-Flow Stabilization Baseline

Status: completed stabilization baseline for post-closure regression recovery.

This file exists because the package had already completed the planned refactor and legacy-retirement slices, but the development branch temporarily regressed a few core user flows while those cleanup slices were landing.

That recovery work is now complete.
Keep this file as the branch-level closure record for that stabilization effort.

Read this together with:

- `./alignment-tracker.md`
- `./test-boundary-baseline.md`
- `./full-cutover-closure-checklist.md`

## Role

Use this file to answer:

- which flows had to be stable before more retirement work resumed
- which commands proved those flows on a fresh build/runtime path
- which regressions were red, yellow, or green at closure time

It is not a contract doc.
It is the closure record for the temporary execution gate that recovered basic usability on the new package path.

## Stabilization Rule

While this baseline was red:

1. `post-closure full cutover closure` stayed paused
2. no new legacy-helper deletion slice should start
3. fixes should optimize for restoring official-path functionality first

That temporary rule is now satisfied and closed.

## Core Flow Gate

The stabilization gate was built around the same official entry ladder:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

### Required Core Flows

| Flow | Why it was blocking |
| --- | --- |
| blackbox send and reply | proves the main `TrChat` request path still works |
| whitebox send and reply | proves the `Root + Page` request path still works |
| model switch then prompt send | proves owner model selection reaches the next request, including welcome-entry sends |
| model switch then sender submit | proves sender/editor state survives model changes and still creates/sends a turn |
| assistant feedback render and interaction | proves the default body path still exposes post-reply affordances |
| history and attachments baseline | proves the remaining owner-path shell affordances are not collateral damage |

## Validation Rule

For stabilization slices:

1. build `packages/chat` before e2e validation
2. prefer a fresh dev server or a fresh Playwright web-server instance over a reused long-lived local server
3. treat a reused `localhost:3333` observation as supportive evidence, not as the only source of truth

### Minimum Validation

- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- the nearest retained Playwright specs for the touched flow on a fresh server path

## Closure Matrix

### Red

None.

### Yellow

None.

### Green

| Flow | Current evidence |
| --- | --- |
| runtime first-send-after-model-switch contract | `packages/chat/tests/runtime/root-runtime.test.mjs` proves that selecting a model before the first send creates the conversation with the newly selected provider |
| runtime/contracts/integration hard gate | package-local runtime/contracts/integration layers remained green after the latest runtime patch |
| blackbox send and reply | retained smoke gate is green again on the official `TrChat` path |
| whitebox send and reply | retained smoke gate is green again on the official `Root + Page` path |
| model switch then prompt send | `pnpm.cmd -F tiny-robot-test test:chat:smoke:full` is green again and confirms prompt-send continuity after switching models |
| model switch then sender submit | `pnpm.cmd -F tiny-robot-test test:chat:smoke:full` is green again and confirms sender submit continuity after switching models |
| assistant feedback render and interaction | `pnpm.cmd -F tiny-robot-test test:chat:smoke:full` is green again and confirms assistant feedback visibility and interaction on the retained path |
| history and attachments baseline | `pnpm.cmd -F tiny-robot-test test:chat:smoke:full` is green again and confirms shell/history/attachments baselines |
| retained Playwright gate | `pnpm.cmd -F tiny-robot-test test:chat:smoke:full` and `pnpm.cmd -F tiny-robot-test test:chat:scenario:full` both passed on the current branch |

## Exit Condition

This stabilization baseline is now complete because:

- all former `Red` rows are now green
- there is no remaining `Yellow` row
- `full-cutover-closure-checklist.md` can truthfully mark the retained gate as green again

The next active priority can now move back to test-governance-driven expansion and suite normalization work.
