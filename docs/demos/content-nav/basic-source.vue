<template>
  <section class="demo">
    <div class="stage">
      <div ref="scrollContainerRef" class="article">
        <section v-for="section in sections" :key="section.id" :ref="bindTarget(section.id)" class="article-section">
          <h4>{{ section.label }}</h4>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </section>
      </div>

      <tr-content-nav
        class="nav"
        :source="source"
        :scroll-container="scrollContainerRef"
        :search="{ placeholder: '搜索章节' }"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrContentNav, useContentNavSource } from '@opentiny/tiny-robot'

type DemoSection = {
  id: string
  label: string
  paragraphs: string[]
}

const sections: DemoSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    paragraphs: ['ContentNav 适合用于长内容区域的快速定位。', '接入时只需要准备目录项和真实滚动目标之间的映射关系。'],
  },
  {
    id: 'structure',
    label: 'Structure',
    paragraphs: ['推荐把每个章节标题或段落容器作为滚动目标。', '目录文本可以保持简洁，搜索文本再补充更多上下文。'],
  },
  {
    id: 'interaction',
    label: 'Interaction',
    paragraphs: [
      '当用户点击目录项时，ContentNav 会滚动到对应目标。',
      '滚动过程中，当前激活项也会随着可见区域自动更新。',
    ],
  },
  {
    id: 'tips',
    label: 'Tips',
    paragraphs: [
      '如果内容节点会动态增删，优先通过 useContentNavSource 统一维护 source 和 target 绑定。',
      '这样目录项、滚动定位和激活态能始终保持一致。',
    ],
  },
]

const scrollContainerRef = ref<HTMLElement | null>(null)
const items = computed(() =>
  sections.map((section) => ({
    id: section.id,
    label: section.label,
    searchText: `${section.label} ${section.paragraphs.join(' ')}`,
  })),
)
const { source, bindTarget } = useContentNavSource({ items })
</script>

<style lang="less" scoped>
.demo {
  display: grid;
}

.stage {
  position: relative;
  height: 420px;
  overflow: hidden;
  border: 1px solid #dfe7f2;
  border-radius: 12px;
  background: #fff;
}

.article {
  height: 100%;
  overflow: auto;
  padding: 28px 88px 28px 28px;
}

.article-section {
  padding: 0 0 28px;
  scroll-margin-top: 16px;
}

.article-section + .article-section {
  border-top: 1px solid #eef3f8;
  padding-top: 28px;
}

.article-section h4 {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.4;
}

.article-section p {
  margin: 0;
  color: #4f647a;
  line-height: 1.7;
}

.article-section p + p {
  margin-top: 10px;
}

.nav {
  top: 0;
  right: 16px;
}
</style>
