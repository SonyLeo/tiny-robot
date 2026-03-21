# Chat P5-C Navigation Guidance

> Scope: implementation guidance for `P5-C / Content Navigation & View State`
>
> Date: 2026-03-20
>
> Related:
> - [chat-p5-proposal.md](./chat-p5-proposal.md)
> - [chat-chat-cli-handoff.md](./chat-chat-cli-handoff.md)
> - [../packages/chat/progress.md](../packages/chat/progress.md)

---

## 1. Goal

This document turns the current `P5-C` discussion into an implementation guide.
中文说明：本文件把当前 `P5-C` 的讨论收敛成后续可以直接执行的实现指导，而不是继续停留在方向性描述。

It combines:

- the current `packages/chat/demo/toc` prototype
- the already-settled `P5-A` / `P5-B` boundaries
- industry patterns from Notion, Docusaurus, Nextra, and Material for MkDocs

The target is not to copy any single product literally.

The target is to extract the stable design decisions that fit TinyRobot's current workspace direction:

- content-attached navigation
- workspace-hosted rendering
- separate user-navigation and assistant-navigation source models
- minimal first-round runtime surface

中文说明：

- 目标不是直接复制某个产品的目录 UI。
- 目标是提取适合 TinyRobot 当前架构的稳定能力边界。
- 第一阶段优先得到“最小可用、可扩展、不破坏主链路”的导航能力。

---

## 2. Core Judgment

The two navigation shapes shown in the current TOC prototype should not be merged into one source schema.
中文说明：当前 prototype 里其实已经自然长出了两种导航模型，不应该在 `P5-C` 第一轮里为了“统一”而强行合并。

They are two different navigation models:

1. assistant content outline
   - represented by `ChatTocTrigger`
   - extracted from headings inside an assistant message
2. conversation turn navigation
   - represented by `ChatHistoryToc`
   - extracted from user turns inside the current conversation

This matches the current P5 guidance:

- `P5-C` should keep user navigation and assistant navigation separate
- the shared part should be the host layer, not the source schema

Therefore:

- the existing demo/toc code is a strong reference
- but it should not be moved into `src/` as-is
- it should be decomposed into:
  - shared host/runtime
  - turn-navigation source runtime
  - assistant-outline source runtime

中文说明：

- `ChatTocTrigger` 更接近 assistant 内容提纲。
- `ChatHistoryToc` 更接近当前会话 turn 导航。
- 两者最多共享 host，不应该共享 source schema。

---

## 3. Industry Reference Summary

The following patterns are worth carrying into TinyRobot.
中文说明：这里关注的是“哪些规律值得学”，不是做视觉复刻。

### 3.1 Notion

Reference:

- https://www.notion.com/help/columns-headings-and-dividers

Observed pattern:

- page-level TOC appears on the right side while scrolling
- TOC expands on hover
- TOC is only useful when a page has enough headings
- there is also a block form of TOC, not only a page-level sidebar

Useful takeaways for TinyRobot:

- show navigation only when content density is high enough
- keep a compact collapsed state and expand on intentional interaction
- support both inline-attached and side-hosted rendering forms in the long run

中文说明：Notion 最值得借的是“紧凑默认态 + hover 扩展 + 内容足够多才显示”。

### 3.2 Docusaurus

Reference:

- https://docusaurus.io/docs/next/markdown-features/toc

Observed pattern:

- default TOC only shows `h2` and `h3`
- visible heading levels are configurable
- heading IDs must remain unique and stable
- inline TOC and right-side TOC can both exist

Useful takeaways for TinyRobot:

- assistant outline should not blindly include every heading level
- heading extraction must support stable unique IDs
- TOC shape should be configurable by source, not hardcoded in one component

中文说明：Docusaurus 给我们的启发主要是 heading 深度控制和稳定 anchor，不是它那套文档站结构。

### 3.3 Nextra

Reference:

- https://nextra.site/docs/docs-theme/built-ins/layout

Observed pattern:

- TOC can float on the right side and stay sticky while scrolling
- TOC visibility is page-configurable
- the TOC can include extra content and back-to-top affordances

Useful takeaways for TinyRobot:

- the host should support sticky right-side rendering cleanly
- navigation host visibility should be controllable per scene / per config
- extra actions belong to the host layer, not the source extraction layer

中文说明：Nextra 更像是在提醒我们“host 可以很强，但 source 不要变脏”。

