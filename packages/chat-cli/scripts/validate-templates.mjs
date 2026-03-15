#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateTemplatePackages } from './template-release-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templatesDir = join(__dirname, '../templates')

const errors = validateTemplatePackages(templatesDir)

if (errors.length > 0) {
  console.error('Template validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}
