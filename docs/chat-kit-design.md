# Chat Kit Feature Design

> 面向 `packages/chat` 的后续扩展设计文档
> 目标：在不破坏现有 `config -> adapter -> preset -> TrChat` 链路的前提下，把 `@opentiny/tiny-robot` 中高价值的聊天场景能力，逐步沉淀为 `@opentiny/tiny-robot-chat` 的稳定能力底座，并进一步服务 `chat-cli` 与模板体系。

---

## 一、文档定位

这份文档不是“当前 chat 包仍不可用”的问题清单，而是：

- 对当前 `packages/chat` 现状的校准
- 对下一阶段扩展方向的设计判断
- 对 `chat-cli` 与模板体系的前置设计约束

也就是说，这份文档的正确定位应当是：

> `packages/chat` 的 vNext 设计文档

而不是：

> “先把当前核心链路修完再谈扩展”的基础补课文档

原因很明确：当前 `packages/chat` 的核心骨架已经完成，后续工作的重点，已经从“修通主链路”转向“沉淀更稳定的扩展契约”。

---

## 二、当前实现现状

### 2.1 当前已经稳定落地的能力

基于当前仓库实现，`packages/chat` 已经具备以下能力：

- 黑盒能力：`TrChat`
- 白盒能力：`TrChat.Root / Layout / Header / Welcome / MessageList / Footer / Sender / History`
- 状态组合层：`useChatKit`
- 模型切换层：`useModelSelector`
- MCP 管理层：`useMcpManager`
- 配置适配层：`createChatAdapterFromConfig`
- 预设组装层：`createPresetChatProps`

结合当前实现与进度文档，以下能力已经完成并经过回归验证：

- `Root + Layout` 双层模型
- MCP 单实例链路
- 模型切换 owner 收敛
- `config -> adapter -> preset` 第一版契约
- provider icon 迁移到 `@opentiny/tiny-robot-svgs`
- chat 文案抽取到 `messages.ts`
- `useChatKit` 内部 slice 化
- 结构化错误与 `retry()`
- optimistic / rollback
- 统一消息动作入口
- `docs variant`
- 源码内部命名和目录结构收敛

因此，当前 `packages/chat` 的判断应当是：

> 核心主链路已稳定，当前缺少的是“更完整的 feature 契约与配置驱动能力”，而不是“聊天基础能力尚未成立”。

### 2.2 当前架构的真实分层

当前 `packages/chat` 已基本形成以下分层：

```text
@opentiny/tiny-robot
  -> 提供原子 UI 组件

@opentiny/tiny-robot-kit
  -> 提供消息、会话、请求、工具调用状态能力

@opentiny/tiny-robot-chat
  -> 负责把 UI + 状态 + provider + config 组装成真正可用的 chat kit
```

更细一点看：

```text
ChatConfig
  -> Adapter
  -> Preset Props
  -> TrChat / White-box Composition
  -> TinyRobot UI Components
```

这里最关键的事实是：

- `TrChatProps` 运行时能力已经不算窄
- `ChatConfig` 和 `Adapter` 公开的配置面仍然偏窄

所以现在真正的缺口是：

> 现有运行时能力，尚未被系统化提升成稳定、声明式、可生成的配置能力。

### 2.3 当前已接入与未接入能力边界

当前 `packages/chat` 已系统接入的高频能力主要包括：

- Bubble / BubbleProvider
- Sender
- Welcome
- Prompts
- History
- Feedback
- Model Selector
- MCP Picker 面板基础能力

但以下能力仍停留在“组件有、demo 可拼、chat 契约尚未统一”的状态：

- Attachments
- Upload / Voice / WordCount 等 Sender Actions
- Suggestion Pills / Suggestion Popover
- Drag Upload
- Conversations Navigation
- MCP Add Form 等更完整 MCP 管理链路
- Theme Provider 的场景级接入
- 更完整的 docs / workspace 场景布局

这也是后续设计要重点解决的问题。

---

## 三、业界最佳实践判断

### 3.1 参考对象

本设计主要参考以下公开方案：

