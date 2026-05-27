# packages/chat

## 1. 包定位

`@opentiny/tiny-robot-chat` 是一个 **chat 布局包**，不负责消息内容本身的渲染。

它主要解决：

- `normal / floating` 两种 surface 模式
- left / right aside 的 `dock / drawer` 切换
- dock aside 改宽
- floating surface 拖拽、改宽、视口边界约束
- `header / main / footer / aside` 插槽编排

对外导出：

- `Chat.Layout`
- `Chat.Main`
- `Chat.Aside`
- `Chat.AsideToggle`
- `@opentiny/tiny-robot-chat/style.css`

## 2. 目录速览

```text
packages/chat/
  src/
    composables/   状态与交互核心
    layout/        Vue 组件
    styles/        当前全局样式实现
    types/         对外类型与内部 store 类型
    utils/         几何、长度、DOM 交互工具
    index.ts       导出入口
    namespace.ts   Chat 命名空间导出
  demo/            演示入口
  README.md        包说明与使用示例
```

## 3. 关键文件

- `src/layout/ChatLayout.vue`
  - 总装配组件。
  - 负责 surface、Teleport、header/main/footer、left/right aside、backdrop。
- `src/composables/createChatLayoutStore.ts`
  - 左右 aside 的核心状态机。
  - 负责 `dock / drawer / rail / hidden / canResize` 计算。
- `src/composables/useChatSurface.ts`
  - floating 模式拖拽、左右改宽、边界约束。
- `src/utils/chatSurfaceGeometry.ts`
  - floating 宽高、坐标、最小最大宽度、视口边界解析。
- `src/composables/useChatAsideResize.ts`
  - dock aside 改宽逻辑。
- `src/composables/useChatLayoutViewState.ts`
  - 布局 class 和 CSS 变量派生。
- `src/composables/useChatMainScrollbar.ts`
  - `Chat.Main` 自定义滚动条。
- `src/composables/useChatAside.ts`
  - `Chat.Aside` / `Chat.AsideToggle` 读取 store 的统一入口。

## 4. 运行时主链路

### 4.1 Layout 主链路

`ChatLayout.vue`
-> `useModel(mode/floating/leftAside/rightAside)`
-> `createChatLayoutStore()`
-> `provideChatLayoutStore()`
-> `useChatLayoutInteractions()`
-> `useChatLayoutViewState()`
-> `useChatSurface()`

### 4.2 Aside 主链路

`ChatAside.vue` / `ChatAsideToggle.vue`
-> `useChatAside(placement)`
-> `useChatLayout()`
-> `store.left` / `store.right`

### 4.3 Main 主链路

`ChatMain.vue`
-> `useChatMainScrollbar()`
-> `scrollHost`
-> `unrefElement()`
-> 接管滚动条显示与 thumb 拖拽

## 5. 当前样式现状

当前样式实现仍然是 `src/styles/*.css` 的全局样式方案，入口关系如下：

- `src/index.ts`
  - 导入 `src/styles/index.css`
- `src/styles/index.css`
  - 导入 `tokens.css`
  - 导入 `layout.css`
- `src/styles/layout.css`
  - 导入 `surface.css`
  - 导入 `layout-shell.css`
  - 导入 `aside.css`
  - 导入 `aside-resize.css`

当前不是 SFC 内联 `<style>` 方案，样式 owner 仍以 `src/styles/` 下的 CSS 文件为准。

## 6. 后续样式规则

### 6.1 推荐方案

这个包是 **组件库**，后续样式建议采用：

- **保留 class-based 公共类名策略**
- **继续沿用 `src/styles/` 的分层 CSS 结构**
- **按现有 selector owner 落到对应 CSS 文件**
- **tokens 只放全局 CSS 变量**

不要把样式零散写回 `src/layout/*.vue` 的 `<style>`。

### 6.2 不建议方案

- 不建议改成 CSS Modules 作为主方案
  - 这个包需要可覆盖、可调试、可通过类名快速定位
- 不建议给组件库全面切到 `scoped` 当主策略
  - 外部覆盖和排查不如 class-based 直接
