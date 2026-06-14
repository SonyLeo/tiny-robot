import { h } from 'vue'
import type { MarkdownDemoCase, TrMarkdownProps } from '../../types/markdownDemo'

const renderCustomActions = ({
  code,
  defaultActions,
  language,
}: {
  code: string
  defaultActions: unknown
  language?: string
}) => [
  defaultActions,
  h(
    'button',
    {
      type: 'button',
      class: 'tr-markdown__code-action-button',
      title: 'Custom action',
      'aria-label': 'Custom action',
      onClick: (event: MouseEvent) => {
        event.stopPropagation()
        console.info('[TrMarkdown demo] custom action', {
          language,
          preview: code.slice(0, 64),
        })
      },
    },
    'AI',
  ),
]

export const customHighlightCase: MarkdownDemoCase = {
  id: 'custom-highlight',
  title: 'Custom highlight actions',
  description:
    '对标 LobeUI 的 custom highlight actionsRender 案例，在保留复制按钮的同时注入自定义 toolbar action，用来验证 code 模块扩展点已经稳定。',
  deferPreview: true,
  initialContent: `\`\`\`tsx
export default ({ children, className }: MarkdownProps) => {
  const { styles } = useStyles()

  return (
    <ReactMarkdown
      className={cx(styles.container, className)}
      components={{ pre: CodeBlock, code: Code }}
    >
      {children}
    </ReactMarkdown>
  )
}
\`\`\``,
  markdownProps: {
    code: {
      blockMode: 'full',
      actionsRender: renderCustomActions as NonNullable<NonNullable<TrMarkdownProps['code']>['actionsRender']>,
    },
  },
  controls: {
    blockMode: true,
    highlightEngine: true,
    showLanguage: true,
    copyable: true,
    defaultExpand: true,
  },
}
