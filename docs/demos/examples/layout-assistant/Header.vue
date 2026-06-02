<template>
  <div class="layout-assistant-demo__header">
    <div class="layout-assistant-demo__header-start">
      <div class="layout-assistant-demo__header-copy">
        <span class="layout-assistant-demo__header-kicker">Layout Workspace</span>
        <strong>{{ context.currentConversationTitle }}</strong>
      </div>
    </div>

    <div class="layout-assistant-demo__header-end">
      <div class="layout-assistant-demo__header-meta">
        <span>{{ statusText }}</span>
      </div>

      <TrLayout.AsideToggle placement="right" class="layout-assistant-demo__header-toggle" aria-label="切换右侧信息">
        <IconSparkles />
      </TrLayout.AsideToggle>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { computed } from 'vue'
import type { LayoutAssistantContext } from './context'

const props = defineProps<{ context: LayoutAssistantContext }>()

const statusText = computed(() => (props.context.isProcessing ? '处理中' : '布局案例'))
</script>
