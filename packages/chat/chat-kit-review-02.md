# TinyRobot Chat Kit Review 02

> 面向 `packages/chat` 下一阶段执行的内部评审文档。
> 设计源见 [docs/chat-kit-design.md](../../docs/chat-kit-design.md)。
> 实时状态见 [progress.md](./progress.md)。

---

## Current Execution Baseline

Snapshot date: `2026-03-19`

Current agreed status:

- `P0` is complete.
- `P1` is complete.
- `P2` is complete.
- The active next step is `P3 / Template / CLI Consumption`.

What "P2 is complete" means in practice:

- `mcp` is already a first-party chat feature and can flow through `features -> resolver -> preset -> root slices`.
- `layout.variant` and `layout.placements` are already formalized through `ChatConfig -> Adapter -> Preset`.
- `workspace` is already accepted as a pure layout variant.
- Explicit placement still has higher priority than variant defaults.
- Layout formalization must stay separate from feature enablement. `workspace` is a presentation choice, not a hidden feature bundle.

Execution rule from this point:

- Do not reopen `P2` by growing shell-level behavior into `layout`.
- Do not let `chat-cli` invent new chat-layer abstractions.
- Let `chat-cli` consume stabilized chat outputs from `packages/chat`.
- Keep `packages/chat` as the single source of truth for capability contracts.

Document split:

- [progress.md](./progress.md) is the short status board.
- This review document keeps the execution rules, boundaries, and acceptance standards.

---

## 1. 本文档职责

这份文档负责把 `chat` 侧设计结论收敛成执行决议，重点回答：

- 当前阶段的统一判断
- 执行优先级与阶段边界
- 每一阶段对 `chat-cli` 的可消费输出是什么
- 当前明确不建议做的事情

它不是设计长文，也不是实时台账。

---

## 2. 当前统一判断

当前 `packages/chat` 的核心骨架已经可用，下一阶段不应继续以“补基础能力”为主，而应正式进入：

> feature 契约化与配置驱动扩展阶段

这一定义建立在现有基础之上：

- 黑盒和白盒主链路已经成立
- `useChatKit`、模型切换、MCP 管理、反馈、历史等核心能力已具备基础
- `ChatConfig -> Adapter -> Preset` 第一版链路已经存在

因此，当前最需要解决的不是“有没有能力”，而是“已有能力怎样被稳定声明、解析和复用”。

---

## 3. 执行优先级

建议严格按以下顺序推进：

1. Registry Foundation
2. Attachments Feature
3. Sender Actions Feature
4. Welcome Prompts Formalization
5. Sender Extensions Boundary
6. MCP Config 化
7. Layout Formalization
8. Template / CLI Consumption
9. Agent Preset / Skill Pack Foundation
10. Theme / Workspace Shell

这个顺序的核心原则是：

- 先统一能力装配层
- 再沉淀高频聊天能力
- 先证明 capability 可以被正式消费
- 最后再做更高层的能力组合与壳层抽象

---

## 4. 对 `chat-cli` 的输出约定

`chat-cli` 关心的不是抽象阶段名，而是每个阶段会不会产出可稳定消费的输入或输出。

建议明确按下面方式对齐：

| 阶段 | `chat` 侧关键输出 | 对 `chat-cli` 的意义 |
|:--|:--|:--|
| Phase A | feature registry 基础设施、feature resolution 入口、preset 接入方式 | 为后续 template registry 和 feature mapping 提供正式接入点 |
| Phase B | attachments / sender actions / welcome prompts 的 config 与 preset 输出，以及 `Sender Suggestion / Mention / Template` 的基础边界 | 让模板差异从页面手工装配转向能力组合，并避免把不同组件能力混成一个 `suggestions` 总称 |
| Phase C | `ChatMcpFeatureConfig`、layout variant / placement 的稳定边界 | 为 `agent-mcp` 和后续 `docs-chat` 提供正式模板依赖 |
| Phase D | feature -> template / preset 的稳定消费链路 | 让 `chat-cli` 真正进入基于 capability 的模板消费阶段 |
| Phase E | `AgentPreset` / `SkillPack` 基础类型、resolver 入口、workflow / CLI 消费边界 | 为后续 workflow presets、template packs、agent capabilities 提供正式组合层 |
| Phase F | theme / workspace shell 的正式消费边界 | 让壳层能力建立在稳定 capability bundles 之上，而不是反向驱动底层适配 |

这意味着：

- 在 Phase A 完成前，`chat-cli` 不适合继续扩张顶层模板
- 在 Phase C 完成前，`agent-mcp` 和 `docs-chat` 都不应依赖页面层手工 wiring 存活
- 在 Phase D 完成前，`agent preset / skill pack` 不应成为正式 CLI 输入
- 在 Phase E 完成前，workflow 或模板 pack 不应依赖非正式 skill wiring

