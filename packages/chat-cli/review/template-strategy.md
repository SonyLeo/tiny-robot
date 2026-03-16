# Chat CLI Template Strategy Review

> 面向 `packages/chat-cli` 的模板体系调研与实施方案。  
> 目标：基于 `packages/chat` 的已有能力，梳理下一阶段 `chat-cli` 应支持的模板矩阵，并给出可执行的落地路径。

## 1. 文档目标

本文主要回答四个问题：

1. 业界成熟的 AI Chat CLI / starter 如何设计模板体系
2. 当前 `packages/chat` 与 `packages/chat-cli` 已具备哪些模板扩展基础
3. 下一阶段最值得优先支持哪些模板
4. 这些模板应如何实现，才能避免重复复制和维护失控

## 2. 业界调研结论

### 2.1 参考对象

本次主要参考这些业界实现：

- `shadcn` CLI：`init + add + registry`
  - 强调 registry、组件条目、增量能力，而不是无限增加顶层模板
  - 参考：<https://ui.shadcn.com/docs/cli>
- `create-vue`
  - 强调“少量模板 + 清晰 flags + 稳定生成路径”
  - 参考：<https://github.com/vuejs/create-vue>
- `create-next-app`
  - 强调模板初始化和 flags 组合，而不是模板爆炸
  - 参考：<https://nextjs.org/docs/app/api-reference/cli/create-next-app>
- Vercel AI SDK / Chatbot / RAG 模板
  - 把基础聊天、RAG、特定 agent 场景明确分层
  - 参考：<https://vercel.com/academy/ai-sdk/basic-chatbot>
  - 参考：<https://vercel.com/templates/next.js/chatbot>
  - 参考：<https://vercel.com/templates/next.js/ai-sdk-rag>
- MCP 官方文档
  - 强调 tools / prompts / resources 是能力原语，UI 只是消费层
  - 参考：<https://modelcontextprotocol.io/docs/getting-started/intro>

### 2.2 可提炼的最佳实践

从这些实现里，可以提炼出几个稳定结论：

1. 顶层模板不宜过多。
   模板应该按“架构场景”分类，而不是按“业务文案”分类。

2. 模板体系应先有 registry，再扩展模板数量。
   没有 registry 的多模板，最终都会退化成 CLI 入口里的 `if/else` 集合。

3. 高价值能力应逐步走向 `base + feature packs + add`。
   顶层模板负责场景入口，细粒度能力负责后续装配。

4. 安全默认值应内建进模板。
   AI chat 脚手架不应默认生成“浏览器直连 API Key”的项目。

5. 场景模板要晚于底层契约。
   比如 `docs-chat` 必须晚于 retrieval contract，`agent-mcp` 应晚于 MCP feature contract。

## 3. 现状评估

### 3.1 当前 `chat-cli` 已完成的基础

当前 `packages/chat-cli` 已经完成的基础能力包括：

- 默认模板 `basic`
- 安全默认值：server proxy 示例优先
- `chat.config.ts -> createChatAdapterFromConfig() -> createPresetChatProps()` 主链路
- 基础 CLI flags
- 模板变量注入
- README / package manager 命令注入
- release helpers
- scaffold / release / smoke 测试

这意味着 `chat-cli` 已经是一个可靠的基础脚手架，但还不是成熟的模板平台。

### 3.2 当前最大的结构性问题

当前最需要正视的问题不是“模板还少”，而是“模板体系还没成型”。

核心问题有四个：

1. CLI 入口仍是硬编码模板模式
2. 模板目录治理还不够严格
3. `basic` 仍承担过多角色
4. 后续模板扩展顺序尚未被清晰约束

### 3.3 与 `packages/chat` 的关系

`chat-cli` 的上限取决于 `packages/chat` 的公共契约成熟度。

目前 chat 侧已具备的基础包括：

- `config -> adapter -> preset` 主链路
- 黑盒 `TrChat`
- 白盒 `TrChat.Root + TrChat.Layout + ...`
- 模型切换、MCP runtime、retry、optimistic、docs variant 等基础能力

