可以，我们把 `ResolvedChatFeatures` 当成“`features` 配置的解释结果”来看，就会好理解很多。

**一句话先记住**
`ResolvedChatFeatures` 不是让你再配一次 feature。  
它是把 `ChatConfig.features` 这种“声明式输入”，转换成“系统可直接消费的结果”。

相关文件：
- 类型定义在 [packages/chat/src/features/types.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/types.ts)
- 解析逻辑在 [packages/chat/src/features/registry.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/registry.ts)
- 进入主链的位置在 [packages/chat/src/adapters/config.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/config.ts)

**先看这一步之前的数据长什么样**
这一步之前，数据在 `ChatConfig.features` 里，类型是 `ChatFeatureConfigMap`。它的特点是：

- 它还是“声明”
- 每个 feature 可以是 `boolean`
- 也可以是带参数的对象
- 默认值还没完全补齐
- UI 还不能直接拿来用

比如输入可能是这样：

```ts
const features = {
  attachments: {
    upload: {
      accept: 'image/*',
    },
  },
  senderActions: {
    voice: true,
    wordCount: true,
  },
  history: true,
  feedback: false,
}
```

这里有几个特点：

- `attachments.enabled` 没写
- `attachments.upload.enabled` 没写
- `senderActions.voice` 这种写法还只是声明意图
- `history: true` 还没变成 `showHistory: true`
- `feedback: false` 只是原始配置，不是最终消费结果

所以这一步之前的 `features`，你可以理解成：

> “我想启用什么能力，大概怎么配。”

**经过这一步之后，数据变成什么**
经过 `resolveChatFeatures()` 后，会变成 `ResolvedChatFeatures`，它有 3 块最重要的内容：

1. `entries`
每个内置 feature 都会变成一个完整 entry。

比如：
- `entries.attachments`
- `entries.senderActions`
- `entries.welcomePrompts`
- `entries.mcp`
- `entries.history`
- `entries.feedback`

每个 entry 里都会有：
- `key`
- `enabled`
- `config`
- `presetProps`

2. `enabledKeys`
把当前真正启用的 feature key 收成一个数组。

比如：
```ts
['attachments', 'senderActions', 'history']
```

3. `presetProps`
把所有 feature 解析后的“可投影结果”合并成一包，后面直接给 `createPresetChatProps()` 用。

**最关键的是：它不是只回答“开没开”**
它同时回答 3 个问题：

1. 这个 feature 最终是否启用
2. 如果启用，默认行为是什么
3. 这个 feature 最终应该投影成哪些 `TrChat` 可消费的 props

---

**我拿一个例子带你走一遍**

假设原始输入是：

```ts
const features = {
  attachments: {
    upload: {
      accept: 'image/*',
    },
  },
  history: true,
  feedback: false,
}
```

进入 `resolveChatFeatures(features)` 之后，大概会得到这样的结果：

```ts
{
  entries: {
    attachments: {
      key: 'attachments',
      enabled: true,
      config: {
        upload: {
          accept: 'image/*',
        },
      },
      presetProps: {
        attachmentsFeature: {
          enabled: true,
          upload: {
            enabled: true,
            accept: 'image/*',
            multiple: true,
            tooltip: '上传附件',
            tooltipPlacement: 'top',
          },
          list: {
            variant: 'card',
            wrap: true,
          },
        },
      },
    },

    history: {
      key: 'history',
      enabled: true,
      config: true,
      presetProps: {
        showHistory: true,
        historyProps: undefined,
      },
    },

    feedback: {
      key: 'feedback',
      enabled: false,
      config: false,
      presetProps: {},
    },

    ...
  },

  enabledKeys: ['attachments', 'history'],

  presetProps: {
    attachmentsFeature: {
      enabled: true,
      upload: {
        enabled: true,
        accept: 'image/*',
        multiple: true,
        tooltip: '上传附件',
        tooltipPlacement: 'top',
      },
      list: {
        variant: 'card',
        wrap: true,
      },
    },
    showHistory: true,
  },
}
```

**你要重点观察 3 个变化**

第一，`boolean / object` 这种松散声明，变成了统一结构。  
原来每个 feature 写法不一样，现在每个 entry 都有：

- `key`
- `enabled`
- `config`
- `presetProps`

第二，默认值在这里被补齐了。  
比如你只写了：

```ts
attachments: {
  upload: {
    accept: 'image/*'
  }
}
```

但解析后系统会自动补出：

- `enabled: true`
- `multiple: true`
- `tooltip: '上传附件'`
- `list.variant: 'card'`
- `list.wrap: true`

