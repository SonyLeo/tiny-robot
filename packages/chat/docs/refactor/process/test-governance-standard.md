# Chat Test Governance Standard

Status: active process standard.

This file defines the long-lived design standard for `packages/chat/tests` and `packages/test/src/chat`.

It exists so future test cleanup, legacy retirement, and directory reorganization all start from the same rules instead of rediscovering them one slice at a time.

This standard is derived from the same principles used in official Playwright, Vitest, and Testing Library guidance:

- keep tests aligned with user-visible behavior
- isolate layers so each test tier has one clear responsibility
- avoid duplicate proof across too many layers
- retire stale tests only after their boundary has been handed off

## Relationship To Other Test Docs

Use this file for:

- the lasting layer model for unit-ish package tests and e2e
- smoke vs scenario gate rules
- selector, helper, and scene design rules
- keep/adapt/retire retirement policy
- the default sequence for test modernization

Use these adjacent files for the current branch state:

- `./test-boundary-baseline.md`
  current file-by-file classification for the existing chat test suites
- `./core-flow-stabilization-baseline.md`
  temporary recovery gate while core official-path flows are being restored
- `./full-cutover-closure-checklist.md`
  overall completion bar for finishing the remaining cutover work

This file is the stable standard.
`test-boundary-baseline.md` is the current inventory against that standard.

## Official Path First

The primary supported entry ladder remains:

1. `TrChat`
2. `TrChat.Root + TrChat.Page`
3. `TrChat.Root + primitives`

All new tests should start from one of these three paths unless they are explicitly proving a bounded advanced surface such as `TrChat.Provider` with `responseProvider`.

Default rule:

- if a test does not help prove one of the official paths or an explicitly retained advanced surface, it should not become a long-term gate

## Layer Model

### `packages/chat/tests/runtime`

Role:

- runtime semantics
- request/provider behavior
- conversation state and transitions
- message transforms, message actions, and sender/runtime helpers

Use this layer for:

- behavior that can be proved without page composition
- failure modes that should stay fast to debug
- state-machine or ownership behavior that would be noisy in e2e

Do not use this layer for:

- broad DOM assertions
- slot rendering proof
- full-page interaction flows

### `packages/chat/tests/contracts`

Role:

- public contract proof
- source-of-truth assertions near the owning boundary
- slot and renderer contract pinning
- public-surface and removal proof for retired exports

Use this layer for:

- exports
- contract-level props and slots
- route-independent DOM or source contract assertions

Do not use this layer for:

- repeated runtime flow proof already covered in `runtime`
- full mounted page behavior already covered in `integration`

### `packages/chat/tests/integration`

Role:

- mounted owner-path proof
- `Root + Page` composition proof
- `Root + primitives` wiring proof
- blackbox entry handoff proof when DOM is required but a full browser is unnecessary

Use this layer for:

- nearest mounted proof of official-path wiring
- owner-input propagation
- scene-independent DOM behavior at the composition boundary

Do not use this layer for:

- browser-only interaction details
- full workflow smoke that belongs in e2e

### `packages/test/src/chat` e2e

Role:

- user-visible flows
- cross-component interaction
- real browser rendering and interaction
- official-path and bounded advanced-scene regression proof

Use this layer for:

- send / retry / model switch / history / attachments / feedback
- workspace, surface API, renderer registry, transforms, MCP
- entry-ladder and scene-router validation

Do not use this layer for:

- low-level runtime semantics already covered in `packages/chat/tests`
- implementation-detail assertions that do not matter to users

## Gate Split

### Smoke Gate

Smoke gate is the smallest must-pass e2e set for official-path usability.

It should answer:

- can the package still be used?
- do the most important official flows still work?

Smoke gate should stay:

- short
- stable
- representative
- mandatory after core-flow or entry-wiring changes

Recommended smoke content for the current branch:

- request lifecycle
- history
- attachments
- model switch
- feedback
- plus the entry-ladder smoke in `scenario-specs/index.spec.ts`

### Scenario Gate

Scenario gate is the broader official-path feature set.

It should answer:

- did feature-level behavior drift while core smoke still passed?

Scenario gate may be slower and broader, but it should still stay tied to official or explicitly retained advanced paths.

Recommended scenario categories:

- surface API
- workspace slots
- sender extensions
- renderer registry
- message transforms
- MCP
- layout config
- welcome prompts
- sender config and sender extension flows

### Gate Rule

- smoke gate blocks risky runtime, entry, sender, and history work by default
- scenario gate blocks feature-level regression before deleting more old scenes or helper surfaces
- neither gate should include legacy-only assertions once a boundary has been handed off or explicitly dropped

## Coverage Reporting Baseline