但 chat 侧下一轮仍在推进：

- feature registry
- attachments / senderActions / suggestions
- MCP config 化
- layout formalization

因此，`chat-cli` 的模板扩展必须与 chat 侧公共契约同向演进，而不能跑到它前面。

## 4. 模板设计原则

建议采用以下原则：

1. 对用户暴露的顶层模板应该少而稳。
2. 模板应按架构场景组织，而不是按行业文案组织。
3. 新模板必须尽量建立在 `packages/chat` 的现有公共能力之上。
4. 模板目录要视作可发布资产，必须有卫生规则。
5. `template registry` 是下一阶段的前置条件，不是普通优化项。
6. `basic` 不应成为长期的全模板 fork 母版。
7. 长期目标应是 `base + feature packs + add`。

## 5. 推荐模板矩阵

### T1 `basic`

定位：

- 默认模板
- 新手起步模板
- 安全默认值与 adapter/config 示例模板

价值：

- 最低上手门槛
- 最适合承载当前稳定能力
- 作为后续所有模板的能力基线参考

注意：

- `basic` 应逐步拆成 `base runtime skeleton + basic preset`
- 不应继续无限承载所有未来模板的公共职责

### T2 `agent-mcp`

定位：

- 第二个正式模板
- 面向 agent、copilot、workflow assistant、工具协作场景

为什么优先：

- 它最接近 chat 当前已有稳定能力
- 价值感知强，能明显体现 `chat-cli` 的场景扩展能力
- 比 `docs-chat` 更少依赖额外契约

实现前提：

- chat 侧最小 MCP feature config 明确
- CLI 已有 template registry

结论：

- 推荐作为下一阶段最优先落地的第二模板

### T3 `docs-chat`

定位：

- 阅读态 / 检索问答场景模板

为什么暂缓：

- `docs` 样式本身不是问题
- 真正的问题是它天然依赖 retrieval contract
- 当前 `chat-cli` 还没有统一 retrieval route / service contract

结论：

- 适合作为 `Phase C` 候选
- 当前不建议和 `agent-mcp` 作为同一批次稳定模板落地

### T4 `assistant-workbench`

定位：

- 更工程化的白盒工作台模板

为什么放后：

- 它依赖 layout formalization
- 依赖多个 feature 契约成熟
- 依赖 CLI 已具备模板组合能力

结论：

- 适合作为 `v2+` 或更后阶段模板

## 6. 推荐的模板体系结构

长期建议采用：

```text
templates/
  base/
  presets/
    basic/
    agent-mcp/
    docs-chat/
  features/
    mcp/
    attachments/
    sender-actions/
    suggestions/
```

这种结构的核心好处：

- base 与场景模板职责分离
- feature 可以跨模板复用
- CLI 可以从 `init` 演进到 `init + add`
- 模板治理更接近 registry-first 模式

但需要明确迁移边界：

- `v1` 可以容忍少量完整模板并存
- `v2` 开始，新增模板原则上必须建立在 `base + registry + feature composition` 上

## 7. 前置整理：模板目录标准化

这一步应该先做，否则后面的 registry / multi-template 设计会建立在脏模板之上。

建议立即补充：

- 模板目录不得包含 `node_modules`
- 模板目录不得包含 `dist`
- 模板目录不得残留未替换占位符
- 模板 README / config / server example 关键变量必须一致
- 这部分应接入 `validate-templates.mjs`
- 这部分应升级为 release 阻塞规则

当前仓库已经出现了这类问题：模板源目录本身可能残留 `node_modules`。  
虽然 `scaffold.ts` 复制时会跳过它，但这仍说明模板源目录治理还不够严格。

## 8. 分阶段实施方案

### Phase A：Template Registry Foundation

目标：

- 让 CLI 从“复制单模板目录”演进为“理解模板定义并生成模板”

说明：