第三，已经开始转成 UI 可消费的东西了。  
原始输入是 `history: true`，解析后变成：

```ts
presetProps: {
  showHistory: true
}
```

这个就已经是组件层更容易直接消费的形态了。

---

**它到底解决什么问题**
如果没有 `ResolvedChatFeatures`，后面的代码都得自己理解 feature：

- `Chat.vue` 自己判断 `history: true` 该怎么变成 UI
- `ChatSender.vue` 自己判断 `senderActions` 默认值
- `ChatAttachments.vue` 自己判断附件上传默认行为
- CLI 也得自己猜哪些字段有意义

这样会出 3 个问题：

1. 默认值分散
同一个 feature 的默认行为可能散在多个组件里。

2. 黑盒白盒不一致
黑盒可能按一种解释，白盒可能按另一种解释。

3. CLI 很难复用
因为 CLI 没法稳定知道 feature 最终映射成什么 contract。

所以 `ResolvedChatFeatures` 的真正作用是：

> 把 feature 从“配置声明”提升成“统一语义结果”。

---

**你可以把它理解成一个翻译层**
最适合记忆的比喻是：

- `ChatConfig.features` 是“需求单”
- `ResolvedChatFeatures` 是“施工图”
- `presetProps` 是“能直接交给下游的材料包”

也就是：

```text
features 原始配置
  -> resolveChatFeatures()
  -> ResolvedChatFeatures
  -> adapter.resolvedFeatures
  -> createPresetChatProps()
  -> TrChat / TrChat.Root / chat-cli 消费
```

---

**再说一下 `entries`、`enabledKeys`、`presetProps` 三者的关系**
你可以这样记：

- `entries`：最完整的解释结果，适合系统内部看细节
- `enabledKeys`：快速知道哪些 feature 真的开了
- `presetProps`：给下游消费的投影结果

所以：

- 想看“某个 feature 最终怎么解释的”，看 `entries`
- 想看“当前哪些能力开了”，看 `enabledKeys`
- 想看“最后给组件/CLI什么结果”，看 `presetProps`

---

**最后我用最短的话再帮你收一下**
`ResolvedChatFeatures` 就是把这种输入：

```ts
features: {
  history: true,
  attachments: { upload: { accept: 'image/*' } }
}
```

变成这种结果：

```ts
{
  entries: { ...完整语义... },
  enabledKeys: ['history', 'attachments'],
  presetProps: {
    showHistory: true,
    attachmentsFeature: { ...默认值补齐后的结果... }
  }
}
```

所以它的本质不是“多一层类型”，而是：

> 统一解释 feature，补齐默认值，并把结果投影给后续 adapter / preset / UI / CLI 使用。

那我们就只看 `attachments` 这一个 feature。它其实是理解 `ResolvedChatFeatures` 最好的例子。

先给你一句最核心的话：

> `ResolvedChatFeatures` 做的事，不是“保存原始配置”，而是“把原始配置解释成系统可直接消费的结果”。

相关文件你可以对着看：
- [config.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/config.ts)
- [registry.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/registry.ts)
- [types.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/types.ts)
- [ChatRoot.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatRoot.vue)
- [ChatSender.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatSender.vue)
- [ChatAttachments.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatAttachments.vue)
- [useChatAttachments.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/useChatAttachments.ts)

**1. 这一步之前，数据是什么样**
最开始它在 `ChatConfig.features.attachments` 里，属于“声明式输入”。

类型大意是：

```ts
type ChatAttachmentsFeatureConfig =
  | boolean
  | {
      enabled?: boolean
      upload?: { ... }
      list?: { ... }
    }
```

所以外部可以这样写：

```ts
features: {
  attachments: true
}
```

也可以写：

```ts
features: {
  attachments: {
    upload: {
      accept: 'image/*',
      multiple: false,
    },
    list: {
      variant: 'card',
    },
  },
}
```

这时候它的特点是：

- 还只是“想要什么能力”
- 可以是 `boolean`，也可以是对象
- 默认值还没补齐
- 下游组件还不能直接拿来用

**2. `loadChatConfig()` 之后变成什么**
在 [config.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/config.ts) 里，`normalizeAttachmentsFeature()` 先做第一层整理。

它做的不是最终解释，而是“规范化输入格式”。

比如外部写：

```ts
attachments: {
  upload: {
    accept: 'image/*',
  },
}
```

经过 `loadChatConfig()` 后，大致还是这个意思：

```ts
attachments: {
  enabled: undefined,
  upload: {
    enabled: undefined,
    accept: 'image/*',
    multiple: undefined,
    maxCount: undefined,
    maxSize: undefined,
    tooltip: undefined,
    tooltipPlacement: undefined,
  },
  list: undefined,
}
```

