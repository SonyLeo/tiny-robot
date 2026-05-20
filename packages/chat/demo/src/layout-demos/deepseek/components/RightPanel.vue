<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { Chat } from '@/index'

const isMobile = useMediaQuery('(max-width: 959px)')
</script>

<template>
  <Chat.Aside placement="right">
    <div class="deepseek-right-panel">
      <div class="deepseek-right-panel__header">
        <div>
          <p class="deepseek-right-panel__eyebrow">Workspace</p>
          <h2>Quick tools</h2>
        </div>

        <Chat.AsideToggle
          placement="right"
          class="deepseek-right-panel__close"
          :aria-label="isMobile ? 'Close panel' : 'Hide panel'"
        >
          {{ isMobile ? 'Done' : 'Hide' }}
        </Chat.AsideToggle>
      </div>

      <div class="deepseek-right-panel__body">
        <section class="deepseek-right-panel__section">
          <h3>Follow-up</h3>
          <button class="deepseek-right-panel__item" type="button">Ask for concise phrasing</button>
          <button class="deepseek-right-panel__item" type="button">Convert into email tone</button>
          <button class="deepseek-right-panel__item" type="button">Add more examples</button>
        </section>

        <section class="deepseek-right-panel__section">
          <h3>Reference</h3>
          <p>Use this side panel to validate the desktop dock and mobile drawer behavior.</p>
        </section>
      </div>
    </div>
  </Chat.Aside>
</template>

<style scoped>
.deepseek-right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px 18px 20px;
  background: #ffffff;
}

.deepseek-right-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.deepseek-right-panel__header h2,
.deepseek-right-panel__header p,
.deepseek-right-panel__section h3,
.deepseek-right-panel__section p {
  margin: 0;
}

.deepseek-right-panel__eyebrow {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.deepseek-right-panel__header h2 {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.deepseek-right-panel__close {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid #dde3ef;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
}

.deepseek-right-panel__body {
  display: grid;
  gap: 20px;
  margin-top: 24px;
}

.deepseek-right-panel__section {
  display: grid;
  gap: 10px;
}

.deepseek-right-panel__section h3 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.deepseek-right-panel__section p {
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
}

.deepseek-right-panel__item {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  font-size: 14px;
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}

.deepseek-right-panel__item:hover {
  border-color: #c9d7ff;
  background: #f8fbff;
}

@media (max-width: 959px) {
  .deepseek-right-panel {
    padding-top: max(18px, env(safe-area-inset-top));
    padding-bottom: max(22px, env(safe-area-inset-bottom));
  }
}
</style>
