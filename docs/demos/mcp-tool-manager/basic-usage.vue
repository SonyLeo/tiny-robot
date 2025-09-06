<template>
  <div class="demo-container">
    <McpToolManager
      :plugin-data="pluginData"
      @tab-change="handleTabChange"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
      @search="handleSearch"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import McpToolManager from '../../../packages/components/src/mcp-tool-manager'

// 模拟插件数据
const pluginData = ref([
  {
    type: 'installed',
    name: '已添加插件',
    pluginList: [
      {
        id: 'github-plugin',
        name: 'GitHub 集成',
        icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        description: '与 GitHub 仓库集成，提供代码管理功能',
        enabled: true,
        expanded: false,
        tools: [
          {
            id: 'search-code',
            name: '搜索代码',
            description: '在 GitHub 仓库中搜索代码',
            enabled: true,
          },
          {
            id: 'create-pr',
            name: '创建 PR',
            description: '创建新的 Pull Request',
            enabled: true,
          },
          {
            id: 'view-issues',
            name: '查看 Issues',
            description: '查看和管理仓库 Issues',
            enabled: false,
          },
        ],
        category: 'development',
      },
      {
        id: 'slack-plugin',
        name: 'Slack 通知',
        icon: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
        description: '发送消息到 Slack 频道',
        enabled: false,
        expanded: false,
        tools: [
          {
            id: 'send-message',
            name: '发送消息',
            description: '发送消息到指定频道',
            enabled: false,
          },
          {
            id: 'create-channel',
            name: '创建频道',
            description: '创建新的 Slack 频道',
            enabled: false,
          },
        ],
        category: 'communication',
      },
    ],
    search: {
      placeholder: '搜索已添加插件',
    },
  },
  {
    type: 'market',
    name: '插件市场',
    pluginList: [
      {
        id: 'notion-plugin',
        name: 'Notion 集成',
        icon: 'https://www.notion.so/images/logo-ios.png',
        description: 'Notion 文档管理和协作工具',
        enabled: false,
        addState: 'idle',
        tools: [
          {
            id: 'search-code',
            name: '搜索代码',
            description: '在 GitHub 仓库中搜索代码',
            enabled: true,
          },
          {
            id: 'create-pr',
            name: '创建 PR',
            description: '创建新的 Pull Request',
            enabled: true,
          },
          {
            id: 'view-issues',
            name: '查看 Issues',
            description: '查看和管理仓库 Issues',
            enabled: false,
          },
        ],
        category: 'productivity',
      },
      {
        id: 'jira-plugin',
        name: 'Jira 集成',
        icon: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png',
        description: 'Jira 任务管理',
        enabled: false,
        addState: 'loading',
        tools: [
          {
            id: 'search-code',
            name: '搜索代码',
            description: '在 GitHub 仓库中搜索代码',
            enabled: true,
          },
          {
            id: 'create-pr',
            name: '创建 PR',
            description: '创建新的 Pull Request',
            enabled: true,
          },
          {
            id: 'view-issues',
            name: '查看 Issues',
            description: '查看和管理仓库 Issues',
            enabled: false,
          },
        ],
        category: 'project-management',
      },
      {
        id: 'telegram-plugin',
        name: 'Telegram 机器人',
        icon: 'https://telegram.org/img/t_logo.png',
        description: 'Telegram 消息推送和自动化',
        enabled: false,
        addState: 'added',
        tools: [
          {
            id: 'search-code',
            name: '搜索代码',
            description: '在 GitHub 仓库中搜索代码',
            enabled: true,
          },
          {
            id: 'create-pr',
            name: '创建 PR',
            description: '创建新的 Pull Request',
            enabled: true,
          },
          {
            id: 'view-issues',
            name: '查看 Issues',
            description: '查看和管理仓库 Issues',
            enabled: false,
          },
        ],
        category: 'communication',
      },
    ],
    search: {
      placeholder: '搜索市场插件123',
      enabled: true,
      filters: [
        {
          label: '生产力工具',
          value: 'productivity',
          filterFn: (plugins) => plugins.filter((plugin) => plugin.category === 'productivity'),
        },
        {
          label: '开发工具',
          value: 'development',
          filterFn: (plugins) => plugins.filter((plugin) => plugin.category === 'development'),
        },
        {
          label: '沟通协作',
          value: 'communication',
          filterFn: (plugins) => plugins.filter((plugin) => plugin.category === 'communication'),
        },
      ],
    },
  },
])

// 事件处理函数
const handleTabChange = (tab) => {
  console.log('标签页切换:', tab.name)
}

const handlePluginToggle = (plugin, enabled) => {
  console.log(`插件 ${plugin.name} ${enabled ? '启用' : '禁用'}`)
  plugin.enabled = enabled

  // 如果禁用插件，同时禁用所有工具
  if (!enabled) {
    plugin.tools.forEach((tool) => {
      tool.enabled = false
    })
  }
}

const handlePluginAdd = (plugin) => {
  console.log('添加插件:', plugin.name)

  // 设置加载状态
  plugin.addState = 'loading'

  // 模拟异步添加过程
  setTimeout(() => {
    plugin.addState = 'added'

    // 添加到已安装列表
    const newPlugin = {
      ...plugin,
      addState: undefined,
      enabled: true,
    }
    pluginData.value[0].pluginList.push(newPlugin)

    console.log('插件添加成功:', plugin.name)
  }, 2000)
}

const handlePluginDelete = (plugin) => {
  console.log('删除插件:', plugin.name)

  // 从已安装列表中移除
  const index = pluginData.value[0].pluginList.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    pluginData.value[0].pluginList.splice(index, 1)
  }

  // 恢复插件状态
  const indexMarket = pluginData.value[1].pluginList.findIndex((p) => p.id === plugin.id)
  if (indexMarket > -1) {
    pluginData.value[1].pluginList[indexMarket].addState = 'idle'
  }
}

const handleToolToggle = (plugin, toolId, enabled) => {
  console.log(`工具 ${toolId} ${enabled ? '启用' : '禁用'}`)

  const tool = plugin.tools.find((t) => t.id === toolId)
  if (tool) {
    tool.enabled = enabled
  }

  // 检查是否需要更新插件状态
  const enabledTools = plugin.tools.filter((t) => t.enabled)
  if (enabledTools.length === 0) {
    plugin.enabled = false
  } else if (!plugin.enabled) {
    plugin.enabled = true
  }
}

const handleSearch = (query, tab) => {
  console.log('搜索:', query, '在标签页:', tab.name)
}
</script>

<style scoped>
.demo-container {
  width: 100%;
  height: 380px;
  overflow: hidden;
}
</style>
