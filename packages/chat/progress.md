# Chat Kit Progress

> `packages/chat` 下一阶段能力演进的实时状态页。
> 设计源见 [docs/chat-kit-design.md](../../docs/chat-kit-design.md)。
> 执行决议见 [chat-kit-review-02.md](./chat-kit-review-02.md)。

---

## 当前快照

- 当前阶段：`Phase B - High-value Features`
- 当前状态：`进行中`
- 最近更新：`2026-03-18`

---

## 实现顺序总览

以下顺序直接对齐 `chat-kit-review-02.md`，用于控制本轮实现节奏：

1. `Phase A / P0`: Registry Foundation
2. `Phase B / P1`: High-value Features
3. `Phase C / P2`: MCP + Layout
4. `Phase D / P3`: Template / CLI Consumption
5. `Phase E / P4`: Agent Preset + Skill Pack Foundation（后置）
6. `Phase F / P5`: Theme / Workspace Shell（更后置）

当前执行原则：

- 先统一 capability 装配层
- 再沉淀高频聊天能力
- 再稳定 MCP 与 layout 边界
- 再让 `chat-cli` 正式消费 capability
- 最后再进入更高层的 skill pack 与 shell 抽象

---

## 已完成的基础

以下内容视为本轮扩展的既有基线，不再重复作为待办追踪：

- 黑盒 `TrChat` 与白盒组合链路
- `useChatKit`
- 模型切换与 provider 工厂基础链路
- MCP 基础接入
- 历史、反馈、消息动作入口
- retry / optimistic / rollback
- `ChatConfig -> Adapter -> Preset` 第一版链路
- docs variant 基础能力

---

## 当前阶段进度

| 阶段 | 当前状态 | 说明 |
|:--|:--|:--|
| Phase A / P0 | `已完成` | registry / resolver / preset 接入已建立，并以首个内建 feature 贯通 |
| Phase B / P1 | `进行中` | attachments 第一阶段已完成并通过验证，下一步进入 sender actions / suggestions |
| Phase C / P2 | `未开始` | 等待 P1 完成后收敛 MCP config 与 layout variant |
| Phase D / P3 | `未开始` | 等待 capability 主链路稳定后，让 `chat-cli` 正式消费 |
| Phase E / P4 | `后置规划` | skill pack / agent preset 只在 Phase D 后进入 |
| Phase F / P5 | `后置规划` | theme / workspace shell 最后推进 |

当前总体判断：

- `packages/chat` 已具备正式的 capability 装配入口，P0 的 registry foundation 已落地
- 当前主 blocker 已从“feature resolution 入口未稳定”转为“高频聊天能力尚未正式 feature 化”
- 在 Phase B 完成前，不应把精力分散到模板扩张、skill pack runtime 或 workspace shell

---

## 当前焦点

### P1: High-value Features

- [x] Attachments feature
- [ ] Sender Actions feature
- [ ] Suggestions feature
- [ ] 黑盒 / 白盒默认行为对齐

---

## 当前阶段的已完成 / 未完成

### P0 已完成的工作

- [x] `TrChat` 黑盒主链路已成立
- [x] 白盒组合链路已成立
- [x] `useChatKit` 已形成稳定状态主链路
- [x] 模型切换与 provider factory 已有基础实现
- [x] MCP 基础接入已存在
- [x] 历史、反馈、消息动作入口已存在
- [x] retry / optimistic / rollback 已存在
- [x] `ChatConfig -> Adapter -> Preset` 第一版链路已存在
- [x] `src/features/` registry 目录与基础类型已建立
- [x] feature resolver 已建立，并接入 adapter / preset
- [x] 已选定首个内建 feature 作为贯通样例（`history / feedback`）
- [x] 黑盒 / 白盒兼容性保持不回退
- [x] adapter 层已暴露 `resolvedFeatures`，供后续 CLI 稳定消费

### P1 尚未完成的核心工作

- [ ] 为 sender actions 定义正式 feature config 与 preset 映射
- [ ] 为 suggestions 定义正式 feature config 与 preset 映射
- [ ] 继续收敛 sender actions / suggestions 的默认行为，并消除 demo 手工拼装依赖
- [ ] 保持黑盒 / 白盒共享同一默认能力底座
- [ ] 为新增 feature 建立独立的 Playwright spec，并补齐 enabled / disabled / override / whitebox coverage

### P1 已完成的阶段性输出

- [x] `attachments` 已进入 feature config / resolver / preset 主链路
- [x] 黑盒模式已具备默认上传入口与默认附件区
- [x] 未启用 `attachmentsFeature` 的场景不会出现默认附件能力
- [x] 发送消息后会清空附件暂存
- [x] 新建对话后会清空附件暂存
- [x] 已补稳定测试标识，便于 `packages/test` 消费侧验证

---

## 面向 `chat-cli` 的可消费输出

这部分用于说明 `chat-cli` 当前能依赖什么、还不能依赖什么。

