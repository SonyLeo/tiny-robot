import { useMcpManager } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory, toolPlugin } from '@opentiny/tiny-robot-kit'
import { createLocalMcpBridge, defaultMcpServers } from './mcp'

export const mcpManager = useMcpManager({
  initialPlugins: defaultMcpServers,
  bridge: createLocalMcpBridge(),
})

export const chatRuntime = {
  storage: localStorageStrategyFactory(),
  plugins: [
    toolPlugin({
      getTools: mcpManager.getTools,
      callTool: mcpManager.callTool,
    }),
  ],
  mcpManager,
}