- 不建议在没有明确归属的情况下新增新的样式入口文件
  - 先复用已有 owner 文件

### 6.3 目标目录形态

当前目标结构：

```text
src/
  styles/
    tokens.css
    index.css
    layout.css
    surface.css
    layout-shell.css
    aside.css
    aside-resize.css
  layout/
    ChatLayout.vue
    ChatMain.vue
    ChatAside.vue
    ChatAsideToggle.vue
    ChatAsideResizeTrigger.vue
    ChatSurfaceResizeTrigger.vue
```

其中：

- `index.css`
  - 样式总入口
- `layout.css`
  - layout 相关样式聚合入口
- 其余文件负责实际规则定义

### 6.4 样式归属规则

- `tokens.css`
  - 只放 design tokens / CSS 变量
  - 不放具体结构样式
- `surface.css`
  - `layout host`
  - `surface`
  - floating drag bar
  - floating resize trigger
- `layout-shell.css`
  - `layout grid`
  - `header/main/footer shell`
  - `layout backdrop`
  - `.tr-chat-header`
  - `.tr-chat-main*`
  - `.tr-chat-footer`
  - `.tr-chat-aside` 基础滚动样式
  - `.tr-chat-panel-toggle`
- `aside.css`
  - `.tr-chat-layout__aside*`
  - `.tr-chat-aside--effect-*` 对应的 dock/drawer/rail/hidden 行为
- `aside-resize.css`
  - `.tr-chat-layout__resize-trigger*`

### 6.5 迁移原则

- 一个 class 只能有一个明确 owner
- 新增样式优先写到现有 owner CSS 文件
- 修改旧样式时，先确认 selector 当前归属，再落到对应文件
- 保持现有 `tr-chat-*` 命名，不要无意义改名
- 优先通过 CSS 变量开放定制，不要增加高优先级覆盖写法
- 改样式入口关系时，同步检查 `index.css` 和 `layout.css` 的 import

## 7. 修改入口速查

### 7.1 改 floating 行为

优先看：

- `src/composables/useChatSurface.ts`
- `src/utils/chatSurfaceGeometry.ts`

### 7.2 改 aside 展开/收起/drawer/dock/rail

优先看：

- `src/composables/createChatLayoutStore.ts`
- `src/composables/useChatLayoutViewState.ts`
- `src/composables/useChatAside.ts`

### 7.3 改 dock aside 改宽

优先看：

- `src/composables/useChatAsideResize.ts`

### 7.4 改 floating 左右改宽

优先看：

- `src/composables/useChatSurface.ts`
- `src/utils/chatSurfaceGeometry.ts`

### 7.5 改 main 区滚动条

优先看：

- `src/layout/ChatMain.vue`
- `src/composables/useChatMainScrollbar.ts`

## 8. 改动注意点

- `ChatLayout` 用了 `Teleport to="body"`，floating 样式排查时要同时看宿主和 teleport 后节点。
- aside 宽度最终通过 CSS 变量下发，不要只改模板，不改变量来源。
- `Chat.Main` 的滚动条只依赖显式传入的 `scrollHost`；改主区滚动结构时，先同步检查 `ChatMain.vue`、`useChatMainScrollbar.ts` 和 `docs/main-scroll.md`。
- 所有对外视觉定制，优先走 CSS 变量，不要直接写死到业务 demo。

## 9. 验证命令

```bash
pnpm -F @opentiny/tiny-robot-chat lint
pnpm -F @opentiny/tiny-robot-chat type-check
pnpm -F @opentiny/tiny-robot-chat build
```

## 10. 给后续大模型的执行约束

- 先读 `ChatLayout.vue`，再读相关 composable，不要只盯单个工具函数。
- 样式修改前，先确认类名 owner 和 CSS 变量来源。
- 涉及 floating / aside 宽度问题时，必须同时检查：
  - 组件模板
  - composable 状态
  - `chatSurfaceGeometry.ts` 或 `useChatAsideResize.ts`
  - 对应 CSS 变量和样式文件
- 后续如果开始做样式迁移，优先“小步搬迁”，不要一次性重写全部 CSS。
