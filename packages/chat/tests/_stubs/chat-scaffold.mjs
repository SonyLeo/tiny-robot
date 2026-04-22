import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'StubChatScaffoldFallback',
  inheritAttrs: false,
  setup(_props, { slots }) {
    return () => h('div', { 'data-stub': 'ChatScaffoldFallback' }, slots.default?.())
  },
})
