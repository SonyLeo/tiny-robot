import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const linksCase: MarkdownDemoCase = {
  id: 'links',
  title: 'Links',
  description: '同时验证显式链接和自动 linkify，在统一主题 token 下观察颜色与 hover 表现。',
  initialContent: `你可以通过 [TinyRobot 文档](https://docs.opentiny.design/tiny-robot/) 访问组件说明，也可以直接粘贴 https://github.com/opentiny/tiny-robot 观察自动链接效果。`,
}
