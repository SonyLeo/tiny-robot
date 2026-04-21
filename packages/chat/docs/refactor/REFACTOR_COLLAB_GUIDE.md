# Chat Refactor Collaboration Guide

This document defines the default write discipline for the chat refactor branch.

## Core Rule

A typical task should update:

- one primary source doc
- and, only when needed, one status or derived doc

You should almost never need to update every refactor document in a single code task.

## Primary Write Targets

- contract change:
  `design/api-runtime.md`
- phase, gate, or validation change:
  `design/execution.md`
- top-level design direction change:
  `design/overview.md`
- review method change:
  `process/review-scheme.md`
- current status, conclusions, or next actions:
  `process/alignment-tracker.md`
- meeting preparation:
  the relevant file under `reviews/`
- multi-session implementation slice:
  an active file under `../exec-plans/active/`
- finished code change:
  a history entry under `../histories/`
- repeated implementation lesson:
  `knowledge/EXPERIENCE_LOG.md`, and `knowledge/PLAYBOOK.md` only after the lesson is stable enough to reuse

## Update Order

When a real change happens:

1. update the primary source doc
2. update tracker or review packet only if the task changed status or meeting narrative
3. update a generated artifact only if its source contract changed
4. write a history entry only when code or repository behavior actually landed
5. write a knowledge entry only when a lesson repeated, changed future implementation choices, or surfaced the same confusion more than once

## Archive Rule

Do not update:

- `archive/proposal.md`
- `archive/phase-0_5-freeze-record.md`

unless the task is explicitly re-baselining historical context.

## Review Packet Rule

Review packets are temporary communication artifacts for a specific meeting.

- They may summarize source docs.
- They must not become the place where the real contract is defined.
- After the meeting, the lasting outcome belongs in `process/alignment-tracker.md`.

## Generated Artifact Rule

Generated or derived tables help with fast lookup.

- They are not the authority.
- Their source files must be named in the artifact.
- If an artifact and a design doc disagree, the design doc wins.

## Knowledge Layer Rule

The knowledge layer is intentionally thin.

- `knowledge/EXPERIENCE_LOG.md` tracks candidate or promoted recurring lessons.
- `knowledge/PLAYBOOK.md` only keeps the lessons that are stable enough to guide later slices.

Promotion rule:

- if a lesson only happened once, keep it in the local task/history unless it clearly changes future implementation choices
- if the same lesson repeats, blocks a review, or forces multiple rewrites across slices, record it in `EXPERIENCE_LOG.md`
- only promote it into `PLAYBOOK.md` when it is stable enough to be phrased as reusable guidance

## Phase 1A Validation Baseline

While Phase 1A is active, treat the following as the default implementation check sequence:

1. `pnpm -F @opentiny/tiny-robot-chat type-check`
2. `pnpm -F @opentiny/tiny-robot-chat test:runtime`
3. `pnpm -F @opentiny/tiny-robot-chat test:contracts`
4. `pnpm -F @opentiny/tiny-robot-chat check:docs`

Convenience rule:

- `pnpm -F @opentiny/tiny-robot-chat check:phase-1a` is the package-local shorthand for that baseline.
- If a task changed runtime contract, bridge subset, footer treatment, or first-screen semantics, do not mark the slice complete without running it.
