# Chat Kit Feature Design

> 面向 `packages/chat` 下一阶段能力演进的内部设计文档。  
> 本文档回答三个问题：
> 1. 当前基线已经是什么
> 2. 下一阶段应该把什么正式沉淀为能力契约
> 3. 哪些边界必须继续坚持，避免后续 feature、layout 和 `chat-cli` 继续耦合
>
> 执行拆解见 [packages/chat/chat-kit-review-02.md](../packages/chat/chat-kit-review-02.md)，实时状态见 [packages/chat/progress.md](../packages/chat/progress.md)。

---

## 1. 文档分层

为了避免文档继续膨胀，`chat` 相关文档现在只保留下面几类主文档：

- 设计主文档：[`docs/chat-kit-design.md`](./chat-kit-design.md)
  - 回答“为什么这样设计、当前正式架构是什么、哪些边界不能动”。
- 运行时状态板：[`packages/chat/progress.md`](../packages/chat/progress.md)
  - 回答“当前做到哪一步、下一步是什么、哪些能力已经正式收口”。
- 交接文档：[`docs/chat-chat-cli-handoff.md`](./chat-chat-cli-handoff.md)
  - 回答“另一个协作者接手时应该先看什么、当前哪些事实最关键”。
- CLI 设计文档：[`docs/chat-cli-design.md`](./chat-cli-design.md)
  - 只保留 `chat-cli` 自己的消费层设计。

其余文档如果只是阶段性解释、专项实现说明或局部状态记录，应优先并回以上主文档，而不是继续新增独立入口。

历史草稿或评审文档只作为背景参考，不再作为当前主入口，例如：

- `docs/chat-p5-proposal.md`
- `packages/chat/chat-kit-review-02.md`

使用规则是：

- 先看主文档
- 只有在需要追溯阶段性决策时，再回看历史文档

---

## 2. 当前判断

当前 `packages/chat` 已经具备一条可用的聊天主链路，重点不再是“把基础补齐”，而是“把已有运行时能力进一步沉淀为更稳定的能力契约”。

这条主链路已经覆盖：

- 黑盒入口：`TrChat`
- 白盒入口：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- 组合层：`useChatKit`
- 配置链路：`ChatConfig -> Adapter -> Preset`
- 已经正式化的高频能力：`attachments / senderActions / welcomePrompts / mcp / history / feedback`
- 已经正式化的布局层能力：`layout.variant / layout.placements / workspace`
- 已经完成最小收口的壳层能力：`P5-A appearance` 与 `P5-B workspace shell`

因此，下一阶段的主问题不是“是否继续堆 demo 能力”，而是：

> 如何把已经跑通的聊天运行时能力，继续整理成稳定、可声明、可复用、可被黑盒、白盒和 `chat-cli` 同时消费的能力面。

---

## 3. 设计目标

### 2.1 继续把 `packages/chat` 视为能力层，而不是页面层

`packages/chat` 的职责不是承接所有页面拼装逻辑，而是为聊天场景提供稳定的：

- 配置入口
- 运行时契约
- preset 输出
- white-box 组合切面

### 2.2 能力沉淀优先于组件平移

下一阶段进入 `packages/chat` 的东西，优先满足下列条件：

1. 高频出现在聊天场景
2. 依赖消息状态、会话状态或布局状态
3. 适合通过 config / adapter / preset 正式声明

这意味着我们优先沉淀“能力”，而不是简单把 demo 组件挪进正式目录。

### 2.3 黑盒、白盒、CLI 必须共享同一条能力主链

任何正式进入 `chat` 的能力，都应尽量同时服务：

- `TrChat` 黑盒默认消费
- `TrChat.*` 白盒组合消费
- `chat-cli` 的 preset / template 消费

不接受再长出第二条平行运行时。

### 2.4 保持 feature、layout、shell、theme 四层边界

- `features` 决定是否启用能力
- `layout` 决定内容如何排列
- `shell` 决定 workspace 外层区域与附着式宿主
- `theme / appearance` 只负责外观与 token

