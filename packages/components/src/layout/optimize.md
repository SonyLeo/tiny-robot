## 代码优化检视意见

**一、基于最新代码的现状判断**

这部分不是理想方案，而是对当前代码的重新校验。目的是把问题分成三档：

1. 仍然明确存在
2. 部分存在，但已经改善
3. 已不再是核心问题

**1. 仍然明确存在的问题**

1. 受控 / 非受控互斥类型还没做  
`index.type.ts` 里：
- `mode/defaultMode`
- `floating/defaultFloating`
- `open/defaultOpen`
- `width/defaultWidth`

目前都还是普通可选属性，可以同时传。  
这意味着“半受控”在类型层仍然被允许。

2. drawer 宽度仍然走 DOM 回读同步  
`LayoutAside.vue` 里的 `syncDrawerWidthVar()` 还在，通过 `getComputedStyle(...).getPropertyValue('--tr-layout-drawer-width')` 读值，再写回 `containerStyle`。  
这条链路仍然存在以下问题：
- 同步时机依赖 `mounted/updated`
- 纯 CSS 场景不够稳
- 数据流存在隐式双向桥接

3. `LayoutAside` 的 DOM 契约仍然不够干净  
当前仍然是两层：
- 外层 `Layout.vue` 的 `tr-layout__aside`
- 内层 `LayoutAside.vue` 的 `tr-layout-aside`

同时 `attrs/class/style` 仍然落在内层，容器类和样式桥接又在外层参与。  
这会让“用户传入的属性最终作用在哪一层”这件事不够直观。

4. floating 的提交链路仍然偏复杂  
`useLayoutSurface.ts` 已经具备 clamp 意识，但仍然存在下面这条链路：
- `getFloatingSnapshot()`
- `getCommittedFloatingGeometry()`
- `commitFloatingGeometry()`
- `watch([mode, floating, viewport]) -> clampFloatingBounds()`
- `useDraggable` 过程中再直接写 `x/y`

这说明 floating 的状态提交仍然没有完全收敛成一个单入口。

5. floating 的拖拽 / resize 还没彻底对齐 aside resize 的提交方式  
`useLayoutAsideResize.ts` 的链路相对更稳：
- 真实 DOM 起点
- 统一 min/max
- 统一 clamp
- 统一 emit

相比之下，`useLayoutSurface.ts` 仍然更绕，后续最好继续向 aside resize 的模型靠拢。

6. Store 里还混着样式桥接结果  
`createLayoutStore.ts` 目前仍然暴露：
- `widthStyle`
- `railWidthStyle`
- `containerStyle`

这些不是纯语义状态，而是业务状态与样式输出之间的中间层。  
这会让 store 的职责偏混合。

7. 内部 CSS 桥接变量仍然较多  
`useLayoutViewState.ts` 和 `Layout.vue` 仍然依赖：
- `--left-dock-width`
- `--right-dock-width`
- `--left-rail-width`
- `--right-rail-width`
- `--left-width`
- `--right-width`

这些变量作为内部实现没有问题，但现在仍然需要继续明确公开面边界，避免它们被文档或测试隐式固化成“事实标准”。

8. 测试仍然有实现耦合收敛空间  
当前测试方向已经明显变好了，但后续仍然要继续避免：
- 锁死内部类名组合
- 锁死私有变量名
- 锁死中间 DOM 包装层

这里的问题已经不是“测试缺失”，而是“测试契约还可以再收口”。

9. `default*` 的“一次性初始值”语义还需要在文档中明确  
`useControllableState.ts` 里 `defaultValue` 只在初始化时读取一次，后续父层即使修改 `defaultMode/defaultFloating/defaultOpen/defaultWidth`，组件也不会重新同步。  
这个行为本身是合理的，但必须明确写进文档，否则调用方容易把 `default*` 当成响应式输入值。

10. `open` 和 `width` 的受控判定策略不完全一致  
`LayoutAside.vue` 里：
- `open` 使用了 `hasVNodeProp('open')` 进行显式判定
- `width` 仍然直接依赖 `value !== undefined` 的默认逻辑

这样虽然未必立刻产生功能错误，但会让组件内部对“什么叫受控”存在两套判定策略，设计上不够整齐。

11. `isExpanded` 目前是重复语义  
`internal.type.ts` 和 `LayoutAsideToggle.vue` 里都还暴露了 `isExpanded`。  
但当前实现下 `isExpanded` 实际上等同于 `isOpen`，缺少独立语义价值。  
这会造成公开状态名冗余，也会增加后续 API 说明成本。

