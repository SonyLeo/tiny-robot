import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runAllTests } from './_harness.mjs'

const testDirUrl = process.argv[2]
  ? pathToFileURL(resolve(process.cwd(), process.argv[2]))
  : new URL('./', import.meta.url)

await runAllTests(testDirUrl)
