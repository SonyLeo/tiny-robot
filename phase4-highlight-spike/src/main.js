import hljsCore from 'highlight.js/lib/core'
import hljsBash from 'highlight.js/lib/languages/bash'
import hljsCss from 'highlight.js/lib/languages/css'
import hljsDiff from 'highlight.js/lib/languages/diff'
import hljsJavascript from 'highlight.js/lib/languages/javascript'
import hljsJson from 'highlight.js/lib/languages/json'
import hljsMarkdown from 'highlight.js/lib/languages/markdown'
import hljsTypescript from 'highlight.js/lib/languages/typescript'
import hljsXml from 'highlight.js/lib/languages/xml'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import * as shiki from 'shiki/core'
import bash from '@shikijs/langs/bash'
import css from '@shikijs/langs/css'
import diff from '@shikijs/langs/diff'
import html from '@shikijs/langs/html'
import javascript from '@shikijs/langs/javascript'
import json from '@shikijs/langs/json'
import jsx from '@shikijs/langs/jsx'
import markdown from '@shikijs/langs/markdown'
import tsx from '@shikijs/langs/tsx'
import typescript from '@shikijs/langs/typescript'
import xml from '@shikijs/langs/xml'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'

const fixtures = [
  {
    id: 'typescript',
    language: 'typescript',
    source: `type User = { id: number; name: string }\n\nexport async function loadUser(id: number): Promise<User> {\n  const response = await fetch(\`/api/users/\${id}\`)\n  if (!response.ok) throw new Error('request failed')\n  return response.json() as Promise<User>\n}`,
  },
  {
    id: 'python',
    language: 'python',
    source: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass User:\n    name: str\n    active: bool = True\n\ndef active_names(users: list[User]) -> list[str]:\n    return [user.name for user in users if user.active]`,
  },
  {
    id: 'sql',
    language: 'sql',
    source: `SELECT u.id, u.name, COUNT(o.id) AS order_count\nFROM users AS u\nLEFT JOIN orders AS o ON o.user_id = u.id\nWHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days'\nGROUP BY u.id, u.name\nORDER BY order_count DESC;`,
  },
  {
    id: 'yaml',
    language: 'yaml',
    source: `name: tiny-robot\nversion: 1\nservices:\n  web:\n    image: opentiny/tiny-robot:latest\n    environment:\n      NODE_ENV: production\n      FEATURE_FLAGS:\n        - markdown\n        - streaming`,
  },
  {
    id: 'json',
    language: 'json',
    source: `{"name":"tiny-robot","features":["markdown","streaming"],"limits":{"maxTokens":8192,"timeoutMs":30000}}`,
  },
  {
    id: 'shell',
    language: 'shell',
    source: `set -euo pipefail\n\nfor file in packages/*/package.json; do\n  jq -r '.name' "$file"\ndone | sort`,
  },
  {
    id: 'unknown',
    language: 'mermaid',
    source: `flowchart LR\n  input[Markdown source] --> parse[Parser]\n  parse --> render[Vue renderer]`,
  },
  {
    id: 'long-line',
    language: 'typescript',
    source: `const longLine = 'This deliberately long line checks horizontal overflow and token continuity without changing the shared code block container or font metrics.'\n${'// repeated content for a 100+ line block\n'.repeat(104)}export const total = ${104};`,
  },
]

const currentHljsLoaders = {
  bash: () => hljsBash,
  css: () => hljsCss,
  diff: () => hljsDiff,
  html: () => hljsXml,
  javascript: () => hljsJavascript,
  js: () => hljsJavascript,
  json: () => hljsJson,
  jsx: () => hljsJavascript,
  markdown: () => hljsMarkdown,
  md: () => hljsMarkdown,
  sh: () => hljsBash,
  shell: () => hljsBash,
  ts: () => hljsTypescript,
  tsx: () => hljsTypescript,
  typescript: () => hljsTypescript,
  xml: () => hljsXml,
}

const tunedOnlyLoaders = {
  python: () => import('highlight.js/lib/languages/python').then((module) => module.default),
  sql: () => import('highlight.js/lib/languages/sql').then((module) => module.default),
  yaml: () => import('highlight.js/lib/languages/yaml').then((module) => module.default),
}

const shikiLanguages = {
  bash,
  css,
  diff,
  html,
  javascript,
  json,
  jsx,
  markdown,
  tsx,
  typescript,
  xml,
}

