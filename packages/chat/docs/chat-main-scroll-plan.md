# ChatMain 滚动与虚拟滚动条简化方案

## 1. 目标

当前实现已经把主区滚动职责收口为：

- `Main` 只负责高度和裁剪
- `BubbleList` 作为主区唯一真实滚动宿主
- 不修改 `BubbleList` 组件源码
- `ChatMain` 在运行时检测内部是否存在 `.tr-bubble-list`
- 通过 `ChatMain` 侧的样式把 `.tr-bubble-list` 接成唯一 scroll host
- 通过 `ChatMain` 侧的样式把每条 `.tr-bubble` 收敛到主区内容宽度
- `ChatMain` 内部的虚拟滚动条只控制 `BubbleList`
- 原生滚动条隐藏

本轮明确不做：

- `external scroll host`
- `scrollHost / scrollTarget` 这套 API
- 把 `ChatMain` 升级成通用 `ScrollArea` 抽象

## 2. 当前问题

主区目前容易出现多层滚动宿主：

- `ChatLayout` 的 `.tr-chat-layout__main-shell`
- `BubbleList` 根节点
- 业务层额外包裹的滚动容器

直接问题：

- 容易出现双滚动条
- 自动滚底容易冲突
- 虚拟滚动条无法稳定只服务一个真实滚动源

## 3. 最终结构

最终结构收口为：

```vue
<Chat.Main>
  <BubbleList />
</Chat.Main>
```

职责拆分：

- `Chat.Main`
  - 负责 `height: 100%`
  - 负责 `min-height: 0`
  - 默认保留自身滚动兜底
  - 检测到 `.tr-bubble-list` 后切换为裁剪层
- `BubbleList` 根层
  - 铺满 `Main`
  - `overflow-y: auto`
  - 作为唯一真实滚动宿主
- `ChatMain` 侧深层样式
  - 负责给 `.tr-bubble-list` 注入主区 padding
  - 负责把每条 `.tr-bubble` 收敛到主区内容最大宽度
- `ChatMain` 内部滚动条层
  - 读取并同步 `BubbleList.scrollTop / scrollHeight / clientHeight`
  - 拖拽 thumb 时回写 `BubbleList.scrollTop`

## 4. Main 职责边界

`Main` 这一层不再承担真实滚动，只保留容器壳职责：

- 高度继承与裁剪
- 为内部滚动内容提供可用空间
- 不再同时承担“滚动 + 内容限宽”双职责

对应要求：

- `ChatLayout.main-shell` 不再负责真实滚动
- `ChatMain` 保证可作为 `BubbleList` 的 100% 高度父容器
- `ChatMain` 负责对 `BubbleList` 应用主区专属深层样式
- 如果没有 `BubbleList`，`ChatMain` 自己继续作为回退滚动容器

## 5. BubbleList 职责边界

`BubbleList` 收口为主区唯一滚动宿主，但本轮不改它的源码结构：

### 5.1 根层

- 铺满 `Main`
- 持有 `scrollTop / scrollHeight / clientHeight`
- 继续承接自动滚底和虚拟滚动条控制
- 保持当前组件源码契约不变

### 5.2 内容限宽策略

- 不在 `BubbleList` 内部新增内容层
- 由 `ChatMain` 侧样式把每条 `.tr-bubble` 限宽并居中
- 由 `ChatMain` 侧样式给 `.tr-bubble-list` 注入主区 padding

结论：

- `BubbleList` 继续承担唯一真实滚动
- 内容限宽通过 chat 层样式完成，不入侵通用组件源码
- 虚拟滚动条只观察和控制 `BubbleList` 根层

## 6. 明确不引入 external scroll host

本轮不采用以下方向：

- `BubbleList` 新增 `scrollHost = 'external' | 'self'`
- `BubbleList` 新增 `scrollTarget`
- `ChatMain` 对外暴露 `viewportRef`
- 让自动滚底与滚动条控制绑定到外部容器

原因：

- 会把主区滚动责任再次拆散
- 会让 `ChatMain` 变成通用 `ScrollArea` 抽象
- 不符合当前“`BubbleList` 是唯一真实滚动宿主”的确认口径

## 7. 落地顺序

建议按这个顺序推进主线实现：

1. `ChatLayout.main-shell` 退回纯布局壳
2. `ChatMain` 保证 `height: 100% / min-height: 0 / overflow: hidden`
3. `ChatMain` 通过深层样式接管 `.tr-bubble-list` 和 `.tr-bubble` 的主区布局表现
4. `ChatMain` 内部虚拟滚动条只控制 `BubbleList` 根层

## 8. 评审只需确认 5 点

- 是否接受 `Main` 只负责高度和裁剪
- 是否接受 `BubbleList` 作为主区唯一真实滚动宿主
- 是否接受不修改 `BubbleList` 组件源码，而由 chat 层样式完成主区布局收口
- 是否接受 `ChatMain` 内部虚拟滚动条只控制 `BubbleList`
- 是否接受本轮明确不引入 `external scroll host`