这些边界不能重新混回一个 props 包里。

---

## 4. 当前最关键的设计差距

### 3.1 运行时能力已经不少，但能力契约仍需继续收口

当前代码里的运行时能力已经明显强于最早的 demo 阶段，但仍有一类风险：

- demo 能力已经存在
- 测试已经覆盖了核心行为
- 但设计语义和正式文档还停留在旧模型

`P5-C` 就是这一类典型能力：

- 右侧会话 turn navigation 已经进入正式运行时
- assistant outline 也已经从 demo 草稿进入正式链路
- 但文档仍容易把它误写成“左右对称双导航”或“workspace 左侧导航”

### 3.2 assistant outline 的真实语义需要被正式写清

当前实现已经证明：

- 右侧导航是 `workspace` 级的 conversation turn navigation
- 左侧 outline 不是 shell 左导航
- 左侧 outline 是 assistant 消息内容内部的 outline 消费形态

也就是说，左侧并不是“第二个对称导航栏”，而是：

> 一个绑定到当前 active assistant response 的内容级 outline。

### 3.3 P5-C 不应回头侵入 P2 layout

`workspace` 仍然只是 layout variant，不应重新承担：

- 内容导航 source schema
- notebook 语义
- shell 交互逻辑
- assistant outline 选择逻辑

这些都应该停留在 `P5` 自己的能力边界内。

---

## 5. P5-C 的最终设计判断

### 4.1 右侧：workspace conversation navigation

右侧能力已经可以视为正式模型：

- 归属层：`workspace`
- source：当前会话中的 user turns
- 宿主：`WorkspaceShell` 中心内容右侧的 navigation host
- 主要职责：
  - turn item 生成
  - active turn 追踪
  - click-to-scroll
  - `fullWidth` 共存

它是会话级导航，不依赖 assistant markdown headings。

### 4.2 左侧：assistant outline

左侧能力现在也应正式定义为：

- 归属层：`chat content`
- source：当前 active assistant response 内部的 headings
- 宿主方式：通过 `MessageList` 的 `prefix` 槽挂载 `AssistantOutlineTrigger`
- 主要职责：
  - 从 active assistant 内容提取 headings
  - 生成稳定 outline items
  - 维护 active heading
  - 提供局部 click-to-scroll

它不是 shell 左导航，也不与右侧 turn navigation 共享一个 source schema。

### 4.3 prefix 挂载是当前最合理的实现入口

assistant outline 现在走 `prefix` 链路，是一个重要的架构收口：

- 它天然跟随 assistant bubble
- `fullWidth` 与非 `fullWidth` 下都能继承已有内容列布局
- 水平方向不需要再依赖 shell 全局猜位
- 真正需要处理的是 bubble 局部坐标修正与纵向跟随

这比“全局 overlay 猜位置”更符合 TinyRobot 现有主渲染链路。

---

## 6. 当前正式架构

建议把当前正式架构理解为：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Registry
  -> Preset / Context Layer
  -> TrChat Blackbox / White-box Composition

P5-C runtime
  -> WorkspaceShell right-side conversation navigation
  -> Chat MessageList prefix-based assistant outline
