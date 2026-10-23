# TinyRobot Docs Agent 友好化改造执行方案

## 1. 文档目的

本文是 TinyRobot 文档 Agent 友好化改造的执行基线。它记录当前基线、目标架构、实施边界、文件变更、验证门槛和后续提交顺序。

本文只描述方案，不改变 VitePress 运行时、组件 API 或独立 MCP 服务。后续实现应在 `docs/agent-friendly-docs-plan` worktree 中继续，并以本文作为执行清单。

## 2. 当前基线

本 worktree 基于 `robot/develop` 最新提交创建：

- 分支：`docs/agent-friendly-docs-plan`
- 基线提交：`46070958e`（`feat(quick-assist): add framework-free selection assistant (#427)`）
- worktree：`E:\LS_WorkSpace\web\tiny-robot-agent-docs`

当前文档结构：

| 项目 | 当前情况 |
| --- | --- |
| 文档框架 | VitePress 1.x |
| Markdown 页面 | 55 个 |
| 组件页面 | 23 个 |
| Demo 源文件 | 245 个 `.vue` / `.ts` 文件 |
| 页面 Demo | 使用 `vitepress-demo-plugin` 和 `<demo>` 标签 |
| 搜索 | VitePress local search |
| 页面操作区 | 尚未提供文档内部的复制 Markdown、查看 Markdown、ChatGPT、Claude 操作 |
| Markdown 原文路由 | 不存在 |
| `llms.txt` / `llms-full.txt` | 不存在 |
| `sitemap.md` / 页面 JSON 索引 | 不存在 |
| Agent Skill 发布入口 | 不在当前 docs 构建链路中 |
| MCP Server | 现有 SDK 用于 Chat 运行时 MCP 客户端，不是 docs MCP 服务 |
| API JSON 索引 | 组件 API 主要存在于 Markdown 表格，没有统一组件元数据索引 |
| 文档规范 | 已有 `component-documentation-standard.md`，包含 L0 Demo、API 完整性、事实源和弃用规则 |

已有独立 `agent-skills` 仓库中的 `tiny-robot-skill` 仍有价值，但它复制了组件文档、Demo、指南和规则。后续应将 docs 作为唯一事实源，独立 Skill 收敛为规则和索引入口，避免文档内容分叉。

## 3. 目标和非目标

### 3.1 目标

1. 让 AI 工具可以直接发现、读取和引用 TinyRobot 文档。
2. 让页面、Markdown、Demo 和 API 元数据建立稳定关系。
3. 让文档发布自动生成 AI 所需的静态产物。
4. 让 ChatGPT、Claude、Cursor、Copilot 等工具能够使用同一份最新内容。
5. 为后续独立 MCP 服务提供稳定、可查询的内容源。
6. 维持现有 VitePress、Demo、GitHub Pages 和 Vue 组件使用方式。

### 3.2 非目标

1. 不迁移到 Nuxt 或 Nuxt Content。
2. 不在第一阶段重写全部组件文档。
3. 不把 Markdown 表格一次性全部改写成手工 JSON。
4. 不把 MCP Server 部署到 GitHub Pages。
5. 不继续手工复制一份完整 Skill 文档作为长期事实源。
6. 不改变 TinyRobot 公开组件 API。

## 4. 总体架构

```text
TinyRobot 源码
├── docs/src/**/*.md
├── docs/demos/**/*.{vue,ts}
├── packages/*/src
└── docs/component-documentation-standard.md
        │
        ▼
文档构建脚本
├── VitePress HTML
├── raw Markdown
├── llms.txt
├── llms-full.txt
├── sitemap.md
├── agent/pages.json
├── agent/components.json
└── .well-known/skills/tiny-robot/
        │
        ├── GitHub Pages：静态文档、Demo、Markdown、Skill、索引
        └── 独立运行时：POST /mcp
```

GitHub Pages 可以部署所有静态资源，但不能处理 MCP 的 Streamable HTTP `POST /mcp` 请求。MCP 必须作为独立 Node 服务、Serverless Function、Worker 或其他支持运行时请求的平台部署。

## 5. 单一事实源和内容优先级

不同问题使用不同事实源：

