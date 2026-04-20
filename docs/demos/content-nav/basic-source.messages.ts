type ContentNavDemoMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const basicSourceMessages = [
  {
    id: 'overview',
    role: 'user',
    content: 'Overview',
  },
  {
    id: 'assistant-overview',
    role: 'assistant',
    content: 'ContentNav 适合用于长内容区域的快速定位。\n\n接入时只需要准备目录项和真实滚动目标之间的映射关系。',
  },
  {
    id: 'structure',
    role: 'user',
    content: 'Structure',
  },
  {
    id: 'assistant-structure',
    role: 'assistant',
    content: '推荐把每个章节标题或段落容器作为滚动目标。\n\n目录文本可以保持简洁，搜索文本再补充更多上下文。',
  },
  {
    id: 'interaction',
    role: 'user',
    content: 'Interaction',
  },
  {
    id: 'assistant-interaction',
    role: 'assistant',
    content: '当用户点击目录项时，ContentNav 会滚动到对应目标。\n\n滚动过程中，当前激活项也会随着可见区域自动更新。',
  },
  {
    id: 'tips',
    role: 'user',
    content: 'Tips',
  },
  {
    id: 'assistant-tips',
    role: 'assistant',
    content:
      '推荐直接让章节节点带上 data-content-nav-id，并与目录项 id 保持一致。\n\n这样目录项、滚动定位和激活态可以由 TrContentNav 在内部统一处理。',
  },
] satisfies ContentNavDemoMessage[]
