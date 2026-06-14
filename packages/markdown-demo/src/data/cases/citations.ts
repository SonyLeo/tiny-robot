import MarkdownCitationsPreview from '../../components/MarkdownCitationsPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

const citationsGeneralSource = `杭州未来几天以阴雨和多云为主，白天气温在 7-12℃ 之间波动[1][2]。

- 明天有小雨，体感会更凉[2]
- 周末开始逐步转多云，但早晚温差仍然明显[3]

如果只是快速阅读，正文里的 \`[1] / [2] / [3]\` 应该先表现为稳定的第一方引用节点，再通过 hover card 或上方来源卡片补充完整信息。`

const citationsCodeBoundarySource = `这里的 \`coord[1]\` 只是普通数组索引，不应该被升级成 citation。

\`\`\`ts
const coord = [12, 34, 56]
console.log(coord[1])
\`\`\`

只有正文里的天气结论[1] 才应该被识别成第一方引用节点。`

const citationsData = [
  {
    url: 'https://www.weather.com.cn/weather/101210101.shtml',
    title: '中国天气网杭州预报',
    summary: '提供杭州近几天的逐日天气概览与气温范围。',
  },
  {
    url: 'https://weather.cma.cn/web/weather/58457.html',
    title: '中央气象台杭州站点',
    summary: '提供站点级天气数据与降水趋势。',
  },
  {
    url: 'https://www.accuweather.com/zh/cn/hangzhou/106832/weather-forecast/106832',
    title: 'AccuWeather Hangzhou',
    summary: '补充未来几天的体感与趋势预测信息。',
  },
] as const

const citationsControls = {
  content: true,
  variant: false,
  fontSize: false,
  headerMultiple: false,
  lineHeight: false,
  marginMultiple: false,
  copyable: false,
  showLanguage: false,
  inlineColorPreview: false,
  blockMode: false,
  highlightEngine: false,
  enableTransformer: false,
  defaultExpand: false,
} as const

export const citationsGeneralCase: MarkdownDemoCase = {
  id: 'citations-general',
  title: 'Citations',
  description:
    '对齐 LobeUI 的 citations 主路径：顶部先给来源卡片，正文中的 `[1] / [2] / [3]` 再升级成第一方引用节点，不扩展成通用插件接口。',
  previewComponent: MarkdownCitationsPreview,
  initialContent: citationsGeneralSource,
  markdownProps: {
    citations: [...citationsData],
  },
  controls: citationsControls,
  sourceCode: {
    language: 'ts',
    code: `const citations = [
  {
    url: 'https://www.weather.com.cn/weather/101210101.shtml',
    title: '中国天气网杭州预报',
    summary: '提供杭州近几天的逐日天气概览与气温范围。',
  },
  {
    url: 'https://weather.cma.cn/web/weather/58457.html',
    title: '中央气象台杭州站点',
    summary: '提供站点级天气数据与降水趋势。',
  },
]

<TrMarkdown :content="content" :citations="citations" />`,
  },
}

export const citationsCodeBoundaryCase: MarkdownDemoCase = {
  id: 'citations-code-boundary',
  title: 'Citation code boundary',
  description:
    '补一条边界 case：正文里的 `[1]` 会升级成 citation，但 inline code、fenced code 里的 `coord[1]` 仍然保持原样，避免误伤普通代码阅读。',
  previewComponent: MarkdownCitationsPreview,
  deferPreview: true,
  initialContent: citationsCodeBoundarySource,
  markdownProps: {
    citations: [...citationsData],
  },
  controls: citationsControls,
  sourceCode: {
    language: 'md',
    code: citationsCodeBoundarySource,
  },
}
