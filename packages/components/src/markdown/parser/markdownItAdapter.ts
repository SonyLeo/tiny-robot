import MarkdownIt from 'markdown-it'
import footnotePlugin from 'markdown-it-footnote'
import type { TrMarkdownParserAdapter, TrMarkdownParserOptions, TrMarkdownRenderNode } from '../index.type'
import { parseInlineHtmlTagToken } from '../utils/html'
import { resolveFootnoteConfig } from '../utils/footnotes'
import { customTagPlugin } from './customTagPlugin'
import { mathPlugin } from './mathPlugin'
import { videoPlugin } from './videoPlugin'

type MarkdownItToken = {
  type: string
  tag: string
  attrs?: Array<[string, string]> | null
  content: string
  info: string
  children?: MarkdownItToken[]
  map?: [number, number] | null
  meta?: Record<string, unknown>
}

const inlineTokenTypeMap: Record<string, string> = {
  code_inline: 'inline-code',
  em_open: 'emphasis-open',
  em_close: 'emphasis-close',
  strong_open: 'strong-open',
  strong_close: 'strong-close',
  s_open: 'delete-open',
  s_close: 'delete-close',
  image: 'image',
  link_open: 'link-open',
  link_close: 'link-close',
  hardbreak: 'hardbreak',
  softbreak: 'softbreak',
  text: 'text',
}

const supportedInlineHtmlTagMap: Record<string, { type: string; tag: string }> = {
  ins: { type: 'underline', tag: 'ins' },
  sub: { type: 'subscript', tag: 'sub' },
  sup: { type: 'superscript', tag: 'sup' },
  kbd: { type: 'keyboard', tag: 'kbd' },
  br: { type: 'hardbreak', tag: 'br' },
}

const supportedInlineHtmlTagPattern = /<(\/?)(ins|sub|sup|kbd|br)\s*\/?>/gi
const taskListMarkerPattern = /^\[( |x|X)\]\s*/
const genericInlineHtmlTagPattern = /<[a-zA-Z][\w:-]*(\s[^<>]*)?>|<\/[a-zA-Z][\w:-]*\s*>/i

const isMathEnabled = (options?: TrMarkdownParserOptions) => {
  if (!options?.math) {
    return false
  }

  return typeof options.math === 'boolean' ? options.math : options.math.enabled !== false
}

const isFootnotesEnabled = (options?: TrMarkdownParserOptions) => {
  return resolveFootnoteConfig(options?.footnotes).enabled
}

const normalizeAttrs = (token: MarkdownItToken): Record<string, unknown> | undefined => {
  if (!token.attrs?.length) return

  return Object.fromEntries(token.attrs.map(([key, value]) => [key, value]))
}

const normalizeMeta = (token: MarkdownItToken): Record<string, unknown> | undefined => {
  if (!token.meta) {
    return
  }

  return { ...token.meta }
}

const createInlineNode = (token: MarkdownItToken, overrides?: Partial<TrMarkdownRenderNode>): TrMarkdownRenderNode => {
  return {
    type: overrides?.type || token.type,
    tag: overrides?.tag || token.tag || undefined,
    text: overrides?.text ?? undefined,
    attrs: overrides?.attrs || normalizeAttrs(token),
    children: overrides?.children,
  }
}

const createLineStartOffsets = (source: string) => {
  const offsets = [0]

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') {
      offsets.push(index + 1)
    }
  }

  return offsets
}

const resolvePosition = (token: MarkdownItToken, source: string, lineStartOffsets: number[]) => {
  if (!token.map || token.map.length !== 2) {
    return
  }

  const [lineStart, lineEnd] = token.map
  const charStart = lineStartOffsets[lineStart] ?? source.length
  const charEnd = lineEnd < lineStartOffsets.length ? lineStartOffsets[lineEnd] : source.length

  return {
    lineStart,
    lineEnd,
    charStart,
    charEnd,
  }
}

const createNode = (
  token: MarkdownItToken,
  source: string,
  lineStartOffsets: number[],
  overrides?: Partial<TrMarkdownRenderNode>,
): TrMarkdownRenderNode => {
  return {
    type: overrides?.type || token.type,
    tag: overrides?.tag || token.tag || undefined,
    text: overrides?.text ?? undefined,
    attrs: overrides?.attrs || normalizeAttrs(token),
    children: overrides?.children,
    position: overrides?.position || resolvePosition(token, source, lineStartOffsets),
  }
}