```

具体分工如下。

### 5.1 WorkspaceShell

`WorkspaceShell` 负责：

- workspace 外层承载
- region / panel / `fullWidth` 等视图状态
- 右侧 conversation navigation host 的附着位置

它不再负责 assistant outline。

### 5.2 ConversationTurnNavigation

`ConversationTurnNavigation` 负责：

- 读取 conversation turns
- 归一化 turn items
- 驱动右侧 host
- turn 点击与 active turn 状态

### 5.3 AssistantOutline

`AssistantOutline` 现在更适合作为 renderless provider 理解：

- 注册 assistant source
- 选择 active assistant message
- 提取 headings
- 维护 active heading
- 向 trigger 提供共享上下文

### 5.4 AssistantOutlineTrigger

`AssistantOutlineTrigger` 负责：

- 挂载到 assistant bubble 的 `prefix`
- 渲染左侧 rail / hover 面板
- 做 bubble 局部坐标修正
- 绑定当前 assistant source 的 outline 交互

---

## 7. 必须继续坚持的边界

### 6.1 不把 navigation 放回 `layout.variant`

不要把：

- content navigation
- assistant outline
- notebook
- shell 状态

重新塞回 `layout.variant` 或 `layout.placements`。

### 6.2 不把 assistant outline 误建模成左侧 shell 导航

不要重新引入：

- `navigation-left`
- `leftContentNavigation`
- `rightContentNavigation`
- 对称式 shell 双导航 API

这类 API 会把左侧 outline 错误提升成全局壳层语义。

### 6.3 不把 outline 解析塞进低层 bubble render core

assistant outline 虽然依赖已渲染 heading，但不应把 heading extraction 直接揉进底层 bubble 渲染规则。

更合理的边界是：

- bubble render 负责内容呈现
- outline runtime 负责 heading 读取与导航同步

### 6.4 不让 theme 接管 shell 或 navigation 结构

`theme / appearance` 可以控制：

- 颜色
- token
- 视觉状态

但不应控制：

- shell 区域结构
- navigation source schema
- assistant source 选择策略

---

## 8. 和 chat-cli 的关系

`chat-cli` 当前仍然应该消费稳定输出，而不是自己定义导航抽象。

对 `P5-C` 来说，这意味着：

- `chat-cli` 现在不需要先消费 assistant outline 细节
- `chat-cli` 未来如果要消费 `P5-C`，也应建立在稳定 config / preset surface 之上
- 不应因为模板方便，就把 `P5-C` 的 source model 再抽成另一个 CLI 特化模型

也就是说：

> `packages/chat` 继续定义能力契约，`chat-cli` 在契约稳定后再消费，而不是反过来倒逼 runtime 命名。

---

## 9. 当前优化方向

`P5-C` 已经具备可用实现，但后续仍有几类优化值得继续推进。

### 8.1 active assistant source 选择策略

当前 assistant outline 的 active source 仍偏视口驱动。后续可以继续评估：

- 是否继续使用 viewport-nearest
- 是否引入更显式的 active assistant contract
- 是否需要对长文档 / 多 assistant 同屏场景做更稳定的选择规则

### 8.2 prefix trigger 的几何稳定性

当前 prefix 挂载已经是正确方向，但仍可继续优化：

- bubble 局部水平修正的稳定性
- `fullWidth` 与非 `fullWidth` 下的 rail gutter
- rail 与 panel 的展开几何一致性

### 8.3 assistant outline 的视觉收口

当前视觉已经接近 `ChatTocTrigger.vue` 参考方向，但仍可继续细抠：

- 短横线疏密
- hover 展开宽度
- active heading 强度
- 截断 tooltip 与面板宽度的一致性

### 8.4 scroll / anchor 稳定性

下一轮可以继续加强：

- heading anchor 生成与复用
- scroll offset 对 sticky 区域的补偿
- active heading 切换阈值

### 8.5 文档与 capability surface 的同步

既然 `P5-C` 已经从讨论转为正式实现，后续应逐步把：

- 最小公开类型
- demo/test 接法
- 交接文档

全部收敛到一致表述，避免再次出现“代码已经变了，设计还停在旧模型”。

---

## 10. 一句话结论

`packages/chat` 下一阶段最重要的工作，不是继续增加 demo 特性，而是：

> 把已经跑通的聊天运行时能力，继续整理成稳定、分层清晰、能被黑盒、白盒和 `chat-cli` 一致理解的正式能力契约。

对于 `P5-C`，这条结论已经具体化为：

- 右侧保留 workspace conversation navigation
- 左侧 assistant outline 作为内容级 prefix-trigger outline 落地
- 二者并列存在，但不再被误写成左右对称双导航
