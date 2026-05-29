#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { input, select } from '@inquirer/prompts'
import { Command } from 'commander'

const TEMPLATE_PLACEHOLDER = '__PROJECT_NAME__'
const DEFAULT_TEMPLATE = 'basic'
const DEFAULT_PROJECT_NAME = 'tiny-robot-app'
const CHAT_CONFIG_FILE = path.join('src', 'tiny-robot', 'chat.ts')
const CHAT_DEPENDENCIES = {
  '@opentiny/tiny-robot': 'latest',
  dompurify: '^3.3.1',
  'markdown-it': '^14.1.0',
}
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const templatesRoot = path.resolve(__dirname, '../templates')

function getAvailableTemplates() {
  if (!fs.existsSync(templatesRoot)) {
    return []
  }

  return fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function validateProjectName(name) {
  // Keep project naming rules strict for npm package compatibility.
  const npmSafePattern = /^[a-z0-9-]+$/
  return npmSafePattern.test(name)
}

function getTemplateDir(templateName) {
  return path.join(templatesRoot, templateName)
}

async function resolveProjectName(initialProjectName, skipPrompts) {
  if (initialProjectName) {
    return initialProjectName
  }

  if (skipPrompts) {
    return DEFAULT_PROJECT_NAME
  }

  return input({
    message: 'Project name:',
    default: DEFAULT_PROJECT_NAME,
    validate: (value) => {
      if (!value) {
        return 'Project name is required.'
      }
      if (!validateProjectName(value)) {
        return 'Project name can only contain lowercase letters, numbers, and dashes.'
      }
      const targetDir = path.resolve(process.cwd(), value)
      if (fs.existsSync(targetDir)) {
        return `Target directory already exists: ${targetDir}`
      }
      return true
    },
  })
}

async function resolveTemplateName(initialTemplateName, availableTemplates, skipPrompts) {
  if (initialTemplateName) {
    return initialTemplateName
  }

  if (skipPrompts) {
    return availableTemplates.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : availableTemplates[0]
  }

  return select({
    message: 'Template:',
    default: availableTemplates.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : availableTemplates[0],
    choices: availableTemplates.map((templateName) => ({
      name: templateName,
      value: templateName,
    })),
  })
}

function copyTemplate(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => {
      const name = path.basename(source)
      // Ignore local build artifacts to keep generated projects clean.
      return !['node_modules', '.git', 'dist', '.DS_Store', '.vite'].includes(name)
    },
  })
}

function renameSpecialFiles(targetDir) {
  const from = path.join(targetDir, '_gitignore')
  const to = path.join(targetDir, '.gitignore')

  if (fs.existsSync(from)) {
    fs.renameSync(from, to)
  }
}

function replaceProjectName(targetDir, projectName) {
  const filesToReplace = ['package.json', 'README.md']

  for (const relativeFile of filesToReplace) {
    const absoluteFile = path.join(targetDir, relativeFile)

    if (!fs.existsSync(absoluteFile)) {
      continue
    }

    const content = fs.readFileSync(absoluteFile, 'utf-8')
    const nextContent = content.replaceAll(TEMPLATE_PLACEHOLDER, projectName)
    fs.writeFileSync(absoluteFile, nextContent, 'utf-8')
  }
}

function normalizeDisplayPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}

function ensureChatDependencies(packageJson) {
  packageJson.dependencies ??= {}

  const addedDependencies = []

  for (const [dependencyName, dependencyVersion] of Object.entries(CHAT_DEPENDENCIES)) {
    if (packageJson.dependencies[dependencyName] || packageJson.devDependencies?.[dependencyName]) {
      continue
    }

    packageJson.dependencies[dependencyName] = dependencyVersion
    addedDependencies.push(`${dependencyName}@${dependencyVersion}`)
  }

  return addedDependencies
}

function getChatConfigTemplate() {
  return `import type { ChatMcpServerConfig, ChatModelOption } from '@opentiny/tiny-robot/chat'

export const chatModelOptions: ChatModelOption[] = [
  {
    id: 'deepseek-chat',
    provider: 'deepseek',
    name: 'DeepSeek Chat',
    model: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  },
]

export const chatMcpServers: Record<string, ChatMcpServerConfig> = {}
`
}

