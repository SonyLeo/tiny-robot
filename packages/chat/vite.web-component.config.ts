import vue from '@vitejs/plugin-vue'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const packageRoot = dirname(fileURLToPath(import.meta.url))
const variant = process.env.CHAT_WC_ANALYSIS_VARIANT ?? 'baseline'
const directImports = variant.includes('direct')
const aggregateImports = variant.startsWith('aggregate')
const inlineDynamicImports = variant === 'inline' || (variant !== 'baseline' && !variant.includes('split'))
const withoutMcp = variant.includes('no-mcp')
const withoutSuggestion = variant.includes('no-suggestion')
const withoutComponentCss = variant.includes('no-component-css')
const withoutDependencyCss = variant.includes('no-dependency-css')
const requireFromTinyVue = createRequire(resolve(packageRoot, '../test/node_modules/@opentiny/vue/package.json'))

function analysisVariant(): Plugin {
  return {
    name: 'chat-web-component-analysis-variant',
    enforce: 'pre',
    resolveId(source, importer) {
      if (aggregateImports && source === '@opentiny/vue') {
        return this.resolve(source, resolve(packageRoot, '../test/src/main.ts'), { skipSelf: true })
      }
      if (
        withoutMcp &&
        source === './ui/layout/ChatMcpPanel.vue' &&
        importer?.replaceAll('\\', '/').includes('/chat/src/ChatUI.vue')
      ) {
        return '\0chat-analysis-empty-mcp-panel'
      }
    },
    load(id) {
      if (id === '\0chat-analysis-empty-mcp-panel') return 'export default { render: () => null }'
    },
    transform(code, id) {
      const normalizedId = id.replaceAll('\\', '/')
      if (withoutDependencyCss && normalizedId.includes('/node_modules/') && /\.(css|less)(\?|$)/.test(normalizedId))
        return ''
      let transformed = code
      if (aggregateImports && normalizedId.includes('/packages/components/src/')) {
        transformed = transformed.replace(
          /import (Tiny\w+) from '@opentiny\/vue-[\w-]+'/g,
          "import { $1 } from '@opentiny/vue'",
        )
      }
      if (directImports && normalizedId.includes('/packages/components/src/')) {
        transformed = transformed.replace(/import \{ ([^}]+) \} from '@opentiny\/vue'/g, (_match, names: string) =>
          names
            .split(',')
            .map((name) => {
              const symbol = name.trim()
              const packageName = `@opentiny/vue-${symbol
                .slice(4)
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase()}`
              return `import ${symbol} from '${requireFromTinyVue.resolve(packageName).replaceAll('\\', '/')}'`
            })
            .join('\n'),
        )
      }
      if (withoutSuggestion && normalizedId.endsWith('/chat/verification/web-component/element.ts')) {
        transformed = transformed.replace('Sender.suggestion(suggestions)', '...[]')
      }
      if (withoutComponentCss && normalizedId.endsWith('/components/src/index.ts')) {
        transformed = transformed
          .replace("import './styles/root.css'", '')
          .replace("import './styles/components/index.css'", '')
      }
      if (transformed !== code) return transformed
    },
  }
}

function bundleReport(): Plugin {
  return {
    name: 'chat-web-component-bundle-report',
    apply: 'build',
    writeBundle(_options, bundle) {
      const modules = Object.values(bundle)
        .filter((item) => item.type === 'chunk')
        .flatMap((chunk) =>
          Object.entries(chunk.modules).map(([id, value]) => ({
            id: id.replaceAll('\\', '/'),
            renderedBytes: value.renderedLength,
          })),
        )
        .filter((item) => item.renderedBytes > 0)
      const groupFor = (id: string) => {
        const workspace = id.match(/\/packages\/(chat|components|kit|svgs)\//)
        if (workspace) return `workspace/${workspace[1]}`
        const marker = '/node_modules/'
        const position = id.lastIndexOf(marker)
        if (position < 0) return 'other'
        const parts = id.slice(position + marker.length).split('/')
        return parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
      }
      const groups = Object.entries(
        modules.reduce<Record<string, number>>((totals, module) => {
          const group = groupFor(module.id)
          totals[group] = (totals[group] ?? 0) + module.renderedBytes
          return totals
        }, {}),
      )
        .map(([name, renderedBytes]) => ({ name, renderedBytes }))
        .sort((a, b) => b.renderedBytes - a.renderedBytes)
      const report = {
        variant,
        files: Object.values(bundle).map((item) => {
          const bytes = Buffer.from(item.type === 'chunk' ? item.code : item.source)
          return { name: item.fileName, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
        }),
        dependencyResolution: [...this.getModuleIds()]
          .filter((id) => /\/@opentiny\/vue\/index\.js$/.test(id.replaceAll('\\', '/')))
          .map((id) => ({
            id,
            moduleSideEffects: this.getModuleInfo(id)?.moduleSideEffects,
            importers: this.getModuleInfo(id)?.importers,
            rendered: Object.values(bundle)
              .filter((item) => item.type === 'chunk')
              .map((chunk) => chunk.modules[id])
              .filter(Boolean),
            importerSnippet: this.getModuleInfo(this.getModuleInfo(id)?.importers[0] ?? '')?.code?.slice(0, 1400),
          })),
        note: 'Rollup renderedLength is before final minification; group totals estimate contribution, not compressed bytes.',
        totalRenderedBytes: modules.reduce((total, module) => total + module.renderedBytes, 0),
        groups,
        topModules: modules.sort((a, b) => b.renderedBytes - a.renderedBytes).slice(0, 80),
      }
      writeFileSync(
        resolve(packageRoot, `verification/web-component/bundle-report-${variant}.json`),
        JSON.stringify(report, null, 2),
      )
    },
  }
}

export default defineConfig({
  plugins: [analysisVariant(), vue(), bundleReport()],
  define: { 'process.env': '{}' },
  resolve: {
    alias: [
      { find: /^@opentiny\/tiny-robot-kit$/, replacement: resolve(packageRoot, '../kit/src/index.ts') },
      { find: /^@opentiny\/tiny-robot-svgs$/, replacement: resolve(packageRoot, '../svgs/src/index.ts') },
      { find: /^@opentiny\/tiny-robot$/, replacement: resolve(packageRoot, '../components/src/index.ts') },
    ],
  },
  build: {
    lib: {
      entry: resolve(packageRoot, 'verification/web-component/element.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      // Keep renderer imports lazy; forcing one chunk retains unrelated initialization code.
      output: { inlineDynamicImports },
    },
    outDir: resolve(
      packageRoot,
      variant === 'baseline' ? 'dist-web-component' : `verification/web-component/dist-${variant}`,
    ),
    emptyOutDir: true,
  },
})