// Keep this alias table in lockstep with getCodeLanguageMeta() in production.
// The current Shiki path resolves shell/sh, js, ts, md, and their long forms
// before checking its whitelist; an unmapped language intentionally uses text.
const shikiLanguageAliases = {
  sh: 'bash',
  shell: 'bash',
  js: 'javascript',
  ts: 'typescript',
  md: 'markdown',
}

const shikiThemes = {
  'github-dark': githubDark,
  'github-light': githubLight,
}

const engines = [
  { id: 'hljs-current', label: 'Highlight.js current', family: 'hljs' },
  { id: 'hljs-tuned', label: 'Highlight.js tuned + Python/SQL/YAML', family: 'hljs' },
  { id: 'shiki-current', label: 'Shiki current whitelist', family: 'shiki' },
]

const colors = {
  light: {
    page: '#f7f8fa',
    card: '#ffffff',
    border: '#d9dee8',
    text: '#191919',
    muted: '#667085',
    code: '#f5f7fb',
    keyword: '#1476ff',
    title: '#1562cc',
    type: '#1567da',
    attr: '#b52a2a',
    builtin: '#d17205',
    literal: '#bf6907',
    string: '#54a103',
    number: '#e37b03',
    variable: '#cb2c2c',
    comment: '#808080',
    background: '#fafafa',
  },
  dark: {
    page: '#15171b',
    card: '#202329',
    border: '#3b414d',
    text: '#f1f3f5',
    muted: '#a7afbd',
    code: '#17191d',
    keyword: '#5291ff',
    title: '#73a4fa',
    type: '#6a9ffb',
    attr: '#dd7469',
    builtin: '#fa9b2e',
    literal: '#f8a240',
    string: '#6caf66',
    number: '#fc931c',
    variable: '#db6457',
    comment: '#9199a7',
    background: '#191919',
  },
}

const tunedColors = {
  light: {
    ...colors.light,
    keyword: '#005fcc',
    title: '#0057b8',
    type: '#087f78',
    attr: '#b52f00',
    builtin: '#9a4f00',
    literal: '#9a4f00',
    string: '#087a32',
    number: '#8a4700',
    variable: '#a51d52',
    comment: '#6a6a6a',
  },
  dark: {
    ...colors.dark,
    keyword: '#70aaff',
    title: '#8cbbff',
    type: '#72d8ce',
    attr: '#ffae8f',
    builtin: '#ffc879',
    literal: '#ffc879',
    string: '#83e1a5',
    number: '#ffd17f',
    variable: '#ff9fc1',
    comment: '#aab2c0',
  },
}

const styles = `
  :root { font-family: Arial, "PingFang SC", "Microsoft YaHei", sans-serif; color: var(--text); background: var(--page); }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); }
  main { width: 100%; padding: 24px; }
  header { margin: 0 auto 18px; max-width: 1388px; }
  h1 { margin: 0 0 6px; font-size: 22px; }
  p { margin: 0; color: var(--muted); font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; max-width: 1388px; margin: 0 auto; }
  .card { min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: 8px; background: var(--card); }
  .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
  .card-head strong { font-size: 13px; }
  .card-head span { color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
  .code-wrap { padding: 13px 14px; background: var(--code); overflow: auto; min-height: 160px; }
  pre { margin: 0; font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre; }
  .metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; padding: 9px 12px 11px; color: var(--muted); font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace; }
  .metric strong { color: var(--text); font-weight: 600; }
  .hljs { color: var(--text); background: transparent; }
  .hljs-comment, .hljs-quote { color: var(--comment); font-style: italic; }
  .hljs-keyword, .hljs-selector-tag { color: var(--keyword); font-weight: 600; }
  .hljs-title, .hljs-section, .hljs-selector-id { color: var(--title); }
  .hljs-type, .hljs-class .hljs-title { color: var(--type); }
  .hljs-attr, .hljs-attribute, .hljs-property { color: var(--attr); }
  .hljs-built_in, .hljs-doctag { color: var(--builtin); }
  .hljs-literal, .hljs-symbol, .hljs-bullet { color: var(--literal); }
  .hljs-string, .hljs-regexp, .hljs-template-tag { color: var(--string); }
  .hljs-number { color: var(--number); }
  .hljs-variable, .hljs-template-variable, .hljs-link { color: var(--variable); }
  .shiki { margin: 0; background: transparent !important; font: inherit !important; }
  .shiki code { display: flex; flex-direction: column; gap: 0; font: inherit; }
  .shiki .line { display: block; white-space: pre; line-height: inherit; }
  @media (max-width: 1050px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 700px) { main { padding: 12px; } .grid { grid-template-columns: 1fr; } }
`