- 这一阶段应视为 P0 前提，而不是普通优化项
- 在 registry 真正落地前，不建议继续新增正式模板

需要做的事情：

- 明确最小 registry schema
  - `id`
  - `label`
  - `status`
  - `templateDir`
  - `supportedProviders`
  - `requiredChatFeatures`
  - `postScaffoldSteps`
- 新增 template registry 类型与元数据
- CLI 主入口消费 registry，而不是继续硬编码模板
- 统一模板标题、说明、后续步骤、推荐命令来源
- 模板卫生校验接入 `validate-templates.mjs`
- 增加 template hygiene tests

验收标准：

- CLI 帮助输出、交互式模板列表、`--template` 校验全部来源于 registry
- 移除旧的 “coming soon” 模板占位入口
- 所有正式模板必须支持非交互生成
- 模板卫生问题会阻塞 `prepare:templates`

### Phase B：`agent-mcp`

目标：

- 推出第一个高价值的第二模板

需要做的事情：

- 新增 `agent-mcp` 模板目录
- 接入 MCP bridge example
- 提供 MCP servers 数据示例
- README 解释 demo bridge 与真实 server 的边界
- 补齐 scaffold / smoke / hygiene 测试

前置条件：

- chat 侧最小 MCP feature config 已明确
- CLI 已接入 registry

### Phase C：`docs-chat`

目标：

- 在 retrieval contract 明确后，再评估 docs 模板是否进入稳定模板集

需要做的事情：

- 定义 retrieval route / service contract
- 明确 source ingestion / search / answer 的最小边界
- 若 contract 成熟，再新增 `docs-chat` 模板目录
- 补齐 README / smoke / scaffold 测试

说明：

- 这一阶段不建议提前到 `agent-mcp` 之前

### Phase D：Feature Packs / `add`

目标：

- 从多模板复制，演进到 `base + feature packs`

需要做的事情：

- 抽离 `base`
- 设计 feature pack 目录
- 设计 `add feature` / `migrate` 命令
- 让 `basic` 转型为 `base + basic preset`

### Phase E：`assistant-workbench`

目标：

- 在前面几轮能力稳定后，再评估复杂工程模板

说明：

- 这一阶段不建议提前

## 9. 测试方案

当前已有的测试基线已经覆盖：

- scaffold 逻辑
- release helpers
- smoke build
- CLI 主入口行为

下一阶段建议拆成三层：

1. registry correctness tests
2. generated template tests
3. template hygiene tests

建议补充的测试包括：

- `registry.spec.ts`
- `template-basic.spec.ts`
- `template-agent-mcp.spec.ts`
- `template-docs-chat.spec.ts`
- `template-hygiene.spec.ts`

其中 template hygiene tests 应重点覆盖：

- 模板目录不得包含 `node_modules`
- 模板目录不得包含 `dist`
- 不得残留未替换占位符
- README / config / server example 的关键变量必须一致
- `prepare:templates` 失败时能够阻断发布

## 10. 实施优先级与交付边界

推荐顺序：

1. 先做 template registry 与模板卫生治理
2. 再做 `agent-mcp`
3. 视 retrieval contract 成熟度决定 `docs-chat`
4. 之后再做 `add / feature packs`
5. `assistant-workbench` 放到更后阶段

交付边界建议：

- `v1`
  - `basic`
  - `agent-mcp`
- `v1.5`
  - 视 retrieval contract 决定是否纳入 `docs-chat`
- `v2`
  - `base + feature packs`
  - `add`
  - `assistant-workbench`

## 11. 最终建议

如果只给一个最重要的建议，就是：

> 不要先增加模板数量，先把模板体系做成 registry。

更具体地说：

1. `template registry` 是下一轮的 P0 前提
2. 当前最值得做的第二模板是 `agent-mcp`
3. `docs-chat` 应等待 retrieval contract
4. `assistant-workbench` 应等待 feature registry 和 layout 成熟
5. 模板卫生问题应升级为 release 阻塞规则
6. 最终目标是 `base + feature packs + add`