- Vercel AI SDK / AI Academy
  - 强调聊天应用的前后端分层、服务端持有密钥、前端只消费统一 chat 状态
  - 参考：<https://sdk.vercel.ai/docs/getting-started/vue>
  - 参考：<https://vercel.com/academy/ai-sdk/basic-chatbot>
- LobeHub / LobeChat
  - 强调 capability slices、插件式接入、多 provider、多布局形态、统一状态主链路
  - 参考：<https://github.com/lobehub/lobe-chat>
  - 参考：<https://lobehub.com/docs/development/plugins/create-plugin>
- Ant Design X
  - 强调 compound component、场景组件与原子组件并存
  - 参考：<https://x.ant.design/components/overview>
- MCP 官方设计
  - 强调 tools / prompts / resources 为独立能力面，能力接入应走统一协作边界
  - 参考：<https://modelcontextprotocol.io/docs/getting-started/intro>

### 3.1.1 Vercel AI SDK 值得借鉴的点

Vercel AI SDK 的重点并不在“给你一个很大的聊天组件”，而在于：

- 提供清晰的消息流与请求流模型
- 把服务端模型访问与前端 UI 消费明确分开
- 让前端围绕稳定的 chat state 编排页面，而不是围绕 provider 细节写页面

对 `packages/chat` 的启发主要有三点：

1. **前后端职责分离**
   - 模型密钥和真实调用能力留在服务端
   - 前端消费一个稳定 provider / proxy 契约
   - 这和当前 `createServerProxyProvider`、`chat-cli` 默认 server proxy 化的方向一致

2. **先稳定消息主链路，再叠加上层能力**
   - Vercel 的教程始终先强调消息、流式返回、错误处理
   - 然后才扩展到 RAG、工具、外部能力
   - 对 `packages/chat` 来说，这意味着 attachments / suggestions / MCP 也应建立在统一消息主链路之上，而不是先做一堆壳层 UI

3. **Hook / state 层应先于页面层沉淀**
   - Vercel AI SDK 的核心价值并不只是 UI，而是 chat state abstraction
   - 这与 `useChatKit` 已完成 slice 化的方向一致
   - 下一步延展时，应继续通过 registry / preset 扩展状态与能力，而不是把逻辑重新塞回页面组件

### 3.1.2 LobeHub / LobeChat 值得借鉴的点

LobeChat 最值得借鉴的，不是它的视觉外观，而是它处理复杂聊天能力的方式：

1. **能力切片清晰**
   - provider、conversation、tool、plugin、layout 都有相对清晰边界
   - 这说明复杂 chat 产品不会把所有能力都塞进一个“大组件 props 面”

2. **插件 / feature 先声明，再注入**
   - LobeHub 的插件开发方式，本质上就是 registry 思维
   - 先定义能力，再注入上下文，再接 UI
   - 这与本文建议的 first-party feature registry 高度一致

3. **同一消息主链路承载多种展示形态**
   - Bubble、Artifacts、Branch、侧边工作区并不是彼此独立的产品
   - 而是在统一会话主链路上的不同 UI 形态
   - 这直接支持 `packages/chat` 把 `bubble / docs / workspace` 视为 layout variant，而不是拆成多套状态系统

4. **布局扩展晚于能力扩展**
   - LobeChat 的复杂工作台体验之所以成立，是建立在前面能力切片已稳定的基础上
   - 对 `packages/chat` 来说，这意味着 workspace 是合理方向，但不应早于 attachments / senderActions / suggestions / MCP config 化

### 3.1.3 Ant Design X 值得借鉴的点

Ant Design X 的价值在于它不是只给一个黑盒，而是同时保留：

- 场景组件
- 原子组件
- 组合能力

这对 `packages/chat` 的启发是：

1. **黑盒和白盒要长期并存**
   - 黑盒用于快速落地
   - 白盒用于深度定制
   - 二者不应分裂出两套状态体系

2. **场景层要强调编排，而不是重复导出**
   - Ant Design X 并不会要求所有能力都变成一个统一的大黑盒 props
   - 它更强调 compound component 和场景组合
   - 这支持 `TrChat.Root + Layout + 子组件` 继续作为长期稳定方向