这里要注意：

- 结构已经统一了
- 但默认值还没完全补
- 它还是“配置对象”，不是“解析结果”

这一步你可以理解成：

> 把输入洗干净，但还没翻译成系统语义。

**3. `resolveChatFeatures()` 这一步到底做了什么**
到了 [registry.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/registry.ts)，`attachmentsFeature.resolve()` 才真正把它解释成 `ResolvedChatFeatures` 里的一个 entry。

它主要做 3 件事：

1. 判断是否启用  
用 `isFeatureEnabled(config)`：
- `undefined` -> `false`
- `true` -> `true`
- 对象且 `enabled` 没写 -> 默认 `true`

2. 保留原始配置语义  
放到 `config` 字段里

3. 产出真正可消费的 `presetProps`  
这一步会补默认值，并转成 `TrChat` 更容易吃的结构

比如刚才那个输入，解析后大致会变成：

```ts
entries.attachments = {
  key: 'attachments',
  enabled: true,
  config: {
    upload: {
      accept: 'image/*',
    },
  },
  presetProps: {
    attachmentsFeature: {
      enabled: true,
      upload: {
        enabled: true,
        accept: 'image/*',
        multiple: true,
        maxCount: undefined,
        maxSize: undefined,
        tooltip: '上传附件',
        tooltipPlacement: 'top',
      },
      list: {
        variant: 'card',
        wrap: true,
        actions: undefined,
        fileIcons: undefined,
        fileMatchers: undefined,
        disabled: undefined,
      },
    },
  },
}
```

你要特别注意这里的变化：

- 原来是松散配置
- 现在变成统一 entry
- 默认值已经补齐
- 已经开始变成 UI 能直接消费的东西了

**4. `ResolvedChatFeatures` 里，这个 entry 长什么样**
在 [types.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/types.ts) 里，`ResolvedChatFeatures` 有三部分：

```ts
{
  entries: {
    attachments: ...,
    senderActions: ...,
    ...
  },
  enabledKeys: [...],
  presetProps: { ... }
}
```

对 `attachments` 来说：

- `entries.attachments`：最完整的解释结果
- `enabledKeys`：如果启用了，会包含 `'attachments'`
- `presetProps`：会合并出 `attachmentsFeature`

所以你可以这样记：

- `entries` 是“详细施工图”
- `enabledKeys` 是“启用了哪些能力”
- `presetProps` 是“准备交给下游的材料包”

**5. 这一步之后，数据怎么继续往下走**
在 [config.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/config.ts) 里：

`createChatAdapterFromConfig()` 会把整个 `resolvedFeatures` 挂到 `adapter.resolvedFeatures` 上。

然后 `createPresetChatProps()` 里有这句很关键：

```ts
...adapter.resolvedFeatures.presetProps
```

这意味着 `attachments` 解析出来的：

```ts
{
  attachmentsFeature: { ... }
}
```

会直接进入 `presetProps`。

再往后 `createPresetChatSlices()` 会把它切到 `root` slice 里：

```ts
root: {
  attachmentsFeature: preset.attachmentsFeature,
  attachmentsManager: preset.attachmentsManager,
}
```

所以链路是：

```text
features.attachments
  -> normalizeAttachmentsFeature()
  -> resolveChatFeatures()
  -> resolvedFeatures.entries.attachments
  -> resolvedFeatures.presetProps.attachmentsFeature
  -> presetProps.attachmentsFeature
  -> presetSlices.root.attachmentsFeature
```

**6. 到了 `ChatRoot`，它怎么变成运行时能力**
在 [ChatRoot.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatRoot.vue) 里，这一步很关键：

```ts
const attachmentsFeature = props.attachmentsFeature
const attachmentsManager = props.attachmentsManager ?? (attachmentsFeature ? useChatAttachments() : null)
```

意思是：

- 如果 root 收到了 `attachmentsFeature`
- 就自动创建一个附件管理器 `useChatAttachments()`
- 然后通过 `CHAT_ATTACHMENTS_KEY` provide 给子树

所以这里发生了一个重要转变：

- 前面还是配置和投影
- 到了 Root，开始变成“可运行的上下文能力”

**7. `ChatSender` 怎么消费它**
在 [ChatSender.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatSender.vue) 里：

```ts
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const uploadActionConfig = computed(() => senderActionsFeature.value?.upload ?? attachmentsContext?.feature.upload)
```

这句很重要。它说明：

