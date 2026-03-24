# Chat Kit Code Reading Guide

> 面向 `packages/chat` 当前实现的一份“按代码阅读顺序理解系统”的导览文档。
> 这份文档不重复设计结论，而是专门回答：
> 如果你要一边打开实际文件夹、一边把这套系统讲给别人听，最推荐按什么顺序读，为什么要这样读，每个文件在整条链路里到底负责什么。

---

## 1. 先记住一条总原则

理解 `packages/chat`，最容易出错的方式是：

- 按文件夹名字从上到下顺着读
- 一上来就从 `components/chat` 开始
- 先盯着某个页面模板或某个 feature demo 看

这样读，最后脑子里通常只会留下：

- 组件很多
- props 很多
- slot 很多
- 有 preset、有 adapter、有 composable

但很难真正回答：

- 这套系统的主链是什么
- 配置是怎么变成 UI 行为的
- preset 为什么不是第二套 runtime
- 黑盒、白盒、CLI 到底共享了什么

所以这份文档采用的阅读原则只有一句话：

> 不按文件夹顺序读，而按“对象怎么流动、能力怎么被装配、运行时怎么被建立”的顺序读。

---

## 2. 最推荐的阅读顺序

如果你要结合实际代码去理解，最清楚的顺序是：

```text
公开入口
  -> 核心对象
  -> 基础装配链
  -> preset 装配链
  -> 运行时桥接
  -> runtime 主引擎
  -> Root/context 分发
  -> 黑盒 UI 组合
  -> 白盒消费点
  -> CLI / capability / messages 等辅助层
```

把它换成实际文件，大致就是：

1. `packages/chat/src/index.ts`
2. `packages/chat/src/adapters/types.ts`
3. `packages/chat/src/features/types.ts`
4. `packages/chat/src/presets/types.ts`
5. `packages/chat/src/adapters/config.ts`
6. `packages/chat/src/features/registry.ts`
7. `packages/chat/src/presets/catalog.ts`
8. `packages/chat/src/presets/resolve.ts`
9. `packages/chat/src/components/chat/ChatPresetRoot.vue`
10. `packages/chat/src/components/chat/resolveRootChatKit.ts`
11. `packages/chat/src/composables/useChatKit.ts`
12. `packages/chat/src/components/chat/ChatRoot.vue`
13. `packages/chat/src/context.ts`
14. `packages/chat/src/components/chat/Chat.vue`
15. `packages/chat/src/components/chat/ChatMessageList.vue`
16. `packages/chat/src/components/chat/ChatSender.vue`
17. `packages/chat/src/adapters/chatCli.ts`
18. `packages/chat/src/capabilities.ts`
19. `packages/chat/src/messages.ts`
20. `packages/chat/src/internal.ts`

如果你第一次看 `packages/chat`，请尽量忍住不要先打开 `Chat.vue`。  
因为 `Chat.vue` 看到的是结果，`config.ts / resolve.ts / useChatKit.ts` 才更接近系统本体。

---

## 3. 一页脑图：先把系统轮廓钉住

在当前实现里，`packages/chat` 可以先粗略理解成下面这张图：

```text
                      ┌────────────────────────────┐
                      │         Public API         │
                      │         index.ts           │
                      └──────────────┬─────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    v                                 v
        ┌────────────────────────┐       ┌────────────────────────┐
        │   Base Config Chain    │       │    Preset Patch Chain  │
        │ adapters/config.ts     │       │ presets/catalog.ts     │
        │ features/registry.ts   │       │ presets/resolve.ts     │
        └────────────┬───────────┘       └────────────┬───────────┘
                     │                                │
                     └──────────────┬─────────────────┘
                                    v
                       ┌────────────────────────────┐
                       │   Adapter / Preset Output  │
                       │ ChatAdapter                │
                       │ presetProps                │
                       │ presetSlices               │
                       └──────────────┬─────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  v                                       v
      ┌────────────────────────────┐         ┌────────────────────────────┐
      │   Runtime Bridge / Root    │         │   Contract Consumers       │
      │ ChatPresetRoot.vue         │         │ chatCli.ts                 │
      │ ChatRoot.vue               │         │ capabilities.ts            │
      └──────────────┬─────────────┘         └────────────────────────────┘
                     │
                     v
      ┌──────────────────────────────────────────────────┐
      │                useChatKit runtime                │
      │ conversation / request / retry / edit / state   │
      └──────────────┬───────────────────────────────────┘
                     │
                     v
      ┌──────────────────────────────────────────────────┐
      │           Chat.vue + White-box Components        │
      │  Header / Welcome / MessageList / Sender / etc. │
      └──────────────────────────────────────────────────┘
```

只要这张图在脑子里立住，后面所有文件都会容易很多。

---

## 4. 第一步：先看 `index.ts`，建立“这个包到底是什么”

第一站一定是：

- [packages/chat/src/index.ts](../packages/chat/src/index.ts)

### 4.1 为什么第一眼先看它

因为它直接告诉你：

