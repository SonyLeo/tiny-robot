import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../../../chat-web-component/dist')
const files = readdirSync(directory).filter((name) => /\.(js|css)$/.test(name))
const total = (suffix) => files.filter((name) => name.endsWith(suffix))
  .reduce((sum, name) => sum + gzipSync(readFileSync(resolve(directory, name))).length, 0)
const jsGzipBytes = total('.js')
const cssGzipBytes = total('.css')
assert(files.includes('index.js') && files.includes('style.css'), 'Missing entry or stylesheet')
assert(jsGzipBytes <= 1_000_000, 'JS gzip exceeds 1,000 kB')
assert(cssGzipBytes <= 100_000, 'CSS gzip exceeds 100 kB')
console.log(JSON.stringify({ files, jsGzipBytes, cssGzipBytes }, null, 2))
