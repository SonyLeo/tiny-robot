# layout floating 实现指导

## 目标

基于现有方案，实现这 4 件事：

1. 拖拽
2. 四边 / 四角缩放
3. clamp
4. viewport / layout bounds

## 总体结论

1. `defaultFloating` 负责初始化定位。
2. `floating` 负责运行时 rect。
3. 拖拽、resize、clamp、事件都走同一个 rect commit 管线。
4. 这份实现只覆盖 AI 对话应用容器里的 free floating panel。
5. `header-bar` 是唯一默认拖拽条，不支持自定义拖拽区域。
6. Floating UI 值得借的是边界计算思路，不是拿来接管拖拽窗口。

## 先对应场景

这套实现主要服务 AI 对话应用容器里的 3 类场景：

1. 浮动 AI 对话窗
   - 右上角或右下角出现
   - 可拖走
   - 可改宽高

2. 浮动检查器 / 配置面板
   - 默认贴边出现
   - 用户会拖动位置
   - 用户会调整到适合自己的尺寸

3. 浮动临时工作面板
   - 居中出现
   - 后续可以自由拖拽和缩放

这份文档只讨论 free panel：

1. 典型场景：浮动 AI 对话窗、浮动检查器 / 配置面板、浮动临时工作面板
2. 运行方式：先初始化，再自由拖拽 / resize

## 内部状态

运行时统一维护：

```ts
type Rect = {
  x: number
  y: number
  width: number
  height: number
}
```

约束统一维护：

```ts
type Constraints = {
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}
```

边界统一维护：

```ts
type Bounds = {
  left: number
  top: number
  right: number
  bottom: number
}
```

## 统一管线

所有状态更新都走同一条顺序：

```ts
input
-> resolve placement
-> apply drag / resize delta
-> apply min/max constraints
-> clamp to bounds
-> round to integer
-> commit rect
-> emit event
```

这条顺序要定死，不要分散到不同事件处理器里。

## 初始化定位

`defaultFloating` 先解析成第一份 rect：

```ts
placement + offset -> x/y
width/height -> default size
then clamp -> first rect
```

初始化后不再反复读取 `defaultFloating`。

场景对应：

1. 浮动 AI 对话窗
   - 常见是 `top-right + offset`
2. 浮动检查器 / 配置面板
   - 常见是 `right` 侧贴边或 `bottom-right`
3. 浮动临时工作面板
   - 常见是 `center`

## 拖拽

对应场景：

1. 浮动 AI 对话窗打开后，用户把它拖到不挡内容的位置
2. 浮动检查器 / 配置面板被用户拖到更顺手的区域
3. 浮动临时工作面板打开后，用户调整位置配合主内容查看
4. floating 模式下，`header-bar` 作为默认 drag handle

这里建议直接定死：

1. `header-bar` 默认就是拖拽条
2. 按下 `header-bar` 只进入 drag，不进入 resize
3. 不支持自定义 selector 拖拽区域
4. 内容区不参与拖拽

拖拽只改位置：

```ts
next.x = start.x + dx
next.y = start.y + dy
```

然后统一 clamp：

```ts
next.x = clamp(next.x, bounds.left, bounds.right - next.width)
next.y = clamp(next.y, bounds.top, bounds.bottom - next.height)
```

实现要求：

1. `pointerdown` 记录起始 pointer 和起始 rect
2. `pointermove` 只算 `dx/dy`
3. 使用 `setPointerCapture()`
4. 拖拽期间禁用文本选中

## 四边 / 四角缩放

对应场景：

1. 浮动 AI 对话窗默认宽度够用，但用户想临时拉宽查看更多内容
2. 浮动检查器 / 配置面板会按屏幕空间调整宽高
3. 浮动临时工作面板需要同时改宽和高
4. 数据面板、日志面板、预览面板通常需要四角缩放，而不是只改宽度

第一版直接做四边 / 四角缩放的原因：

