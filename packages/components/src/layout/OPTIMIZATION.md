# Layout 后续优化指导

## 目标

为 `Layout` 建立一套更清晰的库级组件设计约束，重点解决状态归属、默认值分层、样式契约和规格测试问题。

当前判断：

- 不需要推倒重写。
- 保留现有 4 个原语：`Layout`、`Layout.Main`、`Layout.Aside`、`Layout.AsideToggle`。
- 保留现有 slot 结构、drawer 行为、`scrollHost` 契约、dock/floating 改宽数学逻辑。
- 重构重点是状态/API 层，不是 DOM 结构层。

## 当前问题

### 1. 状态模式不够显式

- `Layout.vue` 当前通过 `useVModel(..., { passive: true })` 建立了隐式本地态。
- 对外文档只描述了受控写法，实际却存在“隐式非受控”。
- 结果是：组件能工作，但 API 语义不清晰。

涉及文件：

- `packages/components/src/layout/Layout.vue`
- `docs/src/components/layout.md`

### 2. 默认化、解析、提交混在一起

- `createLayoutStore.ts` 负责 aside 默认值补齐。
- `useLayoutSurface.ts` 的 `ensureFloatingConfig()` 在读取默认几何时会直接写回状态。
- 这会形成“读取即提交”的副作用，不利于后续维护和测试。

涉及文件：

- `packages/components/src/layout/composables/createLayoutStore.ts`
- `packages/components/src/layout/composables/useLayoutSurface.ts`

### 3. 样式默认值和行为状态分层不彻底

- 当前 aside 宽度会被 `useLayoutViewState.ts` 始终投影成内联 CSS 变量。
- 这会让外部 CSS 默认值很难接管“未显式配置时”的默认展示。
- 现有 `layout.less` 已经注册了默认变量，但状态层没有完全给样式层让位。

涉及文件：

- `packages/components/src/layout/composables/useLayoutViewState.ts`
- `packages/components/src/styles/components/layout.less`

### 4. aside 宽度命名偏实现

- `expandedWidth`
- `collapsedWidth`
- `minExpandedWidth`
- `maxExpandedWidth`

这些字段表达的是内部布局状态，不是业务语义。

如果后续允许 breaking change，更适合收敛为：

- `width`
- `railWidth`
- `minWidth`
- `maxWidth`

### 5. 测试规格仍偏“现状验证”

当前测试覆盖了交互功能，但还缺少以下规格：

- 显式非受控初始化
- 受控模式下“只发事件、不自改 UI”
- `prop > CSS 变量 > fallback` 的优先级
- 状态解析与事件时序的稳定契约

涉及文件：

- `packages/test/src/layout/specs/aside.spec.ts`
- `packages/test/src/layout/specs/floating.spec.ts`

## 目标模型

### 1. 显式受控 / 非受控

建议把当前状态入口改成显式双模式：

```ts
interface LayoutProps {
  mode?: LayoutMode
  defaultMode?: LayoutMode

  floating?: LayoutFloatingConfig
  defaultFloating?: LayoutFloatingConfig

  leftAside?: LayoutAsideConfig
  defaultLeftAside?: LayoutAsideConfig

  rightAside?: LayoutAsideConfig
  defaultRightAside?: LayoutAsideConfig
}
```

约束：

- `mode` 和 `defaultMode` 语义分离。
- `floating` 和 `defaultFloating` 语义分离。
- `leftAside` 和 `defaultLeftAside` 语义分离。
- `rightAside` 和 `defaultRightAside` 语义分离。
- 以“整对象”为控制粒度，不支持字段级半受控。

### 2. 根级状态与 Aside 状态拆分

上面的 `leftAside/rightAside` 整对象方案更适合作为中间收敛步骤，不适合作为最终优先 API。

最终优先方案应进一步拆分状态边界：