3. **布局与功能要分层**
   - 一个能力是否启用，不等于它放在什么位置
   - 这也是本文把 `features` 与 `layout` 分层的直接依据

### 3.1.4 MCP 官方设计值得借鉴的点

MCP 官方思路的关键不是“某一个面板组件”，而是能力边界：

- tools
- prompts
- resources

它强调的是：

1. **能力通过统一协议协作**
   - 不是在页面里为每个工具单独堆一套接入逻辑

2. **能力面应独立建模**
   - tools 不是普通按钮
   - prompts 不是普通欢迎语
   - resources 也不是普通附件

3. **UI 只是协作协议的消费层**
   - 先有可协作契约
   - 再有面板、按钮、选择器等 UI

这对 `packages/chat` 的意义是：

- 当前已经有 `mcpManager` 和基础面板链路
- 下一步重点应是把 MCP 能力纳入 feature 配置与 preset 解析
- 而不是继续把 MCP 理解成“再加几个 MCP 相关组件”

### 3.2 从业界实践中可以得到的共识

#### 1. 场景层不应等于原子层复制

成熟聊天框架不会把底层组件逐个重新导出一遍，就视为 chat kit 完成。

更常见的做法是：

- 原子层负责可复用 UI
- 场景层负责能力编排
- 高价值场景能力沉淀为更稳定的接入面

这意味着 `packages/chat` 不应把目标定义为：

> “把 `packages/components` 里所有组件都变成 `TrChat.*`”

而应定义为：

> “把与聊天场景高度相关、且需要状态与布局编排的能力，沉淀成 chat kit feature”

#### 2. 配置应描述能力，而不是描述实现细节

业界成熟方案通常把配置理解为“业务意图”而不是“渲染细节”。

更合理的配置会表达：

- 是否启用附件能力
- Sender 工具栏有哪些动作
- 是否启用 MCP 管理面板
- 是否启用 suggestion
- 当前是 bubble 还是 docs 形态

而不是要求业务方在配置里直接塞：

- 大量渲染函数
- 大量 VNode
- 组件内部拼装逻辑

这一点对 `chat-cli` 尤其重要，因为 CLI 只能稳定生成“声明式配置”，无法长期生成“高度手写逻辑”。

#### 3. 状态层、布局层、扩展层必须分离

Vercel AI SDK、LobeChat 等方案虽然风格不同，但都强调同一件事：

- 消息与会话状态必须有清晰主链路
- UI 只是这些状态的消费面
- 扩展能力不能和核心消息状态耦合成一坨

`packages/chat` 这一点已经走在正确方向上：

- `useChatKit` 已完成内部 slice 化
- `Root + Layout` 已分层
- `retry / optimistic / rollback / docs variant` 已完成

因此，下一阶段不应回到“大组件继续堆逻辑”的路线，而应继续强化这种分层。

#### 4. 扩展能力应走 registry / manifest，而不是继续堆 if/else

LobeHub 的插件与能力接入、本质上都在强调：

- 先声明能力
- 再注册能力
- 再挂接到布局与 UI

这对 `packages/chat` 的启示很直接：

- feature 扩展不应继续直接写死在 `TrChat.vue`
- `createPresetChatProps` 也不应变成第二个“大 if/else 中心”
- 需要一个 first-party feature registry

#### 5. 黑盒与白盒应共享同一能力底座

成熟方案不会让黑盒和白盒各自维护完全不同的状态链路。

正确方向应该是：

- 黑盒只是默认编排
- 白盒继续共享同一 feature 和状态基座
- 任何 feature 的能力入口，都应同时可被黑盒和白盒消费

这一点也是当前 `packages/chat` 下一阶段要继续坚持的原则。

---

## 四、对当前方案的校准

### 4.1 当前设计稿中合理的部分

下面这些方向，我认为是正确的，而且应该保留：

1. 引入 feature 配置层
2. 引入 layout 配置层
3. 为 `chat-cli` 预留配置驱动生成能力
4. 用 feature registry 而不是继续在黑盒堆逻辑
5. 将 attachments / senderActions / suggestions / MCP 视为场景能力，而不是零散组件

