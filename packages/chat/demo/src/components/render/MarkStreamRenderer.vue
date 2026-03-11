<script setup lang="ts">
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import MarkdownRender, { enableMermaid } from 'markstream-vue'

import 'markstream-vue/index.css'

enableMermaid()

const props = defineProps<BubbleContentRendererProps>()

const { contentText: content } = useMessageContent(props)
</script>

<template>
  <MarkdownRender v-if="content" class="mark-stream-renderer" :content="content" />
</template>

<style lang="less">
.markstream-vue * {
  border-width: 0;
  border-style: solid;
  border-color: var(--rc-border-default-5);
}

.mark-stream-renderer.markstream-vue {
  --hr-border-color: var(--rc-border-default-5);
  --table-border: var(--rc-border-default);

  & > .node-slot:first-child > .node-content > *:first-child {
    margin-top: 0.25rem;
  }
  & > .node-slot:last-child > .node-content > *:last-child {
    margin-bottom: 0.25rem;
  }

  // 样式调整
  .my-4 {
    // 1rem -> 0.75rem
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .my-5 {
    // 1.25rem -> 1rem
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .my-8 {
    // 2rem -> 1.5rem
    margin-top: 1.5rem;
    margin-bottom: 2rem;
  }
  .heading-1 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  .heading-2 {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    scroll-margin-top: 80px;
  }
  .heading-3 {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    scroll-margin-top: 80px;
  }
  .heading-4 {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    scroll-margin-top: 80px;
  }
  // 段落
  .paragraph-node {
    margin: 0.5em 0;
  }
  // 列表项中的段落
  li .paragraph-node {
    margin: 0;
  }
  // 列表
  .list-node {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    .list-item {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  // 引用
  .blockquote {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  .hr-node {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  // 图片
  figure {
    margin-top: 0.75rem !important;
    margin-bottom: 0.75rem !important;
    img {
      max-width: min(100%, 24rem);
    }
  }
  // katex 公式
  .katex-display {
    margin: 0.75rem 0;
  }
  // 提示块
  .admonition {
    --admonition-bg: var(--rc-bg-default-2);
    margin: 0.75rem 0;
    .admonition-header {
      padding: 0.25rem 1rem;
    }
    .admonition-content {
      padding: 0 1rem;
    }
  }
  // 成功提示
  .vmr-container {
    margin: 0.75rem 0;
    padding: 0.25rem 1rem;
  }

  .break-words {
    word-break: break-word;
  }
}
.markstream-vue {
  .fixed.inset-0 {
    z-index: 1200;
  }
}
</style>
