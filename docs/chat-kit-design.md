# Chat Kit Feature Design

> 面向 `packages/chat` 下一阶段能力演进的内部设计文档。
> 本文档负责说明为什么做、目标架构是什么、哪些原则必须坚持。
> 执行拆解见 [packages/chat/chat-kit-review-02.md](../packages/chat/chat-kit-review-02.md)，实时状态见 [packages/chat/progress.md](../packages/chat/progress.md)。

---

## 1. 文档角色

这份文档只回答三类问题：

- 当前 `packages/chat` 的真实基线是什么
- 下一阶段的设计目标和边界是什么
- 哪些原则会影响后续 feature、layout 和 `chat-cli` 的接入方式

它不是进度台账，也不是逐项任务清单。

---

## 2. 当前基线

当前 `packages/chat` 已经具备一条可用的聊天主链路，重点不再是“把基础补齐”，而是“把已有运行时能力进一步沉淀为更稳定的能力契约”。

目前已经形成的基础包括：

- 黑盒入口：`TrChat`
- 白盒入口：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- 状态组合层：`useChatKit`
- 模型切换层：`useModelSelector`
- MCP 管理层：`useMcpManager`
- 配置链路：`ChatConfig -> createChatAdapterFromConfig() -> createPresetChatProps()`
- 已收敛的运行时能力：历史、反馈、模型切换、重试、optimistic / rollback、docs variant、统一消息动作入口

因此，当前阶段更准确的问题定义是：

> 运行时能力已经不算少，真正偏窄的是配置层、adapter 层和 feature 级装配层。

---

## 3. 设计目标

下一阶段设计需要同时满足四个目标：

### 3.1 保持 `chat` 作为聊天场景基座

`packages/chat` 的职责不是平移原子组件，而是为聊天场景提供一条更稳定的组装链路，并继续服务 `chat-cli` 和模板体系。

### 3.2 让运行时能力逐步变成声明式能力

后续高价值能力不应只停留在：

- 原子组件存在
- demo 可拼
- 页面里手工装配

而应逐步进入稳定的 config / adapter / preset 链路。

### 3.3 保持黑盒和白盒共享同一底座

黑盒适合快速落地，白盒适合深度定制，但二者不应分裂成两套状态链路或两套能力入口。

### 3.4 继续支撑 `chat-cli`

`chat-cli` 需要的是可稳定消费的能力输入，而不是继续在模板里堆手写页面逻辑。

### 3.5 为后续 Agent Preset / Skill Pack 预留扩展面

当前阶段不直接把 `agent preset / skill pack` 作为 `chat` 的基础原语引入，但应保证后续可以在稳定 capability 层之上增加这类组合能力，而不推翻现有：

- `ChatConfig`
- `Adapter`
- `Feature Registry`
- `Preset`

---

## 4. 当前最关键的设计差距

### 4.1 运行时能力与配置能力不对称

当前很多能力已经存在于运行时，但还没有稳定、统一、声明式的配置入口。

直接影响是：

- 黑盒难以稳定模板化
- 白盒难以声明式复用
- `chat-cli` 很难基于能力组合生成稳定模板差异

### 4.2 高价值能力仍停留在“组件级存在”

这类能力最典型的包括：

- attachments
- sender actions
- `Prompts` / welcome prompts
- `Sender` extensions（`Suggestion` / `Mention` / `Template`）
- `SuggestionPills` / `SuggestionPopover`
- drag upload
- conversations navigation
- 更完整的 MCP 管理链路

它们不是完全缺失，而是还没有被提升为 `chat` 的场景能力。

### 4.3 feature 与 layout 的边界仍需正式化

未来的 attachments、MCP、welcome prompts、`Sender` extensions、`SuggestionPills` / `SuggestionPopover`、docs / workspace 等能力会不断带来一个共同问题：

- 是否启用能力
- 以什么布局形态呈现
- 放在哪个区域

这些问题必须被拆开，而不能继续混在单一组件 props 里。

---

## 5. 设计原则

### 5.1 不做“组件平移”，只做“能力沉淀”

`packages/components` 继续承担原子能力层职责。

`packages/chat` 应优先吸收满足下列条件的能力：

1. 高频出现在聊天场景
2. 需要消息状态、会话状态或布局编排参与
3. 适合声明式配置驱动

同时建议坚持一个额外原则：

> 设计命名尽量直接映射到现有组件或能力原语，不发明容易混淆的总称。

例如：

- 欢迎区入口卡片就是 `Prompts` / `welcome prompts`
- 输入框智能联想就是 `Sender Suggestion`
- 提及就是 `Sender Mention`
- 模板填充就是 `Sender Template`
- 底部快捷入口继续沿用 `SuggestionPills` / `SuggestionPopover`