这些判断与当前实现方向是一致的。

### 4.2 当前设计稿中需要修正的地方

#### 1. 不应再把已落地基础能力写成“前置待完成事项”

文档此前把这些内容放在“建议首期落地”中：

- `useChatKit` 状态拆分
- 错误重试
- optimistic / rollback
- docs variant

但它们现在已经是现状，而不是计划。

因此文档应明确：

- 这些能力属于已完成基础
- 后续设计应建立在这些能力之上
- 不应继续把它们当作是否进入扩展阶段的前提条件

#### 2. “ChatConfig 过窄”是对的，但要区分配置层与运行时层

当前真正过窄的是：

- `ChatConfig`
- `createChatAdapterFromConfig`
- `createPresetChatProps`

而不是：

- `TrChatProps`
- `TrChat` 运行时能力面

当前运行时其实已经有一批明确能力：

- `mcpManager`
- `messageListVariant`
- `showHistory`
- `showFeedback`
- `senderProps`
- `bubbleListProps`

所以更准确的诊断应该是：

> 现在的缺口不是“chat 没有能力”，而是“chat 的已有能力还没有形成统一的配置化入口”。

#### 3. 不建议直接把所有能力一次性并入 `TrChatProps.features`

把 feature 入口直接加到 `TrChatProps` 上，方向不是错的，但时机和方式要更保守。

原因：

- 现在已有一批显式 props 已经稳定
- 如果立刻再加一个“大 feature 对象”
- 很容易出现双入口和语义重叠

例如会出现这种问题：

- `showHistory` 和 `features.history.enabled` 谁优先？
- `messageListVariant` 和 `layout.variant` 谁优先？
- `senderProps` 与 `features.senderActions` 如何合并？

因此，更稳的方案应是：

1. 先在 adapter / preset 层建立 feature registry
2. 由 registry 输出当前稳定 `TrChatProps`
3. 只有在 feature 契约足够稳定后，再评估是否增加统一 props 入口

也就是说：

> 先统一“能力装配层”，再统一“组件最终入口层”。

---

## 五、当前最关键的设计差距

### 5.1 运行时能力与配置能力不对称

这是当前最核心的问题。

现在的状态是：

- 运行时可做的事已经不少
- 但 config 能表达的东西还非常有限

直接影响是：

- 黑盒能力无法稳定模板化
- 白盒能力无法声明式复用
- `chat-cli` 难以基于能力生成不同模板

### 5.2 feature 还没有正式的 first-party registry

当前很多能力虽然存在，但没有统一注册面：

- attachmens
- senderActions
- suggestions
- MCP 面板增强
- conversations navigation

如果继续直接在：

- `TrChat.vue`
- `createPresetChatProps`
- demo

里分别补逻辑，最终会再次进入局部硬编码扩张。

### 5.3 高价值能力仍有“组件级存在、场景级缺席”的问题

这类能力最典型：

- `TrAttachments`
- `TrUploadButton`
- `TrVoiceButton`
- `TrWordCounter`
- `TrSuggestionPills`
- `TrSuggestionPopover`
- `TrDragOverlay`
- `TrConversations`

它们不是“不存在”，而是：

- 只在原子组件层存在
- 还没被提升为 chat kit 的场景能力

### 5.4 `chat-cli` 需要稳定的能力映射，而不是只靠 README 和模板手写

`chat-cli` 的价值不只是复制一个 demo 模板。

它真正需要的是：

- 基于声明式配置生成项目
- 生成安全默认值
- 根据 feature 组合生成稳定模板差异

如果 `packages/chat` 不先把 feature 契约稳定下来，CLI 的 flags 和模板会持续跑在底层能力前面。

---

## 六、建议的设计原则

### 6.1 不做“组件平移”，只做“能力沉淀”

建议坚持：

- `packages/components` 继续做原子能力层
- `packages/chat` 只吸收聊天场景高价值能力

是否进入 `packages/chat`，建议用这三个判断：