const parseInlineChildren = (tokens: MarkdownItToken[]): TrMarkdownRenderNode[] => {
  const result: TrMarkdownRenderNode[] = []
  const stack: Array<TrMarkdownRenderNode> = []
  let lastLeafType: string | undefined

  const pushNode = (node: TrMarkdownRenderNode) => {
    const parent = stack.at(-1)
    if (parent) {
      parent.children ||= []
      parent.children.push(node)
    } else {
      result.push(node)
    }

    if (!node.children?.length) {
      lastLeafType = node.type
    }
  }

  const pushText = (text: string) => {
    if (!text) return
    pushNode({ type: 'text', text })
  }

  const parseSupportedInlineHtml = (content: string) => {
    if (!content) return

    let matched = false
    let lastIndex = 0
    supportedInlineHtmlTagPattern.lastIndex = 0

    for (const match of content.matchAll(supportedInlineHtmlTagPattern)) {
      matched = true

      const [rawTag, closingFlag, tagNameRaw] = match
      const matchIndex = match.index ?? 0
      const tagName = tagNameRaw.toLowerCase()
      const inlineHtmlTag = supportedInlineHtmlTagMap[tagName]

      pushText(content.slice(lastIndex, matchIndex))
      lastIndex = matchIndex + rawTag.length

      if (!inlineHtmlTag) {
        pushText(rawTag)
        continue
      }

      if (inlineHtmlTag.type === 'hardbreak') {
        if (!closingFlag) {
          pushNode({ type: 'hardbreak', tag: 'br' })
        }
        continue
      }

      if (closingFlag) {
        const currentNode = stack.at(-1)
        if (currentNode?.type === inlineHtmlTag.type && currentNode.tag === inlineHtmlTag.tag) {
          stack.pop()
        } else {
          pushText(rawTag)
        }
        continue
      }

      const node: TrMarkdownRenderNode = {
        type: inlineHtmlTag.type,
        tag: inlineHtmlTag.tag,
        children: [],
      }
      pushNode(node)
      stack.push(node)
    }

    if (!matched) {
      pushText(content)
      return
    }

    pushText(content.slice(lastIndex))
  }

  const parseGenericInlineHtml = (content: string) => {
    const htmlTag = parseInlineHtmlTagToken(content)
    if (!htmlTag) {
      pushText(content)
      return
    }

    if (htmlTag.closing) {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        const currentNode = stack[index]
        if (currentNode.type === 'html-inline' && currentNode.tag === htmlTag.name) {
          stack.splice(index)
          return
        }
      }

      pushText(content)
      return
    }

    const node: TrMarkdownRenderNode = {
      type: 'html-inline',
      tag: htmlTag.name,
      attrs: htmlTag.attrs,
      children: [],
    }
    pushNode(node)

    if (!htmlTag.selfClosing) {
      stack.push(node)
    }
  }

  for (const token of tokens) {
    if (token.type === 'text') {
      parseSupportedInlineHtml(token.content)
      continue
    }

    if (token.type === 'html_inline') {
      if (supportedInlineHtmlTagPattern.test(token.content)) {
        supportedInlineHtmlTagPattern.lastIndex = 0
        parseSupportedInlineHtml(token.content)
        continue
      }

      supportedInlineHtmlTagPattern.lastIndex = 0

      if (genericInlineHtmlTagPattern.test(token.content)) {
        parseGenericInlineHtml(token.content)
        continue
      }

      pushNode({
        type: 'html-inline-raw',
        text: token.content,
      })
      continue
    }

    if (token.type === 'softbreak' || token.type === 'hardbreak') {
      if (token.type === 'softbreak' && lastLeafType === 'hardbreak') {
        continue
      }

      pushNode({ type: token.type, tag: 'br' })
      continue
    }

    if (token.type === 'code_inline') {
      pushNode({ type: 'inline-code', tag: 'code', text: token.content })
      continue
    }

    if (token.type === 'math_inline') {
      pushNode({ type: 'math-inline', tag: 'span', text: token.content })
      continue
    }

    if (token.type === 'footnote_ref') {
      pushNode({
        type: 'footnote-ref',
        tag: 'sup',
        attrs: normalizeMeta(token),
      })
      continue
    }

    if (token.type === 'image') {
      pushNode(
        createInlineNode(token, {
          type: 'image',
          tag: 'img',
          attrs: {
            ...normalizeAttrs(token),
            alt: token.content,
          },
        }),
      )
      continue
    }

    if (token.type === 'video') {
      pushNode(
        createInlineNode(token, {
          type: 'video',
          tag: 'video',
        }),
      )
      continue
    }

    if (token.type.endsWith('_open')) {
      const normalizedType = inlineTokenTypeMap[token.type]
      const nodeType = normalizedType ? normalizedType.replace(/-open$/, '') : token.type
      const node = createInlineNode(token, { type: nodeType, children: [] })
      pushNode(node)
      stack.push(node)
      continue
    }

    if (token.type.endsWith('_close')) {
      stack.pop()
    }
  }

  return result
}

const normalizeTaskListChildren = (children: TrMarkdownRenderNode[]): { checked: boolean } | undefined => {
  const firstChild = children[0]

  if (firstChild?.type !== 'text' || !firstChild.text) {
    return
  }

  const matched = firstChild.text.match(taskListMarkerPattern)
  if (!matched) {
    return
  }

  const marker = matched[0]
  const checked = matched[1].toLowerCase() === 'x'
  const nextText = firstChild.text.slice(marker.length)

  if (nextText) {
    firstChild.text = nextText
  } else {
    children.shift()
  }

  return { checked }
}

