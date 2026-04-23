# Full Cutover Closure Checklist

Status: active end-state checklist for post-closure legacy retirement.

This file answers one question:

- when can the chat package be described as fully cut over to the new refactor model, with old helper and comparison usage retired

It is not a new contract source.
Use it as the final closure bar for the remaining legacy-retirement work.

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
- [ ] every surviving helper surface is explicitly marked `promote`
- [ ] every retiring helper surface has a deletion slice opened or completed

Reference:

- `provider-helper-decision-baseline.md`

### C. Provider Story Is Final

- [ ] `TrChat.Provider` is explicitly documented as an advanced surface, not a default on-ramp
- [ ] the `responseProvider` branch is retained as the supported advanced provider path
- [ ] the `chatKit` injection branch is retired
- [ ] provider scenes/specs no longer rely on `chatKit` passthrough as a supported package story

### D. Comparison Helper Families Are Retired

- [ ] `useChatKit` is retired
- [ ] `TrChatHistorySurface` is retired
- [ ] `loadChatConfig` is retired
- [ ] `createChatAdapterFromConfig` is retired
- [ ] `createPresetChatProps` is retired
- [ ] `createPresetChatSlices` is retired

These are the biggest remaining indicators that the package still tolerates the old assembly mental model.

### E. Legacy Tests And Scenes Are Retired With Handoff

- [ ] `tests/runtime/provider-chat-kit.test.mjs` is removed after helper handoff
- [ ] `tests/config/*` is removed after config-projection helper retirement
- [ ] remaining `adapt` e2e scenes are either:
  - promoted into the official gate
  - or retired/deleted
- [ ] no retained e2e scene depends on a helper surface that the package has already retired

### F. Docs And Demo Story Are Unified

- [ ] `packages/chat/README.md` describes the final supported package story
- [ ] docs site pages under `docs/src/components/` no longer teach retired helper/comparison paths as viable package guidance
- [ ] demo routes and retained scenes no longer center retired helper usage
- [ ] process docs no longer describe already-retired helper surfaces as still pending decisions

### G. Final Validation Gate Is Green

- [ ] `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- [ ] `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- [ ] `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- [ ] `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- [ ] retained Playwright gate is green
- [ ] current closure batch is green
- [ ] `node packages/chat/scripts/check-refactor-docs.mjs`

## Remaining Work Breakdown

Use this checklist with the remaining execution plan:

1. `post-closure-provider-helper-retirement`
2. `post-closure-legacy-test-retirement`
3. `post-closure-final-surface-cleanup`

The package should only be called “fully cut over” after all three are complete and this checklist is fully checked off.

## Progress Rule

For the remaining legacy-retirement work, progress updates should use this checklist plus the active execution slice.

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
