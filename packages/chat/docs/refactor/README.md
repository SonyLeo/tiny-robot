# Chat Refactor Docs

This directory contains the active refactor knowledge base for `packages/chat`.

## Layout

- `design/`
  active source docs for target design, contract, and phase execution
- `process/`
  review method and current alignment state
  plus post-closure test-boundary classification
- `knowledge/`
  thin recurring-knowledge layer for reusable implementation lessons
- `reviews/`
  meeting-specific review materials
- `archive/`
  historical rationale and freeze records

## Active Docs

Read these by default:

- `design/overview.md`
- `design/api-runtime.md`
- `design/ui-runtime-transport-layering.md`
- `design/execution.md`
- `process/review-scheme.md`
- `process/alignment-tracker.md`
- `process/test-governance-standard.md`
- `process/test-boundary-baseline.md`
- `process/test-suite-audit-baseline.md`
- `process/test-gap-backlog.md`
- `process/legacy-retirement-roadmap.md`
- `process/provider-helper-decision-baseline.md`
- `process/public-api-review-baseline.md`
- `process/public-api-adjudication-baseline.md`
- `process/package-root-export-adjudication.md`
- `process/full-cutover-closure-checklist.md`

## Supporting Guides

- `REFACTOR_COLLAB_GUIDE.md`
  how to keep code, docs, review packets, plans, and histories synchronized without updating everything
- `CODE_MAP.md`
  intended implementation areas and ownership boundaries
- `IMPLEMENTATION_ROUTING.md`
  where to start for a given kind of implementation change
- `knowledge/PLAYBOOK.md`
  stable heuristics reused across multiple refactor slices
- `knowledge/EXPERIENCE_LOG.md`
  lightweight tracker for recurring lessons that are candidates for promotion

## Archive Policy

These files are kept for context, not routine edits:

- `archive/proposal.md`
- `archive/phase-0_5-freeze-record.md`

Normal coding tasks should not update them.
