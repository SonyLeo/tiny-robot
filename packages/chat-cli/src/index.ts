#!/usr/bin/env node

import { intro, outro, text, select, confirm, isCancel, cancel, spinner } from '@clack/prompts'
import pc from 'picocolors'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  mkdirSync,
  writeFileSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  renameSync,
  existsSync,
  rmdirSync,
  unlinkSync,
} from 'node:fs'
import { execSync } from 'node:child_process'

import { getBanner } from './banner.js'
import { inferPackageManager, getCommand } from './packageManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// src/ 构建到 dist/，templates 在 ../templates 相对于 dist/index.js
const templatesDir = join(__dirname, '../templates')

// ── CLI 参数解析 ──────────────────────────────────────────────
const { values: flags, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
  },
  strict: false,
  allowPositionals: true,
})

if (flags.help) {
  console.log(`
Usage: create-tiny-robot [options] [project-name]

Options:
  -h, --help      Display this help message
  -v, --version   Display version number

Examples:
  npm create tiny-robot my-app
  npx create-tiny-robot my-app
  pnpm create tiny-robot my-app
  bun create tiny-robot my-app
`)
  process.exit(0)
}

if (flags.version) {
  // import.meta.url 指向编译后的 dist/index.js，package.json 在上一层
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8')) as {
    name: string
    version: string
  }
  console.log(`${pkg.name} v${pkg.version}`)
  process.exit(0)
}

// 命令行第一个位置参数作为项目名（可跳过交互）
const argProjectName = positionals[0] as string | undefined