12. floating 几何工具层还有死代码残留  
`layoutSurfaceGeometry.ts` 里的 `resolveCurrentFloatingConfig()` 当前未被使用。  
这不是大问题，但说明 floating 几何层还有清理空间，后续重构时应顺手收掉。

13. 自绘滚动条的观察范围偏大  
`useLayoutMainScrollbar.ts` 目前用了：
- `MutationObserver`
- `subtree: true`
- `attributes: true`

这对长内容主区来说监听范围偏大。  
功能上没问题，但后续可以评估是否真的需要监听属性变化，还是只监听结构和文本变化就够了。

14. body 交互锁定策略不完全一致  
`useLayoutMainScrollbar.ts` 里直接操作 `document.body`；而 aside resize / floating resize 则通过 `ownerDocument.body` 处理。  
这会让不同交互模块的 document 策略不一致，未来如果存在 iframe 或多 document 场景，这里会变成边界问题。

15. `Layout.Main` 对 `scrollHost` 的样式接管还需要更明确地写入契约  
`LayoutMain.vue` 里通过 `:deep([data-tr-layout-scroll-host])` 直接对 `scrollHost` 注入尺寸规则并隐藏原生滚动条。  
这意味着 `scrollHost` 不只是“被观察”，而是“会被组件样式接管一部分展示行为”。  
这个契约目前在文档中提到了使用要求，但还没有足够明确地说明这层样式接管关系。

**2. 部分存在，但已经改善的问题**

1. 根状态和子状态边界不清  
这条现在不能再笼统说“边界不清”。  
最新代码里：
- `Layout.vue` 管 `mode/floating`
- `LayoutAside.vue` 管 `open/width`

这说明大方向已经是对的。  
真实问题是：**边界方向已成立，但契约还不够硬。**

2. 文档与实现不一致  
这条现在也不能算核心结构问题。  
更准确的说法应该是：文档方向已经在收敛，但如果后续 API 继续重构，文档需要同步把“根状态 / aside 状态 / 样式变量 / 事件”分层写得更清楚。

3. 样式公开面混乱  
这条也不适合再用“混乱”这个词。  
现在更准确的判断是：**公开变量已经开始收敛，但公开面和内部桥接面的边界还没有完全写死。**

4. 受控状态基础设施还算可用，但契约说明不完整  
`useControllableState.ts` 的基础行为本身没有明显错误。  
真实问题不在底层实现崩坏，而在：
- `default*` 语义还没被文档明确
- 上层不同状态的受控判定策略还不完全统一

5. `isExpanded` 已经开始被当作公开契约使用  
这条已经不只是内部命名冗余。  
当前：
- slot 类型里暴露了 `isExpanded`
- `LayoutAsideToggle.vue` 使用了 `isExpanded`
- 文档写了 `isExpanded`
- 结构测试也在验证 `isExpanded` 这套对外语义

所以如果后面决定收掉或重命名 `isExpanded`，它就不再只是代码清理，而是一次明确的 API 契约调整。

**3. 已不再是核心问题的项**

1. “完全没有库级分层”  
这条已经不成立。  
当前已有：
- `Layout`
- `LayoutAside`
- store
- composables
- 独立 resize / surface / view-state 分层

说明组件已经不再是一个大一统实现。

2. “缺少阶段事件”  
这条已经不成立。  
当前已公开：
- `aside-resize-start / aside-resize / aside-resize-end`
- `floating-drag-start / floating-drag / floating-drag-end`
- `floating-resize-start / floating-resize / floating-resize-end`

真实问题不在“有没有事件”，而在“是否所有事件都走统一的合法值提交链路”。

3. “状态全部堆在根组件”  
这条也不成立。  
当前并没有退回成一个大对象总线，这一点是正确的，应继续保留。

**二、最终需要聚焦的 4 个核心问题**

如果只抓最值得投入的点，当前其实就是这 4 个：

1. 互斥类型没做  
这是 API 契约层的首要问题。

2. drawer 宽度同步方式仍然脆弱  
这是样式 / 状态边界最明显的脆弱点。

3. floating 提交链路还不够干净  
这是交互稳定性和后续维护成本的核心问题。

4. store 里仍混入样式桥接语义  
这是内部架构长期会反复放大的问题。

