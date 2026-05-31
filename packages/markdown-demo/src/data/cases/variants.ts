import MarkdownVariantsPreview from '../../components/MarkdownVariantsPreview.vue'
import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const variantsCase: MarkdownDemoCase = {
  id: 'variants',
  title: 'Variants',
  description:
    '对齐 LobeUI 的 `default` / `chat` 思路，公开层统一展示 `default / bubble / article` 三条视觉路径，避免再把 `bubble` 排版回归散落到其他 section。',
  previewComponent: MarkdownVariantsPreview,
  controls: {
    variant: false,
  },
  initialContent: `## Variant comparison

This shared fixture keeps [links](https://docs.opentiny.design/tiny-robot/), \`inline code\`, task lists and tables in one place so the variant differences are visible at a glance.

- [x] Bubble should stay compact
- [ ] Article should keep a calmer reading rhythm

| Surface | Goal |
| --- | --- |
| default | balanced docs view |
| bubble | compact chat view |
| article | long-form reading view |`,
}
