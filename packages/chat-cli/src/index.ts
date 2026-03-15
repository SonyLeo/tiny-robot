#!/usr/bin/env node

import { cancel, confirm, intro, isCancel, outro, select, spinner, text } from '@clack/prompts'
import pc from 'picocolors'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { getBanner } from './banner.js'
import { getCommand, inferPackageManager, type PackageManager } from './packageManager.js'
import { emptyDir, scaffoldProject } from './scaffold.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const templatesDir = join(__dirname, '../templates')
const supportedTemplates = new Set(['basic'])
const supportedProviders = new Set(['openai', 'deepseek', 'custom'])

const { values: flags, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
    template: { type: 'string' },
    provider: { type: 'string' },
    yes: { type: 'boolean', short: 'y' },
    install: { type: 'boolean' },
    'no-install': { type: 'boolean' },
    overwrite: { type: 'boolean' },
    cwd: { type: 'string' },
  },
  strict: false,
  allowPositionals: true,
})

const templateFlag = typeof flags.template === 'string' ? flags.template : undefined
const providerFlag = typeof flags.provider === 'string' ? flags.provider : undefined
const cwdFlag = typeof flags.cwd === 'string' ? flags.cwd : undefined

if (flags.help) {
  console.log(`
Usage: create-tiny-robot [options] [project-name]

Options:
  -h, --help            Display this help message
  -v, --version         Display version number
      --template        Template name (currently: basic)
      --provider        API provider (openai | deepseek | custom)
  -y, --yes             Use defaults and skip prompts
      --install         Install dependencies after generation
      --no-install      Skip dependency installation
      --overwrite       Overwrite an existing non-empty directory
      --cwd             Generate project relative to this directory

Examples:
  npm create tiny-robot my-app -- --provider openai
  pnpm create tiny-robot my-app --template basic --provider deepseek --no-install
`)
  process.exit(0)
}

if (flags.version) {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8')) as {
    name: string
    version: string
  }
  console.log(`${pkg.name} v${pkg.version}`)
  process.exit(0)
}

const argProjectName = positionals[0] as string | undefined

function assertValidFlagValues(): void {
  if (templateFlag && !supportedTemplates.has(templateFlag)) {
    throw new Error(`Unsupported template "${templateFlag}". Only "basic" is available right now.`)
  }

  if (providerFlag && !supportedProviders.has(providerFlag)) {
    throw new Error(`Unsupported provider "${providerFlag}". Use openai, deepseek, or custom.`)
  }

  if (flags.install && flags['no-install']) {
    throw new Error('Do not pass both --install and --no-install.')
  }
}

async function init(): Promise<void> {
  assertValidFlagValues()

  console.log(getBanner())
  intro(pc.cyan("Welcome! Let's create your Tiny Robot project."))

  async function unwrapPrompt<T>(promise: Promise<T | symbol>): Promise<T> {
    const result = await promise
    if (isCancel(result)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    return result as T
  }

  let projectName = argProjectName
  if (!projectName) {
    if (flags.yes) {
      projectName = 'my-chat-app'
    } else {
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
  }

  const template = templateFlag
    ? templateFlag
    : flags.yes
      ? 'basic'
      : await unwrapPrompt(
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

  if (template !== 'basic') {
    cancel('This template is not available yet. Please select "basic".')
    process.exit(0)
  }

  const provider = providerFlag
    ? providerFlag
    : flags.yes
      ? 'openai'
      : await unwrapPrompt(
          select({
            message: 'Select API Provider:',
            options: [
              { value: 'openai', label: 'OpenAI', hint: 'GPT-4o, GPT-4o-mini, etc.' },
              { value: 'deepseek', label: 'DeepSeek', hint: 'deepseek-chat, deepseek-coder' },
              { value: 'custom', label: 'OpenAI-Compatible', hint: 'Use your own proxy or compatible backend' },
            ],
          }),
        )

  const pm = inferPackageManager()
  const shouldInstall =
    flags.install === true
      ? true
      : flags['no-install'] === true
        ? false
        : flags.yes
          ? true
          : await unwrapPrompt(
              confirm({
                message: `Install dependencies? (via ${pm})`,
                initialValue: true,
              }),
            )

  const targetRoot = cwdFlag ? resolve(cwdFlag) : process.cwd()
  const projectDir = join(targetRoot, projectName)

  if (existsSync(projectDir) && readdirSync(projectDir).length > 0) {
    const overwrite = flags.overwrite
      ? true
      : flags.yes
        ? false
        : await unwrapPrompt(
            confirm({
              message: `Directory "${projectName}" already exists and is not empty. Overwrite?`,
              initialValue: false,
            }),
          )

    if (!overwrite) {
      throw new Error(`Target directory "${projectDir}" already exists and is not empty. Use --overwrite to continue.`)
    }

    emptyDir(projectDir)
  }

  scaffoldProject({
    templateDir: join(templatesDir, template),
    projectDir,
    provider,
    projectName,
    packageManager: pm,
  })

  if (shouldInstall) {
    const s = spinner()
    const installCmd = getCommand(pm, 'install')
    s.start(`Running ${installCmd}...`)

    try {
      execSync(installCmd, { cwd: projectDir, stdio: 'pipe' })
      s.stop(`Dependencies installed via ${pm}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      s.stop(pc.yellow(`Install failed: ${msg}\n  Please run "${installCmd}" manually.`))
    }
  }

  outro(pc.green(`Project "${projectName}" created!`))

  printNextSteps({
    packageManager: pm,
    projectName,
    projectDir,
    targetRoot,
    shouldInstall,
  })
}

function printNextSteps(options: {
  packageManager: PackageManager
  projectName: string
  projectDir: string
  targetRoot: string
  shouldInstall: boolean
}): void {
  console.log(`\n  ${pc.bold('Next steps:')}`)

  if (options.projectDir !== options.targetRoot) {
    console.log(`  ${pc.cyan(`cd ${options.projectName}`)}`)
  }

  console.log(`  ${pc.cyan('Copy .env.example to .env.local')}   ${pc.gray('# configure your local endpoint')}`)

  if (!options.shouldInstall) {
    console.log(`  ${pc.cyan(getCommand(options.packageManager, 'install'))}`)
  }

  console.log(`  ${pc.cyan(getCommand(options.packageManager, 'dev'))}`)
  console.log('')
}

init().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(pc.red(`Error: ${error.message}`))
  } else {
    console.error(error)
  }
  process.exit(1)
})
