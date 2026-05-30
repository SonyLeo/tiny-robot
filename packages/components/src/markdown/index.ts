import './styles/markdown.less'

import { App } from 'vue'
import TrMarkdownComp from './TrMarkdown.vue'

TrMarkdownComp.name = 'TrMarkdown'

const markdownInstall = function (app: App) {
  app.component(TrMarkdownComp.name!, TrMarkdownComp)
}

TrMarkdownComp.install = markdownInstall

export const TrMarkdown = TrMarkdownComp as typeof TrMarkdownComp & {
  install: typeof markdownInstall
}

export type * from './index.type'
export { useMarkdownContext } from './context'
export { markdownItAdapter } from './parser/markdownItAdapter'
export default TrMarkdown
