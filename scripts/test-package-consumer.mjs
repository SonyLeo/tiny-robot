import { createRequire } from 'node:module'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const repo = resolve(scriptDir, '..')
const pnpmVersion = '9.15.0'
const consumerFiles = {
  'index.html':
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>Packaged TinyRobot Markdown</title><div id="app"></div><script type="module" src="/main.js"></script></html>\n',
  'main.js': `import { createApp, h, ref } from 'vue'
import { TrMarkdown, TrThemeProvider } from '@opentiny/tiny-robot'
import '@opentiny/tiny-robot/dist/style.css'

const content = ref('# Packed Markdown\\n\\n3. Real ordered list\\n4. Next item')
const engine = ref('highlightjs')
createApp({
  setup() {
    return () => h(TrThemeProvider, { colorMode: 'dark' }, {
      default: () => [
        h('button', { id: 'show-code', onClick: () => { content.value += '\\n\\n' + String.fromCharCode(96).repeat(3) + 'ts\\nconst ready = true\\n' + String.fromCharCode(96).repeat(3) } }, 'Show code'),
        h('button', { id: 'show-python', onClick: () => { content.value += '\\n\\n' + String.fromCharCode(96).repeat(3) + 'python\\ndef ready():\\n    return True\\n' + String.fromCharCode(96).repeat(3) } }, 'Show Python'),
        h('button', { id: 'switch-engine', onClick: () => { engine.value = 'shiki' } }, 'Switch engine'),
        h(TrMarkdown, { content: content.value, code: { highlight: { engine: engine.value } } }),
      ],
    })
  },
}).mount('#app')
`,
}

const run = (command, args, cwd, options = {}) => {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
    maxBuffer: 10 * 1024 * 1024,
  })
}

const readPackedManifest = (archive) => {
  return JSON.parse(run('tar', ['-xOzf', archive, 'package/package.json'], repo))
}

const pack = (workspace, packDir) => {
  const { name, version } = JSON.parse(readFileSync(join(repo, workspace, 'package.json'), 'utf8'))
  run('pnpm', ['-C', workspace, 'pack', '--pack-destination', packDir], repo, { stdio: 'inherit' })
  return join(packDir, `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`)
}

const { chromium } = createRequire(join(repo, 'packages/test/package.json'))('@playwright/test')

