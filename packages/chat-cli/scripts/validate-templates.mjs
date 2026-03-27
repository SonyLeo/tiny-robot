#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateTemplateContractUsageSource,
  validateTemplateDependencyClosure,
  validateTemplatePackages,
  validateTemplateRegistry,
} from './template-release-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templatesDir = join(__dirname, '../templates')
const packagesDir = join(__dirname, '../..')

let registryModule

try {
  registryModule = await import('../dist/templateRegistry.js')
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Template validation failed: build output "dist/templateRegistry.js" is unavailable. ${message}`)
  process.exit(1)
}

const { getChatCliTemplateRegistry, validateChatCliTemplateRegistry, CHAT_CLI_REQUIRED_FEATURE_KEYS } = registryModule

const errors = [
  ...validateTemplatePackages(templatesDir),
  ...validateChatCliTemplateRegistry(getChatCliTemplateRegistry()),
  ...validateTemplateRegistry({
    templatesDir,
    templateDefinitions: getChatCliTemplateRegistry(),
    validFeatureKeys: CHAT_CLI_REQUIRED_FEATURE_KEYS,
  }),
  ...validateTemplateDependencyClosure({
    templatesDir,
    packagesDir,
  }),
  ...validateTemplateContractUsageSource({
    templatesDir,
    templateDefinitions: getChatCliTemplateRegistry(),
  }),
]

if (errors.length > 0) {
  console.error('Template validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}
