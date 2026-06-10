<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideProps, LayoutAsideValue } from '@opentiny/tiny-robot'

function createLeftAside(): LayoutAsideProps {
  return {
    open: true,
    expandedWidth: 240,
    minExpandedWidth: 180,
    maxExpandedWidth: 360,
    resizable: true,
  }
}

function createLeftAsideValue(): LayoutAsideValue {
  return {
    open: true,
    expandedWidth: 240,
  }
}

const leftAside = ref<LayoutAsideProps>(createLeftAside())
const writebackEnabled = ref(true)
const lastAsideValue = ref<LayoutAsideValue>(createLeftAsideValue())

const leftAsideText = computed(() => JSON.stringify(leftAside.value, null, 2))
const lastAsideText = computed(() => JSON.stringify(lastAsideValue.value, null, 2))

function updateLeftAside(nextAside: LayoutAsideValue) {
  lastAsideValue.value = nextAside

  if (writebackEnabled.value) {
    leftAside.value = {
      ...leftAside.value,
      ...nextAside,
    }
  }
}

function reset() {
  leftAside.value = createLeftAside()
  lastAsideValue.value = createLeftAsideValue()
}
</script>

<template>
  <div class="layout-aside-controlled-demo">
    <div class="layout-aside-controlled-demo__toolbar">
      <button type="button" class="layout-aside-controlled-demo__button" @click="writebackEnabled = !writebackEnabled">
        {{ writebackEnabled ? '关闭回写' : '开启回写' }}
      </button>
      <button type="button" class="layout-aside-controlled-demo__button" @click="reset">重置</button>
      <span class="layout-aside-controlled-demo__hint">
        {{ writebackEnabled ? '当前会回写 update:leftAside。' : '当前不回写，拖拽后宽度不会生效。' }}
      </span>
    </div>

    <TrLayout class="layout-aside-controlled-demo__layout" :left-aside="leftAside" @update:leftAside="updateLeftAside">
      <template #left-aside="{ open, expandedWidth, setOpen, setExpandedWidth }">
        <div class="layout-aside-controlled-demo__aside">
          <div class="layout-aside-controlled-demo__title">受控左侧栏</div>
          <div>open: {{ open }}</div>
          <div>expandedWidth: {{ expandedWidth ?? '-' }}</div>

          <div class="layout-aside-controlled-demo__group">
            <button type="button" class="layout-aside-controlled-demo__button" @click="setOpen(!open)">
              {{ open ? '收起' : '展开' }}
            </button>
            <button type="button" class="layout-aside-controlled-demo__button" @click="setExpandedWidth(220)">
              220
            </button>
            <button type="button" class="layout-aside-controlled-demo__button" @click="setExpandedWidth(280)">
              280
            </button>
            <button type="button" class="layout-aside-controlled-demo__button" @click="setExpandedWidth(320)">
              320
            </button>
          </div>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-controlled-demo__main">
          <p>拖动左侧分隔线，或点击侧栏按钮修改宽度。</p>
          <p>`update:leftAside` 只回传 `open` 和 `expandedWidth`，受控时需要外部自己合并回 props。</p>

          <div class="layout-aside-controlled-demo__json-grid">
            <div class="layout-aside-controlled-demo__card">
              <div class="layout-aside-controlled-demo__card-title">leftAside prop</div>
              <pre>{{ leftAsideText }}</pre>
            </div>

            <div class="layout-aside-controlled-demo__card">
              <div class="layout-aside-controlled-demo__card-title">last emitted</div>
              <pre>{{ lastAsideText }}</pre>
            </div>
          </div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-controlled-demo {
  display: grid;
  gap: 12px;
}

.layout-aside-controlled-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-aside-controlled-demo__layout {
  --tr-layout-height: 100%;
  --tr-layout-content-max-width: none;
  --tr-layout-inner-padding-inline: 0;
  --tr-layout-inner-padding-block: 0;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 420px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-controlled-demo__aside,
.layout-aside-controlled-demo__main {
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
}

.layout-aside-controlled-demo__title,
.layout-aside-controlled-demo__card-title {
  font-weight: 600;
}

.layout-aside-controlled-demo__group,
.layout-aside-controlled-demo__json-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-aside-controlled-demo__json-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.layout-aside-controlled-demo__button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
  cursor: pointer;
}

.layout-aside-controlled-demo__hint,
.layout-aside-controlled-demo__main p {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-controlled-demo__main p {
  margin: 0;
}

.layout-aside-controlled-demo__card {
  padding: 12px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
}

.layout-aside-controlled-demo__card pre {
  margin: 8px 0 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
}
</style>
