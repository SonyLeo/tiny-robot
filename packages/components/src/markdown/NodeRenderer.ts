import { defineComponent, PropType } from 'vue'
import { renderNode } from './utils/render'
import type { TrMarkdownContext } from './context'
import type { TrMarkdownRenderNode } from './index.type'

export default defineComponent({
  name: 'TrMarkdownNodeRenderer',
  props: {
    context: {
      type: Object as PropType<TrMarkdownContext>,
      required: true,
    },
    node: {
      type: Object as PropType<TrMarkdownRenderNode>,
      required: true,
    },
  },
  setup(props) {
    return () => renderNode(props.node, props.context)
  },
})
