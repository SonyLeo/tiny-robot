# Post-Closure Coverage, Story, And Surface Cleanup

Status: completed post-closure follow-up slice for the current supported package story.

## Goal

Land the first two non-blocking post-closure follow-ups in a way that keeps the current three-layer product model explicit:

- formal code-coverage reporting for package-local tests
- clearer product-story evidence for the supported entry and advanced-provider paths
- public-surface cleanup that reduces private-runtime leakage without reopening runtime architecture work

## Scope

- In scope:
  - add formal code-coverage reporting for `packages/chat/tests`
  - align docs, retained evidence, and package guidance around the current three-layer model
  - audit public surface for private-runtime leakage
  - clean up low- and medium-risk public-surface leakage in small batches
- Out of scope:
  - deep internal runtime re-architecture
  - changing the official entry ladder
  - reviving public `chatKit` passthrough or `useChatKit` as a supported package story
  - deferred standalone page-level `footer` publishing semantics

## Frozen Inputs

- Official package ladder remains:
  - `TrChat`
  - `TrChat.Root + TrChat.Page`
  - `TrChat.Root + primitives`
- Retained advanced surface remains:
  - `TrChat.Provider(responseProvider)`
- The current three-layer product model remains:
  - UI / page composition
  - orchestration runtime
  - transport / data-access
- This slice may tighten naming and public guidance, but it must not collapse the middle
  `Provider(responseProvider)` product tier.

## Relevant Source Docs

- `packages/chat/README.md`
- `packages/chat/docs/refactor/design/ui-runtime-transport-layering.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/process/test-governance-standard.md`
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
- `packages/chat/docs/refactor/process/test-suite-audit-baseline.md`
- `packages/chat/docs/refactor/process/test-gap-backlog.md`
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`

## Work Parts

### Part 1: Coverage Reporting Baseline

- add formal package-local coverage reporting for `packages/chat/tests`
- keep the current runtime / contracts / integration harness structure intact
- produce a durable report output that future slices can cite instead of relying only on behavior-coverage language

Primary targets:

- `packages/chat/package.json`
- package-local coverage config or helper files, if needed
- process docs only where the new reporting baseline changes the standing story

### Part 2: Three-Layer Story Consolidation

- keep the current user-facing product story explicit:
  - `TrChat` as the default packaged entry
  - `TrChat.Provider(responseProvider)` as the bounded advanced middle tier
  - `TrChat.Root + TrChat.Page` / `Root + primitives` as runtime-injection paths
- align README, design guidance, and retained test evidence around that model
- avoid drifting back toward a vague two-bucket story such as only "UI vs data"

Primary targets:

- `packages/chat/README.md`
- the nearest refactor design/process docs only when the standing story or evidence routing changes
- retained tests only if a missing proof gap blocks the final wording

### Part 3: Public-Surface Leakage Audit

- inventory where private runtime terminology still leaks into public guidance or public typing
- classify each leak as one of:
  - keep internal-only
  - rename on the public surface
  - wrap behind provider- or runtime-facing names
  - defer because changing it now would risk behavior drift

Primary targets:

- `packages/chat/src/types/core.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/index.ts`
- `packages/chat/src/index.ts`
- `packages/chat/src/runtime/provider/resolveProviderRuntime.ts`

### Part 4: Small-Batch Public-Surface Cleanup

- land low-risk cleanup first:
  - reduce `UseChatKit*`-shaped public leakage where a provider-facing or runtime-facing name is enough
  - keep `ResponseProvider` and `TrChat.Provider(responseProvider)` explicit
- only take medium-risk cleanup after package-local gates stay green
- stop before any change becomes a deep runtime rewrite

## Current Status

- the supported package story remains full-cutover green
- Part 1 is landed:
  - `pnpm.cmd -F @opentiny/tiny-robot-chat test:coverage`
  - the command reuses `packages/chat/tests` only (`runtime`, `contracts`, `integration`)
  - it writes formal package-local artifacts under `packages/chat/coverage/`
  - it does not create a new test tier or fold `packages/test/src/chat` e2e into the same report
- Part 2 is landed:
  - README and supporting design guidance explicitly describe the settled three-layer model
  - `TrChat.Provider(responseProvider)` is preserved as the bounded "our UI + runtime, your transport" tier
- Parts 3 and 4 are landed in a bounded first batch:
  - provider-facing public types now use `TrChatProviderRuntimeOptions`
  - package root exports no longer re-export `UseChatKitOptions`, `UseChatKitRuntimeBridge`, or `UseChatKitReturn`
  - feedback action context no longer exposes fallback runtime shape on the public surface
  - provider-side helper naming now centers on runtime / provider language instead of public `chatKit` language
- the deferred standalone page-level `footer` publishing task remains outside this slice

## Validation

Required package-local gate:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`

