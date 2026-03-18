# Chat CLI Review 02

> `packages/chat-cli` 下一阶段执行结论文档。
> 架构设计见 [../../docs/chat-cli-design.md](../../docs/chat-cli-design.md)。
> 模板策略见 [review/template-strategy.md](./review/template-strategy.md)。
> 实时状态见 [progress.md](./progress.md)。

---

## 1. 当前判断

当前 `packages/chat-cli` 已经完成了“可靠基础脚手架”的第一阶段：

- 默认输出已切换到 server proxy 安全模型
- `chat.config.ts -> createChatAdapterFromConfig() -> createPresetChatProps()` 主链路已打通
- `packages/chat` 已开始把 `chat-cli` 可正式消费的能力面固化为代码契约：`CHAT_CLI_CONSUMABLE_FEATURE_KEYS`、preset prop keys、preset slice keys、`createChatCliCapabilitySurface()`
- CLI 已支持基础 flags、模板变量注入、README 命令注入、release helpers
- 已具备 scaffold / release / smoke 三层测试基线

但它还没有进入“模板平台”阶段。

当前最关键的结构性问题不是“模板数量太少”，而是：

1. 模板入口仍是硬编码的
2. 交互菜单里仍有 `coming soon` dead-end 选项
3. 模板目录治理还没有真正进入 release gate
4. 第二模板和后续模板的引入顺序还没有被代码结构真正承接

---

## 2. 核心结论

### 2.1 Registry 必须先落地

`template registry` 不是“以后再优化”，而是下一阶段的前置条件。

如果 registry 不先落地，后续每增加一个模板，都会继续堆在：

- CLI 入口
- 帮助文案
- 交互式模板列表
- 模板约束判断
- README 注入逻辑

### 2.2 模板卫生必须升级为正式阻塞规则

当前模板源目录已经暴露出真实卫生问题，例如模板目录中残留 `node_modules`。

虽然 scaffold 复制时会跳过这些目录，但这仍说明模板源还没有被当成“可发布资产”治理。

因此这部分不能只停留在提醒，而应升级为：

- `prepare:templates` 阻塞规则
- 独立测试基线
- 清晰的模板目录卫生约束

### 2.3 `agent-mcp` 是最优先的第二模板

相对于 `docs-chat` 和 `assistant-workbench`，`agent-mcp` 更接近当前已经具备基础的能力面：

- chat 侧已有 MCP runtime 基础
- 价值感知强
- 更容易证明 CLI 已经从“单模板脚手架”进入“场景模板脚手架”

但它不应继续依赖模板内部手工 wiring，而应建立在 chat 侧最小 MCP contract 明确之后。

### 2.4 `docs-chat` 应等待 retrieval contract

`docs-chat` 的难点不是样式，而是 retrieval contract。

如果 retrieval route、service contract 和 docs 场景边界还没有明确，就不应把 `docs-chat` 当成第一批稳定模板。

### 2.5 长期方向应是 `base + feature packs + add`

当前阶段可以容忍少量完整模板并存。

但从下一阶段开始，必须明确：

- `v1` 可以容忍少量完整模板
- `v2` 开始，新增模板应尽量建立在 `base + registry + feature composition` 上

否则 `basic` 会持续演变成所有模板的 fork 母版。

---

## 3. 下一轮实施重点

### Phase A: Template Registry Foundation + Hygiene

目标：

- 把模板从硬编码入口升级为 registry 驱动
- 把模板目录治理升级为正式质量门槛

建议改动：

- 定义最小 template registry schema
- 新增 registry 类型与元数据
- CLI 入口消费 registry
- 移除旧的 `coming soon` 模板占位入口
- 升级 `validate-templates.mjs`
- 增加 template hygiene tests

验收标准：

- `basic` 不再只靠 CLI 入口硬编码声明
- `--template`、交互选择、帮助输出统一来源于 registry
- 模板目录中的 `node_modules` / `dist` / 未替换占位符会直接校验失败

### Phase B: Agent MCP Template

目标：

- 正式引入第二个高价值模板 `agent-mcp`

建议改动：

- 增加 `agent-mcp` 模板目录
- 接入 MCP bridge 示例、配置示例、README
- 把模板纳入 registry
- 补充 scaffold / smoke / hygiene 测试

前置条件：

- chat 侧最小 MCP feature config 已明确

### Phase C: Retrieval Contract + Docs Chat

目标：

- 先定义 retrieval contract，再决定是否把 `docs-chat` 升为正式模板

建议改动：

- 定义最小 retrieval route / service contract
- 再评估 `docs-chat`
- 若 contract 成熟，再接入模板和测试

### Phase D: Base + Feature Packs

目标：

- 从多完整模板复制，过渡到 `base + feature packs`

建议改动：

- 抽离 `base runtime skeleton`
- 定义 feature pack 目录与合成规则
- 设计 `add feature` 或等价机制

---

## 4. 当前不建议做的事

- 不建议继续往 CLI 入口里增加更多 `coming soon` 模板名
- 不建议让 `docs-chat` 和 `agent-mcp` 作为同一优先级落地
- 不建议让 `basic` 继续承担所有未来模板的公共职责
- 不建议在 registry 前就先铺开 `assistant-workbench`

---

## 5. 一句话结论

`packages/chat-cli` 的下一阶段关键不再是“再多做几个模板”，而是：

> 先把 template registry 和模板治理做成正式基础设施，再在此基础上引入真正有结构差异的第二模板。
