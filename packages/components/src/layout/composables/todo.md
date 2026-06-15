# 1. 优化 Layout template 层级

header + main + footer 三行

最外层改成 tr-layout

这俩都放到 tr-layout 里面
顶部拖拽条 -> 给 grid 加一行
FloatingResizeTrigger

useLayoutAsideResize 的逻辑都不需要经过 layout 转发。

可以通过 context 拿到之后，在子组件进行使用。相关的方法直接 emit 到父组件进行使用

这里还需要注意不能把 ref 到处传递

drag / resize 的逻辑分开


# 2. 滚动容器的组件名称：LayoutMain -> ProxyScrollbar

提供一个示例，就是内容区外层 margin: 0 auto, 滚动条不会贴着消息，依旧贴右边，看着好看一些。还要添加相关的说明

# 3. 事件增加

// 加 placement -> 相当于下面用法的语法糖
'aside-open-change': [detail: LayoutAsideResizeEventDetail]
'aside-resize-start': [detail: LayoutAsideResizeEventDetail]
'aside-resize': [detail: LayoutAsideResizeEventDetail]
'aside-resize-end': [detail: LayoutAsideResizeEventDetail]


// 不加 placement
'left-aside-open-change': [detail: LayoutAsideResizeEventDetail]
'left-aside-resize-start': [detail: LayoutAsideResizeEventDetail]
'left-aside-resize': [detail: LayoutAsideResizeEventDetail]
'left-aside-resize-end': [detail: LayoutAsideResizeEventDetail]
'right-aside-open-change': [detail: LayoutAsideResizeEventDetail]
'right-aside-resize-start': [detail: LayoutAsideResizeEventDetail]
'right-aside-resize': [detail: LayoutAsideResizeEventDetail]
'right-aside-resize-end': [detail: LayoutAsideResizeEventDetail]


# 4. state 优化

1. 所有内部的 state 都要有默认值，不能是 undefined, 不能是未填
2. 如果要响应式的话，使用 reactive / ref 进行包裹，而不是现在的 getter() 方法，同时类型也可以不用 computeRef 的那种
3. 简化一下 packages\components\src\layout\composables\useLayoutPanel.ts 这里的实现。
