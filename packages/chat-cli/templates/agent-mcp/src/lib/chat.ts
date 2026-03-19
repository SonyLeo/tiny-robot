import { createChatAdapterFromConfig, createChatCliCapabilitySurface, useMcpManager } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import chatConfig from '../chat.config'
import { createLocalMcpBridge, defaultMcpServers } from './mcp'

export const chatStorage = localStorageStrategyFactory()
export const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createLocalMcpBridge(),
})
export const chatPlugins = [
  toolPlugin({
    getTools: mcpManager.getTools,
    callTool: mcpManager.callTool,
  }),
]

export const chatAdapter = createChatAdapterFromConfig({
  ...chatConfig,
  features: {
    ...(chatConfig.features ?? {}),
    mcp: {
      manager: mcpManager,
    },
  },
})

export const chatCapabilitySurface = createChatCliCapabilitySurface(chatAdapter)