补充说明：这 4 个是最高优先级问题，但不是全部问题。  
像 `default*` 语义说明、`isExpanded` 冗余、滚动条观察范围偏大、body 锁定策略不一致，属于第二梯队问题，适合在主链路重构时一并清理。

**三、参考结论**

**1. 参考项目 `test-vue-ts-layout` 给我们的核心启发**

参考文件：
- `AppLayout.vue`
- `AppLayout.spec.ts`

最值得直接复用的是：
- `value/defaultValue` 互斥类型
- `resolvedValue` 统一读
- `commitValue()` 统一写
- `clamp -> commit -> emit`
- 受控时只发事件，不自改 UI
- 样式优先级清晰：`prop > CSS var > fallback`

**2. Radix 对我们的真正启发**

Radix 没有一个等价的成品 `Layout`，但它的设计原则很有价值：
- `Root` 只管 root state：`open/defaultOpen/onOpenChange`
- 子部件只消费状态，不重复拥有根状态
- 状态样式通过 `data-*` 暴露
- CSS 变量只暴露少量结果型契约
- 布局职责和交互职责分开

参考：
- Radix Popover: https://www.radix-ui.com/primitives/docs/components/popover
- Radix Dialog: https://www.radix-ui.com/primitives/docs/components/dialog
- Radix Styling Guide: https://www.radix-ui.com/primitives/docs/guides/styling
- Radix Themes Layout Overview: https://www.radix-ui.com/themes/docs/overview/layout

**四、完整优化方案**

**1. API 契约重做**

目标：
- 根组件只负责根状态
- Aside 只负责 Aside 状态
- 所有受控 / 非受控模式都做互斥

建议改造 `index.type.ts`：

- `LayoutProps`
  - `mode` / `defaultMode` 互斥
  - `floating` / `defaultFloating` 互斥

- `LayoutAsideProps`
  - `open` / `defaultOpen` 互斥
  - `width` / `defaultWidth` 互斥

建议类型结构：
- `Controlled<T>`：要求 `value`，禁止 `defaultValue`
- `Uncontrolled<T>`：允许 `defaultValue`，禁止 `value`
- 根状态和 aside 状态分别套用

目标效果：
- 编译期直接防止半受控
- 文档可以直接给出“受控 / 非受控”两套明确写法

**2. 状态边界继续保持，不回退成大对象**

保留现有分层：
- `Layout.vue` 只管 `mode/floating`
- `LayoutAside.vue` 只管 `open/width`

不要改成：
- `leftAside={{ open, width, mode, railWidth, ... }}`

最终推荐边界：
- `Layout`
  - `mode/defaultMode`
  - `floating/defaultFloating`
- `Layout.Aside`
  - `mode`
  - `open/defaultOpen`
  - `width/defaultWidth`
  - `railWidth`
  - `minWidth/maxWidth`
  - `resizable`
  - `collapseEffect`

这比整对象回写更干净，也更接近 Radix 和参考项目的思路。

**3. 统一提交入口**

这是这次重构的核心。

3.1 Aside width  
在 `LayoutAside.vue` 或独立 composable 中建立：
- `resolveWidth()`
- `clampWidth()`
- `commitWidth(nextWidth)`

要求：
- 所有拖拽宽度变化只走 `commitWidth`
- 先 clamp
- 再决定是否写内部状态
- 再发 `update:width`
- `aside-resize-start/progress/end` 都使用合法化后的值

3.2 Floating geometry  
在 `useLayoutSurface.ts` 建立更明确的链路：
- `resolveFloatingSnapshot()`
- `clampFloatingGeometry()`
- `commitFloatingGeometry()`

要求：
- 拖拽和 resize 都共用同一个 commit 函数
- `watch` 只负责外部变化后的被动纠正
- 主交互过程不要分散写 `x/y` 和 `width`
- 事件值永远是 clamp 后的最终值

目标是对齐参考项目的思想，不是逐字抄实现。

**4. Drawer 宽度同步重做**

当前要删除的方向：
- `syncDrawerWidthVar()`
- `mounted/updated` 后读 `getComputedStyle` 再回写变量

目标：
- drawer 宽度只由“显式配置 + 公开 CSS 变量 + fallback”决定
- 组件不再从 DOM 反推自己的配置

建议方案：
- `dock width` 继续走 `width/defaultWidth`
- `drawer width` 不作为业务状态，不进入内部受控链路
- `drawer width` 只走样式契约，比如 `--tr-layout-drawer-width`
- 如果将来确实要 JS 配置 drawer 宽度，再新增一个语义 prop，比如 `drawerWidth?: LayoutLength`
- 当前阶段先不加，先收敛