- 这个包对外暴露了哪些入口
- 这些入口之间是不是一套体系
- 团队应该把 `packages/chat` 理解成“组件集合”还是“能力入口”

### 4.2 这个文件在做什么

`index.ts` 其实在做 5 件事：

1. 引入 chat 样式
2. 暴露黑盒入口 `TrChat`
3. 把白盒子组件挂到 `TrChat` 上形成复合组件模式
4. 暴露 composables、providers、adapters、features、presets
5. 暴露所有外部要消费的类型

也就是说，`index.ts` 并不是随便做导出整理，它本身就在表达这套系统的公开边界：

```text
TrChat
  + TrChat.Root
  + TrChat.PresetRoot
  + TrChat.Layout
  + TrChat.MessageList
  + TrChat.Sender
  + TrChat.History
  + WorkspaceShell / Navigation
```

### 4.3 从这个文件最应该得出的结论

第一结论：

> `packages/chat` 不是一堆散落的聊天组件，而是一套对外统一暴露的聊天能力入口。

第二结论：

> 黑盒、白盒、preset、CLI 不是互相独立的体系，而是同一个包的不同消费面。

第三结论：

> 如果后面读代码时感觉文件很多，不要慌，因为这些文件大部分都在服务这几个公开入口。

### 4.4 读完它之后，脑子里要记住什么

读完 `index.ts` 后，建议先不要继续看组件模板，而是记住这几个问题：

- 黑盒默认入口是谁
- 白盒组合入口是谁
- preset 入口是谁
- CLI / capability / features / adapters 是否也从同一个包暴露

只要这几个问题有答案，你就不会把后面读到的每个文件都误当成“新系统”。

---

## 5. 第二步：再看类型文件，先对齐“系统里到底有哪些对象”

推荐一起看：

- [packages/chat/src/adapters/types.ts](../packages/chat/src/adapters/types.ts)
- [packages/chat/src/features/types.ts](../packages/chat/src/features/types.ts)
- [packages/chat/src/presets/types.ts](../packages/chat/src/presets/types.ts)

这一轮最重要的任务，不是背类型细节，而是给自己建立“对象地图”。

### 5.1 `ChatConfig`：声明入口

在 `adapters/types.ts` 里，`ChatConfig` 定义了系统最上层的声明面。

它关心的是：

- `models`
- `providers`
- `defaults`
- `appearance`
- `ui`
- `layout`
- `features`

所以它回答的问题是：

> 我想要一个怎样的聊天场景，它默认要有哪些能力、哪些模型、哪些 UI 配置。

注意这里非常关键的一点：

> `ChatConfig` 还不是运行时，它只是声明。

并且当前实现里，`runtime` 也不属于 `ChatConfig` 字段本身。  
真正的运行时是在更后面的 Root 层才建立出来的，顺序是：

```text
responseProvider / chatKit
  -> resolveRootChatKit
  -> useChatKit
  -> ChatRoot provide
  -> components inject
```

所以如果一开始就把 `runtime` 也算进 `ChatConfig`，会把“声明式配置” 和 “运行时建立” 这两层混在一起。

也就是说，`ChatConfig` 不负责：

- 创建消息状态
- 执行请求
- 渲染组件

### 5.2 `ResolvedChatFeatures`：能力语义的统一结果

在 `features/types.ts` 里，`ResolvedChatFeatures` 是非常重要的一层。

它本质上回答的是：

- 某个 feature 是否启用
- feature 的默认行为是什么
- 最终应该投影成哪些 `presetProps`

例如：

- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `history`
- `feedback`

这些 feature 在输入侧都可能只是一个布尔值或一个对象，但在解析之后都会变成统一的 resolution entry。

所以 `ResolvedChatFeatures` 可以理解成：

> 声明式 feature 配置经过解释之后的正式语义结果。

### 5.3 `ChatAdapter`：标准化中间层

在 `adapters/types.ts` 里，`ChatAdapter` 是这一套系统里最值得牢牢记住的对象之一。

它把下面几层东西收在一起：

- 规范化后的 `config`
- `models`
- `providerFactories`
- `defaultModel`
- `resolvedFeatures`
- `createResponseProvider()`

这说明 adapter 的位置不是“临时过渡对象”，而是：

> 配置链走完之后、进入消费层之前的标准中间层。

这点非常重要。因为后面无论是黑盒、白盒还是 CLI，本质上都在消费 adapter 产出的结果。

### 5.4 `presetProps`：整包消费投影

`ChatPresetProps` 的意义是：

- 把 adapter 里的核心结果投影成黑盒更容易直接吃的一包 props

它里面会出现：

- `models`
- `providerFactories`
- `defaultModel`
- `appearance`
- `brand`
- `welcome`
- `prompts`
- feature 投影结果

所以你可以把它理解为：

> 给默认黑盒消费准备的一份“整包结果”。

### 5.5 `presetSlices`：分部位消费投影

`ChatPresetSlices` 再往前走一步，把整包 props 再切成：

- `root`
- `layout`
- `appearance`
- `header`
- `welcome`
- `messageList`
- `sender`
- `history`
- `modelSelector`

