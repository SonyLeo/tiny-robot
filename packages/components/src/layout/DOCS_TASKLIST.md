# Layout 文档与示例 Tasklist

## 已完成归档

- [x] `layout.md` 已改成按能力分组的“说明 + 示例”结构，不再先堆示例再堆说明。
- [x] `layout.md` 已清理黑话，改成用户可直接理解的说明口径。
- [x] 浮层 demo 已从错误的受控写法改成 `defaultFloating` 初始值写法，文档页中可直接拖动、可直接改宽。
- [x] 文档里已明确区分两种浮层用法：
  - `defaultFloating`：只传初始值
  - `floating + update:floating`：外部控制并回写
- [x] 文档结构已对齐 `sender.md` / `bubble.md` 的主风格：基础布局、侧栏模式、主区滚动、浮层模式分别独立成章。
- [x] “常见错误”小节不再单独补，改为通过示例直接展示正确写法。
- [x] `README.md` 不再继续收口，后续直接移除，文档口径以 `layout.md` 为准。
- [x] 共享 `demo.css` 已移除，4 个文档 demo 改为各自内聚的 scoped 样式，避免隐藏依赖。
- [x] 基础布局、侧栏模式、主区滚动、浮层模式示例都已压缩为更小的可读示例。
- [x] 已补一个“受控浮层”单独示例，演示 `floating` 和 `update:floating` 的配套写法。
- [x] rail 示例已改成综合案例同类做法：根据 `isExpanded` 切换内容形态，而不是只让文本被宽度裁切。

## 后续任务

- [ ] 为文档示例做一次回归检查，重点确认浮层拖拽、浮层改宽、drawer 开关和 `Layout.Main` 滚动都正常。
