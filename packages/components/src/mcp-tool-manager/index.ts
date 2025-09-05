import { App } from 'vue'
import McpToolManager from './index.vue'

McpToolManager.name = 'TrMcpToolManager'

const install = function <T>(app: App<T>) {
  app.component(McpToolManager.name!, McpToolManager)
}

McpToolManager.install = install

export default McpToolManager as typeof McpToolManager & { install: typeof install }
