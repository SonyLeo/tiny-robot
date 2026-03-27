# Chat 实现说明

> Last updated: `2026-03-27`
> Related:
> - [Chat Entry Structure Refactor Plan](./chat-entry-structure-refactor-plan.md)

## 当前边界

`packages/chat` 当前专注于聊天场景的组装层。

活跃入口包括：

- 黑盒入口：`TrChat`
- 组合入口：`TrChat.Scaffold`
- 白盒入口：`TrChat.Root`
- 白盒叶子：`TrChat.Layout`、`TrChat.Header`、`TrChat.Welcome`、`TrChat.MessageList`、`TrChat.Footer`、`TrChat.Sender`、`TrChat.History`
- 运行时：`useChatKit`
- 配置归一化：`createChatAdapterFromConfig`
- 预设投影：`createPresetChatProps`、`createPresetChatSlices`

## 包的职责

`packages/chat` 负责：

- chat 级组件组合
- 配置驱动的聊天场景组装
- scaffold 默认值和叶子组件 fallback 消费
- 模型选择集成
- MCP 管理器注入与聊天侧面板衔接
- 附件、发送器动作、历史、反馈等能力投影

`packages/chat` 不负责：

- provider SDK 层实现
- 后端代理服务
- `packages/kit` 已承载的低层消息引擎原语
- 通用 workspace shell / 侧边面板布局系统

## 当前稳定约束

- `ResponseProvider` 是 chat 包内唯一稳定的运行时 provider contract
- `ChatConfig -> loadChatConfig() -> createChatAdapterFromConfig()` 是唯一配置主路径
- `providers[*].type` 缺省时默认按 `openai-compatible` 处理
- `providerId` 只表示模型归属的配置标识，不再表示一套独立 provider 实现
- `TrChat.Root :response-provider` 是白盒场景的最终逃生口

## 这次已经落地的主链变更

### 变更前

模型 / provider 主链原来是：

```text
ChatConfig
  -> loadChatConfig()
  -> providerFactories
  -> match(model)
  -> createProvider(model)
  -> chatKit.updateResponseProvider()
```

其主要问题是：

- `provider` 同时承担“供应商标识”和“实现入口”两层语义
- `providerFactories` 作为中间层渗透到 adapter、scaffold、selector、默认 renderer
- `ModelSelector` 和 `ChatScaffold` 共同参与 provider 切换，链路重复
- `TrChatPresetOverrides.models/defaultModel` 允许在 scaffold 层覆盖模型集合，容易造成 UI 与实际请求源静默漂移

### 变更后

当前主链已经收敛为：

```text
ChatConfig
  -> loadChatConfig()
  -> createChatAdapterFromConfig()
    -> adapter.getModel()
    -> adapter.createResponseProvider()
  -> ChatScaffold
    -> currentModel
    -> chatKit.updateResponseProvider()
```

这次已经完成的关键调整：

- `provider` 全部改名为 `providerId`
- 删除了 `packages/chat/src/providers/*` 品牌型 provider helper
- 新增 `adapters/openaiCompatibleTransport.ts`，统一承载 OpenAI-compatible transport
- `providerFactories` 已从 chat 包主链移除
- `ModelSelector` / `useModelSelector` 不再负责运行时 provider 切换
- `ChatScaffold` 成为唯一模型切换编排点
- `TrChatPresetOverrides.models/defaultModel` 已移除
- `ChatScaffold` 当前直接从 `adapter.models / adapter.defaultModel` 读取运行时模型目录

## 当前运行时主链

### 黑盒

```text
TrChat
  -> ChatScaffold
    -> createChatAdapterFromConfig()
    -> useChatKit()
    -> ChatRoot
    -> ChatDefaultRenderer
```

### 白盒

```text
TrChat.Root
  -> chatKit or responseProvider
  -> context provide
  -> Layout / Header / MessageList / Sender / History ...
```

### 模型切换

当前模型切换链路为：

```text
TrModelSelector
  -> useModelSelector()
  -> currentModel
  -> ChatScaffold watchEffect
  -> chatKit.updateResponseProvider(adapter.createResponseProvider(modelId))
```

这里的关键点是：

- selector 只负责 UI 和模型值变更
- scaffold 负责把模型值变成真正的 `ResponseProvider`
- `adapter` 是唯一模型到 provider 的解析入口
- `presetOverrides` 仍可参与 preset 投影，但不再参与 scaffold 运行时模型解析

## 当前文件分工

### `adapters/*`

- `configLoader.ts`
  - 负责 `ChatConfig` 输入归一化
  - 默认补齐 `type: 'openai-compatible'`
  - 校验 `model.providerId -> providers[providerId]`

- `configProjection.ts`
  - 负责把 `ChatConfig` 投影为 `ChatAdapter`
  - 提供 `getModel()` 和 `createResponseProvider()`
  - 负责 `presetProps / presetSlices` 投影

- `openaiCompatibleTransport.ts`
  - 提供 `ChatProviderError`
  - 提供 `createOpenAICompatibleResponseProvider()`
  - 这是当前 chat 包内唯一 transport 实现

### `components/chat/*`

- `ChatScaffold.vue`
  - 负责 adapter 创建
  - 负责当前模型状态
  - 直接从 `adapter` 读取模型目录和默认模型
  - 负责 `chatKit` 初始化与 runtime provider 更新
  - 负责 scaffold context 和 default renderer 入口

- `ChatDefaultRenderer.vue`
  - 负责黑盒默认页面模板
  - 不再理解 `providerFactories`
  - `modelSelector.enabled` 现在只依赖模型数和 slice 状态

- `scaffold.ts`
  - 负责 scaffold context 类型
  - 已不再暴露 `providerFactories`

### `components/model-selector/*` + `composables/useModelSelector.ts`

- `ModelSelector.vue`
  - 只负责 dropdown UI
  - 只消费模型列表和当前模型

- `useModelSelector.ts`
  - 只负责模型选择状态、disabled / fallback 和变更通知
  - 不再触碰 runtime provider 更新

## 当前实现状态

已经完成：

- `packages/chat` 的 `type-check`
- `packages/chat` 的 `test:unit`
- demo 已切到直接传 `chatConfig`
- 文档主叙事已切到 `ResponseProvider + ChatConfig -> ChatAdapter`

## 当前未处理的下游影响

这次工作刻意只聚焦 `packages/chat`。

因此，以下内容仍然停留在旧语义，后续再迁移：

- `packages/test/src/chat/mockProvider.ts`
- `packages/test/src/chat/scenarios/sharedDemoFixtures.ts`
- `packages/test/src/chat/scenarios/*.vue` 中仍使用 `providerFactories` 的场景
- `packages/test/src/chat/README.md`
- `packages/test/src/chat-cli/scaffold.spec.ts`

这些文件的主要遗留问题有两类：

1. 仍在使用 `provider` 而不是 `providerId`
2. 仍在依赖 `providerFactories / ModelProviderFactory`

## 后续建议

下一阶段如果继续推进，建议按下面顺序：

1. 迁移 `packages/test/src/chat/sharedDemoFixtures.ts` 和 `mockProvider.ts`
2. 迁移 `packages/test/src/chat/scenarios/*`
3. 最后处理 `packages/test/src/chat-cli/*` 和 README 文案

这样可以先把 chat 包对应的测试场景语义收敛，再处理模板 / CLI 相关内容。
