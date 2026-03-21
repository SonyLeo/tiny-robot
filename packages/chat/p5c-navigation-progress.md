# P5-C Navigation Progress

> Scope: `P5-C / Content Navigation & View State`
>
> Current phase: `Phase 1 - Turn Navigation Host (Completed)`

## Goal

Land the minimum reusable content-navigation layer without reopening `P2 layout`, `P5-A appearance`, or the core chat render chain.

## Phase 1 Checklist

- [x] add minimal public types for content navigation
- [x] add workspace-attached navigation host
- [x] add first source model: conversation turn navigation
- [x] add one dedicated demo/test scene
- [x] add runtime unit test coverage
- [x] add browser E2E coverage
- [x] pass `packages/chat` build
- [x] pass unit tests
- [x] pass related E2E tests

## Current Notes

- first source model should be turn navigation, not assistant outline
- user navigation and assistant navigation remain separate source schemas
- navigation must attach to workspace center content, not become a `layout.variant`
- search, persistence, and multi-source merging stay out of phase 1

## Verification

- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/scenario-specs/content-navigation.spec.ts src/chat/workspace-shell.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts src/chat/sender-actions.spec.ts src/chat/workspace-shell.spec.ts src/chat/scenario-specs/content-navigation.spec.ts src/chat/scenario-specs/layout-config.spec.ts src/chat/scenario-specs/mcp-feature.spec.ts src/chat/scenario-specs/preset-entry.spec.ts src/chat/scenario-specs/sender-extensions.spec.ts src/chat/scenario-specs/welcome-prompts.spec.ts`

## Next Phase Candidates

- add assistant-outline navigation as a separate source model
- decide whether active-outline trigger should live inside bubble prefix or remain host-only
- evaluate whether content-navigation placement needs persistence in `viewState`
