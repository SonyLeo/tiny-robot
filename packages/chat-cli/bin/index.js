#!/usr/bin/env node

import { intro, outro, text, select, isCancel } from '@clack/prompts'
import pc from 'picocolors'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, writeFileSync, readdirSync, readFileSync, copyFileSync, unlinkSync, existsSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const templatesDir = join(__dirname, '../templates')
const rootDir = join(__dirname, '../../..')

intro(pc.cyan('🤖 Create Tiny Robot Chat Kit Project'))

// 1. 项目名称
const projectName = await text({
  message: 'Project name:',
  placeholder: 'my-chat-app',
  validate: (value) => {
    if (!value) return 'Project name is required'
    if (!/^[a-z0-9-]+$/.test(value)) return 'Project name must contain only lowercase letters, numbers, and hyphens'
    return undefined
  },
})

if (isCancel(projectName)) {
  outro(pc.red('✖ Cancelled'))
  process.exit(0)
}

// 2. 模板选择
const template = await select({
  message: 'Select a template:',
  options: [
    { value: 'basic', label: 'Basic (Vue 3 + TypeScript)' },
    { value: 'coming-soon', label: 'Advanced (coming soon)', disabled: true },
  ],
})

if (isCancel(template)) {
  outro(pc.red('✖ Cancelled'))
  process.exit(0)
}

// 3. API Provider 选择
const provider = await select({
  message: 'Select API Provider:',
  options: [
    { value: 'openai', label: 'OpenAI' },
    { value: 'deepseek', label: 'DeepSeek' },
  ],
})

if (isCancel(provider)) {
  outro(pc.red('✖ Cancelled'))
  process.exit(0)
}

// 4. 创建项目目录
const projectDir = join(process.cwd(), projectName)
mkdirSync(projectDir, { recursive: true })

// 5. 复制模板文件
const templateDir = join(templatesDir, template)
copyTemplateFiles(templateDir, projectDir)

// 6. 重命名特殊文件
renameSpecialFiles(projectDir)

// 7. 更新 .env.example 中的 provider
updateEnvExample(projectDir, provider)

// 8. 更新 package.json 中的版本（将 workspace:* 替换为实际版本）
updatePackageVersions(projectDir)

outro(pc.green(`✓ Project created at ${pc.bold(projectDir)}`))
console.log(`\nNext steps:
  ${pc.cyan(`cd ${projectName}`)}
  ${pc.cyan('pnpm install')}
  ${pc.cyan('pnpm dev')}
`)

/**
 * 递归复制模板文件
 */
function copyTemplateFiles(src, dest) {
  const files = readdirSync(src, { withFileTypes: true })

  // 排除不需要复制的目录
  const excludeDirs = ['node_modules', '.git', '.dist', 'dist']

  for (const file of files) {
    // 跳过排除的目录
    if (excludeDirs.includes(file.name)) {
      continue
    }

    const srcPath = join(src, file.name)
    const destPath = join(dest, file.name)

    if (file.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyTemplateFiles(srcPath, destPath)
    } else {
      try {
        copyFileSync(srcPath, destPath)
      } catch (error) {
        console.warn(pc.yellow(`⚠ Failed to copy ${file.name}: ${error.message}`))
      }
    }
  }
}

/**
 * 重命名特殊文件（_gitignore -> .gitignore）
 */
function renameSpecialFiles(dir) {
  const files = readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const srcPath = join(dir, file.name)

    if (file.isDirectory()) {
      renameSpecialFiles(srcPath)
    } else if (file.name === '_gitignore') {
      const destPath = join(dir, '.gitignore')
      try {
        copyFileSync(srcPath, destPath)
        unlinkSync(srcPath)
      } catch (error) {
        console.warn(pc.yellow(`⚠ Failed to rename _gitignore: ${error.message}`))
      }
    } else if (file.name === '_env.example') {
      const destPath = join(dir, '.env.example')
      try {
        copyFileSync(srcPath, destPath)
        unlinkSync(srcPath)
      } catch (error) {
        console.warn(pc.yellow(`⚠ Failed to rename _env.example: ${error.message}`))
      }
    }
  }
}

/**
 * 更新 .env.example 中的 API Provider
 */
function updateEnvExample(dir, provider) {
  const envPath = join(dir, '.env.example')

  try {
    let content = readFileSync(envPath, 'utf-8')

    if (provider === 'openai') {
      content = content.replace('VITE_API_PROVIDER=', 'VITE_API_PROVIDER=openai')
    } else if (provider === 'deepseek') {
      content = content.replace('VITE_API_PROVIDER=', 'VITE_API_PROVIDER=deepseek')
    }

    writeFileSync(envPath, content, 'utf-8')
  } catch (error) {
    console.warn(pc.yellow(`⚠ Failed to update .env.example: ${error.message}`))
  }
}

/**
 * 更新 package.json 中的版本
 * 将 workspace:* 替换为实际版本号（从根 workspace 读取）
 */
function updatePackageVersions(dir) {
  const packageJsonPath = join(dir, 'package.json')

  try {
    const content = readFileSync(packageJsonPath, 'utf-8')
    const pkg = JSON.parse(content)

    // 检查是否在 workspace 环境中（根目录是否有 pnpm-workspace.yaml）
    const workspaceYamlPath = join(rootDir, 'pnpm-workspace.yaml')
    const isWorkspaceEnv = existsSync(workspaceYamlPath)

    if (isWorkspaceEnv) {
      // workspace 环境：保持 workspace:* 不变
      console.log(pc.cyan('ℹ Workspace environment detected, keeping workspace:* references'))
      return
    }

    // 非 workspace 环境：替换为版本号
    const rootPkgPath = join(rootDir, 'packages/chat/package.json')
    const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'))
    const chatVersion = rootPkg.version

    // 替换 workspace:* 为实际版本
    if (pkg.dependencies) {
      if (pkg.dependencies['@opentiny/tiny-robot']) {
        pkg.dependencies['@opentiny/tiny-robot'] = `^${chatVersion}`
      }
      if (pkg.dependencies['@opentiny/tiny-robot-svgs']) {
        pkg.dependencies['@opentiny/tiny-robot-svgs'] = `^${chatVersion}`
      }
      if (pkg.dependencies['@opentiny/tiny-robot-chat']) {
        pkg.dependencies['@opentiny/tiny-robot-chat'] = `^${chatVersion}`
      }
    }

    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
  } catch (error) {
    console.warn(pc.yellow('⚠ Could not update package versions', error))
  }
}
