# TrMarkdown Guide

This file applies to `D:\Projects\Work\tiny-robot-markdown-comp\packages\components\src\markdown`.

Use it as a fast local guide for editing `TrMarkdown`. Keep it operational. Do not repeat the full design docs here.

## Scope And Intent

- `TrMarkdown` is the first-party Markdown rendering base for TinyRobot.
- It must work in two modes:
  - standalone component usage
  - Bubble-integrated markdown rendering
- Prefer keeping markdown-specific logic inside this subtree. Do not quietly move markdown runtime truth into Bubble or unrelated packages.
- Bubble integration is adapter work, not Bubble source work.
  - Do not modify Bubble source files when implementing or fixing markdown behavior unless the user explicitly asks for Bubble changes.

## Read First

When picking up work here, read these files first in this order:

1. `index.ts`
2. `index.type.ts`
3. `TrMarkdown.vue`
4. `context.ts`
5. `parser/markdownItAdapter.ts`
6. `utils/render.ts`

That sequence gives you the public API, the main orchestrator, the injected context boundary, the parser contract, and the renderer dispatch path.

## Directory Map

- `TrMarkdown.vue`
  - top-level orchestrator
  - owns prop defaults, parse runtime, stream runtime, image gallery runtime, root telemetry, and render-mode switching
- `index.ts` / `index.type.ts`
  - public export surface
  - treat changes here as public API changes
- `context.ts`
  - injected markdown runtime context
  - exported publicly, so changes here can affect external consumers
- `parser/`
  - source markdown -> internal render node conversion
  - `markdownItAdapter.ts` is the current default adapter
- `runtime/`
  - top-level state orchestration composables used by `TrMarkdown.vue`
- `utils/render.ts` + `utils/renderers/*`
  - node dispatch and render routing
- `components/nodes/*`
  - baseline markdown node presentation
- `components/code-block/*`
  - code block subsystem
- `components/html-preview/*`
  - HTML Preview subsystem
- `components/mermaid/*`
  - Mermaid preview/source subsystem
- `components/math/*`
  - KaTeX rendering subsystem
- `components/image-gallery/*`
  - image enhancement and preview overlay
- `components/stream/*` + `stream/*`
  - animated streaming rendering, queueing, token scheduling, profiler, and incomplete-markdown handling
- `components/shared/*`
  - shared preview/source, toolbar, loading, and status UI used by advanced feature branches
- `fixtures/`
  - streaming fixtures and other markdown-specific regression inputs

## Change Routing

Choose the narrowest edit path that matches the problem:

- public prop or contract change:
  - start at `index.type.ts`, then verify `TrMarkdown.vue`, docs, and demo/test consumers
- parser behavior change:
  - start at `parser/markdownItAdapter.ts`
  - then inspect `utils/render.ts` and feature-specific renderers
- render output or DOM structure change:
  - start at `utils/render.ts`, `utils/renderers/*`, and the target component under `components/`
- streaming behavior change:
  - start at `runtime/useMarkdownStreamStateRuntime.ts`, `runtime/useMarkdownAnimatedStreamRuntime.ts`, and `stream/*`
- Bubble-related markdown issue:
  - confirm whether the fix belongs here first
  - prefer adapting `TrMarkdown` or the markdown-facing adapter layer
  - avoid leaking more markdown-private config through Bubble integration
  - do not edit Bubble source just to unblock markdown work

## Public Boundaries And Risky Contracts

Treat these as high-risk areas:

- `index.ts` / `index.type.ts`
  - every export here is effectively public
- `useMarkdownContext`
  - exported publicly; treat it as a reactive read contract and keep CT coverage when changing context fields
- `TrMarkdownParserAdapter`
  - public in type shape, but current renderer still assumes the existing internal node protocol
- `actionsRender`
  - keep the stable `defaultActions` / `renderDefaultActions()` path working; `originalNode` is legacy compatibility
- Bubble markdown config passed through `contentAttributes`
  - current boundary is workable but still too leaky
- Bubble source edits
  - treat as out of scope for normal markdown tasks
- root `data-stream-*` telemetry in `TrMarkdown.vue`
  - summary attrs plus `data-stream-snapshot` / `data-stream-profiler-debug` are used by CT/E2E; avoid re-expanding low-level profiler attrs
- package build boundaries
  - Mermaid, KaTeX, Shiki, @shikijs, and highlight.js subpaths should stay external in `packages/components/vite.config.ts`
  - keep advanced Markdown runtimes behind dynamic imports unless a user explicitly accepts the publish-size cost

If a change touches one of these areas, update docs in the same task unless the user explicitly scopes you away from docs.

## Current Contract Notes

Do not regress these recently closed contracts:

- `features.html` / `parserOptions.html`
  - generic raw HTML now has a real sanitized render path and CT coverage
- `useMarkdownContext`
  - injected consumers must observe prop updates; CT covers this
- HTML Preview source fidelity
  - fenced HTML source must remain exact for preview/source/copy/download
- HTML Preview streaming parity
  - `streaming.active -> HtmlPreviewBlock` is covered through CodeFenceResolver and CT streaming mode cases
- parser replacement boundary
  - parser swapping is not fully decoupled from the current render-node protocol

When working in these zones, prefer contract clarification and boundary tightening over adding more surface area.

## Editing Rules For This Subtree

- Prefer local fixes inside markdown internals before widening public APIs.
- Keep advanced branches decoupled:
  - HTML Preview
  - Mermaid
  - Math
  - Image Gallery
  - Streaming
- Reuse `components/shared/*` and shared markdown composables when the UI behavior is already common across advanced sections.
- Do not add generic plugin APIs unless the user explicitly asks for that direction.
- Do not treat LobeUI parity as “same implementation”. Match user-facing capability and docs organization, but keep Vue-first internals.

## Verification Surfaces

Default to static verification unless the user explicitly asks for runtime checks.

For behavior changes, inspect these surfaces:

- docs truth sources:
  - `docs/src/guide/markdown-rendering-design.md`
  - `docs/src/guide/markdown-rendering-roadmap.md`
- demo and manual regression surface:
  - `packages/test/src/markdown/index.vue`
- automated regression surfaces:
  - `packages/test/src/markdown-ct/*.spec.ts` for `TrMarkdown` single-component contracts
  - `packages/test/src/markdown/index.spec.ts` for demo page, Bubble, iframe, and streaming integration smoke
- markdown-specific fixtures:
  - `packages/components/src/markdown/fixtures/streaming.ts`

If you change public behavior, also verify that docs, fixtures, demo cases, and Playwright expectations still describe the same contract.

## Documentation Responsibilities

- put architecture, boundaries, and current contract truth in:
  - `docs/src/guide/markdown-rendering-design.md`
- put status, remaining tasks, and rollout sequencing in:
  - `docs/src/guide/markdown-rendering-roadmap.md`
- keep this `AGENTS.md` short
  - it should help future agents start work quickly, not become a second design spec
