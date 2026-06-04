# Layout CSS 变量收敛方案

## 目标

为 `Layout` 建立一套更克制、更稳定的 CSS 变量契约。

## 当前状态（2026-06-04）

- 组件源码、README、docs demo 和测试夹具已经收口到稳定公开变量面
- `layout.less` 现在只在 `:root` 注册公开变量，内部默认值已经回收到组件选择器上的局部 alias owner
- 这份文档里出现的旧变量名，主要用于解释“为什么不再公开”，不代表当前仍应在外部使用

> 注：这份文档包含旧变量收敛分析和历史反例。凡提及旧变量名，仅用于说明为何不再公开，不代表当前公开契约。当前公开变量面以 `README.md` 和 `docs/src/components/layout.md` 为准；实现进度以 `REFACTOR_PROGRESS.md` 为准。

这份文档只讨论三件事：

- 哪些 CSS 变量应该公开
- 哪些 CSS 变量应该降为内部实现
- 如何把变量收敛工作和后续 API / 状态层重构串成一条任务链

## 现状判断

当前 `Layout` 的 CSS 变量面偏大，主要有四个问题：

### 1. 文档暴露面大于真正稳定契约

当前：

- `layout.less` 注册了一大批默认变量
- `README.md` 和 `docs/src/components/layout.md` 也把大量变量写成了公开能力

但其中有一部分其实只是：

- 组件内部视觉细节
- 内部桥接变量
- 预留但尚未真正形成契约的变量

这会让外部误以为这些变量都值得长期依赖。

### 2. 状态桥接变量和主题变量混在一起

当前像下面这类变量：

- `--tr-layout-left-expanded-width`
- `--tr-layout-left-collapsed-width`
- `--tr-layout-right-expanded-width`
- `--tr-layout-right-collapsed-width`

一部分来自运行时状态，一部分又被文档当成默认展示变量。

这会让“状态真值”和“样式默认值”的边界变得模糊。

### 3. 变量设计泄露了当前实现

当前公开面里有大量“实现视角”的变量：

- left / right 成对拆开的宽度变量
- resize indicator 的尺寸和阴影变量
- surface drag pill 的尺寸和 hover 细节变量
- header / main / footer 分别拆开的 margin / padding / max-width 变量

这些并不是高层语义，而是当前 DOM 和样式实现的细节。

### 4. 文档里存在“预留变量”

比如：

- `--tr-layout-surface-floating-width`
- `--tr-layout-surface-floating-height`
- `--tr-layout-surface-floating-top`
- `--tr-layout-surface-floating-gap`

这些变量当前并不是真正的公开契约。

预留变量一旦写进文档，就会被当成承诺。

## 参考 Radix 的结论

对照 Radix Primitives / Themes 的设计习惯，可以收敛出下面几条规则：

### 1. 主扩展面优先是 class 和 data 属性

Radix 更依赖：

- `className`
- `data-state`
- `data-side`
- `data-disabled`

而不是为每个视觉细节都开放一个 CSS 变量。

### 2. CSS 变量只适合暴露稳定的样式契约

适合公开的变量通常满足下面至少一条：

- 是跨实例复用的主题 token
- 是明确的默认展示值
- 是外部确实需要消费的计算结果

不适合公开的变量通常是：

- 内部状态桥接值
- 细粒度 hover / active / indicator 实现值
- 纯实现辅助变量

### 3. 复杂样式策略可以走 CSS，但不应该变成海量变量

像 Popover 这类组件，会公开少量“有意义的样式契约变量”。

但不会把所有内部尺寸、动画、指示器细节全部开放。

### 4. 主题层和行为层必须分开

Radix 的习惯是：

- 行为状态走 API
- 样式默认值走主题 / CSS

这和 `Layout` 后续的状态重构方向是一致的。

## 收敛原则

### 1. 公开变量只保留“稳定语义”

公开变量应该只表达：

- 布局主题
- 内容节奏
- 少量默认展示值

### 2. 内部变量不再写进公开文档

内部变量可以继续存在，但必须视为私有实现。

### 3. 复杂定制优先走样式钩子

深度定制优先依赖：

- `class`
- `[data-part]`
- `[data-placement]`
- 状态 class

而不是继续扩充变量面。

### 4. 不再公开预留变量

没有形成真实契约的变量，不进入 README 和文档。

### 5. dock 宽度和 drawer 宽度分层

