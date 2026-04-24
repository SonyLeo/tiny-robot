# Core-Flow Stabilization Baseline

Status: active stabilization baseline for post-closure regression recovery.

This file exists because the package has already completed the planned refactor and legacy-retirement slices, but the current development branch has regressed a few core user flows while those cleanup slices were landing.

Until this baseline is green again, no further helper-retirement or surface-pruning work should be treated as the active priority.

Read this together with:

- `./alignment-tracker.md`
- `./test-boundary-baseline.md`
- `./full-cutover-closure-checklist.md`

## Role

Use this file to answer:

- which flows must be stable before more retirement work resumes
- which commands prove those flows on a fresh build/runtime path
- which current regressions are red, yellow, or green

It is not a contract doc.
It is the temporary execution gate for recovering basic usability on the new package path.

## Stabilization Rule

Until all red items below are green:

1. `post-closure full cutover closure` stays paused
2. no new legacy-helper deletion slice should start
3. fixes should optimize for restoring official-path functionality first

## Core Flow Gate

The stabilization gate is built around the same official entry ladder:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

### Required Core Flows

| Flow | Why it is blocking |
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

## Current Matrix

### Red

| Flow | Current evidence |
| --- | --- |
| model switch then prompt send | local scene probing on `localhost:3333` still showed `DeepSeek Test` selected while the next prompt-send response came back from `[openai:openai-test]` |
| model switch then sender submit | local scene probing on `localhost:3333` showed typed content in the sender, but clicking submit left `messages:0` and returned the main body to the welcome-state shape |

### Yellow

| Flow | Current evidence |
| --- | --- |
| assistant feedback render and interaction | source-level fix landed for `ChatFeedback` enablement, but the retained feedback gate still needs a fresh-server rerun to close the loop cleanly |
| full retained Playwright gate | current branch needs a fresh-server rerun after the stabilization fixes; the old “fully green” closure statement is no longer trustworthy |

### Green

| Flow | Current evidence |
| --- | --- |
| runtime first-send-after-model-switch contract | `packages/chat/tests/runtime/root-runtime.test.mjs` now proves that selecting a model before the first send creates the conversation with the newly selected provider |
| runtime/contracts/integration hard gate | the package-local runtime/contracts/integration layers are currently green after the latest runtime patch |

## Exit Condition

This stabilization baseline is complete only when:

- all `Red` rows are moved to `Green`
- all `Yellow` rows are either `Green` or explicitly downgraded with written rationale
- `full-cutover-closure-checklist.md` can truthfully mark the retained gate as green again

Only then may the branch resume deeper retirement work.