1. 是否高频出现在聊天场景
2. 是否需要消息状态、会话状态或布局编排参与
3. 是否适合被声明式配置驱动

满足这三点的，优先纳入 `packages/chat`。

### 6.2 先沉淀 adapter / preset 层，再扩张黑盒 props

建议优先路线：

```text
ChatConfig
  -> Feature Registry
  -> Preset Resolver
  -> Stable TrChatProps
  -> Blackbox / Whitebox
```

而不是：

```text
继续给 TrChat 增加越来越多的 props
```

### 6.3 feature 与 layout 必须分离

这是一个很关键但容易被忽略的原则。

建议明确分开两类问题：

- 是否启用某种能力
- 该能力摆在什么位置、以什么视图形态呈现

例如：

- `features.attachments.enabled`
- `layout.attachmentsPlacement`

不要把能力是否启用和布局是否显示混在一起。

### 6.4 theme 应放在后序阶段

Theme 当然重要，但对于当前 `packages/chat` 来说，它不是最紧急的优先级。

更值得优先投入的，是：

- attachments
- senderActions
- suggestions
- MCP config 化

Theme 更像应用壳层和模板层能力，而不是当前 chat kit 扩展的第一批阻塞项。

### 6.5 这套方案为什么易于扩展

从架构角度看，这套方案是相对容易扩展的，原因不是“它现在功能多”，而是“它已经具备了正确的扩展落点”。

#### 1. 扩展点不是直接挂在页面里

当前主链路已经形成：

```text
config -> adapter -> preset -> TrChat / white-box
```

这意味着后面新增能力时，天然有几个明确扩展位：

- 在 `config` 层新增能力声明
- 在 `adapter` 层做能力解析和归一化
- 在 `preset` 层映射到稳定的运行时输入
- 在黑盒和白盒中共享消费结果

这是可扩展的关键，因为它避免了：

- 所有能力都直接加到 `TrChat` props
- 所有能力都只能在 demo 里手拼
- 所有能力都绑死在某一个布局实现上

#### 2. 运行时主链路已经稳定

当前已经完成的这些能力，会显著降低后续扩展风险：

- `useChatKit` slice 化
- `retry / optimistic / rollback`
- 统一消息动作入口
- docs variant
- 模型切换与 MCP 管理收敛

这意味着后续再接入新能力时，不需要重新定义消息主链路。

例如未来接入：

- attachments
- voice
- suggestions
- conversations navigation
- workspace panel

都应建立在现有消息 / 会话 / layout 骨架上扩展，而不是推翻重来。

#### 3. 黑盒与白盒共享同一底座

这会直接提升扩展性。

如果未来新增能力只服务黑盒，那么：

- 白盒很难复用
- CLI 也难以稳定生成

如果未来新增能力只停留在白盒，那么：

- 黑盒很难模板化
- 初学者使用成本会持续上升

当前方案的正确之处，在于它把 feature 的最终归宿放在共享底座，而不是只给某一种接入方式。

#### 4. feature 与 layout 分层后，后续能力不会彼此挤压

这是方案最重要的扩展性保障之一。

如果未来新增能力都直接和布局绑死，会很快出现这种问题：

- attachments 只能放在某一种 sender 区域
- MCP 只能是 drawer
- suggestions 只能在 welcome 区出现
- docs 与 workspace 只能通过大量条件分支硬切

而 feature / layout 分层后，可以更自然地扩展为：

- 同一个 feature 支持不同 placement
- 同一个 layout 组合不同 feature
- 同一个 feature 在黑盒和白盒中共享默认行为

#### 5. 对未来接入其他能力是友好的

如果后续接入新的能力类型，例如：

- artifact preview
- knowledge citation
- branch conversations
- agent task panel
- multi-step workflow inspector

这套方案仍然有可落地的位置：

- 属于聊天主链路的能力，进入 feature registry
- 属于布局壳层的能力，进入 layout / workspace
- 属于纯原子 UI 的能力，留在 `packages/components`

这就是它的扩展边界清晰之处。

#### 6. 真正的风险不在“不能扩展”，而在“扩展方式错误”

