# layout 检视整理

## 一、检视意见和我的决策

### 1. `mode/defaultMode` 是否有意义

检视意见：

- `mode` 有受控和 `defaultMode` 非受控两套写法，但 `mode` 本身不会在组件内部切换
- 如果组件内部不会改，就没必要做非受控

我的决策：

- 采纳
- 去掉 `defaultMode`
- 文档里讲清楚 `mode` 的职责，以及 `floating` 模式是否占位、是否脱离普通布局 DOM 流

### 2. `floating` 是否要支持字段级半受控

检视意见：

- 现在是 `floating/defaultFloating` 整对象受控和非受控
- 如果只想 `x/y` 受控，`width/height` 不受控怎么办
- 建议做 `x/defaultX`、`y/defaultY` 这种字段级半受控

我的决策：

- 不采纳
- 不支持字段级半受控
- 继续保持：
  - `floating` = 整体受控
  - `defaultFloating` = 整体非受控初始化

原因：

- 字段级半受控会让状态归属、clamp、事件时机、测试矩阵都明显变复杂
- 当前场景是 AI 对话应用容器里的 free floating panel，不值得为低频能力拉高整体复杂度

### 3. `x/y/width/height` 不够直观

检视意见：

- 如果只是想“靠右一定距离”，还得自己算 `x/y`
- 提过 `reactive/plainObject`
- 提过 `anchor + offset`

我的决策：

- 部分采纳
- 不采用 `reactive/plainObject` 作为模式区分
- 不直接采用完整 `anchor + offset`
- 收敛成：
  - `defaultFloating` 用 `placement + offset`
  - `floating` 用 `x/y/width/height`

原因：

- `reactive/plainObject` 太隐式，文档、类型、测试都不好收
- `placement + offset` 已经足够解决“初始化定位不直观”的核心问题
- 当前场景高频就是四角和居中，不需要更重的定位模型

### 4. resize 不能只改宽，默认值也不要混乱

检视意见：

- 现在 resize 只能改宽，不能改高
- 理论上宽高都能改
- 默认值不要混 `'vh'` 这种字符串

我的决策：

- 采纳
- 第一版直接做四边 / 四角 resize
- 运行时状态统一存 number，不存 `vh`、`vw`、`min(...)`

原因：

- 当前场景不是抽屉，而是可拖拽、可缩放的工作面板
- 只改宽度不够覆盖检查器、预览区、日志区、临时工作面板这些真实场景

### 5. `railWidth` 是否改成 `collapsedWidth`

检视意见：

- `railWidth` 语义不够直接
- `collapsedWidth` 更像“收起后的宽度”

我的决策：

- 倾向采纳
- 这是侧栏 API 的命名优化，单独处理，不和 floating 主线混在一起

### 6. `inject` 缺 provider 时不要报错

检视意见：

- `inject` 找不到 provider 时，不要直接抛错
- 提供默认值即可

我的决策：

- 采纳
- 这属于实现层和工程体验优化，单独处理，不和 floating API 主线混在一起

### 7. `hasVNodeProp(instance, ...)` 是否过重

检视意见：

- 现在通过 `getCurrentInstance()` + `vnode.props` 判断 prop 是否真正被传入
- 直觉上会觉得是不是可以直接看 `props.xxx`
- 同时业务组件里直接暴露 `instance` 有点重

我的决策：

- 保留“判断 prop presence”的思路
- 不直接退回成 `props.xxx !== undefined`
- 但可以收掉 `instance` 暴露层

原因：

- 这里要判断的是“有没有传这个 prop”，不是“当前值是不是 undefined”
- 直接看 `props.xxx` 会把“没传”和“显式传了 undefined”混掉
- 这类判断对受控 / 非受控组件是合理需求，不算过度设计
- 但 `getCurrentInstance()` 不必直接散落在业务组件里，可以封到更轻的工具或 composable 里

### 8. `LayoutAside -> LayoutStore` 的数据流是否顺

检视意见：
- 不太符合 Vue 官方“mutation / state 尽量 co-locate”的精神。
- 现在 `LayoutAside` 本地先算出状态，再注册到 `LayoutStore`
- 但 `LayoutAside` 自己渲染时，又会从 store 里把自己的状态读回来
- 从 Vue 官方 `provide / inject` 最佳实践看，修改和真值最好尽量留在 provider / owner 一侧，injector 少做反向依赖

我的决策：

- 保留 `registerPanel()` 这层协调能力
- 保留 store 暴露 action 的模式
- 但要收掉 `LayoutAside` 对 store 的反向依赖

原因：

- 现在的问题不算“违反 Vue 单向数据流”，但确实会让状态 owner 看起来不够唯一
- `LayoutAside` 应该继续作为 open / width / mode 等状态的真值源
- `LayoutStore` 更适合作为 layout 复合组件内部的协调层，供 `Layout`、toggle、resize 交互消费
- `LayoutAside` 不应该“先上报，再从 store 读回自己”

备注：Vue 官方在 provide / inject 里有一条非常关键的建议：

当使用响应式 provide / inject 值时，推荐尽可能将对响应式状态的任何修改保留在 provider 内部。
来源：Provide / Inject | Vue.js

官方还给了推荐模式：

provider 提供状态
provider 同时提供修改状态的方法
injector 通过这些方法表达意图，而不是自己直接改状态

## 二、Todo List

### floating 主线

1. 去掉 `mode/defaultMode`
2. 保留 `floating/defaultFloating` 两个入口
3. `floating` 只做整体受控
4. `defaultFloating` 只做整体非受控初始化
5. `defaultFloating` 用 `placement + offset`
6. 运行时统一维护 `x/y/width/height`
7. 第一版直接支持四边 / 四角 resize
8. clamp、drag、resize、事件统一走一个 commit 管线
9. 默认 `bounds` 收敛为 `layout | viewport`
10. `header-bar` 锁死为唯一默认拖拽条
11. 不支持自定义 selector 拖拽区域
12. 运行时状态只存 number

### 侧栏与基础能力

1. 评估 `railWidth -> collapsedWidth`
2. 调整 `inject` 默认值策略，不直接报错
3. 保留 prop presence 判断逻辑，但收掉 `instance` 暴露层
4. 保留 `registerPanel()`，但让 `LayoutAside` 本地状态继续做唯一真值，store 只做协调层

### 文档与说明

1. 在文档里明确 AI 对话应用容器是主场景
2. 说明 `defaultFloating` 只用于初始化
3. 说明 `floating` 只表示当前运行时状态
4. 说明 floating 模式的 DOM 占位 / 不占位语义
5. 说明为什么第一版直接做四边 / 四角 resize

## 三、后续判断原则

1. 不能脱离场景讲设计
2. 优先考虑怎么用更简单的代码实现复杂功能
3. 公开 API 先服务高频场景，不先暴露低频自由度
4. 数据流保持单向
5. 一般优先整体受控，不优先做字段级半受控
6. 先自己判断场景是否成立，再决定是否采纳检视意见
