import { expect, test } from '@playwright/test'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { getCommand, inferPackageManager } from '../../../chat-cli/src/packageManager'
import {
  collectWorkspacePackageVersions,
  updateTemplateDependencyVersions,
  validateTemplatePackages,
} from '../../../chat-cli/scripts/template-release-utils.mjs'

function createTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

test.describe('chat-cli package manager helpers', () => {
  test('inferPackageManager should follow npm_config_user_agent', async () => {
    const previous = process.env.npm_config_user_agent

    try {
      process.env.npm_config_user_agent = 'pnpm/9.0.0 npm/? node/v20.11.0'
      expect(inferPackageManager()).toBe('pnpm')

      process.env.npm_config_user_agent = 'yarn/1.22.0 npm/? node/v20.11.0'
      expect(inferPackageManager()).toBe('yarn')

      process.env.npm_config_user_agent = 'bun/1.1.0 npm/? node/v20.11.0'
      expect(inferPackageManager()).toBe('bun')

      process.env.npm_config_user_agent = ''
      expect(inferPackageManager()).toBe('npm')
    } finally {
      if (previous === undefined) {
        delete process.env.npm_config_user_agent
      } else {
        process.env.npm_config_user_agent = previous
      }
    }
  })

  test('getCommand should map install and run commands consistently', async () => {
    expect(getCommand('npm', 'install')).toBe('npm install')
    expect(getCommand('pnpm', 'dev')).toBe('pnpm run dev')
    expect(getCommand('bun', 'build')).toBe('bun run build')
    expect(getCommand('yarn', 'install')).toBe('yarn')
    expect(getCommand('yarn', 'preview')).toBe('yarn preview')
  })
})

test.describe('chat-cli release helpers', () => {
  test('collectWorkspacePackageVersions should read package versions from a packages root', async () => {
    const packagesDir = createTempDir('tiny-robot-chat-cli-packages-')

    try {
      mkdirSync(join(packagesDir, 'chat'), { recursive: true })
      mkdirSync(join(packagesDir, 'kit'), { recursive: true })

      writeJson(join(packagesDir, 'chat', 'package.json'), { name: '@opentiny/tiny-robot-chat', version: '1.2.3' })
      writeJson(join(packagesDir, 'kit', 'package.json'), { name: '@opentiny/tiny-robot-kit', version: '4.5.6' })

      const versions = collectWorkspacePackageVersions(packagesDir, {
        '@opentiny/tiny-robot-chat': 'chat',
        '@opentiny/tiny-robot-kit': 'kit',
      })

      expect(versions).toEqual({
        '@opentiny/tiny-robot-chat': '1.2.3',
        '@opentiny/tiny-robot-kit': '4.5.6',
      })
    } finally {
      rmSync(packagesDir, { recursive: true, force: true })
    }
  })

  test('updateTemplateDependencyVersions should replace workspace ranges in template package.json files', async () => {
    const root = createTempDir('tiny-robot-chat-cli-release-')
    const packagesDir = join(root, 'packages')
    const templatesDir = join(root, 'templates')

    try {
      mkdirSync(join(packagesDir, 'chat'), { recursive: true })
      mkdirSync(join(packagesDir, 'kit'), { recursive: true })
      mkdirSync(join(templatesDir, 'basic'), { recursive: true })

      writeJson(join(packagesDir, 'chat', 'package.json'), { version: '2.0.0' })
      writeJson(join(packagesDir, 'kit', 'package.json'), { version: '3.0.0' })
      writeJson(join(templatesDir, 'basic', 'package.json'), {
        name: 'example-app',
        dependencies: {
          '@opentiny/tiny-robot-chat': 'workspace:*',
          '@opentiny/tiny-robot-kit': 'workspace:*',
          vue: '^3.4.0',
        },
      })

      const result = updateTemplateDependencyVersions({
        templatesDir,
        packagesDir,
        packageDirectoryMap: {
          '@opentiny/tiny-robot-chat': 'chat',
          '@opentiny/tiny-robot-kit': 'kit',
        },
      })

      expect(result.updatedCount).toBe(1)

      const packageJsonContent = readFileSync(join(templatesDir, 'basic', 'package.json'), 'utf-8')
      expect(packageJsonContent).toContain('"@opentiny/tiny-robot-chat": "^2.0.0"')
      expect(packageJsonContent).toContain('"@opentiny/tiny-robot-kit": "^3.0.0"')
      expect(packageJsonContent).not.toContain('workspace:*')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('validateTemplatePackages should report remaining workspace dependencies', async () => {
    const templatesDir = createTempDir('tiny-robot-chat-cli-validate-')

    try {
      mkdirSync(join(templatesDir, 'basic'), { recursive: true })
      writeJson(join(templatesDir, 'basic', 'package.json'), {
        name: 'example-app',
        dependencies: {
          '@opentiny/tiny-robot-chat': 'workspace:*',
        },
      })

      const errors = validateTemplatePackages(templatesDir)
      expect(errors).toEqual(['basic/package.json still contains workspace:* dependencies'])
    } finally {
      rmSync(templatesDir, { recursive: true, force: true })
    }
  })
})
