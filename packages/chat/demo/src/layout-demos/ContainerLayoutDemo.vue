<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Chat } from '@/index'
import type { ChatAsideConfig } from '@/types/layout'

const leftExpanded = shallowRef(false)
const rightExpanded = shallowRef(false)

const leftAside = computed<ChatAsideConfig>(() => ({
  layoutMode: 'drawer',
  expanded: leftExpanded.value,
  expandedWidth: 280,
}))

const rightAside = computed<ChatAsideConfig>(() => ({
  layoutMode: 'drawer',
  expanded: rightExpanded.value,
  expandedWidth: 320,
}))

function handleLeftAsideUpdate(nextConfig?: ChatAsideConfig): void {
  leftExpanded.value = nextConfig?.expanded ?? false
}

function handleRightAsideUpdate(nextConfig?: ChatAsideConfig): void {
  rightExpanded.value = nextConfig?.expanded ?? false
}
</script>

<template>
  <div class="container-layout-demo">
    <div class="container-layout-demo__shell">
      <div class="container-layout-demo__frame">
        <Chat.Layout
          class="container-layout-demo__layout"
          :left-aside="leftAside"
          :right-aside="rightAside"
          @update:left-aside="handleLeftAsideUpdate"
          @update:right-aside="handleRightAsideUpdate"
        >
          <template #left-aside>
            <Chat.Aside placement="left" class="container-layout-demo__panel">
              <div class="container-layout-demo__panel-header">
                <strong>Left drawer</strong>
                <Chat.AsideToggle placement="left" class="container-layout-demo__icon-button"> Close </Chat.AsideToggle>
              </div>
              <div class="container-layout-demo__panel-body">
                <button type="button">会话列表</button>
                <button type="button">工作台</button>
                <button type="button">知识库</button>
              </div>
            </Chat.Aside>
          </template>

          <template #header>
            <Chat.Header>
              <div class="container-layout-demo__header">
                <Chat.AsideToggle placement="left" class="container-layout-demo__icon-button"> Left </Chat.AsideToggle>
                <strong>Container Preview</strong>
                <Chat.AsideToggle placement="right" class="container-layout-demo__icon-button">
                  Right
                </Chat.AsideToggle>
              </div>
            </Chat.Header>
          </template>

          <template #main>
            <Chat.Main>
              <div class="container-layout-demo__main">
                <p class="container-layout-demo__eyebrow">Container Scoped</p>
                <h2>TinyRobot</h2>
                <p>验证左右 drawer 在相对容器内展开，不脱离当前布局容器。</p>
                <div class="container-layout-demo__cards">
                  <article v-for="item in 4" :key="item" class="container-layout-demo__card">
                    <strong>场景 {{ item }}</strong>
                    <p>这里用于观察容器内抽屉、遮罩和内容区的层级关系。</p>
                  </article>
                </div>
              </div>
            </Chat.Main>
          </template>

          <template #footer>
            <Chat.Footer>
              <div class="container-layout-demo__footer">
                <input type="text" placeholder="请输入您的问题" />
                <button type="button">发送</button>
              </div>
            </Chat.Footer>
          </template>

          <template #right-aside>
            <Chat.Aside placement="right" class="container-layout-demo__panel">
              <div class="container-layout-demo__panel-header">
                <strong>Right drawer</strong>
                <Chat.AsideToggle placement="right" class="container-layout-demo__icon-button">
                  Close
                </Chat.AsideToggle>
              </div>
              <div class="container-layout-demo__panel-body">
                <button type="button">快捷操作</button>
                <button type="button">附件参考</button>
                <button type="button">面板设置</button>
              </div>
            </Chat.Aside>
          </template>
        </Chat.Layout>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-layout-demo {
  min-height: 100%;
  padding: 36px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.container-layout-demo__shell {
  max-width: 1280px;
  margin: 0 auto;
}

.container-layout-demo__frame {
  width: min(1120px, 100%);
  height: min(760px, calc(100vh - 72px));
  margin: 0 auto;
  border: 1px solid #dbe3f0;
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12);
}

.container-layout-demo__layout {
  --tr-chat-layout-height: 100%;
  --tr-chat-layout-content-max-width: none;
  --tr-chat-layout-left-bg: #ffffff;
  --tr-chat-layout-right-bg: #ffffff;
  --tr-chat-layout-header-bg: #ffffff;
  --tr-chat-layout-footer-bg: #ffffff;
  --tr-chat-layout-divider-color: #e5e7eb;
  --tr-chat-layout-header-padding-inline: 24px;
  --tr-chat-layout-main-padding-inline: 24px;
  --tr-chat-layout-footer-padding-inline: 24px;
  --tr-chat-layout-inner-padding-block: 18px;
  --tr-chat-layout-panel-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.container-layout-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
}

.container-layout-demo__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  min-height: 36px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
}

.container-layout-demo__main {
  min-height: 100%;
  padding: 12px 0 24px;
}

.container-layout-demo__eyebrow {
  margin: 0;
  color: #4f67ff;
  font-size: 13px;
  font-weight: 600;
}

.container-layout-demo__main h2 {
  margin: 16px 0 10px;
  font-size: 52px;
  line-height: 1.05;
}

.container-layout-demo__main > p {
  margin: 0;
  max-width: 720px;
  color: #475569;
  font-size: 18px;
  line-height: 1.6;
}

.container-layout-demo__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 28px;
}

.container-layout-demo__card {
  padding: 22px 24px;
  border-radius: 20px;
  background: #f8fafc;
}

.container-layout-demo__card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 18px;
}

.container-layout-demo__card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.container-layout-demo__footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.container-layout-demo__footer input {
  min-width: 0;
  min-height: 52px;
  padding: 0 18px;
  border: 1px solid #dbe3f0;
  border-radius: 999px;
  font-size: 15px;
}

.container-layout-demo__footer button {
  min-width: 92px;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: #315efb;
  color: #ffffff;
  font-size: 15px;
}

.container-layout-demo__panel {
  height: 100%;
  padding: 22px 18px 18px;
  background: #ffffff;
}

.container-layout-demo__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.container-layout-demo__panel-body {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.container-layout-demo__panel-body button {
  min-height: 44px;
  border: 1px solid #dbe3f0;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  padding: 0 14px;
}

@media (max-width: 959px) {
  .container-layout-demo {
    padding: 12px;
  }

  .container-layout-demo__frame {
    width: 100%;
    height: calc(100vh - 24px);
    border-radius: 18px;
  }

  .container-layout-demo__layout {
    --tr-chat-layout-header-padding-inline: 16px;
    --tr-chat-layout-main-padding-inline: 16px;
    --tr-chat-layout-footer-padding-inline: 16px;
  }

  .container-layout-demo__header {
    min-height: 48px;
  }

  .container-layout-demo__main h2 {
    font-size: 36px;
  }

  .container-layout-demo__cards {
    grid-template-columns: 1fr;
  }

  .container-layout-demo__footer {
    grid-template-columns: 1fr;
  }
}
</style>