这层不是重复设计，它是在回答另一个问题：

> 如果我不是整包吃，而是按部位组合，我应该怎么稳定消费这套结果？

所以：

- `presetProps` 更适合黑盒
- `presetSlices` 更适合白盒和 CLI

### 5.6 `AgentPreset / SkillPack`：高层配置抽象

在 `presets/types.ts` 里，`AgentPresetInput` 和 `SkillPackInput` 是高层场景抽象。

它们能定义：

- `defaults`
- `ui`
- `layout`
- `features`
- `mcp`
- `runtime`

其中 `AgentPresetInput` 还支持：

- `extends`
- `skills`

所以它们表达的不是页面和运行时，而是：

- 哪些公共能力应该复用
- 哪些场景默认应该怎么叠加配置

结论一定要记住：

> `AgentPreset / SkillPack` 是配置抽象，不是第二套组件系统，也不是第二套运行时。

---

## 6. 第三步：进入基础装配链，先把主链读通

推荐先看：

- [packages/chat/src/adapters/config.ts](../packages/chat/src/adapters/config.ts)
- [packages/chat/src/features/registry.ts](../packages/chat/src/features/registry.ts)

如果说整个 `packages/chat` 只有一条最核心的工程主链，那就是这一段。

### 6.1 先看 `config.ts` 的四个关键函数

这个文件里最值得抓住的是四个函数：

1. `loadChatConfig()`
2. `createChatAdapterFromConfig()`
3. `createPresetChatProps()`
4. `createPresetChatSlices()`

把这四个函数连起来，就是：

```text
input
  -> loadChatConfig()
  -> ChatConfig
  -> createChatAdapterFromConfig()
  -> ChatAdapter
  -> createPresetChatProps()
  -> presetProps
  -> createPresetChatSlices()
  -> presetSlices
```

这条链建议你至少反复读两遍，因为后面的 preset、black-box、CLI，全都要回到这里。

### 6.2 `loadChatConfig()` 在做什么

`loadChatConfig()` 的角色是“规范化入口”。

它不是简单地原样返回配置，而是在做很多兜底和约束：

- 校验 `models` 和 `providers`
- 校验模型引用的 provider 是否存在
- 规范化 `ui`
- 规范化 `appearance`
- 规范化 `layout`
- 规范化 `features`
- 规范化 `runtime`

最值得注意的是，它把一堆零散的输入结构先收口成统一的 `ChatConfig`。

例如在 feature 这层，它会把：

- `attachments`
- `senderActions`
- `welcomePrompts`
- `mcp`
- `history`
- `feedback`

都规整成统一格式。

其中还做了一个兼容行为：

- `rawFeatures.welcomePrompts ?? rawFeatures.suggestions`

这说明代码在兼容旧命名，但主链已经收口到 `welcomePrompts`。

### 6.3 为什么要先在这里做 normalize

因为如果不先规范化，后面每一层都得自己做判断：

- 是 boolean 还是 object
- 字段有没有默认值
- provider 能不能匹配上 model
- layout 是否合法
- runtime 是否和 feature 有联动

那样的结果就是：

- 逻辑四处分散
- 每个消费面都要自己兜底
- 黑盒和白盒容易不一致

所以 `loadChatConfig()` 的意义不是“写得长”，而是：

> 统一把松散输入收口成稳定配置对象。

### 6.4 `resolveChatFeatures()` 为什么要单独存在

接着看 `features/registry.ts`。

这个文件是当前实现里最容易被低估的一层，因为它看起来只是几段 `resolve()`，但其实它定义了 feature 语义边界。

它回答的是：

- 启没启用
- 默认行为是什么
- 最终投影成哪些 `presetProps`

比如：

- `attachments` 被解释成 `attachmentsFeature`
- `senderActions` 被解释成 `senderActionsFeature`
- `welcomePrompts` 被解释成 `prompts`
- `history` 被解释成 `showHistory + historyProps`
- `feedback` 被解释成 `showFeedback`

这层最核心的价值在于：

> feature 的语义不再散落在页面、slot 和 demo 里，而是先回到统一解析层。

### 6.5 `createChatAdapterFromConfig()`：主链真正进入“可消费状态”

这一步最重要，因为它把前面的声明与解析，真正变成可消费的结果。

它做的事情是：

1. 调用 `loadChatConfig()` 拿到规范化配置
2. 调用 `resolveChatFeatures()` 拿到统一 feature 结果
3. 生成 `models`
4. 生成 `providerFactories`
5. 推导 `defaultModel`
6. 构造 `createResponseProvider()`

这一层之后，系统已经具备：

- 能选择模型
- 能匹配 provider
- 能根据模型创建 response provider
- 能稳定产出 feature 投影结果

所以 adapter 不是“UI 之前的临时步骤”，它其实已经把聊天场景转换成一个正式可消费的能力对象。

### 6.6 `createPresetChatProps()`：把 adapter 投影成黑盒更容易吃的结果

这一步的重点不是“拷贝字段”，而是“面向消费重新整理结构”。