这点很重要：**drawer width 更像“展示参数”，不是业务状态。**

**5. DOM 契约重做**

当前两层：
- 外层 `tr-layout__aside`
- 内层 `tr-layout-aside`

这个结构可以保留，但职责要明确。

推荐职责：
- 外层 `tr-layout__aside`
  - 布局位置
  - grid area
  - dock/drawer shell
  - backdrop 层级关系
  - resize trigger 挂载点

- 内层 `tr-layout-aside`
  - 内容滚动
  - collapse 视觉效果
  - 内容 padding/background

同时统一规则：
- 用户 `class/style/attrs` 只落到一层
- 推荐落到内容层，即 `LayoutAside.vue`
- 外层容器保持库内部控制

**6. Store 收瘦**

`createLayoutStore.ts` 建议只保留语义状态，不要继续暴露样式中间值。

保留：
- `layoutMode`
- `isOpen`
- `isDock`
- `isDrawer`
- `isRail`
- `isHidden`
- `canResize`
- `width`
- `railWidth`
- `minWidth`
- `maxWidth`
- `open/close/toggle/setWidth`

去掉或下沉：
- `widthStyle`
- `railWidthStyle`
- 过多 `containerStyle` 桥接语义

样式转换尽量放到 view/computed 层，而不是 store API 本体。

**7. CSS 变量收敛方案**

公开变量建议只保留三类：

第一类：主题类
- `--tr-layout-bg`
- `--tr-layout-left-bg`
- `--tr-layout-right-bg`
- `--tr-layout-header-bg`
- `--tr-layout-main-bg`
- `--tr-layout-footer-bg`
- `--tr-layout-divider-color`
- `--tr-layout-overlay-bg`
- `--tr-layout-panel-shadow`

第二类：布局约束类
- `--tr-layout-height`
- `--tr-layout-content-max-width`
- `--tr-layout-inner-padding-inline`
- `--tr-layout-inner-padding-block`
- `--tr-layout-main-min-width`
- `--tr-layout-drawer-width`

第三类：floating 展示类
- `--tr-layout-surface-radius`
- `--tr-layout-surface-shadow`
- `--tr-layout-surface-z-index`

内部变量继续允许存在，但明确不公开：
- `--left-dock-width`
- `--right-dock-width`
- `--left-width`
- `--right-width`
- `--left-rail-width`
- `--right-rail-width`

原则和 Radix 一致：**公开少量稳定变量，内部桥接变量不承诺。**

**7.1 受控语义统一补充**

除了互斥类型本身，还应统一“是否受控”的内部判定规则：
- `open`
- `width`
- `mode`
- `floating`

建议统一成同一套策略，不要一部分依赖 `hasVNodeProp()`，另一部分依赖 `value !== undefined`。  
否则调用端虽然看不到差别，内部心智模型会越来越乱。

**7.2 冗余公开状态收敛**

建议重新评估以下公开状态名是否都值得保留：
- `isOpen`
- `isExpanded`

如果当前实现下二者没有语义差异，建议后续只保留一套主语义，对另一套仅做兼容过渡或直接收掉。  
目标不是减少字段数量本身，而是避免公开 API 中出现“名字不同、含义相同”的状态。

**8. 事件语义统一**

当前已经有：
- `aside-resize-start`
- `aside-resize`
- `aside-resize-end`
- `floating-drag-start`
- `floating-drag`
- `floating-drag-end`
- `floating-resize-start`
- `floating-resize`
- `floating-resize-end`

这个方向是正确的，不建议再简化成一个大 `change`。

但要统一约束：
- 所有事件都只发合法化后的最终值
- `start` 用真实起点
- `progress` 用当前合法值
- `end` 用最后一次合法值
- `end` 必须和最后一次 `progress` 对齐

**9. 测试重构方案**

9.1 类型测试  
给 `index.type.ts` 补类型层面的约束测试，至少验证：
- `mode + defaultMode` 报错
- `floating + defaultFloating` 报错
- `open + defaultOpen` 报错
- `width + defaultWidth` 报错

9.2 行为测试  
继续保留 e2e，但重点锁：
- controlled 不回写时 UI 不自变
- uncontrolled 会自变
- clamp 后事件值、内部值、实际宽度一致
- drawer 互斥
- railWidth=0 时完全隐藏
- resize 禁用时不渲染 affordance