- `Layout` 根组件只持有根级状态：`mode/defaultMode`、`floating/defaultFloating`
- `Layout.Aside` 自己公开侧栏状态：`open/defaultOpen`、`width/defaultWidth`
- `railWidth`、`minWidth`、`maxWidth`、`resizable`、`collapseEffect` 保持为普通配置
- `Layout` 不再继续对外暴露 `update:leftAside` / `update:rightAside` 这种整对象快照协议

这样更符合库级组件的职责边界：

- `Layout` 负责整体布局模式和 surface
- `Layout.Aside` 负责单个侧栏的开合和改宽
- `Layout.AsideToggle` 只负责消费 `Layout.Aside` 上下文并触发切换

### 3. `Layout.Aside` 最终公开 API

建议最终收敛为：

```ts
interface LayoutProps {
  mode?: LayoutMode
  defaultMode?: LayoutMode
  floating?: LayoutFloatingConfig
  defaultFloating?: LayoutFloatingConfig
}

interface LayoutAsideProps {
  placement: LayoutPlacement
  mode?: LayoutAsideMode
  open?: boolean
  defaultOpen?: boolean
  width?: number
  defaultWidth?: number
  railWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  collapseEffect?: LayoutAsideCollapseEffect
}
```

设计约束：

- `open/defaultOpen` 只表达开合状态
- `width/defaultWidth` 只表达 `dock` 模式宽度
- `drawer` 宽度不进入状态轴，不参与 `v-model`
- 所有会进入拖拽、clamp、回写链路的宽度字段统一使用 `number`
- 不再接受 `min()`、`calc()`、百分比这类复杂表达式作为核心行为 props

### 4. 复杂响应式尺寸不进行为 props

像 `min(84vw, 320px)` 这种值，本质上属于响应式展示策略，不属于行为状态。

最终建议：

- `dock` 宽度走 `width/defaultWidth`
- `drawer` 宽度走 CSS 变量
- 外层通过 class 或 style 提供响应式表达式

示意：

```css
.chat-layout__left-aside {
  --tr-layout-drawer-width: min(84vw, 320px);
}

.chat-layout__right-aside {
  --tr-layout-drawer-width: 100vw;
}
```

这样可以避免：

- JS 状态层承载复杂 CSS 表达式
- 拖拽数学逻辑与响应式样式策略混在一起
- 父组件为了断点切换去手工翻译 `dock` / `drawer` 两套宽度语义

## 状态层设计

### 1. 建立统一状态入口

建议新增一个单独状态层，例如：

```ts
useControllableLayoutState()
```

该层只负责：

- 判断当前域是否受控
- 初始化非受控内部状态
- 提供统一的 resolved state
- 提供统一的 commit 函数

建议返回：

- `resolvedMode`
- `resolvedFloating`
- `resolvedLeftAside`
- `resolvedRightAside`
- `commitMode(next)`
- `commitFloating(next)`
- `commitLeftAside(next)`
- `commitRightAside(next)`

### 2. 统一读取入口

模板、交互、样式投影都只读取 resolved state，不再分别读取：

- props
- `useVModel`
- 局部补默认后的派生值

目标是单一真值来源。

### 3. 统一提交入口

所有状态修改都统一走 commit：

1. 先合法化
2. 再决定是否更新内部状态
3. 最后发 `update:*`

禁止：

- 读取时写状态
- 在多个 composable 中各自拼 patch
- 某些路径只改内部状态、不发事件

## 合法化规则

### 1. aside 宽度

aside 改宽统一遵守：

1. 以真实 DOM 宽度作为拖拽起点
2. 先计算原始宽度变化
3. 再用 `minWidth/maxWidth/mainMinWidth` 做 clamp
4. 再提交到 commit

当前 `useLayoutAsideResize.ts` 这层可以保留，只需要把最终落点切到新的 commit 层。

### 2. floating 几何

floating 的 `x/y/width/height` 统一遵守：

1. 先解析默认几何
2. 先做 viewport clamp
3. 再提交到 commit

重点要求：

- 解析默认几何和提交默认几何必须拆开
- `ensureFloatingConfig()` 这类“读时写入”逻辑应移除