它会把 adapter 里的结果整理成：

- 基础模型能力
- UI 相关能力
- layout 相关能力
- feature resolve 相关能力
- runtime 相关能力

例如：

- `messageListVariant` 来自 `config.layout.variant`
- `roleConfigs` 来自 `config.layout.placements`
- `mcpManager` 来自 `config.runtime`
- feature 对应结果来自 `resolvedFeatures.presetProps`

所以这一步的意义是：

> 把内部中间层翻译成黑盒消费者更自然的 props 形态。

### 6.7 `createPresetChatSlices()`：从整包结果切出稳定的部位

很多人第一次看到这里会问：

> 已经有 `presetProps` 了，为什么还要切 slices？

答案是因为消费方式不同。

黑盒喜欢一整包吃：

- 直接把默认行为都喂给 `TrChat`

白盒和 CLI 更喜欢分部位吃：

- root 关心什么
- header 关心什么
- sender 关心什么
- history 关心什么

所以这一步是把“整包结果”翻译成“按部位消费结果”。

也就是说，`presetSlices` 是架构上的正式结果，而不是为了某个 demo 临时拆字段。

### 6.8 读完这一步后，你应该能回答什么

读完 `config.ts + registry.ts`，你应该已经能清楚回答：

- `ChatConfig` 如何被规范化
- feature 为什么要先 resolve
- adapter 为什么是正式中间层
- `presetProps` 和 `presetSlices` 分别是为谁准备的

如果这一步没讲顺，后面无论看 `presets` 还是看 `Chat.vue`，都容易把“结果层”误当成“实现起点”。

---

## 7. 第四步：再看 presets，理解公共配置怎么抽、怎么并回主链

推荐先看：

- [packages/chat/src/presets/catalog.ts](../packages/chat/src/presets/catalog.ts)
- [packages/chat/src/presets/resolve.ts](../packages/chat/src/presets/resolve.ts)

顺序一定建议先 `catalog.ts`，再 `resolve.ts`。

### 7.1 为什么先看 `catalog.ts`

因为这个文件先回答：

> 当前系统到底在抽什么公共配置。

它定义了两种东西：

- `BUILT_IN_SKILL_PACKS`
- `BUILT_IN_AGENT_PRESETS`

从当前实现看，内置 skill pack 有：

- `conversation-core`
- `docs-layout`
- `tool-agent-core`

内置 preset 有：

- `assistant-base`
- `docs-reader`
- `tool-agent`

### 7.2 `SkillPack` 和 `AgentPreset` 到底有什么区别

最容易记住的讲法是：

- `SkillPack` 更像公共配件
- `AgentPreset` 更像最终场景型号

例如：

`conversation-core`

- 开启 `history`
- 开启 `feedback`

它定义的是“对话型助手常用能力”，而不是某个最终品牌或页面。

`docs-layout`

- 设置 `layout.variant = docs`
- 设置 message placement
- 配一套 docs 场景欢迎区

它定义的是“docs 风格能力包”。

`assistant-base`

- 绑定 `conversation-core`
- 设定基础 `systemPrompt`
- 给出基础 prompts

它已经开始像一个基础场景了。

`docs-reader`

- `extends: ['assistant-base']`
- `skills: ['docs-layout']`
- 再补 `brand.title`

它是在已有基础上组合出最终场景。

### 7.3 `resolve.ts` 在回答什么

`resolve.ts` 不是在创建 UI，也不是在运行消息逻辑。  
它只回答一个问题：

> 一堆 preset / skill pack 叠在一起后，最后该得到怎样的 `ChatConfig patch`？

这里面最关键的函数是：

- `resolveAgentPreset()`
- `applyAgentPresetToConfig()`
- `createChatAdapterFromAgentPreset()`
- `createPresetConsumptionFromAgentPreset()`

### 7.4 `resolveAgentPreset()`：先把 preset 链和 skill 链都展开

这一层最关键的事有两件：

1. 展开 `extends` 继承链
2. 展开每个 preset 上挂的 `skills`

也就是说，当前逻辑不是简单地“把当前 preset 合进去”，而是：

```text
父 preset
  -> 父 preset 的 skills
  -> 父 preset 自己
  -> 当前 preset 的 skills
  -> 当前 preset 自己
```

这一步最后会得到：

- `presetChain`
- `skillPacks`
- `chatConfigPatch`

### 7.5 `applyAgentPresetToConfig()`：把高层 patch 合并回基础配置

这一层很关键，因为它证明了一件事：

> preset 最后还是要回到 `ChatConfig` 主链。

也就是说，`presets` 并没有跳过 `config.ts` 和 `adapter` 这条链，而是先生成 patch，再 merge 回基础配置。

所以它不是第二套系统，而是主链前面的高层装配入口。

### 7.6 `createChatAdapterFromAgentPreset()` 和 `createPresetConsumptionFromAgentPreset()`

这两个函数本质上是在做“接回主链”：

- 先把 preset 解析结果合并成最终 `ChatConfig`
- 再走 `createChatAdapterFromConfig()`
- 再产出 `presetProps`
- 再产出 `presetSlices`

