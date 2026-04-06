<template>
  <section class="demo">
    <div class="controls">
      <div class="placement">
        <span>停靠位置</span>
        <label>
          <input v-model="placement" type="radio" value="left" />
          左侧
        </label>
        <label>
          <input v-model="placement" type="radio" value="right" />
          右侧
        </label>
      </div>

      <label>
        <input v-model="searchEnabled" type="checkbox" />
        显示搜索区
      </label>
    </div>

    <div class="stage">
      <div ref="scrollContainerRef" class="scroll-area">
        <div class="content">
          <section
            v-for="section in sections"
            :key="section.id"
            :ref="(el) => registerAnchor(section.id, el as HTMLElement | null)"
            class="section"
          >
            <tr-bubble v-if="section.prompt" class="prompt" role="user" placement="end" :content="section.prompt" />

            <h4>{{ section.title }}</h4>
            <p>{{ section.content }}</p>
          </section>
        </div>
      </div>

      <tr-content-nav
        :class="['nav', `is-${placement}`]"
        :items="items"
        :registry="registry"
        :scroll-container="scrollContainerRef"
        :placement="placement"
        :search="search"
        mobile-behavior="inline"
        v-model:expanded="expanded"
        v-model:query="query"
        v-model:active-id="activeId"
        aria-label="阅读内容目录导航"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrBubble, TrContentNav, useContentNavRegistry } from '@opentiny/tiny-robot'

type Section = {
  id: string
  title: string
  content: string
  prompt?: string
}

const sections: Section[] = [
  {
    id: 'overview',
    title: '项目概览',
    content: '这是一段简单正文，用来演示目录项和滚动内容之间的联动。',
  },
  {
    id: 'scope',
    title: '功能范围',
    content: '点击目录项后，内容区会滚动到对应位置，当前项也会随滚动同步更新。',
  },
  {
    id: 'question',
    title: '用户提问后的内容',
    prompt: '请给我一个简洁的目录导航示例。',
    content: '这里保留一个 Bubble，用来展示它和正文目录一起使用时的典型场景。',
  },
]

const registry = useContentNavRegistry()
const scrollContainerRef = ref<HTMLElement | null>(null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(sections[0].id)
const expanded = ref(false)
const query = ref('')
const searchEnabled = ref(false)

const items = sections.map((section) => ({
  id: section.id,
  label: section.title,
  searchText: section.content,
}))

const search = computed(() => (searchEnabled.value ? { placeholder: '搜索目录' } : false))

function registerAnchor(id: string, el: HTMLElement | null) {
  registry.register(id, el)
}
</script>

<style lang="less" scoped>
.demo {
  display: grid;
  gap: 16px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 13px;

  .placement,
  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.stage {
  position: relative;
  height: 460px;
  overflow: hidden;
  border: 1px solid #dfe7f2;
  border-radius: 12px;
  background: #fff;
}

.scroll-area {
  height: 100%;
  overflow: auto;
}

.content {
  width: min(640px, calc(100% - 96px));
  margin: 0 auto;
  padding: 24px 0 40px;
}

.section {
  scroll-margin-top: 92px;

  & + & {
    margin-top: 28px;
  }

  h4,
  p {
    margin: 0;
  }

  h4 {
    margin-bottom: 10px;
    font-size: 17px;
  }

  p {
    line-height: 1.8;
  }
}

.prompt {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  --tr-bubble-max-width: 420px;
}

.nav {
  top: 0;

  &.is-right {
    right: 16px;
  }

  &.is-left {
    left: 16px;
  }
}
</style>
