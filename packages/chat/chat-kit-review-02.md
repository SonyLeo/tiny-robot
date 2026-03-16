# TinyRobot Chat Kit Review 02

> 基于 [chat-kit-design.md](/d:/OpenTinyRepository/tiny-robot/docs/chat-kit-design.md) 的后续执行版评审文档
> 目标：让 review 与 design 口径完全一致，并把下一阶段真正要做的事情收敛成可落地台账。

---

## 一、当前判断

当前 `packages/chat` 的核心骨架已经稳定，不再处于“补基础能力”的阶段，而是进入：

> 把现有运行时能力系统化升级为稳定 feature 契约的阶段

这一判断建立在当前已落地能力之上：

- `Root + Layout` 双层模型已完成
- `useChatKit` 已完成内部 slice 化
- `retry / optimistic / rollback / docs variant` 已完成
- MCP、模型切换、消息动作入口均已完成收敛
- `config -> adapter -> preset` 第一版链路已落地

因此，后续工作的重点不应再是重复整理基础能力，而应转向：

1. 扩大 `ChatConfig` 与 adapter 的能力表达面
2. 引入 first-party feature registry
3. 将高价值聊天能力从“原子组件存在 / demo 可拼”提升为“chat kit 契约已成立”
4. 为 `chat-cli` 提供可稳定消费的 feature 输入

---

## 二、与 design 对齐后的核心结论

### 2.1 正确方向

后续演进方向应保持为：

```text
ChatConfig
  -> Adapter Layer
  -> Feature Registry
  -> Preset / Context Layer
  -> TrChat Blackbox / White-box Composition
```

这意味着：

- `packages/components` 继续保留原子能力层职责
- `packages/chat` 负责沉淀聊天场景高价值能力
- `chat-cli` 通过稳定 config / preset 消费这些能力

### 2.2 不应继续做的事

不建议继续采用以下路线：

1. 继续给 `TrChat` 堆更多离散 props
2. 把 `packages/components` 中所有组件都平移为 `TrChat.*`
3. 在 demo 中拼出新能力，再反向让 chat 适配
4. 在 feature registry 成熟之前，先扩张 CLI flags 或模板分支
5. 过早投入 workspace / theme，而忽略高频聊天能力的契约化

### 2.3 设计与实现之间的真实差距

当前最大的差距不是“运行时没能力”，而是：

- 运行时已有能力较多
- 配置层和 adapter 层仍偏窄
- feature 还没有统一注册面

所以更准确的问题定义是：

> 需要把已有运行时能力提升为稳定、声明式、可生成的 feature 配置能力

---

## 三、下一阶段要做的事情

### 3.1 第一优先级：Feature Registry 基础设施

这是后续所有能力扩展的前提。

目标：

- 建立 first-party feature registry
- 让 feature 的默认行为、所需状态、preset 映射关系有统一入口
- 避免继续在 `TrChat.vue`、`createPresetChatProps()`、demo 中分散硬编码

建议落地：

1. 在 `packages/chat/src` 中新增 registry 目录
2. 定义基础类型：
   - `ChatFeatureDefinition`
   - `ChatFeatureResolveContext`
   - `ResolvedChatFeature`
   - `ResolvedChatFeatures`
3. 提供 feature 解析入口：
   - `resolveChatFeatures(config, context)`
4. 让 registry 优先服务：
   - adapter
   - preset
   - blackbox / white-box shared foundation

这一阶段的成功标准：

- feature 有统一注册入口
- `createPresetChatProps()` 不再只靠手工追加能力
- 新 feature 可以先落在 registry，而不是先改黑盒组件

### 3.2 第二优先级：Attachments Feature

这是最值得最先沉淀的高价值能力。

原因：

- 高频出现在真实聊天产品中
- 当前已经有渲染原子能力
- 最适合被声明式配置驱动
- 对 `chat-cli` 的模板价值也最高

但这一阶段要控制边界，不建议直接定义为“完整多模态栈”。

建议首期范围：

1. 统一附件消息展示契约
2. 统一 sender 附件输入契约
3. 统一附件状态结构
4. 明确 feature 配置与 layout placement

不建议首期就承诺：

- 所有 provider 的上传 transport 统一
- 完整语音 / 图像理解协议
- 所有多模态模型差异适配

### 3.3 第三优先级：Sender Actions Feature

这部分建议与 attachments 联动推进。

目标：

- 将 upload / voice / wordCount / default actions 等能力从 slot 手工拼装，升级为 feature 级配置

建议落地：

1. 设计 `ChatSenderActionsFeatureConfig`
2. 建立 action registry 或 action config 映射
3. 支持不同默认 actions 组合
4. 保证黑盒和白盒共享同一默认行为

成功标准：

- sender actions 可配置开启
- 不再依赖 demo 级手工 slot 才能启用
- CLI 模板可以根据 feature 稳定生成 sender 结构

