# Chat 主链收敛追踪

> Last updated: `2026-03-29`
> Status: `Docs mainline alignment completed in first pass; cleanup pending`
> Primary doc: 本文档用于追踪当前这一轮 `packages/chat` 主链实现与文档收敛的策略、范围、进度和协作约束。
> Related:
> - [Chat 实现说明](./chat-implementation.md)
> - [useChatKit 实现深潜](./use-chat-kit-implementation-deep-dive.md)

## 1. 当前结论

这一轮工作的主原则已经冻结为：

- 先以 `packages/chat` 当前源码为唯一事实来源。
- 先收敛 chat 主链实现、公开 surface 和对外文档。
- `chat-cli` 暂不纳入本轮收敛范围，等 chat 主链稳定后再单独处理。
- 文档推荐路径调整为：
  - 黑盒优先
  - 局部定制优先 `presetOverrides` 和 slots
  - 页面结构明显超出默认装配时再进入 `TrChat.Scaffold`
  - 只有需要直接掌控 `chatKit` / `responseProvider` / root 注入层时才进入 `TrChat.Root`

## 2. 本轮目标

本轮目标不是扩展新的产品功能，而是把以下三件事收敛为同一套口径：

- 当前 chat 主链实现
- 当前 chat 对外公开 contract
- 当前 docs 站点中的 chat 文档叙事

预期结果：

- 新同学先看 `docs/src/components/chat*.md` 时，不会被旧路径误导。
- 团队内部讨论“推荐接入方式”时，有统一的主推口径。
- 后续处理 `chat-cli` 时，可以明确按 chat 主链反向对齐，而不是继续让两边互相牵制。

## 3. 当前事实来源

本轮默认按以下优先级判断真相：

1. `packages/chat/src` 当前实现
2. `packages/chat/src/types/*` 与 `packages/chat/src/adapters/*` 当前公开类型和投影逻辑
3. `packages/test/src/chat/*` 对保留 surface 的验证
4. `packages/chat/docs/*` 包级实现文档
5. `docs/src/components/chat*.md` 对外文档

如果低优先级文档和高优先级实现冲突：

- 以实现为准
- 在本轮中优先更新文档
- 不为了兼容旧文档叙事而回退主链实现

## 4. 当前冻结的主链口径

### 4.1 主链结构

当前推荐从这条链理解 `TrChat`：

```text
TrChat
  -> TrChat.Scaffold
    -> createChatAdapterFromConfig()
    -> createPresetChatProps()
    -> createPresetChatSlices()
    -> TrChat.Root
    -> ChatDefaultRenderer
```

### 4.2 模型切换主链

当前实际链路冻结为：

```text
config.models
  + config.defaults.model
  + runtime.selectedModel
  + callbacks.onModelChange
```

当前不把以下说法视为主链公开口径：

- `providerFactories`
- `presetOverrides.defaultModel`
- “页面层手工拼 provider 工厂链” 作为默认推荐做法

### 4.3 定制升级顺序

当前推荐的定制升级顺序冻结为：

1. `TrChat + config`
2. `TrChat + presetOverrides`
3. `TrChat + slots`
4. `TrChat.Scaffold`
5. `TrChat.Root`

## 5. 本轮范围

### 5.1 In scope

- `packages/chat/src` 内与主链 contract 直接相关的源码收敛
- `packages/chat/docs` 内对主链实现的说明文档
- `docs/src/components/chat.md`
- `docs/src/components/chat-config.md`
- `docs/src/components/chat-slots.md`
- `docs/src/components/chat-scaffold.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`

### 5.2 Out of scope

- `packages/chat-cli/*`
- CLI 模板生成物的叙事修复
- CLI 帮助文案和模板 README 收敛
- 以 `chat-cli` 当前现状反向影响 chat 主链 contract

如果后续发现 `chat-cli` 与 chat 主链不一致：

- 在本文档记录
- 不在本轮中扩大范围处理，除非它直接阻塞 chat 主链本身

## 6. 重点收敛问题

### P0. 纠正会误导接入的过时说法

优先修复这些高风险问题：

- `models[].provider` 与真实 `models[].providerId` 不一致
- 黑盒模型切换说明仍引用旧概念
- `providerFactories`、`presetOverrides.defaultModel` 等旧口径仍出现在推荐路径里
- 让 `TrChat.Root` 看起来和 `TrChat` 同等优先的叙事

### P1. 收敛信息架构

目标是让文档顺着真实使用路径展开：

- 先理解 `TrChat`
- 再理解 `config`
- 再理解 slots
- 再理解 `Scaffold`
- 最后理解 `Root` 和更底层工具链

### P2. 收敛公开 surface 边界

重点关注：

- 哪些字段是叶子组件稳定 props
- 哪些字段只是 preset slice 内部投影结果
- 哪些实现存在但不应该被文档化为正式 contract

## 7. 执行顺序

建议按以下顺序推进：

1. 冻结本文档中的策略和范围
2. 对齐 `packages/chat/src` 当前主链与类型边界
3. 重写总览和黑盒文档
4. 重写 slots / scaffold / advanced 的升级路径
5. 最后补文档间互链和阅读顺序

## 8. 当前任务清单

### A. 主链与类型核对

- [x] 确认 `TrChat -> Scaffold -> Root -> DefaultRenderer` 主链
- [x] 确认当前模型切换主链
- [x] 确认 slots 仍是默认黑盒定制的第一优先级
- [ ] 进一步确认哪些叶子组件 props 需要补齐公开类型

### B. 对外文档重写

- [x] 更新 `chat.md`
- [x] 更新 `chat-config.md`
- [x] 更新 `chat-slots.md`
- [x] 更新 `chat-scaffold.md`
- [x] 更新 `chat-features.md`
- [x] 更新 `chat-advanced.md`

