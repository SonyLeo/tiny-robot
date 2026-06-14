import DOMPurifyFactory from 'dompurify'

const inlineVoidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

const createSanitizer = () => {
  if (typeof window === 'undefined') {
    return
  }

  return DOMPurifyFactory(window)
}

let sanitizer = createSanitizer()

const normalizeAttributeValue = (value: string) => {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

const escapeAttributeValue = (value: string) => {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const escapeHtml = (value: string) => {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export interface TrMarkdownHtmlTagToken {
  attrs?: Record<string, string>
  closing: boolean
  name: string
  selfClosing: boolean
}

export interface TrMarkdownSanitizedHtmlElement {
  attrs?: Record<string, string>
  tag: string
}

export const sanitizeMarkdownHtml = (content: string) => {
  if (!content) {
    return ''
  }

  if (!sanitizer) {
    sanitizer = createSanitizer()
  }

  if (!sanitizer) {
    return escapeHtml(content)
  }

  return sanitizer.sanitize(content, {
    USE_PROFILES: {
      html: true,
      svg: false,
      svgFilters: false,
      mathMl: false,
    },
  })
}

export const parseInlineHtmlTagToken = (content: string): TrMarkdownHtmlTagToken | undefined => {
  const matched = content.trim().match(/^<\s*(\/)?\s*([a-zA-Z][\w:-]*)([^>]*)>$/)
  if (!matched) {
    return
  }

  const [, closingFlag, rawName, rawAttrs = ''] = matched
  const name = rawName.toLowerCase()
  const closing = closingFlag === '/'
  const selfClosing = !closing && (inlineVoidTags.has(name) || /\/\s*$/.test(rawAttrs))

  if (closing) {
    return {
      closing,
      name,
      selfClosing: false,
    }
  }

  const attrs: Record<string, string> = {}
  const attrPattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match: RegExpExecArray | null

  while ((match = attrPattern.exec(rawAttrs))) {
    const attrName = match[1]
    if (!attrName || attrName === '/') {
      continue
    }

    const attrValue = match[2] ?? match[3] ?? match[4] ?? ''
    attrs[attrName] = normalizeAttributeValue(attrValue)
  }

  return {
    attrs: Object.keys(attrs).length ? attrs : undefined,
    closing,
    name,
    selfClosing,
  }
}

export const sanitizeMarkdownHtmlElement = (
  tag: string,
  attrs?: Record<string, unknown>,
): TrMarkdownSanitizedHtmlElement | undefined => {
  if (!tag) {
    return
  }

  if (!sanitizer) {
    sanitizer = createSanitizer()
  }

  if (!sanitizer || typeof document === 'undefined') {
    return
  }

  const serializedAttrs = Object.entries(attrs || {})
    .filter(([, value]) => value != null && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return ` ${key}`
      }

      return ` ${key}="${escapeAttributeValue(String(value))}"`
    })
    .join('')
  const sanitizedFragment = sanitizer.sanitize(`<${tag}${serializedAttrs}>__tr_markdown_html__</${tag}>`, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: {
      html: true,
      svg: false,
      svgFilters: false,
      mathMl: false,
    },
  }) as DocumentFragment
  const element = sanitizedFragment.firstElementChild

  if (!element) {
    return
  }

  return {
    attrs: element.attributes.length
      ? Object.fromEntries(Array.from(element.attributes).map((attribute) => [attribute.name, attribute.value]))
      : undefined,
    tag: element.tagName.toLowerCase(),
  }
}
