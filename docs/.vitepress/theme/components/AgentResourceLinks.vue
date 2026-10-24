<script setup lang="ts">
import { withBase } from 'vitepress'

interface ResourceLink {
  label: string
  path: string
  description: string
  external?: boolean
}

const props = defineProps<{
  section: 'llms' | 'skill'
}>()

const resources: Record<ResourceLink['path'], ResourceLink> = {
  '/llms.txt': {
    label: 'llms.txt',
    path: '/llms.txt',
    description: '精简的文档目录，适合 Agent 先发现相关页面。',
  },
  '/llms-full.txt': {
    label: 'llms-full.txt',
    path: '/llms-full.txt',
    description: '完整文档内容；当前构建会按完整页面分段，不静默截断。',
  },
  'https://github.com/opentiny/agent-skills/tree/main/skills/tiny-robot-skill': {
    label: 'Skill 源码目录',
    path: 'https://github.com/opentiny/agent-skills/tree/main/skills/tiny-robot-skill',
    description: 'Skill 的维护源；组件 API 和 Demo 以 TinyRobot 文档仓库为准。',
    external: true,
  },
  'https://raw.githubusercontent.com/opentiny/agent-skills/main/skills/tiny-robot-skill/SKILL.md': {
    label: '查看 SKILL.md',
    path: 'https://raw.githubusercontent.com/opentiny/agent-skills/main/skills/tiny-robot-skill/SKILL.md',
    description: '直接读取 Skill 说明文件。当前维护版本为 1.1.0。',
    external: true,
  },
}

const resourcePaths = {
  llms: ['/llms.txt', '/llms-full.txt'],
  skill: [
    'https://github.com/opentiny/agent-skills/tree/main/skills/tiny-robot-skill',
    'https://raw.githubusercontent.com/opentiny/agent-skills/main/skills/tiny-robot-skill/SKILL.md',
  ],
} as const

const items = resourcePaths[props.section].map((path) => resources[path])
</script>

<template>
  <ul class="agent-resources">
    <li v-for="item in items" :key="item.path" class="agent-resources__item">
      <a
        class="agent-resources__link"
        :href="item.external ? item.path : withBase(item.path)"
        :target="item.external ? '_blank' : undefined"
        :rel="item.external ? 'noopener noreferrer' : undefined"
      >
        {{ item.label }}
      </a>
      <span>{{ item.description }}</span>
    </li>
  </ul>
</template>

<style scoped>
.agent-resources {
  margin: 20px 0;
  padding-left: 24px;
}

.agent-resources__item {
  padding: 4px 0 4px 4px;
  line-height: 1.7;
}

.agent-resources__link {
  font-weight: 600;
}

.agent-resources__item span {
  margin-left: 6px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