---

## 5. 分阶段执行决议

### Phase A: Registry Foundation

目标：

- 建立 first-party feature registry 基础设施
- 让 feature resolution 优先发生在 adapter / preset 层
- 保持现有 `TrChatProps` 与黑白盒用法兼容

范围：

- registry 目录与基础类型
- feature resolver
- adapter / preset 接入 registry

对 `chat-cli` 的输出：

- 明确统一的 feature resolution 入口
- 明确哪些输出可被 template registry / template metadata 稳定引用

验收口径：

- 至少一个内建 feature 可以通过 registry 声明和解析
- 现有黑盒与白盒主链路不回退
- `createPresetChatProps()` 不再继续朝“大 if/else 中心”演化

### Phase B: High-value Features

目标：

- 正式沉淀 attachments
- 正式沉淀 sender actions
- 正式沉淀 welcome prompts
- 明确 `Sender Suggestion / Mention / Template` 的装配边界

范围：

- feature config 形态
- preset 映射
- 黑盒 / 白盒对齐
- `createPresetChatSlices()` 这类 `preset -> white-box` 的稳定切片输出
- 面向 `chat-cli` 的最小可消费输出

对 `chat-cli` 的输出：

- 模板可以正式声明这些能力，而不必继续把差异硬编码在页面或模板目录里
- `CHAT_CLI_CONSUMABLE_FEATURE_KEYS`、preset prop keys、preset slice keys 与 `createChatCliCapabilitySurface()` 可以作为首轮代码级消费契约
- 后续 `base + feature packs` 路线有正式能力输入

验收口径：

- 当前已选定进入 P1 的能力都能通过 config 启用或明确边界
- 默认行为不再依赖 demo 手工拼装
- 黑盒和白盒共享同一默认能力底座

补充说明：

- 当前代码里已经开始把一部分 welcome prompts 走到 `features -> resolver -> preset -> prompts` 主链路
- 但这不应被误判为 `Sender Suggestion` 已经完成
- 后续设计与测试命名应尽量对齐组件原语，而不是继续泛化成一个模糊的 `suggestions`
- 当前阶段的边界决议应进一步明确为：
  - `welcome prompts` 继续作为 `chat` 的 first-party feature 推进
  - `Sender Suggestion / Mention / Template` 当前保留在 `TrSender` extension 原子层
  - Phase B 不把 `Sender Suggestion / Mention / Template` 直接提升为新的 `chat` feature registry 项
  - 若后续需要被 preset / template 稳定消费，应优先通过 Sender 层装配能力进入，而不是绕过 `TrSender` 重新发明 chat 抽象

Sender extensions 测试口径补充：

- 在 `packages/chat` 中，Phase B 只验证 `senderProps.extensions` 的透传装配链路
- 黑盒与白盒只需要证明它们能接住这类输入，并呈现最小可观察 UI
- 本轮不为 `Suggestion / Mention / Template` 增加 resolver / preset feature 测试
- 本轮不覆盖 sender 组件内部行为单测

### Phase C: MCP Config + Layout Formalization

目标：

- 把现有 MCP 接入提升为配置可声明能力
- 让 layout variant 与 placement 有更明确的抽象边界

范围：

- MCP feature config
- layout config
- `bubble / docs / workspace` 变体抽象

对 `chat-cli` 的输出：

- `agent-mcp` 可以依赖最小 MCP 契约，而不是继续走模板内部手工 wiring
- `docs-chat` 可以等待稳定的 docs / retrieval 场景边界后再评估落地

验收口径：

- MCP 可以通过声明式方式开启
- layout variant 可以被稳定描述
- 不引入新的状态系统分叉

### Phase D: Template / CLI Consumption

目标：

- 让 `chat-cli` 真正消费 feature registry 的结果

范围：

- feature -> template mapping
- CLI template variants
- smoke tests

对 `chat-cli` 的输出：

- 正式进入“模板消费 `chat` capability”阶段
- 模板差异开始从页面复制转向能力组合

验收口径：

- CLI 能稳定生成不同 feature 组合模板
- 模板不再依赖大量手工 `App.vue` 拼装逻辑

### Phase E: Agent Preset / Skill Pack Foundation

目标：

- 在稳定 capability 主链路之上引入 `agent preset / skill pack` 组合层
- 保持 skill pack 解析结果仍回到标准 feature / prompt / MCP / layout 能力面
- 为后续 workflow、template packs、agent capabilities 提供正式消费边界

范围：

- `AgentPreset` 基础类型
- `SkillPack` metadata 与 resolver 入口
- skill -> capability 的标准映射
- workflow / CLI 的最小消费边界

对 `chat-cli` 的输出：

- 可以稳定消费 agent preset 或 skill pack 的解析结果，而不是页面级手工 wiring
- 为后续 `base + feature packs + preset packs` 路线提供正式输入

