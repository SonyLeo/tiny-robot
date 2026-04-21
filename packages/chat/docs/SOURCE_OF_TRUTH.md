# Chat Refactor Source Of Truth

This file defines which document category owns which kind of knowledge during the chat refactor.

The goal is to reduce duplicate updates, not to create more paperwork.

## Active Normative Docs

These files define the current refactor design and should be treated as the primary source for active decisions:

- `packages/chat/docs/refactor/design/overview.md`
  design-level mental model, goals, and high-level boundaries
- `packages/chat/docs/refactor/design/api-runtime.md`
  public contract, runtime ownership, slot contract, message model, and source-of-truth rules
- `packages/chat/docs/refactor/design/execution.md`
  phase gates, sequencing, validation expectations, and milestone rules

## Active Process Docs

These files define how the refactor is reviewed and where the current process stands:

- `packages/chat/docs/refactor/process/review-scheme.md`
  review cadence, meeting template, and packet expectations
- `packages/chat/docs/refactor/process/alignment-tracker.md`
  current status, decisions, open questions, risks, and next actions

## Review Materials

These files prepare a specific meeting and should not become a second contract source:

- `packages/chat/docs/refactor/reviews/*/REVIEW_*_OWNER_RUNBOOK.md`
- `packages/chat/docs/refactor/reviews/*/REVIEW_*_SPEC_DETAIL.md`
- `packages/chat/docs/refactor/reviews/*/REVIEW_*_REVIEWER_MEMO.md`

## Archive Docs

These files are historical context and are not part of routine coding updates:

- `packages/chat/docs/refactor/archive/proposal.md`
- `packages/chat/docs/refactor/archive/phase-0_5-freeze-record.md`

Use them for rationale and historical freeze context.
Do not update them during normal implementation unless the task is explicitly re-baselining history.

## Knowledge Layer

These files are the thin recurring-knowledge layer for the refactor:

- `packages/chat/docs/refactor/knowledge/PLAYBOOK.md`
  stable implementation heuristics that have repeated enough to guide future slices
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`
  lightweight tracker for candidate, promoted, and dropped recurring lessons

They are not a second contract source.
They exist to reduce repeated mistakes and repeated rediscovery across slices.

## Execution Plans

These files define the next implementation slice:

- `packages/chat/docs/exec-plans/active/*.md`
- `packages/chat/docs/exec-plans/completed/*.md`
- template:
  `packages/chat/docs/exec-plans/templates/execution-slice.md`

Use them when work spans sessions, carries real risk, or needs decision logging.

## Histories

These files record what actually landed:

- `packages/chat/docs/histories/template.md`
- `packages/chat/docs/histories/YYYY-MM/*.md`

Only write a history entry when code or repository behavior actually changed.

## Generated Artifacts

These files are derived lookup tables:

- `packages/chat/docs/generated/runtime-owner-table.md`
- `packages/chat/docs/generated/config-bridge-matrix.md`
- `packages/chat/docs/generated/slot-catalog.md`
- `packages/chat/docs/generated/page-region-contract.md`

They are helpful indexes, not a second authoritative contract layer.

## Default Write Rule

Try to keep each task to one primary source doc plus, when necessary, one status or derived doc.

- contract changed:
  update `refactor/design/api-runtime.md`
- phase gate or validation policy changed:
  update `refactor/design/execution.md`
- design intent or top-level mental model changed:
  update `refactor/design/overview.md`
- review method or packet expectations changed:
  update `refactor/process/review-scheme.md`
- current status, decisions, risks, or next actions changed:
  update `refactor/process/alignment-tracker.md`
- preparing a specific review:
  update only the relevant review packet
- implementing a slice across sessions:
  update the active execution plan
- finished code landed:
  write or update a history entry
- high-frequency reference table changed:
  update the owning generated artifact after its source doc changed
- a lesson repeated, changed future implementation choices, or exposed a recurring source of confusion:
  update `refactor/knowledge/EXPERIENCE_LOG.md`, and promote it into `PLAYBOOK.md` only when it is stable enough to reuse

## What Not To Do

- Do not update every refactor document for a single code change.
- Do not let review packets or tracker entries become the place where contracts are really defined.
- Do not treat archive docs as active implementation guidance.
- Do not write a knowledge-layer entry for every finished task; only capture lessons that are likely to recur.