- `dock` 宽度属于状态 / 配置层
- `drawer` 宽度属于展示策略层

因此：

- `dock` 宽度不依赖公开 CSS 变量作为主入口
- `drawer` 宽度允许通过 CSS 变量定制

## 建议保留的公开变量

建议把公开变量面收敛到下面几组。

### 1. 布局基础

- `--tr-layout-height`
- `--tr-layout-bg`
- `--tr-layout-left-bg`
- `--tr-layout-right-bg`
- `--tr-layout-header-bg`
- `--tr-layout-main-bg`
- `--tr-layout-footer-bg`
- `--tr-layout-divider-color`
- `--tr-layout-overlay-bg`
- `--tr-layout-panel-shadow`
- `--tr-layout-surface-radius`
- `--tr-layout-surface-shadow`
- `--tr-layout-surface-z-index`

### 2. 内容节奏

- `--tr-layout-content-max-width`
- `--tr-layout-inner-padding-inline`
- `--tr-layout-inner-padding-block`
- `--tr-layout-main-min-width`

### 3. Aside 默认展示值

建议最终只保留这类公开契约：

- `--tr-layout-drawer-width`

可选保留：

- `--tr-layout-rail-width`

说明：

- `--tr-layout-drawer-width` 适合承载 `min(84vw, 320px)` 这种响应式表达式
- `railWidth` 如果最终稳定收敛为数值配置 prop，可以不再保留公开 CSS 变量
- 不建议继续把 left / right 的 expanded / collapsed 宽度作为公开变量面

### 4. Main 滚动条

- `--tr-layout-main-scrollbar-width`
- `--tr-layout-main-scrollbar-thumb-bg`
- `--tr-layout-main-scrollbar-thumb-bg-hover`
- `--tr-layout-main-scrollbar-thumb-bg-active`

### 5. 公开变量控制目标

建议最终公开变量数量控制在 18 到 22 个左右。

这个规模基本够用，也不会把实现细节全部承诺出去。

## 建议降为私有实现的变量

下面这些变量不建议继续作为公开能力。

### 1. 状态桥接变量

- `--tr-layout-left-expanded-width`
- `--tr-layout-left-collapsed-width`
- `--tr-layout-right-expanded-width`
- `--tr-layout-right-collapsed-width`

原因：

- 它们本质上来自运行时状态
- 它们不是“默认主题值”
- 它们暴露了当前 left / right 双侧实现

### 2. 细粒度内容区变量

- `--tr-layout-header-max-width`
- `--tr-layout-main-max-width`
- `--tr-layout-footer-max-width`
- `--tr-layout-header-padding-inline`
- `--tr-layout-main-padding-inline`
- `--tr-layout-footer-padding-inline`
- `--tr-layout-header-margin-inline-start`
- `--tr-layout-header-margin-inline-end`
- `--tr-layout-main-margin-inline-start`
- `--tr-layout-main-margin-inline-end`
- `--tr-layout-footer-margin-inline-start`
- `--tr-layout-footer-margin-inline-end`

原因：

- 这是当前 DOM 结构的细节切分
- 没有足够证据表明每一项都值得长期公开
- 更适合先保留统一的内容宽度和内边距变量

### 3. resize 视觉细节变量

- `--tr-layout-resize-trigger-size`
- `--tr-layout-resize-line-color`
- `--tr-layout-resize-line-hover-color`
- `--tr-layout-resize-line-active-color`
- `--tr-layout-resize-indicator-width`
- `--tr-layout-resize-indicator-height`
- `--tr-layout-resize-indicator-bg`
- `--tr-layout-resize-indicator-border`
- `--tr-layout-resize-indicator-active-bg`
- `--tr-layout-resize-indicator-active-border`
- `--tr-layout-resize-indicator-active-shadow`
- `--tr-layout-resize-indicator-idle-opacity`
- `--tr-layout-resize-indicator-idle-offset`

原因：

- 这是内部 affordance 细节
- 更适合依赖样式钩子定制
- 不值得作为长期公共 API 维护

### 4. surface drag / resize 细节变量

