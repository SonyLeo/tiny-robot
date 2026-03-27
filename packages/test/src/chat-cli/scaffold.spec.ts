import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CHAT_CLI_CONSUMABLE_FEATURE_KEYS } from '../../../chat/src/adapters/index'
import { getCommand } from '../../../chat-cli/src/packageManager'
import {
  CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS,
  CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS,
  CHAT_CLI_REQUIRED_FEATURE_KEYS,
  getChatCliTemplateDefinition,
  getChatCliTemplateRegistry,
  getStableChatCliTemplateIds,
  validateChatCliTemplateRegistry,
} from '../../../chat-cli/src/templateRegistry'
import {
  applyTemplateVariables,
  copyTemplateFiles,
  getScaffoldMetadata,
  getTemplateVariables,
  renameSpecialFiles,
  replaceWorkspaceProtocolDeps,
  scaffoldProject,
  toProjectTitle,
} from '../../../chat-cli/src/scaffold'

const templateDir = fileURLToPath(new URL('../../../chat-cli/templates/basic', import.meta.url))
const agentMcpTemplateDir = fileURLToPath(new URL('../../../chat-cli/templates/agent-mcp', import.meta.url))
const baseTemplateDir = fileURLToPath(new URL('../../../chat-cli/templates/base', import.meta.url))
const cliEntry = fileURLToPath(new URL('../../../chat-cli/dist/index.js', import.meta.url))
const cliPackageJson = fileURLToPath(new URL('../../../chat-cli/package.json', import.meta.url))

function createTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

