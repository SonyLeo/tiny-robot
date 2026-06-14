import MarkdownCustomPluginsPreview from '../../components/MarkdownCustomPluginsPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

const customPluginsSource = `好的，让我换一个视角解释一下“睡觉”。

<tr-thinking title="Why this becomes a first-party block">
这个请求先适合暴露一个可折叠的 reasoning 语义块，用来承接模型在进入 artifact 前的判断，而不是把通用插件系统直接暴露给使用者。
</tr-thinking>

<tr-artifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160">
  <rect width="220" height="160" rx="24" fill="#F4EBD8" />
  <text x="110" y="72" font-size="20" text-anchor="middle" fill="#8B5E34">睡觉</text>
  <text x="110" y="106" font-size="12" text-anchor="middle" fill="#8B5E34">生产力的假死，创造力的重生。</text>
</svg>
</tr-artifact>

<tr-unknown title="future">Unsupported tag should stay literal.</tr-unknown>`

export const customPluginsCase: MarkdownDemoCase = {
  id: 'custom-plugins',
  title: 'Custom plugins',
  description:
    '对齐 LobeUI 的 custom plugins 公开效果，但实现边界冻结为第一方语义块: `tr-thinking / tr-artifact` 会升级成独立节点，不额外公开 rehype/remark 插件入口。',
  previewComponent: MarkdownCustomPluginsPreview,
  deferPreview: true,
  initialContent: customPluginsSource,
  controls: {
    variant: false,
  },
  sourceCode: {
    language: 'md',
    code: customPluginsSource,
  },
}
