import { runAllTests } from './_harness.mjs'

await runAllTests(new URL('./', import.meta.url))
