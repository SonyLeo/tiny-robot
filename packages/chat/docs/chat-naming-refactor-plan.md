# Chat Naming Refactor Plan

> Last updated: `2026-04-03`
> Status: `Approved direction`
> Scope: `packages/chat`
> Assumption: `Current stage allows direct renaming without compatibility aliases`

## 1. 目标

这份提案只解决一个问题：

- 当前 chat 包里有几组名字会增加理解成本
- 尤其是 `config.runtime`、顶层 `runtime`、`TrChat.Root`
- 需要在开发阶段直接定一版更清晰的命名

这次提案的原则是：

1. 优先减少“同一个词代表两层职责”的情况
2. 优先让名字贴近真实职责，而不是沿用历史实现名
3. 不追求一次性全量重命名，只做高收益改名

## 2. 已锁定决策

这轮命名调整先锁定 4 个决策：

1. 顶层 prop `runtime` 保留，不改名
2. `config.runtime` 改成 `config.integrations`
3. `TrChat.Root` 改成 `TrChat.Provider`
4. `presetSlices.root` 改成 `presetSlices.provider`

同时有两个范围约束：

- 这轮不做兼容别名，直接清理旧命名
- 这轮不扩展语义，只做“名字对齐真实职责”的重命名

## 3. 当前最主要的命名问题

### 3.1 `config.runtime` 和顶层 `runtime` 撞名

当前用户会同时看到：

```ts
const chatConfig = {
  runtime: {
    mcpManager,
  },
}

<TrChat :config="chatConfig" :runtime="runtime" />
```

这两个 `runtime` 名字相同，但不是同一层职责：

- 顶层 `runtime`
  - 是页面实例级运行时输入
- `config.runtime`
  - 更像配置里的默认集成输入

这会直接导致：

- 用户很难理解为什么 `mcpManager` 两边都能写
- 文档必须反复解释“不是同一个 runtime”

### 3.2 `TrChat.Root` 名不副实

`TrChat.Root` 当前做的事情更接近：

- 提供 `chatKit`
- 提供 `mcpManager`
- 提供 `attachmentsManager`
- 提供 `history` / `messages` / `ui` 上下文

它更像一个：

- `Provider`
- 而不是 Radix 意义上的结构 `Root`

### 3.3 `ChatScaffoldRuntimeInput` 暴露了内部实现词

当前顶层 `TrChat` props 用的是：

- `runtime?: ChatScaffoldRuntimeInput`

但从用户角度看，这并不是“Scaffold 的 runtime”，而是：

- `TrChat` 的页面运行时输入

`Scaffold` 这个词放在公共类型名里，会把内部实现细节暴露给用户。

### 3.4 `presetSlices.root` 语义不稳定

当前 `presetSlices.root` 本质上装的是：

- `mcpManager`
- `attachmentsManager`
- `attachmentsFeature`
- `senderActionsFeature`
- `messages`

如果组件从 `Root` 改成 `Provider`，这一层 slice 也应该同步改名，不然语义会继续漂移。

## 4. 总体命名方向

这次提案采用下面这套职责词：

- `runtime`
  - 只保留给“页面实例级运行时输入”
- `integrations`
  - 用于 `config` 里的默认集成输入
- `provider`
  - 用于上下文注入边界
- `scaffold`
  - 保留给装配层

一句话概括：

```text
runtime = 页面实例输入
integrations = 配置默认集成
provider = 上下文注入边界
scaffold = 装配层
```

## 5. 建议重命名表

### 5.1 配置层

| 当前名称 | 建议名称 | 原因 |
| :-- | :-- | :-- |
| `ChatConfigRuntime` | `ChatConfigIntegrations` | 避免与顶层 `runtime` 撞名 |
| `chatConfig.runtime` | `chatConfig.integrations` | 更符合“配置默认集成”语义 |
| `normalizeRuntime()` | `normalizeIntegrations()` | 与字段改名保持一致 |
| `adapter.config.runtime` | `adapter.config.integrations` | 避免内部继续混用 |

建议迁移后的形状：

```ts
const chatConfig = {
  integrations: {
    mcpManager,
  },
}
```