验收口径：

- skill pack 不绕过 feature registry
- skill pack 至少可解析为标准 feature / prompts / MCP / layout hints 输出
- 不引入新的状态系统分叉

### Phase F: Theme / Workspace Shell

目标：

- 在稳定 capability bundles 基础上推进 theme / workspace shell
- 让更上层壳层能力消费既有 preset / feature / skill pack 结果

范围：

- theme 变体
- workspace shell
- shell-level placement conventions

对 `chat-cli` 的输出：

- 模板可以正式生成壳层变体，但前提是能力底座已稳定

验收口径：

- 壳层不重新引入状态系统分叉
- 壳层消费既有 capability 结果，而不是重新发明能力接入路径

---

## 6. 当前不建议做的事

在前面阶段完成前，不建议优先推进：

- 继续给 `TrChat` 堆更多离散 props
- 大量平移 `packages/components` 组件到 `TrChat.*`
- 先扩张 CLI flags 或模板分支，再倒逼 `chat` 适配
- 在 Phase D 前优先推进 `agent preset / skill pack` runtime 或 marketplace
- 过早把资源投入到 workspace 大工作台
- 把 theme 当成当前阶段的主任务

---

## 7. 建议的验收方式

每个阶段都建议至少从三层验证：

### 7.1 Runtime

- 黑盒是否仍可直接使用
- 白盒是否共享同一底座
- 现有能力是否出现回退

### 7.2 Config

- 新 feature 是否能被 `ChatConfig` 描述
- adapter / preset 是否能稳定解析
- 是否减少了页面或 demo 内的手工装配

### 7.3 Template / CLI

- `chat-cli` 是否可以稳定消费该 feature
- 模板变体是否可被清晰生成
- 默认生成结果是否保持安全和可维护

---

## 8. 新增特性测试策略

为了避免后续 feature 开发继续出现“功能已经接上，但测试覆盖只做了一半”的问题，建议把测试策略正式收口。

### 8.1 基本原则

- 新增 feature 时，测试目标不应只覆盖 config / resolver，还应覆盖运行时默认行为。
- 每个 feature 都应至少覆盖四类场景：
  - enabled 默认行为
  - disabled 关闭行为
  - override 覆盖行为
  - 黑盒 / 白盒一致性
- 测试应优先围绕 feature 自己的边界展开，而不是继续把所有新增断言塞进一个“大而全”的页面用例中。

### 8.2 分层职责

建议继续按三层测试分工：

#### Unit / Resolver 层

目标：

- 验证 `loadChatConfig()`
- 验证 feature normalization
- 验证 `resolveChatFeatures()`
- 验证 `createPresetChatProps()` 输出

这层的重点是：

- 数据结构是否正确
- 默认值是否正确
- enabled / disabled / override 是否正确

#### Runtime / Component 层

目标：

- 验证黑盒默认行为
- 验证白盒组合行为
- 验证 slot、context、默认 UI 抑制与优先级

这层的重点是：

- 用户真实能不能看到正确行为
- feature 与 slot / context / layout 是否有冲突

P1-B 建议按下面的验证清单执行：

- 默认值来源：
  - `createPresetChatSlices()` 产出的 `welcome / sender / root` 是黑盒与白盒共享默认底座
- 覆盖顺序：
  - 黑盒遵循 `feature -> resolver -> preset -> TrChat props`
  - 白盒遵循 `preset slices -> TrChat.* props -> slots / context`
- Welcome：
  - `welcomePrompts`、显式 `prompts override`、`#welcome` slot 的优先级与互斥关系
- Sender：
  - `placeholder / mode / maxLength` 的默认值与显式覆盖关系
  - `footer-right` slot 出现后，默认 upload / voice UI 是否被正确抑制
- Attachments / Sender Actions：
  - `attachmentsFeature / senderActionsFeature` 的默认入口是否与 white-box 装配结果一致
- Sender Extensions：
  - 只验证 `senderProps.extensions` 在 blackbox / white-box 透传成功
  - 不补 `Suggestion / Mention / Template` 的 resolver / preset feature 测试

#### Regression / Suite 层

目标：

- 验证相邻能力没有回退
- 验证现有主链路没有被 feature 改坏

这层的重点是：

- 在 feature 用例通过后，再跑 chat 的既有主链路回归

### 8.3 文件组织建议

从测试可维护性看，建议逐步采用下面的组织方式：

#### E2E / Playwright

新增 feature 时，优先在 `packages/test/src/chat/` 下建立独立 spec 文件，例如：

- `attachments.spec.ts`
- `sender-actions.spec.ts`
- `welcome-prompts.spec.ts`
- `sender-extensions.spec.ts`（仅做透传验证）
- `mcp.spec.ts`

这样做的好处是：

- 可以先定向跑新增 feature
- 用例边界更清楚
- 回归失败时更容易定位到具体 feature

