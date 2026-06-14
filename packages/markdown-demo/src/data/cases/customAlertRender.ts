import MarkdownAlertRenderPreview from '../../components/MarkdownAlertRenderPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

const customAlertRenderSource = `> [!NOTE]
> TinyRobot can replace the default alert shell without touching the parser.
>
> Inline [links](https://example.com) and \`code\` still come from the markdown subtree.

> [!WARNING]
> Public API freeze should happen only after a real render hook lands.`

export const customAlertRenderCase: MarkdownDemoCase = {
  id: 'custom-alert-render',
  title: 'Custom alert render',
  description:
    '把 `renderOptions.alerts.render` 作为第一个正式冻结的渲染级扩展点，对 alert 节点做独立接管，同时保留原有 markdown children 渲染链路。',
  previewComponent: MarkdownAlertRenderPreview,
  controls: {
    variant: false,
  },
  initialContent: customAlertRenderSource,
  markdownProps: {
    features: {
      alerts: {
        enabled: true,
      },
    },
  },
  sourceCode: {
    language: 'ts',
    code: `const renderOptions = {
  alerts: {
    render: ({ kind, title, renderChildren }) =>
      h('section', { 'data-custom-alert-kind': kind }, [
        h('strong', title),
        h('div', renderChildren()),
      ]),
  },
}`,
  },
}