const smoke = async () => {
  if (run('pnpm', ['--version'], repo).trim() !== pnpmVersion) {
    throw new Error(`This smoke requires pnpm ${pnpmVersion}`)
  }

  const staging = mkdtempSync(join(tmpdir(), 'tiny-robot-markdown-consumer-'))
  const packDir = mkdtempSync(join(tmpdir(), 'tiny-robot-markdown-pack-'))
  let preview
  let browser
  try {
    const svgArchive = pack('packages/svgs', packDir)
    const componentArchive = pack('packages/components', packDir)
    const svgManifest = readPackedManifest(svgArchive)
    const componentManifest = readPackedManifest(componentArchive)
    const workspaceRefs = JSON.stringify(componentManifest).match(/workspace:/g) || []
    if (workspaceRefs.length > 0) throw new Error('Packed component manifest still contains workspace: references')
    if (componentManifest.dependencies?.['@opentiny/tiny-robot-svgs'] !== svgManifest.version) {
      throw new Error('Packed component manifest did not rewrite the SVG workspace dependency to its package version')
    }

    const componentPackageName = componentManifest.name
    const svgPackageName = svgManifest.name
    const componentFile = basename(componentArchive)
    const svgFile = basename(svgArchive)
    copyFileSync(componentArchive, join(staging, componentFile))
    copyFileSync(svgArchive, join(staging, svgFile))
    writeFileSync(join(staging, 'index.html'), consumerFiles['index.html'])
    writeFileSync(join(staging, 'main.js'), consumerFiles['main.js'])
    writeFileSync(
      join(staging, 'package.json'),
      `${JSON.stringify(
        {
          name: 'tiny-robot-markdown-consumer-smoke',
          private: true,
          type: 'module',
          dependencies: {
            [componentPackageName]: `file:${componentFile}`,
            [svgPackageName]: `file:${svgFile}`,
            dompurify: '3.4.18',
            'markdown-it': '14.3.3',
            vue: '3.5.46',
          },
          devDependencies: { vite: '5.4.21' },
          pnpm: { overrides: { [svgPackageName]: `file:${svgFile}` } },
          packageManager: `pnpm@${pnpmVersion}`,
        },
        null,
        2,
      )}\n`,
    )

    run('pnpm', ['install', '--ignore-scripts', '--reporter=append-only'], staging, { stdio: 'inherit' })
    const installedManifest = JSON.parse(
      readFileSync(join(staging, 'node_modules/@opentiny/tiny-robot/package.json'), 'utf8'),
    )
    if (JSON.stringify(installedManifest).includes('workspace:')) {
      throw new Error('Installed TinyRobot package manifest still contains workspace: references')
    }

    run('pnpm', ['exec', 'vite', 'build'], staging, { stdio: 'inherit' })
    const { preview: serve } = await import(pathToFileURL(join(staging, 'node_modules/vite/dist/node/index.js')))
    preview = await serve({ root: staging, configFile: false, preview: { host: '127.0.0.1', port: 0 } })
    const { port } = preview.httpServer.address()
    const channel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || (process.env.CI ? undefined : 'chrome')
    browser = await chromium.launch({ channel })
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
    const pageErrors = []
    const responseUrls = new Set()
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('response', (response) => responseUrls.add(response.url()))
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })
    await page.locator('h1').filter({ hasText: 'Packed Markdown' }).waitFor({ state: 'visible' })
    await page
      .locator('ol[start="3"] li')
      .first()
      .filter({ hasText: 'Real ordered list' })
      .waitFor({ state: 'visible' })
    if ((await page.locator('html[data-tr-color-mode="dark"]').count()) !== 1) {
      throw new Error('Consumer page did not apply the dark color mode')
    }

    const resourcesBeforeCode = new Set(responseUrls)
    if (
      [...resourcesBeforeCode].some((url) =>
        /(?:core|typescript|engine-javascript|github-dark|python)-[^/]+\.js/i.test(url),
      )
    ) {
      throw new Error(`Highlight engine resource loaded before code was shown:\n${[...resourcesBeforeCode].join('\n')}`)
    }
    await page.locator('#show-code').click()
    try {
      await page
        .locator('.tr-markdown__code-snippet-wrap, .tr-markdown__code-block-wrap')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 })
    } catch (error) {
      throw new Error(
        `${error.message}\nPost-click body text:\n${await page.locator('body').innerText()}\nPost-click HTML:\n${await page.locator('#app').innerHTML()}\nPage errors:\n${pageErrors.join('\n')}`,
      )
    }
    const typescriptBlock = page.locator('.tr-markdown__code-snippet-wrap, .tr-markdown__code-block-wrap').first()
    await typescriptBlock.locator('.hljs-keyword').waitFor({ state: 'visible', timeout: 15_000 })
    const resourcesAfterCode = new Set(responseUrls)
    const highlightResources = [...resourcesAfterCode].filter((url) => !resourcesBeforeCode.has(url))
    if (!highlightResources.some((url) => /typescript-[^/]+\.js/i.test(url))) {
      throw new Error(`Highlight.js chunks were not loaded after showing code:\n${highlightResources.join('\n')}`)
    }
    await page.locator('#show-python').click()
    const pythonBlock = page.locator('.tr-markdown__code-snippet-wrap, .tr-markdown__code-block-wrap').nth(1)
    await pythonBlock.locator('.hljs-keyword').first().waitFor({ state: 'visible', timeout: 15_000 })
    const resourcesAfterPython = new Set(responseUrls)
    const pythonResources = [...resourcesAfterPython].filter((url) => !resourcesAfterCode.has(url))
    if (!pythonResources.some((url) => /python-[^/]+\.js/i.test(url))) {
      throw new Error(`Python chunk was not loaded after showing Python code:\n${pythonResources.join('\n')}`)
    }
    await page.locator('#switch-engine').click()
    await typescriptBlock.locator('pre.shiki').waitFor({ state: 'visible', timeout: 15_000 })
    const resourcesAfterShiki = new Set(responseUrls)
    const shikiResources = [...resourcesAfterShiki].filter((url) => !resourcesAfterPython.has(url))
    if (!shikiResources.some((url) => /engine-javascript-[^/]+\.js/i.test(url))) {
      throw new Error(`Shiki chunks were not loaded after switching engines:\n${shikiResources.join('\n')}`)
    }
    if (pageErrors.length) throw new Error(`Consumer browser errors:\n${pageErrors.join('\n')}`)

    console.log(
      'Packed Markdown consumer passed: workspace dependency rewriting, dark theme, ordered list, and on-demand TypeScript, Python, and Shiki chunks.',
    )
  } finally {
    if (browser) await browser.close()
    if (preview) await new Promise((resolve) => preview.httpServer.close(resolve))
    rmSync(staging, { recursive: true, force: true })
    rmSync(packDir, { recursive: true, force: true })
  }
}

await smoke()
