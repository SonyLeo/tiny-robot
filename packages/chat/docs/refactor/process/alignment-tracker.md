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
| overall direction | `signed-off-with-follow-ups` | Review A accepted the main mental model, bridge path, and ownership split |
| Phase 0 / 0.5 freeze | `signed-off-with-follow-ups` | contract freeze passed with bounded follow-ups on footer treatment and contract-test baseline |
| Phase 1A | `completed` | Root/bootstrap baseline, message runtime hardening, eager `initialMessages` baseline, footer treatment, and default Phase 1A validation workflow are all closed |
| Phase 1B | `in-progress` | the page/history/models/workspace baseline slice is complete; `TrChat.Page` owns the default page composition, and direct mounted `Root + Page` integration coverage is the next active closure target |
| Phase 2 | `pending` | blackbox cutover remains later-stage work |
| Phase 3 / 4 | `pending` | parity and hardening remain later-stage work |

## Review Status

### Review A

- status:
  `pass-with-follow-ups`
- goal:
  overall direction plus Phase 0.5 contract sign-off
- outcome:
  - main decision:
    Review A passed with follow-ups and completed the current Phase 0.5 contract sign-off
  - go or no-go:
    Phase 1A may start immediately
  - settled conclusions:
    - `TrChat`, `TrChat.Root`, and `TrChat.Page` remain the official mental model
    - `createRuntimeFromConfig(config)` remains the official bridge entry
    - `ui` remains display-only
    - `Page` remains composition-only
    - `Phase 1A` stays focused on `conversation / sender / message / attachments + Root + bridge baseline`
  - follow-ups:
    - footer placement treatment was closed in Phase 1A by freezing the default page path to `footer-extra` only and covering it with contract tests
    - contract artifacts and contract tests were promoted into the default Phase 1A validation baseline
- packet:
  - `../reviews/review-a-direction-and-phase-0-5-1a/REVIEW_A_OWNER_RUNBOOK.md`
  - `../reviews/review-a-direction-and-phase-0-5-1a/REVIEW_A_SPEC_DETAIL.md`
  - `../reviews/review-a-direction-and-phase-0-5-1a/REVIEW_A_REVIEWER_MEMO.md`

### Review B

- status:
  `pass-with-follow-ups`
- goal:
  Phase 1A report plus Phase 1B kickoff
- packet readiness note:
  Review B packet has been refreshed to reflect the now-completed Phase 1A evidence bundle:
  `Root + createRuntimeFromConfig` baseline, `messageId / messageIds` hardening, eager `conversation.initialMessages`, `footer-extra` footer contract, and the default Phase 1A validation baseline.
- outcome:
  - main decision:
    Review B passed with follow-ups and accepted the current Phase 1A foundation evidence.
  - go or no-go:
    Phase 1B may start immediately.
  - settled conclusions:
    - `Root + createRuntimeFromConfig` is accepted as the standing Phase 1A on-ramp baseline.
    - `messageId / messageIds` is accepted as the formal message-action key path; remaining `messageIndex` usage stays legacy-only.
    - `conversation.initialMessages` eager baseline and the default `footer-extra` footer contract are accepted as closed Phase 1A semantics.
    - Phase 1B remains focused on `TrChat.Page` baseline plus `history / models / workspace` runtime consumption.
  - follow-ups:
    - standalone page-level `footer` replace slot remains deferred until the Phase 1B page baseline proves that contract is stable.
    - continue shrinking legacy `messageIndex` fallbacks instead of letting new Phase 1B work reintroduce index semantics.
    - keep phase reports evidence-driven by citing tests, completed execution slices, and histories rather than only narrative summaries.
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

- The standalone page-level `footer` replace slot remains deferred until the Phase 1B page baseline proves that contract is stable.
- Phase reports must stay evidence-driven instead of drifting back to purely narrative updates.

## Next Actions

1. Start the next Phase 1B slice for direct mounted `Root + Page` integration coverage on top of the landed page/history/models/workspace baseline.
2. Keep active contract changes in `design/api-runtime.md` and `design/execution.md`.
3. Carry the deferred standalone `footer` replace-slot decision as an explicit Phase 1B follow-up instead of back-porting it into closed Phase 1A semantics.
