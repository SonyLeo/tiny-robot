## [2026-04-21 22:40] | Task: Phase 1B workspace relay tightening

### Why Now

After `TrChat.Page` and its nearest default primitives stopped reading raw preset buckets directly, the remaining obvious relay drift sat in the default workspace path.
`ChatWorkspaceLayout`, sidebar, and mobile sheets still rediscovered display defaults through scaffold relay instead of consuming explicit owner inputs.

### Files Changed

- `packages/chat/src/page/TrChatPage.vue`
- `packages/chat/src/components/workspace/ChatWorkspaceLayout.vue`
- `packages/chat/src/components/workspace/ChatWorkspaceSidebar.vue`
- `packages/chat/src/components/workspace/ChatWorkspaceLeftSheet.vue`
- `packages/chat/src/components/workspace/ChatWorkspaceRightSheet.vue`
- `packages/chat/tests/contracts/public-surface.test.mjs`
- `packages/chat/tests/contracts/workspace-slot-contract.test.mjs`
- `packages/chat/docs/exec-plans/completed/2026-04-21-phase-1b-workspace-relay-tightening.md`
- `packages/chat/docs/refactor/process/alignment-tracker.md`
- `packages/chat/docs/refactor/design/api-runtime.md`
- `packages/chat/docs/generated/page-region-contract.md`
- `packages/chat/docs/refactor/knowledge/EXPERIENCE_LOG.md`

### Contracts Touched

- workspace default-owner path:
  the default workspace layout path now consumes explicit `appearance` and `sidebarTitle` inputs from the page owner instead of rediscovering them through scaffold relay
- sidebar/mobile-sheet fallback path:
  sidebar and sheet fallback UI now stays aligned with workspace owner inputs in the default page path
- docs:
  workspace-facing relay tightening is now recorded as completed Phase 1B evidence

### Changes Overview

- Main implementation result:
  `TrChat.Page` now passes `sidebarTitle` into `ChatWorkspaceLayout`, which then forwards explicit `appearance` and `sidebarTitle` inputs into the default sidebar and mobile sheets.
  `ChatWorkspaceSidebar`, `ChatWorkspaceLeftSheet`, and `ChatWorkspaceRightSheet` no longer depend on raw scaffold lookups for those defaults in the default page path.
- Main test result:
  Workspace slot contract tests now assert that the workspace owner path passes explicit owner inputs into the sidebar and sheet fallback chain.
- Main docs result:
  Updated the completed execution slice, tracker, API/runtime contract, page-region contract, and experience log.

### Validation

- Commands:
  - `pnpm -F @opentiny/tiny-robot-chat type-check`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/contracts`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/runtime`
  - `node packages/chat/tests/run-all.mjs packages/chat/tests/integration`
  - `node packages/chat/scripts/check-refactor-docs.mjs`
- Result:
  - all passed

### Drift From Plan Or Review

- What drifted:
  - this slice focused on the default workspace/sidebar/mobile-sheet owner path and did not try to retire every remaining scaffold fallback in one pass
- Why:
  - the Phase 1B goal here is to keep tightening ownership boundaries without reopening a larger page/workspace rewrite
- Backwrite status:
  - completed slice, tracker, API/runtime contract, page-region contract, and experience log updated in the same task

### Known Limits

- `ChatWorkspaceLayout` still keeps a compatibility fallback when explicit props are absent
- `ChatLayout`, `ChatHeader`, `ChatHistory`, `ChatWelcome`, and `ChatMessageList` still retain scaffold fallbacks for non-page compatibility paths
- this slice does not attempt full scaffold-context retirement

### Follow-ups

- decide the next highest-value compatibility relay to shrink in Phase 1B
- continue keeping default owner paths explicit before touching broader compatibility surfaces
- promote the owner-input relay lesson once it repeats enough to become stable playbook guidance