当前方案真正需要警惕的不是扩展不了，而是未来如果走错了，会把扩展性重新做坏：

- 重新回到 `TrChat` props 爆炸
- 在 demo 中手工拼出新能力，而不是沉淀 feature 契约
- 让 `chat-cli` 先定义模板，再倒逼 chat 适配
- 过早推进 workspace / theme，而忽视高频能力的契约化

所以更准确的结论是：

> 这套方案本身是易于扩展的，但前提是后续扩展继续沿着“registry + preset + shared foundation”的路线走，而不是回到局部堆逻辑的旧路径。

---

## 七、建议的目标架构

### 7.1 总体架构

建议后续演进为以下四层：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Registry
  -> Preset / Context Layer
  -> TrChat Blackbox / White-box Composition
```

### 7.2 各层职责

#### 1. ChatConfig

只描述业务意图：

- 模型
- provider
- 哪些 feature 启用
- 哪种布局形态
- 哪些默认 UI 内容展示

不描述底层组件拼装细节。

#### 2. Adapter Layer

负责：

- 解析模型
- 解析 provider
- 解析 feature 配置
- 输出标准化 preset 输入

它应是 `chat-cli` 与 `packages/chat` 的关键中间层。

#### 3. Feature Registry

负责：

- 描述 feature 的默认行为
- feature 需要哪些状态能力
- feature 需要哪些组件
- feature 默认挂载在哪些 slot / area

#### 4. Preset / Context Layer

负责：

- 合并 feature 结果
- 产生稳定的 `TrChatProps`
- 向黑盒和白盒共享同一份 feature resolution 结果

#### 5. Blackbox / White-box

负责：

- 黑盒：提供默认编排
- 白盒：消费同一份 feature 与状态结果

---

## 八、建议的配置模型

### 8.1 建议新增 feature 配置层

```ts
interface ChatFeaturesConfig {
  history?: boolean | ChatHistoryFeatureConfig
  feedback?: boolean | ChatFeedbackFeatureConfig
  modelSelector?: boolean | ChatModelSelectorFeatureConfig
  attachments?: false | ChatAttachmentsFeatureConfig
  senderActions?: false | ChatSenderActionsFeatureConfig
  suggestions?: false | ChatSuggestionsFeatureConfig
  mcp?: false | ChatMcpFeatureConfig
  conversations?: false | ChatConversationsFeatureConfig
  dragUpload?: false | ChatDragUploadFeatureConfig
}
```

说明：

- `boolean` 表示启用默认能力
- `object` 表示启用并覆盖默认配置
- `false` 表示显式关闭

### 8.2 建议新增 layout 配置层

```ts
interface ChatLayoutConfig {
  variant?: 'bubble' | 'docs' | 'workspace'
  historyPlacement?: 'drawer' | 'sidebar'
  mcpPlacement?: 'drawer' | 'panel'
  attachmentsPlacement?: 'composer-top' | 'composer-bottom'
  modelSelectorPlacement?: 'footer' | 'sender-toolbar'
}
```

说明：

- `features` 决定有没有能力
- `layout` 决定能力放哪

### 8.3 Theme 配置建议

Theme 这层建议保留设计，但不作为首批能力推进：

```ts
interface ChatThemeConfig {
  enabled?: boolean
  theme?: string
  colorMode?: 'light' | 'dark' | 'auto'
  storageKey?: string
}
```

它适合作为：

- 后续模板层能力
- workspace 壳层能力
- docs / app shell 场景能力

而不建议与 attachments / suggestions 放在同一优先级。

---

## 九、建议的 feature 优先级

### 9.1 第一优先级：尽快进入 `packages/chat`

#### 1. Attachments

原因：

- 属于高频聊天能力
- 当前已有渲染基础
- 但尚缺统一输入与消息契约

建议首阶段目标：

- 统一附件展示契约
- 统一 sender 输入契约
- 不急于一开始就承诺完整多模态 transport 栈

#### 2. Sender Actions

包括：

- upload
- voice
- word counter
- default actions

原因：

- 这是最典型的“组件有、场景层没有”的能力
- 很适合配置驱动

#### 3. Suggestions

包括：

- welcome suggestions
- composer suggestions
- command suggestions

原因：

- 当前 `welcome.prompts` 只是一个很窄的子集
- 建议沉淀为统一 suggestion feature

#### 4. MCP Config 化

原因：

- 当前 MCP 运行时能力已具备基础
- 下一步重点不是“再造 MCP”，而是“把 MCP 声明式接入 config / preset”

### 9.2 第二优先级：在 feature registry 稳定后引入

#### 1. Drag Upload

适合作为 attachments feature 的增强项，而不是独立最先做。

#### 2. Conversations Navigation

适合在 layout / workspace 能力更清晰后推进。

#### 3. Workspace Layout

这是合理方向，但属于更高层的场景编排，不适合作为第一批配置扩展项。

### 9.3 第三优先级：暂不建议作为 chat 核心能力推进

- 纯原子图标和按钮拼装能力
- 与聊天主链路耦合较低的壳层视觉能力
- 过于业务化的右侧面板定制

这些更适合停留在：

- `@opentiny/tiny-robot` 原子组件层
- 或 `chat-cli` 模板层

---

## 十、建议的 feature registry 机制

### 10.1 设计目标

引入 first-party feature registry 的目标不是“做插件市场”，而是先解决：

- feature 默认行为如何统一
- feature 如何映射到 preset
- feature 如何同时服务黑盒和白盒
- feature 如何被 `chat-cli` 稳定消费

### 10.2 建议形态

```ts
interface ChatFeatureDefinition<TConfig = unknown> {
  id: string
  resolve?: (config: TConfig, context: ChatFeatureResolveContext) => ResolvedChatFeature
}