Formal code-coverage reporting should start from the existing package-local suites, not from a new test tier.

Use:

- `pnpm.cmd -F @opentiny/tiny-robot-chat test:coverage`

This coverage command should:

- reuse `packages/chat/tests/runtime`, `packages/chat/tests/contracts`, and `packages/chat/tests/integration`
- report against `packages/chat/src`
- write durable package-local artifacts under `packages/chat/coverage/`

It should not:

- replace the retained Playwright smoke or scenario gates under `packages/test/src/chat`
- be described as a third test suite
- hide which source files were never loaded by the package-local tests

## Keep / Adapt / Retire Policy

Every existing test file should eventually be labeled as one of:

- `keep`
- `adapt`
- `retire`

### `keep`

The file already proves an official-path or retained advanced-path boundary with stable enough assertions.

### `adapt`

The boundary still matters, but the test currently:

- depends on old setup
- relies on implementation details
- uses stale scenes or selectors
- proves the right behavior through the wrong path

`adapt` files are not deleted first.
They are rewritten toward the official path and then promoted to `keep`.

### `retire`

The file only protects one of these:

- a removed helper surface
- a deprecated compatibility path
- an explicit contract drop
- duplicated proof that now exists closer to the real owner

Retirement rule:

- a file may retire only after boundary handoff is complete

Boundary handoff means one of the following is true:

1. the same supported behavior is already covered by a successor official-path test
2. the old behavior is explicitly removed from the supported contract

Never delete a test just because it looks old.
Delete it only after its boundary is accounted for.

## Selector Rules

Prefer selectors in this order:

1. `data-testid` for scene roots and demo-only controls
2. role, accessible name, or stable title/label
3. shared helper selectors in `selectors.ts`
4. implementation classes only when the class itself is part of the supported contract

Avoid:

- brittle nested CSS chains
- selectors tied only to visual structure
- assertions that require invisible internal markup when a visible contract exists

## Helper Rules

`testHelper.ts` should:

- encapsulate repeated user actions
- expose reusable waits
- keep action semantics readable

It should not:

- hide important assertions
- encode one-off scene hacks
- become a second source of truth for business behavior

Default helper rule:

- helpers wrap actions
- specs own behavior assertions

## Scene Rules

Scene components should:

- start from the official entry ladder by default
- keep fixture data narrow and explicit
- use shared target-config defaults through `officialSceneConfig.ts` when possible

Scene components should not:

- act as a dumping ground for unrelated compatibility cases
- reintroduce retired helper paths casually
- overshadow the official ladder with a specialized advanced setup

If a scene uses an advanced retained surface, document why that scene still exists.

## Directory And Naming Rules

### `packages/chat/tests`

Prefer the current stable split:

- `runtime/`
- `contracts/`
- `integration/`

Supporting internals may remain under:

- `_harness`
- `_helpers`
- `_stubs`

Directory rule:

- support files should not become first-class gate directories

### `packages/test/src/chat`

Current structure is acceptable if its role stays clear:

- top-level `*.spec.ts`
  shared smoke or cross-scene flows
- `scenario-specs/`
  scene-specific feature specs
- `scenarios/`
  scene fixtures
- `testHelper.ts`
  actions and waits
- `selectors.ts`
  stable shared selectors

Future reorganization is allowed, but only after behavior coverage is stable.
Do not move files and rewrite behavior at the same time unless the payoff is clear.

## Validation Rules

### When Runtime Or Entry Wiring Changes

Run:

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
- `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
- `pnpm.cmd -F tiny-robot-test test:chat:smoke`

### When Feature Scenes Or User Flows Change

Run:

- nearest package-local contract or integration proof
- `pnpm.cmd -F tiny-robot-test test:chat:smoke` when the change touches core user flows
- `pnpm.cmd -F tiny-robot-test test:chat:scenario` when the change touches feature scenes or visible feature behavior

### When Retiring Old Tests Or Helpers

Run in this order:

1. successor unit/contract/integration proof
2. successor smoke or scenario proof
3. deletion batch
4. `pnpm.cmd -F tiny-robot-test test:chat:smoke`
5. `pnpm.cmd -F tiny-robot-test test:chat:scenario` when feature scenes are affected

## Default Modernization Sequence

Use this order for future cleanup:

1. define or update the test standard
2. classify existing files against the standard
3. freeze the smoke gate
4. freeze the scenario gate
5. fill official-path test gaps
6. perform boundary handoff
7. retire old tests and helper surfaces in small batches
8. reorganize directories and names only after behavior coverage is stable

## Current Adoption Rule

Until the full test audit is finished:

- use this file as the design standard
- use `test-boundary-baseline.md` as the working inventory
- do not start another broad legacy-retirement deletion batch without updating both
