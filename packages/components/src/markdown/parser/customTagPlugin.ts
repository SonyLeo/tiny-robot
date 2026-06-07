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

type CustomTagDefinition = {
  allowedAttributes: Set<string>
  tag: 'tr-thinking' | 'tr-artifact'
  tokenType: 'tr_thinking_block' | 'tr_artifact_block'
}

const attributePattern = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

const customTagDefinitions: Record<string, CustomTagDefinition> = {
  'tr-artifact': {
    tag: 'tr-artifact',
    tokenType: 'tr_artifact_block',
    allowedAttributes: new Set(['identifier', 'title', 'type', 'language']),
  },
  'tr-thinking': {
    tag: 'tr-thinking',
    tokenType: 'tr_thinking_block',
    allowedAttributes: new Set(['title', 'open']),
  },
}

const normalizeCustomTagAttributes = (rawAttributes: string, allowedAttributes: Set<string>) => {
  const attrs: Array<[string, string]> = []

  for (const match of rawAttributes.matchAll(attributePattern)) {
    const [, rawName, doubleQuotedValue, singleQuotedValue, bareValue] = match
    const name = rawName.toLowerCase()

    if (!allowedAttributes.has(name)) {
      continue
    }

    const value = doubleQuotedValue ?? singleQuotedValue ?? bareValue ?? 'true'
    attrs.push([name, value])
  }

  return attrs
}

const findTagDefinition = (line: string) => {
  const matched = line.match(/^<(tr-thinking|tr-artifact)\b([^>]*)>\s*$/i)

  if (!matched) {
    return
  }

  const tagName = matched[1].toLowerCase()
  const definition = customTagDefinitions[tagName]

  if (!definition) {
    return
  }

  return {
    definition,
    rawAttributes: matched[2] || '',
  }
}

const customTagBlockRule = (state: MarkdownItBlockState, startLine: number, endLine: number, silent: boolean) => {
  const lineStart = state.bMarks[startLine] + state.tShift[startLine]
  const lineEnd = state.eMarks[startLine]

  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }

  const firstLine = state.src.slice(lineStart, lineEnd).trim()
  const definitionMatch = findTagDefinition(firstLine)

  if (!definitionMatch) {
    return false
  }

  const closeTag = `</${definitionMatch.definition.tag}>`
  const lines: string[] = []
  let nextLine = startLine + 1
  let closed = false

  while (nextLine < endLine) {
    const currentStart = state.bMarks[nextLine] + state.tShift[nextLine]
    const currentEnd = state.eMarks[nextLine]
    const currentLine = state.src.slice(currentStart, currentEnd)

    if (currentLine.trim() === closeTag) {
      closed = true
      break
    }

    lines.push(currentLine)
    nextLine += 1
  }

  if (!closed) {
    return false
  }

  if (!silent) {
    const token = state.push(definitionMatch.definition.tokenType, definitionMatch.definition.tag, 0)
    token.block = true
    token.attrs = normalizeCustomTagAttributes(
      definitionMatch.rawAttributes,
      definitionMatch.definition.allowedAttributes,
    )
    token.content = lines.join('\n').trim()
    token.map = [startLine, nextLine + 1]
  }

  state.line = nextLine + 1
  return true
}

export const customTagPlugin = (parser: MarkdownIt) => {
  parser.block.ruler.before(
    'html_block',
    'tr-custom-tag-block',
    customTagBlockRule as Parameters<typeof parser.block.ruler.before>[2],
    {
      alt: ['blockquote', 'list', 'paragraph', 'reference'],
    },
  )
}
