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
| Phase 1B | `completed` | page/history/models/workspace baseline, mounted `Root + Page` proof, page-input boundary, default-page primitive tightening, workspace relay tightening, `ChatLayout` authoritative renderer inputs, header/history opt-out, and welcome/message-list opt-out are all closed as the Phase 1B default-owner-path baseline |
| Phase 2 | `completed` | Review C accepted the narrow target-`TrChatConfig` blackbox kickoff preview as the Phase 2 entry baseline; post-closure cleanup has now tightened that blackbox contract to target `TrChatConfig` plus serialized target config only, removed scaffold fallback from `TrChat`, and retired the explicit scaffold helper surface |
| Phase 3 / 4 | `completed` | Phase 3A and Phase 3B are both closed; Review D passed with follow-ups, accepted the Phase 2 exit plus Phase 3/4 closure, and left only bounded post-closure cleanup on later legacy deletion plus deferred standalone `footer` replace-slot publishing semantics |

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
  `pass-with-follow-ups`
- goal:
  Phase 1B report plus Phase 2 kickoff
- readiness note:
  Review C packet has been prepared around the now-complete Phase 1B evidence bundle:
  `TrChat.Page` owner baseline, `history / models / workspace` page consumption, mounted `Root + Page` proof, page-input boundary, the closed default-owner-path relay tightening chain, and a narrow target-`TrChatConfig` blackbox kickoff preview.
- outcome:
  - main decision:
    Review C passed with follow-ups and accepted the current Phase 1B evidence bundle plus the narrow target-`TrChatConfig` blackbox kickoff preview.
  - go or no-go:
    Phase 2 may continue immediately.
  - settled conclusions:
    - `Phase 1B` is accepted as the completed default page owner-path baseline.
    - the landed target-`TrChatConfig` blackbox kickoff preview is accepted as the formal Phase 2 entry baseline.
    - blackbox `TrChat` should continue expanding from `createRuntimeFromConfig(config) -> Root + Page`, not by reopening config projection or broad scaffold relay.
    - old `ChatConfig` shapes and compatibility-only props may remain bounded fallback paths while Phase 2 continues shrinking them.
  - follow-ups:
    - continue pruning legacy `ChatConfig` and compatibility-prop fallback paths without re-opening the closed Phase 1B owner-path contract.
    - keep `footer` replace-slot final publishing semantics deferred until later review.
    - keep Phase 2 reports evidence-driven with explicit blackbox integration proof and current drift summary.
- packet:
  - `../reviews/review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_OWNER_RUNBOOK.md`
  - `../reviews/review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_SPEC_DETAIL.md`
  - `../reviews/review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_REVIEWER_MEMO.md`

### Review D

- status:
  `pass-with-follow-ups`
- goal:
  Phase 2 report plus final Phase 3/4 closure
- outcome:
  - main decision:
    Review D passed with follow-ups and accepted the current Phase 2 evidence bundle plus the Phase 3/4 closure result.
  - go or no-go:
    The refactor is now `closure-ready-with-follow-ups`; later cleanup may proceed without reopening active architecture execution.
  - settled conclusions:
    - `Phase 2` is accepted as the closed blackbox `TrChat` default-path result.
    - `Phase 3` parity is accepted as sufficiently owner-aligned and evidenced at the nearest runtime, page, and primitive boundaries.
    - `Phase 4` closure is accepted as bounded hardening rather than hidden unfinished implementation.
    - package README, official demo routes, review packet, and package-level validation now all describe the same official entry ladder.
  - follow-ups:
    - later legacy-path deletion remains explicit post-closure cleanup, not a closure blocker.
    - standalone page-level `footer` replace-slot publishing semantics remain deferred.
- packet:
  - `../reviews/review-d-phase-2-report-and-phase-3-4-closure/REVIEW_D_OWNER_RUNBOOK.md`
  - `../reviews/review-d-phase-2-report-and-phase-3-4-closure/REVIEW_D_SPEC_DETAIL.md`
  - `../reviews/review-d-phase-2-report-and-phase-3-4-closure/REVIEW_D_REVIEWER_MEMO.md`

## Open Questions And Risks

- The standalone page-level `footer` replace slot remains deferred until the Phase 1B page baseline proves that contract is stable.
- Phase reports and later cleanup notes must stay evidence-driven instead of drifting back to purely narrative updates.
- Later cleanup should not silently widen old `ChatConfig` fallback or feature-first ownership on already-closed runtime, page, sender, attachments, and workspace paths.
- package-level validation is green again after exporting the missing sibling `tiny-robot-svgs` icons and rebuilding its dist artifacts; the remaining hardening question is whether to clean up the non-blocking runtime warning separately from refactor closure.
- Post-closure cleanup in this development branch should optimize for preserving official-path functionality, not for keeping legacy compatibility code alive by default.
- `packages/test/src/chat` is still a mixed e2e suite; retained official-path scenarios need a keep/adapt/retire pass before the whole folder can become a hard legacy-pruning gate.
- the first retained Playwright gate batch is now adapted around the official entry ladder (`index.spec.ts`, `history.spec.ts`, `request-lifecycle.spec.ts`, `workspace-slots.spec.ts`, `renderer-registry.spec.ts`), and the scaffold-surface-removal closure batch is now green for `layout-config`, `welcome-prompts`, `sender-actions`, `surface-api`, `sender-extensions`, `mcp-feature`, and `message-transforms`; the rest of `packages/test/src/chat` still needs the same keep/adapt/retire tightening before it can gate broad legacy deletion.
- compatibility-only `senderActions.upload = false` no longer acts as a supported retained boundary when an attachments owner is still present; that expectation is now an explicit contract drop instead of a cleanup blocker.
- the roadmap's first cleanup slice has now landed: the remaining `edge-overrides` holdouts (`wordCount = false`, `voice = false`, and explicit close composition) were handed off to official-path proofs, and the edge scene/spec pair has retired.
- post-closure cleanup has now removed the remaining `TrChat` scaffold fallback and explicit scaffold helper surface, retired the internal scaffold provision plus runtime bridge hints, removed the official-path scaffold-context readers, and deleted `src/legacy/rootBridge.ts`; the surviving bootstrap behavior now lives in `src/root/createRootBootstrapState.ts` instead of any `src/legacy/*` file.
- the remaining post-closure legacy surface is explicitly inventoried in `legacy-surface-inventory.md`; the unresolved items are now limited to a small `delete-later` set of provider/comparison helpers, mixed `adapt` e2e scenes, and package-local legacy sentinels.
- the ordered path from current post-closure cleanup to full legacy retirement now lives in `legacy-retirement-roadmap.md`; use it instead of inventing ad-hoc cleanup sequencing from the tracker.
- the concrete keep/delete baseline for provider/comparison helper surfaces now lives in `provider-helper-decision-baseline.md`; use that document before opening the next helper-retirement implementation batch.
- the final “can we call this fully cut over?” bar now lives in `full-cutover-closure-checklist.md`; use that checklist plus the active closure plan for future progress reporting.

## Next Actions

1. Treat the root-bridge-retirement slice as closed: the last `src/legacy/*` implementation file is gone, the hard gate is green, and the remaining cleanup surface is explicitly limited to helper/test retirement work.
2. If later cleanup continues, drive progress from `full-cutover-closure-checklist.md` plus the active full-cutover plan, and implement the remaining parts in order:
   - provider helper retirement
   - legacy test retirement
   - final surface cleanup
3. Keep any future contract changes in `design/api-runtime.md` and `design/execution.md` first, then backwrite the tracker.
4. Treat deferred standalone `footer` publishing semantics as a separate contract task, not as a blocker for later cleanup.
