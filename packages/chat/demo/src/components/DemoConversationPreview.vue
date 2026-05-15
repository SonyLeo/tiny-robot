<script setup lang="ts">
import { IconAi, IconCopy, IconRefresh } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <section class="demo-card demo-card--chat">
    <div class="demo-conversation">
      <div class="demo-conversation__message">
        <div class="demo-conversation__avatar">
          <IconAi class="demo-logo" />
        </div>

        <div class="demo-conversation__content">
          <div class="demo-conversation__bubble">
            你拥有 runtime，TrChat.Page 负责页面编排。试试点击上方“更多”按钮。
          </div>

          <div class="demo-conversation__actions">
            <button class="demo-icon-button" type="button" aria-label="复制消息">
              <IconCopy class="demo-icon-glyph" />
            </button>
            <button class="demo-icon-button" type="button" aria-label="重新生成">
              <IconRefresh class="demo-icon-glyph" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #dbe1ea;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.demo-card--chat {
  min-height: 420px;
  align-content: start;
}

.demo-conversation {
  display: grid;
  align-content: start;
}

.demo-conversation__message {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.demo-conversation__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.demo-conversation__content {
  display: grid;
  gap: 8px;
}

.demo-conversation__bubble {
  max-width: 540px;
  padding: 14px 16px;
  border: 1px solid #dbe1ea;
  border-radius: 20px;
  background: #ffffff;
  line-height: 1.7;
}

.demo-conversation__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.demo-logo {
  flex: none;
  font-size: 24px;
}

@media (max-width: 959px) {
  .demo-card--chat {
    min-height: 320px;
  }

  .demo-conversation__bubble {
    max-width: none;
  }
}
</style>