### 3.4 Material for MkDocs

References:

- https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/
- https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown/

Observed pattern:

- active anchor tracking is first-class
- the TOC can follow the active anchor and keep it visible
- TOC can be integrated into another navigation area
- anchor links and generated heading anchors are explicit concerns

Useful takeaways for TinyRobot:

- active-anchor state must be part of the runtime contract
- host scrolling and item visibility management should be owned by runtime helpers
- placement should be a host decision

What should not be copied directly:

- browser URL hash tracking is good for docs, but is not a safe default for chat conversations

中文说明：文档站常用 hash 导航，但 chat 场景默认不应该把 URL 锚点当作主状态同步机制。

---

## 4. What to Reuse from `demo/toc`

中文说明：这一节专门区分 demo/toc 里哪些是可沉淀能力，哪些只是 prototype 阶段的写法。

### 4.1 Directly reusable ideas

`packages/chat/demo/toc/ChatTocTrigger.vue`

- the collapsed-to-expanded visual language
- the hover-expansion interaction
- truncation-aware tooltip behavior
- the compact "mark only" default state

`packages/chat/demo/toc/useTocNavigation.ts`

- heading extraction flow
- stable ID generation idea
- mutation-driven re-extraction
- rAF-based DOM positioning to reduce visual lag

`packages/chat/demo/toc/ChatHistoryToc.vue`

- right-side compact rail behavior
- active item affordance
- keyboard navigation pattern
- search expansion shell pattern

`packages/chat/demo/toc/useHistoryTocNavigation.ts`

- mapping user turns into navigation items
- active turn calculation based on scroll range
- scroll-to-message mechanics

`packages/chat/demo/toc/useTocProvider.ts`

- shared scroll-container context
- shared measurement and active-instance coordination

中文说明：这些部分可以迁移的是“思路和分层”，不是直接整文件复制。

### 4.2 What should be treated as prototype-only

- direct dependence on `.tr-bubble`, `.tr-bubble__body`, `.heading-node`
- hardcoded heading inclusion rules inside one helper
- the term `HistoryToc` for current-conversation turn navigation
- product-specific search behavior such as `pinyin-match` in the first-round core runtime
- treating per-bubble trigger rendering as the primary architecture

中文说明：

- demo 当前对 DOM 结构依赖很深，这在 prototype 阶段没问题，但不适合直接进入源能力层。
- 搜索、拼音匹配、tooltip 细节都应该延后到第二阶段再收口。

---

## 5. Naming and Boundary Corrections

The current demo names are useful for exploration, but not ideal for the source capability layer.
中文说明：命名不是小事，这会直接影响后面 API 是否会和现有 `history`、`layout`、`workspace` 语义冲突。

Recommended naming direction:

- do not use `HistoryToc` for current conversation navigation
- prefer `TurnNavigation` or `ConversationToc`
- do not use `ChatTocTrigger` as the generic public concept
- prefer `AssistantOutlineTrigger` if that pattern later becomes a real source consumer

Boundary rules:

- `P5-C` owns navigation host behavior and navigation/view-state runtime
- `P5-C` does not own theme tokens
- `P5-C` does not own shell structure
- `P5-C` does not own low-level bubble rendering rules
- user navigation and assistant navigation do not share one source schema

中文说明：

- `HistoryToc` 这个名字容易和现有 History Drawer 混淆。
- `P5-C` 的边界必须卡在 navigation/view-state，不能往 message render core 或 theme 里渗透。

---

## 6. Recommended First-Round Product Direction

中文说明：第一阶段只做一条线，目的是先把最小契约跑通，而不是一开始就做成“万能目录系统”。

### 6.1 Start from turn navigation, not assistant outline

Recommended first concrete `P5-C` source:

- current-conversation turn navigation

Reason:

- it has a stable data source from `messages`
- it does not depend on heading parsing quality
- it does not depend on rendered markdown structure
- it aligns with the current guidance to start from one source model only
- it already has a proven prototype path in `useHistoryTocNavigation.ts`

中文说明：turn navigation 的最大优势是数据稳定、落点清楚、对渲染结构依赖更低。

### 6.2 Why assistant outline should come second

Assistant outline is still valuable, but it is more fragile because it depends on:

- heading extraction quality
- rendered content shape
- DOM-to-source consistency
- duplicate ID handling
- scroll target precision inside long assistant outputs

So the recommended order is:

1. turn navigation
2. navigation host
3. active-anchor state flow
4. assistant outline source

中文说明：assistant outline 很有价值，但它天然比 turn navigation 更依赖 markdown 结构和 DOM 质量，所以更适合第二阶段。

---

## 7. Optimized P5-C Architecture

中文说明：这一节定义的是结构分层，不是最终 UI 细节。

### 7.1 Shared layer vs source layer

The architecture should separate:

- host layer
  - where the navigation renders
  - how it sticks / floats / collapses
  - how active items stay visible
- source layer
  - where items come from
  - how anchors are extracted
  - how scrolling targets are resolved

The host may be shared.

The source models must remain separate.

中文说明：

- host 负责“怎么显示”
- source 负责“数据从哪里来”
- 两层拆开后，后面扩 assistant outline 才不会把 turn navigation 重写一遍

### 7.2 Recommended directory layout

For the first round:

```text
packages/chat/src/components/workspace/
  WorkspaceShell.vue
  WorkspacePanelHost.vue
  runtime.ts
  navigation/
    ContentNavigationHost.vue
    index.ts
    runtime.ts
    turn-navigation/
      runtime.ts
```

If assistant outline becomes real later:

```text
packages/chat/src/components/workspace/navigation/
  assistant-outline/
    runtime.ts
```

Why this layout is preferred:

- navigation remains explicitly attached to workspace
- it avoids creating a vague top-level `navigation/` platform layer
- it keeps the shared host close to `WorkspaceShell`
- it allows source-specific runtime files without pretending both source models are already stable

中文说明：目录上贴着 `workspace` 走，是为了明确它属于“内容附着式导航”，而不是平台级导航。

### 7.3 Public type placement

Keep public types in `packages/chat/src/types.ts` for now.

Suggested first-round additions:

- `ChatContentNavigationConfig`
- `ChatTurnNavigationConfig`
- `ChatContentNavigationPlacement`
- `TrChatContentNavigationHostProps`

Do not create a large new `types/` subtree yet.

The first round still needs a small, stable public surface more than a broader type taxonomy.

中文说明：现在最需要的是小而稳的类型面，不是提前做大而全的类型目录。

### 7.4 Compatibility with the current render pipeline

Current main chain:

```text
config / adapter
  -> createPresetChatProps / createPresetChatSlices
  -> TrChat / TrChat.Root
  -> ChatLayout
  -> ChatMessageList
  -> BubbleList render

workspace mode:
  -> WorkspaceShell
  -> center content slot
  -> TrChat
```

This means `P5-C` should attach as a parallel host layer, not as a replacement for the message render core.

Recommended non-conflicting insertion points:

- workspace center-content host layer
- white-box consumer composition layer
- future preset/runtime config layer in parallel with workspace shell config

Recommended non-conflicting responsibilities:

- receive normalized navigation items
- track active anchor state
- request scroll-to-anchor behavior
- expose compact / expanded / placement behavior

Things that would conflict with the current chain:

- putting content navigation into `layout.variant`
- making navigation a hidden branch inside `ChatMessageList`
- coupling navigation state to bubble role rendering rules
- moving navigation placement into theme ownership
- treating assistant outline extraction as part of low-level bubble rendering

中文说明：

- 当前主链路里，`ChatLayout` 负责布局容器，`ChatMessageList` 负责消息呈现，`WorkspaceShell` 负责 workspace 外层承载。
- 所以 `P5-C` 最安全的接入点，是作为 workspace/center content 的附着式 host，而不是插进 `ChatMessageList` 内部去抢职责。
- 只要我们不把导航塞进 `layout.variant`、`theme` 或 bubble render core，这条路就不会和主渲染链路冲突。

---

## 8. Rendering Strategy

中文说明：这一节回答“实现时组件和 runtime 应该分别承担什么”。

### 8.1 Host first

The first real component should be a workspace-attached host:

- `ContentNavigationHost.vue`

Responsibilities:

- render navigation chrome
- mount in center workspace context
- own compact/expanded shell behavior
- own sticky/floating placement behavior
- receive normalized items and active item state

It should not:

- parse headings
- inspect bubble internals directly
- decide whether a source is user-turns or assistant-outline

中文说明：host 是导航容器，不是解析器，也不是业务 source 决策器。

### 8.2 Source runtime second

The first source runtime should normalize turn data into host items.

Suggested normalized item shape:

- `id`
- `label`
- `kind`
- `target`
- `active`
- optional `description`