| 要确认的问题 | 首要事实源 | 辅助事实源 |
| --- | --- | --- |
| 公共组件和类型是否导出 | 包根导出、显式公共导出文件 | 组件目录导出 |
| Props、Events、Slots、Expose 类型 | 公开 TypeScript 类型 | 实现、类型测试 |
| 默认值和运行时行为 | 实际实现 | 稳定行为测试 |
| 用户交互是否稳定 | 实际实现和稳定行为测试 | 架构约束 |
| Demo 和正文是否准确 | 上述事实源 | 现有文档 |
| 页面描述、分类和关键词 | 页面正文、导航和维护者确认 | 自动推导结果 |

AI 产物、Skill 和 MCP 都只能消费这些事实源生成的结果，不能反向成为新的事实源。

## 6. 分阶段执行计划

### 阶段 0：基线和脚本骨架

目标：建立可重复执行的文档产物生成入口，不改变页面行为。

计划变更：

- 新增 `docs/scripts/build-agent-docs.mjs`。
- 在 `docs/package.json` 增加 Agent 文档生成命令。
- 为脚本提供 `DOCS_SITE_URL` 和 `VITEPRESS_BASE` 配置。
- 生成过程失败时返回非零退出码。
- 对输入路径使用 `path.resolve` 并限制在 `docs` 目录内。

验收：

- 本地执行可以重复生成同样的文件。
- 不依赖网络服务。
- 不修改源码 Markdown。

### 阶段 1：静态 AI 文档产物

目标：让 GitHub Pages 直接提供 AI 可读取的文档资源。

生成以下文件：

```text
/raw/<path>.md
/llms.txt
/llms-full.txt
/sitemap.md
/agent/pages.json
```

`pages.json` 最低字段：

```json
{
  "route": "/components/bubble",
  "title": "Bubble 气泡组件",
  "description": "...",
  "kind": "component",
  "source": "components/bubble.md",
  "raw": "/raw/components/bubble.md",
  "examples": ["demos/bubble/basic.vue"]
}
```

`llms.txt` 只保留页面索引、摘要、分类和链接，控制上下文大小。

`llms-full.txt` 包含页面 Markdown，并在页面之后附带页面声明的 Demo 源码和必要的多文件依赖。

验收：

- 所有正式 Markdown 页面都有 raw 文件。
- `llms.txt` 能覆盖所有正式页面。
- `llms-full.txt` 能定位页面来源和 Demo 来源。
- `pages.json` 可被 Node、浏览器和 MCP 服务读取。

### 阶段 2：页面元数据和 Demo 关系

目标：提高页面检索质量，消除 AI 对目录和相对路径的猜测。

建议 frontmatter：

```yaml
---
title: Bubble 气泡组件
description: 展示 AI 消息、流式文本和多种内容类型的气泡组件。
canonical_url: /components/bubble
kind: component
status: stable
package: '@opentiny/tiny-robot'
exports:
  - Bubble
  - TrBubble
keywords:
  - AI 消息
  - 流式文本
  - Markdown 渲染
related:
  - /components/sender
  - /tools/message
---
```

执行策略：

1. 先从 H1、首段和目录自动推导缺失标题、描述和分类。
2. 再为组件、套件、工具和迁移页面补充人工确认的 description、package、exports 和 keywords。
3. 对 `badge: deprecated` 继续复用现有侧边栏 Badge 机制。
4. 不把自动推导结果直接当作高质量人工描述；自动结果必须可被后续修改覆盖。

Demo 解析规则：

1. 解析 `<demo vue="..." />`。
2. 解析 `:vueFiles="[...]"` 多文件列表。
3. 将相对路径解析为 `docs/demos` 下的规范路径。
4. 检查文件存在、路径没有越出 `docs` 根目录。
5. 将 Demo 关系写入 `pages.json`。
6. 页面引用的 Demo 文件不存在时阻断构建。

验收：

- 245 个现有 Demo 源文件不被移动或复制到另一个事实源目录。
- 所有正式页面的 Demo 引用可解析。
- 多文件 Demo 的入口和依赖关系可完整读取。

### 阶段 3：页面内部 AI 操作区

目标：实现 Nuxt UI 类似的正文操作体验。

操作区必须位于页面正文内部，不能放进 `CustomHeader.vue` 的顶部工具栏。

实现方式：

