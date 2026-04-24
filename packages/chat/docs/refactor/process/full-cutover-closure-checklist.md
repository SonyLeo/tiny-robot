# Full Cutover Closure Checklist

Status: green end-state checklist for the current supported package story.

This file answers one question:

- when can the chat package be described as fully cut over to the new refactor model, with old helper and comparison usage retired

It is not a new contract source.
Use it as the final closure bar for the supported branch story and any later optional cleanup.

Read this together with:

- `./legacy-retirement-roadmap.md`
- `./provider-helper-decision-baseline.md`
- `./test-boundary-baseline.md`

## Full-Cutover Standard

The package can be described as fully cut over only when all of the following are true:

1. the official package entry ladder is only:
   - `TrChat`
   - `TrChat.Root + TrChat.Page`
   - `TrChat.Root + primitives`
2. no remaining helper surface is still in a “temporary but public” state
3. `TrChat.Provider` has a settled advanced story instead of a mixed old/new story
4. comparison-era helper families are either retired or explicitly promoted
5. tests and e2e scenes no longer keep old helper mental models alive without a documented reason
6. package docs, demos, and retained gates all describe the same final package story
7. the retained validation baseline is green

## Closure Checklist

### A. Official Entry Ladder Stays Frozen

- [x] `TrChat` remains the only blackbox entry
- [x] `TrChat.Root + TrChat.Page` remains the official whitebox page path
- [x] `TrChat.Root + primitives` remains the official granular whitebox path
- [x] scaffold fallback and scaffold helper surface are gone
- [x] `src/legacy/*` is gone

### B. Helper Fate Is Fully Decided

- [x] a concrete keep/delete recommendation exists for each provider/comparison helper cluster
- [x] every surviving helper surface is explicitly marked `promote`
- [x] every retiring helper surface has a deletion slice opened or completed

Reference:

- `provider-helper-decision-baseline.md`

### C. Provider Story Is Final

- [x] `TrChat.Provider` is explicitly documented as an advanced surface, not a default on-ramp
- [x] the `responseProvider` branch is retained as the supported advanced provider path
- [x] the `chatKit` injection branch is retired
- [x] provider scenes/specs no longer rely on `chatKit` passthrough as a supported package story

### D. Comparison Helper Families Are Retired

- [x] `useChatKit` is retired from the public package surface
- [x] `TrChatHistorySurface` is retired
- [x] `loadChatConfig` is retired
- [x] `createChatAdapterFromConfig` is retired
- [x] `createPresetChatProps` is retired
- [x] `createPresetChatSlices` is retired

These are the biggest remaining indicators that the package still tolerates the old assembly mental model.

### E. Legacy Tests And Scenes Are Retired With Handoff

- [x] `tests/runtime/provider-chat-kit.test.mjs` is removed after helper handoff
- [x] `tests/config/*` is removed after config-projection helper retirement
- [x] remaining `adapt` e2e scenes are either:
  - promoted into the official gate
  - or retired/deleted
- [x] no retained e2e scene depends on a helper surface that the package has already retired

### F. Docs And Demo Story Are Unified

- [x] `packages/chat/README.md` describes the final supported package story
- [x] docs site pages under `docs/src/components/` no longer teach retired helper/comparison paths as viable package guidance
- [x] demo routes and retained scenes no longer center retired helper usage
- [x] process docs no longer describe already-retired helper surfaces as still pending decisions

### G. Final Validation Gate Is Green

- [x] `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- [x] `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- [x] `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- [x] `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- [x] retained Playwright gate is green again after stabilization
- [x] current closure batch is green again after stabilization
- [x] `node packages/chat/scripts/check-refactor-docs.mjs`

The branch can now truthfully use this checklist to describe the current supported package story as fully cut over in practice.

## Remaining Work Breakdown

Use this checklist with later optional work only when needed:

1. keep the retained validation baseline green while test expansion and suite normalization proceeds
2. resume any remaining private-runtime or optional follow-up from `legacy-retirement-roadmap.md` only if the branch still needs it

The package can now be called “fully cut over” for the current supported branch story; subsequent work should be treated as test expansion, suite normalization, or optional deeper runtime cleanup.

## Recorded Optional Follow-Ups

These are deliberately out of the current full-cutover bar, but recorded here so they stay visible:

1. add formal code-coverage reporting instead of relying only on behavior-coverage summaries
2. optionally continue deeper private-runtime cleanup around the internal `chat-kit` chain
3. resolve deferred standalone page-level `footer` publishing semantics in a separate contract task

## Progress Rule

For any remaining optional cleanup, progress updates should use this checklist plus the active execution slice.

Recommended reporting style:

- current slice progress
- full-cutover closure progress
- note which checklist section moved in the current task

Example:

- current slice: `post-closure-provider-helper-retirement` `40%`
- full cutover closure: `75%`
- moved sections:
  - `C. Provider Story Is Final`
  - `D. Comparison Helper Families Are Retired`