## 样式契约

### 1. 优先级

后续需要明确并写死：

```txt
显式状态值或内部提交值 > 外层 CSS 变量 > fallback
```

### 2. 哪些值走样式层

建议区分两类值：

- 行为状态：`expanded`、`layoutMode`、`draggable`、`resizable`、`x`、`y`
- 展示长度：`width`、`railWidth`、`minWidth`、`maxWidth`

规则：

- 行为状态由 JS 控制，不交给 CSS 变量决定。
- 展示长度允许外部 CSS 变量提供默认值。
- 当组件没有显式状态值时，不主动写对应内联变量，给外部样式让路。

### 3. 变量范围

继续保持克制，只开放必要变量：

- 布局宽度类变量
- surface 外观变量
- 滚动条变量

暂不扩展无明确复用需求的变量。

### 4. CSS 接管边界

需要明确哪些值允许外层 CSS 接管，哪些值必须由 JS 控制。

允许外层 CSS 提供默认展示值的字段：

- aside 宽度
- rail 宽度
- aside 最小宽度
- aside 最大宽度
- 主区最小宽度
- surface 视觉变量
- 滚动条视觉变量

不允许外层 CSS 决定业务语义的字段：

- `mode`
- `layoutMode`
- `expanded`
- `draggable`
- `resizable`
- `x`
- `y`

规则：

- CSS 变量只参与“默认展示值”。
- JS 状态负责“行为真值”。
- 不允许通过 CSS 变量制造一个行为层并不知晓的业务状态。

### 5. drawer 宽度的样式契约

后续建议把 drawer 宽度明确收口到样式层，例如：

- `--tr-layout-drawer-width`

规则：

- `dock` 宽度由 `width/defaultWidth` 和内部提交值控制
- `drawer` 宽度由 CSS 变量提供展示值
- 组件内部只负责读取该变量用于渲染，不把它回写为状态

这比公开 `drawerWidth` prop 更合理，因为：

- `drawer` 宽度不参与拖拽
- `drawer` 宽度经常带响应式表达式
- 它更像展示契约，不像行为状态

## 默认值 owner

后续必须给默认值建立唯一 owner，避免同一默认值在多个层重复定义。

### 1. JS owner

由 JS 持有的默认值：

- `defaultMode`
- `defaultFloating`
- `defaultLeftAside`
- `defaultRightAside`
- floating 的默认 `x`
- floating 的默认 `y`
- drawer 的默认展开策略
- left/right aside 的默认 `expanded`
- 交互能力默认值，如 `draggable/resizable`

这些值决定行为逻辑，必须由 JS 统一解析。

### 2. CSS owner

由 CSS 持有的默认值：

- aside 默认展示宽度
- rail 默认展示宽度
- aside 最小/最大宽度的展示 fallback
- content/header/main/footer 宽度与 padding fallback
- surface radius/shadow/drag bar 样式
- scrollbar 视觉样式

这些值属于视觉和主题范围，应优先交给 CSS 变量。

### 3. 禁止重复 owner

以下情况应避免：

- JS 写一个默认 `300px`，CSS 再写一个默认 `300px`，但两者并无明确主次
- 文档声明默认值来自运行时，样式层却又暗含另一份默认值
- 交互层依据一套默认值计算，渲染层依据另一套默认值展示

目标：

- 同一个默认值只有一个源头
- 其他层只能消费，不再重复定义

## `update:*` payload 语义

如果最终采用 `Layout.Aside` 轴式 API，则这个章节只适用于过渡期根组件协议。

最终优先方案应改为：

- `Layout` 继续保留 `update:mode`
- `Layout` 继续保留 `update:floating`
- `Layout.Aside` 提供 `update:open`
- `Layout.Aside` 提供 `update:width`

也就是从“整对象快照回写”切换到“单状态轴回写”。

后续必须明确 `update:*` 发出的到底是什么。

建议统一规则：

