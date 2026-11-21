import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createWriteStream, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..')
const resultsDir = process.env.PHASE4_RESULTS_DIR ? resolve(process.env.PHASE4_RESULTS_DIR) : join(here, 'results')
const consumerDir = join(resultsDir, 'consumer-dist')
const tunedConsumerDir = join(resultsDir, 'consumer-tuned-dist')
const requireFromComponents = createRequire(join(repo, 'packages/components/package.json'))
const { createServer, build } = requireFromComponents('vite')
const { chromium } = createRequire(join(repo, 'node_modules/.pnpm/playwright@1.62.0/node_modules/playwright/index.js'))(
  'playwright',
)

const packageAliases = {
  'highlight.js': resolve(repo, 'packages/components/node_modules/highlight.js'),
  'shiki/core': resolve(repo, 'packages/components/node_modules/shiki/dist/core.mjs'),
  'shiki/engine/javascript': resolve(repo, 'packages/components/node_modules/shiki/dist/engine-javascript.mjs'),
  shiki: resolve(repo, 'packages/components/node_modules/shiki'),
  '@shikijs/langs': resolve(repo, 'packages/components/node_modules/@shikijs/langs/dist'),
  '@shikijs/themes': resolve(repo, 'packages/components/node_modules/@shikijs/themes/dist'),
}

const write = async (path, content) => {
  const stream = createWriteStream(path)
  stream.write(content)
  stream.end()
  await new Promise((resolvePromise, reject) => {
    stream.on('finish', resolvePromise)
    stream.on('error', reject)
  })
}

const ensureResultsDir = () => {
  execFileSync('mkdir', ['-p', consumerDir], { cwd: repo, stdio: 'ignore' })
}

const runBrowser = async () => {
  const server = await createServer({
    root: here,
    resolve: { alias: packageAliases },
    server: { port: 0, strictPort: false },
    logLevel: 'warn',
  })
  await server.listen()
  const baseUrl = server.resolvedUrls?.local?.[0] || 'http://localhost:5173/'
  const browser = await chromium.launch({ headless: true })
  const browserResults = []
  try {
    for (const theme of ['light', 'dark']) {
      for (const palette of ['current', 'tuned']) {
        const context = await browser.newContext({
          viewport: { width: 1440, height: 1100 },
          deviceScaleFactor: 1,
          colorScheme: theme,
        })
        const page = await context.newPage()
        await page.goto(`${baseUrl}?theme=${theme}&palette=${palette}`, { waitUntil: 'networkidle' })
        await page.locator('body[data-status="complete"]').waitFor({ timeout: 30000 })
        await page.screenshot({ path: join(resultsDir, `${theme}-${palette}.png`), fullPage: true })
        const data = await page.evaluate(() => window.__PHASE4_RESULT__)
        browserResults.push(data)
        await write(join(resultsDir, `browser-report-${theme}-${palette}.html`), await page.content())
        await context.close()
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  await write(
    join(resultsDir, 'browser-results.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), source: 'phase4-highlight-spike/src/main.js', runs: browserResults },
      null,
      2,
    ) + '\n',
  )
}

const runConsumerBuild = async () => {
  const buildConsumer = async (entry, outDir) =>
    build({
      root: here,
      configFile: false,
      logLevel: 'warn',
      resolve: { alias: packageAliases },
      build: {
        outDir,
        emptyOutDir: true,
        minify: true,
        target: 'es2020',
        rollupOptions: {
          input: entry,
          output: {
            entryFileNames: 'consumer.js',
            chunkFileNames: 'chunk-[name]-[hash].js',
            assetFileNames: 'asset-[name]-[hash][extname]',
          },
        },
      },
    })

  await buildConsumer(join(here, 'consumer-entry.js'), consumerDir)
  await buildConsumer(join(here, 'consumer-tuned-entry.js'), tunedConsumerDir)

  const collectFiles = async (dir) => {
    const files = []
    const { readdirSync, statSync, readFileSync } = await import('node:fs')
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (!statSync(path).isFile()) continue
      const content = readFileSync(path)
      files.push({
        name,
        bytes: content.byteLength,
        gzipBytes: gzipSync(content, { level: 9 }).byteLength,
        sha256: createHash('sha256').update(content).digest('hex'),
      })
    }
    return files.sort((a, b) => a.name.localeCompare(b.name))
  }
  const files = await collectFiles(consumerDir)
  const tunedFiles = await collectFiles(tunedConsumerDir)
  const result = {
    generatedAt: new Date().toISOString(),
    entry: 'packages/components/dist/markdown/index.js via isolated consumer-entry.js',
    sourceBuild: 'fresh packages/components/dist produced by root baseline build; contains in-flight Phase 2–3 edits',
    output: files.sort((a, b) => a.name.localeCompare(b.name)),
    tunedOutput: tunedFiles,
    tunedDelta: {
      totalBytes:
        tunedFiles.reduce((sum, file) => sum + file.bytes, 0) - files.reduce((sum, file) => sum + file.bytes, 0),
      totalGzipBytes:
        tunedFiles.reduce((sum, file) => sum + file.gzipBytes, 0) -
        files.reduce((sum, file) => sum + file.gzipBytes, 0),
      addedFiles: tunedFiles
        .filter((file) => !files.some((base) => base.sha256 === file.sha256))
        .map((file) => ({ name: file.name, bytes: file.bytes, gzipBytes: file.gzipBytes })),
    },
    notes: [
      'This is a Vite consumer closure, not the library unpacked size.',
      'Initial synchronous consumer entry is consumer.js; dynamically imported chunks are loaded only when code highlighting executes.',
      'The output is isolated under phase4-highlight-spike/results/consumer-dist and does not write packages/components/dist.',
      'tunedOutput is a separate consumer closure that adds Python, SQL, and YAML dynamic language imports; tunedDelta is a rough emitted closure delta because Vite hashes and shared chunking can change between builds.',
    ],
  }
  await write(join(resultsDir, 'consumer-build.json'), JSON.stringify(result, null, 2) + '\n')
}

ensureResultsDir()
await runBrowser()
await runConsumerBuild()
console.log(`Phase 4 results written to ${resultsDir}`)