### 5.2 顶层 `TrChat` 运行时输入

| 当前名称 | 建议名称 | 原因 |
| :-- | :-- | :-- |
| `ChatScaffoldRuntimeInput` | `TrChatRuntimeInput` | 这是 `TrChat` 的公共输入，不该暴露内部 `Scaffold` 命名 |
| `runtime?: ChatScaffoldRuntimeInput` | `runtime?: TrChatRuntimeInput` | 与上面保持一致 |

这轮明确保留：

- 顶层 prop 仍然叫 `runtime`

原因：

- 它已经足够贴近真实职责
- 多模态提案也在持续强化这层能力
- 真正该改的是 `config.runtime`

### 5.3 `Root` 相关公共 API

| 当前名称 | 建议名称 | 原因 |
| :-- | :-- | :-- |
| `TrChat.Root` | `TrChat.Provider` | 更符合上下文注入职责 |
| `ChatRoot.vue` | `ChatProvider.vue` | 与公共 API 对齐 |
| `ChatRoot` | `ChatProvider` | 组件内部名对齐 |
| `TrChatRootProps` | `TrChatProviderProps` | 类型名对齐 |
| `TrChatRootSharedProps` | `TrChatProviderSharedProps` | 类型名对齐 |
| `resolveRootChatKit.ts` | `resolveProviderChatKit.ts` | helper 职责对齐 |
| `getRootChatKitResolution()` | `getProviderChatKitResolution()` | helper 命名对齐 |
| `resolveRootChatKit()` | `resolveProviderChatKit()` | helper 命名对齐 |

建议迁移后的 public surface：

```ts
TrChat.Provider
TrChatProviderProps
ChatProvider.vue
```

### 5.4 preset slices

| 当前名称 | 建议名称 | 原因 |
| :-- | :-- | :-- |
| `ChatPresetRootSlice` | `ChatPresetProviderSlice` | 对齐 `Provider` 语义 |
| `presetSlices.root` | `presetSlices.provider` | 对齐 `Provider` 语义 |

### 5.5 保留不改

下面这些命名当前不建议动：

| 名称 | 保留原因 |
| :-- | :-- |
| `TrChat` | 主入口语义清楚 |
| `TrChat.Scaffold` | 虽然不是最主流词，但职责还能对上 |
| 顶层 prop `runtime` | 作为页面实例级输入集合，当前语义仍然成立 |
| `chatKit.runtime` | 这是 `useChatKit()` 实例上的 runtime bridge，语义成立 |
| `mcpManager` | 业务语义清楚，不建议进一步抽象 |

## 6. 推荐的最终命名模型

如果这轮方案落地，用户心智应当变成：

### 6.1 黑盒入口

```ts
<TrChat :config="chatConfig" :runtime="runtime" />
```

- `config`
  - 稳定默认值
- `runtime`
  - 页面实例输入

### 6.2 配置里的默认集成

```ts
const chatConfig = {
  integrations: {
    mcpManager,
  },
}
```

- `integrations`
  - 配置里的默认集成对象

### 6.3 白盒/半白盒入口

```ts
<TrChat.Scaffold ... />
<TrChat.Provider ... />
```

- `Scaffold`
  - 负责装配
- `Provider`
  - 负责上下文注入

## 7. 对多模态方案的影响评估

[chat-multimodal-upload-plan.md](./chat-multimodal-upload-plan.md) 的方向与本提案是一致的。

那份方案正在强化：

- 顶层 `runtime.attachmentsManager`
- 顶层 `runtime.multimodal`

这进一步说明：

- 顶层 `runtime` 应该保留
- `config.runtime` 更应该改名

如果采用这次命名提案，多模态方案中的示例会更自然：

```ts
const chatConfig = {
  integrations: {
    mcpManager,
  },
}

const runtime = {
  attachmentsManager,
  multimodal,
}
```

这比“两个 `runtime` 同时存在”更容易理解。

## 8. 这轮不建议做的重命名

为了避免把范围做大，这轮不建议继续改：

- `presetOverrides`
- `ChatPresetProps`
- `ChatPresetSlices`
- `useChatKit`
- `ResponseProvider`

