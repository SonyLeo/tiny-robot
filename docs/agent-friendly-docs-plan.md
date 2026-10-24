# TinyRobot Docs Agent 友好化改造执行方案

## 1. 文档目的

本文是 TinyRobot 文档 Agent 友好化改造的端到端执行基线。它记录目标用户与场景、内容事实源、数据契约、生成链路、实施阶段、验收门槛、发布运维和回滚策略。每一阶段完成后应更新实际状态、验证结果和未解决项，避免计划与实现脱节。

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
| Markdown 页面 | 55 个（当前方案 worktree 统计；构建时以脚本实际发现结果为准） |
| 组件页面 | 23 个 |
| Demo 源文件 | 245 个 `.vue` / `.ts` 文件；另有 18 个 `.css` / `.html` / `.svg` 辅助文件 |
| 页面 Demo | 使用 `vitepress-demo-plugin` 和 `<demo>` 标签 |
| 搜索 | VitePress local search |
| 页面操作区 | 尚未提供文档内部的复制 Markdown、查看 Markdown、ChatGPT、Claude 操作 |
| Markdown 原文路由 | 不存在 |
| `llms.txt` / `llms-full.txt` | 不存在 |
| `sitemap.md` / 页面 JSON 索引 | 不存在 |
| Agent Skill 发布入口 | 不在当前 docs 构建链路中 |
| MCP Server | 当前无面向文档查询的 MCP Server；Chat Runtime 中的 SDK 用于客户端连接，不是 docs MCP 服务 |
| API JSON 索引 | 组件 API 主要存在于 Markdown 表格，没有统一组件元数据索引 |
| 文档规范 | 已有 `component-documentation-standard.md`，包含 L0 Demo、API 完整性、事实源和弃用规则 |

已有独立 `agent-skills` 仓库中的 `tiny-robot-skill` 仍有价值，但它复制了组件文档、Demo、指南和规则。后续应将 docs 作为唯一事实源，独立 Skill 收敛为规则和索引入口，避免文档内容分叉。

## 3. 用户场景、目标和非目标

### 3.1 目标用户与任务

| 用户 / Agent | 典型任务 | 首选入口 |
| --- | --- | --- |
| 开发者 | 查组件用法、API、限制和示例 | HTML 文档、页面内复制 Markdown |
| IDE Agent | 根据需求选组件并生成可运行代码 | Skill + `llms.txt` / 页面索引 / raw 页面 |
| MCP 客户端 | 搜索并按需读取文档、API 和 Demo | 独立 MCP Server（后续阶段） |
| 通用网页 Agent | 发现文档站和相关页面 | `llms.txt`、Skill discovery 文件、sitemap |
| 离线或受限网络用户 | 使用固定版本资料 | 标注版本和生成时间的 Skill / 文档快照 |

本改造的“AI 友好”以可发现、可引用、可校验、可追溯和版本明确为目标，不以单纯增加 AI 按钮或生成更多 JSON 文件作为完成标准。

### 3.2 目标

1. 让 AI 工具可以直接发现、读取和引用 TinyRobot 文档。
2. 让页面、Markdown、Demo 和 API 元数据建立稳定关系。
3. 让文档发布自动生成 AI 所需的静态产物。
4. 让 ChatGPT、Claude、Cursor、Copilot 等工具能够使用同一份最新内容。
5. 为后续独立 MCP 服务提供稳定、可查询的内容源。
6. 维持现有 VitePress、Demo、GitHub Pages 和 Vue 组件使用方式。

### 3.3 非目标

1. 不迁移到 Nuxt 或 Nuxt Content。
2. 不在第一阶段重写全部组件文档。
3. 不把 Markdown 表格一次性全部改写成手工 JSON。
4. 不把 MCP Server 部署到 GitHub Pages。
5. 不继续手工复制一份完整 Skill 文档作为长期事实源。
6. 不改变 TinyRobot 公开组件 API。
7. 第一阶段不采集用户提示词、会话或个人数据；不增加需要账号或密钥的功能。

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

### 4.1 构建与发布边界

- 当前文档构建入口是仓库根目录 `pnpm build:docs`，由 `scripts/build-docs.js` 负责依次构建组件、Playground 和 VitePress。Agent 产物必须明确接入该入口及 CI，而不能只增加一个未被发布链路调用的 docs 子命令。
- VitePress 当前使用 `docs/src` 为 `srcDir`、`docs/dist` 为 `outDir`，并从 `VITEPRESS_BASE` 读取子路径。所有产物 URL 必须经过同一 base URL helper 生成；不能硬编码站点根路径。
- 先生成或校验供 VitePress 消费的中间数据，再构建 VitePress；需要复制到发布目录的静态文件在构建后写入 `docs/dist`。具体时机需由实现阶段通过本地 build 和 CI 发布链路验证。
- 当前发布工作流按 tag 将产物部署到 `/<tag>/`。每个版本目录应可独立工作；方案还需在上线前确定一个稳定的默认文档入口和 `DOCS_SITE_URL`，不能假设 preview、tag、latest 路径等价。
- 构建产物必须包含版本信息：源码版本/tag、基线 commit、生成时间（仅用于展示，不作为可复现性输入）、schema 版本和文档 base URL。内容哈希用于验证产物与输入对应。

### 4.2 产物生命周期

```text
Markdown + frontmatter + navigation + Demo 声明
              │
              ▼
discover → parse → validate → normalize → render/export → verify
              │                                      │
              ├── manifest / pages / demos           ├── HTML + raw Markdown
              ├── component catalog                  ├── llms.txt / llms-full.txt
              └── validation report                   └── Skill bundle / MCP catalog
```

所有下游产物只从同一轮构建生成。页面列表、raw 页面、llms 索引和 MCP catalog 不得各自维护重复清单。

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

### 5.1 内容分类和状态

构建器必须区分正式内容、草稿、模板、规范文档和非页面 Markdown。只有正式发布的文档进入公开索引；规范文档可单独标记为维护者资源，除非明确批准，不自动作为终端用户 API 文档发布。默认通过 frontmatter `draft: true` 排除草稿，并提供显式纳入规则和构建报告，不能仅依赖目录名猜测。

每个页面需要稳定且唯一的 `id` 或由规范化源路径确定的稳定键。字段语义固定如下：`route` 是不含部署 base 的 VitePress 站内路由；`canonical_url` 是带正式站点域名、且包含该版本部署 base 的绝对 URL；`source` 是相对 `docs/src/` 的 Markdown 路径；`raw_path` 是相对站点 origin 的 raw 文件路径，包含部署 base；`raw_url` 是可公开访问的绝对 raw URL。源 frontmatter 只维护内容事实，route、source、raw 等派生字段由生成器统一计算。

### 5.2 建议的页面元数据契约

```yaml
---
title: Bubble 气泡组件
description: 展示 AI 消息、流式文本和多种内容类型的气泡组件。
kind: component
status: stable
package: '@opentiny/tiny-robot'
exports: [Bubble, TrBubble]
keywords: [AI 消息, 流式文本, Markdown 渲染]
related: [/components/sender]
---
```

`title`、`description`、`kind`、`status`、`package`、`exports`、`keywords`、`related` 应按字段定义校验规则；自动推导值只能作为构建期 fallback 或待补全报告，不能静默伪装成人工确认。组件专属字段只对 `kind: component` 等适用页面强制要求。不要在 frontmatter 中维护可从文件路径稳定推导的 `source`、`raw` 等派生字段。生成 JSON 使用 camelCase，源 frontmatter 保持现有 snake_case 兼容；转换映射写入 schema。建议为生成数据增加 `schemaVersion`，并对字段变更执行兼容性检查。

### 5.3 Demo 关系数据契约

