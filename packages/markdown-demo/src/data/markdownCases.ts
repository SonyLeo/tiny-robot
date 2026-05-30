import type { MarkdownDemoSection } from '../types/markdownDemo'
import { breakLinesCase } from './cases/breakLines'
import { bubbleVariantCase } from './cases/bubbleVariant'
import { codeBlocksCase } from './cases/codeBlocks'
import { colorModelsCase } from './cases/colorModels'
import { customHighlightCase } from './cases/customHighlight'
import { headingsCase } from './cases/headings'
import { inlineCodeCase } from './cases/inlineCode'
import { linksCase } from './cases/links'
import { listsCase } from './cases/lists'
import { longArticleCase } from './cases/longArticle'
import { paragraphCase } from './cases/paragraph'
import { quotesCase } from './cases/quotes'
import { shikiTransformersCase } from './cases/shikiTransformers'
import { stylingTextCase } from './cases/stylingText'
import { taskListsCase } from './cases/taskLists'
import { tablesCase } from './cases/tables'

export const markdownIntro = {
  title: 'Markdown',
  description:
    'Markdown 是一个用于渲染结构化文本的组件。当前 demo 按基础排版与 code 专项拆分，左侧实时预览、右侧控制渲染参数，用于收敛 `TrMarkdown` 与 LobeUI 对标案例的最终观感。',
  installSnippet: "import { TrMarkdown } from '@opentiny/tiny-robot'",
}

export const markdownSections: MarkdownDemoSection[] = [
  {
    id: 'basic',
    title: 'Basic',
    description: '围绕基础 typography、文本语义节点与 table 展示收敛当前 `TrMarkdown` 的默认排版表现。',
    cases: [
      headingsCase,
      paragraphCase,
      longArticleCase,
      stylingTextCase,
      breakLinesCase,
      quotesCase,
      linksCase,
      listsCase,
      taskListsCase,
      bubbleVariantCase,
      tablesCase,
    ],
  },
  {
    id: 'code',
    title: 'Code',
    description:
      '围绕 inline code、颜色预览、snippet、block toolbar、Shiki transformer 和自定义 actionsRender 收敛 code 模块。',
    cases: [inlineCodeCase, colorModelsCase, codeBlocksCase, shikiTransformersCase, customHighlightCase],
  },
]