这些命名虽然还可以继续讨论，但不是当前理解成本最高的部分。

## 9. 本轮改动范围

这轮需要一起落下来的改动面如下。

### 9.1 类型与运行时

- `packages/chat/src/runtime/config/types.ts`
- `packages/chat/src/runtime/config/configLoader.ts`
- `packages/chat/src/runtime/config/configProjection.ts`
- `packages/chat/src/runtime/config/index.ts`
- `packages/chat/src/runtime/scaffold/resolveRootChatKit.ts`
- `packages/chat/src/runtime/scaffold/scaffoldRuntime.ts`
- `packages/chat/src/types/scaffold.ts`
- `packages/chat/src/types/ui.ts`
- `packages/chat/src/types/index.ts`

需要完成的事情：

- `ChatConfigRuntime` -> `ChatConfigIntegrations`
- `config.runtime` -> `config.integrations`
- `normalizeRuntime()` -> `normalizeIntegrations()`
- `ChatScaffoldRuntimeInput` -> `TrChatRuntimeInput`
- `ChatPresetRootSlice` -> `ChatPresetProviderSlice`
- `presetSlices.root` -> `presetSlices.provider`
- `resolveRootChatKit*` -> `resolveProviderChatKit*`

### 9.2 组件与入口

- `packages/chat/src/components/core/ChatRoot.vue`
- `packages/chat/src/components/core/ChatScaffold.vue`
- `packages/chat/src/components/history/ChatHistorySurface.vue`
- `packages/chat/src/index.ts`

需要完成的事情：

- `ChatRoot.vue` -> `ChatProvider.vue`
- `ChatRoot` -> `ChatProvider`
- `TrChat.Root` -> `TrChat.Provider`
- `TrChatRootProps` -> `TrChatProviderProps`
- `TrChatRootSharedProps` -> `TrChatProviderSharedProps`
- 所有错误文案、注释、插槽暴露语义同步改成 `Provider`

### 9.3 demo / docs / tests

- `packages/chat/demo`
- `packages/chat/tests`
- `docs/src/components`
- `packages/chat/docs`

需要完成的事情：

- demo 中的 `config.runtime` 全部改成 `config.integrations`
- 文档里的 `TrChat.Root` 全部改成 `TrChat.Provider`
- 文档里的 `config.runtime` 全部改成 `config.integrations`
- 文档里的类型名、slice 名同步更新
- 测试断言与快照同步更新命名

## 10. 推荐实施顺序

如果真正开始改名，推荐顺序如下：

1. 配置层改名
   - `ChatConfigRuntime` -> `ChatConfigIntegrations`
   - `config.runtime` -> `config.integrations`
2. 公共类型改名
   - `ChatScaffoldRuntimeInput` -> `TrChatRuntimeInput`
3. `Root` 改名
   - `Root` -> `Provider`
   - `TrChatRootProps` -> `TrChatProviderProps`
4. preset slice 改名
   - `root` -> `provider`
5. 最后统一更新 docs / demo / analysis docs

## 11. 执行检查单

开始实现前后都可以按这份检查单核对：

- [ ] 源码里不再出现 `config.runtime`
- [ ] 源码里不再出现 `ChatConfigRuntime`
- [ ] 公共类型里不再出现 `ChatScaffoldRuntimeInput`
- [ ] `TrChat.Root` 已完全替换为 `TrChat.Provider`
- [ ] `presetSlices.root` 已完全替换为 `presetSlices.provider`
- [ ] `resolveRootChatKit*` 已完全替换为 `resolveProviderChatKit*`
- [ ] demo、docs、tests 中的旧命名已同步清理
- [ ] 顶层 prop `runtime` 保持原名不变

## 12. 最终建议

这轮命名优化最值得直接拍板的是：

1. `config.runtime` -> `config.integrations`
2. `ChatScaffoldRuntimeInput` -> `TrChatRuntimeInput`
3. `TrChat.Root` -> `TrChat.Provider`
4. `presetSlices.root` -> `presetSlices.provider`

一句话总结：

- **保留顶层 `runtime`，改掉配置里的 `runtime`；保留 `Scaffold`，把 `Root` 改成 `Provider`。**
