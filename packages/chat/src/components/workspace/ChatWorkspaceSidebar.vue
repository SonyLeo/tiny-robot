<script setup lang="ts">
import { computed } from 'vue'
import { useChatScaffoldContext } from '@/shared/context'
import { ChatHistoryContent } from '@/components/history'
import ChatWorkspaceSidebarShell from './ChatWorkspaceSidebarShell.vue'

defineOptions({ name: 'TrChatWorkspaceSidebar' })

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  {
    mobile: false,
  },
)

const scaffoldContext = useChatScaffoldContext()
const title = computed(() => scaffoldContext?.presetSlices.value.header.title ?? 'TinyRobot')
</script>

<template>
  <ChatWorkspaceSidebarShell :mobile="props.mobile" :title="title">
    <slot>
      <ChatHistoryContent />
    </slot>
  </ChatWorkspaceSidebarShell>
</template>
