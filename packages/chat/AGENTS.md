# AGENTS.md

Package-level instructions for coding agents working in `packages/chat`.

This file stays short on purpose. Treat it as a routing page, not the encyclopedia.
Repository-local knowledge for the chat refactor now lives under `packages/chat/docs/`.

## Scope

This file applies to:

- `packages/chat/**`
- chat-local docs updated in the same task

If a deeper `AGENTS.md` appears later, the deeper file wins for that subtree.

## Package Role

`@opentiny/tiny-robot-chat` is the high-level chat UX package in this monorepo.

During this refactor branch, use this package in two modes:

- current shipping behavior anchor:
  code, tests, and demos when they exist in the branch
- target refactor source of truth:
  docs under `packages/chat/docs/refactor/`

## Read At The Start Of Each Task

- `packages/chat/README.md`
  Read this first for the official package entry surfaces, helper boundary, and demo route map.
- `packages/chat/docs/README.md`
  Start here for the docs map.
- `packages/chat/docs/SOURCE_OF_TRUTH.md`
  Read this to know which file category owns which answer.
- `packages/chat/docs/CURRENT_VS_TARGET_SURFACE.md`
  Read this to distinguish current behavior anchors from target refactor contracts.
- `packages/chat/docs/refactor/README.md`
  Read this before touching refactor design, process, archive, or review docs.
- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
  Read this when the task continues an active refactor slice and you want the latest recurring implementation lessons.

If the task includes implementation files, then also inspect the nearest relevant code, tests, and demo files before editing.

## Read Before Finishing A Code Change

- `packages/chat/docs/refactor/REFACTOR_COLLAB_GUIDE.md`
  This defines the default write discipline for code, docs, review packets, plans, and histories.
- `packages/chat/docs/histories/template.md`
  Use this when the task lands a real repository change worth recording.
- the active execution slice under `packages/chat/docs/exec-plans/active/`, if the task has one

## Read When The Task Needs It

- `packages/chat/docs/refactor/design/overview.md`
  Target mental model and design boundaries.
- `packages/chat/docs/refactor/design/api-runtime.md`
  Public contract, runtime ownership, slot, and message-model source of truth.
- `packages/chat/docs/refactor/design/execution.md`
  Phase gates, sequencing, and validation expectations.
- `packages/chat/docs/refactor/process/review-scheme.md`
  Review method, meeting shape, and fixed cadence.
- `packages/chat/docs/refactor/process/alignment-tracker.md`
  Current status, decisions, open questions, and next actions.
- `packages/chat/docs/refactor/process/test-boundary-baseline.md`
  Post-closure test-boundary baseline for official-path cleanup, keep/adapt/retire classification, and deletion-gate commands.
- `packages/chat/docs/refactor/process/legacy-surface-inventory.md`
  Post-closure inventory of remaining legacy entry, bridge, helper, and test surfaces after the first cleanup batches.
- `packages/chat/docs/refactor/process/legacy-retirement-roadmap.md`
  Ordered path from current post-closure cleanup to full legacy retirement, including delete sequencing, gate rules, and end-state checklist.
- `packages/chat/docs/refactor/process/provider-helper-decision-baseline.md`
  Concrete keep/delete recommendation baseline for provider/comparison helper surfaces before helper-retirement slices start deleting code.
- `packages/chat/docs/refactor/process/full-cutover-closure-checklist.md`
  Final end-state checklist and progress model for the remaining legacy-retirement work.
- `packages/chat/docs/refactor/process/core-flow-stabilization-baseline.md`
  Temporary stabilization gate for recovering official-path regressions before more retirement work resumes.
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
  Candidate and promoted recurring lessons gathered during implementation.
- `packages/chat/docs/refactor/CODE_MAP.md`
  Intended implementation areas and ownership boundaries.
- `packages/chat/docs/refactor/IMPLEMENTATION_ROUTING.md`
  Where to start for a given kind of refactor or implementation change.
- `packages/chat/docs/refactor/archive/proposal.md`
  Historical problem statement and earlier option analysis.
- `packages/chat/docs/refactor/archive/phase-0_5-freeze-record.md`
  Historical Phase 0.5 freeze record.

## Working Rules

- Prefer updating one primary source doc over touching every related doc.
- Archive docs are historical context. Do not update them during routine coding unless the task is explicitly re-baselining history.
- Review packets exist to prepare a specific meeting. They do not replace long-term source docs.
- Generated docs are derived artifacts. Update them only when their owning source doc changed.
- Knowledge docs are a thin reuse layer. Update them only when a lesson repeats, changes future implementation choices, or closes a recurring source of confusion.
- If a change affects contract, update `api-runtime.md` or `execution.md` first, then update tracker or review material only if the task truly changed status or meeting narrative.
- If a code or workflow change makes a local doc stale, update the stale doc in the same task when practical.
- After each completed task, report the current estimated active-phase progress and overall refactor progress, using `alignment-tracker.md` plus the active execution slice as the default evidence base.
- For the remaining legacy-retirement work, also report the current full-cutover closure progress using `full-cutover-closure-checklist.md`.
