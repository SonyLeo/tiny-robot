export interface TrMarkdownPhase0StaticFixture {
  id: string
  title: string
  description: string
  content: string
}

export interface TrMarkdownPhase0StreamingStep {
  id: string
  label: string
  content: string
  operation?: 'append' | 'rewrite' | 'delete' | 'finalize'
  expectedTailKind?: 'text' | 'link' | 'code' | 'table' | 'image' | ''
  expectedTailText?: string
}

export interface TrMarkdownPhase0StreamingFixture {
  id: string
  title: string
  description: string
  steps: TrMarkdownPhase0StreamingStep[]
  operations?: Array<'append' | 'rewrite' | 'delete' | 'finalize'>
  finalContent: string
}

const chineseStructure = `# 团队周报

本周完成了登录流程和消息列表的整理，下面是可以直接交给评审的重点。

## 已完成

- 统一按钮和表单的交互反馈
  - 键盘操作保留清晰的焦点状态
  - 空状态提供下一步行动
- [x] 补齐移动端断点
- [ ] 增加批量操作的快捷键

下一步会继续收敛空白、标题和列表之间的阅读节奏。`

const orderedTable = `## 发布检查清单

3. 先确认构建产物和变更日志
4. 再检查窄屏上的长表格
5. 最后运行冒烟测试

| 项目 | 状态 | 说明 |
| :--- | :---: | ---: |
| parser | ready | 保留列表起始编号和表格对齐信息 |
| renderer | review | 长单元格在窄屏允许横向滚动，不挤压正文 |
| release | pending | 等待维护者确认截图基线 |
`

const quoteAlert = `> [!TIP]
> 先固定输入和视口，再讨论排版差异。
>
> 同一份回答需要同时经过 standalone 和 Bubble 路径。

普通引用仍然保持轻量：它只承载上下文，不改变正文的层级。`

const codeLanguages = `## 多语言片段

行内配置使用 \`retryCount\`，未知语言也应当回退为可读的纯文本。

\`\`\`ts
type Result = { ok: boolean; value?: string }
const parse = (input: string): Result => ({ ok: input.length > 0, value: input })
\`\`\`

\`\`\`python
def summarize(items: list[str]) -> str:
    return ", ".join(items)
\`\`\`

\`\`\`sql
SELECT id, status FROM jobs WHERE status = 'ready';
\`\`\`

\`\`\`yaml
service:
  retries: 3
  timeout: 1200ms
\`\`\`

\`\`\`made-up-language
BEGIN signal -> stable -> done
\`\`\``

const mixedMedia = `## 设计说明

正文可以包含公式 $E = mc^2$、一个流程图和一张说明图片；这些扩展内容必须保持自己的回退状态。

\`\`\`mermaid
flowchart LR
  Input --> Parse --> Render
\`\`\`

![TinyRobot logo](https://img.example.com/tiny-robot.png)

$$
f(x) = x^2 + 2x + 1
$$`

const securityBoundaries = `## 安全边界

[危险协议](javascript:alert('xss'))

<img src="x" onerror="window.__tinyRobotUnsafeRawHtml = true" />
<svg onload="window.__tinyRobotUnsafeSvg = true"><script>alert('xss')</script></svg>

![data URL](data:image/svg+xml,<svg onload="alert('xss')"></svg>)

$$\\href{javascript:alert('xss')}{危险公式链接}$$

\`\`\`mermaid
flowchart TD
  Start -->
\`\`\``

export const trMarkdownPhase0StaticFixtures: TrMarkdownPhase0StaticFixture[] = [
  {
    id: 'chinese-structure',
    title: '中文多级标题与嵌套任务列表',
    description: '固定中文段落、标题层级、嵌套列表和任务项的阅读节奏。',
    content: chineseStructure,
  },
  {
    id: 'ordered-table',
    title: '起始编号列表与对齐表格',
    description: '固定非 1 起始编号、三种表格对齐和长单元格。',
    content: orderedTable,
  },
  {
    id: 'quote-alert',
    title: '引用与提示块',
    description: '固定 alert 与普通正文引用的相邻呈现。',
    content: quoteAlert,
  },
  {
    id: 'code-languages',
    title: '行内代码与多语言代码块',
    description: '固定 TypeScript、Python、SQL、YAML 和未知语言回退。',
    content: codeLanguages,
  },
  {
    id: 'mixed-media',
    title: '公式、Mermaid 与图片混合内容',
    description: '固定高级块的输入与加载失败时的可读回退。',
    content: mixedMedia,
  },
  {
    id: 'security-boundaries',
    title: '危险协议、HTML、SVG、data URL 与高级块回退',
    description: '固定危险输入边界，验证无脚本执行并保留可读的受控回退。',
    content: securityBoundaries,
  },
]