记录每个 `<demo>` 的页面、顺序、标题、入口文件、明确声明的 `vueFiles`、文件角色和源码相对路径。显式声明的文件缺失必须报错；递归 import 检查作为独立规则，报告未列入展示清单的本地依赖，不应误把包依赖、别名或测试夹具当成缺失 Demo。构建器应支持当前插件语法与仓库中的多行数组写法，避免脆弱地用单一正则解析 Vue/Markdown 属性。

复制示例的行为必须保留文件名和多文件结构；单文件复制可复制源码，多文件示例应提供逐文件复制/下载或清楚展示依赖，不能把多个文件直接拼成不可运行的代码块。

## 6. 分阶段执行计划

阶段按依赖关系执行。静态资源生成依赖页面与 Demo 清单；页面操作区依赖 raw Markdown URL 契约；MCP 依赖稳定的 pages/component/demo schema。每阶段均需产出可审查的文件、自动化验证和人工验收记录。阶段完成定义为验收通过并更新本文，不以代码已合并为准。

### 元数据错误等级

| 等级 | 示例 | 阶段 1 行为 | 阶段 3 完成行为 |
| --- | --- | --- | --- |
| Error | frontmatter 无法解析、route 冲突、显式 Demo 文件缺失或越界 | 阻断构建 | 阻断构建 |
| Warning | 页面缺少 description、keywords 或相关链接 | 统计并输出来源文件 | 对已纳入正式范围的必填字段升级为 Error |
| Info | 使用自动推导标题、页面没有 Demo、可选 API 未覆盖 | 报告，不阻断 | 按页面类型和豁免规则处理 |

阶段 3 结束时，正式页面必须满足其 `kind` 对应的必填字段；豁免项需在带原因的 allowlist 中记录并定期复核。构建报告输出总量、各级问题数量及相对基线上升/下降，不将渐进补齐阶段的 warning 与最终质量门槛混为一谈。

### 阶段 0：基线和脚本骨架

目标：建立可重复执行的文档产物生成入口，不改变页面行为，并冻结输入/输出契约。

计划变更：

- 新增唯一 CLI `docs/scripts/agent-docs.mjs`。
- 在 `docs/package.json` 增加 Agent 文档生成命令。
- 为脚本提供 `DOCS_SITE_URL` 和 `VITEPRESS_BASE` 配置。
- 生成过程失败时返回非零退出码。
- 对输入路径使用 `path.resolve` 并限制在 `docs` 目录内。
- 读取正式页面源、VitePress 配置和 nav/sidebar，不扫描敏感配置或环境变量；只允许显式读取 `DOCS_SITE_URL` 等公开构建参数。
- 输出阶段性 manifest、schema 版本和清晰的错误/警告报告；支持 `--check` 只校验不写入，生成物不回写 Markdown。
- 明确忽略规则、draft 规则、canonical host、当前发布 tag 对应的 base URL 和默认稳定 URL。

验收：

- 本地执行可以重复生成同样的文件。
- 不依赖网络服务。
- 不修改源码 Markdown。
- 对同一输入连续构建，除明确声明的生成时间外内容哈希相同；CI 可在 check 模式下验证生成物无过期差异。

### 阶段 1：页面目录、元数据和 Demo 关系

目标：先得到所有后续产物共用且可验证的规范化内容目录。

计划变更：

- 从 `docs/src` 发现页面，根据正式页面规则过滤；收集 route、标题、description、kind、status、canonical URL 和来源文件。阶段 1 只要求结构有效，缺失的渐进式元数据按上述等级告警。
- 解析 frontmatter 和 VitePress 导航，校验重复 route、损坏 frontmatter、无效关联链接；区分阻断错误与待补齐告警。
- 解析 `<demo>` 声明，记录入口和明确列出的多文件源码；使用仓库已有 Markdown/Vue 解析依赖或结构化解析，不使用易误匹配的跨行正则。
- 对 Demo 源路径执行 realpath/规范化路径边界检查，拒绝越出 `docs/demos` 的路径；校验文件存在及扩展名白名单。
- 对 Demo 本地相对导入生成遗漏报告；初期人工确认误报和遗漏，不把未支持的别名/动态导入静默判为完整依赖图。
- 只产出内部规范化 manifest 和验证报告，不生成公开 `pages.json` / `demos.json`，也不批量改写全部页面；按类型分批补齐人工元数据。

验收：

- 正式页面、排除页面和例外有清单及计数；计数随仓库内容变化，不写死为永恒基准。
- route、页面 ID 和计算后的 canonical URL 唯一；所有已声明 related 链接指向正式页面或明确外链。
- 所有 Demo 的显式文件存在且位于允许目录；依赖遗漏报告经维护者确认。
- 校验脚本有覆盖路由冲突、缺失 Demo、越界路径、多文件示例和草稿过滤的必要测试。

### 阶段 2：静态 AI 文档产物

目标：从阶段 1 的规范化目录生成 GitHub Pages 可读取的静态资源。

生成以下文件：

```text
/raw/<path>.md
/llms.txt
/llms-full.txt
/sitemap.md
/agent/pages.json
/agent/demos.json
/agent/manifest.json
```

`pages.json` 最低字段：

```json
{
  "route": "/components/bubble",
  "title": "Bubble 气泡组件",
  "description": "...",
  "kind": "component",
  "source": "components/bubble.md",
  "canonicalUrl": "${DOCS_SITE_URL}${VITEPRESS_BASE}components/bubble",
  "rawPath": "${VITEPRESS_BASE}raw/components/bubble.md",
  "rawUrl": "${DOCS_SITE_URL}${VITEPRESS_BASE}raw/components/bubble.md",
  "examples": ["demos/bubble/basic.vue"]
}
```

`llms.txt` 只保留页面索引、摘要、分类和链接，控制上下文大小。`docs/src/agents/llms-txt.md` 等页面若存在，只是介绍这些产物的说明页；它们不能与根目录生成的 `/llms.txt` 文件混淆，也不能覆盖同一路径。

`llms-full.txt` 包含正式页面 Markdown，并在页面之后附带页面声明的 Demo 源码；首版设定并记录大小上限，超限时不截断中间内容，应输出拆分索引或按需页面链接。多文件示例必须有文件名边界；Demo 单独资源可由 `agent/demos.json` 定位。

附加约定：

- raw 发布路径按 VitePress source 相对路径映射；移除 `.md` 后缀的页面路由规则与 `index.md` 路由规则明确，raw 文件本身保留 `.md`。例如 `docs/src/components/bubble.md` 对应 `/raw/components/bubble.md`，站点首页对应 `/raw/index.md`。
- raw 内容中的站内 Markdown 链接、图片、锚点和下载链接必须解析后改写为本次版本可访问的绝对 URL，包含部署 base；代码块中的文本不改写。无法安全解析的动态链接输出校验告警并保留原文，不静默生成错误链接。
- Demo 标签在 raw 中替换为稳定的示例说明块：标题、描述、示例入口和所有声明文件的公开 URL；不保留无法被普通 Markdown 阅读器渲染的 VitePress 专属标签。
- 统一处理 frontmatter：面向用户的 raw Markdown 可保留原始 frontmatter；llms 文本需将机器元数据转为稳定页面头信息，避免重复和噪声。
- `llms.txt` 定位为轻量发现索引，内容含绝对 URL、标题、简述和分类；`llms-full.txt` 只作为批量上下文便利产物，页面 raw 才是按需读取的权威格式。
- `sitemap.xml` 用于通用爬虫；`sitemap.md` 如保留，明确其为 Agent 人类可读目录，不替代 XML。
- `DOCS_SITE_URL` 必须是 origin（scheme + host，可选 port），不得含路径；`VITEPRESS_BASE` 必须是以 `/` 开头和结尾的部署路径。统一 helper 负责规范化与拼接，拒绝重复 base、双斜杠和错误编码。本地预览使用本地 origin，不写入发布 canonical 字段。

验收：