const parseTokens = (
  tokens: MarkdownItToken[],
  source: string,
  options?: TrMarkdownParserOptions,
): TrMarkdownRenderNode[] => {
  const result: TrMarkdownRenderNode[] = []
  const stack: Array<TrMarkdownRenderNode> = []
  const lineStartOffsets = createLineStartOffsets(source)
  const mathEnabled = isMathEnabled(options)

  const pushNode = (node: TrMarkdownRenderNode) => {
    const parent = stack.at(-1)
    if (parent) {
      parent.children ||= []
      parent.children.push(node)
    } else {
      result.push(node)
    }
  }

  for (const token of tokens) {
    if (token.type === 'inline') {
      const children = parseInlineChildren(token.children || [])
      const currentParagraph = stack.at(-1)
      const currentListItem = stack.at(-2)
      const taskState =
        currentParagraph?.type === 'paragraph_open' && currentListItem?.type === 'list_item_open'
          ? normalizeTaskListChildren(children)
          : undefined

      if (taskState && currentListItem) {
        currentListItem.attrs = {
          ...(currentListItem.attrs || {}),
          task: true,
          checked: taskState.checked,
        }

        children.unshift({
          type: 'task-checkbox',
          tag: 'input',
          attrs: {
            checked: taskState.checked,
          },
        })
      }

      if (children.length === 0 && token.content && !taskState) {
        pushNode({ type: 'text', text: token.content })
      } else {
        for (const child of children) {
          pushNode(child)
        }
      }
      continue
    }

    if (token.type === 'footnote_anchor') {
      pushNode(
        createNode(token, source, lineStartOffsets, {
          type: 'footnote-backref',
          tag: 'a',
          attrs: normalizeMeta(token),
        }),
      )
      continue
    }

    if (token.type === 'math_block') {
      pushNode(
        createNode(token, source, lineStartOffsets, {
          type: 'math-block',
          tag: 'div',
          text: token.content,
        }),
      )
      continue
    }

    if (token.type === 'fence' || token.type === 'code_block') {
      if (mathEnabled && token.info?.trim() === 'math') {
        pushNode(
          createNode(token, source, lineStartOffsets, {
            type: 'math-block',
            tag: 'div',
            text: token.content,
          }),
        )
        continue
      }

      pushNode(
        createNode(token, source, lineStartOffsets, {
          type: 'code-block',
          tag: 'pre',
          text: token.content,
          attrs: {
            language: token.info?.trim() || '',
          },
        }),
      )
      continue
    }

    if (token.type === 'video') {
      pushNode(
        createNode(token, source, lineStartOffsets, {
          type: 'video',
          tag: 'video',
          attrs: normalizeAttrs(token),
        }),
      )
      continue
    }

    if (token.type === 'tr_thinking_block') {
      pushNode(
        createNode(token, source, lineStartOffsets, {
          type: 'thinking-block',
          tag: 'tr-thinking',
          text: token.content,
          attrs: normalizeAttrs(token),
        }),
      )
      continue
    }

    if (token.type === 'tr_artifact_block') {
      pushNode(
        createNode(token, source, lineStartOffsets, {
          type: 'artifact-block',
          tag: 'tr-artifact',
          text: token.content,
          attrs: normalizeAttrs(token),
        }),
      )
      continue
    }

    if (token.type === 'hr') {
      pushNode({ type: 'hr', tag: 'hr' })
      continue
    }

    if (token.type === 'footnote_block_open') {
      const node = createNode(token, source, lineStartOffsets, {
        type: 'footnote-block',
        tag: 'section',
        attrs: {
          label: 'Footnotes',
        },
        children: [],
      })
      pushNode(node)
      stack.push(node)
      continue
    }

    if (token.type === 'footnote_open') {
      const node = createNode(token, source, lineStartOffsets, {
        type: 'footnote-item',
        tag: 'li',
        attrs: normalizeMeta(token),
        children: [],
      })
      pushNode(node)
      stack.push(node)
      continue
    }

    if (token.type === 'html_block' || token.type === 'html_inline') {
      pushNode({ type: token.type === 'html_block' ? 'html-block' : 'html-inline-raw', text: token.content })
      continue
    }

    if (token.type.endsWith('_open')) {
      const node = createNode(token, source, lineStartOffsets, { children: [] })
      pushNode(node)
      stack.push(node)
      continue
    }

    if (token.type.endsWith('_close')) {
      stack.pop()
    }
  }

  return result
}

export const markdownItAdapter: TrMarkdownParserAdapter = {
  name: 'markdown-it',
  async parse(source: string, options?: TrMarkdownParserOptions) {
    const parser = new MarkdownIt({
      html: options?.html,
      linkify: options?.linkify ?? true,
      typographer: options?.typographer,
      breaks: options?.breaks,
    })

    if (isMathEnabled(options)) {
      parser.use(mathPlugin)
    }

    if (isFootnotesEnabled(options)) {
      parser.use(footnotePlugin)
    }

    parser.use(customTagPlugin)
    parser.use(videoPlugin)

    return parseTokens(parser.parse(source, {}) as MarkdownItToken[], source, options)
  },
}
