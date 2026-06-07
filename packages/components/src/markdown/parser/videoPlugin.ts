import type MarkdownIt from 'markdown-it'

type MarkdownItBlockState = {
  bMarks: number[]
  blkIndent: number
  eMarks: number[]
  line: number
  push: (
    type: string,
    tag: string,
    nesting: number,
  ) => {
    attrs?: Array<[string, string]>
    block?: boolean
    content: string
    map?: [number, number]
    meta?: Record<string, unknown>
  }
  sCount: number[]
  src: string
  tShift: number[]
}

const videoTagPattern = /^<video\b([^>]*)\s*(?:\/>|>\s*<\/video>)$/i
const attributePattern = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

const booleanAttributes = new Set(['autoplay', 'controls', 'loop', 'muted', 'playsinline'])

const allowedAttributes = new Set([
  'autoplay',
  'controls',
  'controlslist',
  'crossorigin',
  'height',
  'loop',
  'muted',
  'playsinline',
  'poster',
  'preload',
  'src',
  'title',
  'width',
])

const normalizeVideoAttributes = (rawAttributes: string) => {
  const attrs: Array<[string, string]> = []

  for (const match of rawAttributes.matchAll(attributePattern)) {
    const [, rawName, doubleQuotedValue, singleQuotedValue, bareValue] = match
    const name = rawName.toLowerCase()

    if (!allowedAttributes.has(name)) {
      continue
    }

    if (booleanAttributes.has(name)) {
      attrs.push([name, 'true'])
      continue
    }

    const value = doubleQuotedValue ?? singleQuotedValue ?? bareValue ?? ''
    if (!value) {
      continue
    }

    attrs.push([name, value])
  }

  return attrs
}

const videoBlockRule = (state: MarkdownItBlockState, startLine: number, _endLine: number, silent: boolean) => {
  const lineStart = state.bMarks[startLine] + state.tShift[startLine]
  const lineEnd = state.eMarks[startLine]

  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }

  const sourceLine = state.src.slice(lineStart, lineEnd).trim()
  const matched = sourceLine.match(videoTagPattern)

  if (!matched) {
    return false
  }

  const attrs = normalizeVideoAttributes(matched[1] || '')
  const hasSrc = attrs.some(([name, value]) => name === 'src' && value)

  if (!hasSrc) {
    return false
  }

  if (!silent) {
    const token = state.push('video', 'video', 0)
    token.block = true
    token.attrs = attrs
    token.content = sourceLine
    token.map = [startLine, startLine + 1]
  }

  state.line = startLine + 1
  return true
}

export const videoPlugin = (parser: MarkdownIt) => {
  parser.block.ruler.before(
    'html_block',
    'tr-video-block',
    videoBlockRule as Parameters<typeof parser.block.ruler.before>[2],
    {
      alt: ['blockquote', 'list', 'paragraph', 'reference'],
    },
  )
}
