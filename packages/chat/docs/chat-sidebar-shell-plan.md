# Chat Sidebar Shell 默认布局规划

> Last updated: `2026-03-27`
> Status: `planning`
> Scope: `packages/chat` 默认布局从“主内容区 + history drawer”升级为“sidebar shell + 主内容区”的设计与实施前置说明
> Related:
> - [Chat 实现说明](./chat-implementation.md)
> - [Chat CLI Design](./chat-cli-design.md)
> - [Chat Progress](../progress.md)

---

## 1. 变更背景

当前 `TrChat` 的默认内建形态仍然是：

- 顶部 `Header`
- 中间 welcome / message list
- 底部 `Footer + Sender`
- 独立 `History` drawer

产品方向已经明确要求默认布局升级为左右分栏：

- 左侧：固定品牌区 + 可扩展功能区
- 右侧：聊天主内容区
- 左侧收起后：rail / 侧边栏模式
- 默认功能区：历史会话管理
- 允许消费者按需替换左侧内容

这意味着本次工作不是单纯把 `History` 从 drawer 挪到左边，而是要把 `packages/chat` 的默认 shell contract 正式化。

---

## 2. 目标

本次规划的目标是：

- 让 `TrChat` 默认提供可直接落地的 sidebar shell，而不是要求所有消费者都进入 `TrChat.Scaffold`
- 保持黑盒与白盒两条路径都能消费同一套默认值解析链
- 让左侧品牌区和功能区都有明确扩展点
- 保持 `history` 仍然是默认左侧内容，但不把“左侧栏”抽象死成 history-only
- 让桌面端 collapsed rail 与移动端 drawer 都属于同一套 shell 语义

---

## 3. 非目标

本阶段不计划处理：

- provider / runtime / tool / MCP 的底层协议改造
- 通过 `config` 描述任意业务组件树
- PR 拆分与发布步骤
- 模板体系的整体重构
- 与本次 shell 升级无关的视觉重做

---

## 4. 目标 contract 方向

### 4.1 用 `shell`，不要继续挤压 `layout`

当前 `layout` 只表达消息区域相关语义：

- `messageListVariant`
- bubble placement

它不适合继续承载整页壳层结构。

推荐方向：

```ts
interface ChatShellConfig {
  variant?: 'stacked' | 'sidebar'
  sidebar?: {
    collapsible?: boolean
    defaultWidth?: number
    collapsedWidth?: number
    mobileMode?: 'drawer'
    defaultOpen?: boolean
    showBrand?: boolean
    defaultContent?: 'history'
  }
}
```

说明：

- `layout` 继续负责消息区表达
- `shell` 负责整个聊天页的壳层布局
- `variant: 'stacked' | 'sidebar'` 是当前最小可行枚举

### 4.2 `history` 仍然是 feature，不等于 sidebar

推荐保持：

- `history` 负责“是否具备会话历史管理能力”
- `shell.sidebar` 负责“左侧区域以什么形态展示、是否可折叠、移动端怎么表现”

这能避免未来出现下面这种 contract 错位：

- 左栏已经被替换成 Agent 导航、知识库、品牌工作台
- 但公开 API 仍然满是 `history` 命名

### 4.3 `config` 只描述稳定默认值，不描述任意左栏组件树

建议边界：

- `config.ui.brand`：品牌默认值
- `config.shell.sidebar`：sidebar 默认宽度、折叠、移动端行为
- `config.features.history`：默认是否启用历史能力

不建议：

- 在 `config` 中直接放任意 Vue 组件
- 用配置层承载复杂业务左栏编排

复杂内容应该通过：

- 黑盒 slot
- `TrChat.Scaffold`
- 白盒组合

### 4.4 黑盒默认 renderer 需要新的 sidebar 扩展口

建议新增一组页面级 slots：

- `sidebar`
- `sidebar-brand`
- `sidebar-content`
- `sidebar-footer`
- `sidebar-rail`

建议语义：

- `sidebar`：完整替换默认左栏装配
- `sidebar-brand`：左上固定品牌区
- `sidebar-content`：左侧主功能区
- `sidebar-footer`：左下扩展区
- `sidebar-rail`：收起态 rail 的独立渲染口