interface ResolvedChatFeature {
  props?: Partial<TrChatProps>
  slots?: Record<string, unknown>
  state?: Record<string, unknown>
  layout?: Partial<ChatLayoutConfig>
}
```

这里有一个重要原则：

> registry 首先服务 adapter / preset，而不是先变成 `TrChat.vue` 里的总开关。

### 10.3 为什么优先做 first-party registry

因为当前阶段最需要的是稳定性，而不是开放第三方扩展。

第一阶段 first-party registry 的价值：

- 降低硬编码分散
- 统一 feature resolution
- 让 `chat-cli` 有稳定生成目标
- 让黑盒和白盒共享同一能力底座

---

## 十一、对现有 API 的建议调整

### 11.1 `ChatConfigUI` 不建议继续无限增长

当前 `ui.brand / ui.welcome / ui.prompts` 的模式没有问题，但不建议把越来越多 feature 都继续塞进 `ui`。

原因：

- `ui` 更适合承载静态展示配置
- feature 更适合进入独立 `features` 层
- layout 更适合进入独立 `layout` 层

### 11.2 `createPresetChatProps` 应成为核心扩展汇聚层

建议让后续 feature 解析结果优先汇聚到这里。

因为它天然适合承担：

- config -> props 的标准化
- registry -> preset 的映射
- chat-cli 模板生成的稳定目标

### 11.3 `TrChatProps` 的扩展建议

不建议立即把所有 feature 都并进一个巨大的 `features` prop。

更稳的顺序应是：

1. 保留现有显式 props
2. 在 adapter / preset 层先统一 feature resolution
3. 等能力稳定后，再评估是否需要新增统一 feature 入口

如果未来真的新增 `features`，也应明确优先级与合并规则，避免和这些现有 props 冲突：

- `showHistory`
- `showFeedback`
- `messageListVariant`
- `senderProps`
- `bubbleListProps`
- `mcpManager`

---

## 十二、建议的首期落地路线

### Phase 1：先做 adapter / preset 层 feature 化

目标：

- 不破坏现有 `TrChatProps`
- 先把 feature registry 放到 config / adapter / preset 链路

建议优先落地：

- attachments
- senderActions
- suggestions

理由：

- 这三类能力最贴近当前 chat 主体价值
- 也是最适合 `chat-cli` 立即消费的能力

### Phase 2：把 MCP 能力配置化

目标：

- 把 MCP 从“运行时存在能力”提升为“配置可声明能力”

重点：

- MCP 是否启用
- MCP 面板放置位置
- MCP 创建入口的能力范围

### Phase 3：推进 docs / workspace 布局层

目标：

- 让 bubble / docs / workspace 成为更正式的布局变体

注意：

- workspace 更适合作为 layout 层和模板层能力
- 不建议过早塞进黑盒 props 作为一个单独大功能

### Phase 4：补 theme 与壳层能力

目标：

- 让 theme 成为更稳定的模板层、应用壳层能力

它应放在前面几个 feature 之后。

---

## 十三、对 `chat-cli` 的直接价值

如果按上述方式推进，`chat-cli` 将直接受益于这些能力：

1. 可基于 feature 生成稳定模板，而不是继续靠 demo 手工改造
2. 可根据 feature 组合产出不同模板变体
3. 可让 CLI flags 对应到底层真实能力，而不是先于 chat 契约扩张
4. 可减少模板对手写 `App.vue` 拼装逻辑的依赖

更具体地说，`chat-cli` 最终更适合消费的是：

```text
ChatConfig
  -> Adapter
  -> Preset
  -> Template Variant
