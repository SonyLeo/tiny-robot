# layout floating 方案

## 结论

1. 公开 API 只保留 `floating` 和 `defaultFloating`。
2. `floating` 只做受控，传完整 rect。
3. `defaultFloating` 只做非受控，主打 `placement + offset`。
4. 不做部分受控。
5. 不做 `mode/defaultMode`。
6. 内部运行时统一只认 `x/y/width/height`。

## 类型

```ts
type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

type LayoutFloatingBase = {
  width?: number
  height?: number
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

type LayoutFloatingRect = LayoutFloatingBase & {
  x: number
  y: number
  width: number
  height: number
}

type LayoutDefaultFloatingConfig = LayoutFloatingBase & {
  placement?: LayoutFloatingPlacement
  offset?: number
}
```

## 用法

### 非受控

```vue
<TrLayout
  mode="floating"
  :default-floating="{
    placement: 'top-right',
    offset: 16,
    width: 420,
    height: 560,
    draggable: true,
    resizable: true,
    minWidth: 320,
    maxWidth: 640,
  }"
/>
```

### 受控

```vue
<TrLayout
  mode="floating"
  :floating="floatingRect"
  @update:floating="floatingRect = $event"
/>
```

## 规则

1. `defaultFloating` 只在初始化时读取一次。
2. `placement + offset` 先解析成 `x/y`。
3. 解析完成后立刻 clamp。
4. 拖拽、resize、事件都只围绕 rect 走。
5. 事件发出的值必须是 clamp 后的最终值。

## placement 换算

```ts
top-left
x = offset
y = offset

top-right
x = containerWidth - width - offset
y = offset

bottom-left
x = offset
y = containerHeight - height - offset

bottom-right
x = containerWidth - width - offset
y = containerHeight - height - offset

center
x = (containerWidth - width) / 2
y = (containerHeight - height) / 2
```

说明：

1. `offset` 是统一边距，同时作用在两个轴上。
2. `center` 不吃 `offset`，要偏移就走受控。

## 边界

1. 容器尺寸变化后，非受控只做 clamp，不重新按 `placement` 排版。
2. 如果业务要求“始终贴右上角”，用受控。
3. 第一版直接做四边 / 四角 resize，不停留在“只能改宽度”。
4. 运行时状态只存 number，不存 `vh`、`vw`、`min(...)`。

