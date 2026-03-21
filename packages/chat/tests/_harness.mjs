import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const TEST_FILE_SUFFIX = '.test.mjs'
const TEST_FILE_IGNORE_PREFIX = '_'

export async function runTest(name, fn) {
  try {
    await fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

export async function expectThrowsAsync(fn, matcher) {
  let thrown = null

  try {
    await fn()
  } catch (error) {
    thrown = error
  }

  if (!thrown) {
    assert.fail('Expected async function to throw')
  }

  if (matcher instanceof RegExp) {
    assert.match(String(thrown?.message ?? thrown), matcher)
    return thrown
  }

  if (typeof matcher === 'function') {
    matcher(thrown)
  }

  return thrown
}

export async function listTestFiles(testDirUrl = new URL('./', import.meta.url)) {
  const testDirPath = fileURLToPath(testDirUrl)
  const entries = await readdir(testDirPath, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(TEST_FILE_SUFFIX) && !name.startsWith(TEST_FILE_IGNORE_PREFIX))
    .sort((left, right) => left.localeCompare(right))
}

export async function runAllTests(testDirUrl = new URL('./', import.meta.url)) {
  const files = await listTestFiles(testDirUrl)
  const testDirPath = fileURLToPath(testDirUrl)

  for (const file of files) {
    await import(pathToFileURL(join(testDirPath, file)).href)
  }

  console.log(`all ok - ${files.length} test files`)
}

export function resolveTestDir(importMetaUrl) {
  return dirname(fileURLToPath(importMetaUrl))
}