它说明了一件非常本质的事：

> 高层 preset 抽象再复杂，最后还是必须回到 adapter 和 preset output 这条统一主链。

### 7.7 用 `docs-reader` 走一遍最容易理解

可以用当前内置的 `docs-reader` 做一个最具体的理解：

```text
docs-reader
  extends assistant-base
  skills docs-layout

assistant-base
  skills conversation-core
```

最终效果等价于：

```text
baseConfig
  + conversation-core
  + assistant-base
  + docs-layout
  + docs-reader
  = final ChatConfig
```

然后这份 `final ChatConfig` 会继续走：

```text
final ChatConfig
  -> createChatAdapterFromConfig()
  -> createPresetChatProps()
  -> createPresetChatSlices()
```

到这里为止，你应该已经很明确：

- preset 的职责是“抽公共配置并叠 patch”
- adapter 的职责是“把配置翻译成标准化可消费能力”

---

## 8. 第五步：看 `ChatPresetRoot`，理解装配链怎么接到运行时

推荐先看：

- [packages/chat/src/components/chat/ChatPresetRoot.vue](../packages/chat/src/components/chat/ChatPresetRoot.vue)
- [packages/chat/src/components/chat/resolveRootChatKit.ts](../packages/chat/src/components/chat/resolveRootChatKit.ts)

这是非常值得重点看的桥接层。

### 8.1 为什么这个文件重要

前面几步都在讲：

- 怎么得到 `ChatConfig`
- 怎么得到 adapter
- 怎么得到 `presetProps / presetSlices`

但还没有回答：

> 这些结果怎么真正进入 `ChatRoot` 和 `chatKit`？

`ChatPresetRoot.vue` 就是在回答这个问题。

### 8.2 `ChatPresetRoot.vue` 做了哪三件事

第一件事：

- 调用 `resolveRootChatKit()` 得到 `chatKit`

第二件事：

- 调用 `createPresetConsumptionFromAgentPreset()`，把 preset 解析成：
  - `resolvedPreset`
  - `chatConfig`
  - `adapter`
  - `presetProps`
  - `presetSlices`

第三件事：

- 把 `presetSlices.root` 里的 root 级能力喂给 `ChatRoot`

所以它本质上就是：

```text
preset chain
  -> preset consumption
  -> ChatRoot
  -> runtime tree
```

### 8.3 `resolveRootChatKit.ts` 在做什么

这个文件很小，但位置非常关键。

它回答的是：

- 如果外部已经给了 `chatKit`，那就直接用
- 如果没给 `chatKit`，那就要求至少给 `responseProvider`
- 然后用 `useChatKit()` 创建 runtime

也就是说，Root 层 runtime 的来源有两种：

1. 外部提供完整 `chatKit`
2. 内部用 `responseProvider` 创建 `chatKit`

这是黑盒和白盒能共存的重要基础。

### 8.4 读完这一步你要明白什么

你要明白：

- preset 输出不会直接渲染页面
- preset 输出要先接到 root
- root 会把能力进一步接到 runtime

这一步是“配置世界”和“运行时世界”的交界处。

### 8.5 这里最好单独补一张“运行时进入图”

如果你要给别人讲清楚运行时链，建议直接把入口分成三条讲：

```text
黑盒入口
  Chat.vue
    -> useChatKit()
    -> ChatRoot
    -> provide runtime context
    -> Header / MessageList / Sender / History

白盒入口（传 responseProvider）
  TrChat.Root
    -> resolveRootChatKit()
    -> useChatKit()
    -> ChatRoot
    -> provide runtime context
    -> White-box consumers

白盒入口（传 chatKit）
  external chatKit
    -> TrChat.Root
    -> ChatRoot
    -> provide runtime context
    -> White-box consumers
```

这张图最重要的意义是把三件事拆开：

- 运行时入口是谁
- 运行时主引擎是谁
- 运行时分发层是谁

更准确地说：

- `useChatKit` 是运行时主引擎
- `ChatRoot + context.ts` 是运行时分发层
- `Header / MessageList / Sender / History` 是运行时消费者

这样讲，黑盒和白盒为什么能共享同一套 runtime，就会清楚很多。

---

## 9. 第六步：单独读 `useChatKit.ts`，它才是运行时核心

推荐重点读：

- [packages/chat/src/composables/useChatKit.ts](../packages/chat/src/composables/useChatKit.ts)

如果说前面几步是在讲“系统怎么装配”，那么这一节就是在讲“系统怎么真正跑起来”。

但这里最好补一句边界说明：

> `useChatKit` 是运行时主引擎，不是完整运行时链的全部。

完整运行时链至少还包括：

- 入口解析：`Chat.vue` / `resolveRootChatKit.ts`
- 主引擎建立：`useChatKit.ts`
- 运行时分发：`ChatRoot.vue`
- 上下文契约：`context.ts`
- 最终消费：`Header / MessageList / Sender / History`

### 9.1 为什么一定要单独看它

因为很多人第一次看 chat 代码时，会下意识从 `Chat.vue` 模板理解运行时。

