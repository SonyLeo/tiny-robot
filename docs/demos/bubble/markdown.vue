<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <p style="margin: 0; font-size: 12px; color: #666">
      string content 通过 `fallback-content-renderer` 接入 markdown，并由 `content-attributes` 统一透传 markdown 配置。
    </p>

    <tr-bubble-provider :content-attributes="contentAttributes">
      <tr-bubble
        :content="mdContent"
        :avatar="aiAvatar"
        :fallback-content-renderer="BubbleRenderers.Markdown"
      ></tr-bubble>
    </tr-bubble-provider>
  </div>
</template>

<script setup lang="ts">
import type { BubbleContentAttributesConfig } from '@opentiny/tiny-robot'
import { BubbleRenderers, TrBubble, TrBubbleProvider } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const contentAttributes: BubbleContentAttributesConfig = () => ({
  link: {
    target: '_self',
    rel: 'nofollow noopener',
  },
  code: {
    copyable: false,
    showLanguage: false,
  },
  style: {
    '--tr-markdown-font-size': '15px',
    '--tr-markdown-line-height': '1.75',
  },
})

const mdContent = `# 标题

**加粗文本** *斜体文本* ~~删除线~~

- 列表项 1
- 列表项 2

- [x] fallback renderer 已切到 TrMarkdown
- [ ] markdown 配置继续通过 contentAttributes 透传
`
</script>
