import { markRaw } from 'vue'
import { BubbleRenderers, BubbleRendererMatchPriority } from '@opentiny/tiny-robot'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch, BubbleRoleConfig } from '@opentiny/tiny-robot'
import EditInputRenderer from '../components/EditInputRenderer.vue'

/**
 * Box 渲染器匹配规则
 * 用于控制消息容器的渲染和属性
 */
export const boxRendererMatches: BubbleBoxRendererMatch[] = [
  {
    find: (messages) => messages.length === 1 && messages[0].state?.isEditing === true,
    renderer: BubbleRenderers.Box,
    priority: BubbleRendererMatchPriority.NORMAL,
    attributes: { 'data-editing': 'true', 'data-shape': 'none' },
  },
  // 后续可在此追加：attachment、error 等其他 box 类型
]

/**
 * Content 渲染器匹配规则
 * 用于控制消息内容的渲染
 */
export const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => message.state?.isEditing === true,
    renderer: markRaw(EditInputRenderer),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  // 后续可在此追加：ErrorRenderer、ToolCallsRenderer、AttachmentsRenderer 等
]

/**
 * 角色配置
 * 定义不同角色的默认渲染器和样式
 */
export const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    fallbackContentRenderer: markRaw(BubbleRenderers.Markdown),
  },
  user: {
    placement: 'end',
  },
  // 后续可在此追加：system: { hidden: true }
}