- `update:*` 一律发“下一份完整状态快照”
- 不发 patch
- 不发“部分解析后”的半成品对象
- 不把视觉 fallback 混进 payload

### 1. aside payload

建议 `update:leftAside` / `update:rightAside` 发出的对象只包含公开语义字段，例如：

- `layoutMode`
- `expanded`
- `width`
- `railWidth`
- `resizable`
- `minWidth`
- `maxWidth`

如果暂不改命名，则至少保证当前字段语义稳定：

- `expandedWidth`
- `collapsedWidth`
- `resizable`
- `minExpandedWidth`
- `maxExpandedWidth`

要求：

- 发出的对象必须能完整回写
- 回写后 UI 与交互结果一致
- 不依赖外部再次推断默认值才能恢复当前状态

### 2. floating payload

建议 `update:floating` 发出的对象是完整几何快照：

- `x`
- `y`
- `width`
- `height`
- `draggable`
- `resizable`
- `minWidth`
- `maxWidth`

要求：

- 拖拽/改宽结束后，payload 能独立复现最终状态
- 不发“解析前值 + 运行时补默认”的混合态

### 3. mode payload

`update:mode` 只发最终模式值：

- `'normal'`
- `'floating'`

不附带推导信息。

## 混合控制矩阵

后续必须明确 Layout 是否支持“不同域分别受控”。

建议支持，并补测试。

### 1. 推荐支持的组合

- `mode` 受控，`floating` 非受控
- `mode` 受控，`leftAside/rightAside` 非受控
- `leftAside` 受控，`rightAside` 非受控
- `floating` 受控，aside 非受控

理由：

- 每个域本身就是独立状态子树
- 这样更符合库级组件灵活性

### 2. 不支持的组合

不支持字段级半受控，例如：

- `leftAside.expanded` 受控，但 `leftAside.width` 非受控
- `floating.width` 受控，但 `floating.x/y` 非受控

原因：

- 这会把状态所有权切碎
- commit 和测试矩阵会急剧复杂化

### 3. 模式切换约束

后续要写清楚：

- `mode='normal'` 时，是否保留最近一次 floating 几何
- 从 `normal` 切回 `floating` 时，是否复用上次几何
- `defaultFloating` 是否只参与首次进入 floating

建议：

- 保留最近一次 floating 几何
- `defaultFloating` 只参与首次初始化

这样更符合非受控模式直觉。

## 事件模型

### 1. 保留分阶段事件

当前 `aside-resize-start / aside-resize / aside-resize-end` 和 `floating-resize-*` 是对的，应保留。

### 2. drag 事件要么补齐，要么明确不提供

当前 floating 支持拖拽，但没有对应的 drag 分阶段事件。

后续二选一：

- 补 `floating-drag-start / floating-drag / floating-drag-end`
- 明确拖拽仅修改状态，不提供公开事件

不要长期保持半套模型。

## 文档与 demo

后续文档至少要分开写两种模式：

### 1. 非受控

- 使用 `defaultMode`
- 使用 `defaultFloating`
- 使用 `defaultLeftAside`
- 使用 `defaultRightAside`

### 2. 受控

- 使用 `mode`
- 使用 `floating`
- 使用 `leftAside`
- 使用 `rightAside`
- 明确演示 `update:*` 回写

### 3. 最终推荐示例

最终文档里的主示例不应再展示 `leftAside/rightAside` 整对象 `computed + update` 的写法，而应展示 `Layout.Aside` 自己受控。

推荐受控示例：

