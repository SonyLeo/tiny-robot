# 2026-04-23 Post-Closure Test Gap Backlog Baseline

## Summary

Recorded the first concrete missing-coverage backlog for the post-closure
`test expansion and suite normalization` phase.

## What Changed

- added `packages/chat/docs/refactor/process/test-gap-backlog.md`
- turned the current audit into four ordered landing items:
  - `G-001` blackbox runtime continuity hard gate
  - `G-002` granular core-flow browser proof
  - `G-003` granular attachments browser proof
  - `G-004` retained advanced provider mounted proof
- added two lower-priority normalization follow-ups:
  - `N-001` smoke-suite boilerplate thinning
  - `N-002` `sender-actions.spec.ts` placement decision
- updated the active execution slice and tracker to mark Part 1 complete and
  point future work at `G-001` and `G-002`
- routed the new backlog doc through the package docs map, source-of-truth
  guide, and package-local `AGENTS.md`

## Why

The branch now has a green retained gate and a file-level audit, but it still
lacked one document that answered the concrete next-step question:

- which missing proofs should land next, and in what order?

The backlog closes that gap so future slices stop inferring priorities from the
tracker alone.

## Validation

- `node packages/chat/scripts/check-refactor-docs.mjs`
