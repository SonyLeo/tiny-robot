import MarkdownIt from 'markdown-it'
import type { TrMarkdownParserAdapter, TrMarkdownParserOptions, TrMarkdownRenderNode } from '../index.type'

type MarkdownItToken = {
  type: string
  tag: string
  attrs?: Array<[string, string]> | null
  content: string
  info: string
  children?: MarkdownItToken[]
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

const normalizeAttrs = (token: MarkdownItToken): Record<string, unknown> | undefined => {
  if (!token.attrs?.length) return

  return Object.fromEntries(token.attrs.map(([key, value]) => [key, value]))
}

const createNode = (token: MarkdownItToken, overrides?: Partial<TrMarkdownRenderNode>): TrMarkdownRenderNode => {
  return {
    type: overrides?.type || token.type,
    tag: overrides?.tag || token.tag || undefined,
    text: overrides?.text ?? undefined,
    attrs: overrides?.attrs || normalizeAttrs(token),
    children: overrides?.children,
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

  for (const token of tokens) {
    if (token.type === 'text') {
      parseSupportedInlineHtml(token.content)
      continue
    }

    if (token.type === 'html_inline') {
      parseSupportedInlineHtml(token.content)
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

    if (token.type === 'image') {
      pushNode(
        createNode(token, {
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

    if (token.type.endsWith('_open')) {
      const normalizedType = inlineTokenTypeMap[token.type]
      const nodeType = normalizedType ? normalizedType.replace(/-open$/, '') : token.type
      const node = createNode(token, { type: nodeType, children: [] })
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

const parseTokens = (tokens: MarkdownItToken[]): TrMarkdownRenderNode[] => {
  const result: TrMarkdownRenderNode[] = []
  const stack: Array<TrMarkdownRenderNode> = []

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

    if (token.type === 'fence' || token.type === 'code_block') {
      pushNode(
        createNode(token, {
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

    if (token.type === 'hr') {
      pushNode({ type: 'hr', tag: 'hr' })
      continue
    }

    if (token.type === 'html_block' || token.type === 'html_inline') {
      pushNode({ type: 'html', text: token.content })
      continue
    }

    if (token.type.endsWith('_open')) {
      const node = createNode(token, { children: [] })
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

    return parseTokens(parser.parse(source, {}) as MarkdownItToken[])
  },
}
