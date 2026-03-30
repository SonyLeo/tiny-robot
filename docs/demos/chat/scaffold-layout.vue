<template>
  <div class="chat-demo-container">
    <TrChat.Scaffold :config="chatConfig" :runtime="{ chatKit }" v-slot="{ chatKit: runtime, presetSlices }">
      <TrChat.Layout>
        <div class="scaffold-banner">自定义结构仍然沿用 config -> adapter -> preset 主链。</div>
        <TrChat.Header v-bind="presetSlices.header" />

        <TrChat.Welcome
          v-if="runtime.messages.value.length === 0 && presetSlices.welcome"
          v-bind="presetSlices.welcome"
          @prompt-click="runtime.sendMessage($event)"
        />

        <TrChat.MessageList v-else v-bind="presetSlices.messageList" />

        <TrChat.Footer>
          <template #extra>
            <div class="scaffold-footer-tip">这里是页面自己决定的 footer extra。</div>
          </template>
          <TrChat.Sender v-bind="presetSlices.sender" />
        </TrChat.Footer>
      </TrChat.Layout>
    </TrChat.Scaffold>
  </div>
</template>

<script setup lang="ts">
import { TrChat, useChatKit } from '@opentiny/tiny-robot-chat'
import { createDemoChatConfig, createMockResponseProvider } from './shared'

const chatConfig = createDemoChatConfig({
  ui: {
    brand: {
      title: 'Scaffold 布局示例',
    },
    welcome: {
      title: '保留 preset 主链，自定义页面结构',
      description: '你可以自己控制 banner、header、welcome 和 footer 的排布。',
    },
  },
})

const chatKit = useChatKit({
  responseProvider: createMockResponseProvider('Scaffold'),
})
</script>

<style scoped>
.chat-demo-container {
  height: 600px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tr-border-color-default, #e5e6eb);
  border-radius: 12px;
}

.scaffold-banner {
  padding: 12px 16px 0;
  color: #175cd3;
  font-size: 13px;
}

.scaffold-footer-tip {
  padding: 8px 12px 0;
  color: #475467;
  font-size: 12px;
}
</style>