但在当前实现里，真正的聊天状态主引擎并不在模板里，而在 `useChatKit()`。

这里统一组织了：

- conversation state
- request state
- retry state
- optimistic turn
- edit rollback
- message edit actions

### 9.2 它内部组合了哪些更小的能力

这个文件会组合：

- `useChatConversation()`
- `useChatRequest()`
- `useChatMessages()`

这说明它不是简单“包装一下”，而是在把多个子能力收束成统一 facade。

你可以把它理解为：

```text
useChatKit
  = chat runtime facade
```

但如果你要给别人讲得更准确，最好再补一句：

```text
useChatKit
  = runtime engine / facade

ChatRoot + context
  = runtime distribution layer

components
  = runtime consumers
```

### 9.3 这个文件最值得重点看的几段

第一段是错误与重试上下文：

- `retryContext`
- `clearFailureState()`
- `retry()`

这部分回答的是：

- 失败后是否还能重试
- 重试时如何回到对应 turn
- 为什么能知道该删掉哪段失败消息

第二段是 optimistic turn：

- `optimisticTurn`
- `markOptimisticTurn()`
- `clearOptimisticTurn()`

这部分回答的是：

- 用户发送后，界面如何立即表现出“正在生成”
- user/assistant 这一轮怎样被标记成同一个 turn

第三段是编辑回滚：

- `editRollbackContext`
- `onOptimisticEdit`

这部分回答的是：

- 如果用户编辑消息后重新发起
- 请求失败时，之前删掉的消息如何恢复

### 9.4 这一步读完后最关键的理解

你要明确：

> `Header / MessageList / Sender / History` 这些组件，不是在各自维护聊天逻辑，它们是在消费同一个 `useChatKit` runtime。

这也是为什么这套系统能同时支持黑盒和白盒，而不会拆成多套消息逻辑。

---

## 10. 第七步：看 `ChatRoot` 和 `context.ts`，理解 runtime 怎么被分发

推荐看：

- [packages/chat/src/components/chat/ChatRoot.vue](../packages/chat/src/components/chat/ChatRoot.vue)
- [packages/chat/src/context.ts](../packages/chat/src/context.ts)

### 10.1 `ChatRoot.vue` 是什么角色

这个文件不是普通壳组件，它更准确地说是运行时解析与分发点。

它主要做几件事：

1. 解析 `chatKit` 或 `responseProvider`
2. 在需要时通过 `resolveRootChatKit()` 建立 runtime
3. 解析 messages 文案
4. 建立附件管理器
5. 通过 provide 把 root 级能力下发给子树

它 provide 的内容包括：

- `CHAT_KIT_KEY`
- `CHAT_UI_KEY`
- `CHAT_MESSAGES_KEY`
- `MCP_MANAGER_KEY`
- `CHAT_ATTACHMENTS_KEY`
- `CHAT_SENDER_ACTIONS_KEY`

### 10.2 为什么 `context.ts` 要单独看

`context.ts` 很适合作为“运行时总线地图”来看。

因为它把整棵组件树共享的上下文键都放在一起了。

你可以从这里快速看出：

- 哪些能力是 root 级注入
- 哪些能力是 message list 级注入
- 哪些能力是 layout/history 级注入

它本质上是在告诉你：

> 当前组件树共享 runtime 的方式，不是层层 props 传递，而是 provide/inject。

如果要讲得更清楚，还可以直接把它定义成：

> `context.ts` 不是附录文件，而是运行时分发契约本身。

### 10.3 为什么这一步能解释黑盒/白盒共享问题

因为只要你看懂了 Root + context，就能明白：

- 黑盒内部也会走这套 provide
- 白盒组件也会 inject 这套上下文

所以两者共用的不是“长得像的模板”，而是：

- 同一份 `chatKit`
- 同一套 feature/runtime context

这也是整个架构里最稳定的共享基础之一。

---

## 11. 第八步：再看 `Chat.vue`，这时你看到的才是“结果层”

推荐看：

- [packages/chat/src/components/chat/Chat.vue](../packages/chat/src/components/chat/Chat.vue)

这一步一定放在前面几步之后。

### 11.1 为什么不要先看它

因为它是默认黑盒装配器。

如果你一开始就看它，看到的会是：

- 组件组合
- slot 分支
- props 转发
- welcome / message list / sender 的渲染逻辑

这样很容易误以为：

> `packages/chat` 的实现核心就是这棵模板树。

其实不是。  
它只是默认黑盒消费面。

### 11.2 `Chat.vue` 在当前实现里负责什么

它主要做这几件事：

1. 用模型和 provider 逻辑创建默认 `chatKit`
2. 管理当前选择的 model
3. 调用 `ChatRoot` 建立 runtime 上下文
4. 用 `ChatLayout` 组织页面结构
5. 在 welcome、message list、sender、history 之间做默认装配

所以更准确的说法是：

> `Chat.vue` 是默认黑盒装配器，而不是运行时主引擎。

### 11.3 这个文件怎么和前面几步对上

