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
- `packages/test/src/chat` no longer has an unresolved retained `adapt` bucket for the supported package story; the official-path and bounded advanced-provider Playwright set is now promoted into the retained gate.
- future unit/e2e cleanup and legacy-test retirement should now follow `test-governance-standard.md` first and use `test-boundary-baseline.md` as the file-by-file inventory, instead of mixing design rules and current classification in one document.
- the full file-level audit now lives in `test-suite-audit-baseline.md`; use it before moving directories, retiring scenes/helpers, or freezing new smoke/scenario command sets.
- the concrete test-expansion landing queue now lives in `test-gap-backlog.md`; use it to choose the next missing-coverage slice instead of inventing ad-hoc priorities from the tracker.
- `G-001` is now closed: the `TrChat` config-entry path has a package-local same-config runtime continuity guard in `runtime/trchat-config-runtime-resolution.test.mjs`, and the new internal helper uses `TrChat config` naming instead of introducing more blackbox-only jargon into the source.
- `G-002` and `G-003` are now closed as well: retained granular smoke now proves request lifecycle, assistant feedback, and attachments on the official `Root + primitives` path, and `GranularScene.vue` explicitly mounts the feedback after-slot that the default page body uses on the same supported contract.
- `G-004` is now closed too: `integration/root-page-mounted.test.mjs` mounts `TrChat.Provider(responseProvider)` directly and proves the retained leaf-composition contract at the nearest owner boundary instead of only through runtime helper tests or browser routing.
- `N-002` is now closed: retained Playwright specs are consolidated under `packages/test/src/chat/scenario-specs/`, so the top level of `packages/test/src/chat` is support-first again and the frozen smoke/scenario commands no longer mix two directory conventions.
- the retained Playwright gate now has named commands in `packages/test/package.json`: `pnpm.cmd -F tiny-robot-test test:chat:smoke` and `pnpm.cmd -F tiny-robot-test test:chat:scenario`; use those names instead of retyping the file list in future slices.
- the retained Playwright gate now also exposes `test:chat:smoke:full` and `test:chat:scenario:full` with an explicit `4`-worker baseline; use the non-`full` scripts as the stable fallback when local worker or web-server instability shows up.
- `packages/chat/tests` no longer has a dangling `adapt` bucket: the old `ui/chat-ui-context.test.mjs` sentinel has been re-homed into `contracts/chat-ui-context.test.mjs` and promoted into the hard contract gate for workspace UI responsiveness.
- the current `packages/test/src/chat/scenarios/*.vue` set now has an explicit ownership map in `test-suite-audit-baseline.md`; there is no orphan retained scene fixture that can be deleted wholesale without first rewriting a consuming smoke/scenario spec.
- compatibility-only `senderActions.upload = false` no longer acts as a supported retained boundary when an attachments owner is still present; that expectation is now an explicit contract drop instead of a cleanup blocker.
- the roadmap's first cleanup slice has now landed: the remaining `edge-overrides` holdouts (`wordCount = false`, `voice = false`, and explicit close composition) were handed off to official-path proofs, and the edge scene/spec pair has retired.
- post-closure cleanup has now removed the remaining `TrChat` scaffold fallback and explicit scaffold helper surface, retired the internal scaffold provision plus runtime bridge hints, removed the official-path scaffold-context readers, and deleted `src/legacy/rootBridge.ts`; the surviving bootstrap behavior now lives in `src/root/createRootBootstrapState.ts` instead of any `src/legacy/*` file.
- the remaining post-closure legacy surface is explicitly inventoried in `legacy-surface-inventory.md`; for the supported package story, that inventory is now settled and no longer waiting on another public legacy-retirement slice.
- the ordered path from current post-closure cleanup to full legacy retirement now lives in `legacy-retirement-roadmap.md`; use it instead of inventing ad-hoc cleanup sequencing from the tracker.
- the concrete keep/delete baseline for provider/comparison helper surfaces now lives in `provider-helper-decision-baseline.md`; use that document before opening the next helper-retirement implementation batch.
- the first provider-helper retirement batch has now landed: public `TrChat.Provider` accepts only the `responseProvider` branch, the injected-`chatKit` branch is gone, provider-side comparison scenes have been handed off to `responseProvider` or `Root`-based diagnostics, and the old `runtime/provider-chat-kit.test.mjs` sentinel has been replaced by `runtime/provider-response-provider.test.mjs`.
- `TrChatHistorySurface` has now retired after its last surviving history proof moved onto the official `WorkspaceLayout` default-left owner path; Part 1 is no longer waiting on a history-surface decision.
- the config-projection helper family has now retired as well: `loadChatConfig`, `createChatAdapterFromConfig`, `createPresetChatProps`, `createPresetChatSlices`, and `tests/config/*` are gone, and the surviving transport/message/renderer/copy proof has been handed off to current runtime/contract tests.
- public `useChatKit` has now retired from the package surface and docs story as well; the remaining `useChatKit` implementation and package-local runtime tests are now treated as private runtime-chain proof instead of a supported helper surface.
- the final “can we call this fully cut over?” bar now lives in `full-cutover-closure-checklist.md`; use that checklist plus the active closure plan for future progress reporting.

- `post-closure core-flow stabilization` is now complete; the retained smoke/scenario gates are green again, and the branch no longer has an active official-path usability blocker.
- `full-cutover-closure-checklist.md` is green again for the current supported package story, and the follow-up test expansion / suite-normalization slice has now closed with the retained hard gate plus Playwright gate green.
- formal package-local code-coverage reporting has now landed as `pnpm.cmd -F @opentiny/tiny-robot-chat test:coverage`; it reuses `packages/chat/tests` (`runtime`, `contracts`, `integration`) to report against `packages/chat/src`, and it does not replace the retained Playwright gate under `packages/test/src/chat`.
- the post-closure coverage / story / surface-cleanup slice is now complete as well: README and design guidance explicitly describe the settled three-layer product model, the retained `TrChat.Provider(responseProvider)` tier is called out as "our UI + runtime, your transport", and the first bounded public-surface cleanup batch has removed `UseChatKit*`-shaped provider exports from the public package surface while keeping the private runtime chain internal.
- the remaining optional follow-ups after that completed slice are:
  - only resume deeper private-runtime cleanup if a separate scoped task justifies more public-surface or internal naming work
  - handle deferred standalone page-level `footer` publishing semantics as its own contract task

## Next Actions

1. There is no required active optional slice for the current supported package story; the remaining follow-ups are deferred, not blocking.
2. Use `pnpm.cmd -F @opentiny/tiny-robot-chat test:coverage` when a slice needs formal package-local coverage evidence, and keep `packages/test/src/chat` as the separate retained e2e gate.
3. If future work resumes private-runtime cleanup, keep it bounded to public-surface or internal naming cleanup first; do not reopen deep runtime re-architecture without a separate scoped task.
4. Use `test-governance-standard.md`, `test-boundary-baseline.md`, `test-suite-audit-baseline.md`, and `test-gap-backlog.md` together before adding, retiring, or moving tests.
5. Keep `pnpm.cmd -F tiny-robot-test test:chat:smoke:full` and `pnpm.cmd -F tiny-robot-test test:chat:scenario:full` as the preferred retained Playwright gate, with the non-`full` scripts as the stable fallback when local worker or web-server instability shows up.
6. Keep any future contract changes in `design/api-runtime.md` and `design/execution.md` first, then backwrite the tracker.
7. Treat deferred standalone `footer` publishing semantics as a separate contract task, not as a blocker for public cutover closure.