For turn navigation:

- `id` should come from a stable conversation-local anchor
- `label` should come from user message text
- `target` should resolve to a specific message anchor

中文说明：turn-navigation runtime 的职责是把消息数据规整成 host 能消费的 item，而不是直接负责 UI。

### 8.3 Trigger rendering is optional, not foundational

The left-side per-bubble trigger from `ChatTocTrigger.vue` should be treated as:

- one possible assistant-outline consumer

It should not define the first-round runtime contract.

中文说明：per-bubble trigger 可以保留为未来 assistant outline 的一种消费方式，但不应反过来定义整个 P5-C 架构。

---

## 9. UX Rules for TinyRobot

These are the recommended default rules for the first `P5-C` implementation.
中文说明：这里不是视觉定稿，而是第一阶段应该遵守的交互基线。

### 9.1 Visibility

- do not show navigation when item count is too small
- use a minimum threshold similar to:
  - assistant outline: at least 2 headings
  - turn navigation: at least 2 user turns

### 9.2 Density

- default collapsed state should remain compact
- expanded state should be explicit and intentional
- avoid always-open heavy sidebars for normal chat density

### 9.3 Active state

- active item must be driven by scroll position
- active item should stay visible inside the host list
- active state belongs to runtime, not local component-only state

### 9.4 Heading depth

- assistant outline should default to a narrow level range
- initial default should be equivalent to docs products:
  - `h2`
  - `h3`
- lower-level headings can be a future opt-in

### 9.5 Scroll behavior

- scroll targets should account for sticky toolbars / safe offsets
- prefer container scroll calculations over naive `scrollIntoView()` when offset control matters

### 9.6 Search

- search is not part of `P5-C` minimum delivery
- keep it as a possible second-round enhancement for turn navigation

中文说明：搜索不是不能做，而是它会显著放大状态复杂度，不适合放进第一轮最小交付。

---

## 10. Test and Demo Structure

中文说明：测试结构也要和目录结构同步收口，避免又回到单文件大 demo。

Suggested test structure:

```text
packages/test/src/chat/scenarios/
  ContentNavigationScene.vue

packages/test/src/chat/scenario-specs/
  content-navigation.spec.ts

packages/chat/tests/
  content-navigation-runtime.test.mjs
```

Recommended coverage:

- host renders only when source item threshold is met
- host receives normalized turn items
- active item changes with scroll
- clicking a navigation item scrolls to the expected anchor
- navigation host can coexist with workspace shell and `fullWidth`

Do not start with:

- multi-source host merging
- search
- persisted navigation state
- notebook coupling
- URL hash integration

中文说明：第一轮测试重点应该锁 host 渲染、active state、scroll 行为，不要一开始把多 source、持久化、搜索一起打包。

---

## 11. Implementation Recommendation

中文说明：这一节是建议的落地顺序，可以直接拿来拆任务。

### 11.1 What to implement now

Implement this first:

1. minimal navigation config types in `types.ts`
2. `ContentNavigationHost.vue`
3. turn-navigation runtime under `navigation/turn-navigation/`
4. one dedicated demo scene
5. one E2E spec and one runtime unit test

中文说明：这五步已经足够支撑第一轮 `P5-C`，再多就是提前扩边界。

### 11.2 What to postpone

Postpone these items:

- assistant outline extraction API
- per-bubble trigger API in `src/`
- search and fuzzy matching
- multiple simultaneous navigation sources
- navigation persistence
- navigation into theme or layout variants

中文说明：这些都值得做，但都不适合现在做。

---

## 12. Final Recommendation

The current `demo/toc` work is good enough to serve as the visual and interaction reference for `P5-C`, but it should be productized in a more disciplined structure.
中文说明：结论不是“推翻 demo/toc”，而是“保留其优点，但用更稳定的架构产品化”。

The recommended implementation path is:

1. keep the current TOC prototype as reference code
2. start `P5-C` from turn navigation only
3. build a shared workspace-attached host
4. keep assistant outline as a second source model
5. carry over the visual language from `ChatTocTrigger.vue`, but do not let that trigger shape define the runtime boundary

This gives TinyRobot the smallest stable navigation capability that still lines up with the long-term `P5-C` direction.

中文说明：如果按这个顺序推进，`P5-C` 可以在不碰乱主渲染链路的前提下落地，而且后面继续扩 assistant outline 也不会返工主结构。
