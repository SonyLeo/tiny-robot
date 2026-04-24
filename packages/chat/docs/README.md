# Chat Docs Map

This directory is the knowledge entry layer for `packages/chat`.

It does not try to explain everything in one file. Its job is to route people and agents to the right document class quickly.

## Start Here

- `../README.md`
  Use this first for the official package entry surfaces, helper boundary, and demo route map.
- `SOURCE_OF_TRUTH.md`
  Use this first when you need to know which file should be edited.
- `CURRENT_VS_TARGET_SURFACE.md`
  Use this when you need to distinguish current shipping behavior from target refactor contracts.
- `refactor/README.md`
  Use this before editing any refactor design, review, process, or archive doc.

## Document Groups

- `refactor/design/`
  Active refactor source docs:
  `overview.md`, `api-runtime.md`, `execution.md`
- `refactor/process/`
  Active process docs:
  `review-scheme.md`, `alignment-tracker.md`, `test-governance-standard.md`, `test-boundary-baseline.md`, `test-suite-audit-baseline.md`, `test-gap-backlog.md`, `legacy-surface-inventory.md`, `legacy-retirement-roadmap.md`, `provider-helper-decision-baseline.md`, `full-cutover-closure-checklist.md`, `core-flow-stabilization-baseline.md`
- `refactor/reviews/`
  Meeting-specific review materials
- `refactor/archive/`
  Historical proposal and freeze records
- `refactor/knowledge/`
  Thin recurring-knowledge layer for reusable lessons and tracked experience candidates
- `refactor/REFACTOR_COLLAB_GUIDE.md`
  Default collaboration and doc-update discipline for this refactor branch
- `refactor/CODE_MAP.md`
  Intended implementation areas and ownership boundaries
- `refactor/IMPLEMENTATION_ROUTING.md`
  Change-routing guide for implementation work
- `generated/`
  Derived contract artifacts used as high-frequency lookup tables
- `exec-plans/`
  Active and completed implementation slices
- `histories/`
  Records of finished code changes

## Fast Reading Paths

If you are doing refactor design or review:

1. `SOURCE_OF_TRUTH.md`
2. `refactor/README.md`
3. `refactor/design/overview.md`
4. `refactor/design/api-runtime.md`
5. `refactor/process/alignment-tracker.md`
6. `refactor/process/test-governance-standard.md`
7. `refactor/process/test-boundary-baseline.md`
8. `refactor/process/test-suite-audit-baseline.md`
9. `refactor/process/test-gap-backlog.md`
10. `refactor/process/legacy-retirement-roadmap.md`
11. `refactor/process/provider-helper-decision-baseline.md`
12. `refactor/process/full-cutover-closure-checklist.md`
13. `refactor/process/core-flow-stabilization-baseline.md`
14. `refactor/knowledge/PLAYBOOK.md`

If you are implementing the current phase:

1. `../README.md`
2. `SOURCE_OF_TRUTH.md`
3. `refactor/REFACTOR_COLLAB_GUIDE.md`
4. `refactor/design/api-runtime.md`
5. `refactor/design/execution.md`
6. `refactor/process/test-governance-standard.md`
7. `refactor/process/test-boundary-baseline.md`
8. `refactor/process/test-suite-audit-baseline.md`
9. `refactor/process/test-gap-backlog.md`
10. `refactor/process/legacy-surface-inventory.md`
11. `refactor/process/legacy-retirement-roadmap.md`
12. `refactor/process/provider-helper-decision-baseline.md`
13. `refactor/process/full-cutover-closure-checklist.md`
14. `refactor/process/core-flow-stabilization-baseline.md`
15. the active execution slice under `exec-plans/active/`
16. `refactor/knowledge/PLAYBOOK.md`

## Maintenance Rule

When knowledge routing changes, update this file together with:

- `packages/chat/AGENTS.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
