import type MarkdownIt from 'markdown-it'

type MarkdownItInlineState = {
  pos: number
  posMax: number
  push: (type: string, tag: string, nesting: number) => { content: string }
  src: string
}

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
    block?: boolean
    content: string
    map?: [number, number]
  }
  sCount: number[]
  src: string
  tShift: number[]
}

const isWhitespace = (value: string) => /\s/.test(value)

const isEscaped = (source: string, index: number) => {
  let slashCount = 0

  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
    slashCount += 1
  }

  return slashCount % 2 === 1
}

const findInlineMathClose = (source: string, start: number, max: number) => {
  for (let cursor = start; cursor < max; cursor += 1) {
    if (source[cursor] !== '$' || isEscaped(source, cursor)) {
      continue
    }

    if (cursor === start || isWhitespace(source[cursor - 1] || '')) {
      continue
    }

    return cursor
  }

  return -1
}

const mathInlineRule = (state: MarkdownItInlineState, silent: boolean) => {
  const start = state.pos
  const source = state.src

  if (source[start] !== '$' || source[start + 1] === '$' || isEscaped(source, start)) {
    return false
  }

  const nextChar = source[start + 1] || ''
  if (!nextChar || isWhitespace(nextChar)) {
    return false
  }

  const closeIndex = findInlineMathClose(source, start + 1, state.posMax)
  if (closeIndex === -1) {
    return false
  }

  const content = source.slice(start + 1, closeIndex)
  if (!content) {
    return false
  }

  if (!silent) {
    const token = state.push('math_inline', 'math', 0)
    token.content = content
  }

  state.pos = closeIndex + 1
  return true
}

const resolveMathBlock = (line: string) => {
  if (!line.startsWith('$$')) {
    return
  }

  const body = line.slice(2)
  const closeIndex = body.lastIndexOf('$$')

  if (closeIndex === -1) {
    return
  }

  return body.slice(0, closeIndex)
}

const mathBlockRule = (state: MarkdownItBlockState, startLine: number, endLine: number, silent: boolean) => {
  const lineStart = state.bMarks[startLine] + state.tShift[startLine]
  const lineEnd = state.eMarks[startLine]

  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }

  const firstLine = state.src.slice(lineStart, lineEnd)
  if (!firstLine.startsWith('$$')) {
    return false
  }

  const sameLineContent = resolveMathBlock(firstLine)
  if (sameLineContent !== undefined) {
    if (!silent) {
      const token = state.push('math_block', 'math', 0)
      token.block = true
      token.content = sameLineContent.trim()
      token.map = [startLine, startLine + 1]
    }

    state.line = startLine + 1
    return true
  }

  const lines: string[] = []
  lines.push(firstLine.slice(2))

  let nextLine = startLine + 1
  let closed = false

  while (nextLine < endLine) {
    const currentStart = state.bMarks[nextLine] + state.tShift[nextLine]
    const currentEnd = state.eMarks[nextLine]
    const currentLine = state.src.slice(currentStart, currentEnd)
    const closeIndex = currentLine.indexOf('$$')

    if (closeIndex !== -1 && !isEscaped(currentLine, closeIndex)) {
      lines.push(currentLine.slice(0, closeIndex))
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
    const token = state.push('math_block', 'math', 0)
    token.block = true
    token.content = lines.join('\n').trim()
    token.map = [startLine, nextLine + 1]
  }

  state.line = nextLine + 1
  return true
}

export const mathPlugin = (parser: MarkdownIt) => {
  parser.inline.ruler.after(
    'escape',
    'tr-math-inline',
    mathInlineRule as Parameters<typeof parser.inline.ruler.after>[2],
  )
  parser.block.ruler.before(
    'fence',
    'tr-math-block',
    mathBlockRule as Parameters<typeof parser.block.ruler.before>[2],
    {
      alt: ['blockquote', 'list', 'paragraph', 'reference'],
    },
  )
}
