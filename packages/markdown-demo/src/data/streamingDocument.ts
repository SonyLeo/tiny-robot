import type {
  TrMarkdownStreamingFixtureScenario,
  TrMarkdownStreamingFixtureStep,
} from '../../../components/src/markdown/fixtures/streaming'
import type { MarkdownStreamingDocumentVariant } from '../types/markdownDemo'

export const streamingFullContent = `Complete Markdown Integration Example
--

This demo streams a cohesive assistant answer, so the left preview reads like a real AI response instead of a list of isolated regression fixtures.

## AI Assistant Capabilities

Hello! I'm an AI assistant powered by TinyRobot components. I can help you with several kinds of work:

1. **Question answering** - Provide detailed responses to complex queries.
2. **Information synthesis** - Turn scattered notes into a structured summary.
3. **Code development** - Write, review, and debug code in multiple languages.
4. **Concept explanation** - Break down difficult topics into readable steps.

## Long Paragraph Example

This paragraph demonstrates how a long response should keep a comfortable reading rhythm while new content is still arriving. The streaming renderer should preserve completed text, reveal the active text block smoothly, and avoid remounting the whole document every time a new chunk appears.

The second paragraph continues the same document-level story. It lets us inspect typography, spacing, and line-height under a realistic load rather than checking every markdown feature in a separate mini demo. This is closer to how users experience AI-generated markdown in chat and documentation workflows.

## Document Structure

Real assistant answers usually mix headings, paragraphs, lists, inline code, fenced code blocks, and summary tables. This scenario keeps those supported capabilities in one stream so the demo checks the same surface a user would actually read.

## TypeScript Component Implementation

Here's a compact Vue integration example that uses \`TrMarkdown\` as the rendering surface:

\`\`\`ts
import { TrMarkdown } from '@opentiny/tiny-robot'

const markdownProps = {
  streaming: {
    enabled: true,
    active: true,
    mode: 'animated',
    preset: 'balanced',
  },
}
\`\`\`

## Streaming Behavior

The public demo focuses on a product-like flow:

- Completed sections stay readable while the next section streams.
- Inline code such as \`streaming.active\` remains stable.
- Code blocks keep their toolbar and syntax highlighting behavior.
- Tables and task lists render as normal markdown once their syntax is complete.

## Feature Integration Summary

| Feature | Status | Implementation |
| --- | --- | --- |
| Headings | Done | Native markdown nodes |
| Paragraphs | Done | Typography tokens |
| Code blocks | Done | Shiki highlighting + toolbar |
| Tables | Done | GitHub-flavored table rendering |
| Task lists | Done | Checkbox node mapping |
| Streaming | Done | Queue scheduler + finalize settle |

## Acceptance Checklist

- [x] The main Streamdown demo uses one coherent markdown document.
- [x] The profiler observes the same document instead of a different fixture.
- [x] Diagnostic edge cases stay available without interrupting the public reading flow.
`