不建议继续用一个泛化的 `suggestions` 同时指代以上所有能力。

### 5.2 先统一装配层，再评估统一 props 入口

下一阶段优先统一的是：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Resolution
  -> Preset / Shared Foundation
  -> TrChat / White-box Composition
```

而不是立刻继续扩大 `TrChat` 的 props 面。

### 5.3 feature 与 layout 必须分离

推荐坚持：

- `features` 决定是否启用某种能力
- `layout` 决定能力放在哪里、以什么视图呈现

不要把“能力是否启用”和“布局如何摆放”绑死在一起。

### 5.4 黑盒与白盒共享同一能力底座

任何进入 `chat` 的 feature，都应尽量同时服务：

- 黑盒默认编排
- 白盒组合消费
- `chat-cli` 的配置驱动输出

### 5.5 theme 与壳层能力后置

theme、workspace shell 等能力有价值，但不应早于高频聊天能力的契约化。

### 5.6 先能力原语，后技能组合

对未来可能出现的 `agent preset / skill pack`，建议坚持：

- 它们应建立在稳定的 feature / MCP / prompt / layout 能力之上
- 它们应解析为标准 capability 输出，而不是绕过 registry 形成新黑盒入口
- 当前阶段只保留扩展面，不引入完整 runtime、marketplace 或安装体系

---

## 6. 目标架构

建议后续演进方向保持为：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Registry
  -> Preset / Context Layer
  -> TrChat Blackbox / White-box Composition
```

各层职责如下：

### 6.1 ChatConfig

描述业务意图：

- 模型
- provider
- 启用哪些能力
- 使用哪种布局变体
- 基础 UI 默认内容

### 6.2 Adapter Layer

负责把声明式输入解析为标准化运行时输入：

- 模型解析
- provider 解析
- feature 配置解析
- preset 所需上下文整理

### 6.3 Feature Registry

负责组织 feature 的默认行为与解析逻辑：

- feature 是否启用
- feature 需要哪些状态能力
- feature 如何映射到 preset
- feature 如何被黑盒和白盒共享消费

### 6.4 Preset / Context Layer

负责输出稳定的聊天运行时输入：

- 合并 feature resolution 结果
- 产出稳定的 `TrChatProps`
- 在需要 white-box 组装时，继续向下切出稳定的 preset slices（如 `root / header / welcome / sender / history`）
- 向黑盒和白盒共享同一份装配结果

### 6.5 Blackbox / White-box

负责界面消费：

- 黑盒提供默认编排
- 白盒保留布局与插槽自由度

### 6.6 后续扩展边界

当 first-party features、MCP config、layout formalization 与 `chat-cli` 的 capability consumption 稳定后，可以在现有主链路之上增加：

- `Agent Preset`
- `Skill Pack`

但它们的职责应是“组合标准能力输入”，而不是替代当前：

- `ChatConfig`
- `Feature Registry`
- `Preset / Context Layer`

也就是说，未来就算引入 skill pack，它也应被解析为：

- feature config
- welcome prompts / commands
- MCP / tool bindings
- layout hints

而不是直接越过基础装配层改写运行时。

---

## 7. 下一阶段重点设计主题

### 7.1 Feature Registry Foundation

这是下一阶段最关键的设计支点。

目标不是做开放插件市场，而是先把 first-party feature 的默认行为、解析入口和共享消费方式统一起来。

### 7.2 Attachments

优先沉淀附件消息展示、sender 输入契约和相关状态结构，而不是一开始就承诺完整多模态 transport 栈。

### 7.3 Sender Actions

把 upload、voice、word count、default actions 等能力从 demo 级 slot 拼装提升为 feature 级能力。

### 7.4 Welcome Prompts

把当前通过 `ChatWelcome` / `TrPrompts` 呈现的欢迎区入口卡片正式纳入配置与 preset 主链路。

这一层解决的是：

- 初始欢迎态入口
- 点击后转成发送动作
- `ui.prompts` 与 preset 的稳定映射

它不等于 `Sender` 的智能联想能力。

### 7.5 Sender Extensions

`Sender` 文档里真正的输入增强能力包括：

- `Suggestion`
- `Mention`
- `Template`

这三类能力都属于 `TrSender` 的 extension 原语，应在后续设计中单独看待，而不是继续合并到一个模糊的 `suggestions` 名称中。

优先级建议：

1. `Sender Suggestion`
2. `Sender Mention`
3. `Sender Template`

其中：

- `Sender Suggestion` 是真正对应“智能联想”的能力
- `Sender Mention` 与 `Sender Template` 也应进入基本测试与装配层规划

当前阶段建议进一步明确边界：

