import { defineComponent, h } from 'vue'

export function enableMermaid() {}

export const MarkdownCodeBlockNode = defineComponent({
  name: 'StubMarkdownCodeBlockNode',
  inheritAttrs: false,
  props: {
    node: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('pre', { ...attrs, 'data-stub': 'MarkdownCodeBlockNode' }, [
        slots['header-left']?.(),
        props.node?.code ?? '',
      ])
  },
})

export default defineComponent({
  name: 'StubMarkdownRender',
  inheritAttrs: false,
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  setup(props, { attrs }) {
    return () => h('div', { ...attrs, 'data-stub': 'MarkdownRender' }, props.content)
  },
})