const inlineRewriteFinal = `## 稳定回答

最终内容保留 **加粗结论**，并链接到 [TinyRobot 文档](https://docs.opentiny.design/tiny-robot/)。

这段文字替换了中途的草稿段落。`

export const trMarkdownPhase0StreamingFixtures: TrMarkdownPhase0StreamingFixture[] = [
  {
    id: 'inline-rewrite-finalize',
    title: '未闭合行内语法、同块 rewrite 与 finalize',
    description: '累计输入先打开粗体和链接，再重写草稿段落，最后以固定最终原文收敛。',
    finalContent: inlineRewriteFinal,
    operations: ['append', 'rewrite', 'delete', 'finalize'],
    steps: [
      {
        id: 'inline-rewrite-1',
        label: 'Heading and bold open',
        content: '## 稳定回答\n\n最终内容保留 **加粗',
        operation: 'append',
        expectedTailKind: '',
      },
      {
        id: 'inline-rewrite-2',
        label: 'Link open',
        content: '## 稳定回答\n\n最终内容保留 **加粗结论**，并链接到 [TinyRobot 文档](https://docs.',
        expectedTailKind: 'link',
        expectedTailText: '[TinyRobot 文档](https://docs.',
        operation: 'append',
      },
      {
        id: 'inline-rewrite-3',
        label: 'Draft rewrite',
        content:
          '## 稳定回答\n\n最终内容保留 **加粗结论**，并链接到 [TinyRobot 文档](https://docs.opentiny.design/tiny-robot/)。\n\n这段文字还是草稿。',
        operation: 'rewrite',
        expectedTailKind: '',
      },
      {
        id: 'inline-rewrite-4',
        label: 'Delete draft paragraph',
        content:
          '## 稳定回答\n\n最终内容保留 **加粗结论**，并链接到 [TinyRobot 文档](https://docs.opentiny.design/tiny-robot/)。\n',
        operation: 'delete',
        expectedTailKind: '',
      },
      {
        id: 'inline-rewrite-5',
        label: 'Finalized answer',
        content: inlineRewriteFinal,
        operation: 'finalize',
        expectedTailKind: '',
      },
    ],
  },
  {
    id: 'table-code-rewrite',
    title: '未完表格、代码增长与 rewrite',
    description: '固定表格未完、代码追加、代码体内 fence-like 文本、段落删除和最终收敛。',
    finalContent: `## 运行结果

执行器已完成重试，最终状态为 **ready**。

\`\`\`ts
const status = 'ready'
const fenceLike = "\`\`\`ts"
console.log(status)
\`\`\`
`,
    operations: ['append', 'rewrite', 'delete', 'finalize'],
    steps: [
      {
        id: 'table-code-1',
        label: 'Incomplete table',
        content: '## 运行结果\n\n| 名称 | 状态 |\n| --- | --- |\n| job-1 |',
        operation: 'append',
        expectedTailKind: 'table',
        expectedTailText: '| job-1 |',
      },
      {
        id: 'table-code-2',
        label: 'Code starts',
        content: '## 运行结果\n\n| 名称 | 状态 |\n| --- | --- |\n| job-1 | ready |\n\n```ts\nconst status =',
        operation: 'append',
        expectedTailKind: 'code',
        expectedTailText: 'const status =',
      },
      {
        id: 'table-code-3',
        label: 'Code grows with fence-like text',
        content: `## 运行结果

| 名称 | 状态 |
| --- | --- |
| job-1 | ready |

\`\`\`ts
const status = 'ready'
const fenceLike = "\`\`\`ts"
console.log(status)`,
        operation: 'rewrite',
        expectedTailKind: 'code',
      },
      {
        id: 'table-code-4',
        label: 'Paragraph rewrite',
        content: `## 运行结果

执行器已完成重试，最终状态为 **ready**。

\`\`\`ts
const status = 'ready'
const fenceLike = "\`\`\`ts"
console.log(status)
\`\`\`
`,
        operation: 'delete',
        expectedTailKind: '',
      },
      {
        id: 'table-code-5',
        label: 'Finalized answer',
        content: `## 运行结果

执行器已完成重试，最终状态为 **ready**。

\`\`\`ts
const status = 'ready'
const fenceLike = "\`\`\`ts"
console.log(status)
\`\`\`
`,
        operation: 'finalize',
        expectedTailKind: '',
      },
    ],
  },
]

export const trMarkdownPhase0VisualContent = trMarkdownPhase0StaticFixtures
  .filter(({ id }) => ['chinese-structure', 'ordered-table', 'quote-alert', 'code-languages'].includes(id))
  .map(({ content }) => content)
  .join('\n\n')