### 3.4 第四优先级：Suggestions Feature

当前 `welcome.prompts` 只是建议能力的一个局部子集。

建议将建议类能力统一为：

- welcome suggestions
- composer suggestions
- command suggestions

目标：

- 形成统一 suggestion feature，而不是继续把建议内容散落在 welcome 或 demo 里

成功标准：

- suggestion 具有统一 feature 配置
- welcome / sender / 未来 command palette 可共享同一 suggestion 体系

### 3.5 第五优先级：MCP Config 化

当前 MCP 运行时能力已具备基础，下一步不应重新设计 MCP 能力，而应：

- 将 MCP 纳入 feature registry
- 纳入 `ChatConfig` / adapter / preset 解析
- 让 MCP 面板、placement、默认能力边界可声明式配置

建议落地：

1. 新增 `ChatMcpFeatureConfig`
2. 定义 MCP feature 在 preset 中的稳定输出
3. 约束 MCP 面板 placement 与黑白盒接入方式

成功标准：

- MCP 不再只是运行时注入能力
- `chat-cli` 可以稳定生成“启用 MCP 的模板”

### 3.6 第六优先级：Docs / Workspace Layout 层

`docs variant` 现在已经有第一版实现，但更完整的 layout 抽象还没形成。

建议下一步不是立刻做“大工作台”，而是：

1. 正式定义 layout config
2. 将 `bubble / docs / workspace` 统一视为 layout variant
3. 逐步把历史区、MCP 面板、附件区等 placement 配置化

这部分应晚于 feature registry 与高频 feature 契约。

### 3.7 第七优先级：Theme 与壳层能力

Theme 有价值，但建议明确放在更后面。

原因：

- 它更偏 app shell 层
- 对 chat kit 主链路价值不如 attachments / senderActions / suggestions / MCP
- 更适合作为模板层、workspace 层能力推进

---

## 四、建议的执行阶段

### Phase A：Registry Foundation

目标：

- 建立 feature registry 基础设施
- 保持 `TrChatProps` 和现有黑白盒用法兼容

范围：

- registry types
- registry resolver
- adapter / preset 接入 registry

验收：

- 能以 registry 形式声明一个内建 feature
- 现有 demo / tests 不回退

### Phase B：High-value Features

目标：

- 正式沉淀 attachments / senderActions / suggestions

范围：

- feature config
- preset 映射
- 黑白盒对齐
- 最小模板可生成验证

验收：

- 三类 feature 都可通过 config 启用
- 不再依赖 demo 手工拼装

### Phase C：MCP Config + Layout Formalization

目标：

- 把 MCP 与布局层从“运行时现状”升级为“稳定配置能力”

范围：

- MCP feature config
- layout config
- `bubble / docs / workspace` 变体抽象

验收：

- MCP 可声明式开启
- layout variant 可配置
- docs / future workspace 路线清晰

### Phase D：Template / CLI Consumption

目标：

- 让 `chat-cli` 真正消费 feature registry 结果

范围：

- feature -> template mapping
- CLI template variants
- smoke tests

验收：

- CLI 能稳定生成不同 feature 组合模板
- 不需要在模板里写大量手工 `App.vue` 拼装逻辑

---

## 五、对实现顺序的建议

为了控制风险，建议严格按以下顺序推进：

1. 先做 registry foundation
2. 再做 attachments / senderActions / suggestions
3. 再做 MCP config 化
4. 再做 docs / workspace layout 正式抽象
5. 最后再做 theme 与更完整壳层能力

不建议跳过前面步骤，直接做：

- workspace 大工作台
- theme 系统
- 大量 CLI feature flags

因为这些都依赖前面的 feature 契约先稳定。

---

## 六、建议的验收方式

后续每个阶段都建议采用三层验收：

### 6.1 Runtime 验收

- 黑盒能力是否可直接使用
- 白盒能力是否共享同一底座
- 现有功能是否无回退

### 6.2 Config 验收

- 新 feature 是否可通过 `ChatConfig` 描述
- adapter / preset 是否能稳定解析
- 不依赖手写 demo 逻辑

### 6.3 Template / CLI 验收

- `chat-cli` 是否可以消费该 feature
- 是否能生成稳定模板差异
- 是否仍保持安全默认值

---

## 七、最终建议

当前 `packages/chat` 的正确下一步，不是继续做“基础修补”，而是：

> 正式进入 feature 契约化阶段

最值得立即启动的工作是：

1. Feature Registry Foundation
2. Attachments Feature
3. Sender Actions Feature
4. Suggestions Feature

然后再进入：

5. MCP Config 化
6. Layout Formalization
7. Theme / Workspace 壳层能力

一句话总结：

> `review-02` 的目标不是重新定义 chat，而是把 design 中的 vNext 方向转成一套可以逐阶段推进、逐阶段验收的执行台账。