export const streamingFullContentCN = `# 完整 Markdown 集成示例

这个案例会流式渲染一篇完整的 AI 助手回答，因此左侧预览更像真实产品里的回答，而不是一组彼此割裂的工程回归片段。

## AI 助手能力

你好！我是由 TinyRobot 组件驱动的 AI 助手，可以帮助你完成多种任务：

1. **问题解答** - 对复杂问题给出结构化回复。
2. **信息整理** - 把分散资料收敛成清晰摘要。
3. **代码开发** - 编写、审查和调试多种语言的代码。
4. **概念解释** - 将复杂主题拆解成容易阅读的步骤。

## 长段落示例

这一段用于观察长回答在流式渲染时的阅读节奏。已经完成的文本应该保持稳定，正在生成的文本块应该平滑 reveal，同时避免每次新 chunk 到达都重挂载整篇文档。

第二段继续保持同一篇文章的叙事。它能帮助我们在更真实的负载下检查 typography、spacing 和 line-height，而不是把每一种 markdown 语法拆成孤立的小 demo。这个体验更接近用户在对话和文档场景中看到的 AI markdown 输出。

## 文档结构

真实的 AI 助手回答通常会混合标题、段落、列表、inline code、fenced code block 和摘要表格。这个场景把当前已经正式支持的能力放进同一条 stream，确保 demo 检查的是用户真正会阅读的渲染面。

## TypeScript 组件实现

下面是一个紧凑的 Vue 接入示例，使用 \`TrMarkdown\` 作为渲染面：

\`\`\`ts
import { TrMarkdown } from '@opentiny/tiny-robot'

const markdownProps = {
  streaming: {
    enabled: true,
    active: true,
    mode: 'animated',
    preset: 'balanced',
  },
}
\`\`\`

## Streaming 行为

公开 demo 聚焦产品化流式体验：

- 已完成的 section 在后续内容到达时保持可读。
- \`streaming.active\` 这类 inline code 保持稳定。
- 代码块保留 toolbar 和语法高亮能力。
- 表格和任务列表在语法完整后回到普通 markdown 渲染。

## 功能集成摘要

| 能力 | 状态 | 实现 |
| --- | --- | --- |
| 标题 | 已完成 | 原生 markdown 节点 |
| 段落 | 已完成 | Typography token |
| 代码块 | 已完成 | Shiki 高亮 + toolbar |
| 表格 | 已完成 | GitHub 风格表格渲染 |
| 任务列表 | 已完成 | Checkbox 节点映射 |
| Streaming | 已完成 | Queue scheduler + finalize settle |

## 验收清单

- [x] Streamdown 主案例使用一篇连贯 markdown 文档。
- [x] Profiler 观察同一篇文档，而不是另一套 fixture。
- [x] 诊断边界案例仍然保留，但不打断公开阅读流。
`

const getStepLabel = (content: string, index: number) => {
  const headingMatch = content.match(/^##\s+(.+)$/m)

  if (headingMatch?.[1]) {
    return headingMatch[1]
  }

  return index === 0 ? 'Intro' : `Section ${index + 1}`
}

export const createStreamingDocumentSteps = (
  content: string,
  idPrefix = 'streaming-document',
): TrMarkdownStreamingFixtureStep[] => {
  const normalizedContent = content.trimEnd()
  const sections = normalizedContent.split(/(?=^##\s+)/m).filter(Boolean)
  let accumulated = ''

  if (!sections.length) {
    return [
      {
        id: `${idPrefix}-1`,
        label: 'Content',
        content: normalizedContent,
      },
    ]
  }

  return sections.map((section, index) => {
    accumulated += section

    if (!accumulated.endsWith('\n')) {
      accumulated += '\n'
    }

    return {
      id: `${idPrefix}-${index + 1}`,
      label: getStepLabel(section, index),
      content: accumulated,
    }
  })
}

const createDocumentScenario = (
  id: string,
  title: string,
  description: string,
  content: string,
): TrMarkdownStreamingFixtureScenario => ({
  id,
  group: 'basic',
  title,
  description,
  steps: createStreamingDocumentSteps(content, id),
})

export const streamingDocumentScenarioEN = createDocumentScenario(
  'complete-document-en',
  'Complete markdown document',
  '对齐 LobeUI Streamdown 主案例：用一篇完整、真实、可阅读的 Markdown 回答来验证 streaming 体验。',
  streamingFullContent,
)

export const streamingDocumentScenarioCN = createDocumentScenario(
  'complete-document-cn',
  '完整 Markdown 文档',
  '对齐 LobeUI Streamdown 的 zh-CN 切换：同一份结构、同一套控制，只替换语言内容。',
  streamingFullContentCN,
)

export const streamingDocumentScenarios: TrMarkdownStreamingFixtureScenario[] = [
  streamingDocumentScenarioEN,
  streamingDocumentScenarioCN,
]

export const streamingDocumentVariants: MarkdownStreamingDocumentVariant[] = [
  {
    id: 'en-US',
    label: 'English',
    content: streamingFullContent,
    streamingScenarios: [streamingDocumentScenarioEN],
  },
  {
    id: 'zh-CN',
    label: '中文',
    content: streamingFullContentCN,
    streamingScenarios: [streamingDocumentScenarioCN],
  },
]
