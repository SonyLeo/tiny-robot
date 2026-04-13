<template>
  <section class="demo">
    <div class="controls">
      <span class="controls-title">展开模式</span>

      <label>
        <input v-model="expandTrigger" type="radio" value="hover" />
        hover
      </label>

      <label>
        <input v-model="expandTrigger" type="radio" value="manual" />
        manual
      </label>

      <template v-if="isManualMode">
        <span class="controls-divider" aria-hidden="true"></span>

        <label>
          <input v-model="expanded" type="checkbox" />
          展开目录面板
        </label>

        <button type="button" @click="expanded = false">收起</button>
        <button type="button" @click="expanded = true">展开</button>
      </template>
    </div>

    <p class="tip">
      <template v-if="isManualMode">
        当前为 <code>manual</code> 模式，目录面板不再跟随 hover 自动展开，改由外部 <code>v-model:expanded</code> 控制。
      </template>
      <template v-else> 当前为 <code>hover</code> 模式，鼠标悬浮或聚焦到目录面板时会自动展开。 </template>
    </p>

    <div class="stage">
      <div ref="scrollContainerRef" class="article">
        <section
          v-for="section in sections"
          :key="section.id"
          :data-content-nav-id="section.id"
          class="article-section"
        >
          <h4>{{ section.label }}</h4>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </section>
      </div>

      <tr-content-nav
        class="nav"
        :items="items"
        :scroll-container="scrollContainerRef"
        :expand-trigger="expandTrigger"
        v-model:expanded="expanded"
        :search="{ placeholder: '搜索章节' }"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrContentNav } from '@opentiny/tiny-robot'

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
      '推荐直接让章节节点带上 data-content-nav-id，并与目录项 id 保持一致。',
      '这样目录项、滚动定位和激活态可以由 TrContentNav 在内部统一处理。',
    ],
  },
]

const scrollContainerRef = ref<HTMLElement | null>(null)
const expandTrigger = ref<'hover' | 'manual'>('hover')
const expanded = ref(false)
const isManualMode = computed(() => expandTrigger.value === 'manual')
const items = computed(() =>
  sections.map((section) => ({
    id: section.id,
    label: section.label,
    searchText: `${section.label} ${section.paragraphs.join(' ')}`,
  })),
)
</script>

<style lang="less" scoped>
.demo {
  display: grid;
  gap: 14px;
}

.controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.controls-title {
  color: #34495e;
  font-size: 13px;
  font-weight: 600;
}

.controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4f647a;
  font-size: 13px;
}

.controls-divider {
  width: 1px;
  height: 16px;
  background: #d7e1ec;
}

.controls button {
  padding: 4px 10px;
}

.tip {
  margin: 0;
  color: #4f647a;
  font-size: 13px;
  line-height: 1.6;
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
