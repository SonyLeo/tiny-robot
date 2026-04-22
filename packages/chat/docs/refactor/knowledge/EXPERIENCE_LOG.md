# Chat Refactor Experience Log

This file is the lightweight tracker for recurring refactor lessons.

Use it when a lesson:

- repeats across slices
- blocks or reshapes review
- causes multiple rewrites
- clearly changes how later implementation should proceed

Do not use it for every finished task.

## Status Meanings

- `candidate`:
  the lesson is recurring, but not yet stable enough to prescribe broadly
- `promoted`:
  the lesson is stable enough to appear in `PLAYBOOK.md`
- `dropped`:
  the lesson was tracked, but should not become standing guidance

## Entries

| ID | Status | Lesson | Why it matters | Evidence |
| --- | --- | --- | --- | --- |
| K-001 | `promoted` | new behavior should move into owning runtime modules before scaffold or bridge layers are widened | prevents refactor work from re-creating config projection and keeps slices reviewable | `2026-04-21-phase-1a-root-bootstrap.md`, `2026-04-21-phase-1b-page-baseline.md`, `PLAYBOOK.md#1-move-new-behavior-toward-runtime-ownership-not-scaffold-relay` |
| K-002 | `promoted` | message targeting should use `messageId / messageIds`, not new `messageIndex` semantics | avoids edit/retry/regenerate/custom-action drift when message order changes | `2026-04-21-phase-1a-root-bootstrap.md`, `PLAYBOOK.md#2-prefer-stable-ids-over-positional-semantics` |
| K-003 | `promoted` | public composition surfaces need one clear owner and narrow compatibility delegates | avoids ambiguous ownership when `Page` or other official surfaces are introduced | `2026-04-21-phase-1b-page-baseline.md`, `PLAYBOOK.md#3-keep-a-single-owner-for-each-public-composition-surface` |
| K-004 | `promoted` | bridge subsets should only expand when code, tests, and docs all agree | keeps `createRuntimeFromConfig(config)` additive instead of aspirational | `config-bridge-matrix.md`, `2026-04-21-phase-1b-page-baseline.md`, `PLAYBOOK.md#4-expand-bridge-subsets-only-when-they-are-implemented-and-evidenced` |
| K-005 | `candidate` | mounted `Root + Page` proof should be added soon after a baseline slice lands, not deferred too long | source/runtime proof can still leave ownership drift or composition regressions undetected | `2026-04-21-phase-1b-mounted-root-page-integration.md`, `2026-04-21-phase-1b-page-baseline.md`, `alignment-tracker.md` |
| K-006 | `candidate` | compatibility delegates should be contract-tested whenever ownership shifts | without explicit tests, wrapper layers quietly grow back into second owners | `public-surface.test.mjs`, `workspace-slot-contract.test.mjs` |
| K-007 | `candidate` | once a composition surface becomes official, give it a narrow input boundary instead of letting it read broad preset or scaffold buckets directly | it keeps ownership explicit and makes later relay tightening additive instead of a page rewrite | `2026-04-21-phase-1b-page-relay-tightening.md`, `public-surface.test.mjs`, `page-region-contract.md` |
| K-008 | `candidate` | after an official composition surface gets a narrow input boundary, the nearest default primitives should consume those explicit inputs before falling back to compatibility relay | otherwise ownership stays nominally correct while defaults still leak back through scaffold lookups one component lower | `2026-04-21-phase-1b-default-page-primitive-tightening.md`, `public-surface.test.mjs`, `api-runtime.md` |
| K-009 | `candidate` | workspace owner chains need the same explicit-input treatment as page owner chains once the default page path is stabilized | otherwise sidebar and mobile-sheet paths keep reintroducing display-default relay through scaffold lookups even after page ownership is narrowed | `2026-04-21-phase-1b-workspace-relay-tightening.md`, `workspace-slot-contract.test.mjs`, `page-region-contract.md` |
| K-010 | `promoted` | once explicit owner inputs reach a primitive, those inputs should become authoritative and compatibility relay should become explicit instead of staying silently active | otherwise ownership looks explicit on the surface, but the old relay still decides the effective renderer or display behavior one layer lower | `2026-04-21-phase-1b-layout-renderer-relay-pruning.md`, `2026-04-21-phase-1b-header-history-relay-pruning.md`, `2026-04-21-phase-1b-welcome-message-list-relay-pruning.md`, `PLAYBOOK.md#6-once-owner-inputs-are-explicit-compatibility-relay-must-become-explicit` |
| K-011 | `promoted` | phase review packets should carry an explicit evidence index and current drift summary instead of only narrative status text | otherwise review meetings drift back into live repository archaeology and the pass/blocked decision becomes harder to anchor | `review-b-phase-1a-report-and-phase-1b-kickoff/REVIEW_B_SPEC_DETAIL.md`, `review-c-phase-1b-report-and-phase-2-kickoff/REVIEW_C_SPEC_DETAIL.md`, `PLAYBOOK.md#7-phase-reviews-should-package-evidence-and-drift-explicitly` |
| K-012 | `candidate` | when a blackbox cutover must coexist with old config shapes, land the fully target-shaped entry path first and keep legacy fallback explicit instead of mixing both contracts in one hidden branch | it lets a new phase start proving the target path without pretending the old compatibility surface has already been retired | `2026-04-21-phase-2-blackbox-root-page-kickoff.md`, `2026-04-21-phase-2-blackbox-trchat-cutover-baseline.md`, `src/components/core/Chat.vue` |
| K-013 | `candidate` | compatibility callbacks should be classified by target owner domain instead of treated as an all-or-nothing blackbox gate | it let `onFinish / onError` move into `lifecycle.afterReceive / error` without prematurely dragging `onBeforeSend / onMessageAction / onModelChange` into the new entry path | `2026-04-21-phase-2-blackbox-lifecycle-callback-expansion.md`, `src/runtime/config/blackboxEntry.ts`, `generated/config-bridge-matrix.md` |