test.describe('chat-cli scaffold helpers', () => {
  test('template registry should provide the stable CLI template source of truth', async () => {
    const registry = getChatCliTemplateRegistry()
    const basicTemplate = getChatCliTemplateDefinition('basic')
    const agentMcpTemplate = getChatCliTemplateDefinition('agent-mcp')

    expect(getStableChatCliTemplateIds()).toEqual(['basic', 'agent-mcp'])
    expect(CHAT_CLI_REQUIRED_FEATURE_KEYS).toEqual(CHAT_CLI_CONSUMABLE_FEATURE_KEYS)
    expect(CHAT_CLI_CONSUMABLE_PRESET_PROP_KEYS).toEqual([
      'attachmentsFeature',
      'senderActionsFeature',
      'prompts',
      'mcpManager',
      'messageListVariant',
      'roleConfigs',
      'showHistory',
      'historyProps',
      'showFeedback',
    ])
    expect(CHAT_CLI_CONSUMABLE_PRESET_SLICE_KEYS).toEqual([
      'root',
      'layout',
      'header',
      'welcome',
      'messageList',
      'sender',
      'history',
      'modelSelector',
    ])
    expect(validateChatCliTemplateRegistry()).toEqual([])
    expect(registry).toHaveLength(2)
    expect(basicTemplate).toEqual({
      id: 'basic',
      label: 'Basic Chat Agent',
      description: 'General chat starter with TrChat black-box composition',
      status: 'stable',
      templateDir: 'basic',
      baseTemplateDir: 'base',
      supportedProviders: ['openai', 'deepseek', 'custom'],
      requiredChatFeatures: ['history'],
      contractUsage: {
        mode: 'blackbox-component',
        presetPropKeys: [],
        presetSliceKeys: [],
      },
      postScaffoldSteps: ['copy-env', 'configure-endpoint', 'run-dev'],
    })
    expect(agentMcpTemplate).toEqual({
      id: 'agent-mcp',
      label: 'Agent MCP',
      description: 'MCP panel + tool bridge starter with scaffold layout',
      status: 'stable',
      templateDir: 'agent-mcp',
      baseTemplateDir: 'base',
      supportedProviders: ['openai', 'deepseek', 'custom'],
      requiredChatFeatures: ['mcp', 'history'],
      contractUsage: {
        mode: 'scaffold-slots',
        presetPropKeys: [],
        presetSliceKeys: [],
      },
      postScaffoldSteps: ['copy-env', 'configure-endpoint', 'review-mcp', 'run-dev'],
    })
  })

  test('getTemplateVariables should map supported providers to stable defaults', async () => {
    expect(getTemplateVariables('openai')).toEqual({
      __DEFAULT_PROVIDER__: 'openai',
      __DEFAULT_MODEL__: 'gpt-4o-mini',
      __PROXY_ENDPOINT__: 'https://api.openai.com/v1/chat/completions',
      __PROXY_API_KEY_ENV__: 'OPENAI_API_KEY',
    })

    expect(getTemplateVariables('deepseek')).toEqual({
      __DEFAULT_PROVIDER__: 'deepseek',
      __DEFAULT_MODEL__: 'deepseek-chat',
      __PROXY_ENDPOINT__: 'https://api.deepseek.com/v1/chat/completions',
      __PROXY_API_KEY_ENV__: 'DEEPSEEK_API_KEY',
    })

    expect(getTemplateVariables('custom')).toEqual({
      __DEFAULT_PROVIDER__: 'openai-compatible',
      __DEFAULT_MODEL__: 'custom-model',
      __PROXY_ENDPOINT__: 'https://api.your-provider.com/v1/chat/completions',
      __PROXY_API_KEY_ENV__: 'CUSTOM_API_KEY',
    })
  })

  test('project metadata should inject package-manager aware commands and readable titles', async () => {
    expect(toProjectTitle('my-chat-app')).toBe('My Chat App')

    expect(getScaffoldMetadata('my-chat-app', 'pnpm')).toEqual({
      __PROJECT_NAME__: 'my-chat-app',
      __PROJECT_TITLE__: 'My Chat App',
      __INSTALL_COMMAND__: getCommand('pnpm', 'install'),
      __DEV_COMMAND__: getCommand('pnpm', 'dev'),
      __BUILD_COMMAND__: getCommand('pnpm', 'build'),
    })
  })

  test('renameSpecialFiles should expose dotfiles expected by generated projects', async () => {
    const root = createTempDir('tiny-robot-chat-cli-rename-')

    try {
      writeFileSync(join(root, '_gitignore'), 'node_modules\n', 'utf-8')
      writeFileSync(join(root, '_env.example'), 'VITE_CHAT_API_ENDPOINT=/api/chat\n', 'utf-8')

      renameSpecialFiles(root)

      expect(existsSync(join(root, '.gitignore'))).toBeTruthy()
      expect(existsSync(join(root, '.env.example'))).toBeTruthy()
      expect(existsSync(join(root, '_gitignore'))).toBeFalsy()
      expect(existsSync(join(root, '_env.example'))).toBeFalsy()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('copyTemplateFiles should skip build artifacts and dependency folders', async () => {
    const sourceRoot = createTempDir('tiny-robot-chat-cli-source-')
    const destRoot = createTempDir('tiny-robot-chat-cli-dest-')

    try {
      mkdirSync(join(sourceRoot, 'dist'), { recursive: true })
      mkdirSync(join(sourceRoot, 'node_modules'), { recursive: true })
      mkdirSync(join(sourceRoot, 'src'), { recursive: true })

      writeFileSync(join(sourceRoot, 'dist', 'ignore.txt'), 'ignore', 'utf-8')
      writeFileSync(join(sourceRoot, 'node_modules', 'ignore.txt'), 'ignore', 'utf-8')
      writeFileSync(join(sourceRoot, 'src', 'keep.txt'), 'keep', 'utf-8')

      copyTemplateFiles(sourceRoot, destRoot)

      expect(existsSync(join(destRoot, 'src', 'keep.txt'))).toBeTruthy()
      expect(existsSync(join(destRoot, 'dist', 'ignore.txt'))).toBeFalsy()
      expect(existsSync(join(destRoot, 'node_modules', 'ignore.txt'))).toBeFalsy()
    } finally {
      rmSync(sourceRoot, { recursive: true, force: true })
      rmSync(destRoot, { recursive: true, force: true })
    }
  })

  test('applyTemplateVariables should replace placeholders in text files only', async () => {
    const root = createTempDir('tiny-robot-chat-cli-variables-')

    try {
      const configFile = join(root, 'chat.config.ts')
      writeFileSync(configFile, "provider: '__DEFAULT_PROVIDER__', model: '__DEFAULT_MODEL__'", 'utf-8')

      applyTemplateVariables(root, getTemplateVariables('deepseek'))

      const content = readFileSync(configFile, 'utf-8')
      expect(content).toContain('deepseek')
      expect(content).toContain('deepseek-chat')
      expect(content).not.toContain('__DEFAULT_PROVIDER__')
      expect(content).not.toContain('__DEFAULT_MODEL__')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('replaceWorkspaceProtocolDeps should convert workspace dependencies when running from source templates', async () => {
    const root = createTempDir('tiny-robot-chat-cli-workspace-')

    try {
      const projectDir = join(root, 'project')
      mkdirSync(projectDir, { recursive: true })
      writeFileSync(
        join(projectDir, 'package.json'),
        JSON.stringify(
          {
            name: 'example-app',
            dependencies: {
              '@opentiny/tiny-robot-chat': 'workspace:*',
              '@opentiny/tiny-robot-kit': 'workspace:*',
            },
          },
          null,
          2,
        ) + '\n',
        'utf-8',
      )

      replaceWorkspaceProtocolDeps(projectDir, templateDir)

      const packageContent = readFileSync(join(projectDir, 'package.json'), 'utf-8')
      expect(packageContent).not.toContain('workspace:*')
      expect(packageContent).toContain('"@opentiny/tiny-robot-chat": "^')
      expect(packageContent).toContain('"@opentiny/tiny-robot-kit": "^')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('scaffoldProject should generate a safe basic template for openai-compatible backends', async () => {
    const root = createTempDir('tiny-robot-chat-cli-project-')
    const projectDir = join(root, 'my-chat-app')

    try {
      scaffoldProject({
        templateDirs: [baseTemplateDir, templateDir],
        projectDir,
        provider: 'custom',
        projectName: 'my-chat-app',
        packageManager: 'pnpm',
      })

      const envFile = join(projectDir, '.env.example')
      const appFile = join(projectDir, 'src', 'App.vue')
      const configFile = join(projectDir, 'src', 'chat.config.ts')
      const chatLibFile = join(projectDir, 'src', 'lib', 'chat.ts')
      const proxyFile = join(projectDir, 'server', 'chat-proxy.example.ts')
      const packageFile = join(projectDir, 'package.json')
      const readmeFile = join(projectDir, 'README.md')

      expect(existsSync(envFile)).toBeTruthy()
      expect(existsSync(appFile)).toBeTruthy()
      expect(existsSync(configFile)).toBeTruthy()
      expect(existsSync(proxyFile)).toBeTruthy()
      expect(existsSync(packageFile)).toBeTruthy()
      expect(existsSync(readmeFile)).toBeTruthy()

      const envContent = readFileSync(envFile, 'utf-8')
      const appContent = readFileSync(appFile, 'utf-8')
      const configContent = readFileSync(configFile, 'utf-8')
      const chatLibContent = readFileSync(chatLibFile, 'utf-8')
      const packageContent = readFileSync(packageFile, 'utf-8')
      const readmeContent = readFileSync(readmeFile, 'utf-8')

      expect(envContent).toContain('VITE_CHAT_API_ENDPOINT')
      expect(envContent).not.toContain('VITE_API_KEY')

      expect(appContent).toContain('TrChat')
      expect(appContent).toContain('chatRuntime')
      expect(appContent).not.toContain('chatCapabilitySurface')
      expect(appContent).not.toContain('TrChat.Root')
      expect(appContent).not.toContain('Authorization: Bearer')

      expect(configContent).toContain("'openai-compatible'")
      expect(configContent).toContain('custom-model')
      expect(configContent).toContain('My Chat App')
      expect(configContent).toContain('history: true')
      expect(configContent).not.toContain('__DEFAULT_PROVIDER__')
      expect(configContent).not.toContain('__DEFAULT_MODEL__')
      expect(chatLibContent).toContain('localStorageStrategyFactory')
      expect(chatLibContent).toContain('chatRuntime')
      expect(chatLibContent).not.toContain('createChatCliCapabilitySurface')

      expect(packageContent).toContain('"name": "my-chat-app"')
      expect(packageContent).not.toContain('__PROJECT_NAME__')
      expect(packageContent).not.toContain('workspace:*')
      expect(packageContent).toContain('"markstream-vue": "^0.0.9-beta.0"')
      expect(packageContent).toContain('"dompurify": "^3.3.1"')
      expect(packageContent).toContain('"markdown-it": "^14.1.0"')
      expect(packageContent).not.toContain('"@opentiny/tiny-robot-svgs"')

      expect(readmeContent).toContain('# My Chat App')
      expect(readmeContent).toContain('pnpm install')
      expect(readmeContent).toContain('pnpm run dev')
      expect(readmeContent).toContain('pnpm run build')
      expect(readmeContent).not.toContain('__INSTALL_COMMAND__')
      expect(readmeContent).toContain('TrChat')
      expect(readmeContent).toContain('前 10 分钟建议')
      expect(readmeContent).toContain('黑盒 TrChat')
      expect(readmeContent).toContain('一般不需要一开始就重写页面结构')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('scaffoldProject should generate an agent-mcp template that wires MCP through the stable chat contract', async () => {
    const root = createTempDir('tiny-robot-chat-cli-agent-mcp-')
    const projectDir = join(root, 'agent-mcp-app')

    try {
      scaffoldProject({
        templateDirs: [baseTemplateDir, agentMcpTemplateDir],
        projectDir,
        provider: 'openai',
        projectName: 'agent-mcp-app',
        packageManager: 'pnpm',
      })

      const appContent = readFileSync(join(projectDir, 'src', 'App.vue'), 'utf-8')
      const configContent = readFileSync(join(projectDir, 'src', 'chat.config.ts'), 'utf-8')
      const chatLibContent = readFileSync(join(projectDir, 'src', 'lib', 'chat.ts'), 'utf-8')
      const mcpLibContent = readFileSync(join(projectDir, 'src', 'lib', 'mcp.ts'), 'utf-8')
      const packageContent = readFileSync(join(projectDir, 'package.json'), 'utf-8')
      const readmeContent = readFileSync(join(projectDir, 'README.md'), 'utf-8')

      expect(appContent).toContain('TrChat.Scaffold')
      expect(appContent).toContain('TrMcpTrigger')
      expect(appContent).toContain('TrModelSelector')
      expect(appContent).not.toContain('chatCapabilitySurface')

      expect(configContent).toContain('Agent MCP Workspace')
      expect(configContent).toContain('history: true')

      expect(chatLibContent).toContain('useMcpManager')
      expect(chatLibContent).toContain('toolPlugin')
      expect(chatLibContent).toContain('chatRuntime')
      expect(chatLibContent).toContain('mcpManager')
      expect(chatLibContent).not.toContain('chatCapabilitySurface')

      expect(mcpLibContent).toContain('defaultMcpServers')
      expect(mcpLibContent).toContain('createLocalMcpBridge')
      expect(packageContent).toContain('"markstream-vue": "^0.0.9-beta.0"')
      expect(packageContent).toContain('"dompurify": "^3.3.1"')
      expect(packageContent).toContain('"markdown-it": "^14.1.0"')
      expect(packageContent).not.toContain('"@opentiny/tiny-robot-svgs"')

      expect(readmeContent).toContain('Agent MCP')
      expect(readmeContent).toContain('TrChat.Scaffold')
      expect(readmeContent).toContain('TrMcpTrigger')
      expect(readmeContent).toContain('mock bridge')
      expect(readmeContent).toContain('这个模板不是什么')
      expect(readmeContent).toContain('不是完整 agent runtime')
      expect(readmeContent).toContain('哪些文件以后最可能被替换')
      expect(readmeContent).toContain('从 starter 到真实应用的建议路径')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('cli should support non-interactive generation through flags', async () => {
    const root = createTempDir('tiny-robot-chat-cli-cli-')

    try {
      execFileSync(
        process.execPath,
        [
          cliEntry,
          'flag-generated-app',
          '--template',
          'basic',
          '--provider',
          'deepseek',
          '--yes',
          '--no-install',
          '--cwd',
          root,
        ],
        {
          env: {
            ...process.env,
            npm_config_user_agent: 'pnpm/9.0.0 npm/? node/v20.11.0',
          },
          stdio: 'pipe',
        },
      )

      const projectDir = join(root, 'flag-generated-app')
      const packageContent = readFileSync(join(projectDir, 'package.json'), 'utf-8')
      const readmeContent = readFileSync(join(projectDir, 'README.md'), 'utf-8')
      const configContent = readFileSync(join(projectDir, 'src', 'chat.config.ts'), 'utf-8')

      expect(packageContent).toContain('"name": "flag-generated-app"')
      expect(packageContent).not.toContain('workspace:*')
      expect(readmeContent).toContain('# Flag Generated App')
      expect(readmeContent).toContain('pnpm install')
      expect(configContent).toContain('deepseek-chat')
      expect(configContent).toContain("provider: 'deepseek'")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('cli should use stable defaults in --yes mode when no project name is provided', async () => {
    const root = createTempDir('tiny-robot-chat-cli-defaults-')

    try {
      execFileSync(process.execPath, [cliEntry, '--yes', '--no-install', '--cwd', root], {
        env: {
          ...process.env,
          npm_config_user_agent: 'pnpm/9.0.0 npm/? node/v20.11.0',
        },
        stdio: 'pipe',
      })

      const projectDir = join(root, 'my-chat-app')
      expect(existsSync(join(projectDir, 'package.json'))).toBeTruthy()
      expect(readFileSync(join(projectDir, 'README.md'), 'utf-8')).toContain('# My Chat App')
      expect(readFileSync(join(projectDir, 'src', 'chat.config.ts'), 'utf-8')).toContain("provider: 'openai'")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('cli should print stable help and version output', async () => {
    const helpOutput = execFileSync(process.execPath, [cliEntry, '--help'], {
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    const packageJson = JSON.parse(readFileSync(cliPackageJson, 'utf-8')) as { version: string }
    const versionOutput = execFileSync(process.execPath, [cliEntry, '--version'], {
      encoding: 'utf-8',
      stdio: 'pipe',
    })

    expect(helpOutput).toContain('create-tiny-robot [options] [project-name]')
    expect(helpOutput).toContain('--template')
    expect(helpOutput).toContain('--provider')
    expect(helpOutput).toContain('--overwrite')
    expect(helpOutput).toContain('Templates:')
    expect(helpOutput).toContain('basic')
    expect(helpOutput).toContain('agent-mcp')
    expect(helpOutput).toContain('TrChat black-box composition')
    expect(helpOutput).toContain('scaffold layout')
    expect(helpOutput).toContain('--template agent-mcp --provider custom')
    expect(versionOutput.trim()).toBe(`create-tiny-robot v${packageJson.version}`)
  })

  test('cli should reject unsupported providers before entering prompt mode', async () => {
    expect(() =>
      execFileSync(process.execPath, [cliEntry, '--provider', 'unknown-provider', '--yes'], {
        stdio: 'pipe',
      }),
    ).toThrow(/Unsupported provider/)
  })

  test('cli should refuse to overwrite non-empty directories unless explicitly allowed', async () => {
    const root = createTempDir('tiny-robot-chat-cli-existing-')
    const projectDir = join(root, 'existing-app')

    try {
      mkdirSync(projectDir, { recursive: true })
      writeFileSync(join(projectDir, 'keep.txt'), 'keep-me', 'utf-8')

      expect(() =>
        execFileSync(process.execPath, [cliEntry, 'existing-app', '--yes', '--no-install', '--cwd', root], {
          env: {
            ...process.env,
            npm_config_user_agent: 'pnpm/9.0.0 npm/? node/v20.11.0',
          },
          stdio: 'pipe',
        }),
      ).toThrow()

      expect(readFileSync(join(projectDir, 'keep.txt'), 'utf-8')).toBe('keep-me')
      expect(existsSync(join(projectDir, 'package.json'))).toBeFalsy()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('cli should clean and regenerate non-empty directories when --overwrite is provided', async () => {
    const root = createTempDir('tiny-robot-chat-cli-overwrite-')
    const projectDir = join(root, 'overwrite-app')

    try {
      mkdirSync(join(projectDir, 'stale'), { recursive: true })
      writeFileSync(join(projectDir, 'stale', 'old.txt'), 'old', 'utf-8')
      writeFileSync(join(projectDir, 'keep.txt'), 'old', 'utf-8')

      execFileSync(
        process.execPath,
        [cliEntry, 'overwrite-app', '--provider', 'custom', '--yes', '--no-install', '--overwrite', '--cwd', root],
        {
          env: {
            ...process.env,
            npm_config_user_agent: 'pnpm/9.0.0 npm/? node/v20.11.0',
          },
          stdio: 'pipe',
        },
      )

      expect(existsSync(join(projectDir, 'keep.txt'))).toBeFalsy()
      expect(existsSync(join(projectDir, 'stale', 'old.txt'))).toBeFalsy()
      expect(existsSync(join(projectDir, 'package.json'))).toBeTruthy()
      expect(readFileSync(join(projectDir, 'src', 'chat.config.ts'), 'utf-8')).toContain("'openai-compatible'")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
