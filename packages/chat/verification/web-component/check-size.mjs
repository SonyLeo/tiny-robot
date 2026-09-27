import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const directory = dirname(fileURLToPath(import.meta.url))
const report = JSON.parse(readFileSync(resolve(directory, 'bundle-report-baseline.json'), 'utf8'))
const outputDirectory = resolve(directory, '../../dist-web-component')
const files = readdirSync(outputDirectory).filter((name) => /\.(js|css)$/.test(name)).sort().map((name) => {
  const bytes = readFileSync(resolve(outputDirectory, name))
  return { name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length, sha256: createHash('sha256').update(bytes).digest('hex') }
})
assert(Array.isArray(report.files), 'Rebuild the bundle to generate artifact hashes')
assert.deepEqual(report.files.filter((file) => /\.(js|css)$/.test(file.name)).map((file) => file.name).sort(), files.map((file) => file.name),
  'Build report does not match the output file list')
for (const file of files) {
  assert.equal(report.files.find((reported) => reported.name === file.name)?.sha256, file.sha256,
    `Build report is stale for ${file.name}; rebuild before checking dependencies`)
}
const totalJsGzipBytes = files.filter((file) => file.name.endsWith('.js')).reduce((total, file) => total + file.gzipBytes, 0)
const totalCssGzipBytes = files.filter((file) => file.name.endsWith('.css')).reduce((total, file) => total + file.gzipBytes, 0)

assert(files.some((file) => file.name === 'index.js'), 'Chat entry is missing')
assert(files.some((file) => file.name === 'style.css'), 'Chat stylesheet is missing')
assert(totalJsGzipBytes <= 1_000_000, 'Total JS gzip exceeds the 1,000 kB review budget')
assert(totalCssGzipBytes <= 100_000, 'Total CSS gzip exceeds the 100 kB review budget')
const unexpected = ['echarts', 'zrender', '@opentiny/vue-grid', '@opentiny/fluent-editor', 'quill']
assert.deepEqual(report.groups.filter((group) => unexpected.includes(group.name)).map((group) => group.name), [],
  'Unrelated heavyweight dependencies returned to the Chat bundle')

const result = { result: 'pass', totalJsGzipBytes, totalCssGzipBytes, files, excludedDependencyGroups: unexpected }
writeFileSync(resolve(directory, 'size-check.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