- 如果有更专门的 `senderActions.upload`，优先用那个
- 否则就退回用 `attachmentsFeature.upload`

也就是说，`attachments` 自己就足以支撑一个默认上传按钮。

然后用户点上传时：

```ts
function handleFileSelect(files: File[]) {
  attachmentsContext?.manager.addFiles(files)
}
```

文件会进到 `useChatAttachments()` 管理的 `items` 里。

**8. `ChatAttachments` 怎么消费它**
在 [ChatAttachments.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatAttachments.vue) 里：

```ts
const attachments = computed(() => attachmentsContext?.manager.items.value ?? [])
const listProps = computed(() => attachmentsContext?.feature.list ?? {})
```

然后渲染：

```vue
<TrAttachments :items="attachments" v-bind="listProps" />
```

这说明 `attachmentsFeature` 里的 `list` 配置，最终就是在这里生效的。

所以：

- `upload` 配置主要影响上传入口
- `list` 配置主要影响附件列表展示

**9. `useChatAttachments()` 在这条链里是什么角色**
在 [useChatAttachments.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/composables/useChatAttachments.ts) 里，它很纯粹，就是一个附件暂存管理器：

- `items`
- `addFiles`
- `setItems`
- `removeItem`
- `clear`

所以它不是 feature 配置层，而是 runtime 管理层。

你可以把这三层分开记：

- `features.attachments`：我要不要附件能力
- `ResolvedChatFeatures.entries.attachments`：系统怎么解释这个能力
- `useChatAttachments()`：运行时怎么暂存和维护附件项

**10. 最后帮你收成一句最容易记的话**
`attachments` 这条链本质是：

```text
原始配置
  -> 规范化
  -> feature 解释
  -> 投影成 attachmentsFeature
  -> Root 创建附件管理器
  -> Sender 用 upload 配置生成上传入口
  -> ChatAttachments 用 list 配置渲染附件列表
```

所以 `ResolvedChatFeatures` 在这里的核心作用，就是：

> 把“附件能力的声明”翻译成“系统统一理解的附件能力结果”，并把这个结果稳定地交给 Root、Sender、Attachments 去消费。


这是个特别好的问题。核心答案其实是：

> 因为“给人写的配置”和“给系统跑的结构”不是一回事。

当前这套设计里，两者其实都存在：

- 顶层 `features` 是语义化声明，给业务和上层 preset 写
- `normalize + resolve` 之后的结果，是规范化结构，给系统内部跑

也就是说，不是不要规范化，而是**不能把“内部规范化结构”直接当成“外部声明入口”**。

**先说为什么不能直接让用户按规范化结构写**
如果一开始就要求外部直接写“最终规范化配置”，会有 4 个明显问题。

1. 外部配置会泄露内部实现  
比如 `attachments` 这个能力，业务真正想表达的是：

- 我想开附件能力
- 上传限制是什么
- 列表怎么显示

但如果你直接让外部写内部最终结构，就会逼用户关心：
- 最终要落成 `attachmentsFeature`
- 哪些默认值必须自己补
- 哪些字段是给 `ChatSender` 用的
- 哪些字段是给 `ChatAttachments` 用的

这样上层配置就会和当前组件实现绑死。

2. 顶层配置会变得很啰嗦  
业务最常见的诉求其实是：

```ts
features: {
  history: true,
  feedback: true,
  attachments: true,
}
```

这是很自然的“能力声明”。

如果改成完全规范化写法，可能会变成类似：

```ts
features: {
  attachments: {
    enabled: true,
    upload: {
      enabled: true,
      accept: '*',
      multiple: true,
      tooltip: '上传附件',
      tooltipPlacement: 'top',
    },
    list: {
      variant: 'card',
      wrap: true,
    },
  },
}
```

这对系统内部没问题，但对配置作者很重，而且大量默认值其实是系统知道的，不应该要求业务每次都写。

3. 会把“意图”和“实现细节”混在一起  
语义化声明表达的是“我要什么能力”。  
规范化结构表达的是“系统最终怎么执行这个能力”。

这两层混在一起之后，文档和心智会很乱。  
比如：

- `history: true` 是意图
- `showHistory: true + historyProps` 已经更接近消费实现了

如果一上来就暴露实现层结构，用户就很难区分：
- 我是在声明需求
- 还是在手工拼装内部运行结果

4. 不利于以后演进  
如果今天外部直接写的是内部最终结构，那以后你一改内部实现，外部配置就容易跟着变。

但如果外部写的是语义化声明，比如：

```ts
features: {
  senderActions: {
    voice: true,
    wordCount: true,
  },
}
```

