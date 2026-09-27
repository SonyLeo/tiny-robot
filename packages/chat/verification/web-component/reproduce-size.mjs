import { build } from 'vite'
import { createRequire } from 'node:module'
import { realpathSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const directory = dirname(fileURLToPath(import.meta.url))
const requireTinyVue = createRequire(realpathSync(resolve(directory, '../../../test/node_modules/@opentiny/vue/package.json')))
const results = []

for (const variant of ['aggregate-used', 'direct-used', 'aggregate-reexport', 'aggregate-absolute-used', 'aggregate-no-effects-used', 'aggregate-split-used']) {
  const entry = resolve(directory, 'tooltip-size-entry.mjs')
  const aggregate = variant.startsWith('aggregate')
  const dependency = aggregate ? '@opentiny/vue' : '@opentiny/vue-tooltip'
  const target = requireTinyVue.resolve(dependency).replaceAll('\\', '/')
  let graph
  const output = await build({
    configFile: false,
    logLevel: 'warn',
    define: { 'process.env': '{}' },
    plugins: [{
      name: 'tooltip-size-entry',
      resolveId(source) {
        if (source === entry) return entry
        if (source === dependency) return this.resolve(source, requireTinyVue.resolve('@opentiny/vue'), { skipSelf: true })
      },
      load(id) {
        const source = variant === 'aggregate-absolute-used' ? target : dependency
        if (id === entry && variant.endsWith('-used')) return aggregate
          ? `import { TinyTooltip } from ${JSON.stringify(source)}; export const Tooltip = TinyTooltip`
          : `import TinyTooltip from ${JSON.stringify(source)}; export const Tooltip = TinyTooltip`
        if (id === entry) return aggregate
          ? `export { TinyTooltip as Tooltip } from ${JSON.stringify(source)}`
          : `export { default as Tooltip } from ${JSON.stringify(source)}`
      },
      generateBundle(_options, bundle) {
        const modules = Object.values(bundle).filter((item) => item.type === 'chunk').flatMap((chunk) => Object.entries(chunk.modules))
        const rendered = new Map(modules)
        graph = [...this.getModuleIds()].filter((id) => /@opentiny\/vue\/index\.js$|@opentiny\/vue-tooltip\/lib\/index\.js$/.test(id.replaceAll('\\', '/'))).map((id) => ({
          id, renderedLength: rendered.get(id)?.renderedLength ?? 0,
          moduleSideEffects: this.getModuleInfo(id).moduleSideEffects,
          importerCount: this.getModuleInfo(id).importers.length,
        }))
      },
    }],
    build: {
      write: false,
      lib: { entry, formats: ['es'] },
      rollupOptions: {
        output: { inlineDynamicImports: variant !== 'aggregate-split-used' },
        treeshake: variant === 'aggregate-no-effects-used' ? { moduleSideEffects: false } : undefined,
      },
    },
  })
  const bundle = Array.isArray(output) ? output.flatMap((item) => item.output) : output.output
  const result = { variant, graph, files: [], moduleGroups: {} }
  for (const item of bundle) {
    const buffer = Buffer.from(item.type === 'chunk' ? item.code : item.source)
    result.files.push({ name: item.fileName, bytes: buffer.length, gzipBytes: gzipSync(buffer).length })
    if (item.type === 'chunk') {
      for (const [id, module] of Object.entries(item.modules)) {
        if (!module.renderedLength) continue
        const parts = id.replaceAll('\\', '/').split('/node_modules/').at(-1).split('/')
        const group = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
        result.moduleGroups[group] = (result.moduleGroups[group] ?? 0) + module.renderedLength
      }
    }
  }
  results.push(result)
  console.log(JSON.stringify({ variant, files: result.files }))
}

writeFileSync(resolve(directory, 'tooltip-size-report.json'), JSON.stringify(results, null, 2))