| 能力项 | 当前状态 | 对 `chat-cli` 的意义 |
|:--|:--|:--|
| feature registry foundation | `已完成` | template registry 已具备正式映射 chat features 的基础接入点 |
| attachments / sender actions / suggestions config | `进行中` | attachments 第一阶段已可配置化并完成基础验收，sender actions / suggestions 仍未完成，暂不能作为完整模板 capability 输入 |
| MCP feature config | `未开始` | `agent-mcp` 还不应建立在手工 wiring 上 |
| layout variant / placement formalization | `未开始` | `docs-chat` 暂不具备稳定 layout 依赖 |
| feature -> template consumption | `未开始` | `chat-cli` 还处在“模板先行”风险区 |
| agent preset / skill pack foundation | `后置规划` | workflow / template packs 暂不应依赖 informal skill 输入 |

当前结论：

- `chat-cli` 可以稳定消费 `config -> adapter -> feature resolution -> preset -> TrChat` 这条基础链路
- `chat-cli` 还不应把高频 feature 组合当成已稳定能力输入
- `agent preset / skill pack` 目前只应作为后续扩展预留，不应进入正式 capability 输入面

---

## 下一步

### 立即下一步（建议按此顺序执行）

1. 先做 sender actions feature config 与默认编排
2. 再做 suggestions feature config 与 welcome / empty-state 对齐
3. 为新增 feature 创建独立测试文件，并先跑 feature 定向测试
4. 用黑盒 / 白盒两层验证三类 feature 的默认行为
5. 清理 demo 中仍依赖手工拼装的 sender / attachment / suggestion 逻辑
6. 明确哪些 P1 输出可被 `chat-cli` 作为正式 capability 输入

### 进入 P1 前的完成标准

- [x] 至少一个内建 feature 已通过 registry 声明并解析
- [x] 黑盒与白盒主链路无回退
- [x] `ChatConfig -> Adapter -> Preset -> TrChat` 主链路仍保持兼容
- [x] 已明确哪些 resolver 输出可供 `chat-cli` 后续稳定引用

### P1: High-value Features

- [x] Attachments feature
- [ ] Sender Actions feature
- [ ] Suggestions feature
- [ ] 黑盒 / 白盒默认行为对齐

### P2: MCP + Layout

- [ ] MCP feature config
- [ ] layout variant 抽象
- [ ] placement 配置整理

### P3: CLI Consumption

- [ ] feature -> template mapping
- [ ] `chat-cli` 模板消费入口
- [ ] 对应 smoke 验证

### P4: Agent Preset + Skill Pack Foundation（后置）

- [ ] 定义 `AgentPreset` 基础类型
- [ ] 定义 `SkillPack` metadata 与 resolver 入口
- [ ] 明确 skill -> feature / prompts / MCP / layout hints 标准映射
- [ ] 暴露 workflow / CLI 的最小消费边界
- [ ] 首轮明确不包含 marketplace / 安装体系 / 独立 runtime

### P5: Theme / Workspace Shell（更后置）

- [ ] theme variant 正式化
- [ ] workspace shell 抽象
- [ ] shell-level placement conventions
- [ ] 保持壳层只消费既有 capability bundles

---

## 风险与注意项

- 不要让新增能力重新回到 `TrChat` props 膨胀路线
- 不要把 feature resolution 分散回 demo 或页面层
- 不要让 CLI 模板分支先于底层 feature 契约扩张
- 不要让未来的 `agent preset / skill pack` 绕过 feature registry 与 preset 主链路
- 不要在高频聊天能力收敛前优先投入 theme / workspace 壳层

当前最需要盯住的风险：

- `P1` 如果先做 demo 拼装而不是 feature config，会直接削弱 `chat-cli` 后续消费价值
- `attachments` 虽然已进入 config / preset 链路，并完成基础交互闭环，但当前仍只覆盖“状态结构 + 默认上传入口 + 默认附件区 + 发送/新建对话清理”，不要误判为完整多模态 transport 已完成
- `P2` 如果把 layout 和 feature 混在一起，会导致 `docs-chat`、`agent-mcp`、workspace 变体继续相互耦合

---

## 验收基线

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts src/chat/model-switch.spec.ts`
- `pnpm.cmd -F docs build`

当前已确认通过：

- `pnpm.cmd -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/model-switch.spec.ts`

本地运行建议：

- Playwright E2E 默认使用本机可用并行度，不必固定 `--workers=1`
- 只有在排查 flaky、竞态或单测卡住时，再临时切回 `--workers=1`

新增 feature 时的推荐测试顺序：

1. 先补 unit / resolver 断言
2. 再创建独立的 Playwright feature spec
3. 先跑该 feature 的定向测试
4. 再跑 `src/chat/index.spec.ts` 与相邻回归用例

---

## 更新规则

这份文档是 `packages/chat` 的唯一实时状态页。

当出现下面这些变化时，应直接更新这里，而不是把状态散落到其他设计文档中：

- 当前阶段变更
- 已完成项变化
- 面向 `chat-cli` 的输出 readiness 变化
- 新增阻塞或风险
- 验收基线调整