### C. 包级说明同步

- [x] 新建本轮追踪文档
- [ ] 视需要更新 `chat-implementation.md`
- [ ] 在包级文档中补充本轮收敛后的最终结论

## 9. 协作规则

本轮协作默认遵守以下规则：

- 讨论 chat 推荐接入方式时，以本文档和 `packages/chat/src` 当前实现为准。
- 如果有人发现 `chat-cli` 与 chat 主链不一致，可以记录，但不自动把任务扩展到 CLI。
- 如果要修改主链口径，先改本文档，再改实现和 docs。
- 如果只是发现 `docs/src/components/chat*.md` 过时，优先直接修文档，不额外设计新抽象。

## 10. 进度记录

### 2026-03-29

- 明确本轮范围只覆盖 `packages/chat` 主链和 chat 文档。
- 明确 `chat-cli` 暂不进入本轮处理。
- 冻结当前推荐口径为“黑盒优先，slots 次之，Scaffold 再后，Root 最后”。
- 冻结当前模型切换主链为 `config.models + config.defaults.model + runtime.selectedModel + callbacks.onModelChange`。
- 新建本文档用于追踪后续改动。
- 完成 `chat.md` 和 `chat-config.md` 的第一轮主链收敛。
- 完成 `chat-slots.md` 和 `chat-scaffold.md` 的第一轮主链收敛。
- 完成 `chat-features.md` 和 `chat-advanced.md` 的第一轮主链收敛。

## 11. 当前收尾结论

截至当前轮次，chat 文档主链已经完成第一轮收敛，核心结论如下：

- `packages/chat/src` 仍然是当前唯一事实来源。
- `chat-cli` 仍然明确不在本轮范围内。
- 对外文档的主推路径已经统一为：
  - `TrChat`
  - `presetOverrides`
  - slots
  - `TrChat.Scaffold`
  - `TrChat.Root`
- 当前模型切换主链已经统一写实为：
  - `config.models`
  - `config.defaults.model`
  - `runtime.selectedModel`
  - `callbacks.onModelChange`

## 12. 本轮已完成的对外文档

本轮已完成第一轮重写或重构的页面：

- `docs/src/components/chat.md`
- `docs/src/components/chat-config.md`
- `docs/src/components/chat-slots.md`
- `docs/src/components/chat-scaffold.md`
- `docs/src/components/chat-features.md`
- `docs/src/components/chat-advanced.md`

这些页面当前已经完成的主要收敛点：

- 去掉把白盒入口当成默认推荐入口的叙事
- 把 slots 提升为黑盒局部定制的第一优先级
- 把 `Scaffold` 收敛为结构性定制入口
- 把 `Root` 收敛为更底层的根注入入口
- 把示例字段改到 `providerId`
- 把模型切换说明收敛到当前真实主链
- 把 `shell` 明确纳入黑盒推荐范围
- 把 advanced 页收窄为真正的后置页面

## 13. 下一轮优先事项

如果下一轮要继续推进，建议按这个顺序处理：

### P1. 文档收尾清理

目标：

- 压缩六页之间的重复表述
- 统一措辞，例如：
  - “黑盒”
  - “默认装配链”
  - “结构性定制”
  - “根注入层”
- 检查是否还存在互相重复但表述略有漂移的段落

### P2. 公开 surface 边界复核

目标：

- 重新核对 `packages/chat/src/types/*` 与组件实现
- 重点确认哪些字段应该继续文档化为稳定 contract
- 重点关注：
  - `TrChatHeaderProps`
  - header slice 与叶子组件 props 的边界
  - 其他 preset slice 是否有类似问题

### P3. 包级实现说明同步

目标：

- 视需要更新 `packages/chat/docs/chat-implementation.md`
- 如果收尾轮确认当前文档体系已稳定，可把这里的主链结论回写进实现说明主文档

### P4. 之后再进入 `chat-cli`

前提：

- chat 主链口径稳定
- chat 公开 surface 边界确认完成
- docs 主叙事不再频繁调整

## 14. 明确仍未处理的事项

这些事项当前仍未在本轮中处理，下一轮不要误以为已经完成：

- `packages/chat-cli/*` 的模板、README、帮助文案与 chat 主链对齐
- CLI 模板中仍然存在的旧字段与旧叙事问题
- 对 docs 站点做完整构建验证
- 对整套 chat 文档做人工逐页审校
- 对中文措辞和篇幅做第二轮压缩优化

## 15. 当前风险与注意事项

### 1. `chat-cli` 仍然落后于 chat 主链

这不是遗漏，而是当前策略下的主动延后。  
下一轮如果讨论到 CLI，需要先承认这个前提，而不是把它当成这轮未完成的 bug。

### 2. 文档已完成第一轮收敛，但不代表所有公开 contract 边界都已最终冻结

特别是：

- preset slice 与叶子组件 props 的边界
- 部分叶子组件 surface 是否需要补齐公开类型

这些仍值得在下一轮做更细的源码复核。

### 3. 本轮以文档收敛为主，并未做 docs 站点构建验证

下一轮如果要做收尾，建议补一次最小可行验证，至少确认：

- 页面链接没有明显断裂
- 示例字段和当前类型口径一致
- 文档之间的推荐路径没有互相打架

## 16. 下一轮对话建议开场方式

为了让下一轮快速接上，建议直接从下面任一目标开始：

1. “继续做 chat 文档收尾，先压缩重复表述并统一措辞。”
2. “继续核对 chat 公开 surface 边界，重点看 `TrChatHeaderProps` 和 preset slices。”
3. “基于 `chat-mainline-alignment-progress.md`，开始处理 chat-cli 与 chat 主链对齐。”

如果没有新的范围变更，下一轮默认仍以本文档为主追踪文档。