#### Unit

当前 `packages/chat` 的 unit 入口还是单文件脚本：

- `packages/chat/tests/use-chat-slices.test.mjs`
- 对 `Sender Suggestion / Mention / Template`，unit 只保留一层很薄的透传断言，例如 `createPresetChatSlices().sender`

在现有基础设施下，短期仍可以继续在这里补新增断言，但建议：

- 至少按 feature 分块组织
- 不再把 feature 测试散落插入到无关章节里

中期建议再单独推进：

- 把 unit 测试迁移到支持多文件与过滤运行的 runner
- 再将 feature unit 拆成独立文件

也就是说：

> “新增 feature 创建单独文件”这个方向是对的，但在 unit 层要结合当前 runner 现状分阶段推进；在 E2E 层则建议从现在开始就按 feature 拆文件。

### 8.4 推荐执行步骤

新增 feature 时，推荐按下面顺序执行：

1. 先补 Unit / Resolver 用例
   - 覆盖 normalization、resolver、preset 输出
2. 再补该 feature 的独立 Runtime / E2E 用例
   - 覆盖 enabled / disabled / override / blackbox / whitebox
3. 定向运行新增 feature 对应测试
   - 确认 feature 自身没有问题
4. 再运行 chat 相关主链路回归
   - 确认没有影响现有功能
5. 最后再把该 feature 标记为已完成

### 8.5 推荐命令顺序

建议本地开发时按这个顺序跑：

1. `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
2. `pnpm.cmd -F tiny-robot-test test -- src/chat/<feature>.spec.ts`
3. `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts`

说明：

- 第 1 步先确认 config / resolver 主链路
- 第 2 步只验证新增 feature
- 第 3 步再做 chat 主链路回归

如果只是排查 flaky 或竞态问题，再临时降为单 worker。

---

## 9. 执行规范

这部分补充执行顺序、风险、验收和文档维护规则，作为后续推进 `packages/chat` 时的固定约束。

### 9.1 执行顺序约束

后续实现默认按下面顺序推进，不建议跳步：

1. 先完成 `packages/chat` 自身的 capability 契约化。
2. 再整理 `MCP config` 与 `layout variant / placement`。
3. 再让 `chat-cli` 正式消费稳定 capability。
4. 最后才进入 `Agent Preset / Skill Pack` 与 `Theme / Workspace Shell`。

这条顺序的含义是：

- `chat-cli` 应消费稳定能力，而不是反向驱动 `chat` 设计。
- `demo` 只用于快速验证，不应决定 capability 形态。
- white-box 自由度应建立在稳定 preset slices 之上，而不是页面层重复推导默认值。

### 9.2 风险与注意事项

推进过程中，默认持续关注下面这些风险：

- 不要让新增能力重新回到 `TrChat` props 膨胀路线。
- 不要把 feature resolution 分散回 demo 或页面层。
- 不要让 CLI 模板分支先于底层 feature 契约扩张。
- 不要让未来的 `agent preset / skill pack` 绕过 feature registry 与 preset 主链路。
- 不要在高频聊天能力还未收稳前，优先投入 theme / workspace shell。

当前阶段最需要盯住的额外风险是：

- 如果默认行为判断继续散落在黑盒、白盒和页面层，P2 / P3 会继续漂移。
- `attachments` 当前完成的是能力装配闭环，不应误判为完整多模态 transport 已完成。
- `layout` 如果和 feature enablement 混在一起，后续 `docs-chat`、`agent-mcp`、workspace 变体会继续耦合。

### 9.3 验收基线

`packages/chat` 后续阶段默认至少对齐下面这组基线：

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts`
- `pnpm.cmd -F docs build`

如果是 feature 增量开发，推荐按下面顺序执行：

1. 先跑 unit / resolver 断言。
2. 再跑该 feature 对应的独立 Playwright spec。
3. 再跑 `src/chat/index.spec.ts` 与相邻回归。

### 9.4 文档分工与更新规则

从现在开始，文档分工保持如下：

- `progress.md` 只保留实时进度看板。
- `chat-kit-review-02.md` 保留阶段决议、执行规范、风险与验收规则。
- `chat-kit-design.md` 保留设计背景与长期结构判断。

出现下面变化时，优先更新本文件，而不是把规范散落回 `progress.md`：

- 阶段顺序或执行原则变化。
- 对 `chat-cli` consumption boundary 的判断变化。
- 风险项或禁止事项变化。
- 验收基线变化。
- 测试策略或阶段完成标准变化。

---

## 10. 一句话结论

`review-02` 的核心结论不是重新定义 `chat`，而是确认：

> 下一阶段的主线应是先做 registry foundation，再逐步把高频聊天能力沉淀为可配置、可复用、可被 `chat-cli` 稳定消费的 feature 契约。