原因：

- 收起态 rail 和展开态 sidebar 不是同一个密度级别
- 如果没有 `sidebar-rail`，消费者提供复杂 sidebar 后，收起态通常不可用

### 4.5 白盒路径需要可消费的 shell slice / building blocks

仅修改黑盒 `TrChat` 还不够。

`TrChat.Scaffold` / `TrChat.Root` 至少需要能消费：

- `presetSlices.shell`
- `TrChat.Sidebar` 或等价的 shell 叶子组件

否则黑盒默认和白盒推荐路径会分裂成两套完全不同的页面结构。

### 4.6 当前 history 内容要从“drawer 组合”升级为“默认 sidebar 模块”

现有 `ChatHistoryContent` 已经是一个自然的默认左栏模块：

- `NewSession`
- `Toolbar`
- `List`
- `Panel`

但它当前更多是 drawer 内部组合。

升级方向应该是：

- 作为默认 sidebar content 可直接消费
- `HistorySurface` 仍然保留为公开白盒 building block
- `historyProps` 必须真正打通到 history UI，而不只是停留在 preset 投影层

---

## 5. 需要补齐的 UI 状态模型

当前 `CHAT_UI_KEY` 下的 history 语义偏窄：

- `display: 'drawer' | 'surface'`
- `visible`
- `open / close / toggle`

它不足以表达 sidebar shell。

下一阶段建议把“历史显示状态”提升为“shell/sidebar 状态”，至少要能稳定表达：

- 桌面 inline sidebar 是否可见
- 是否处于 collapsed rail
- 移动端是否以 drawer 形态打开
- header / rail / overlay 是否共享同一套 toggle contract

不建议继续围绕 `history.display` 叠补丁。

---

## 6. 受影响的代码面

### 6.1 Shared contract / config pipeline

这些文件决定 `config -> adapter -> preset -> cli surface`：

- `packages/chat/src/types/ui.ts`
- `packages/chat/src/adapters/types.ts`
- `packages/chat/src/adapters/configLoader.ts`
- `packages/chat/src/adapters/configProjection.ts`
- `packages/chat/src/adapters/chatCli.ts`
- `packages/chat/src/presets/resolve.ts`

这里的核心任务是：

- 引入 `shell` contract
- 定义 `presetProps / presetSlices` 中的 shell 投影
- 保持 `chat-cli` 可消费 surface 与新 shell contract 对齐

### 6.2 Context / runtime shell state

- `packages/chat/src/context.ts`
- `packages/chat/src/chatUiContext.ts`
- `packages/chat/src/components/chat/ChatRoot.vue`
- `packages/chat/src/components/chat/ChatScaffold.vue`

这里负责：

- 注入 shell 状态
- 定义黑盒与白盒共享的 UI contract

### 6.3 默认 renderer / layout

- `packages/chat/src/components/chat/ChatLayout.vue`
- `packages/chat/src/components/chat/ChatDefaultRenderer.vue`
- `packages/chat/src/components/chat/ChatHeader.vue`
- `packages/chat/src/styles/layout.css`

这里负责：

- 默认左右结构
- 收起态 rail
- 头部与 sidebar toggle 的语义收敛

### 6.4 History leaf components

- `packages/chat/src/components/history/ChatHistory.vue`
- `packages/chat/src/components/history/ChatHistorySurface.vue`
- `packages/chat/src/components/history/ChatHistoryContent.vue`
- `packages/chat/src/components/history/ChatHistoryList.vue`
- `packages/chat/src/components/history/ChatHistoryToolbar.vue`
- `packages/chat/src/components/history/ChatHistoryPanel.vue`

这里的重点不是重写 history，而是让它作为：

- 默认 sidebar content
- 可复用白盒模块

同时要避免继续假设“历史只会出现在 drawer 里”。

### 6.5 Docs / demos / templates / tests

- `packages/chat/demo/src/components/BlackboxDemo.vue`
- `packages/chat/demo/src/components/WhiteboxDemo.vue`
- `docs/src/components/chat*.md`
- `packages/chat/tests/*`
- `packages/test/src/chat/*`
- `packages/chat-cli/templates/*`

这里负责把新 shell contract 变成：

