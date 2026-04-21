# Chat Docs Map

This directory is the knowledge entry layer for `packages/chat`.

It does not try to explain everything in one file. Its job is to route people and agents to the right document class quickly.

## Start Here

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
  `review-scheme.md`, `alignment-tracker.md`
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
6. `refactor/knowledge/PLAYBOOK.md`

If you are implementing the current phase:

1. `SOURCE_OF_TRUTH.md`
2. `refactor/REFACTOR_COLLAB_GUIDE.md`
3. `refactor/design/api-runtime.md`
4. `refactor/design/execution.md`
5. the active execution slice under `exec-plans/active/`
6. `refactor/knowledge/PLAYBOOK.md`

## Maintenance Rule

When knowledge routing changes, update this file together with:

- `packages/chat/AGENTS.md`
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