9.3 CSS 契约测试  
只测公开变量，不测内部 alias。  
这部分方向已经对了，继续保持。

9.4 结构测试  
只锁稳定结构：
- `data-part`
- `data-placement`
- 公开 `data-*` 状态

不要锁死内部 class 组合细节。

9.5 滚动条专项测试  
`useLayoutMainScrollbar.ts` 后续建议单独补两类检查：
- 主区内容结构变化后，scrollbar 是否稳定同步
- thumb 拖拽过程中 body lock 是否正确释放

这样可以避免滚动条逻辑在后续优化时悄悄回退。

9.6 `default*` 契约说明测试  
如果当前阶段不打算立刻补类型测试，也建议至少补一条更明确的行为说明或测试约束：
- `defaultMode/defaultFloating/defaultOpen/defaultWidth` 只参与初始化
- 初始化后修改这些值，不应被视为受控更新

这样后续即使不读源码，也不会误解 `default*` 的语义。

9.7 当前 e2e 套件还需要继续分层整改  
当前这套测试覆盖面已经不小，但和参考项目相比，仍然有一个明显问题：**组件契约测试和页面集成测试混在了一起。**

需要明确收敛的点：
- 不再让大量 case 依赖“先进入首页，再点击文档入口”这种页面导航链路
- 不再让大量 case 依赖 demo 按钮、metric 面板、演示页状态文本去间接证明组件行为
- 不再大量锁死内部 class 组合，只保留 `data-part`、`data-placement`、公开 `data-*` 状态、`boundingBox`、`getComputedStyle` 这类外部可观察结果
- 滚动条测试不再依赖 demo 私有类名，而是尽量依赖 `data-tr-layout-scroll-host` 这类公开标记
- floating 测试减少对绝对坐标区间的强依赖，更多断言“相对移动是否发生”“是否被 clamp”“受控时 UI 是否不自变”
- 阶段事件测试要像参考项目一样，尽量校验 `start -> progress -> end` 的顺序，以及最后一次 `progress` 和 `end` 的值一致
- `isExpanded` 如果后续决定收敛，就不应继续被 e2e 锁死成必须长期公开的契约

后续最合理的测试分层是：
- 第一层：组件契约测试
  - 重点锁受控 / 非受控
  - 重点锁 clamp
  - 重点锁事件顺序
  - 重点锁 prop / CSS var / fallback 优先级
- 第二层：页面级集成测试
  - 只保留真正值得走整页链路的场景
  - 比如 backdrop / Escape、floating 视口约束、自绘滚动条、CSS 公开变量

这部分的结论不是“当前测试不能用”，而是：**当前测试还不够库级，后续应继续从页面驱动测试收敛到契约驱动测试。**

**10. 文档重写方案**

文档结构建议固定成这 5 段：

1. 基础用法  
最小可运行例子

2. 状态控制  
- 根布局：`mode/defaultMode`、`floating/defaultFloating`
- Aside：`open/defaultOpen`、`width/defaultWidth`

3. 侧栏模式  
- `dock`
- `drawer`
- `rail`

4. 浮层模式  
- 拖拽
- 改宽
- 事件

5. 样式定制  
- 公开 CSS 变量
- 不建议依赖内部变量

每个示例旁边都直接挂到对应 API 段落，不要把所有说明堆在最上面。

文档里还应明确补两句：
- `default*` 是一次性初始值，不是持续输入值
- `Layout.Main` 会对传入的 `scrollHost` 注入标记并接管滚动条外观

**五、建议后的目标 API**

根组件：
```vue
<Layout
  mode="floating"
  :floating="{ x: 64, y: 80, width: 420, resizable: true, draggable: true }"
/>
```

非受控根状态：
```vue
<Layout
  default-mode="floating"
  :default-floating="{ x: 64, y: 80, width: 420 }"
/>
```

Aside 受控：
```vue
<Layout.Aside
  placement="left"
  mode="dock"
  :open="leftOpen"
  :width="leftWidth"
  :min-width="220"
  :max-width="420"
  resizable
  @update:open="leftOpen = $event"
  @update:width="leftWidth = $event"
/>
```

Aside 非受控：
```vue
<Layout.Aside
  placement="left"
  mode="dock"
  default-open
  :default-width="280"
  :rail-width="52"
  :min-width="220"
  :max-width="420"
  resizable
/>
```

