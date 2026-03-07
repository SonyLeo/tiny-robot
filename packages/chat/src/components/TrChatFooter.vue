<template>
  <div class="tr-chat__footer">
    <div class="tr-chat__footer-inner">
      <!-- 输入框上方自定义区域（pills、工具栏等） -->
      <div v-if="$slots.extra" class="tr-chat__footer-extra">
        <slot name="extra" />
      </div>
      <!-- 默认放置 TrChatSender -->
      <slot />
    </div>
  </div>
</template>