function addChatFeature() {
  const projectRoot = process.cwd()
  const packageJsonPath = path.join(projectRoot, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found in the current directory.')
    process.exit(1)
  }

  const packageJson = readJsonFile(packageJsonPath)
  const addedDependencies = ensureChatDependencies(packageJson)
  writeJsonFile(packageJsonPath, packageJson)

  const chatConfigPath = path.join(projectRoot, CHAT_CONFIG_FILE)
  const chatConfigDisplayPath = normalizeDisplayPath(CHAT_CONFIG_FILE)
  let createdChatConfig = false

  if (!fs.existsSync(chatConfigPath)) {
    fs.mkdirSync(path.dirname(chatConfigPath), { recursive: true })
    fs.writeFileSync(chatConfigPath, getChatConfigTemplate(), 'utf-8')
    createdChatConfig = true
  }

  console.log('\nChat setup updated.')
  console.log(createdChatConfig ? `Created: ${chatConfigDisplayPath}` : `Skipped: ${chatConfigDisplayPath} already exists`)

  if (addedDependencies.length > 0) {
    console.log('\nAdded dependencies:')
    addedDependencies.forEach((dependencyName) => {
      console.log(`  ${dependencyName}`)
    })
  } else {
    console.log('\nDependencies already present.')
  }

  console.log('\nNext steps:')
  console.log('  pnpm install')
  console.log("  import '@opentiny/tiny-robot/dist/style.css'")
  console.log("  import { TrChat } from '@opentiny/tiny-robot/chat'")
  console.log("  import { chatModelOptions, chatMcpServers } from './src/tiny-robot/chat'")
}

async function createProject(initialProjectName, initialTemplateName, skipPrompts) {
  const availableTemplates = getAvailableTemplates()
  if (availableTemplates.length === 0) {
    console.error('Error: no templates found.')
    process.exit(1)
  }

  const projectName = await resolveProjectName(initialProjectName, skipPrompts)
  const templateName = await resolveTemplateName(initialTemplateName, availableTemplates, skipPrompts)

  if (!validateProjectName(projectName)) {
    console.error('Error: project name can only contain lowercase letters, numbers, and dashes.')
    process.exit(1)
  }

  const templateDir = getTemplateDir(templateName)
  const targetDir = path.resolve(process.cwd(), projectName)

  if (!fs.existsSync(templateDir)) {
    console.error(`Error: template "${templateName}" does not exist. Available: ${availableTemplates.join(', ')}`)
    process.exit(1)
  }

  if (fs.existsSync(targetDir)) {
    console.error(`Error: target directory already exists: ${targetDir}`)
    process.exit(1)
  }

  copyTemplate(templateDir, targetDir)
  renameSpecialFiles(targetDir)
  replaceProjectName(targetDir, projectName)

  console.log('\nProject created successfully!')
  console.log(`\nNext steps:`)
  console.log(`  cd ${projectName}`)
  console.log('  pnpm install')
  console.log('  pnpm dev\n')
}

function run() {
  const program = new Command()
  program
    .name('tiny-robot-cli')
    .description('CLI to scaffold TinyRobot product projects')
    .showHelpAfterError()

  program
    .command('create [project-name]')
    .description('Create a TinyRobot project from template')
    .option('-t, --template <name>', 'template name')
    .action((projectName, options) => {
      const skipPrompts = !process.stdout.isTTY
      createProject(projectName ?? '', options.template ?? '', skipPrompts).catch((error) => {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(1)
      })
    })

  program
    .command('add <feature>')
    .description('Add a TinyRobot feature into the current project')
    .action((feature) => {
      if (feature !== 'chat') {
        console.error(`Error: unsupported feature "${feature}". Available: chat`)
        process.exit(1)
      }

      addChatFeature()
    })

  if (process.argv.length <= 2) {
    program.outputHelp()
    return
  }

  program.parse(process.argv)
}

run()