Coverage baseline gate:

- the new package-local coverage command(s) introduced by this slice

Preferred retained e2e gate when entry wording, provider behavior, or visible user guidance changes:

- `pnpm.cmd -F tiny-robot-test test:chat:smoke:full`

Stable fallback when local worker or web-server instability appears:

- `pnpm.cmd -F tiny-robot-test test:chat:smoke`

Documentation gate:

- `node packages/chat/scripts/check-refactor-docs.mjs`

## Progress Model

Use these two numbers in progress updates:

- current slice progress
- overall full-cutover closure progress

Suggested milestones:

- `0-20%`
  coverage approach is chosen and the active slice is recorded
- `20-45%`
  package-local coverage reporting lands and is documented
- `45-70%`
  README / design / evidence wording is aligned around the three-layer story
- `70-85%`
  public-surface leakage audit is complete and cleanup targets are classified
- `85-100%`
  low- and medium-risk public-surface cleanup lands with green package-local validation

## Risks

- Risk:
  - coverage tooling may force an unnecessary test-runner rewrite if the slice grows beyond package-local reporting
- Mitigation:
  - keep the existing harness and add the smallest possible reporting layer first

- Risk:
  - public-surface cleanup may accidentally weaken or blur the retained middle
    `Provider(responseProvider)` product tier
- Mitigation:
  - treat `ui-runtime-transport-layering.md` as the standing design baseline and reject cleanup that pushes orchestration work onto integrators

- Risk:
  - wording cleanup may accidentally promote `TrChat.Provider` into the official entry ladder
- Mitigation:
  - keep README and docs explicit that `Provider(responseProvider)` is a bounded advanced surface, not the default on-ramp

## Exit Criteria

- [x] package-local formal coverage reporting is landed and documented
- [x] the current three-layer product story is explicit and consistent across README and supporting docs
- [x] any retained evidence updates stay aligned with the current supported package story
- [x] private-runtime leakage on the public surface is audited and classified
- [x] low- and medium-risk public-surface cleanup lands without behavior drift
- [x] package-local gates remain green
- [x] documentation drift is backwritten
- [x] a closing history entry lands when the slice is complete

## Decision Log

- 2026-04-24:
  - start with formal code-coverage reporting before public-surface cleanup
  - keep `TrChat.Provider(responseProvider)` as the retained middle-tier product surface
  - treat any deeper private-runtime rewrite as out of scope for this slice
  - formal package-local coverage reporting should reuse the existing `packages/chat/tests` suites instead of creating a new test directory or merging Playwright e2e into the same report
  - after the first provider-facing cleanup batch, keep the private `chatKit` chain internal but stop using `chatKit`-shaped naming on the public provider-facing surface where runtime/provider wording is enough

## Drift Backwrite

- What changed from the original slice:
  - Part 1 landed as a package-local coverage baseline that reuses the existing `runtime`, `contracts`, and `integration` suites instead of introducing another test tier
  - the first bounded public-surface cleanup batch also landed, including provider-facing type narrowing, feedback-action public-surface cleanup, and provider helper naming cleanup
- Which source docs need follow-up:
  - none required for this slice beyond future optional deeper-runtime cleanup or deferred footer work
