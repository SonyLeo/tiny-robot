# Chat Refactor Implementation Routing

Use this guide to decide where a change should start.

## Start With Docs When

- contract, runtime owner, or slot semantics changed:
  start with `design/api-runtime.md`
- phase gate, validation policy, or milestone readiness changed:
  start with `design/execution.md`
- top-level direction or official mental model changed:
  start with `design/overview.md`
- review cadence or packet shape changed:
  start with `process/review-scheme.md`
- current status, open questions, or next actions changed:
  start with `process/alignment-tracker.md`

## Start With Code When

- Root wiring or provide/inject boundaries changed:
  start with `src/root/`
- official page composition changed:
  start with `src/page/`
- primitive rendering or local UI contract changed:
  start with `src/primitives/`
- source-of-truth behavior changed:
  start with the owning module under `src/runtime/`
- root bootstrap or remaining compatibility-shaped helper wiring changed:
  start with `src/root/createRootBootstrapState.ts`

## Start With Tests When

- you are confirming parity or guarding an existing contract:
  start with the nearest contract or runtime test
- you are validating a new page or composition rule:
  start with the relevant page-level or integration test

## Fast Boundary Rule

- design docs define what should be true
- code implements it
- tests prove it
- tracker records where the work currently stands
