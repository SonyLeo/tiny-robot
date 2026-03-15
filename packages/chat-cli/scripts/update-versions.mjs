#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { updateTemplateDependencyVersions } from './template-release-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const chatCliDir = join(__dirname, '..')
const packagesDir = join(__dirname, '../..')
const templatesDir = join(chatCliDir, 'templates')

updateTemplateDependencyVersions({
  templatesDir,
  packagesDir,
})