```text
docs/.vitepress/theme/Layout.vue
└── DefaultLayout
    └── #doc-before
        └── DocActions.vue
```

首批操作：

- 复制当前页面 Markdown。
- 复制当前 Markdown 链接。
- 查看 Markdown。
- 在 ChatGPT 中打开当前页面。
- 在 Claude 中打开当前页面。

行为要求：

- 复制页面优先读取 `/raw/<path>.md`。
- 开发环境找不到 raw 文件时，回退复制页面正文文本。
- 复制成功显示短暂状态反馈。
- 外部链接使用新窗口并带安全属性。
- 首页不显示页面操作区。
- 小屏幕不遮挡正文标题和目录。

验收：

- 操作区出现在页面正文上方。
- 不影响默认侧边栏、右侧 outline 和 Demo。
- 静态部署和带 `VITEPRESS_BASE` 的子路径部署都能生成正确链接。

### 阶段 4：Skill 收敛和在线文档入口

目标：保留已有 `tiny-robot-skill` 的规则价值，消除重复文档维护。

新的 Skill 只保留：

- TinyRobot 触发条件。
- 组件查找和 API 读取顺序。
- 禁止编造 API 的规则。
- Vue `script setup` 和命名规范。
- 组件、Kit、Chat 套件的选型路由。
- 弃用入口处理规则。
- `/llms.txt`、`/agent/pages.json`、raw Markdown 和 MCP 地址。
- 离线快照的版本信息。

完整组件 Markdown、Demo、指南和迁移文档应由 docs 构建生成，不能继续手工复制维护。

静态发布入口：

```text
/.well-known/skills/index.json
/.well-known/skills/tiny-robot/SKILL.md
```

独立 `agent-skills` 仓库可以继续提供离线安装入口，但内容应来自 docs 产物或明确标注快照版本。

### 阶段 5：组件级 API 元数据

目标：在页面级索引稳定后，为 MCP 和 Agent 提供结构化组件 API。

第一步生成轻量组件索引：

```json
{
  "name": "TrBubble",
  "package": "@opentiny/tiny-robot",
  "status": "stable",
  "page": "/components/bubble",
  "examples": ["demos/bubble/basic.vue"]
}
```

第二步再生成完整 API 元数据：

```json
{
  "name": "TrBubble",
  "props": [],
  "events": [],
  "slots": [],
  "methods": [],
  "types": []
}
```

生成来源：

- TypeScript Compiler API。
- 包根公共导出。
- 公开 Props、Events、Slots 和 Expose 类型。
- 实现和测试用于核对默认值和运行时行为。

范围限制：

- 内部导出不进入索引。
- 首阶段不自动推导所有 CSS 变量和复杂泛型。
- 文档表格仍保留给开发者阅读，JSON 用于机器查询。

### 阶段 6：独立 MCP Server

目标：提供 Nuxt UI 类似的结构化 Agent 查询能力。

MCP 不部署到 GitHub Pages。建议新增独立包：

```text
packages/docs-mcp/
├── src/server.ts
├── src/catalog.ts
├── src/tools/
└── package.json
```

服务读取 docs 构建产物，不在请求时扫描源码。

首批工具：

```text
search-documentation
get-documentation-page
search-components
get-component-metadata
get-example
list-resources
get-migration-guide
```

首批资源：

```text
resource://tiny-robot/pages
resource://tiny-robot/components
resource://tiny-robot/examples
resource://tiny-robot/migrations
```

服务发现：

```text
POST /mcp
/.well-known/mcp/server-card.json
```

部署选择只保留一种正式方案：独立 Node/Serverless 服务部署，GitHub Pages 继续负责静态文档和演示。

## 7. 计划新增和修改的文件

### 第一批静态产物改造

```text
docs/package.json
docs/scripts/build-agent-docs.mjs
docs/.vitepress/theme/Layout.vue
docs/.vitepress/theme/components/DocActions.vue
docs/.vitepress/theme/style.css
docs/.vitepress/themeConfig.ts
docs/src/agents/index.md
docs/src/agents/llms-txt.md
docs/src/agents/skills.md
docs/src/agents/mcp.md
docs/agent/skills/tiny-robot/SKILL.md
```

### 第二批内容和校验