它会依赖：

- `useChatKit()` 来跑运行时
- `resolveChatMessages()` 来取文案
- `ChatRoot` 来下发上下文
- `props` / `presetProps` 来驱动 UI 行为

换句话说，它本身是在消费前面已经装配好的能力，而不是从零定义能力。

### 11.4 这一步最适合讲什么

最适合讲：

- 默认黑盒的“成品体验”是什么
- 为什么黑盒能一站式吃下模型、欢迎区、消息区、输入区、历史区
- 为什么这些默认行为本质上还是在消费主链结果

---

## 12. 第九步：再看几个白盒组件，理解“按部位消费”到底长什么样

推荐按下面顺序看：

- [packages/chat/src/components/chat/ChatMessageList.vue](../packages/chat/src/components/chat/ChatMessageList.vue)
- [packages/chat/src/components/chat/ChatSender.vue](../packages/chat/src/components/chat/ChatSender.vue)
- [packages/chat/src/components/chat/ChatHeader.vue](../packages/chat/src/components/chat/ChatHeader.vue)

如果你还有余力，再看：

- `components/workspace/*`

### 12.1 为什么白盒组件不用一口气全看

因为白盒组件的数量不少，但它们大部分都不是“系统中枢”，而是在消费 root/runtime。

真正重要的是看清楚一种模式：

> 每个白盒组件是如何围绕 `chatKit` 和 context 工作的。

### 12.2 `ChatMessageList.vue` 适合看什么

它适合看：

- 如何从 `CHAT_KIT_KEY` 拿消息
- 如何消费 `MESSAGE_ACTION_KEY`
- 如何和 bubble slots 结合

也就是说，这个文件更适合帮助你理解：

- 消息区不是自己维护数据
- 消息区是在消费 root/runtime 提供的上下文

### 12.3 `ChatSender.vue` 适合看什么

它适合看：

- sender 如何和 `chatKit.sendMessage()` 打通
- sender 如何消费 attachments/sender actions 这类 root feature

这里最值得理解的是：

- 附件与输入能力不是 sender 自己发明的
- sender 是在消费 root 已经提供好的能力结果

### 12.4 `ChatHeader.vue` 适合看什么

它适合看：

- header 如何消费 UI state
- history/fullscreen/close 等行为如何与 Root/Layout 协作

这会帮助你理解：

- UI 壳层并不承担聊天主逻辑
- 它更多是在消费已存在的状态和能力

### 12.5 `workspace` 目录适合什么时候看

建议你把 `workspace` 相关文件放在后面看。

因为它们更像建立在聊天 runtime 之上的高级布局消费层，例如：

- `WorkspaceShell`
- `WorkspacePanelHost`
- `ContentNavigationHost`
- `ConversationTurnNavigation`

如果前面的主链还没看顺，就直接看它们，很容易被“左右布局”“导航宿主位”“面板插槽”这些 UI 结构带偏。

---

## 13. 第十步：最后看 CLI、capability、messages、internal 这些辅助层

最后推荐看：

- [packages/chat/src/adapters/chatCli.ts](../packages/chat/src/adapters/chatCli.ts)
- [packages/chat/src/capabilities.ts](../packages/chat/src/capabilities.ts)
- [packages/chat/src/messages.ts](../packages/chat/src/messages.ts)
- [packages/chat/src/internal.ts](../packages/chat/src/internal.ts)

这些文件不是主链起点，但它们能很好地帮助你理解系统边界。

### 13.1 `chatCli.ts`：证明这套系统不是“页面专属实现”

`createChatCliCapabilitySurface()` 很适合放在最后看。

因为它会把 adapter 重新投影成：

- `featureKeys`
- `presetProps`
- `presetSlices`

这里最值得理解的是：

> CLI 不直接消费页面，而是在消费一套稳定的 capability contract。

所以这个文件在架构上非常重要，它证明了当前系统的主线不是：

- Vue 页面模板链

而是：

- 能力装配与能力投影链

### 13.2 `capabilities.ts`：把 contract 再做成 manifest

这个文件继续往外走一步，把：

- feature key
- preset prop key
- preset slice key
- built-in skill packs
- built-in presets

整理成能力清单。

它的意义是：

> 系统不仅能运行，还能把“可消费能力面”显式暴露出来。

这对 CLI、模板生成、后续更高层工具都很重要。

### 13.3 `messages.ts`：不要忽略它，它说明 chat 拥有自己的文案层

这个文件不是架构主线，但非常值得看，因为它说明：

- chat 包已经拥有自己的一份集中式文案
- 这层文案通过 `resolveChatMessages()` 合并 override
- 最后通过 `CHAT_MESSAGES_KEY` 注入给组件消费

也就是说，系统里除了业务能力链，还有一条辅助的 UI copy 链。

它回答的是：

- header 的文案从哪里来
- sender placeholder 从哪里来
- feedback / error / history 等默认文案从哪里来

### 13.4 `internal.ts`：对外暴露一部分内部上下文契约

这个文件很短，但它的存在说明了一件事：