那以后内部无论：
- sender 的默认按钮怎么排
- voice 的底层组件怎么变
- props 投影结构怎么调整

只要语义不变，外部配置就能保持稳定。

**所以为什么顶层要“语义化声明”**
因为顶层是给“场景作者”写的，不是给“框架内部”写的。

你可以把它分成两种语言：

- 顶层配置说的是“业务语言”
- 规范化结果说的是“系统语言”

比如：

```ts
features: {
  attachments: true,
  history: true,
}
```

这是业务语言，表达的是：

- 开启附件能力
- 开启历史能力

而系统内部最终会把它翻译成：

- `attachmentsFeature`
- `showHistory`
- `historyProps`
- 各种默认值补齐后的 upload/list 配置

这已经是系统语言了。

**当前代码其实就是这样分层的**
对应到代码，大概是三层：

1. 语义声明层  
在 [config.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/config.ts) 里输入 `features`

2. 规范化层  
还是在 [config.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/config.ts) 里先做 `normalizeAttachmentsFeature()`、`normalizeSenderActionsFeature()` 这类清洗

3. 语义解析与投影层  
在 [registry.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/features/registry.ts) 里做 `resolveChatFeatures()`，产出 `ResolvedChatFeatures`

所以真实流程不是“只语义，不规范”，而是：

```text
语义化声明
  -> 规范化
  -> 语义解析
  -> 消费投影
```

**为什么这比“直接按规范结构写”更合理**
最本质的原因就一句：

> 外部配置应该稳定表达意图，内部结构应该自由承载实现。

如果反过来，让外部直接写内部最终结构，就会导致：
- 外部太重
- 文档太难讲
- 黑盒白盒CLI更难统一
- preset/skill pack 不好复用
- 内部实现演进会频繁冲击外部 API

**拿 `attachments` 举个最直观的例子**
业务真正想写的是：

```ts
features: {
  attachments: {
    upload: { accept: 'image/*' },
  },
}
```

这句话的意思很清楚：

- 我要附件能力
- 上传时只允许图片

系统再去决定：
- `enabled` 默认是不是 true
- `multiple` 默认是不是 true
- tooltip 默认是什么
- list 默认是 `card` 还是别的
- sender 默认要不要显示上传按钮
- Root 要不要自动创建 `attachmentsManager`

这些都应该是系统的工作，不应该反压给配置作者。

**一句话总结**
顶层做成语义化声明，不是因为不要规范化；恰恰相反，是因为：

> 规范化是系统内部责任，语义化声明才是对外稳定接口。

所以最好的分工就是现在这种：

- 顶层配置负责“说清楚要什么”
- normalize/resolve 负责“把它变成系统真的能跑的东西”

如果你愿意，我下一步可以继续把这个问题再往前讲一层：  
为什么 `features` 要独立成一层，而不是直接并到 `ui / layout / runtime` 里。


可以，我们把 `resolve.ts` 当成一条“小链”来讲，不抽象说，直接拿一个真实例子走一遍。

相关文件：
- [resolve.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/presets/resolve.ts)
- [catalog.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/presets/catalog.ts)
- [ChatPresetRoot.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatPresetRoot.vue)
- [PresetEntryScene.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/test/src/chat/scenarios/PresetEntryScene.vue)

---

**先回答一句：`resolve.ts` 到底在回答什么**

它回答的是：

> “如果我现在手里有一个 `baseConfig`，再给它一个 `preset`，外加可选的父 preset 和 skill pack，最后应该得到什么样的最终 chat 配置和消费结果？”

也就是它在做：

```text
高层 preset/skill 声明
  -> 展开继承
  -> 合并 patch
  -> 生成最终 ChatConfig
  -> 接回 adapter 主链
```

所以它不是运行时文件，也不是组件文件。  
它本质上是“preset 装配器”。

---

## 1. 先给你一个真实输入例子

我们直接用内置的 `docs-reader`。

### 1.1 `baseConfig`

```ts
const baseConfig = {
  models: [{ id: 'gpt-4.1', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  ui: {
    brand: {
      title: 'Base Chat',
    },
    welcome: {
      title: 'Base Welcome',
      description: 'Base description',
    },
  },
}
```

### 1.2 `preset`

从 [catalog.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/presets/catalog.ts) 里拿：

```ts
docs-reader
```

它长这样：

```ts
{
  id: 'docs-reader',
  extends: ['assistant-base'],
  skills: ['docs-layout'],
  ui: {
    brand: {
      title: 'Docs Reader',
    },
  },
}
```

### 1.3 `presets`

内置 preset 列表里还有它依赖的：

