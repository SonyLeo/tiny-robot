# Chat Refactor Alignment Tracker

Status: active process tracker.

This file records current status, conclusions, open questions, and next actions.
It is not a second contract source.

## Role

Use this file to track:

- current refactor milestone status
- review readiness and review outcomes
- already-settled conclusions at the process level
- open questions, risks, and follow-ups

If a contract changes, update the owning design doc first and then update this tracker.

## Current Settled Direction

The current process-level baseline is:

- official user mental model stays on `TrChat`, `TrChat.Root`, and `TrChat.Page`
- `createRuntimeFromConfig(config)` is the official bridge entry
- `ui` stays display-only
- `Page` stays composition-only
- runtime ownership is organized by source of truth rather than by page region

The active source docs for these decisions are:

- `../design/overview.md`
- `../design/api-runtime.md`
- `../design/execution.md`

Historical rationale and freeze context live in:

- `../archive/proposal.md`
- `../archive/phase-0_5-freeze-record.md`

## Phase Snapshot

| Area | Status | Notes |
| --- | --- | --- |
| overall direction | `ready-for-review` | design and contract docs are in place for sign-off |
| Phase 0 / 0.5 freeze | `ready-for-review` | archived freeze record remains available for context |
| Phase 1A | `pending` | waits on Review A sign-off |
| Phase 1B | `pending` | depends on Phase 1A closure |
| Phase 2 | `pending` | blackbox cutover remains later-stage work |
| Phase 3 / 4 | `pending` | parity and hardening remain later-stage work |

## Review Status

### Review A

- status:
  `ready-to-schedule`
- goal:
  overall direction plus Phase 0.5 contract sign-off
- packet:
  - `../reviews/review-a-direction-and-phase-0-5-1a/REVIEW_A_OWNER_RUNBOOK.md`
  - `../reviews/review-a-direction-and-phase-0-5-1a/REVIEW_A_SPEC_DETAIL.md`
  - `../reviews/review-a-direction-and-phase-0-5-1a/REVIEW_A_REVIEWER_MEMO.md`

### Review B

- status:
  `prepared-awaiting-phase-1a`
- goal:
  Phase 1A report plus Phase 1B kickoff
- packet:
  - `../reviews/review-b-phase-1a-report-and-phase-1b-kickoff/REVIEW_B_OWNER_RUNBOOK.md`
  - `../reviews/review-b-phase-1a-report-and-phase-1b-kickoff/REVIEW_B_SPEC_DETAIL.md`
  - `../reviews/review-b-phase-1a-report-and-phase-1b-kickoff/REVIEW_B_REVIEWER_MEMO.md`

### Review C

- status:
  `pending`
- goal:
  Phase 1B report plus Phase 2 kickoff

### Review D

- status:
  `pending`
- goal:
  Phase 2 report plus final Phase 3/4 closure

## Open Questions And Risks

- `Footer` phase placement still needs explicit implementation-time treatment.
- Contract artifacts and contract tests still need to become the normal coding baseline, not just review support material.
- Phase reports must stay evidence-driven instead of drifting back to purely narrative updates.

## Next Actions

1. Keep active contract changes in `design/api-runtime.md` and `design/execution.md`.
2. Use review packets only to prepare the next meeting.
3. After each review, update this file with:
   - final status
   - settled conclusions
   - open questions
   - next actions