- `--tr-layout-surface-drag-hit-width`
- `--tr-layout-surface-drag-hit-height`
- `--tr-layout-surface-drag-pill-width`
- `--tr-layout-surface-drag-pill-height`
- `--tr-layout-surface-drag-pill-bg`
- `--tr-layout-surface-drag-pill-shadow`
- `--tr-layout-surface-drag-hover-bg`
- `--tr-layout-surface-drag-hover-border`
- `--tr-layout-surface-drag-hover-shadow`
- `--tr-layout-surface-resize-hit-area-size`
- `--tr-layout-surface-resize-indicator-width`
- `--tr-layout-surface-resize-indicator-height`
- `--tr-layout-surface-resize-indicator-bg`
- `--tr-layout-surface-resize-indicator-border`
- `--tr-layout-surface-resize-indicator-active-bg`
- `--tr-layout-surface-resize-indicator-active-border`
- `--tr-layout-surface-resize-indicator-active-shadow`
- `--tr-layout-surface-resize-indicator-idle-opacity`
- `--tr-layout-surface-resize-indicator-hover-opacity`
- `--tr-layout-surface-resize-indicator-idle-offset`

原因：

- 全部属于实现细节
- 不应该主导公开定制面

### 5. 预留变量

- `--tr-layout-surface-floating-width`
- `--tr-layout-surface-floating-height`
- `--tr-layout-surface-floating-top`
- `--tr-layout-surface-floating-gap`

原因：

- 当前没有真正形成稳定契约
- 继续写在文档里只会制造误导

## 私有变量命名建议

为了避免外部继续把内部变量当公开 API 使用，建议对内部变量显式改名。

建议：

- 公开变量继续使用 `--tr-layout-*`
- 组件内部桥接层改成局部 alias，例如 `--left-dock-width`

示意：

```css
--tr-layout-drawer-width: min(84vw, 320px);
--left-dock-width: 280px;
--right-dock-width: 360px;
--left-rail-width: 52px;
```

这样做的价值：

- 一眼区分公共契约和内部实现
- 降低外部误用概率
- 后续重构内部桥接变量时压力更小

## 样式钩子策略

对于不适合做公开变量的场景，统一走样式钩子。

当前可继续依赖的钩子有：

- `[data-part="surface"]`
- `[data-part="root"]`
- `[data-part="aside"]`
- `[data-part="aside-content"]`
- `[data-part="resize-trigger"]`
- `[data-part="surface-resize-trigger"]`
- `[data-placement="left"]`
- `[data-placement="right"]`

以及现有状态 class：

- `.tr-layout__aside--dock`
- `.tr-layout__aside--drawer`
- `.tr-layout__aside--expanded`
- `.tr-layout__aside--rail`
- `.tr-layout__aside--hidden`
- `.tr-layout-surface--floating`
- `.tr-layout-surface--dragging`
- `.tr-layout-surface--resizing`

原则：

- 常规主题能力走公开变量
- 高级视觉微调走样式钩子
- 不再为了高级视觉微调扩充公开变量

## 变量优先级

后续应统一为：

```txt
显式状态值或内部提交值 > 外层公开 CSS 变量 > fallback
```

解释：

- `dock` 宽度等行为相关值优先由状态层控制
- `drawer` 默认宽度这类展示策略值可由公开 CSS 变量接管
- 最后才回退到组件内置 fallback

## 与 API 重构的配合关系

CSS 变量收敛不能单独做，必须和 `Layout` 的状态/API 收敛一起推进。

对应关系如下：

### 1. `dock` 宽度

由：

- `width/defaultWidth`
- 内部 resize commit

负责。

不再把它设计成主要依赖公开 CSS 变量的能力。

### 2. `drawer` 宽度

由：

- `--tr-layout-drawer-width`

负责。

这样可以自然承载：

- `min(84vw, 320px)`
- `100vw`

这类响应式表达式。

### 3. rail 宽度

建议优先作为配置 prop 处理：

- `railWidth`

如果后续明确存在主题层统一覆盖需求，再决定是否保留公开 CSS 变量。

## 串联重构 Tasklist

下面的 tasklist 按依赖顺序组织，目标是把“状态/API 收敛”和“CSS 变量收敛”连成一条连续改造链。

### 阶段 0：冻结设计边界

- [ ] 确认 `Layout` 只保留根级状态：`mode/defaultMode`、`floating/defaultFloating`
- [ ] 确认 `Layout.Aside` 公开 `open/defaultOpen`、`width/defaultWidth`
- [ ] 确认 `drawer` 宽度走 `--tr-layout-drawer-width`
- [ ] 确认不再把 left / right expanded / collapsed 宽度作为公开 CSS 变量
- [ ] 确认 README / docs 只记录公开稳定变量，不记录内部变量

产出：

- API 结论
- CSS 变量结论
- 文档口径结论

