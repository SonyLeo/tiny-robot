# Chat CLI Review 02

> 该文档用于承接 [chat-cli-design.md](/d:/OpenTinyRepository/tiny-robot/docs/chat-cli-design.md) 的执行结论。  
> 它不再回顾上一轮“基础脚手架安全化”改造，而是聚焦 `packages/chat-cli` 下一轮模板平台化阶段。  
> 对应进度追踪见 [progress.md](/d:/OpenTinyRepository/tiny-robot/packages/chat-cli/progress.md)。

## 1. 当前判断

当前 `packages/chat-cli` 已经完成了“可靠基础脚手架”这一阶段：

- 默认输出已切换到 `server proxy` 安全模型
- `chat.config.ts -> createChatAdapterFromConfig() -> createPresetChatProps()` 主链路已打通
- CLI 已支持基础 flags、模板变量注入、README 命令注入、release helpers
- 已具备 scaffold / release / smoke 三层测试基线

但它还没有进入“模板平台”阶段。  
当前最大的结构性问题不是“模板不够多”，而是：

1. 模板入口仍是硬编码的
2. 模板目录治理还不够严格
3. `agent-mcp / docs-chat / assistant-workbench` 的扩展顺序尚未被真正代码结构承接

因此，下一轮工作的核心不是继续往 CLI 里加 `if/else` 模板名，而是先把模板体系本身做对。

## 2. 核心结论

### 2.1 Registry 必须先落地

`template registry` 不是“将来优化项”，而是下一阶段的前置条件。

如果 registry 不先落地，后续每新增一个模板，都会继续堆在 CLI 入口的：

- `supportedTemplates`
- 交互式模板列表
- help 文案
- README 注入逻辑
- 后续 flags 判定

这会让 `chat-cli` 很快重新退化成“单模板复制器 + 条件分支集合”。

### 2.2 `agent-mcp` 是最优先的第二模板

相对于 `docs-chat` 和 `assistant-workbench`，`agent-mcp` 更接近 `packages/chat` 当前已经稳定的能力：

- MCP 运行时基础链路已存在
- MCP bridge / panel / manager 已有代码基础
- 它能直接体现 `chat-cli` 不是“只会生成基础聊天页”的价值

但它不应继续靠模板内部手工 wiring 存活。  
更合理的方式是：在 chat 侧 MCP feature config 最小契约明确后，让 `agent-mcp` 成为 registry 支持下的正式模板。

### 2.3 `docs-chat` 应下调为 Phase C

`docs-chat` 在产品感知上很诱人，但它天然依赖 retrieval contract。

当前 `chat-cli` 已经稳定的只是：

- `chat.config.ts`
- `lib/chat.ts`
- `server/chat-proxy.example.ts`

还没有一个统一的：

- retrieval route contract
- retrieval service contract
- docs/source ingestion contract

所以现在直接把 `docs-chat` 当作第一批稳定模板，会导致模板先于契约成熟。

### 2.4 模板源目录治理必须升级为 release 阻塞规则

模板目录现在已经暴露出真实问题：模板源中可能残留 `node_modules` 等脏目录。

虽然 `scaffold.ts` 复制时会跳过这些目录，但这说明：

- 模板源本身还没有被当成“可发布资产”来治理
- release helpers 还没有真正承担模板卫生守门职责

这块不能只停留在文档提醒，应直接升级为：

- release 阻塞规则
- 独立测试基线
- CI / 本地验证入口

### 2.5 长期方向应是 `base + feature packs + add`

当前阶段可以容忍少量完整模板：

- `basic`
- `agent-mcp`

但从下一阶段开始，必须明确一个边界：

- `v1` 可以容忍少量完整模板并存
- `v2` 开始，新增模板原则上应建立在 `base + registry + feature composition` 上

否则 `basic` 会逐渐变成所有模板的 fork 母版，维护成本会快速失控。

## 3. 下一轮实施重点

### 3.1 Phase A - Template Registry Foundation

目标：

- 把模板从硬编码入口升级为 registry 驱动
- 建立模板元数据、能力映射、模板治理规则

建议改动：

- 明确最小 registry schema：
  - `id`
  - `label`
  - `status`
  - `templateDir`
  - `supportedProviders`
  - `requiredChatFeatures`
  - `postScaffoldSteps`
- 新增 registry 类型定义
- 新增 template metadata / feature metadata
- CLI 入口改为消费 registry
- 模板目录卫生检查接入 `validate-templates.mjs`
- 增加 template hygiene tests

验收标准：

- `basic` 不再通过 CLI 入口硬编码声明
- CLI 交互、`--template`、帮助输出、README 注入都来源于 registry
- 旧的 “coming soon” 模板占位入口被清理
- 所有正式模板都支持非交互生成
- 模板目录出现 `node_modules` / `dist` / 未替换占位符会直接校验失败

### 3.2 Phase B - Agent MCP Template

目标：

- 正式引入第二个高价值模板 `agent-mcp`

建议改动：

- 增加 `agent-mcp` 模板目录
- 接入 MCP bridge 示例、配置示例、README
- 把模板纳入 registry
- 补充 scaffold / smoke / hygiene 测试

依赖：

- chat 侧最小 MCP feature config 已明确

### 3.3 Phase C - Retrieval Contract + Docs Chat

目标：

- 先定义 retrieval contract，再决定是否把 `docs-chat` 升为正式模板

建议改动：

- 定义最小 retrieval route / service contract
- 明确 `docs-chat` 的 server example、config、README
- 验证 `messageListVariant = 'docs'` 是否足以支撑模板定位

### 3.4 Phase D - Base + Feature Packs

目标：

- 从“多模板复制”过渡到“基础模板 + 可组合能力”

建议改动：

- 抽离 `base runtime skeleton`
- 定义 feature pack 目录与合成规则
- 设计 `add feature` 子命令或等价机制

### 3.5 Phase E - Assistant Workbench

目标：

- 评估并落地更复杂的工程型模板

说明：

这一阶段不建议提前。  
它依赖：

- chat 侧 layout formalization
- 多个 feature 契约稳定
- CLI 具备模板组合能力

## 4. 实施顺序建议

推荐顺序如下：

1. 先做 registry foundation
2. 再做模板源目录治理
3. 然后落地 `agent-mcp`
4. 再定义 retrieval contract，评估 `docs-chat`
5. 最后推进 feature packs / `add` / `assistant-workbench`

## 5. 当前不建议优先做的事情

- 不建议现在继续往 CLI 入口里加更多“coming soon”模板名
- 不建议把 `docs-chat` 直接和 `agent-mcp` 作为同一优先级落地
- 不建议让 `basic` 继续演变成所有模板的复制母版
- 不建议在 registry 之前先做 `assistant-workbench`

## 6. 结论

`packages/chat-cli` 的上一轮工作已经完成了“可靠脚手架”的目标。  
下一轮的关键不再是“能不能多生成几个模板”，而是“能不能把模板体系做成可扩展、可治理、可验证的平台”。

因此，当前最正确的下一步是：

- 先做 `Template Registry Foundation`
- 把模板治理升级为正式规则
- 在此基础上优先落地 `agent-mcp`

如果这一步做对了，后续的 `docs-chat`、`feature packs`、`assistant-workbench` 才会有稳定基础。