1. AI 对话应用容器里的 floating 面板不只是抽屉，更像可调整的工作区面板
2. 如果只做左右改宽，预览区、日志区、调试区这类场景会不成立

这里也建议定死交互入口：

1. 边缘 handle 负责四边 resize
2. 角点 handle 负责四角 resize
3. resize 和 drag 状态互斥
4. 按边或角时，不触发 `header-bar` drag

按 8 个方向实现：

```ts
n s e w ne nw se sw
```

### 右边 `e`

```ts
width = start.width + dx
```

### 左边 `w`

```ts
right = start.x + start.width
width = start.width - dx
width = clamp(width, minWidth, maxWidth)
x = right - width
```

### 下边 `s`

```ts
height = start.height + dy
```

### 上边 `n`

```ts
bottom = start.y + start.height
height = start.height - dy
height = clamp(height, minHeight, maxHeight)
y = bottom - height
```

### 四角

组合四边逻辑：

1. `se` = `e + s`
2. `sw` = `w + s`
3. `ne` = `e + n`
4. `nw` = `w + n`

## clamp

对应场景：

1. 用户把浮动 AI 对话窗拖到布局边缘，面板不能丢出可视区
2. 用户把浮动检查器 / 配置面板缩得太小，仍要保证最小可用尺寸
3. 用户从左边或上边缩放时，视觉上要保持对边稳定
4. 事件、内部状态、最终渲染不能各是一套值

不要把 clamp 分散在拖拽和 resize 里。

统一做一个：

```ts
commitRect(nextRect, source)
```

内部固定做：

1. clamp width
2. clamp height
3. 修正左边 / 上边 resize 导致的 `x/y`
4. clamp `x/y`
5. round integer
6. commit
7. emit

要求：

1. 内部状态值一致
2. 事件值一致
3. 最终渲染值一致

## bounds

不要写死成 viewport。

建议支持：

```ts
'layout' | 'viewport'
```

默认值建议：

1. AI 对话应用容器默认用 `layout`
2. 全局浮层或全屏工作区再用 `viewport`

### layout bounds

基于 layout root / surface 的可用区域算 bounds。

对应场景：

1. AI 对话应用容器里的浮动对话窗，只能在当前 layout 内活动
2. 工作台局部区域里的面板，不应该越出当前布局容器

### viewport bounds

按可视区域算 bounds，不直接依赖单一写死值。

对应场景：

1. 全局浮层
2. 覆盖整个页面的工作面板
3. 移动端全屏工作区

## 容器变化

容器尺寸变化时：

1. 非受控：内部 rect 自动 clamp
2. 受控：渲染结果做安全 clamp，但不自动回写

监听建议：

1. 只在 floating 打开时启用
2. 用 `ResizeObserver`
3. 关闭时清理监听

对应场景：

1. 用户缩放窗口
2. 侧栏展开收起导致主工作区变窄
3. layout root 高宽变化后，原有 rect 需要重新 clamp

## 值得借鉴的业界实践

### Floating UI

适合借：

1. placement -> offset -> shift -> size 的分阶段计算思路
2. `detectOverflow` 的边界抽象

不适合直接借：

1. 把自由拖拽交给 Floating UI
2. 把 overlay 定位库的整套语义直接搬成 layout floating 运行时模型

### interact.js / Moveable

适合借：

1. 8 方向 resize
2. 位置 / 尺寸 / 边缘限制拆开处理
3. bounds 和 size 约束分层

### MDN 推荐实践

实现细节建议：

1. `setPointerCapture()`
2. `ResizeObserver`
3. `touch-action: none`
4. 拖拽 / 缩放期间禁用 `user-select`

## 落地建议

第一阶段：

1. 先把 `defaultFloating -> rect` 的初始化解析收好
2. 再把 drag / resize / clamp 收到一个 commit 管线
3. 直接支持四边 / 四角 resize
4. 先支持 `layout` 和 `viewport` 两种 bounds