> 当前包允许外部更底层地接入某些内部上下文边界。

它并不属于主链核心，但对高级消费者来说，是一个信号：

- 某些 key 和常量是允许外部理解与复用的

---

## 14. 如果你要给别人讲，可以按下面这条口头顺序讲

下面这套讲法最适合一边开文件、一边讲：

### 14.1 第一句先讲包的定位

先开 `index.ts`，讲：

> `packages/chat` 不是一组聊天页面组件，而是一套同时服务黑盒、白盒、preset 和 CLI 的聊天能力入口。

### 14.2 第二句讲系统里有哪些对象

再开三份 types，讲：

> 这套系统真正流动的对象主要有五层：`ChatConfig`、`ResolvedFeatures`、`ChatAdapter`、`presetProps/presetSlices`、`chatKit`。

### 14.3 第三句讲基础装配链

再开 `config.ts + registry.ts`，讲：

> 先把松散输入规整成 `ChatConfig`，再把 feature 解析成统一结果，再生成 adapter，最后把 adapter 投影成黑盒和白盒都能吃的 preset 输出。

### 14.4 第四句讲 presets 的位置

再开 `catalog.ts + resolve.ts`，讲：

> presets 不是第二套 runtime，它只是把公共配置抽成 `SkillPack` 和 `AgentPreset`，最后仍然回到 `ChatConfig -> Adapter -> Preset Output` 这条主链。

### 14.5 第五句讲 runtime 怎么建立

再开 `Chat.vue + ChatPresetRoot.vue + resolveRootChatKit.ts + useChatKit.ts`，讲：

> 黑盒会在 `Chat.vue` 里直接建立 `chatKit`，白盒会在 `TrChat.Root / resolveRootChatKit` 里决定是复用外部 `chatKit` 还是内部创建，但真正统一的运行时主引擎始终是 `useChatKit`，这里才是真正的会话、请求、重试、编辑回滚所在。

### 14.6 第六句讲 runtime 怎么分发，再讲组件层只是消费面

再开 `ChatRoot.vue + context.ts + Chat.vue + ChatMessageList.vue + ChatSender.vue`，讲：

> `ChatRoot + context.ts` 负责把同一个 runtime 分发给整棵组件树；组件层不是从零定义聊天逻辑，而是在消费同一个 runtime 和同一组 root context。

### 14.7 第七句用 CLI 收尾

最后开 `chatCli.ts + capabilities.ts`，讲：

> CLI 也不是复制页面，它在消费同一套 capability contract，这正说明当前架构主线是能力链，不是页面链。

---

## 15. 你读代码时最容易混淆的几个点

### 15.1 不要把 `Chat.vue` 当成系统起点

它是黑盒默认消费器，不是架构起点。

### 15.2 不要把 `presets` 当成第二套 runtime

它只是高层配置抽象，最终一定回主链。

### 15.3 不要把 `feature registry` 当成“多余的一层”

它是在把 feature 语义统一收口，否则 feature 会散落到页面和 demo 里。

### 15.4 不要把 `presetProps` 和 `presetSlices` 看成重复设计

它们对应两种不同消费方式：

- 整包吃
- 按部位吃

### 15.5 不要把白盒理解成“另一套实现”

白盒只是更显式地消费同一个 `chatKit` 和同一份上下文。

---

## 16. 如果你只给自己留 20 分钟，最小阅读集是什么

如果你今天只想先把主线打通，建议至少看这 10 个文件：

1. [packages/chat/src/index.ts](../packages/chat/src/index.ts)
2. [packages/chat/src/adapters/types.ts](../packages/chat/src/adapters/types.ts)
3. [packages/chat/src/adapters/config.ts](../packages/chat/src/adapters/config.ts)
4. [packages/chat/src/features/registry.ts](../packages/chat/src/features/registry.ts)
5. [packages/chat/src/presets/catalog.ts](../packages/chat/src/presets/catalog.ts)
6. [packages/chat/src/presets/resolve.ts](../packages/chat/src/presets/resolve.ts)
7. [packages/chat/src/components/chat/ChatPresetRoot.vue](../packages/chat/src/components/chat/ChatPresetRoot.vue)
8. [packages/chat/src/composables/useChatKit.ts](../packages/chat/src/composables/useChatKit.ts)
9. [packages/chat/src/components/chat/ChatRoot.vue](../packages/chat/src/components/chat/ChatRoot.vue)
10. [packages/chat/src/adapters/chatCli.ts](../packages/chat/src/adapters/chatCli.ts)

只要这 10 个文件看通了，你对当前 `packages/chat` 的理解就已经会非常扎实。

---

## 17. 最后一句总结

理解 `packages/chat` 最好的方式，不是把它看成“聊天组件目录”，而是把它看成：

> 一条从声明式配置出发，经过 feature 解析、preset 装配、runtime 建立，最后同时服务黑盒、白盒和 CLI 的聊天能力实现链。

如果你顺着这份文档的顺序去看代码，后面再回头看 `components/`、`workspace/`、`history/` 等目录，会比一开始直接钻模板轻松很多。