| 能力 | 当前归属层 | 本阶段结论 | 原因 |
|:--|:--|:--|:--|
| `welcome prompts` | `chat` 场景能力 | 继续推进为 first-party feature | 它属于欢迎态入口与默认编排，不属于编辑器扩展 |
| `Sender Suggestion` | `TrSender` extension | 暂不进入 `chat` feature registry | 它是输入补全、过滤、自动回填、键盘交互等编辑器级行为 |
| `Sender Mention` | `TrSender` extension | 暂不进入 `chat` feature registry | 它直接参与 `structuredData` 产出，属于输入结构建模而非场景编排 |
| `Sender Template` | `TrSender` extension | 暂不进入 `chat` feature registry | 它直接参与模板块编辑与 `structuredData` 产出，属于编辑器原语 |

也就是说，Phase B 当前更合适的目标不是“把 Sender extensions feature 化”，而是：

- 明确它们与 `welcome prompts` 不是一回事
- 保持它们继续由 `TrSender` / `senderProps.extensions` 主导装配
- 在 `chat` 侧只保留对这些输入增强能力的边界说明、命名收敛与后续测试策略

只有在后续出现稳定的场景级需求时，才再评估是否需要在 `chat` 层增加：

- 标准化的数据源注入
- preset / template 层的受控装配入口
- 面向 `chat-cli` 的 capability consumption

### 7.6 SuggestionPills / SuggestionPopover

参考 [Assistant.vue](./demos/examples/Assistant.vue)，`SuggestionPills` 与 `SuggestionPopover` 更适合作为：

- 底部快捷入口
- 热门问题入口
- shell / footer / workspace 级辅助内容面

它们不是 `Sender Suggestion` 的替代物，也不应直接归并到 `Sender` extensions。

### 7.7 MCP Config 化

下一步重点不是“再造 MCP 能力”，而是把现有 MCP 接入提升为配置可声明、preset 可消费的能力。

### 7.8 Layout Variants

逐步把 `bubble / docs / workspace` 视为 layout variant，而不是各自发展独立状态系统。

### 7.9 Agent Preset / Skill Pack Foundation（后置扩展）

这不是当前阶段的主任务，但应明确后续接入顺序。

推荐只在下面这些前置输出稳定后再进入实现：

1. Feature Registry Foundation 完成
2. attachments / sender actions / welcome prompts 完成正式 feature 化
3. `Sender Suggestion / Mention / Template` 的基础边界与测试策略明确
4. MCP config 与 layout variant / placement 边界稳定
5. `chat-cli` 已完成 feature -> template / preset 的正式消费闭环

在此前提下，`agent preset / skill pack` 更适合作为“能力组合层”进入 `chat`，其首轮职责建议限制为：

- 预设一组标准 feature 组合
- 预设 welcome prompts / commands / MCP bindings
- 向 workflow / CLI 暴露稳定消费输入

不建议首轮就承诺：

- marketplace
- 远程安装
- 独立 runtime
- 绕过 feature registry 的技能黑盒

---

## 8. 非目标

当前阶段不建议把下列方向当成首要目标：

- 继续给 `TrChat` 增加大量离散 props
- 把 `packages/components` 中所有组件平移为 `TrChat.*`
- 先在 demo 中拼出新能力，再反向要求 `chat` 适配
- 在 feature 契约尚未稳定前，大量扩张 CLI flags 或模板分支
- 在 attachments / sender actions / welcome prompts / sender extensions / MCP 之前优先推进 theme 或 workspace 壳层
- 在 capability 主链路稳定前，优先引入 `agent preset / skill pack` runtime 或 marketplace

---

## 9. 与 `chat-cli` 的关系

`chat-cli` 最适合消费的不是页面级手工逻辑，而是：

```text
ChatConfig
  -> Adapter
  -> Preset
  -> Template Variant
```

因此，`packages/chat` 的设计是否成功，一个关键标准就是：

> 新增能力能否以稳定、声明式、可生成的方式进入 `chat-cli` 的消费链路。

对 `agent preset / skill pack` 来说，这意味着：

- 在 feature -> template / preset consumption 稳定前，不应让它成为正式 CLI 输入
- 它们后续应作为 capability consumer 出现，而不是重新把模板拉回页面拼装路线

---

## 10. 参考视角

这份设计主要借鉴以下公开方案的思路，而不是照搬具体实现：

- Vercel AI SDK：前后端职责分离、稳定聊天状态主链路
- LobeChat / LobeHub：能力切片、registry 思维、布局与能力分层
- Ant Design X：黑盒与白盒并存、场景层强调编排而非简单复制
- MCP 官方设计：先定义协作能力边界，再定义 UI 消费层

---

## 11. 一句话结论

`packages/chat` 现在最重要的任务，不是继续补聊天基础，而是：

> 把已经存在的运行时能力，系统化升级为稳定、声明式、可被黑盒、白盒和 `chat-cli` 共同消费的 feature 契约。