```ts
assistant-base
```

```ts
{
  id: 'assistant-base',
  skills: ['conversation-core'],
  defaults: {
    systemPrompt: 'You are a helpful assistant.',
  },
  ui: {
    prompts: [{ label: 'Start', description: 'Help me get started.' }],
  },
}
```

### 1.4 `skillPacks`

内置 skill pack 里会用到：

`conversation-core`

```ts
{
  id: 'conversation-core',
  features: {
    history: true,
    feedback: true,
  },
}
```

`docs-layout`

```ts
{
  id: 'docs-layout',
  layout: {
    variant: 'docs',
    placements: {
      assistant: 'start',
      user: 'end',
    },
  },
  ui: {
    welcome: {
      title: 'Docs Assistant',
      description: 'Ask questions while keeping a docs-style reading layout.',
    },
  },
}
```

---

## 2. `resolve.ts` 里的每个主要函数到底输出什么

---

### 2.1 `resolvePresetChain()`

这个函数输入的是：

- 当前目标 preset，比如 `docs-reader`
- 所有可见的 preset 列表

它做的事是：

- 展开 `extends`
- 算出继承链
- 保证顺序是“父在前，子在后”

对于 `docs-reader`，输出大概是：

```ts
[
  assistant-base,
  docs-reader,
]
```

你可以把它理解成：

> 先决定“有哪些 preset 要参与合并”。

它还会做循环继承检测，比如 A extends B, B extends A 会报错。

---

### 2.2 `resolveSkillPackList()`

这个函数输入的是某一个 preset 和所有 skill pack。

比如对 `assistant-base` 调用，输出是：

```ts
[
  conversation-core,
]
```

对 `docs-reader` 调用，输出是：

```ts
[
  docs-layout,
]
```

你可以把它理解成：

> 再决定“每个 preset 自己挂了哪些 skill pack”。

---

### 2.3 `toChatConfigPatch()`

这个函数很关键，但很多人第一次看会忽略。

它做的事是：

> 把 `AgentPresetInput / SkillPackInput` 这种高层对象，翻译成“能 merge 回 ChatConfig 的 patch 结构”。

比如把 `docs-layout` 转成的 patch 大概是：

```ts
{
  defaults: undefined,
  ui: {
    welcome: {
      title: 'Docs Assistant',
      description: 'Ask questions while keeping a docs-style reading layout.',
    },
  },
  layout: {
    variant: 'docs',
    placements: {
      assistant: 'start',
      user: 'end',
    },
  },
  features: undefined,
  runtime: undefined,
}
```

把 `conversation-core` 转成 patch 大概是：

```ts
{
  features: {
    history: true,
    feedback: true,
  },
}
```

这个函数的意义是：

- 上层 preset/skill 用的是“场景语言”
- 主链需要的是“ChatConfig patch”
- `toChatConfigPatch()` 就是那个翻译器

---

### 2.4 `mergeChatConfigPatch()`

这个函数做的是：

> 把一个 patch 合并到另一个 patch 上

它内部会分别处理：

- `defaults`
- `ui`
- `layout`
- `features`
- `runtime`

这里最值得注意的是：

- `ui` 是按字段 merge
- `layout.placements` 是深合并
- `features` 有特殊逻辑，不是简单覆盖

比如 feature 合并时：

- `false` 明确关闭
- `true` 表示开启，但尽量保留已有对象配置
- 对象和对象会深合并

所以它不是普通的 `Object.assign`。

---

### 2.5 `resolveAgentPreset()`

这是 `resolve.ts` 里最核心的函数。

它的输入是：

- `preset`: 当前目标 preset
- `presets`: 所有 preset
- `skillPacks`: 所有 skill pack

它的输出是一个 `ResolvedAgentPreset`：

```ts
{
  presetId,
  presetChain,
  skillPacks,
  chatConfigPatch,
}
```

拿 `docs-reader` 这个例子，大致输出会是：

```ts
{
  presetId: 'docs-reader',

  presetChain: [
    assistant-base,
    docs-reader,
  ],

  skillPacks: [
    conversation-core,
    docs-layout,
  ],

  chatConfigPatch: {
    defaults: {
      systemPrompt: 'You are a helpful assistant.',
    },
    ui: {
      prompts: [
        { label: 'Start', description: 'Help me get started.' },
      ],
      brand: {
        title: 'Docs Reader',
      },
      welcome: {
        title: 'Docs Assistant',
        description: 'Ask questions while keeping a docs-style reading layout.',
      },
    },
    layout: {
      variant: 'docs',
      placements: {
        assistant: 'start',
        user: 'end',
      },
    },
    features: {
      history: true,
      feedback: true,
    },
  },
}
```