这就是要追求的“干爽”方向：  
**把状态拆回到组件自己的职责范围里，而不是把整个 leftAside/rightAside 配置对象当成一个状态总线。**

**六、实施 Tasklist**

建议按下面这组任务推进，顺序尽量不要打乱。

1. 锁定 API 契约
- 改 `index.type.ts`
- 给 `mode/defaultMode`
- 给 `floating/defaultFloating`
- 给 `open/defaultOpen`
- 给 `width/defaultWidth`
- 全部补上互斥类型约束
- 同时统一“是否受控”的内部判定策略

2. 收敛 Aside 状态链路
- 改 `LayoutAside.vue`
- 建立统一的 `resolveWidth -> clampWidth -> commitWidth`
- 清掉 `syncDrawerWidthVar()`
- 明确 drawer width 只走样式契约，不走 DOM 回读
- 统一 attrs / class / style 落点
- 重新确认 rail / dock / drawer 的职责边界

3. 收敛 Floating 几何链路
- 改 `useLayoutSurface.ts`
- 建立统一的 `resolve -> clamp -> commit`
- 让 drag / resize 共用同一条提交入口
- 把 `watch` 的职责收敛为“被动纠偏”
- 清理未使用的几何辅助函数
- 统一 floating 事件 payload 的合法值语义

4. 收瘦 Store 和样式桥接层
- 改 `createLayoutStore.ts`
- 改 `useLayoutViewState.ts`
- 只保留语义状态
- 下沉 `widthStyle`、`railWidthStyle`、`containerStyle` 这类桥接值
- 重新梳理内部 CSS 变量与公开 CSS 变量边界

5. 收敛公开状态与语义命名
- 重新评估 `isOpen` / `isExpanded`
- 明确是否保留双命名
- 如果不保留，统一调整 slot、toggle、文档、测试
- 把 `default*` 的一次性初始化语义写死

6. 重构测试分层
- 先补类型测试
- 再补组件契约测试
- 再收敛页面级 e2e
- e2e 去掉首页导航依赖
- e2e 减少 demo metric 面板依赖
- e2e 减少内部 class 耦合
- 滚动条测试改用公开标记
- 阶段事件测试补顺序和最终值一致性断言
- CSS 变量专项继续只锁公开契约

7. 重写文档与 demo
- 文档改成“说明 + 就近示例”
- 明确根状态 / aside 状态 / floating / 样式变量 / 事件分层
- 明确 `default*` 语义
- 明确 `Layout.Main` 对 `scrollHost` 的接管关系
- demo 继续收敛到最小必要代码
- 避免 demo 反过来定义组件契约

8. 回归验证
- 验证 controlled 不回写时 UI 不自变
- 验证 uncontrolled 会自变
- 验证 clamp 后内部值 / 事件值 / 实际尺寸一致
- 验证 drawer 互斥
- 验证 railWidth=0 隐藏语义
- 验证 floating clamp 和 viewport 边界
- 验证 CSS 公开变量优先级
- 验证文档示例与真实 API 一致

**七、实施 Checklist**

- 先改类型，再改状态链路，再改测试，最后改文档
- 每改完一条状态链路，都要补对应受控 / 非受控 / clamp / 事件测试
- 不在重构中继续扩大公开 CSS 变量面
- 不让 demo 辅助结构变成长期 API 契约
- 不让内部 class 名重新进入测试主断言
- 不让 drawer width 再回到 DOM 读样式回灌模式
- 不让 floating 再出现多入口写 `x/y/width`
- 不让 store 再继续承担样式输出职责

**八、交叉对比清单**

后面做重构时，直接拿这 10 条逐项对照：

- 是否所有受控 / 非受控 props 都互斥。
- 是否每个状态都只有一个真值来源。
- 是否所有状态变化都先 clamp 再 commit。
- 是否受控时只发事件，不自改 UI。
- 是否模板只消费 resolved 状态，不直接分支读两个来源。
- 是否 drawer width 仍然依赖 DOM 读样式回灌。
- 是否 store 里还混着业务状态和样式中间值。
- 是否公开 CSS 变量已经收窄到稳定集合。
- 是否所有交互事件都保证 start / progress / end 三阶段一致。
- 是否测试锁的是公开契约，而不是内部实现。

最终判断：  
这次不需要推倒重来，**保留组件拆分，重做状态契约和提交链路** 就够了。这是成本最低、收益最大、也最接近 Radix 和参考项目设计思想的路线。