- 可演示
- 可文档化
- 可测试
- 可被模板稳定消费

---

## 7. 对 `packages/chat-cli` 的影响

CLI 当前消费的是稳定 capability surface，而不是具体页面 DOM。

但这次升级依然会影响 `chat-cli`，因为它当前稳定消费面里包含：

- `layout`
- `history`
- `showHistory`
- `historyProps`

需要提前确认的原则是：

- CLI 不要自己发明 sidebar 抽象
- CLI 只消费 `packages/chat` 稳定暴露出的 `shell` / `history` contract
- `basic` 和 `agent-mcp` 不应各自手工分叉出两套 sidebar 逻辑

换句话说：

- 这次变更首先是 `packages/chat` 的 shell formalization
- 其次才是 CLI 模板如何跟进消费

---

## 8. 主要风险

### 8.1 默认行为变化面很大

任何直接消费 `<TrChat />` 的页面都会感知新外观。

### 8.2 `showHistory` 命名会语义漂移

如果 header 上实际控制的是 sidebar，而公开 prop 仍叫 `showHistory`，会越来越误导。

### 8.3 现有 `historyProps` 仍未真正打通

如果不先补齐这条链路，就会出现：

- 文档说 sidebar 默认是 history，可配置
- 但消费者实际只能开关它，不能稳定定制它

### 8.4 黑盒和白盒可能分叉

如果只升级 `ChatDefaultRenderer`，不升级 `Scaffold` 推荐路径和 shell slices，后续文档会很难维护。

### 8.5 模板差异空间会被重排

默认 shell 变强后，`basic`、`agent-mcp`、后续 workbench 模板之间的差异边界会被重新定义。

---

## 9. 验证矩阵

### 9.1 Contract tests

需要覆盖：

- `loadChatConfig` 能否规范化 `shell`
- `createPresetChatProps` 能否产出稳定 shell 默认值
- `createPresetChatSlices` 能否稳定暴露 `shell` slice
- `createChatCliCapabilitySurface` 能否对齐新的 shell 消费面

### 9.2 Component / surface tests

需要新增或更新场景：

- 默认 `TrChat` 渲染 sidebar shell
- sidebar 收起 / 展开
- rail 渲染
- 移动端 drawer 打开 / 关闭
- `sidebar-brand` / `sidebar-content` / `sidebar-footer` / `sidebar-rail` slots
- white-box `Scaffold` 组合 sidebar shell
- `HistorySurface` 继续可独立使用

### 9.3 Docs / demo / template validation

最小验证集建议至少包含：

- `pnpm -F @opentiny/tiny-robot-chat type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat test:unit`
- `pnpm.cmd -F @opentiny/tiny-robot-chat-demo type-check`
- `pnpm.cmd -F @opentiny/tiny-robot-chat-demo build`
- `pnpm.cmd -F tiny-robot-test test -- src/chat/index.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/scaffold.spec.ts`
- `pnpm.cmd -F tiny-robot-test test -- src/chat-cli/release.spec.ts`

---

## 10. 功能确认前必须明确的产品问题

这些问题不先确认，代码很容易写成半成品：

1. 默认 sidebar 展开态是否始终可见，还是允许默认收起？
2. collapsed rail 默认要保留哪些元素：
   - 仅 logo
   - logo + 新建会话
   - logo + 新建会话 + 打开按钮
3. 顶部 header 是否仍然保留完整品牌信息，还是仅保留操作区？
4. 移动端是否统一降级为 drawer？断点是多少？
5. sidebar 状态是否需要持久化到 storage？
6. `basic` 模板是否跟随默认 shell 同步升级？
7. 左侧功能区默认是否只放 history，还是还应允许默认带模型/MCP/快捷入口？

---

## 11. 当前建议

在功能细节确认前，推荐按下面的顺序推进：

1. 先冻结 `shell` / `sidebar` / `history` 的边界命名
2. 再冻结黑盒 slots 与 white-box shell slice
3. 再确认产品上的 header / rail / mobile 行为
4. 最后才进入实现与迁移

这能避免把“默认左右分栏”做成一次性页面改版，而是把它沉淀为 `packages/chat` 可长期演进的公共 shell contract。
