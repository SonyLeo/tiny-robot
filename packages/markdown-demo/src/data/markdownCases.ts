import type { MarkdownDemoSection } from '../types/markdownDemo'
import { breakLinesCase } from './cases/breakLines'
import { bubbleIntegrationCase } from './cases/bubbleIntegration'
import { bubbleStreamingCase } from './cases/bubbleStreaming'
import { codeBlocksCase } from './cases/codeBlocks'
import { colorModelsCase } from './cases/colorModels'
import { customHighlightCase } from './cases/customHighlight'
import { headingsCase } from './cases/headings'
import { imagesCase } from './cases/images'
import { inlineCodeCase } from './cases/inlineCode'
import { linksCase } from './cases/links'
import { listsCase } from './cases/lists'
import { longArticleCase } from './cases/longArticle'
import { markdownComponentsCase } from './cases/markdownComponents'
import { paragraphCase } from './cases/paragraph'
import { quotesCase } from './cases/quotes'
import { shikiTransformersCase } from './cases/shikiTransformers'
import { stylingTextCase } from './cases/stylingText'
import { streamingCase } from './cases/streaming'
import { streamingProfilerCase } from './cases/streamingProfiler'
import { streamingReproCase } from './cases/streamingRepro'
import { streamingRewritePatchCase } from './cases/streamingRewritePatch'
import { streamingVariantsCase } from './cases/streamingVariants'
import { taskListsCase } from './cases/taskLists'
import { tablesCase } from './cases/tables'
import { variantsCase } from './cases/variants'
import type { MarkdownDemoApiRow } from '../types/markdownDemo'

export const markdownIntro = {
  title: 'Markdown',
  description:
    'Markdown 是一个用于渲染结构化文本的组件。当前 demo 已拆成“公开对标层”和“内部回归层”两套视图：公开层按 LobeUI 的 section 心智组织，内部层保留 TinyRobot 集成与回归基线。',
  installSnippet: "import { TrMarkdown } from '@opentiny/tiny-robot'",
}

export const publicMarkdownSections: MarkdownDemoSection[] = [
  {
    id: 'basic',
    title: 'Basic',
    description: '对齐 LobeUI 基础文档区，公开展示最核心的 typography、语义节点和表格表现。',
    cases: [headingsCase, paragraphCase, stylingTextCase, breakLinesCase, quotesCase, linksCase, tablesCase],
  },
  {
    id: 'media',
    title: 'Media',
    description: '公开展示当前已经完成第一方节点化渲染的媒体内容，避免把图片案例继续混进基础排版回归区。',
    cases: [imagesCase],
  },
  {
    id: 'lists',
    title: 'Lists',
    description: '和 LobeUI 一样把列表独立成 section，减少 Basic 区重复叙事。',
    cases: [listsCase, taskListsCase],
  },
  {
    id: 'code',
    title: 'Code',
    description:
      '围绕 inline code、颜色预览、snippet、block toolbar、Shiki transformer 和自定义 actionsRender 收敛 code 模块。',
    cases: [inlineCodeCase, colorModelsCase, codeBlocksCase, shikiTransformersCase, customHighlightCase],
  },
  {
    id: 'variants',
    title: 'Variants',
    description: '公开层统一展示 `default / bubble / article` 三条视觉路径，不再把 variant 回归散落到别的 section。',
    cases: [variantsCase],
  },
  {
    id: 'streamdown',
    title: 'Streamdown',
    description:
      '对齐 LobeUI streaming docs 的三段职责：基础 streamdown、观测 profiler，以及 character animation repro。',
    cases: [streamingCase, streamingProfilerCase, streamingReproCase],
  },
  {
    id: 'custom',
    title: 'Custom',
    description: '对齐 LobeUI custom docs 的最小公开能力，先展示我们当前已经稳定对外的 `components` 覆写能力。',
    cases: [markdownComponentsCase],
  },
]

export const internalMarkdownSections: MarkdownDemoSection[] = [
  {
    id: 'internal-regression',
    title: 'Internal Regression',
    description: '保留 TinyRobot 当前最重要的内部回归项，避免这些实现验收 case 再污染公开 docs 结构。',
    cases: [
      longArticleCase,
      bubbleIntegrationCase,
      streamingVariantsCase,
      bubbleStreamingCase,
      streamingRewritePatchCase,
    ],
  },
]

export const markdownApiRows: MarkdownDemoApiRow[] = [
  {
    name: 'content',
    description: '要渲染的 markdown 字符串。',
    type: 'string',
    defaultValue: '-',
  },
  {
    name: 'variant',
    description: '视觉变体，当前公开主路径支持 `default / bubble / article`。',
    type: "'default' | 'bubble' | 'article'",
    defaultValue: "'default'",
  },
  {
    name: 'streaming',
    description: '开启 streaming 分支，支持 `basic / animated` 两条模式。',
    type: 'boolean | TrMarkdownStreamingConfig',
    defaultValue: 'false',
  },
  {
    name: 'code',
    description: '代码块配置，包括 copy、language、block mode 与 highlight engine。',
    type: 'TrMarkdownCodeConfig',
    defaultValue: '{}',
  },
  {
    name: 'components',
    description: '节点级组件映射覆写入口。',
    type: 'Partial<TrMarkdownComponentMap>',
    defaultValue: '{}',
  },
]
