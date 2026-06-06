# TinyRobot Project Guide

This file applies to the `D:\Projects\Work\tiny-robot` monorepo.

## Repo Intent

- TinyRobot is a Vue 3 AI component monorepo.
- Keep package boundaries clear.
- Prefer small, package-local changes over cross-package refactors.

## Package Routing

- `packages/components`
  - reusable UI components and styles
  - use this for `Tr*` building blocks, tokens, renderers, and shared visual behavior
- `packages/kit`
  - data and runtime layer
  - use this for providers, `useMessage`, `useConversation`, storage, transport, and tool plugins
- `packages/chat`
  - higher-level chat shell and layout work
  - use this for page-level layout, responsive shells, and chat-oriented composition
- `packages/svgs`
  - icon assets
- `packages/playground`
  - playground integration and demos
- `packages/cli`
  - scaffolding and template output
- `packages/test`
  - test harnesses and UI test assets

## Package Boundary Rules

- Do not move business truth into `packages/chat` unless the user explicitly wants that direction changed.
- For chat work, treat `packages/chat` as UI-first and composition-first.
- When a change affects public exports, inspect the package `src/index.ts`, `package.json`, and any demos or docs that present the API.
- If `src` and `dist` disagree, treat `src` plus current docs as the source of truth and call out stale build output explicitly.

## High-Signal Files

- Root overview:
  - `README.md`
  - `README.zh-CN.md`
  - `package.json`
- Chat package:
  - `packages/chat/docs/note.md`
  - `packages/chat/docs/phase-1-layout.md`
  - `packages/chat/src/index.ts`
  - `packages/chat/demo/src/App.vue`
- Component and runtime entry points:
  - package-local `src/index.ts`
  - package-local `package.json`

## Working Preferences

- Default to static verification only unless the user asks for builds, tests, or runtime checks.
- Prefer PowerShell 7 commands when shell behavior is relevant.
- Inspect diffs, docs, and consumer code before concluding that behavior is unchanged.
- Update demos or docs when a user-facing contract changes.

## Chat-Specific Notes

- `packages/chat` is currently staged as:
  1. layout primitives
  2. AI UI composition
  3. higher-level `ChatApp`
- Keep left and right panel behavior aligned with the design notes in `packages/chat/docs/`.
- Preserve explicit slot-based composition and avoid sneaking in business-side state unless requested.

## Command References

- Treat these as reference commands, not default actions:
  - `pnpm -F @tiny-robot/chat check`
  - `pnpm -F @tiny-robot/chat build`
  - `pnpm build:components`
- Only run them when the user asks for that level of verification.