```

而不是：

```text
直接在模板里写一堆 if/else 和手工组件拼装
```

---

## 十四、风险与边界

### 14.1 最大风险：把 feature 设计重新做成 props 爆炸

如果下一阶段继续往 `TrChat` 塞更多显式 props，而不是先沉淀 adapter / registry / preset，那么：

- 黑盒会再次膨胀
- 白盒能力会再次分裂
- `chat-cli` 很难有稳定生成目标

### 14.2 第二个风险：过早推进 workspace / theme

如果在 attachments / senderActions / suggestions / MCP config 化之前，先去推进 workspace 和 theme：

- 容易把资源投入到壳层
- 而不是聊天主体能力
- 也会削弱 `packages/chat` 作为 chat kit 的核心价值

### 14.3 第三个风险：把“组件存在”误判成“场景能力已经成立”

很多能力在 `packages/components` 已存在，但这不代表：

- 已有统一消息契约
- 已有统一布局契约
- 已有统一 feature 配置契约

文档和实现都应避免这个误判。

---

## 十五、最终结论

综合当前实现、`chat.md` 的定位和业界实践，我对这套方案的最终判断是：

### 15.1 方案总体合理

合理之处在于：

- 方向没有跑偏
- feature registry 思路正确
- config / adapter / preset 继续增强的方向正确
- 将 attachments / senderActions / suggestions / MCP 视为场景能力是正确的

### 15.2 需要修正的是阶段判断与优先级

最需要修正的不是设计目标，而是：

- 不再把已完成能力当成前置待办
- 区分“运行时能力已具备”和“配置层能力仍不足”
- 把 theme / workspace 后移
- 优先推进 feature registry + adapter/preset 化

### 15.3 更准确的下一步路线

最推荐的下一步路线是：

1. 先做 adapter / preset 层的 first-party feature registry
2. 优先做 attachments / senderActions / suggestions
3. 再把 MCP 配置化
4. 再推进 docs / workspace 布局抽象
5. 最后处理 theme 与更完整应用壳能力

一句话总结就是：

> `packages/chat` 现在不是“还没把基础打好”，而是“已经到了把运行时能力系统化升级为稳定 feature 契约的阶段”。

---

## 十六、参考链接

- Vercel AI SDK Vue Getting Started
  - <https://sdk.vercel.ai/docs/getting-started/vue>
- Vercel AI Academy: Basic Chatbot
  - <https://vercel.com/academy/ai-sdk/basic-chatbot>
- LobeChat GitHub
  - <https://github.com/lobehub/lobe-chat>
- LobeHub Plugin Development
  - <https://lobehub.com/docs/development/plugins/create-plugin>
- Ant Design X Overview
  - <https://x.ant.design/components/overview>
- MCP Getting Started
  - <https://modelcontextprotocol.io/docs/getting-started/intro>