### 阶段 1：建立公开 / 私有变量清单

- [ ] 从 `packages/components/src/styles/components/layout.less` 抽出现有变量清单
- [ ] 标记每个变量属于“公开 / 私有 / 删除”
- [ ] 建立新命名映射表
- [ ] 定义组件局部桥接变量命名规则，例如 `--left-dock-width`

产出：

- 变量分类表
- 新旧变量映射表

### 阶段 2：重写默认值 owner

- [ ] 把主题默认值保留在 `layout.less`
- [ ] 把运行时状态桥接值迁移到组件内部私有变量
- [ ] 去掉“一个默认值在 JS 和 CSS 重复 owner”的情况

重点：

- 公开变量只承载主题 / 默认展示值
- 私有变量只承载运行时 resolved 值

### 阶段 3：收口运行时样式投影

- [ ] 重构 `useLayoutViewState.ts`
- [ ] 不再直接把公开变量名当成运行时状态投影出口
- [ ] 改为写入组件局部桥接变量，例如 `--left-dock-width`
- [ ] 在状态缺省时不给公开变量写 inline 覆盖

目标：

- 给外层 CSS 变量真正留出接管空间
- 让“公开变量”和“内部桥接变量”彻底分层

### 阶段 4：重写组件样式消费链路

- [ ] 调整 `Layout.vue` 的 grid / drawer 样式消费逻辑
- [ ] 调整 `LayoutAside.vue` 的 dock / rail / slide / overlay 样式消费逻辑
- [ ] 明确消费顺序：私有 resolved 变量 > 公开 CSS 变量 > fallback
- [ ] 把 drawer 宽度收口到 `--tr-layout-drawer-width`

目标：

- 公开变量不再承担内部状态桥接职责
- 内部状态桥接不再污染公开 API

### 阶段 5：完成 Aside API 收敛

- [ ] 设计并落地 `Layout.Aside` 的 `open/defaultOpen`
- [ ] 设计并落地 `Layout.Aside` 的 `width/defaultWidth`
- [ ] 保留 `railWidth`、`minWidth`、`maxWidth`、`resizable` 作为配置
- [ ] 取消 `leftAside/rightAside` 整对象协议作为最终推荐用法

目标：

- 调用层从 `computed + merge + update` 收敛到直接 `v-model`

### 阶段 6：文档收口

- [ ] 新文档保留为 CSS 变量设计说明
- [ ] `README.md` 只保留公开稳定变量
- [ ] `docs/src/components/layout.md` 只保留公开稳定变量
- [ ] 删除“预留变量”章节
- [ ] 删除内部桥接变量说明
- [ ] 增加 `--tr-layout-drawer-width` 的用法示例

目标：

- 文档暴露面和真实契约一致

### 阶段 7：示例与 demo 收口

- [ ] 把 demo 从整对象侧栏状态改成 `Layout.Aside` 自己受控
- [ ] 用 class + `--tr-layout-drawer-width` 展示 drawer 响应式宽度
- [ ] 避免在 demo 中继续传播旧的变量和旧的协议

目标：

- demo 成为新 API 和新样式契约的标准示例

### 阶段 8：测试补齐

- [ ] 测试公开 CSS 变量在无显式状态值时能接管默认展示
- [ ] 测试显式状态值优先于公开 CSS 变量
- [ ] 测试私有变量不作为公开契约断言
- [ ] 测试 `drawer` 宽度通过 `--tr-layout-drawer-width` 生效
- [ ] 测试 `dock` 宽度仍由状态层和 resize commit 主导
- [ ] 测试 README / docs 中列出的变量都有真实能力支撑

目标：

- 把 CSS 变量契约写死进测试矩阵

### 阶段 9：清理遗留实现

- [ ] 删除无效预留变量
- [ ] 删除不再公开但仍残留在文档的旧变量名
- [ ] 删除旧 demo 和测试里对内部变量的依赖

目标：

- 只留下新的公开契约和新的内部实现

## 最终判断

`Layout` 的 CSS 变量不该继续横向扩张。

正确方向是：

- 公开变量收敛
- 内部变量私有化
- 高级视觉定制回到样式钩子
- 状态宽度和展示宽度彻底分层

这套收敛完成后，`Layout` 的样式系统会更像一个真正的库级契约，而不是当前实现细节的平铺。

## 参考

- Radix Primitives Styling
- Radix Popover
- Radix Themes Styling
