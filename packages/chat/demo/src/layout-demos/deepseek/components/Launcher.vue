<script setup lang="ts">
import { Chat } from '@/index'
import { useChatAside } from '@/composables/useChatAside'
import { IconLogo, IconMenuExpand, IconNewSession, IconSearch } from '@opentiny/tiny-robot-svgs'

const { isMobile, state } = useChatAside('left')
</script>

<template>
  <Transition name="deepseek-launcher-fade">
    <div v-if="!isMobile && state === 'hidden'" class="deepseek-launcher">
      <span class="deepseek-launcher__mark">
        <IconLogo />
      </span>

      <div class="deepseek-launcher__actions">
        <Chat.AsideToggle side="left" class="deepseek-launcher__action" aria-label="Expand sidebar">
          <IconMenuExpand />
        </Chat.AsideToggle>
        <button class="deepseek-launcher__action" type="button">
          <IconSearch />
        </button>
        <button class="deepseek-launcher__action" type="button">
          <IconNewSession />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.deepseek-launcher-fade-enter-active,
.deepseek-launcher-fade-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.deepseek-launcher-fade-enter-from,
.deepseek-launcher-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.deepseek-launcher {
  position: fixed;
  top: max(16px, env(safe-area-inset-top));
  left: max(16px, env(safe-area-inset-left));
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 14px;
}

.deepseek-launcher__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #4f67ff;
  font-size: 32px;
}

.deepseek-launcher__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 44px;
  padding: 0 8px;
  border: 1px solid #dfe5f2;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(18px);
}

.deepseek-launcher__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #475569;
}

.deepseek-launcher__action :deep(svg) {
  font-size: 16px;
}

@media (max-width: 959px) {
  .deepseek-launcher {
    display: none;
  }
}
</style>
