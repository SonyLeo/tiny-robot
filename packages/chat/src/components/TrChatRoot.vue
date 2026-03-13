<script setup lang="ts">
import { provide, ref } from 'vue'
import { conditionalProp } from '../utils'
import { useChatKit, useMcpManager } from '../composables'
import { CHAT_KIT_KEY, CHAT_UI_KEY, MCP_MANAGER_KEY } from '../context'
import type { PluginInfo } from '@opentiny/tiny-robot'
import type { TrChatRootProps, UseChatKitOptions } from '../types'

// 两种互斥模式：
// 模式 A：传 UseChatKitOptions，Root 内部创建状态
// 模式 B：传 chatKit 实例，Root 直接 provide，不重复创建

const props = defineProps<TrChatRootProps & { mcpPlugins?: PluginInfo[] }>()

// 使用类型守卫安全地提取属性
const chatKit =
  conditionalProp(props, 'chatKit') ??
  useChatKit({
    responseProvider: conditionalProp(props, 'responseProvider') as UseChatKitOptions['responseProvider'],
    plugins: conditionalProp(props, 'plugins'),
    storage: conditionalProp(props, 'storage'),
    initialMessages: conditionalProp(props, 'initialMessages'),
    onFinish: conditionalProp(props, 'onFinish'),
    onError: conditionalProp(props, 'onError'),
  })

// UI 状态由 Root 统一管理，供 Header / History 通过 inject 消费
const showHistoryDrawer = ref(false)

// MCP 管理器
const mcpManager = useMcpManager()
if (props.mcpPlugins) {
  mcpManager.installedPlugins.value = props.mcpPlugins
}

provide(CHAT_KIT_KEY, chatKit)
provide(CHAT_UI_KEY, { showHistoryDrawer })
provide(MCP_MANAGER_KEY, mcpManager)
</script>

<template>
  <slot />
</template>