这里你要特别记一句：

> `resolveAgentPreset()` 还没有得到最终 `ChatConfig`，它只是先得到“总 patch”。

---

### 2.6 `applyAgentPresetToConfig()`

这个函数输入的是：

- `baseConfig`
- `preset`
- `presets`
- `skillPacks`

它先内部调用 `resolveAgentPreset()`，拿到总 patch，  
然后把这个 patch merge 回 `baseConfig`。

所以它的输出是：

> 最终 `ChatConfig`

拿刚才例子，大概会得到：

```ts
{
  models: [{ id: 'gpt-4.1', provider: 'openai' }],
  providers: {
    openai: {
      type: 'openai-compatible',
      endpoint: '/api/chat',
    },
  },
  defaults: {
    systemPrompt: 'You are a helpful assistant.',
  },
  ui: {
    brand: {
      title: 'Docs Reader', // 覆盖 baseConfig.brand.title
    },
    welcome: {
      title: 'Docs Assistant', // 覆盖 base welcome
      description: 'Ask questions while keeping a docs-style reading layout.',
    },
    prompts: [
      { label: 'Start', description: 'Help me get started.' },
    ],
  },
  layout: {
    variant: 'docs',
    placements: {
      assistant: 'start',
      user: 'end',
    },
  },
  features: {
    history: true,
    feedback: true,
  },
}
```

所以这个函数回答的是：

> “如果真的把这个 preset 应用到 baseConfig 上，最终配置到底长什么样？”

---

### 2.7 `createChatAdapterFromAgentPreset()`

这个函数输出的是：

```ts
{
  resolvedPreset,
  chatConfig,
  adapter,
}
```

也就是它在前两步基础上，又往前走了一步：

- 不只是拿到最终配置
- 还把它重新接回 adapter 主链

所以这里的 `adapter`，其实就是：

```text
final ChatConfig
  -> createChatAdapterFromConfig()
```

的结果

你可以把它理解成：

> “现在我不只是知道最后配置是什么，我还已经把它变成系统真正可消费的中间层了。”

---

### 2.8 `createPresetConsumptionFromAgentPreset()`

这是最后一步。

它输出的是：

```ts
{
  resolvedPreset,
  chatConfig,
  adapter,
  presetProps,
  presetSlices,
}
```

也就是在前面的基础上，再继续做：

- `createPresetChatProps(adapter, presetOverrides)`
- `createPresetChatSlices(presetProps)`

所以它是一个“一步拿全套消费结果”的函数。

拿 `docs-reader` 例子，大概你会看到：

`presetProps` 里会有：

```ts
{
  models: [...],
  providerFactories: [...],
  defaultModel: 'gpt-4.1',
  brand: {
    title: 'Docs Reader',
  },
  welcome: {
    title: 'Docs Assistant',
    description: 'Ask questions while keeping a docs-style reading layout.',
  },
  prompts: [
    { label: 'Start', description: 'Help me get started.' },
  ],
  messageListVariant: 'docs',
  roleConfigs: {
    assistant: { placement: 'start' },
    user: { placement: 'end' },
  },
  showHistory: true,
  showFeedback: true,
}
```

`presetSlices` 里会进一步切成：

```ts
{
  root: { ... },
  layout: {
    roleConfigs: ...,
  },
  header: {
    title: 'Docs Reader',
    showHistory: true,
  },
  welcome: {
    title: 'Docs Assistant',
    description: 'Ask questions while keeping a docs-style reading layout.',
    prompts: [...],
  },
  messageList: {
    variant: 'docs',
    showFeedback: true,
  },
  sender: {
    placeholder: '...'
  },
  history: {
    enabled: true,
  },
  modelSelector: {
    enabled: true,
    ...
  },
}
```

所以这一步回答的是：

> “如果我要直接给黑盒/白盒消费，现在完整材料包是什么？”

---

## 3. 你可以把 `resolve.ts` 简化成这 4 层

把上面都压缩一下，最容易记的是：

```text
1. resolveAgentPreset()
   -> 先得到总 patch

2. applyAgentPresetToConfig()
   -> 把 patch merge 回 baseConfig，得到 final ChatConfig

3. createChatAdapterFromAgentPreset()
   -> 把 final ChatConfig 接回 adapter 主链

4. createPresetConsumptionFromAgentPreset()
   -> 直接产出 presetProps / presetSlices 给消费层
```

---

## 4. `ChatPresetRoot.vue` 到底是什么时候用

这个问题特别关键。答案是：

