import { computed, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { TrMarkdownParserOptions, TrMarkdownProps, TrMarkdownRenderNode } from '../index.type'
import { markdownItAdapter } from '../parser/markdownItAdapter'
import type { TrMarkdownStreamProfiler } from '../stream/streamProfiler'
import { applyCitationNodes } from '../utils/citations'

const resolveParserOptions = (props: Readonly<TrMarkdownProps>): TrMarkdownParserOptions => ({
  ...props.parserOptions,
  html: props.features?.html || props.parserOptions?.html,
  math: props.features?.math,
  footnotes: props.features?.footnotes,
})

const normalizePluginOption = (option: TrMarkdownParserOptions['math'] | TrMarkdownParserOptions['footnotes']) => {
  if (typeof option === 'boolean') {
    return option
  }

  return !!option && option.enabled !== false
}

const createParserOptionsKey = (parser: TrMarkdownProps['parser'], options: TrMarkdownParserOptions) => {
  if (parser !== markdownItAdapter) {
    // A custom adapter owns its options contract. Preserve every effective
    // option so an adapter can observe and react to its declared extensions.
    return JSON.stringify(options)
  }

  // markdown-it adapter only consumes this syntax subset. Presentation
  // feature changes therefore do not invalidate its parser result.
  return JSON.stringify({
    breaks: options.breaks === true,
    footnotes: normalizePluginOption(options.footnotes),
    html: options.html === true,
    linkify: options.linkify !== false,
    math: normalizePluginOption(options.math),
    typographer: options.typographer === true,
  })
}

export const useMarkdownParseRuntime = (
  props: Readonly<TrMarkdownProps>,
  stableContent: MaybeRefOrGetter<string>,
  streamProfiler?: MaybeRefOrGetter<TrMarkdownStreamProfiler | undefined>,
) => {
  const parsedNodes = ref<TrMarkdownRenderNode[]>([])
  const parsedStableContent = ref('')
  const streamParseCount = ref(0)
  const parserOptions = computed(() => resolveParserOptions(props))
  const parserOptionsKey = computed(() => createParserOptionsKey(props.parser, parserOptions.value))
  const nodes = computed(() => applyCitationNodes(parsedNodes.value, props.citations))

  let parseRequestId = 0

  const parseMarkdown = async () => {
    const requestId = ++parseRequestId
    const parser = props.parser
    const source = toValue(stableContent)

    if (!parser) {
      parsedNodes.value = []
      parsedStableContent.value = source
      return
    }

    const parseStart = typeof performance === 'undefined' ? Date.now() : performance.now()
    const parsedResult = await parser.parse(source, parserOptions.value)

    if (requestId !== parseRequestId) {
      return
    }

    // Keep the parser result citation-free. The computed projection reads the
    // latest citations when this result commits, so a citation update racing
    // an async parse cannot publish stale metadata or accumulate wrappers.
    parsedNodes.value = parsedResult
    parsedStableContent.value = source
    streamParseCount.value += 1
    toValue(streamProfiler)?.recordCalculation({
      durationMs: (typeof performance === 'undefined' ? Date.now() : performance.now()) - parseStart,
      itemCount: parsedResult.length,
      name: 'parse',
      textLength: source.length,
    })
  }

  watch([() => toValue(stableContent), () => props.parser, parserOptionsKey], parseMarkdown, {
    immediate: true,
  })

  onUnmounted(() => {
    parseRequestId += 1
  })

  return {
    nodes,
    parsedStableContent,
    streamParseCount,
  }
}
