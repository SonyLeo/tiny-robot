import { computed, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { TrMarkdownProps, TrMarkdownRenderNode } from '../index.type'
import type { TrMarkdownStreamProfiler } from '../stream/streamProfiler'
import { applyCitationNodes } from '../utils/citations'

export const useMarkdownParseRuntime = (
  props: Readonly<TrMarkdownProps>,
  stableContent: MaybeRefOrGetter<string>,
  streamProfiler?: MaybeRefOrGetter<TrMarkdownStreamProfiler | undefined>,
) => {
  const nodes = ref<TrMarkdownRenderNode[]>([])
  const parsedStableContent = ref('')
  const streamParseCount = ref(0)
  const parserOptionsKey = computed(() => JSON.stringify(props.parserOptions || {}))
  const featuresKey = computed(() => JSON.stringify(props.features || {}))
  const citationsKey = computed(() => JSON.stringify(props.citations || []))

  let parseRequestId = 0

  const parseMarkdown = async () => {
    const parser = props.parser
    const source = toValue(stableContent)

    if (!parser) {
      nodes.value = []
      parsedStableContent.value = source
      return
    }

    const requestId = ++parseRequestId
    const parseStart = typeof performance === 'undefined' ? Date.now() : performance.now()
    const parsedNodes = await parser.parse(source, {
      ...props.parserOptions,
      html: props.features?.html || props.parserOptions?.html,
      math: props.features?.math,
      footnotes: props.features?.footnotes,
    })

    if (requestId !== parseRequestId) {
      return
    }

    nodes.value = applyCitationNodes(parsedNodes, props.citations)
    parsedStableContent.value = source
    streamParseCount.value += 1
    toValue(streamProfiler)?.recordCalculation({
      durationMs: (typeof performance === 'undefined' ? Date.now() : performance.now()) - parseStart,
      itemCount: parsedNodes.length,
      name: 'parse',
      textLength: source.length,
    })
  }

  watch(
    [() => toValue(stableContent), () => props.parser, parserOptionsKey, featuresKey, citationsKey],
    parseMarkdown,
    {
      immediate: true,
    },
  )

  return {
    nodes,
    parsedStableContent,
    streamParseCount,
  }
}