```text
docs/src/**/*.md
docs/scripts/validate-agent-docs.mjs
docs/scripts/extract-component-metadata.mjs
```

### 第三批 MCP

```text
packages/docs-mcp/package.json
packages/docs-mcp/src/server.ts
packages/docs-mcp/src/catalog.ts
packages/docs-mcp/src/tools/*.ts
packages/docs-mcp/test/*.test.ts
```

## 8. 提交拆分

后续在本 worktree 中按以下本地提交拆分，便于逐步审查：

1. `docs: add agent-friendly docs execution plan`：本文档。
2. `docs: generate static ai documentation artifacts`：raw Markdown、`llms.txt`、`llms-full.txt`、sitemap、页面索引。
3. `docs: add inline ai document actions`：正文内部操作区和子路径链接处理。
4. `docs: add agent skill entry and docs navigation`：Agents 页面、Skill 入口和页面说明。
5. `docs: validate demo and metadata references`：Demo 路径、链接和 frontmatter 校验。
6. `docs: add component metadata catalog`：公开导出和 API 元数据。
7. `feat: add tiny-robot docs mcp server`：独立 MCP 服务及其测试。

每个提交都必须保持可构建；MCP 提交不应与静态文档提交混在一起。

## 9. 验证门槛

静态文档阶段：

```text
pnpm -F docs build
git diff --check
```

构建校验：

- Markdown 页面标题存在。
- 正式页面描述可用。
- `canonical_url` 唯一。
- `<demo>` 和 `vueFiles` 路径存在。
- Demo 路径不会越出 `docs` 目录。
- 页面索引和 raw 文件数量一致。
- `llms.txt`、`llms-full.txt`、`sitemap.md`、`pages.json` 生成成功。
- `VITEPRESS_BASE` 子路径下的链接正确。
- 页面内部操作区不出现在首页、不遮挡正文。

MCP 阶段：

- MCP 初始化成功。
- 工具列表稳定。
- 组件搜索能返回页面和 Demo。
- 页面读取返回 Markdown。
- Demo 读取支持单文件和多文件示例。
- 无效页面和无效 Demo 返回明确错误。
- 大页面读取不会超出服务限制。

## 10. 完成标准

改造完成必须同时满足：

1. GitHub Pages 能访问 HTML、Demo、raw Markdown、`llms.txt`、`llms-full.txt`、sitemap、页面 JSON 和 Skill。
2. 页面正文内部提供复制 Markdown、查看 Markdown 和 AI 工具入口。
3. AI 能通过索引找到组件、套件、工具、迁移和 Demo。
4. Demo 与页面关系由构建脚本验证，而不是依赖模型猜测。
5. Skill 不再维护完整文档副本，或明确标记为自动生成的离线快照。
6. 组件 API 元数据与公开导出有可追踪来源。
7. MCP 服务独立部署并读取同一批 docs 构建产物。
8. 文档构建、链接校验和 MCP 测试全部通过。

## 11. 风险与处理

| 风险 | 处理方式 |
| --- | --- |
| `llms-full.txt` 过大 | 保持 `llms.txt` 精简；MCP 支持按页面和章节读取；Demo 源码按需返回 |
| 文档和源码 API 漂移 | 公开导出索引、类型检查、文档校验分阶段增加，不用手工 JSON 作为事实源 |
| GitHub Pages 子路径链接错误 | 所有 URL 通过 `VITEPRESS_BASE` 统一生成，并在构建中验证 |
| Demo 多文件依赖遗漏 | 解析 `vueFiles`，对入口导入做路径检查，遗漏时阻断构建 |
| 独立 Skill 再次过期 | Skill 只保留规则；完整资料由 docs 构建自动生成 |
| MCP 与静态站点耦合 | MCP 读取构建产物并独立部署，不让 GitHub Pages 承担运行时请求 |
| 页面操作区影响现有主题 | 使用 VitePress `doc-before` 插槽，并进行桌面和移动端检查 |

## 12. 下一步

当前提交只包含本执行方案。后续实现顺序固定为：

1. 先实现静态 AI 文档产物和构建校验。
2. 再实现页面正文操作区和 Agents 页面。
3. 再补充元数据和 Demo 关系。
4. 最后实现独立 MCP Server。

任何后续范围变化都应先更新本文，再修改实现。
