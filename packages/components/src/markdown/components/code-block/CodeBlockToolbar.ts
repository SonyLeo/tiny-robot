import { defineComponent, h, type PropType } from 'vue'
import type { TrMarkdownCodeActionsRender } from '../../index.type'
import CopyButton from './CopyButton.vue'

export default defineComponent({
  name: 'TrMarkdownCodeBlockToolbar',
  props: {
    actionsRender: {
      type: Function as PropType<TrMarkdownCodeActionsRender>,
      default: undefined,
    },
    alwaysVisible: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      default: '',
    },
    copyable: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<'small' | 'medium'>,
      default: 'medium',
    },
  },
  setup(props) {
    return () => {
      const originalNode = props.copyable ? h(CopyButton, { code: props.code, size: props.size }) : null
      const actionNodes = props.actionsRender
        ? props.actionsRender({
            code: props.code || '',
            language: props.language || undefined,
            originalNode,
          })
        : originalNode
      const normalizedChildren =
        actionNodes == null || actionNodes === false
          ? undefined
          : Array.isArray(actionNodes)
            ? actionNodes.filter((child) => child != null && child !== false)
            : actionNodes

      return h(
        'div',
        {
          class: [
            'tr-markdown__code-toolbar',
            `tr-markdown__code-toolbar--${props.size}`,
            {
              'tr-markdown__code-toolbar--always': props.alwaysVisible,
            },
          ],
        },
        normalizedChildren,
      )
    }
  },
})