```vue
<script setup lang="ts">
const leftOpen = ref(true)
const leftWidth = ref(280)

const rightOpen = ref(false)
const rightWidth = ref(360)
</script>

<template>
  <TrLayout>
    <template #left-aside>
      <TrLayout.Aside
        placement="left"
        :mode="isMobile ? 'drawer' : 'dock'"
        v-model:open="leftOpen"
        v-model:width="leftWidth"
        :rail-width="52"
        :min-width="220"
        :max-width="420"
        :resizable="!isMobile"
        class="chat-layout__left-aside"
      >
        ...
      </TrLayout.Aside>
    </template>

    <template #right-aside>
      <TrLayout.Aside
        placement="right"
        :mode="isMobile ? 'drawer' : 'dock'"
        v-model:open="rightOpen"
        v-model:width="rightWidth"
        :min-width="280"
        :max-width="520"
        :resizable="!isMobile"
        class="chat-layout__right-aside"
      >
        ...
      </TrLayout.Aside>
    </template>
  </TrLayout>
</template>

<style scoped>
.chat-layout__left-aside {
  --tr-layout-drawer-width: min(84vw, 320px);
}

.chat-layout__right-aside {
  --tr-layout-drawer-width: 100vw;
}
</style>
```

推荐非受控示例：

```vue
<TrLayout.Aside
  placement="left"
  default-open
  :default-width="280"
  :rail-width="52"
  :min-width="220"
  :max-width="420"
  :resizable="true"
>
  ...
</TrLayout.Aside>
```

要求：

- demo 必须有一份标准受控示例
- demo 必须有一份标准非受控示例
- demo 不再把响应式断点逻辑和侧栏对象拼装逻辑耦合在一起

## 测试矩阵

后续补齐以下规格：

### 1. 初始化

- 默认 fallback 生效
- 外层 CSS 变量接管默认展示
- `default*` 仅作为初始值

### 2. 模式差异

- 受控模式下交互只发事件，不自改 UI
- 非受控模式下交互会自改 UI
- `Layout.Aside` 的 `open/defaultOpen` 符合受控 / 非受控约束
- `Layout.Aside` 的 `width/defaultWidth` 符合受控 / 非受控约束

### 3. 约束

- aside 宽度 clamp 到最小/最大值
- floating 宽度 clamp 到最小/最大值
- viewport clamp 生效
- `drawer` 宽度只消费 CSS 变量，不进入状态提交链路

### 4. 时序

- `start -> progress -> end`
- 结束值与最后一次过程值一致

### 5. 禁用与空态

- 不可 resize 时不渲染 affordance
- 空 slot 时不保留空壳和无效交互

## 建议重构顺序

### 第一阶段：状态模型

- 定义 `default*`
- 建立 `useControllableLayoutState`
- 去掉 `Layout.vue` 中的隐式 `useVModel` 状态入口
- 明确 `Layout` 和 `Layout.Aside` 的职责边界

### 第二阶段：状态消费收口

- `createLayoutStore` 改为只消费 resolved aside state
- `useLayoutSurface` 改为只消费 resolved floating state
- 去掉“读取即提交”的路径

### 第三阶段：样式契约

- 调整宽度变量投影逻辑
- 落地 `状态值 > CSS 变量 > fallback`
- 补齐相关测试

### 第四阶段：命名收敛

如果接受 breaking change，再统一 aside 宽度命名。

### 第五阶段：API 收口

- 从 `leftAside/rightAside` 整对象协议切换到 `Layout.Aside` 轴式 API
- 保留根级 `mode/floating`
- 把复杂响应式尺寸彻底迁移到 CSS 变量

## 非目标

本轮不做：

- 新增上下或四角 resize
- 改写 slot 结构
- 改写 `Layout.Main` 的 `scrollHost` 方案
- 改写 drawer / backdrop 基本交互

## 最终结论

`Layout` 当前最需要重构的不是拖拽、改宽、drawer 本身，而是：

- 状态归属
- 默认值分层
- 样式优先级契约
- 受控 / 非受控规格

最终优先方向不是“继续优化整对象协议”，而是：

- `Layout` 只保留根级状态 API
- `Layout.Aside` 收敛为 `open/defaultOpen`、`width/defaultWidth`
- `drawer` 响应式宽度通过 CSS 变量承载
- 调用层从 `computed + merge + update` 收敛到直接 `v-model`

后续所有优化都应优先围绕这四点展开。