> 它不是黑盒入口，也不是 CLI 入口；它是“带 preset 的白盒桥接入口”。

你可以把几种入口分开记：

### 4.1 黑盒入口
`TrChat`

适合：
- 我就想直接给一包 props，快速得到完整聊天 UI

### 4.2 白盒入口
`TrChat.Root + TrChat.Layout + TrChat.MessageList + TrChat.Sender ...`

适合：
- 我想自己拼页面
- 但我已经知道 root props/runtime 怎么准备

### 4.3 带 preset 的白盒入口
`TrChat.PresetRoot`

适合：
- 我想用 `AgentPreset / SkillPack / baseConfig`
- 让系统先帮我 resolve 成 `presetSlices`
- 但 UI 还是我自己拼

所以它既不是黑盒，也不是 CLI。  
更准确地说，它是：

> “preset 链和白盒 UI 之间的桥接入口”

---

## 5. `ChatPresetRoot.vue` 在代码里到底干了什么

看 [ChatPresetRoot.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/components/chat/ChatPresetRoot.vue)，它主要干三件事：

### 5.1 先拿到 `chatKit`
通过：

```ts
const chatKit = resolveRootChatKit('TrChatPresetRoot', props)
```

也就是说：
- 你可以外部传 `chatKit`
- 或者传 `responseProvider` 让它内部创建

### 5.2 再做 preset consumption
通过：

```ts
createPresetConsumptionFromAgentPreset({
  baseConfig,
  preset,
  presets,
  skillPacks,
  presetOverrides,
})
```

直接得到：

- `resolvedPreset`
- `chatConfig`
- `adapter`
- `presetProps`
- `presetSlices`

### 5.3 再把 `presetSlices.root` 接进 `ChatRoot`
也就是把 root 级能力继续 provide 下去：

- `mcpManager`
- `attachmentsFeature`
- `senderActionsFeature`
- `messages`

所以它本身并不渲染聊天页面。  
它只是把：

```text
preset 世界
  -> runtime root
  -> scoped slot
```

接起来。

---

## 6. 一个最实际的 `ChatPresetRoot` 使用场景

仓库里就有真实例子：[PresetEntryScene.vue](/e:/LS_WorkSpace/web/tiny-robot/packages/test/src/chat/scenarios/PresetEntryScene.vue)

它的用法就是：

```vue
<TrChat.PresetRoot
  :response-provider="presetEntryProvider"
  :base-config="presetEntryBaseConfig"
  :preset="presetEntryPreset"
  :presets="BUILT_IN_AGENT_PRESETS"
  :skill-packs="BUILT_IN_SKILL_PACKS"
  :preset-overrides="presetEntryOverrides"
>
  <template #default="{ chatKit, resolvedPreset, presetSlices }">
    <TrChat.Layout v-bind="{ ...presetSlices.layout, ...presetSlices.appearance }">
      <TrChat.Header v-bind="presetSlices.header" />
      <TrChat.Welcome v-if="chatKit.messages.value.length === 0" v-bind="presetSlices.welcome" />
      <TrChat.MessageList v-else v-bind="presetSlices.messageList" />
      <TrChat.Footer>
        <TrChat.Sender v-bind="presetSlices.sender" />
      </TrChat.Footer>
    </TrChat.Layout>
  </template>
</TrChat.PresetRoot>
```

你看这个例子就很清楚：

- 它不是黑盒，因为页面是自己拼的
- 它不是普通白盒，因为 `presetSlices` 不是你自己手工算的
- 它不是 CLI，因为它明显是在 Vue 渲染树里跑

所以最准确的定位就是：

> “Preset 驱动的白盒入口”

---

## 7. 最后我帮你收成一句最容易记的话

### `resolve.ts`
负责：

> 把 `AgentPreset / SkillPack` 展开、合并、翻译成最终 `ChatConfig`，再接回 adapter 和 preset output 主链。

### `ChatPresetRoot.vue`
负责：

> 把 `resolve.ts` 产出的 preset consumption 结果，接到 `ChatRoot` 和白盒 scoped slot 上。

所以它不是 CLI 用的。  
CLI 更像是消费 [chatCli.ts](/e:/LS_WorkSpace/web/tiny-robot/packages/chat/src/adapters/chatCli.ts) 里的 contract。  
`ChatPresetRoot.vue` 是给 Vue 侧“想用 preset，但又想自己拼 UI”的场景用的。

如果你愿意，我下一条可以继续只讲一个问题：

**为什么 `TrChat.PresetRoot` 不直接内部渲染一套默认 UI，而是只暴露 scoped slot？**