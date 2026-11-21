import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..')
const privatePrefix = join(here, '.npm-prefix')
const resultsDir = process.env.PHASE5_RESULTS_DIR ? resolve(process.env.PHASE5_RESULTS_DIR) : join(here, 'results')
const requireFromComponents = createRequire(join(repo, 'packages/components/package.json'))
const { createServer } = requireFromComponents('vite')
const { chromium } = createRequire(join(repo, 'node_modules/.pnpm/playwright@1.62.0/node_modules/playwright/index.js'))(
  'playwright',
)

const ensureRemend = () => {
  const packageJson = join(privatePrefix, 'node_modules/remend/package.json')
  if (existsSync(packageJson) && JSON.parse(readFileSync(packageJson, 'utf8')).version === '1.5.0') return
  mkdirSync(privatePrefix, { recursive: true })
  execFileSync(
    'npm',
    ['install', '--prefix', privatePrefix, '--no-save', '--package-lock=false', '--ignore-scripts', 'remend@1.5.0'],
    {
      cwd: here,
      stdio: 'inherit',
    },
  )
}

const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)

const escapeMarkdown = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>')

const formatMetricRow = (label, value) => `| ${label} | ${value} |`

const makeReport = (result) => {
  const { metrics, steps } = result
  const interesting = steps.filter(
    (step) =>
      step.kind === 'finalize' ||
      step.metrics.protocolBenefit ||
      step.metrics.textOnlyBenefit ||
      step.metrics.protocolPlaceholder,
  )
  const lines = [
    '# Phase 5A remend benchmark report',
    '',
    `Generated: ${result.generatedAt}`,
    '',
    'This report compares the current source stream state with temporary previews produced by remend 1.5.0. Finalization parses the original source for every case; repaired preview strings are never used as final parser input.',
    '',
    '## Exact method',
    '',
    '- Browser: Vite + Chromium from Playwright 1.62.0, one cold page run.',
    '- Current: `resolveMarkdownStreamState(source, { enabled: true, active: true, showTail: true, smoothingChars: 8 })`; only `stableContent` goes through the current `markdownItAdapter`, and `tailContent` is kept as temporary raw text.',
    '- remend protocol: `remend(source)` with the package default `linkMode: "protocol"`.',
    '- remend text-only: `remend(source, { linkMode: "text-only" })`.',
    '- Each scenario uses the listed prefix cuts, then a full-source finalize step; rewrite cases use complete replacement strings.',
    '- Node signatures include node type, tag, text, link href/image src, and child count. These are the parser/render-node shapes consumed by the existing renderer, not a replacement production renderer. Placeholder observations are counted when they reach node attributes; the browser check records DOM attribute/property normalization only and does not claim a click or navigation.',
    '',
    '## Results',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    formatMetricRow('all steps', metrics.totalSteps),
    formatMetricRow('append prefixes', metrics.appendSteps),
    formatMetricRow('finalize steps', metrics.finalizeSteps),
    formatMetricRow('rewrite steps', metrics.rewriteSteps),
    formatMetricRow('protocol preview benefits over current', metrics.protocolBenefits),
    formatMetricRow('text-only preview benefits over current', metrics.textOnlyBenefits),
    formatMetricRow('protocol previews reaching placeholder node attributes', metrics.protocolPlaceholderSteps),
    formatMetricRow('text-only previews containing placeholder URL', metrics.textOnlyPlaceholderSteps),
    formatMetricRow('protocol preview source mutations', metrics.protocolSourceMutations),
    formatMetricRow('text-only preview source mutations', metrics.textOnlySourceMutations),
    formatMetricRow('stable + tail exact source invariance failures', metrics.stableInvariantFailures),
    formatMetricRow('finalize/current versus active=false original mismatches', metrics.finalizeOriginalMismatches),
    '',
    'The source mutation counts are expected for a temporary preprocessor and are the reason source, offsets, copied source, and final parser input must remain separate. Finalize is checked separately against `resolveMarkdownStreamState(original, { active: false })` and parsing that original source. Placeholder observations are deliberately scoped to parser node attributes plus browser DOM normalization for these benign package strings; this harness does not claim a click or navigation occurred. Protocol mode reaches an anchor node with the `streamdown:` attribute, while the image placeholder reaches an img source attribute. Text-only mode removes incomplete link markup, but image completion still uses the exported image placeholder.',
    '',
    '## Interesting per-step observations',
    '',
    '| Scenario | Kind | Source prefix | Current tail | Protocol preview | Text-only preview | Placeholder |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ]
  for (const step of interesting) {
    lines.push(
      `| ${step.scenarioId} | ${step.kind} | ${escapeMarkdown(step.source)} | ${escapeMarkdown(step.current.tailKind + ': ' + step.current.tailContent)} | ${escapeMarkdown(step.remendProtocol.repaired ?? '')} | ${escapeMarkdown(step.remendTextOnly.repaired ?? '')} | ${step.metrics.protocolPlaceholder ? 'yes' : 'no'} |`,
    )
  }
  lines.push(
    '',
    '## Handler decision',
    '',
    'The benchmark does not justify deleting the current code-fence scanner, fence hold, table hold, or raw tail surface. Remend does not provide the current table/fence stable boundary, and protocol placeholders require a renderer safety change. The current link/image hold handlers could only be reconsidered for a temporary preview path after an explicit inert placeholder guard; they remain needed for source fidelity and the current raw-tail behavior. The smoother still owns ordinary text-tail pacing and is outside remend’s syntax completion.',
    '',
    'Remend provides a concrete temporary-preview benefit for incomplete emphasis and inline code in this corpus, while currency remains protected when inline KaTeX is disabled. The benefit is therefore additive and narrow: it can reduce visible raw-tail time for selected inline markers, but it cannot replace the current stream state machine.',
    '',
    '## 5B metadata note',
    '',
    'No full renderer prototype was started. Public metadata checks: `@comark/vue@0.9.2` declares Vue `^3.5.43` (plus KaTeX `^0.19.1`, Shiki `^4.6.0`, Nuxt kit/schema, and beautiful-mermaid), while TinyRobot supports Vue `^3.3.11`; that peer floor would require widening the package contract. `markstream-vue@2.0.29` is MIT licensed and declares Vue `>=3.0.0` with KaTeX/Mermaid-related peers, so package availability and the Vue floor do not block it. The 5B decision is still skip: this benchmark found no sufficient measured or known replaceable responsibility, while a full renderer would retain UI/theme/security integration and add adapter migration cost. No 5B prototype was started.',
    '',
  )
  return `${lines.join('\n')}\n`
}

const makeHtml = (result) => {
  const report = makeReport(result)
  return `<!doctype html><meta charset="utf-8"><title>Phase 5A remend report</title><style>body{font:14px/1.45 system-ui;margin:24px}pre{white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:6px;vertical-align:top}th{background:#eee;text-align:left}</style><pre>${report.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</pre>`
}

const runBrowser = async () => {
  const alias = { remend: resolve(privatePrefix, 'node_modules/remend') }
  const server = await createServer({
    root: here,
    resolve: { alias },
    server: { port: 0, strictPort: false },
    logLevel: 'warn',
  })
  await server.listen()
  const baseUrl = server.resolvedUrls?.local?.[0] || 'http://localhost:5173/'
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.locator('#status').waitFor({ state: 'visible', timeout: 30_000 })
    await page.waitForFunction(
      () => document.querySelector('#status')?.textContent === 'complete' || window.__PHASE5_ERROR__,
    )
    if (await page.evaluate(() => window.__PHASE5_ERROR__))
      throw new Error(await page.evaluate(() => window.__PHASE5_ERROR__))
    return await page.evaluate(() => window.__PHASE5_RESULT__)
  } finally {
    await browser.close()
    await server.close()
  }
}

ensureRemend()
mkdirSync(resultsDir, { recursive: true })
const result = await runBrowser()
writeJson(join(resultsDir, 'phase5-results.json'), result)
writeFileSync(join(resultsDir, 'phase5-report.md'), makeReport(result))
writeFileSync(join(resultsDir, 'phase5-report.html'), makeHtml(result))
console.log(`Phase 5A results written to ${resultsDir}`)
console.log(JSON.stringify(result.metrics, null, 2))
