# AGENTS.md

## Scope

- This file applies to `packages/chat` only.
- `packages/chat` is the standalone chat suite package `@opentiny/tiny-robot-chat`.
- Do not treat `packages/cli` or `packages/cli/templates/chat` as implementation reference. They are out of scope for this package.

## Current Status

- `packages/chat` is implementing the MVP plan under `docs/mvp-plan.md`.
- Stage 1 scaffolding defines package metadata, public protocol types, context keys, and `useChatContext`.
- Stage 2 adds `Root.vue` as the provider-only white-box entry foundation.
- Stage 3 adds `Composer.vue` as the `ChatRuntime -> TrSender` adapter.
- Stages 4-7 add `Messages`, `Conversations`, `Header`, `Chat.vue`, `useKitChatRuntime`, and `useManagedChatRuntime`.
- The chat suite should be designed from existing workspace packages, not copied from the CLI template.

## Relevant Workspace Packages

- `packages/components`: UI base components and shared styles.
- `packages/kit`: conversation, message, provider, and storage logic.
- `packages/svgs`: icon assets.
- `packages/test`: Playwright-based verification sandbox.

## Source Of Truth

- Prefer existing implementations in `packages/components/src` and `packages/kit/src`.
- For UI composition, inspect components such as `container`, `bubble`, `history`, `sender`, `theme-provider`, `mcp-server-picker`.
- For runtime logic, inspect `packages/kit/src/vue/conversation`, `packages/kit/src/vue/message`, `packages/kit/src/providers`, `packages/kit/src/storage`.

## Design Rules

- Build the chat suite on top of existing base components and kit capabilities.
- Do not change existing props in shared base components.
- New props are allowed only when backward compatibility is preserved.
- Prefer package-local composition and wrappers over intrusive shared-component changes.
- Keep exported chat API explicit: `props`, `emits`, `slots`, and exported types.

## Workspace Facts

- The repo uses a `pnpm` workspace from `pnpm-workspace.yaml`.
- Workspace packages include `packages/**` and exclude `packages/cli/templates/**`.
- Root build entry for shared UI is `pnpm build:components`.
- `pnpm build:components` already builds dependent workspace packages before building `@opentiny/tiny-robot`.

## Testing Rules

- Before any e2e or Playwright verification, run `pnpm build:components` first.
- If shared components were rebuilt, restart any running test server before testing again.
- Reason: `packages/test/playwright.config.ts` enables `reuseExistingServer` outside CI, so an old server can hide fresh changes.

## E2E Flow

1. Run `pnpm build:components`.
2. Stop any existing `packages/test` dev server or Playwright web server.
3. Start a fresh server with `pnpm -F tiny-robot-test dev`, or let Playwright start one.
4. Run `pnpm -F tiny-robot-test test`.

## Change Checklist

- Check whether the change belongs in `packages/chat`, `packages/components`, or `packages/kit`.
- If shared package behavior changes, verify downstream impact before finishing.
- Ignore `packages/cli` when making chat suite decisions.
