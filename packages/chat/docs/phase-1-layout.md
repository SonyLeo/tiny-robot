# 阶段一：Chat 布局层

## 1. 目标

阶段一只解决聊天产品的布局壳层：

- 页面级聊天骨架
- 左右 aside 的布局模式
- dock / drawer 的纯 UI 状态
- header / main / footer 的宽度与间距契约

当前不处理：

- 会话、消息、模型等业务数据
- 发送、流式输出、联网等业务流程
- `ChatApp` 高层封装
- `Teleport`
- `body scroll lock`
- focus trap

## 2. 当前组件

当前对外保留 4 个布局原语：

- `Chat.Layout`
- `Chat.Main`
- `Chat.Aside`
- `Chat.AsideToggle`

职责划分：

- `Chat.Layout`
  - 对外唯一布局入口
  - 内部创建并提供 layout store
  - 负责固定骨架、左右 aside、drawer/backdrop
- `Chat.Main`
  - 提供主内容区域容器
- `Chat.Aside`
  - 提供统一的左/右侧内容壳
- `Chat.AsideToggle`
  - 提供统一的左/右侧开关行为

## 3. 公共模型

### 3.1 类型

```ts
type ChatAsidePlacement = 'left' | 'right'
type ChatAsideLayoutMode = 'dock' | 'drawer'

interface ChatAsideConfig {
  layoutMode?: ChatAsideLayoutMode
  expanded?: boolean
  expandedWidth?: number | string
  collapsedWidth?: number | string
}

interface ChatLayoutProps {
  leftAside?: ChatAsideConfig
  rightAside?: ChatAsideConfig
}
```

### 3.2 语义

- `dock`
  - 展开时占据布局空间
- `drawer`
  - 展开时悬浮，不占据布局空间
- `expanded = true`
  - 当前打开
- `expanded = false`
  - 当前关闭
- `collapsedWidth > 0`
  - 仅对 `dock` 有意义，关闭后保留 rail
- `collapsedWidth = 0` 或未配置
  - 仅对 `dock` 有意义，关闭后完全隐藏

状态映射：

- `dock + expanded = true` => panel
- `dock + expanded = false + collapsedWidth > 0` => rail
- `dock + expanded = false + collapsedWidth = 0/undefined` => hidden
- `drawer + expanded = true` => drawer open
- `drawer + expanded = false` => drawer closed

## 4. 对外 API

### 4.1 `Chat.Layout`

props：

- `leftAside?: ChatAsideConfig`
- `rightAside?: ChatAsideConfig`

events：

- `update:leftAside`
- `update:rightAside`

说明：

- `Chat.Layout` 现在按受控配置工作
- 业务侧可以直接用媒体查询切换 `layoutMode / expanded`
- 不再提供 `mobileBreakpoint`
- 不再提供 `a11y`
- 不再提供 `page-layer`

slots：

- `left-aside`
- `header`
- `main`
- `footer`
- `right-aside`

### 4.2 `Chat.Aside`

props：

- `placement: 'left' | 'right'`

slot props：

```ts
{
  isExpanded: boolean
}
```

复杂场景建议直接配合 `useChatAside()` 使用。

### 4.3 `Chat.AsideToggle`

props：

- `placement: 'left' | 'right'`
- `ariaLabel?: string`

slot props：

```ts
{
  isExpanded: boolean
}
```

## 5. CSS 变量策略

布局行为走 props，视觉尺寸走 CSS variables。

### 5.1 Aside 宽度

| 变量 | 生效范围 | 作用 |
| --- | --- | --- |
| `--tr-chat-layout-left-expanded-width` | 左侧展开态 | 左侧 panel 宽度 |
| `--tr-chat-layout-left-collapsed-width` | 左侧 rail 态 | 左侧 rail 宽度 |
| `--tr-chat-layout-right-expanded-width` | 右侧展开态 | 右侧 panel 宽度 |
| `--tr-chat-layout-right-collapsed-width` | 右侧 rail 态 | 右侧 rail 宽度 |

说明：

- `expandedWidth / collapsedWidth` 会被 `Chat.Layout` 转成上述变量
- `drawer` 模式打开时使用 `expandedWidth`
- `collapsedWidth` 同时决定 dock 关闭后的 rail / hidden 形态

### 5.2 Header / Main / Footer

| 变量 | 作用 |
| --- | --- |
| `--tr-chat-layout-content-max-width` | 三个区域的统一内容最大宽度 fallback |
| `--tr-chat-layout-header-max-width` | header 内容最大宽度 |
| `--tr-chat-layout-main-max-width` | main 内容最大宽度 |
| `--tr-chat-layout-footer-max-width` | footer 内容最大宽度 |
| `--tr-chat-layout-inner-padding-inline` | 三个区域统一水平内边距 fallback |
| `--tr-chat-layout-header-padding-inline` | header 水平内边距 |
| `--tr-chat-layout-main-padding-inline` | main 水平内边距 |
| `--tr-chat-layout-footer-padding-inline` | footer 水平内边距 |

### 5.3 公共视觉

| 变量 | 作用 |
| --- | --- |
| `--tr-chat-layout-bg` | 页面背景 |
| `--tr-chat-layout-left-bg` | 左侧背景 |
| `--tr-chat-layout-right-bg` | 右侧背景 |
| `--tr-chat-layout-header-bg` | header 背景 |
| `--tr-chat-layout-main-bg` | main 背景 |
| `--tr-chat-layout-footer-bg` | footer 背景 |
| `--tr-chat-layout-divider-color` | 分割线颜色 |
| `--tr-chat-layout-panel-shadow` | drawer 阴影 |
| `--tr-chat-layout-overlay-bg` | drawer 遮罩层颜色 |
| `--tr-chat-layout-z-index-overlay` | drawer / backdrop 层级 |
| `--tr-chat-layout-transition-duration` | 布局基础过渡时长 |
| `--tr-chat-layout-transition-easing` | 布局基础过渡缓动 |

## 6. 当前案例

### DeepSeek

- 左侧：`drawer`
- 右侧：desktop `dock + collapsedWidth=0`，mobile `drawer`
- launcher 已从 layout 公共 slot 中移出，回到 case 自己管理

### ChatGPT

- 左侧：`dock + rail`
- 右侧：desktop `dock + collapsedWidth=0`，mobile `drawer`
- rail/panel 使用同一套 sidebar DOM

## 7. 当前结论

- `ChatGPT rail` 已经收敛成 layout 官方能力
- `collapsedWidth` 统一承担 dock 关闭后的 rail / hidden 语义
- `DeepSeek` 更适合用 `drawer` 表达，而不是再保留旧 `hidden/overlay` 状态词
- layout 负责结构契约；具体产品动效和页面层元素继续留在案例侧
