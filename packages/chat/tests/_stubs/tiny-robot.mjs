import { computed, defineComponent, h, ref } from 'vue'

function extractMessageText(message) {
  if (!message) return ''

  if (Array.isArray(message.parts)) {
    const textPart = message.parts.find((part) => part?.type === 'text')
    if (typeof textPart?.text === 'string') {
      return textPart.text
    }
  }

  if (typeof message.content === 'string') {
    return message.content
  }

  return ''
}

function passthroughComponent(name, tag = 'div') {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () => h(tag, { ...attrs, 'data-stub': name }, slots.default?.())
    },
  })
}

const StubBubbleBox = defineComponent({
  name: 'StubBubbleBox',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['stub-bubble-box', attrs.class] }, slots.default?.())
  },
})

export const BubbleRenderers = {
  Box: StubBubbleBox,
}

export const BubbleRendererMatchPriority = {
  CONTENT: 'content',
  NORMAL: 'normal',
}

export const BubbleProvider = passthroughComponent('StubBubbleProvider')
export const ThemeProvider = passthroughComponent('StubThemeProvider')

export const TrIconButton = defineComponent({
  name: 'StubTrIconButton',
  inheritAttrs: false,
  props: {
    icon: {
      type: [Object, Function],
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('button', { ...attrs, 'data-stub': 'TrIconButton' }, [
        props.icon ? h(props.icon) : null,
        slots.default?.(),
      ])
  },
})

export const TrWelcome = defineComponent({
  name: 'StubTrWelcome',
  inheritAttrs: false,
  props: {
    title: String,
    description: String,
    icon: {
      type: [Object, Function],
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () =>
      h('section', { ...attrs, 'data-stub': 'TrWelcome' }, [
        props.icon ? h(props.icon) : null,
        h('h2', props.title ?? ''),
        h('p', props.description ?? ''),
      ])
  },
})

export const TrPrompts = defineComponent({
  name: 'StubTrPrompts',
  inheritAttrs: false,
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['item-click'],
  setup(props, { attrs }) {
    return () =>
      h(
        'div',
        { ...attrs, 'data-stub': 'TrPrompts' },
        props.items.map((item) =>
          h(
            'button',
            {
              type: 'button',
            },
            item?.label ?? item?.description ?? '',
          ),
        ),
      )
  },
})

export const TrBubbleList = defineComponent({
  name: 'StubTrBubbleList',
  inheritAttrs: false,
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        { ...attrs, 'data-testid': 'stub-bubble-list' },
        props.messages.map((message, index) =>
          h('article', { class: 'stub-bubble', 'data-index': index, 'data-role': message?.role ?? '' }, [
            h('div', { class: 'stub-bubble__text' }, extractMessageText(message)),
            slots.after?.({ messages: [message], messageIndexes: [index] }),
          ]),
        ),
      )
  },
})

export const TrSender = defineComponent({
  name: 'StubTrSender',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    loading: Boolean,
    mode: String,
    placeholder: String,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('div', { ...attrs, 'data-stub': 'TrSender', 'data-loading': String(Boolean(props.loading)) }, [
        h('textarea', {
          'data-stub': 'TrSenderInput',
          placeholder: props.placeholder ?? '',
          value: props.modelValue,
        }),
        slots.default?.(),
        slots.footer?.(),
        slots['footer-right']?.(),
      ])
  },
})

export const UploadButton = passthroughComponent('StubUploadButton', 'button')
export const VoiceButton = passthroughComponent('StubVoiceButton', 'button')

export const TrAttachments = defineComponent({
  name: 'StubTrAttachments',
  inheritAttrs: false,
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        'div',
        { ...attrs, 'data-stub': 'TrAttachments', 'data-count': props.items.length },
        props.items.map((item, index) => h('div', { key: item?.uid ?? index }, item?.name ?? 'attachment')),
      )
  },
})

export const TrFeedback = defineComponent({
  name: 'StubTrFeedback',
  inheritAttrs: false,
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
    operations: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { attrs }) {
    return () =>
      h('div', { ...attrs, 'data-stub': 'TrFeedback' }, [
        h('div', { 'data-actions': props.actions.length }, ''),
        h('div', { 'data-operations': props.operations.length }, ''),
      ])
  },
})

export const TrHistory = defineComponent({
  name: 'StubTrHistory',
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    selected: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        { ...attrs, 'data-stub': 'TrHistory', 'data-count': props.data.length },
        props.data.map((item) =>
          h('div', { key: item?.id, 'data-history-id': item?.id, 'data-selected': String(props.selected === item?.id) }, [
            slots['item-prefix']?.({ item }),
            slots['item-title']?.({ item }) ?? item?.title ?? '',
          ]),
        ),
      )
  },
})

export const TrMcpServerPicker = passthroughComponent('StubTrMcpServerPicker')
export const TrMcpAddForm = passthroughComponent('StubTrMcpAddForm')

export function useMessageContent(props) {
  const content = computed(() => {
    const parts = Array.isArray(props.message?.parts) ? props.message.parts : []
    const part = parts[props.contentIndex ?? 0]

    if (part) {
      return part
    }

    if (typeof props.message?.content === 'string') {
      return {
        type: 'text',
        text: props.message.content,
      }
    }

    return undefined
  })

  const contentText = computed(() => {
    if (content.value?.type === 'text') {
      return content.value.text ?? ''
    }

    return extractMessageText(props.message)
  })

  return { content, contentText }
}

export function useBubbleContentRenderer(message) {
  return defineComponent({
    name: 'StubBubbleContentRenderer',
    setup() {
      return () => h('div', { 'data-stub': 'BubbleContentRenderer' }, extractMessageText(message?.value ?? message))
    },
  })
}

export function useOmitMessageFields(props, fields) {
  const restMessage = computed(() => {
    const nextMessage = { ...(props.message ?? {}) }
    fields.forEach((field) => {
      delete nextMessage[field]
    })
    return nextMessage
  })

  const restProps = computed(() => ({
    ...props,
    message: restMessage.value,
  }))

  return { restMessage, restProps }
}

export function useTheme() {
  return {
    resolvedColorMode: ref('light'),
  }
}

export function useToolCall(props) {
  const toolCall = computed(() => props.message?.tool_calls?.[props.toolCallIndex] ?? undefined)
  const toolCallWithResult = computed(() => toolCall.value ?? {})
  const state = computed(() => ({
    status: 'success',
  }))

  return {
    toolCall,
    toolCallWithResult,
    state,
  }
}
