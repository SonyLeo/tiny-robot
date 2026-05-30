interface CodeLanguageMetaEntry {
  badge: string
  label: string
  shiki?: string
}

const codeLanguageMap: Record<string, CodeLanguageMetaEntry> = {
  bash: { badge: '>_', label: 'Bash', shiki: 'bash' },
  css: { badge: 'CSS', label: 'CSS', shiki: 'css' },
  diff: { badge: 'DI', label: 'Diff', shiki: 'diff' },
  html: { badge: 'HT', label: 'HTML', shiki: 'html' },
  javascript: { badge: 'JS', label: 'JavaScript', shiki: 'javascript' },
  js: { badge: 'JS', label: 'JavaScript', shiki: 'javascript' },
  json: { badge: '{}', label: 'JSON', shiki: 'json' },
  jsx: { badge: 'JSX', label: 'JSX', shiki: 'jsx' },
  markdown: { badge: 'MD', label: 'Markdown', shiki: 'markdown' },
  md: { badge: 'MD', label: 'Markdown', shiki: 'markdown' },
  sh: { badge: '>_', label: 'Shell', shiki: 'bash' },
  shell: { badge: '>_', label: 'Shell', shiki: 'bash' },
  ts: { badge: 'TS', label: 'TypeScript', shiki: 'typescript' },
  tsx: { badge: 'TSX', label: 'TSX', shiki: 'tsx' },
  typescript: { badge: 'TS', label: 'TypeScript', shiki: 'typescript' },
  xml: { badge: 'XML', label: 'XML', shiki: 'xml' },
}

export const normalizeCodeLanguage = (language?: string) => {
  return (language || '').trim().toLowerCase()
}

export const getCodeLanguageMeta = (language?: string) => {
  const normalized = normalizeCodeLanguage(language)
  const matched = codeLanguageMap[normalized]

  if (matched) {
    return {
      badge: matched.badge,
      label: matched.label,
      normalized,
      shiki: matched.shiki || normalized,
    }
  }

  const fallbackLabel = normalized || 'Code'
  const badge = fallbackLabel.slice(0, 3).toUpperCase()

  return {
    badge,
    label: fallbackLabel.charAt(0).toUpperCase() + fallbackLabel.slice(1),
    normalized,
    shiki: normalized || 'text',
  }
}
