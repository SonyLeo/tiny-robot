<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Chat } from '@/index'

function createRangeModel(initialValue: number, min: number, max: number) {
  const source = shallowRef(initialValue)

  return computed({
    get: () => source.value,
    set: (nextValue: number | string) => {
      const normalized = typeof nextValue === 'number' ? nextValue : Number(nextValue)
      const safeValue = Number.isFinite(normalized) ? normalized : initialValue
      source.value = Math.min(max, Math.max(min, safeValue))
    },
  })
}

const leftPanelWidth = createRangeModel(300, 220, 420)
const leftRailWidth = createRangeModel(48, 0, 96)
const rightPanelWidth = createRangeModel(320, 260, 420)
</script>

<template>
  <Chat.Root :default-right-panel-open="true">
    <Chat.Layout
      :left-panel-width="leftPanelWidth"
      :left-rail-width="leftRailWidth"
      :right-panel-width="rightPanelWidth"
      :content-max-width="960"
    >
      <template #left-panel>
        <Chat.LeftPanel>
          <template #default="{ collapsed }">
            <div class="demo-panel">
              <div class="demo-panel__brand" :class="{ 'demo-panel__brand--collapsed': collapsed }">
                <span class="demo-panel__badge">TR</span>
                <span v-if="!collapsed">Tiny Robot</span>
              </div>
              <button class="demo-panel__primary">
                <span>+</span>
                <span v-if="!collapsed">新建会话</span>
              </button>
              <nav class="demo-panel__nav">
                <button class="demo-panel__item">会话 A</button>
                <button class="demo-panel__item">会话 B</button>
                <button class="demo-panel__item">会话 C</button>
              </nav>
            </div>
          </template>

          <template #rail>
            <div class="demo-rail">
              <span class="demo-panel__badge">TR</span>
              <button class="demo-rail__button">+</button>
              <button class="demo-rail__button">A</button>
              <button class="demo-rail__button">B</button>
              <button class="demo-rail__button">C</button>
            </div>
          </template>
        </Chat.LeftPanel>
      </template>

      <template #header>
        <Chat.Header>
          <div class="demo-header">
            <div class="demo-header__side">
              <Chat.LeftPanelToggle />
            </div>
            <div class="demo-header__title">
              <strong>AI Layout Stage 1</strong>
              <span>纯布局层示例</span>
            </div>
            <div class="demo-header__side demo-header__side--end">
              <Chat.RightPanelToggle />
            </div>
          </div>
        </Chat.Header>
      </template>

      <template #main>
        <Chat.Main>
          <div class="demo-main">
            <section class="demo-card">
              <h2>布局参数</h2>
              <label class="demo-range">
                <span>左侧展开宽度：{{ leftPanelWidth }}px</span>
                <input v-model.number="leftPanelWidth" type="range" min="220" max="420" />
              </label>
              <label class="demo-range">
                <span>左侧 rail 宽度：{{ leftRailWidth }}px</span>
                <input v-model.number="leftRailWidth" type="range" min="0" max="96" />
              </label>
              <label class="demo-range">
                <span>右侧宽度：{{ rightPanelWidth }}px</span>
                <input v-model.number="rightPanelWidth" type="range" min="260" max="420" />
              </label>
            </section>

            <section class="demo-card">
              <h2>主内容区</h2>
              <p>
                这里模拟阶段二会承载的消息区。当前版本只验证 header / main / footer、左右区域和移动端抽屉/覆盖层行为。
              </p>
              <div class="demo-message-list">
                <article
                  v-for="index in 10"
                  :key="index"
                  class="demo-message"
                  :class="{ 'demo-message--accent': index % 2 === 0 }"
                >
                  <strong>消息 {{ index }}</strong>
                  <p>主滚动根在 ChatMain，footer 保持在底部区域，左右区域由 ChatLayout 统一控宽。</p>
                </article>
              </div>
            </section>
          </div>
        </Chat.Main>
      </template>

      <template #footer>
        <Chat.Footer>
          <div class="demo-footer">
            <input class="demo-footer__input" type="text" placeholder="这里是输入区占位" />
            <button class="demo-footer__send">发送</button>
          </div>
        </Chat.Footer>
      </template>

      <template #right-panel>
        <Chat.RightPanel>
          <div class="demo-right-panel">
            <h3>扩展区域</h3>
            <p>desktop 下它是固定右列，mobile 下会从右向左全屏展开。</p>
            <button class="demo-right-panel__button">工具 1</button>
            <button class="demo-right-panel__button">工具 2</button>
            <button class="demo-right-panel__button">工具 3</button>
          </div>
        </Chat.RightPanel>
      </template>
    </Chat.Layout>
  </Chat.Root>
</template>

<style scoped>
.demo-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
}

.demo-header__side {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-header__side--end {
  justify-content: flex-end;
}

.demo-header__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.demo-header__title span {
  color: #4b5563;
  font-size: 13px;
}

.demo-main {
  display: grid;
  gap: 16px;
}

.demo-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #dbe1ea;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.demo-card h2 {
  margin: 0;
  font-size: 18px;
}

.demo-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.demo-range {
  display: grid;
  gap: 8px;
}

.demo-message-list {
  display: grid;
  gap: 12px;
}

.demo-message {
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.demo-message--accent {
  background: #e0f2fe;
}

.demo-message strong,
.demo-message p {
  display: block;
}

.demo-message p {
  margin-top: 6px;
}

.demo-panel {
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 16px;
  height: 100%;
  padding: 20px 14px;
}

.demo-panel__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.demo-panel__brand--collapsed {
  justify-content: center;
}

.demo-panel__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
}

.demo-panel__primary,
.demo-panel__item,
.demo-right-panel__button,
.demo-rail__button {
  border: 0;
  cursor: pointer;
}

.demo-panel__primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
}

.demo-panel__nav {
  display: grid;
  align-content: start;
  gap: 8px;
}

.demo-panel__item {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  background: transparent;
  text-align: left;
}

.demo-panel__item:hover,
.demo-right-panel__button:hover,
.demo-rail__button:hover {
  background: rgba(15, 23, 42, 0.06);
}

.demo-rail {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 12px;
  height: 100%;
  padding: 20px 8px;
}

.demo-rail__button {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: transparent;
}

.demo-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.demo-footer__input {
  min-width: 0;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #dbe1ea;
  border-radius: 14px;
}

.demo-footer__send {
  min-width: 88px;
  min-height: 44px;
  border: 0;
  border-radius: 14px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}

.demo-right-panel {
  display: grid;
  align-content: start;
  gap: 12px;
  height: 100%;
  padding: 20px;
}

.demo-right-panel h3,
.demo-right-panel p {
  margin: 0;
}

.demo-right-panel p {
  color: #4b5563;
  line-height: 1.6;
}

.demo-right-panel__button {
  min-height: 40px;
  border-radius: 12px;
  background: transparent;
  text-align: left;
}

@media (max-width: 959px) {
  .demo-header__title {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