const normalizeLanguage = (language) => language.trim().toLowerCase()

const resolveShikiLanguage = (language) => {
  const normalized = normalizeLanguage(language)
  const resolved = shikiLanguageAliases[normalized] || normalized
  return shikiLanguages[resolved] ? resolved : 'text'
}

const registerHljsLanguage = async (language, tuned) => {
  const normalized = normalizeLanguage(language)
  const loader = currentHljsLoaders[normalized] || (tuned ? tunedOnlyLoaders[normalized] : undefined)
  if (!loader) return null
  if (!hljsCore.getLanguage(normalized)) {
    hljsCore.registerLanguage(normalized, await loader())
  }
  return normalized
}

const makeShikiHighlighter = async () => {
  const createHighlighter = shiki.createdBundledHighlighter({
    langs: Object.fromEntries(Object.entries(shikiLanguages).map(([key, value]) => [key, () => value])),
    themes: Object.fromEntries(Object.entries(shikiThemes).map(([key, value]) => [key, () => value])),
    engine: createJavaScriptRegexEngine,
  })
  const highlighter = await createHighlighter
  return { highlighter, codeToHtml: shiki.createSingletonShorthands(highlighter).codeToHtml }
}

const render = async () => {
  const params = new URLSearchParams(location.search)
  const theme = params.get('theme') === 'dark' ? 'dark' : 'light'
  const paletteName = params.get('palette') === 'tuned' ? 'tuned' : 'current'
  const palette = paletteName === 'tuned' ? tunedColors[theme] : colors[theme]
  document.documentElement.style.setProperty('--page', palette.page)
  document.documentElement.style.setProperty('--card', palette.card)
  document.documentElement.style.setProperty('--border', palette.border)
  document.documentElement.style.setProperty('--text', palette.text)
  document.documentElement.style.setProperty('--muted', palette.muted)
  document.documentElement.style.setProperty('--code', palette.background)
  const style = document.createElement('style')
  style.textContent = styles
  document.head.append(style)

  const app = document.querySelector('#app')
  app.innerHTML = `<header><h1>Phase 4 code highlight comparison · ${theme} · ${paletteName} token palette</h1><p>Each row uses the same source, code container, and font (12px / 1.55). The two Highlight.js columns share a palette; Shiki uses its inline token colors. Timings start after the adapters load and do not measure paint or network requests.</p></header><section class="grid"></section>`
  const grid = app.querySelector('.grid')
  const longTasks = []
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) longTasks.push({ name: entry.name, duration: entry.duration })
      })
      observer.observe({ type: 'longtask', buffered: true })
    } catch {}
  }

  const shikiStart = performance.now()
  const shikiRuntime = await makeShikiHighlighter()
  const shikiInitMs = performance.now() - shikiStart
  const results = []

  for (const fixture of fixtures) {
    for (const engine of engines) {
      const card = document.createElement('article')
      card.className = 'card'
      card.dataset.engine = engine.id
      card.dataset.fixture = fixture.id
      card.innerHTML = `<div class="card-head"><strong>${engine.label}</strong><span>${fixture.language}</span></div><div class="code-wrap"><pre></pre></div><div class="metrics"><div class="metric">plain DOM write <strong data-metric="first">pending</strong></div><div class="metric">highlight <strong data-metric="highlight">pending</strong></div><div class="metric">tokens <strong data-metric="tokens">pending</strong></div><div class="metric">fallback <strong data-metric="fallback">pending</strong></div></div>`
      grid.append(card)
      const codeWrap = card.querySelector('.code-wrap')
      const pre = card.querySelector('pre')
      const started = performance.now()
      pre.textContent = fixture.source
      const firstText = performance.now() - started
      card.querySelector('[data-metric="first"]').textContent = `${firstText.toFixed(2)} ms`

      let html = null
      let fallback = false
      if (engine.family === 'hljs') {
        const tuned = engine.id === 'hljs-tuned'
        const language = await registerHljsLanguage(fixture.language, tuned)
        if (language) {
          const highlighted = hljsCore.highlight(fixture.source, { language, ignoreIllegals: true })
          html = `<code class="hljs language-${language}">${highlighted.value}</code>`
        } else {
          fallback = true
        }
      } else {
        const shikiLanguage = resolveShikiLanguage(fixture.language)
        html = await shikiRuntime.codeToHtml(fixture.source, {
          lang: shikiLanguage,
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        })
        fallback = shikiLanguage === 'text'
      }

      if (html) {
        if (engine.family === 'shiki') codeWrap.innerHTML = html
        else pre.innerHTML = html
      }
      const highlightMs = performance.now() - started
      const tokenCount = codeWrap.querySelectorAll('span').length
      card.querySelector('[data-metric="highlight"]').textContent = `${highlightMs.toFixed(2)} ms`
      card.querySelector('[data-metric="tokens"]').textContent = String(tokenCount)
      card.querySelector('[data-metric="fallback"]').textContent = fallback ? 'yes' : 'no'
      results.push({
        engine: engine.id,
        fixture: fixture.id,
        language: fixture.language,
        theme,
        palette: paletteName,
        firstTextMs: Number(firstText.toFixed(3)),
        highlightCompleteMs: Number(highlightMs.toFixed(3)),
        tokenCount,
        fallback,
        sourceLength: fixture.source.length,
      })
    }
  }

  const contrast = {}
  for (const [name, value] of Object.entries(palette)) {
    if (['page', 'card', 'border', 'text', 'muted', 'code', 'background'].includes(name)) continue
    const probe = document.createElement('span')
    probe.style.cssText = `color:${value};background:${palette.background};position:absolute;visibility:hidden`
    document.body.append(probe)
    const rgb = getComputedStyle(probe).color.match(/\d+/g).map(Number)
    const bgRgb = palette.background.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part, 16))
    const luminance = (channels) =>
      channels
        .map((channel) => channel / 255)
        .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
        .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
    const foregroundLuminance = luminance(rgb)
    const backgroundLuminance = luminance(bgRgb)
    contrast[name] = Number(
      (
        (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
      ).toFixed(2),
    )
    probe.remove()
  }

  const output = {
    theme,
    palette: paletteName,
    paletteBackground: palette.background,
    contrast,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio: devicePixelRatio },
    shikiInitMs: Number(shikiInitMs.toFixed(3)),
    results,
    longTasks,
    streaming: [],
  }

  const mutationFixture = fixtures.find((fixture) => fixture.id === 'typescript')
  for (const engine of engines) {
    const base = mutationFixture.source
    const appended = `${base}\n\nexport const appended = true`
    const rewritten = base
      .replace('loadUser', 'loadCurrentUser')
      .replace("'request failed'", "'request failed after rewrite'")
    const measureMutation = async (source, kind) => {
      const started = performance.now()
      let renderedHtml = ''
      if (engine.family === 'hljs') {
        const language = await registerHljsLanguage(mutationFixture.language, engine.id === 'hljs-tuned')
        if (language)
          renderedHtml = `<code>${hljsCore.highlight(source, { language, ignoreIllegals: true }).value}</code>`
      } else {
        renderedHtml = await shikiRuntime.codeToHtml(source, {
          lang: resolveShikiLanguage(mutationFixture.language),
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        })
      }
      const probe = document.createElement('div')
      probe.innerHTML = renderedHtml
      const textMatchesSource = renderedHtml ? probe.textContent === source : true
      probe.remove()
      return {
        engine: engine.id,
        kind,
        sourceLength: source.length,
        elapsedMs: Number((performance.now() - started).toFixed(3)),
        textMatchesSource,
      }
    }
    output.streaming.push(await measureMutation(appended, 'append'), await measureMutation(rewritten, 'rewrite'))
  }
  document.body.dataset.status = 'complete'
  window.__PHASE4_RESULT__ = output
  const report = document.createElement('script')
  report.type = 'application/json'
  report.id = 'phase4-result'
  report.textContent = JSON.stringify(output)
  document.body.append(report)
}

render().catch((error) => {
  document.body.dataset.status = 'error'
  document.body.dataset.error = String(error?.stack || error)
  throw error
})
