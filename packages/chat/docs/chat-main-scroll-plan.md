# ChatMain 滚动与虚拟滚动条简化方案

## 1. 目标

当前已确认的方案是把主区滚动职责彻底收口：

- `Main` 只负责高度和裁剪
- `BubbleList` 作为主区唯一真实滚动宿主
- `BubbleList` 内部分成两层
  - 根层负责滚动并铺满 `Main`
  - 内容层负责 `max-width + margin-inline + padding-inline`
- 虚拟滚动条只控制 `BubbleList`
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
  <BubbleList class="tr-bubble-list">
    <div class="tr-bubble-list__content">
      <!-- messages -->
    </div>
  </BubbleList>
</Chat.Main>
```

职责拆分：

- `Chat.Main`
  - 负责 `height: 100%`
  - 负责 `min-height: 0`
  - 负责 `overflow: hidden`
- `BubbleList` 根层
  - 铺满 `Main`
  - `overflow-y: auto`
  - 作为唯一真实滚动宿主
- `BubbleList` 内容层
  - 负责正文列限宽与内边距

## 4. Main 职责边界

`Main` 这一层不再承担真实滚动，只保留容器壳职责：

- 高度继承与裁剪
- 为内部滚动内容提供可用空间
- 不再同时承担“滚动 + 内容限宽”双职责

对应要求：

- `ChatLayout.main-shell` 不再负责真实滚动
- `ChatMain` 保证可作为 `BubbleList` 的 100% 高度父容器

## 5. BubbleList 职责边界

`BubbleList` 收口为主区唯一滚动宿主后，需要明确两层结构：

### 5.1 根层

- 铺满 `Main`
- 持有 `scrollTop / scrollHeight / clientHeight`
- 继续承接自动滚底和虚拟滚动条控制

### 5.2 内容层

- 只负责 `max-width`
- 只负责 `margin-inline: auto`
- 只负责 `padding-inline`
- 不再承担滚动容器职责

结论：

- 滚动宿主和内容限宽层必须拆开
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
3. `BubbleList` 拆成“滚动根层 + 内容层”
4. 虚拟滚动条改为只控制 `BubbleList` 根层

## 8. 评审只需确认 5 点

- 是否接受 `Main` 只负责高度和裁剪
- 是否接受 `BubbleList` 作为主区唯一真实滚动宿主
- 是否接受 `BubbleList` 拆成“滚动根层 + 内容层”
- 是否接受虚拟滚动条只控制 `BubbleList`
- 是否接受本轮明确不引入 `external scroll host`