- 所有正式 Markdown 页面都有 raw 文件。
- `llms.txt` 能覆盖所有正式页面。
- `llms-full.txt` 能定位页面来源和 Demo 来源。
- `pages.json` 可被 Node、浏览器和 MCP 服务读取。
- `manifest.json` 标明内容版本、schema 版本、base URL、生成时间和产物哈希。
- 构建成功后以 HTTP 静态服务器实际读取 raw、索引和 llms 文件；检查 base 子路径和大小上限。
- 对发布使用的 `${DOCS_SITE_URL}`、`${VITEPRESS_BASE}` 执行组合测试：根部署 `/`、tag 子路径 `/tiny-robot/alpha/`、`/tiny-robot/latest/`；检查 URL 拼接后无重复 base，标签切换后版本 URL 自洽。

### 阶段 3：页面元数据质量提升和链接校验

目标：在自动目录可靠后，提高检索质量并逐步消除 AI 对目录和相对路径的猜测。

建议 frontmatter：

```yaml
---
title: Bubble 气泡组件
description: 展示 AI 消息、流式文本和多种内容类型的气泡组件。
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

1. 自动推导只生成待审核报告，不自动批量写入源文件。
2. 按组件、套件、工具、指南、迁移等类别分批补充人工确认的 description、package、exports 和 keywords。
3. 对 `badge: deprecated` 继续复用现有侧边栏 Badge 机制。
4. 不把自动推导结果直接当作高质量人工描述；自动结果必须可被后续修改覆盖。

本阶段不重新解析或生成 Demo 索引；解析与唯一数据生成归阶段 1、2。此处只对已生成的 Demo 目录执行增量质量治理：按已确认的依赖差异清单逐步消除遗漏，对元数据补齐结果做内容抽样审查。

验收：

- 245 个现有 `.vue` / `.ts` Demo 源文件及 18 个辅助文件不被移动或复制到另一个事实源目录。
- 所有正式页面的显式 Demo 声明可解析。
- 多文件 Demo 的入口和声明依赖可完整读取，递归导入检查能力及限制有文档说明。
- markdown 内站内链接、图片和锚点通过校验；忽略清单有理由、负责人和到期复核点。
- 阶段 3 不维护第二份 Demo 数据或解析逻辑，公开 `pages.json` / `demos.json` 仍仅由阶段 2 的生成命令输出。

### 阶段 4：页面内部 AI 操作区

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
- ChatGPT / Claude 按钮只打开带当前页面公开 URL 的新会话入口；不把页面内容、剪贴板、用户输入或密钥自动提交给第三方。若平台 URL 格式不稳定，保留复制 Markdown / 链接作为主操作。
- “查看 Markdown”应打开当前版本的 raw 页面并保持部署 base；复制链接的目标是稳定公开 URL，并显示复制失败反馈。
- 页面路由切换后操作区标题、raw 链接和 canonical URL 必须同步更新。

验收：

- 操作区出现在页面正文上方。
- 不影响默认侧边栏、右侧 outline 和 Demo。
- 静态部署和带 `VITEPRESS_BASE` 的子路径部署都能生成正确链接。

### 阶段 5：Skill 收敛和在线文档入口

目标：保留已有 `tiny-robot-skill` 的规则价值，消除重复文档维护。

新的 Skill 只保留：

- TinyRobot 触发条件。
- 组件查找和 API 读取顺序。
- 禁止编造 API 的规则。
- Vue `script setup` 和命名规范。
- 组件、Kit、Chat 套件的选型路由。
- 弃用入口处理规则。
- 支持客户端对应格式的 Skill discovery 地址、`llms.txt`、`/agent/pages.json`、raw Markdown 和（启用时）MCP 地址。
- 离线快照的版本信息。

完整组件 Markdown、Demo、指南和迁移文档应由 docs 构建生成，不能继续手工复制维护。

Skill 采用 Open Agent Skills 兼容的 `SKILL.md` 格式作为主格式，并在包元数据中声明名称、版本和发现 URL。以已核实支持该格式或 discovery 协议的客户端为首批验收目标；不同客户端的安装方式、自动发现能力和版本必须逐项验证。不得宣称一个 URL 自动适用于所有 Agent。

阶段 5 分为 5A、5B、5C-Fork 和 5C-Production。先完成 Skill 内容与版本契约，再建立 Agent 文档入口；之后完成阶段 6 的组件 API catalog，并以维护者 fork 的 beta 部署完成评审前端到端验收。同事评审通过后，才确定正式站点入口并切换生产配置。生产发布自动化属于最后的发布收尾工作，不作为 fork 验收或评审前置条件。

#### 5A：Skill 内容收敛与版本契约（不改发布工作流）

- 先以 `opentiny/agent-skills/skills/tiny-robot-skill` 为现有 Skill 的维护源，核对其触发规则、版本和安装说明；TinyRobot 文档仓库不复制一份可独立编辑的 Skill 正文，避免形成第二个事实源。
- 为 Skill 的离线快照和在线文档产物定义同一版本字段：`docsVersion` 对应文档发布 tag，`schemaVersion` 对应生成产物契约版本；Skill 自身版本单独递增，不与 docs tag 混用。manifest 暂时保留既有 `contentVersion` 作为兼容别名，两字段必须相同。
- 约定 Skill 包元数据必须声明 `name`、`version`、`description` 和来源仓库/路径；在线 Skill 在每次读取时从 manifest 校验所选 `docsVersion` 与 `schemaVersion`，离线快照才需在包元数据中固定 `docsVersion` 和 source commit，并在 README 中说明快照状态。Skill 与 `agent/manifest.json` 的版本不匹配时应视为验收失败。
- 在线文档构建继续只发布本仓库已经生成的 raw Markdown、`llms.txt`、`agent/pages.json`、`agent/demos.json` 和 `agent/manifest.json`；Skill 对这些资源给出发现顺序和 URL 解析规则，不在本阶段另造一份页面/Demo 索引或未经客户端验证的 discovery 协议。
- 在阶段 5A 的验收记录中确定目标客户端及安装方式：先核实客户端是否实际读取 Agent Skills 格式或 discovery URL；未验证的客户端只提供规范安装说明和版本化 `SKILL.md` 下载地址，不宣称自动发现。

5A 验收：

- Skill 的维护源唯一且明确；离线副本明确标示来源和对应文档版本。
- Skill 版本、`docsVersion`、`schemaVersion` 含义互不混淆，离线副本与文档 manifest 能执行一致性检查。
- 选定客户端的安装/读取路径经过实际验证；未验证的能力不作为已支持功能宣传。
- 本仓库现有 Agent 产物 schema 与 URL 契约保持兼容，根目录和 tag 子路径构建均通过现有检查。

#### 5B：Agent 文档入口（fork 评审前）

目标：在文档站中提供统一、可直接访问的 Agent 专区，让开发者和 Agent 能找到 TinyRobot 的 LLMs.txt、Skill 和 MCP Server 信息。参考 Nuxt UI 的文档侧栏索引和三个独立页面；用户通过侧栏索引进入独立路由，不在各页面正文中增加重复的页面切换导航。

建议页面结构：

```text
docs/src/agents/
├── llms-txt.md
├── skills.md
└── mcp-server.md
```

三页组成侧栏中的 `Agents` 分组；本阶段不另建内容重复的 `index.md`。各页面必须有稳定、可直接访问的路由，刷新和复制链接后仍能打开对应页面。

实现与内容约定：

- 在文档侧栏中增加 `Agents` 索引，包含 `LLMs.txt`、`Skills`、`MCP Server` 三个页面；三个页面都有独立、可分享的路由，通过侧栏普通链接跳转，不在正文内互相联动或重复列出页面导航。
- `LLMs.txt` 页面说明 `/llms.txt` 与 `/llms-full.txt` 的用途、差异、上下文规模和适用场景，并可链接到页面索引、Demo 索引、raw Markdown 和 manifest。所有链接按当前部署 base 生成。
- `Skills` 页面说明 TinyRobot Skill 的能力、维护源、在线查阅方式和已验证的安装路径；只描述实际验证过的客户端行为，不宣称通用 URL 自动发现。
- `MCP Server` 页面介绍文档查询服务的目标、与 TinyRobot MCP 组件/客户端运行时的边界及规划状态。阶段 7 服务上线前必须显式标为规划中，不展示虚构的 endpoint 或安装配置；服务实现后再补充实际地址和客户端配置。
- 页面索引使用当前 VitePress 侧栏配置实现；页面跳转由路由处理，不依赖隐藏面板状态。窄屏下侧栏导航仍可访问，不能遮挡标题和正文。
- Agent 专区只解释和链接现有生成产物，不复制维护 `llms.txt`、Skill 内容、索引或 Demo，保持原有事实源与构建输出唯一。
- Markdown 页面参与现有页面索引和站点地图；生成的 `/llms.txt`、`/llms-full.txt` 等静态文件继续保持原路径，不与 `/agents/` 说明页面混淆。

验收：

- 侧边栏 Agent 索引包含三个独立页面；点击索引项、直接打开或刷新任一子路由均可用。
- fork beta 的子路径部署下，页面内所有静态产物链接均落在同一版本 base，不包含正式域名硬编码。
- LLMs 与 Skills 页面所列资源在 fork beta 可访问；MCP 页面清楚标注未部署状态，不给出无法验证的连接地址。
- 窄屏下侧栏索引可用且不遮挡正文；直接打开、刷新、前进/后退和复制路由链接均保持正确页面。
- 三个说明页面纳入现有 Agent 页面索引和站点地图；页面内容可复制为 Markdown，且页面链接按 fork 子路径正确解析。

#### 5C-Fork：维护者 fork 的端到端验收（评审前）

目标：在不依赖正式域名、正式仓库或生产凭据的前提下，使用维护者 fork 验证完整的文档 Agent 主线，并形成可供同事评审的证据。

- 唯一验收基址使用维护者明确提供的 fork beta URL；构建、manifest、页面索引、raw Markdown、Demo、页面操作区和 Skill 查阅流程都应使用该部署的 `DOCS_SITE_URL` 与 `VITEPRESS_BASE`。
- 阶段 5B Agent 文档入口和阶段 6 组件 API catalog 首个可用版本应纳入本轮 fork 验收；不要为了评审前验证而填写正式域名、稳定入口或生产专用配置。
- 使用现有手动 dispatch 发布流程部署 fork beta。只为 fork 端到端验收所必需时，才做最小工作流调整；不得在此阶段接入正式仓库发布或生产凭据。
- 部署后验证 manifest 与部署基址、`docsVersion`、`schemaVersion` 一致；检查 raw Markdown、页面索引、Demo 索引、llms 产物和必要的页面链接可访问，并对 manifest 声明的 artifact hashes 做实际内容核验。
- 使用 fork beta URL 运行 Skill 成功与失败场景：文档查找和代码生成、无文档依据的 API 不猜测、资源缺失时停止并说明；代码示例应包含必要导入或声明项目配置前提。
- 在 fork beta 上验收复制 Markdown、复制链接和查看 Markdown 等页面操作。ChatGPT/Claude 第三方入口按当前用户范围继续延期。
- 形成评审材料：目标与非目标、架构与产物、fork 部署/验证步骤、实际结果、限制及评审后才需确定的正式环境配置。验收记录中的链接须标明是 fork beta，不得表述为正式环境验证。

5C-Fork 验收通过后，进入同事评审。若评审要求改变方案或实现，先在 fork 环境修订并重跑相关验收，再进入生产切换。

#### 5C-Production：评审后的正式入口与发布自动化

只有评审通过后才启动本子阶段。正式域名、稳定前缀、生产仓库、正式 tag 路径、客户端发现格式和发布凭据均在此时确认；fork beta 的成功结果不替代正式环境验证。

将已在 fork 验收过的环境参数替换为评审确认的生产值，优先通过构建参数和发布配置完成，不改动已验证的文档契约或功能实现。先验证正式静态资源和 URL，再接入生产发布自动化。

如客户端确有可互操作的 discovery 格式，再选择其已支持的格式；若没有共同标准，则只发布规范安装说明及直接 `SKILL.md` 下载链接，不新造通用协议。

静态发布入口（仅在评审通过且托管路径和客户端格式确认后启用）：

```text
<site-origin>/<stable-prefix>/.well-known/skills/index.json
<site-origin>/<version-base>/.well-known/skills/tiny-robot/SKILL.md
```

当前 GitHub Pages 发布按 `/<tag>/` 部署，不会自动部署站点根目录。实现时必须通过同一发布流程维护经确认的稳定入口；稳定入口只指向不可变的版本化 Skill，版本路径不可静默覆盖。若 Pages 仓库根路径由其他站点内容占用，应将稳定前缀配置在实际可发布的路径，不得假设能写入 `/.well-known/`。验收需同时检查稳定入口、版本入口和失效版本回退策略。

若最终启用 discovery index，它至少列出 Skill 的 `name`、`version`、`description`、`skillUrl`、`docsVersion` 和 `schemaVersion`，链接必须是完整绝对 URL。index 的 JSON schema 以第一批支持客户端实际识别的格式为准；若客户端没有共同 discovery 标准，则静态站点提供规范安装说明和直接 `SKILL.md` 下载链接，不自创并宣称通用发现协议。

独立 `agent-skills` 仓库可以继续提供离线安装入口，但内容应来自 docs 产物或明确标注快照版本。

Skill 分发需要区分两类内容：由 docs 生成的安装包/版本快照，与仓库中的维护源。每次发布校验 Skill 声明的文档版本和 manifest 一致；若 agent-skills 仓库暂时不能自动消费产物，则在该仓库保留明确的生成来源、同步流程和版本号，禁止把它误称为实时链接。

### 阶段 6：组件级 API 元数据

目标：在页面级索引稳定后，为 MCP 和 Agent 提供结构化组件 API。

#### 6A：轻量组件 catalog（当前实施范围）

从组件包根入口的 TypeScript 公共导出中识别 `Tr*` Vue 组件，并生成 `agent/components.json`。文档页 frontmatter 的 `exports` 是组件与说明页面之间唯一需要维护的关联；包名、页面路由、文档状态和示例文件均从现有 catalog 推导，不另建 JSON 清单。

每条记录至少包含：

```json
{
  "name": "TrBubble",
  "exportName": "TrBubble",
  "aliases": ["Bubble"],
  "package": "@opentiny/tiny-robot",
  "status": "stable",
  "documentationStatus": "documented",
  "page": "/components/bubble",
  "examples": ["demos/bubble/basic.vue"]
}
```

`agent/components.json` 顶层包含 `schemaVersion`、包名、组件总数和组件记录。该索引面向有独立使用文档的公开组件；内置工具组件（当前为 `TrConversations`、`TrIconButton`）不属于文档查询目标，不进入索引，也不作为缺文档警告。为防止遗漏真实组件，今后新增的未映射导出仍需先确认类别：确认属于内置工具后加入排除集合，其他未映射导出继续报告 Warning。QuickAssist 是 Vanilla 能力，不属于 Vue 组件导出，因此不进入该文件。

校验要求：

- 通过 TypeScript Compiler API 读取 `packages/components/src/index.ts` 的模块导出，筛选公共的 `Tr*` Vue 组件，不以文本正则近似解析 TypeScript。
- 文档 frontmatter 声明的导出必须真实存在于组件包根公开 Vue 组件导出中；不存在或重复关联均报 Error。
- 页面映射只读取正式页面 catalog。已关联页面的包名、页面状态和 Demo 文件由该页元数据推导；未映射导出不能静默忽略，只有明确分类为内置工具的导出可排除。
- 包入口源码纳入 catalog 输入哈希，入口导出变化会触发 catalog 过期检查。
- `agent/components.json` 纳入静态产物与 `agent/manifest.json` 的 SHA-256 产物哈希，继承相同的版本路径和部署子路径规则。

#### 6B：完整组件 API 元数据（后续评估）

只有在轻量 catalog 被本地和 fork 流程验证后，再决定是否生成 Props、Events、Slots、Methods、Types 等字段。不能把未验证的类型推导结果作为确定 API 发布。

评估阶段可参考以下目标结构：

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

- TypeScript Compiler API 和包根公共导出。
- 公开 Props、Events、Slots 和 Expose 类型。
- 实现和测试用于核对默认值和运行时行为。

范围限制：

- 内部导出不进入索引。
- 首阶段不自动推导所有 CSS 变量和复杂泛型。
- 文档表格仍保留给开发者阅读，JSON 用于机器查询。

### 阶段 7：独立 MCP Server

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

在开始部署前补齐运行规格：唯一生产 URL、托管平台、Node LTS 版本、传输协议和 SDK 版本、CORS/来源限制、超时和响应大小限制、健康检查、日志脱敏、速率限制、可用性目标、版本更新与回滚方式。服务只读取公开 docs 构建产物，不接收或保存用户私有代码、提示词和凭证。首期只提供只读查询，不暴露执行代码或任意文件读取工具。

工具契约需定义输入 schema、分页/排序、错误码、结果来源 URL、文档版本、字符限制和兼容策略。`search-documentation` 与 `search-components` 返回短摘要和引用；`get-documentation-page` / `get-example` 支持按需完整读取。限制搜索结果数量和读取字节，过大内容返回明确截断元信息与继续读取方式。无效路径必须通过 manifest 查表拒绝，不能拼接用户输入访问文件系统。

部署选择只保留一种正式方案：独立 Node 服务部署，GitHub Pages 继续负责静态文档和演示。若 MCP 单独部署尚无预算或维护人，阶段 7 可以推迟，不影响静态 AI 改造完成；不得将“有 MCP”设为第一阶段交付阻塞项。

## 7. 跨阶段工程约定

### 7.1 版本与兼容

- `pages.json`、`demos.json`、组件 catalog、MCP 返回结构均带 schema 版本；发布端与 MCP 端不得依赖未声明的隐式字段。
- 每个静态发布目录都能独立提供匹配版本的 HTML、raw、索引和 Skill；不得让旧版 HTML 请求只有 latest 才有的 raw 内容。stable discovery index 指向明确的当前版本；版本化路径内容不可变，不以静默覆盖方式更新旧版本。
- 索引采用加法兼容：新增可选字段不破坏旧消费者；删除/改名字段需提高 schema 版本并同步 MCP 客户端和 Skill。
- 构建是确定性的；产物不得依赖构建机时区、网络抓取或线上 API。生成时间字段排除在输入内容哈希之外。

### 7.2 安全、隐私和可访问性

- 产物只发布仓库明确公开的文档和 Demo 文件；路径规范化后验证边界，拒绝符号链接越界和 URL 编码绕过。
- Markdown 导出与 AI 页面操作不可绕过站点现有 HTML/Markdown 安全处理；禁止未经净化的 HTML 注入。
- 不把来源不明的远程抓取内容混入索引；保留来源文件和 commit，以便审计。
- 复制操作提供键盘访问、可读状态提示和失败反馈；图标按钮有 aria-label，外链有明确名称。
- 第三方 AI 链接只携带公开页面 URL，不自动传输正文或剪贴板内容。

### 7.3 维护流程与责任

- 新增正式页面时，PR 检查要求有标题、描述、分类、状态和可解析链接；组件页需关联包与公共导出，示例页需声明 Demo 文件。
- 修改公开 API 时，同一 PR 更新文档和 Demo；组件元数据校验应能指出导出/API 与页面的差异，但不自动改写文档结论。
- PR CI 执行静态构建、索引校验、死链/本地链接校验、Schema 校验和 `git diff --check`；对耗时的递归依赖或全站外链检查可定期运行，不阻塞每个 PR。
- 每次发布记录页面数、Demo 数、缺失元数据数、警告数和产物大小；错误为零，允许警告需有阈值并逐步降低。
- 指定 docs 维护责任人审查 Schema、canonical host、Skill 同步和发布异常；此方案不假定未指定的个人或团队名。

### 7.4 回滚与故障处理

- 静态产物随文档 tag 一起发布；发布失败时保留上一个可用目录，不覆盖稳定入口到不完整版本。
- 操作区功能失败时用户仍可直接访问 HTML 和 raw Markdown；复制 API 不可用时给出可选择文本的备用方式。
- 构建器可通过关闭 Agent 产物生成恢复旧 docs build；脚本错误不得阻断组件包发布，但应阻止不完整 docs artifact 部署。
- MCP 部署与静态站点发布解耦；MCP 故障时 Skill 和静态索引仍可用。回滚服务版本不回滚已发布的静态文档。

## 8. 计划新增和修改的文件

### 第一批静态产物改造

```text
docs/package.json
docs/scripts/agent-docs.mjs
docs/.vitepress/theme/Layout.vue
docs/.vitepress/theme/components/DocActions.vue
docs/.vitepress/theme/style.css
docs/.vitepress/themeConfig.ts
docs/src/agents/llms-txt.md
docs/src/agents/skills.md
docs/src/agents/mcp-server.md
docs/agent/skills/tiny-robot/SKILL.md
docs/agent/schema/*.schema.json
```

`docs/src/agents/*.md` 是 VitePress 中的说明页面；`docs/agent/` 是仓库维护的生成输入/skill 源，最终可发布文件位于 `docs/dist/`。根目录 `llms.txt`、`llms-full.txt`、`.well-known` 等生成文件不得作为 Markdown 源文件手工维护。生成目录要在 `.gitignore` 或发布规则中明确，避免构建结果意外提交或被 VitePress 当页面扫描。

唯一 CLI 为 `docs/scripts/agent-docs.mjs`，提供 `catalog`（阶段 1 内部 manifest）、`build`（生成公开静态产物）、`check`（只校验并检查产物新鲜度）和 `report`（输出质量统计）子命令。`docs/package.json` 只暴露这些子命令，不另设 `build-agent-docs.mjs` 或 `validate-agent-docs.mjs` 入口；内部模块可拆分，但解析和 schema 只保留一份实现。

### 第二批内容和校验

```text
docs/src/**/*.md
docs/scripts/extract-component-metadata.mjs
```

第二批沿用唯一 `agent-docs.mjs` CLI 与其内部模块，不再创建重复 Validator；`extract-component-metadata.mjs` 属于组件 API 阶段的独立提取器，必须复用页面/Demo schema 和公共导出白名单。

### 第三批 MCP

```text
packages/docs-mcp/package.json
packages/docs-mcp/src/server.ts
packages/docs-mcp/src/catalog.ts
packages/docs-mcp/src/tools/*.ts
packages/docs-mcp/test/*.test.ts
```

## 9. 提交拆分

后续在本 worktree 中按以下本地提交拆分，便于逐步审查：

1. `docs: add agent-friendly docs execution plan`：执行基线方案。
2. `docs: validate page and demo catalog`：页面清单、Demo 解析、路径与元数据校验。
3. `docs: generate static ai documentation artifacts`：raw、llms、sitemap、pages/demos manifest。
4. `docs: add inline ai document actions`：正文操作区和子路径处理。
5. `docs: add agent skill entry and docs navigation`：Skill bundle、Agents 入口及版本说明。
6. `docs: add component metadata catalog`：轻量组件索引与公开 API 对照。
7. `feat: add tiny-robot docs mcp server`：独立服务、工具契约和部署配置。

每个提交都必须保持可构建；MCP 提交不应与静态文档提交混在一起。

## 10. 验证门槛

静态文档阶段：

```text
pnpm build:docs
git diff --check
```

权威集成验证命令为仓库根目录 `pnpm build:docs`，它覆盖组件依赖、Playground、VitePress、Agent 产物和 postbuild。PR 与发布流水线均使用该根命令，或使用经证明产物等价且显式跳过部分步骤的构建入口。快速本地验证可以使用 `pnpm -F docs build`，但它只验证 VitePress，不作为完整 Agent 产物验收。单独的 `pnpm -F docs agent:check` 用于快速校验 metadata/catalog 与生成物新鲜度。现有 PR CI 直接运行 `pnpm -F docs build`，实施时需明确更新该 workflow；不得只改 release workflow。CI 失败需指明源文件、字段/路径和修复建议，不只输出堆栈。

构建校验：

- Markdown 页面标题存在。
- 阶段 1 缺失渐进式元数据只输出 warning；阶段 3 结束后，正式页面满足其 `kind` 对应的描述等必填字段，例外必须在 allowlist。
- 生成的 `canonicalUrl` 唯一且为绝对 URL；站内 `route` 不包含 base，raw URL 包含当前 base。
- `<demo>` 和 `vueFiles` 路径存在。
- Demo 路径不会越出 `docs` 目录。
- 页面索引和 raw 文件数量一致。
- `llms.txt`、`llms-full.txt`、`sitemap.md`、`pages.json` 生成成功。
- `VITEPRESS_BASE` 子路径下的链接正确。
- 页面内部操作区不出现在首页、不遮挡正文。
- 用本地静态服务器访问构建目录，验证实际 HTTP 路径和 MIME 类型；仅检查文件存在不足以证明部署可读。
- 至少抽测一个组件单 Demo、一个多文件 Demo、一个非组件指南、一页迁移文档和首页；检查桌面/窄屏与键盘操作。
- 原始 Markdown 和 llms 内容不含失效的相对链接、构建机绝对路径、内部临时路径或无意义插件标签。
- 页面、raw、manifest、llms 索引覆盖集合一致；所有引用使用本次构建的同一版本。

MCP 阶段：

- MCP 初始化成功。
- 工具列表稳定。
- 组件搜索能返回页面和 Demo。
- 页面读取返回 Markdown。
- Demo 读取支持单文件和多文件示例。
- 无效页面和无效 Demo 返回明确错误。
- 大页面读取不会超出服务限制。
- 工具只读公开 catalog，不接受文件系统路径；响应含来源 URL、版本和大小信息。
- MCP 不可用时静态 docs、raw、Skill 和索引仍能独立完成核心任务。

## 11. 完成标准

静态 AI 友好化完成（不含可延期 MCP）必须满足：

1. GitHub Pages 能访问 HTML、Demo、raw Markdown、`llms.txt`、`llms-full.txt`、sitemap、页面 JSON 和 Skill。
2. 页面正文内部提供复制 Markdown、查看 Markdown 和 AI 工具入口。
3. AI 能通过索引找到组件、套件、工具、迁移和 Demo。
4. Demo 与页面关系由构建脚本验证，而不是依赖模型猜测。
5. Skill 不再维护完整文档副本，或明确标记为自动生成的离线快照。
6. 组件 API 元数据与公开导出有可追踪来源。
7. 页面清单、Demo 声明和静态索引来自同一构建，schema 和版本信息明确。
8. 文档构建、链接校验、子路径 HTTP 检查和静态产物一致性验证全部通过。

完整智能化改造还需满足：组件 API catalog 与公开导出可追踪；MCP 服务独立部署、监控、可回滚并读取匹配版本的 docs 产物。

## 12. 风险与处理

| 风险 | 处理方式 |
| --- | --- |
| `llms-full.txt` 过大 | 保持 `llms.txt` 精简；MCP 支持按页面和章节读取；Demo 源码按需返回 |
| 文档和源码 API 漂移 | 公开导出索引、类型检查、文档校验分阶段增加，不用手工 JSON 作为事实源 |
| GitHub Pages 子路径链接错误 | 所有 URL 通过 `VITEPRESS_BASE` 统一生成，并在构建中验证 |
| Demo 多文件依赖遗漏 | 校验显式 `vueFiles`；递归导入差异先报告，覆盖率明确后再按规则阻断 |
| 独立 Skill 再次过期 | Skill 只保留规则；完整资料由 docs 构建自动生成 |
| MCP 与静态站点耦合 | MCP 读取构建产物并独立部署，不让 GitHub Pages 承担运行时请求 |
| 页面操作区影响现有主题 | 使用 VitePress `doc-before` 插槽，并进行桌面和移动端检查 |
| 手写页面计数过期 | 由生成器输出每次扫描计数，基线数字仅用于审查记录 |
| old tag 与 latest 数据混用 | 每个发布目录包含自洽产物，stable URL 由发布配置明确映射 |
| llms-full 超大或被截断 | 大小预算、拆分策略和构建统计；永不静默截断 |
| Skill 文案与发布版本错配 | 从匹配版本 manifest 生成版本元数据并在发布校验 |

## 13. 执行顺序与状态跟踪

本方案以维护者 fork 作为评审前完整验收环境。正式站点域名、稳定入口和生产专用参数属于评审后的环境切换项，不阻塞 fork 实现、测试或评审。当前执行顺序为：

1. 已完成阶段 0–3：建立并验证页面/Demo catalog、静态 Agent 文档产物和渐进式元数据质量门槛。
2. 已完成阶段 4 的核心页面操作，以及阶段 5A Skill 内容收敛和版本契约；ChatGPT/Claude 入口按用户要求延期。
3. 阶段 5B 的 Agent 文档入口和三页初版已完成，读者反馈调整已纳入；用户已完成本地浏览器验收并确认无问题。
4. 阶段 6A 轻量组件 catalog 已完成：关联有独立文档的公开 Vue 组件导出、文档页与 Demo，并通过校验；内置工具组件明确排除。完整 Props/Events/Slots 元数据留待单独评估。
5. 当前下一阶段为阶段 7：开发本地 MCP Server，并先在本机验证工具查询链路；是否部署为远程服务在方案评审后决定。
6. 阶段 7 本地验证完成后，在 fork beta 上使用手动 dispatch 完成端到端验收，覆盖 Agent 专区、构建产物、子路径 URL、manifest 哈希、页面操作区、Skill 行为、组件 catalog 和本地 MCP 的对应能力，并记录证据。
7. 汇总方案和 fork 验收证据，提交同事评审。评审意见导致的调整先回到 fork 验证。
8. 评审通过后进入 5C-Production：确定正式 URL、稳定入口和目标客户端支持范围，替换环境配置并验证正式资源；最后处理生产发布自动化。

每一阶段交接记录：分支/基线 commit、变更文件、执行命令及结果、产物样例、未解决警告、下一阶段依赖。若发现方案与现有发布链路冲突，先更新此文档及验收项，再实现相应变化。

任何后续范围变化都应先更新本文，再修改实现。

### 当前交接记录（2026-10-23）

- 分支与基线：`docs/agent-friendly-docs-plan`，基线 `db8beefe57cc235b872d49e2b955eb2a1d3fc298`。
- 阶段 1 检视：目录扫描得到 55 个正式页面、179 个 Demo，0 个 Error；129 个渐进式元数据 Warning 和 104 个 Info 已按阶段 1 规则保留。复查并修正了相对链接越界判断，只有规范化后真正越出 `docs/src` 的链接才告警；未修改 Markdown 内容。
- 阶段 2 实现：`docs/scripts/agent-docs.mjs` 从同一 catalog 生成 raw Markdown、Demo 源码、`llms.txt`、`llms-full.txt`、`sitemap.md/xml`、`agent/pages.json`、`agent/demos.json` 和 `agent/manifest.json`；本地根构建入口 `scripts/build-docs.js` 已接入。PR CI 与 tag 发布工作流按范围决定暂不修改，留待最终自动化阶段。
- 已验证：`pnpm build:docs --nocomponents` 成功；`pnpm -F docs agent:check` 成功；Prettier、Node 语法检查和 `git diff --check` 成功。静态服务器读取 raw、JSON、manifest 与 llms 文件均返回 HTTP 200；根路径、`/tiny-robot/alpha/`、`/tiny-robot/latest/` 的 URL 组合已检查。
- 未解决警告：元数据 Warning/Info 仍按阶段 1 的渐进策略保留；VitePress 依赖的外部化提示和大 chunk 提示不阻断构建。阶段 3 需按页面类型补齐必填元数据并建立 allowlist。
- 下一阶段依赖：进入阶段 3 前继续使用阶段 2 生成的 schema 和 catalog，不另建页面或 Demo 清单；优先处理已确认的元数据缺口与链接质量。

### 阶段 3 交接记录（2026-10-23）

- 范围：仅更新 `docs/src` 元数据和现有 Demo 的显式依赖声明，不改发布工作流，也不移动或复制 Demo 源文件。
- 页面元数据：55 个正式页面均补齐 `title`、`kind`、`description` 和 `status`；适用页面补充 `package` 与检索关键词。三个已弃用/兼容页面按正文标为 `deprecated`，三个仅跳转到版本归档的迁移入口标为 `archived`。
- Demo 依赖：补齐 Sender 按住说话覆盖层、DeepSeek/Gemini 示例图标和图标目录 Demo 的已存在源码依赖声明；源码位置未变。
- 验证：`pnpm -F docs agent:catalog` 与 `pnpm -F docs agent:check` 均通过；目录为 55 页、179 个 Demo、0 Error、0 Warning、0 Info。完整文档构建待最终验证。
- 后续：发布自动化工作流仍按用户决定延后；后续阶段沿用现有 catalog/schema，不维护第二份页面或 Demo 清单。

### 阶段 5 准备记录（2026-10-24）

- 历史安排曾将 5B 定为稳定在线入口与发布自动化；该顺序已被后续“先在维护者 fork 完整验收、同事评审通过后再确定正式入口”的决策取代。当前阶段 5 拆为 5A（Skill 内容收敛与版本契约）、5B（Agent 文档入口）、5C-Fork（评审前 fork 验收）和 5C-Production（评审后的正式环境切换与发布收尾）。
- manifest 新增 `docsVersion`，取值与现有 `contentVersion` 相同，后者暂作兼容别名；`schemaVersion` 继续独立表示数据契约版本。
- 上游只读盘点：`skills/tiny-robot-skill` 共 155 个文件，包括 16 个组件 Markdown、122 个 Demo、1 个完整示例、3 个 guide、3 个 migration、4 个 tools、4 个 rules、`SKILL.md` 和插件元数据。组件文档、Demo、guide、migration、tools 属于 TinyRobot 文档内容副本；4 个 rules 文件是 Skill 的行为路由和代码生成约束，应保留并改为从在线索引/raw 文档按需取 API 与示例。
- 版本问题已确认：`SKILL.md` metadata 的 Skill 版本为 `1.0.0`，`.claude-plugin/plugin.json` 为 `0.1.0`；两者需要统一。现有手动同步工作流从 TinyRobot `develop` 覆盖 demos、components、examples、guide、migration、tools，但没有同步文档版本字段，也没有覆盖 rules 或 Skill 元数据；因此它目前产出的是文档快照，不能证明快照与 manifest 对应。
- 推荐事实源边界：agent-skills 仓库维护 `SKILL.md`、rules 和安装/插件元数据；TinyRobot 仓库维护组件文档、Demo 和 Agent 静态产物。后续只在需要离线使用时打包一份带 `docsVersion` 的生成快照，在线安装则通过 manifest/pages/raw 获取当前版本；不要让两边都手工编辑同一份组件说明或 Demo。
- 目标 Skill 安装格式已经是 `SKILL.md`，插件元数据提供仓库主页；尚未验证具体客户端是否支持 URL discovery。5A 的最小实施清单：精简 Skill 索引为查找规则和按需读取策略、校正 `SKILL.md` 与插件版本、在离线快照元数据写入 `docsVersion`/来源 commit、为在线资源 URL 明确版本化解析方式，并验证首批客户端安装路径。具体同步改造留到自动化阶段，不改当前工作流。
- 5A 本地草案进展：在 `D:\Projects\Work\agent-skills` 的源码快照中改写了 `SKILL.md` 与 4 个 rules，使其通过页面索引和 raw Markdown 查找文档，并将 Skill 与插件版本统一为 `1.1.0`；版本相等检查和文本/diff 空白检查通过。由于源码快照获取未形成可用 Git checkout，当前这些草案没有可审阅的 Git diff。删除本地重复目录的递归操作被执行策略拒绝，故 16 个组件 Markdown、122 个 Demo 等副本仍然存在；不能视为 Skill 已完成瘦身。未改同步工作流、未提交或推送。
- 验证：本次只做静态语法检查与 diff 检查，未运行完整 docs 构建；发布 URL 与在线稳定入口尚未验证。

### 阶段 5A 本地验收记录（2026-10-24）

- `agent-skills` 仓库已恢复为正常 Git checkout（`main`）；将 Skill 包收敛为 `SKILL.md`、4 个 rules 和 Claude 插件元数据，移除本地重复的 16 个组件 Markdown、122 个 Demo、1 个示例、3 个指南、3 个迁移页和 4 个工具文档，共删除 149 个文档/示例副本。
- Skill 版本统一为 `1.1.0`：`SKILL.md` frontmatter、Skill plugin 元数据和根 marketplace 的 `tiny-robot-skill` entry 对齐。Skill 不含离线文档快照，因此从所选 docs manifest 动态读取 `docsVersion`/`schemaVersion`，不固定某个部署 tag。
- 用已部署 beta 执行索引链路验证：manifest、pages、demos、Bubble raw Markdown、Bubble 页面与 `demos/bubble/basic.vue` 均 HTTP 200；manifest 的 `publicBaseUrl` 与 beta base 一致，`docsVersion=beta`、`schemaVersion=0.1.0`；raw 和 demo 的 SHA-256 均匹配 manifest artifact hashes。
- 对正式人类文档入口做了边界检查：`https://docs.opentiny.design/tiny-robot/` 会 301 到 guide 页面，而自动读取根目录 manifest 返回 403。这是评审通过后需要处理的生产入口事项，不构成 fork beta 验收或同事评审的前置条件。
- 根据实测 schema 修正 Skill：`pages.json` 的 `rawUrl` 是绝对 URL，`rawPath` 是含部署前缀的 origin-relative 路径；Demo 资源位于 `demos.json` 中按 `pageId` 对应的记录，`files[].url` 是绝对 URL，而 `files[].path` 是相对文件路径。
- 未修改 agent-skills 的同步工作流。现有手动同步工作流会重新复制文档/Demo；在最终自动化阶段改造前，不要对该 Skill 运行该同步工作流，否则会重新产生重复副本。
- 本地静态验证：两个版本 JSON 一致；搜索未发现 Skill/rules 继续依赖已移除的本地 `components/`、`demos/`、`guide/`、`migration/`、`tools/` 目录；`git diff --check` 通过。未安装外部 Agent 客户端验证插件安装体验，亦未提交或推送 `agent-skills` 改动。

### 评审前 fork 验收顺序调整（2026-10-24）

- 验收环境明确为维护者 fork 的 beta URL。评审前不要求确认正式站点 URL、稳定入口或生产凭据；正式环境只作为评审通过后的配置替换与验证目标。
- 独立 Skill 成功路径复测通过：按 beta manifest、pages/demos 索引、Bubble raw 与 Demo 查找；未编造 `sparkleMode`；输出包含必要的 `TrBubble` 导入。缺失 manifest 的失败路径返回 HTTP 404 后停止，没有回退到其他版本或本地副本。
- Bubble raw Markdown 和 `demos/bubble/list.vue` 的实际 SHA-256 与 beta manifest 的 `artifactHashes` 一致。上述 Skill 测试与哈希核验均只读，未修改项目文件。
- `agent-skills` 的阶段 5A 收敛内容已在本地提交 `2a262fc`，仅本地提交、未推送；本仓库计划文档尚未提交这些记录。
- 当前下一步：先实施阶段 5B Agent 文档入口，再做阶段 6 轻量组件 API catalog；然后用 fork 手动 dispatch 跑完整部署和 Agent 验收，准备同事评审。ChatGPT/Claude 入口、正式环境配置和生产发布自动化不作为当前 fork 主线的阻塞项；MCP 页面先说明规划状态，服务本身仍属阶段 7。

### 阶段 5B 方案补充（2026-10-24）

- Agent 专区按 Nuxt UI 的信息架构采用 `Agents` 导航分组和三个独立路由页面，不把三篇长内容折叠到单页面板，也不增加重复内容的总览 `index.md`。
- 计划页面文件名统一为 `docs/src/agents/llms-txt.md`、`docs/src/agents/skills.md`、`docs/src/agents/mcp-server.md`；分别承载 LLMs 产物说明、Skill 使用说明和 MCP 服务状态/边界说明。
- 三页通过侧栏中的 Agent 索引访问，不在页面正文中提供互相联动的导航；fork beta 验收需覆盖直接访问、刷新、浏览器前进/后退、窄屏可用性及所有产物链接的子路径解析。
- 此记录描述实施结构和验收标准；阶段 5B 实际实现状态见下方“阶段 5B 本地实现记录”。

### 阶段 5B 本地实现记录（2026-10-24）

- 在 VitePress 侧栏加入 `Agents` 索引，三个页面为 `/agents/llms-txt`、`/agents/skills`、`/agents/mcp-server`；页面通过侧栏普通路由链接访问，不使用页面头部共享导航或正文内的跨页链接。
- 三页正文已根据读者反馈重组为面向开发者的使用说明：LLMs 页面介绍两份文本资料的用途、选择方式及如何提供给 AI 工具；Skills 页面介绍编码助手可协助的任务、Skills CLI 与 Codex 安装方式、使用示例和建议；MCP 页面明确提示服务暂未提供，并介绍计划支持的查询场景及其与应用内 MCP 功能的区别。页面正文不展示内部版本、索引、manifest 或构建细节。
- Agent 页面导航只使用 VitePress 侧栏中的普通路由索引，页面间不提供重复的联动导航。LLMs 页面资源区仅展示 `llms.txt` 与 `llms-full.txt`。
- 本地开发时两个 TXT 文件曾因 VitePress 开发服务器未暴露生成文件而返回 404；已在开发中间件增加读取，并实测根路径及 `/tiny-robot/beta/` 子路径均返回 HTTP 200。
- Agent 页面目录归类为 `agent-doc`；页面、raw Markdown、LLMs 目录和 sitemap 使用现有统一生成链路，不新增重复内容事实源。
- 验证：`pnpm -F docs agent:catalog`、`agent:check` 和 `git diff --check` 均通过，目录为 58 个页面、179 个 Demo，0 errors/warnings/infos。此前已有带 fork 子路径的构建记录；用户已完成人工浏览器验收并确认页面没有问题。近期正文调整后尚未完成完整站点集成构建，也未部署 fork beta。
- 阶段 5B 本地实现、正文修订和本地浏览器验收均已完成；fork beta 的完整部署验收放在本地 MCP 阶段完成之后。

### 阶段 6A 实施记录（2026-10-24）

- 目标：生成轻量 `agent/components.json`，记录组件包的公开 Vue 组件导出、包名、关联文档页、文档状态和 Demo；本阶段不抽取 Props、Events、Slots、Methods 或 Types。
- 来源与校验：使用 TypeScript Compiler API 读取组件包根入口的真实模块导出；文档 frontmatter `exports` 声明页面映射。源码中发现 41 个公开 `Tr*` Vue 组件导出，其中 39 个属于独立文档目标；`TrConversations` 与 `TrIconButton` 是内置工具组件，按用户确认从组件文档 catalog 排除，不要求补文档，也不产生缺文档警告。
- QuickAssist 文档说明的是 Vanilla 能力，并无 `Tr*` Vue 导出，不纳入 Vue 组件 catalog。
- 产物：`docs/dist/agent/components.json` 已生成并由 `agent/manifest.json` 记录 SHA-256。独立验证确认 JSON 有 39 条记录，均有关联文档；所有记录的页面、状态和 Demo 源文件有效，产物哈希匹配 manifest。
- 验证：`pnpm -F docs agent:catalog`、`pnpm -F docs agent:check` 和 `pnpm -F docs agent:build` 通过；共生成 321 个 Agent 静态产物，catalog 为 58 页、179 个 Demo、0 Error、0 Warning。`docs/scripts/agent-docs.mjs` 的 Prettier 检查和 `git diff --check` 通过。
- 完整集成构建：尝试运行 `pnpm build:docs --nocomponents`；Agent catalog 阶段通过，但命令停留在 Playground 的 Vite build 阶段，未得到退出结果，因此本次不能记为完整站点构建通过。Agent 产物自身的 build 已独立成功。
- 阶段结论：6A 首版实现及静态 Agent 产物验证完成；内置工具组件不作为补文档任务。当前主线下一步是阶段 7 本地 MCP Server；之后再统一做 fork beta 端到端验收并准备同事评审。

## 14. 参考链接

### 设计参考

- [Nuxt UI MCP Server 文档](https://ui.nuxt.com/docs/getting-started/ai/mcp)：Agents 导航下的 MCP 页面信息架构参考。
- [Nuxt UI LLMs.txt 文档](https://ui.nuxt.com/docs/getting-started/ai/llms-txt)：LLMs.txt 说明页与产物链接展示参考。
- [Nuxt UI Skills 文档](https://ui.nuxt.com/docs/getting-started/ai/skills)：Skill 说明页与安装/查阅说明参考。
- [Nuxt UI 文档](https://ui.nuxt.com/)：页面内 AI 操作与整体文档体验参考。
- [llms.txt 规范说明](https://llmstxt.org/)：`llms.txt` 与全文文档索引的约定。
- [Agent Skills Specification](https://agentskills.io/specification)：Skill 文件格式和目录约定。
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/)：MCP Server、工具、资源和传输协议。
- [GitHub Pages 文档](https://docs.github.com/en/pages)：静态托管能力与发布边界。
- [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)：CI 构建和部署方式。
- [Sitemaps XML 格式](https://www.sitemaps.org/protocol.html)：标准 `sitemap.xml` 格式。

### 实现依据

- [VitePress 扩展默认主题](https://vitepress.dev/guide/extending-default-theme)：Layout 插槽和正文操作区。
- [VitePress Frontmatter](https://vitepress.dev/guide/frontmatter)：页面元数据读取和配置。
- [VitePress 静态部署](https://vitepress.dev/guide/deploy)：静态构建与子路径部署。
- [JSON Schema](https://json-schema.org/draft/2020-12)：静态索引和 MCP catalog 的数据契约校验。
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)：组件公开类型提取参考。

### 本仓库事实源

- [组件文档规范](component-documentation-standard.md)：页面结构、API 和 Demo 约定。
- [VitePress 配置](.vitepress/config.mts)：`srcDir`、`outDir`、base 和 Markdown 插件。
- [VitePress 主题配置](.vitepress/themeConfig.ts)：导航与侧边栏来源。
- [文档构建脚本](../scripts/build-docs.js)：仓库级构建入口。
- [PR 构建工作流](../.github/workflows/pr-ci-build.yml)：当前 PR 文档构建步骤。
- [Tag 发布工作流](../.github/workflows/auto-publish.yml)：版本化文档部署路径。
- [手动发布工作流](../.github/workflows/dispatch-publish.yml)：按发布 tag 部署文档。
- [tiny-robot-skill](https://github.com/opentiny/agent-skills/tree/main/skills/tiny-robot-skill)：现有独立 Skill 的收敛参考。
