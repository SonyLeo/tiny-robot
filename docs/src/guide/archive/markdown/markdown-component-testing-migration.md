---
outline: deep
---

# Markdown 组件测试迁移计划

本文档用于跟踪 `TrMarkdown` 从当前巨型 E2E harness 迁移到“Playwright Component Testing + 少量 E2E 集成测试”的计划。

参考方案：[Playwright Component Testing](https://playwright.net.cn/docs/test-components)。

## 背景

当前 markdown 测试主要集中在：

- `packages/test/src/markdown/index.vue`
  - 承载所有 markdown 场景、控制按钮、Bubble 集成和 streaming fixtures
- `packages/test/src/markdown/index.spec.ts`
  - 通过真实页面导航到 `Markdown 组件`
  - 同时验证单组件契约、demo harness、Bubble 集成和 streaming 状态机

这套方式在早期很有效，因为它能快速把能力接到真实页面里。但随着 `TrMarkdown` 已经成为独立公开组件，继续把大部分行为压在 E2E 页面里会带来几个问题：

- 单个 spec 文件过大，失败定位成本高
- 每个测试都要经过页面导航和 demo 组合层，反馈速度偏慢
- 很多断言实际只关心 `TrMarkdown` props contract，却被 demo harness 细节影响
- streaming telemetry、HTML Preview、context、custom components 等高复杂能力缺少更小的测试边界

## 迁移目标

迁移目标不是删除 E2E，而是重新划分测试责任：

| 测试层 | 主要职责 | 不再承担 |
| --- | --- | --- |
| Component Testing | `TrMarkdown` 组件 props、渲染结果、状态更新、局部交互 | 应用导航、完整 demo 页面、Bubble 真实集成 |
| E2E | demo 页面可用性、Bubble 接入链路、跨组件组合、少量 smoke | 每个 markdown 语法分支和内部 contract |
| Unit / Runtime | parser、sanitize、scheduler、diff 等纯逻辑 | DOM 交互和浏览器布局 |

最终希望达到：

- `TrMarkdown` 的公共能力优先由 CT 覆盖
- E2E 文件明显变薄，只保留真实集成价值
- streaming 大测试拆成多个可定位的小场景
- 新增 markdown 能力时，默认先补 CT，再按需补 E2E smoke

## Playwright CT 适配判断

Playwright CT 适合当前 markdown 组件，因为：

- 可以在真实浏览器中挂载 Vue 组件，保留 layout、iframe、clipboard、hover、focus 等真实行为
- 支持 `mount(Component, { props })`，适合直接验证 `TrMarkdownProps`
- 支持 `component.update()`，适合验证 `content/features/link/code/streaming` 等 prop 更新
- 支持 Playwright locator、trace、截图和并行能力
- 可以通过 wrapper story 封装主题、provider、测试专用组件和复杂 runtime 状态

需要注意的限制：

- `@playwright/experimental-ct-vue` 仍是实验性能力，应先做小范围 spike
- Node 测试进程和浏览器组件运行时之间不能可靠传复杂实时对象
- 复杂回调、provider、主题和测试数据应通过 story / wrapper 封装
- CT 不能替代 Bubble 真实集成、docs demo 页面和完整应用导航验证

## 推荐目录结构

建议先在 `packages/test` 内建立 CT 入口，避免影响组件包发布源码：

```text
packages/test/
  playwright-ct.config.ts
  playwright/
    index.html
    index.ts
  src/
    markdown-ct/
      TrMarkdown.story.vue
      tr-markdown-basic.spec.ts
      tr-markdown-html.spec.ts
      tr-markdown-context.spec.ts
      tr-markdown-code.spec.ts
      tr-markdown-extensions.spec.ts
      tr-markdown-streaming.spec.ts
```

如果后续 CT 足够稳定，可以再评估是否把 story 放进 `packages/components/src/markdown/__tests__` 或 `__ct__`，但第一阶段建议留在 `packages/test`，降低对组件包源码结构的扰动。

## Story / Wrapper 设计

建议新增一个 `TrMarkdown.story.vue`，专门服务 CT。

它应该提供几类 wrapper：

- `BasicMarkdownStory`
  - 直接渲染 `TrMarkdown`
  - 接收简单 `content / features / parserOptions / code / link / streaming`
- `ThemeMarkdownStory`
  - 包一层 `TrThemeProvider`
  - 用于验证 light / dark、CSS 变量和高级渲染组件
- `ContextProbeStory`
  - 内置一个自定义 paragraph component
  - 通过 `useMarkdownContext()` 输出 `data-context-*`
  - 用于验证 context 是否随 props update 变化
- `CodeActionStory`
  - 内置 `actionsRender`
  - 用稳定的测试按钮验证 `defaultActions / renderDefaultActions`
- `StreamingStory`
  - 在浏览器组件内维护 step state
  - 暴露简单按钮驱动 `content` 和 `streaming.active`
  - 用于替代当前 demo 页中的大量 streaming buttons

Story 里只接收可序列化 props。复杂对象和函数尽量在 story 内部定义。

## 迁移分层

### 继续保留 E2E 的场景

这些场景有真实集成价值，不建议迁到 CT：

- `BubbleRenderers.Markdown` fallback renderer
- `{ type: 'markdown', text }` 配合 `contentRendererMatches`
- Bubble trailing text 不吃 markdown 私有属性
- docs / test app 中 “Markdown 组件” 页面能打开
- markdown-demo 的 public/internal view smoke
- 一个完整 HTML Preview iframe smoke
- 一个 animated streaming smoke

### 优先迁到 CT 的场景

这些场景主要是 `TrMarkdown` 组件契约，适合先迁：

- 基础 markdown structure
- variant: `default / article / bubble`
- raw HTML: `features.html` on/off
- HTML Preview: enabled/disabled、fragment fallback、source fidelity
- `useMarkdownContext()` reactive update
- `componentProps` 和 custom components
- `actionsRender` 默认动作兼容
- code snippet copy、full code expand/collapse、Shiki transformer smoke
- math enabled/disabled/error fallback
- mermaid enabled/disabled/error fallback
- footnotes single/repeated/inline
- GitHub alerts 与 plain blockquote 边界
- citations 与 code boundary
- video first-party node
- image gallery enabled/disabled

### 拆分 streaming 的场景

当前 animated streaming 的 E2E 测试过大，建议拆成 CT 小场景：

- incomplete link hold
- incomplete image hold
- incomplete code fence hold
- incomplete table hold
- smoothing tail parse count
- large append telemetry
- paragraph burst
- fast chunks
- settling -> finalized
- append during settling
- rewrite without hard reset
- hard reset
- skip non-text nodes

Bubble + streaming 的组合仍保留一个 E2E smoke，避免 CT 过度模拟真实接入链路。

## 阶段计划

### Phase 0：准备与 Spike

目标：验证 Playwright CT 在当前 monorepo、Vite alias、TinyRobot 源码直连下可用。

建议改动：

- 新增 `@playwright/experimental-ct-vue`
- 新增 `packages/test/playwright-ct.config.ts`
- 新增 `packages/test/playwright/index.html`
- 新增 `packages/test/playwright/index.ts`
- 新增 `test:ct` / `test:ct:ui` 脚本
- 在 CT config 中复用当前 workspace source alias：
  - `@opentiny/tiny-robot -> ../components/src/index.ts`
  - `@opentiny/tiny-robot-svgs -> ../svgs/src/index.ts`

首批 spike 测试：

- raw HTML on/off
- HTML Preview source fidelity
- `useMarkdownContext()` props update

退出标准：

- `pnpm -F tiny-robot-test test:ct` 可稳定运行
- CT 可以加载组件样式和 theme 依赖
- 三个 spike case 都能在无 demo page 的情况下通过

当前状态：

- 2026-06-14 已完成 Phase 0 基础设施与首批 spike。
- `pnpm -F tiny-robot-test test:ct` 已通过，当前覆盖 raw HTML on/off、HTML Preview source fidelity、`useMarkdownContext()` props update 三个场景。
- `pnpm -F tiny-robot-test build` 已通过，测试包可以通过 source alias 类型检查并完成 production build。
- 当前 CT story 会拉入完整 markdown 高级依赖，构建阶段能看到较大的 `TrMarkdown.story` bundle；这不阻塞迁移，但 Phase 1 后建议评估更轻量的 story 分层。

### Phase 1：迁移静态渲染契约

目标：把不依赖 Bubble 和复杂 streaming 的 markdown contract 从 E2E 下沉到 CT。

迁移范围：

- basic structure
- variant
- task list
- links
- raw HTML
- componentProps
- custom components
- actionsRender
- citations
- alerts
- footnotes

退出标准：

- E2E 中对应断言删除或降级为 smoke
- CT 每个文件只覆盖一个能力域
- 新增能力时能复用 story wrapper

### Phase 2：迁移高级能力

目标：把高复杂但仍属于单组件 contract 的能力拆成独立 CT 文件。

迁移范围：

- code block / Shiki / copy / expand
- HTML Preview
- Math
- Mermaid
- Video
- Image Gallery

退出标准：

- `html-preview` 不再依赖大 demo page 验证 source fidelity
- `math / mermaid` 的 error fallback 有独立 CT
- image gallery 的 open / close / caption / disabled path 有独立 CT

### Phase 3：拆分 streaming 回归

目标：把当前大块 streaming E2E 分解成多个小型、可定位、可并行的 CT。

迁移范围：

- incomplete hold
- smoothing parse count
- animated queue
- settling/finalized
- rewrite/reset
- skip matrix
- profiler summary

退出标准：

- animated streaming 不再由一个超大 test 覆盖所有行为
- 每个 streaming test 只驱动一个 story 和一个状态机路径
- E2E 只保留一个 markdown streaming smoke 和一个 Bubble streaming smoke

### Phase 4：E2E 瘦身与文档同步

目标：完成测试职责重分配，让 E2E 只验证真实集成链路。

保留 E2E：

- test app markdown 页面 smoke
- Bubble fallback renderer
- Bubble content type renderer
- HTML Preview iframe smoke
- animated streaming smoke
- demo 页面 public/internal view smoke

移除 E2E：

- 已被 CT 覆盖的单组件语法矩阵
- 已被 CT 覆盖的 context / props update
- 已被 CT 覆盖的 source fidelity
- 已被 CT 覆盖的 feature enabled/disabled matrix

退出标准：

- `packages/test/src/markdown/index.spec.ts` 明显变薄
- `packages/test/src/markdown/index.vue` 不再承载所有 contract fixtures
- roadmap / design / AGENTS 文档同步说明测试分层

## 测试矩阵

| 能力 | 当前主要位置 | 目标位置 | 优先级 |
| --- | --- | --- | --- |
| 基础结构 | E2E demo page | CT | P1 |
| variant | E2E demo page | CT | P1 |
| raw HTML | E2E demo page | CT | P0 |
| HTML Preview fidelity | E2E demo page | CT | P0 |
| `useMarkdownContext` update | E2E demo page | CT | P0 |
| componentProps | E2E demo page | CT | P1 |
| actionsRender | E2E demo page | CT | P1 |
| code block interaction | E2E demo page | CT | P1 |
| math | E2E demo page | CT | P1 |
| mermaid | E2E demo page | CT | P1 |
| footnotes | E2E demo page | CT | P1 |
| alerts | E2E demo page | CT | P1 |
| citations | E2E demo page | CT | P1 |
| video | E2E demo page | CT | P2 |
| image gallery | E2E demo page | CT | P2 |
| incomplete streaming hold | E2E demo page | CT | P1 |
| animated streaming scheduler | E2E demo page | CT + E2E smoke | P1 |
| Bubble markdown fallback | E2E demo page | E2E | P0 |
| Bubble content type markdown | E2E demo page | E2E | P0 |
| markdown demo docs parity | markdown-demo | E2E smoke / manual | P2 |

## Checklist

### Phase 0：CT 基础设施

- [x] 安装 `@playwright/experimental-ct-vue`
- [x] 新增 `packages/test/playwright-ct.config.ts`
- [x] 新增 `packages/test/playwright/index.html`
- [x] 新增 `packages/test/playwright/index.ts`
- [x] 配置 CT 的 Vite alias 指向 workspace source
- [x] 新增 `test:ct`
- [x] 新增 `test:ct:ui`
- [x] 确认 CT 能加载 `TrMarkdown` 样式
- [x] 确认 CT 能加载 `@opentiny/tiny-robot-svgs`
- [x] 确认 CT 与现有 E2E 命令互不影响

### Phase 0：首批 Spike Case

- [x] 新增 `TrMarkdown.story.vue`
- [x] 新增 raw HTML on/off CT
- [x] 新增 HTML Preview source fidelity CT
- [x] 新增 `useMarkdownContext()` update CT
- [x] 删除或降级 E2E 中对应重复断言
- [x] 记录 CT 初次运行耗时和稳定性

运行记录：

- 2026-06-14 `pnpm -F tiny-robot-test test:ct`：首批 3 passed，最后一次运行 36.3s，其中包含 CT production bundle 构建。
- 2026-06-14 `pnpm -F tiny-robot-test build`：通过；早期存在的 Vite chunk size warning 已在 consumer Vite 配置层通过 vendor chunk 拆分收口。
- 2026-06-14 已扩展到静态契约、Code / HTML Preview、Math / Mermaid / Video / Image Gallery、Streaming CT，并将原 markdown E2E 降级为集成 smoke。
- 2026-06-14 最终验证：`pnpm -F tiny-robot-test test:ct` 为 21 passed，`pnpm -F tiny-robot-test test src/markdown/index.spec.ts` 为 4 passed，`pnpm -F @opentiny/tiny-robot-markdown-demo test` 为 1 passed。
- 2026-06-14 本地 Playwright webServer 已补 `NO_PROXY/no_proxy` 保护；`packages/test` 默认端口调整为 `3341`，避免与本地 Playwright test-server / 代理探活冲突。
- 2026-06-14 体积收口：`packages/test` 与 `packages/markdown-demo` 已在 Vite consumer 配置层拆分 `Mermaid / KaTeX / Shiki / markdown-it / DOMPurify` vendor chunks，并设置 demo/test 专属 chunk warning budget；两者 build 均不再出现 large chunk warning。
- 2026-06-14 发布包体积收口：`packages/components` 构建已将 Mermaid / KaTeX / Shiki / @shikijs / highlight.js 高级 Markdown 运行时保持为 external dynamic imports，发布 dist 不再输出对应巨型高级能力 chunk。

### Phase 1：静态渲染契约迁移

- [x] 基础 markdown structure 迁移到 CT
- [x] variant 迁移到 CT
- [x] links 迁移到 CT
- [x] task list 迁移到 CT
- [x] componentProps 迁移到 CT
- [x] custom components 迁移到 CT
- [x] actionsRender 迁移到 CT
- [x] citations 迁移到 CT
- [x] alerts 迁移到 CT
- [x] footnotes 迁移到 CT
- [x] 清理 E2E 中重复的静态断言

### Phase 2：高级能力迁移

- [x] code snippet copy 迁移到 CT
- [x] full code expand/collapse 迁移到 CT
- [x] Shiki transformer smoke 迁移到 CT
- [x] HTML Preview enabled/disabled 迁移到 CT
- [x] HTML Preview fragment fallback 迁移到 CT
- [x] HTML Preview streaming mode 迁移到 CT
- [x] Math enabled/disabled/error 迁移到 CT
- [x] Mermaid enabled/disabled/error 迁移到 CT
- [x] Video first-party node 迁移到 CT
- [x] Image Gallery enabled/disabled/open/close 迁移到 CT
- [x] 清理 E2E 中重复的高级能力断言

### Phase 3：Streaming 迁移

- [x] incomplete link hold 迁移到 CT
- [x] incomplete image hold 迁移到 CT
- [x] incomplete code fence hold 迁移到 CT
- [x] incomplete table hold 迁移到 CT
- [x] smoothing parse count 迁移到 CT
- [x] large append telemetry 迁移到 CT
- [x] paragraph burst 迁移到 CT
- [x] fast chunks 迁移到 CT
- [x] settling -> finalized 迁移到 CT
- [x] append during settling 迁移到 CT
- [x] rewrite without hard reset 迁移到 CT
- [x] hard reset 迁移到 CT
- [x] skip non-text nodes 迁移到 CT
- [x] E2E 保留 markdown streaming smoke
- [x] E2E 保留 Bubble streaming smoke

### Phase 4：E2E 瘦身

- [x] 保留 test app markdown 页面 smoke
- [x] 保留 Bubble fallback renderer E2E
- [x] 保留 Bubble content type renderer E2E
- [x] 保留 HTML Preview iframe smoke
- [x] 保留 animated streaming smoke
- [x] 保留 markdown-demo public/internal view smoke
- [x] 删除 E2E 中已由 CT 覆盖的单组件矩阵
- [x] 拆分剩余过长 E2E test
- [x] 更新 `packages/test/README.md`
- [x] 更新 markdown roadmap 中的测试策略描述
- [x] 更新 markdown AGENTS 中的验证入口说明

## 风险与处理

| 风险 | 影响 | 处理 |
| --- | --- | --- |
| CT 仍是实验性能力 | 可能出现版本兼容或配置问题 | 先做 Phase 0 spike，不阻塞现有 E2E |
| 复杂 callback 跨 Node/浏览器边界不稳定 | custom actions / context probe 可能测试不自然 | 用 story 在浏览器侧定义复杂函数，只向测试暴露 DOM 信号 |
| 样式或主题未加载 | CT DOM 与真实组件外观不一致 | 在 `playwright/index.ts` 中统一引入组件样式和 theme provider |
| 动态 import 能力不稳定 | Shiki / Mermaid / KaTeX 测试可能慢或偶发 | 独立文件、显式等待 ready/error data attribute |
| 过早删除 E2E | 集成回归漏测 | 每迁一类能力，先 CT 通过，再降级对应 E2E |
| streaming test 仍耦合 telemetry 细节 | 后续重构成本继续偏高 | CT 只断言公开 summary 和用户可见行为，profiler debug 只保留专项测试 |

## 完成定义

这次迁移完成时，应满足：

- `pnpm -F tiny-robot-test test:ct` 覆盖大多数 `TrMarkdown` 单组件 contract
- `pnpm -F tiny-robot-test test` 只保留真实集成价值的 E2E
- markdown E2E spec 不再承担所有语法矩阵
- 新增 markdown 能力时，开发流程默认包含：
  - 单元测试或 runtime 测试
  - CT contract 测试
  - 必要时补 E2E smoke
- 文档、AGENTS 和 README 都能指向正确的验证入口
