<script setup lang="ts">
import { shallowRef } from 'vue'
import { Chat } from '@/index'
import type { ChatDetachedBounds, ChatSurfaceMode } from '@/types/layout'

const surfaceMode = shallowRef<ChatSurfaceMode>('detached')
const detachedBounds = shallowRef<ChatDetachedBounds>({
  width: 440,
  height: '78vh',
})
</script>

<template>
  <div class="surface-layout-demo">
    <Chat.Layout
      v-model:surface-mode="surfaceMode"
      v-model:detached-bounds="detachedBounds"
      class="surface-layout-demo__layout"
      detached-draggable
      detached-resizable
      :min-detached-width="320"
      :max-detached-width="720"
    >
      <template #header>
        <div class="surface-layout-demo__header">
          <div class="surface-layout-demo__modes">
            <button
              type="button"
              :class="{ 'is-active': surfaceMode === 'embedded' }"
              @click="surfaceMode = 'embedded'"
            >
              Embedded
            </button>
            <button
              type="button"
              :class="{ 'is-active': surfaceMode === 'detached' }"
              @click="surfaceMode = 'detached'"
            >
              Detached
            </button>
          </div>
          <span>Surface</span>
        </div>
      </template>

      <template #main>
        <Chat.Main>
          <div class="surface-layout-demo__main">
            <p class="surface-layout-demo__eyebrow">Top-Level Surface</p>
            <h2>TinyRobot</h2>
            <p>当前 demo 只保留 Embedded / Detached 两态，聚焦顶层承载方式与 detached 的拖拽改宽交互。</p>

            <div class="surface-layout-demo__cards">
              <article v-for="item in 4" :key="item" class="surface-layout-demo__card">
                <strong>能力 {{ item }}</strong>
                <p>切换 `Embedded / Detached`，观察顶层承载形态变化与 detached 交互边界。</p>
              </article>
            </div>
          </div>
        </Chat.Main>
      </template>

      <template #footer>
        <div class="surface-layout-demo__footer">
          <input type="text" placeholder="输入问题，观察 Embedded / Detached 下的布局表现" />
          <button type="button">发送</button>
        </div>
      </template>
    </Chat.Layout>
  </div>
</template>

<style scoped>
.surface-layout-demo {
  min-height: 100%;
  background:
    radial-gradient(circle at top, rgba(97, 140, 255, 0.16), transparent 38%),
    linear-gradient(180deg, #f8fafc 0%, #eef3ff 100%);
}

.surface-layout-demo__layout {
  --tr-chat-layout-content-max-width: 980px;
  --tr-chat-layout-header-bg: rgba(255, 255, 255, 0.94);
  --tr-chat-layout-footer-bg: rgba(255, 255, 255, 0.94);
  --tr-chat-layout-main-bg: rgba(255, 255, 255, 0.96);
  --tr-chat-layout-divider-color: #e2e8f0;
  --tr-chat-layout-inner-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 18px;
  --tr-chat-surface-radius: 28px;
}

.surface-layout-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
}

.surface-layout-demo__modes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.surface-layout-demo__modes button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  cursor: pointer;
}

.surface-layout-demo__modes button.is-active {
  border-color: #355dff;
  background: #eef3ff;
  color: #355dff;
}

.surface-layout-demo__main {
  min-height: 100%;
  padding: 8px 0 24px;
}

.surface-layout-demo__eyebrow {
  margin: 0;
  color: #4f67ff;
  font-size: 13px;
  font-weight: 600;
}

.surface-layout-demo__main h2 {
  margin: 14px 0 10px;
  font-size: 52px;
  line-height: 1.05;
}

.surface-layout-demo__main > p {
  margin: 0;
  max-width: 680px;
  color: #475569;
  font-size: 18px;
  line-height: 1.6;
}

.surface-layout-demo__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 28px;
}

.surface-layout-demo__card {
  padding: 22px 24px;
  border-radius: 20px;
  background: #f8fafc;
}

.surface-layout-demo__card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 18px;
}

.surface-layout-demo__card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.surface-layout-demo__footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.surface-layout-demo__footer input {
  min-width: 0;
  min-height: 52px;
  padding: 0 18px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  font-size: 15px;
}

.surface-layout-demo__footer button {
  min-width: 92px;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: #315efb;
  color: #ffffff;
  font-size: 15px;
}

@media (max-width: 959px) {
  .surface-layout-demo__layout {
    --tr-chat-layout-inner-padding-inline: 16px;
  }

  .surface-layout-demo__header {
    min-height: 48px;
    align-items: flex-start;
    flex-direction: column;
  }

  .surface-layout-demo__modes {
    flex-wrap: wrap;
  }

  .surface-layout-demo__main h2 {
    font-size: 36px;
  }

  .surface-layout-demo__cards {
    grid-template-columns: 1fr;
  }

  .surface-layout-demo__footer {
    grid-template-columns: 1fr;
  }
}
</style>
