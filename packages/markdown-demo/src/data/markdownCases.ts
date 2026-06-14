import type { MarkdownDemoSection } from '../types/markdownDemo'
import { alertsComparisonCase, alertsMatrixCase } from './cases/alerts'
import { breakLinesCase } from './cases/breakLines'
import { bubbleIntegrationCase } from './cases/bubbleIntegration'
import { bubbleStreamingCase } from './cases/bubbleStreaming'
import { citationsCodeBoundaryCase, citationsGeneralCase } from './cases/citations'
import { codeBlocksCase } from './cases/codeBlocks'
import { colorModelsCase } from './cases/colorModels'
import { customAlertRenderCase } from './cases/customAlertRender'
import { customHighlightCase } from './cases/customHighlight'
import { customPluginsCase } from './cases/customPlugins'
import { inlineFootnoteCase, repeatedFootnoteCase, singleFootnoteCase } from './cases/footnotes'
import { headingsCase } from './cases/headings'
import { imageGalleryCase, imagesCase } from './cases/images'
import {
  htmlPreviewCase,
  htmlPreviewFragmentCase,
  htmlPreviewStreamingAutoCase,
  htmlPreviewStreamingDeferCase,
  htmlPreviewStreamingLiveCase,
} from './cases/htmlPreview'
import { inlineCodeCase } from './cases/inlineCode'
import { linksCase } from './cases/links'
import { listsCase } from './cases/lists'
import { longArticleCase } from './cases/longArticle'
import { markdownComponentsCase } from './cases/markdownComponents'
import { blockMathCase, inlineMathCase, invalidMathCase } from './cases/math'
import { mermaidFlowchartCase, mermaidInvalidCase, mermaidSequenceCase } from './cases/mermaid'
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
import { videosCase } from './cases/videos'
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
    description:
      '公开展示当前已经完成第一方节点化渲染的媒体内容，覆盖轻量图片节点、独立视频节点和显式开启后的 gallery 预览路径。',
    publicNarrative: {
      title: 'Media First',
      description:
        '先把普通图片与视频嵌入两条主路径讲清楚，再把 gallery 预览作为显式增强入口。这样公开页会先回答“媒体节点是否稳定可用”，再回答“多图预览怎么打开”。',
      featuredCaseIds: ['images', 'videos'],
      stepCaseIds: ['images', 'videos', 'image-gallery'],
      stepLabels: {
        images: 'Basic image',
        videos: 'Video embed',
        'image-gallery': 'Gallery preview',
      },
    },
    cases: [imagesCase, videosCase, imageGalleryCase],
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
    publicNarrative: {
      title: 'Readability First',
      description:
        '先把最常见的 inline code 与 block code 主路径讲清楚，再把颜色预览、Shiki transformer 与 custom actions 下沉为进阶入口。这样公开页会先服务阅读体验，再服务代码块扩展能力。 ',
      featuredCaseIds: ['inline-code', 'code-blocks'],
      stepCaseIds: ['inline-code', 'code-blocks', 'color-models', 'shiki-transformers', 'custom-highlight'],
      stepLabels: {
        'inline-code': 'Inline code',
        'code-blocks': 'Code blocks',
        'color-models': 'Color preview',
        'shiki-transformers': 'Transformers',
        'custom-highlight': 'Custom actions',
      },
    },
    cases: [inlineCodeCase, colorModelsCase, codeBlocksCase, shikiTransformersCase, customHighlightCase],
  },
  {
    id: 'html-preview',
    title: 'HTML Preview',
    description:
      '对标 LobeUI 的 HTML preview 路径：完整 HTML 文档才走 iframe 预览，fragment 保持 source 视图，并补齐 streaming `auto / live / defer` 运行时差异。',
    publicNarrative: {
      title: 'Preview First',
      description:
        '先讲最稳定的预览判断边界，再进入 streaming 差异。公开页默认只展示完整文档预览和 fragment fallback，两者已经覆盖大多数用户最关心的主路径。',
      featuredCaseIds: ['html-preview', 'html-preview-fragment'],
      stepCaseIds: [
        'html-preview',
        'html-preview-fragment',
        'html-preview-streaming-auto',
        'html-preview-streaming-live',
        'html-preview-streaming-defer',
      ],
      stepLabels: {
        'html-preview': 'Document preview',
        'html-preview-fragment': 'Fragment fallback',
        'html-preview-streaming-auto': 'Streaming auto',
        'html-preview-streaming-live': 'Streaming live',
        'html-preview-streaming-defer': 'Streaming defer',
      },
    },
    cases: [
      htmlPreviewCase,
      htmlPreviewFragmentCase,
      htmlPreviewStreamingAutoCase,
      htmlPreviewStreamingLiveCase,
      htmlPreviewStreamingDeferCase,
    ],
  },
  {
    id: 'math-and-diagrams',
    title: 'Math and Diagrams',
    description: '对齐 LobeUI 的公开 section 心智，当前先收口 KaTeX 基础公式与 Mermaid 图表两条高级能力主线。',
    publicNarrative: {
      title: 'Formula First',
      description:
        '先讲最稳定、最常见的公式与图表主路径，再把错误态下沉成进阶入口。公开页默认展示行内公式、块级公式、流程图和时序图，异常公式与异常 Mermaid 语法按需进入。',
      featuredCaseIds: ['math-inline', 'math-block', 'mermaid-flowchart', 'mermaid-sequence'],
      stepCaseIds: [
        'math-inline',
        'math-block',
        'mermaid-flowchart',
        'mermaid-sequence',
        'math-invalid',
        'mermaid-invalid',
      ],
      stepLabels: {
        'math-inline': 'Inline formula',
        'math-block': 'Block formula',
        'mermaid-flowchart': 'Flowchart',
        'mermaid-sequence': 'Sequence diagram',
        'math-invalid': 'Formula fallback',
        'mermaid-invalid': 'Diagram fallback',
      },
    },
    cases: [
      inlineMathCase,
      blockMathCase,
      invalidMathCase,
      mermaidFlowchartCase,
      mermaidSequenceCase,
      mermaidInvalidCase,
    ],
  },
  {
    id: 'footnotes',
    title: 'Footnotes',
    description: '对齐 LobeUI 的脚注文档区，当前覆盖单脚注、重复引用与行内脚注三条主路径。',
    publicNarrative: {
      title: 'Reference First',
      description:
        '先讲最常见的脚注主语法，再把“重复引用是否稳定”下沉成进阶入口。公开页默认展示单脚注和行内脚注，重复引用作为锚点稳定性验证按需进入。',
      featuredCaseIds: ['footnotes-single', 'footnotes-inline'],
      stepCaseIds: ['footnotes-single', 'footnotes-inline', 'footnotes-repeated'],
      stepLabels: {
        'footnotes-single': 'Single footnote',
        'footnotes-inline': 'Inline footnote',
        'footnotes-repeated': 'Repeated reference',
      },
    },
    cases: [singleFootnoteCase, repeatedFootnoteCase, inlineFootnoteCase],
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: '对齐 LobeUI 的 GitHub alerts 文档区，当前覆盖五类官方 callout 与普通 blockquote 对照路径。',
    publicNarrative: {
      title: 'Official Kinds First',
      description:
        '先把 GitHub 五类官方 alert 作为主路径讲清楚，再把普通 blockquote 对照和 same-line 边界下沉成进阶入口。这样公开页先服务“支持哪些类型”，再服务“不会误判什么”。',
      featuredCaseIds: ['alerts-matrix'],
      stepCaseIds: ['alerts-matrix', 'alerts-comparison'],
      stepLabels: {
        'alerts-matrix': 'Alert kinds',
        'alerts-comparison': 'Boundary comparison',
      },
    },
    cases: [alertsMatrixCase, alertsComparisonCase],
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
    publicNarrative: {
      title: 'Readable First',
      description:
        '和 LobeUI 一样，公开层先给一篇完整、可读的流式回答，再把 profiler 和字符级 repro 作为第二层诊断入口，避免一开始就把实现细节堆到主阅读面。',
      featuredCaseIds: ['streaming-markdown'],
      stepCaseIds: ['streaming-markdown', 'streaming-profiler', 'streaming-repro'],
      stepLabels: {
        'streaming-markdown': 'Readable stream',
        'streaming-profiler': 'Profiler',
        'streaming-repro': 'Animation repro',
      },
    },
    cases: [streamingCase, streamingProfilerCase, streamingReproCase],
  },
  {
    id: 'custom',
    title: 'Custom',
    description:
      '对齐 LobeUI custom docs 的最小公开能力，当前冻结 `components / componentProps / citations / custom semantic blocks / renderOptions.alerts.render` 五条已经稳定的第一方扩展入口。',
    publicNarrative: {
      title: 'Start With Components',
      description:
        '先讲最稳定的节点覆写，再进入第一方引用与语义块主路径，最后才进入 render hook 与代码边界。这样和 LobeUI 的 custom 文档一样，公开页先解释稳定能力，再展示更深的渲染扩展。',
      featuredCaseIds: ['markdown-components', 'custom-plugins'],
      stepCaseIds: [
        'markdown-components',
        'citations-general',
        'custom-plugins',
        'custom-alert-render',
        'citations-code-boundary',
      ],
      stepLabels: {
        'markdown-components': 'Components + props',
        'citations-general': 'Citations',
        'custom-plugins': 'Semantic blocks',
        'custom-alert-render': 'Render hook',
        'citations-code-boundary': 'Code boundary',
      },
    },
    cases: [
      markdownComponentsCase,
      citationsGeneralCase,
      customPluginsCase,
      customAlertRenderCase,
      citationsCodeBoundaryCase,
    ],
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
    name: 'parserOptions',
    description:
      '底层 markdown parser 选项，当前公开控制 `html / linkify / typographer / breaks / math / footnotes`。 ',
    type: 'TrMarkdownParserOptions',
    defaultValue: '{ html: false, linkify: true, typographer: false, breaks: false }',
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
    name: 'features',
    description:
      '高级能力显式开关。当前 HTML Preview、Math、Mermaid、Footnotes、Alerts、Image Gallery 分别通过 `features.htmlPreview` / `features.math` / `features.mermaid` / `features.footnotes` / `features.alerts` / `features.imageGallery` 开启。',
    type: 'TrMarkdownFeatureFlags',
    defaultValue: '{ html: false }',
  },
  {
    name: 'components',
    description: '节点级组件映射覆写入口。',
    type: 'Partial<TrMarkdownComponentMap>',
    defaultValue: '{}',
  },
  {
    name: 'citations',
    description:
      '第一方引用数据入口。正文里的 `[1] / [2]` 会在普通文本路径中升级成 citation 节点，不进入代码块与 inline code。',
    type: 'TrMarkdownCitationItem[]',
    defaultValue: '[]',
  },
  {
    name: 'componentProps',
    description: '为覆写组件或默认节点组件补充 props / attrs 的公开入口。',
    type: 'TrMarkdownComponentPropsMap',
    defaultValue: '{}',
  },
  {
    name: 'renderOptions',
    description:
      '渲染级扩展入口。当前已冻结的公开子能力为 `renderOptions.alerts.render`，用于替换 alert 节点外壳而不改 parser。 ',
    type: 'TrMarkdownRenderOptions',
    defaultValue: '{}',
  },
]
