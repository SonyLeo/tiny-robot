<template>
  <div class="layout-assistant-demo__footer">
    <div class="layout-assistant-demo__hint">消息中包含“搜索 / MCP / 工具 / 查询”等关键词时，可模拟工具调用链路。</div>
    <div class="layout-assistant-demo__pills">
      <TrSuggestionPopover
        class="layout-assistant-demo__popover"
        :data="context.popoverData"
        @item-click="context.handlePopoverItemClick"
      >
        <template #trigger>
          <TrSuggestionPillButton>
            <template #icon>
              <IconSparkles class="layout-assistant-demo__sparkles" />
            </template>
          </TrSuggestionPillButton>
        </template>
      </TrSuggestionPopover>

      <TrSuggestionPills class="layout-assistant-demo__pill-row">
        <TrDropdownMenu
          v-for="(item, index) in context.pillItems"
          :key="index"
          :items="item.menu.items"
          trigger="click"
          @item-click="item.menu.onItemClick"
        >
          <template #trigger>
            <TrSuggestionPillButton>{{ item.text }}</TrSuggestionPillButton>
          </template>
        </TrDropdownMenu>
      </TrSuggestionPills>
    </div>

    <TrSender
      :ref="context.senderRef"
      v-model="inputMessage"
      class="layout-assistant-demo__sender"
      mode="multiple"
      :placeholder="context.isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="context.isProcessing"
      :showWordLimit="true"
      :maxLength="1000"
      v-model:template-data="currentTemplate"
      @submit="context.handleSendMessage"
      @cancel="context.abortActiveRequest"
      @reset-template="context.clearTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import {
  TrDropdownMenu,
  TrSender,
  TrSuggestionPillButton,
  TrSuggestionPills,
  TrSuggestionPopover,
} from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import type { LayoutAssistantContext } from './context'

const props = defineProps<{ context: LayoutAssistantContext }>()

const inputMessage = computed({
  get: () => props.context.inputMessage,
  set: (value: string) => props.context.setInputMessage(value),
})

const currentTemplate = computed({
  get: () => props.context.currentTemplate,
  set: (value) => props.context.setCurrentTemplate(value),
})
</script>
