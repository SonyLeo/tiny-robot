import { defineComponent, PropType } from 'vue'
import { renderNode } from './utils/render'
import type { TrMarkdownContext } from './context'
import type { TrMarkdownRenderNode } from './index.type'
import type { TrMarkdownNodeAnimationMeta } from './stream/streamingAnimation.type'

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
    animation: {
      type: Object as PropType<TrMarkdownNodeAnimationMeta | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    return () => renderNode(props.node, props.context, props.animation)
  },
})
