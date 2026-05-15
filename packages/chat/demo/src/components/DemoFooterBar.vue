<script setup lang="ts">
import { Chat } from '@/index'
</script>

<template>
  <Chat.Footer>
    <div class="demo-footer">
      <input class="demo-footer__input" type="text" placeholder="向 TinyRobot 提问..." />
      <button class="demo-footer__send" type="button">发送</button>
    </div>
  </Chat.Footer>
</template>

<style scoped>
.demo-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.demo-footer__input {
  min-width: 0;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #dbe1ea;
  border-radius: 16px;
  background: #ffffff;
}

.demo-footer__send {
  min-width: 88px;
  min-height: 46px;
  border: 0;
  border-radius: 16px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}
</style>