// ── 主流程 ───────────────────────────────────────────────────
async function init(): Promise<void> {
  // Banner（根据终端色深自动降级）
  console.log(getBanner())
  intro(pc.cyan("Welcome! Let's create your Tiny Robot project."))

  /**
   * 统一取消处理包装（参考 create-vue 的 unwrapPrompt 模式）
   * 任何 prompt 被 Ctrl+C 取消时，使用 cancel() 语义输出，然后退出。
   */
  async function unwrapPrompt<T>(promise: Promise<T | symbol>): Promise<T> {
    const result = await promise
    if (isCancel(result)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    return result as T
  }

  // ── 1. 项目名称 ────────────────────────────────────────────
  let projectName = argProjectName
  if (!projectName) {
    projectName = await unwrapPrompt(
      text({
        message: 'Project name:',
        placeholder: 'my-chat-app',
        validate: (value) => {
          if (!value) return 'Project name is required'
          if (!/^[a-z0-9-]+$/.test(value)) return 'Name must be lowercase letters, numbers, and hyphens only'
          return undefined
        },
      }),
    )
  }

  // ── 2. 目标目录安全检查 ────────────────────────────────────
  const projectDir = join(process.cwd(), projectName)
  if (existsSync(projectDir) && readdirSync(projectDir).length > 0) {
    const overwrite = await unwrapPrompt(
      confirm({
        message: `Directory "${projectName}" already exists and is not empty. Overwrite?`,
        initialValue: false,
      }),
    )
    if (!overwrite) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    emptyDir(projectDir)
  }

  // ── 3. 模板选择 ────────────────────────────────────────────
  const template = await unwrapPrompt(
    select({
      message: 'Select a template:',
      options: [
        { value: 'basic', label: 'Basic Chat Agent', hint: 'Vue 3 + TypeScript + OpenAI/DeepSeek' },
        { value: 'with-context', label: 'Chat + Context Management', hint: 'coming soon' },
        { value: 'with-mcp', label: 'Chat + MCP Tools', hint: 'coming soon' },
        { value: 'with-rag', label: 'Chat + RAG', hint: 'coming soon' },
      ],
    }),
  )

  // coming soon 模板处理
  if (template !== 'basic') {
    cancel('This template is not available yet. Please select "basic".')
    process.exit(0)
  }

  // TODO: Phase 2 — 增加 JavaScript 模板选择
  // const language = await unwrapPrompt(select({
  //   message: 'Select language:',
  //   options: [
  //     { value: 'typescript', label: 'TypeScript' },
  //     { value: 'javascript', label: 'JavaScript', hint: 'coming soon' },
  //   ],
  // }))

  // ── 4. API Provider 选择 ───────────────────────────────────
  const provider = await unwrapPrompt(
    select({
      message: 'Select API Provider:',
      options: [
        { value: 'openai', label: 'OpenAI', hint: 'GPT-4o, GPT-4o-mini, etc.' },
        { value: 'deepseek', label: 'DeepSeek', hint: 'deepseek-chat, deepseek-coder' },
        { value: 'custom', label: 'Custom', hint: 'Bring your own responseProvider' },
      ],
    }),
  )

  // ── 5. 安装依赖确认 ────────────────────────────────────────
  const pm = inferPackageManager()
  const shouldInstall = await unwrapPrompt(
    confirm({
      message: `Install dependencies? (via ${pm})`,
      initialValue: true,
    }),
  )

  // ── 6. 创建项目目录并复制模板文件 ─────────────────────────
  mkdirSync(projectDir, { recursive: true })

  const templateDir = join(templatesDir, template)
  copyTemplateFiles(templateDir, projectDir)

  // ── 7. 重命名特殊文件（使用原子 renameSync）───────────────
  renameSpecialFiles(projectDir)

  // ── 8. 更新 .env.example 中的 provider ────────────────────
  updateEnvExample(projectDir, provider)

  // ── 9. 安装依赖（若用户选择）─────────────────────────────
  if (shouldInstall) {
    const s = spinner()
    const installCmd = getCommand(pm, 'install')
    s.start(`Running ${installCmd}...`)
    try {
      execSync(installCmd, { cwd: projectDir, stdio: 'pipe' })
      s.stop(`Dependencies installed via ${pm}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      s.stop(pc.yellow(`⚠ Install failed: ${msg}\n  Please run "${installCmd}" manually.`))
    }
  }

  // ── 10. 完成提示 ───────────────────────────────────────────
  outro(pc.green(`✓ Project "${projectName}" created!`))

  const devCmd = getCommand(pm, 'dev')

  console.log(`\n  ${pc.bold('Next steps:')}`)
  if (projectDir !== process.cwd()) {
    console.log(`  ${pc.cyan(`cd ${projectName}`)}`)
  }
  console.log(`  ${pc.cyan('cp .env.example .env.local')}   ${pc.gray('# 填入你的 API Key')}`)
  if (!shouldInstall) {
    console.log(`  ${pc.cyan(getCommand(pm, 'install'))}`)
  }
  console.log(`  ${pc.cyan(devCmd)}`)
  console.log('')
}

init().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})

// ── 工具函数 ─────────────────────────────────────────────────

/** 清空目录内容，保留目录本身 */
function emptyDir(dir: string): void {
  if (!existsSync(dir)) return
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, file.name)
    if (file.isDirectory()) {
      emptyDir(fullPath)
      rmdirSync(fullPath)
    } else {
      unlinkSync(fullPath)
    }
  }
}

/** 递归复制模板文件，跳过 node_modules / .git / dist 等目录 */
function copyTemplateFiles(src: string, dest: string): void {
  const excludeDirs = new Set(['node_modules', '.git', '.dist', 'dist'])
  const files = readdirSync(src, { withFileTypes: true })

  for (const file of files) {
    if (excludeDirs.has(file.name)) continue

    const srcPath = join(src, file.name)
    const destPath = join(dest, file.name)

    if (file.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyTemplateFiles(srcPath, destPath)
    } else {
      try {
        copyFileSync(srcPath, destPath)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.warn(pc.yellow(`⚠ Failed to copy ${file.name}: ${msg}`))
      }
    }
  }
}

/**
 * 递归重命名特殊文件（使用原子 renameSync，避免 copy+unlink 非原子风险）
 *   _gitignore   → .gitignore
 *   _env.example → .env.example
 */
function renameSpecialFiles(dir: string): void {
  const RENAMES: Record<string, string> = {
    _gitignore: '.gitignore',
    '_env.example': '.env.example',
  }
  const files = readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const srcPath = join(dir, file.name)
    if (file.isDirectory()) {
      renameSpecialFiles(srcPath)
    } else if (RENAMES[file.name]) {
      const destPath = join(dir, RENAMES[file.name])
      try {
        renameSync(srcPath, destPath)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.warn(pc.yellow(`⚠ Failed to rename ${file.name}: ${msg}`))
      }
    }
  }
}

/** 更新 .env.example 中的 VITE_API_PROVIDER（正则行替换，避免字符串拼接陷阱） */
function updateEnvExample(dir: string, provider: string): void {
  const envPath = join(dir, '.env.example')
  if (!existsSync(envPath)) return

  try {
    let content = readFileSync(envPath, 'utf-8')
    content = content.replace(/^VITE_API_PROVIDER=.*$/m, `VITE_API_PROVIDER=${provider}`)
    writeFileSync(envPath, content, 'utf-8')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.warn(pc.yellow(`⚠ Failed to update .env.example: ${msg}`))
  }
}
