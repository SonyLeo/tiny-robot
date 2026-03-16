import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import pc from 'picocolors'

export interface ScaffoldProjectOptions {
  templateDir: string
  projectDir: string
  provider: string
  projectName?: string
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'
}

const workspacePackageMap: Record<string, string> = {
  '@opentiny/tiny-robot': 'components',
  '@opentiny/tiny-robot-svgs': 'svgs',
  '@opentiny/tiny-robot-kit': 'kit',
  '@opentiny/tiny-robot-chat': 'chat',
}

export function emptyDir(dir: string): void {
  if (!existsSync(dir)) {
    return
  }

  for (const file of readdirSync(dir, { withFileTypes: true })) {
    rmSync(join(dir, file.name), { recursive: true, force: true })
  }
}

export function copyTemplateFiles(src: string, dest: string): void {
  const excludeDirs = new Set(['node_modules', '.git', '.dist', 'dist'])
  const files = readdirSync(src, { withFileTypes: true })

  for (const file of files) {
    if (excludeDirs.has(file.name)) {
      continue
    }

    const srcPath = join(src, file.name)
    const destPath = join(dest, file.name)

    if (file.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyTemplateFiles(srcPath, destPath)
      continue
    }

    try {
      copyFileSync(srcPath, destPath)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(pc.yellow(`Warning: failed to copy ${file.name}: ${msg}`))
    }
  }
}

export function renameSpecialFiles(dir: string): void {
  const renames: Record<string, string> = {
    _gitignore: '.gitignore',
    '_env.example': '.env.example',
  }

  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const srcPath = join(dir, file.name)

    if (file.isDirectory()) {
      renameSpecialFiles(srcPath)
      continue
    }

    const targetName = renames[file.name]
    if (!targetName) {
      continue
    }

    try {
      renameSync(srcPath, join(dir, targetName))
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(pc.yellow(`Warning: failed to rename ${file.name}: ${msg}`))
    }
  }
}

export function getTemplateVariables(provider: string): Record<string, string> {
  if (provider === 'deepseek') {
    return {
      __DEFAULT_PROVIDER__: 'deepseek',
      __DEFAULT_MODEL__: 'deepseek-chat',
      __PROXY_ENDPOINT__: 'https://api.deepseek.com/v1/chat/completions',
      __PROXY_API_KEY_ENV__: 'DEEPSEEK_API_KEY',
    }
  }

  if (provider === 'custom') {
    return {
      __DEFAULT_PROVIDER__: 'openai-compatible',
      __DEFAULT_MODEL__: 'custom-model',
      __PROXY_ENDPOINT__: 'https://api.your-provider.com/v1/chat/completions',
      __PROXY_API_KEY_ENV__: 'CUSTOM_API_KEY',
    }
  }

  return {
    __DEFAULT_PROVIDER__: 'openai',
    __DEFAULT_MODEL__: 'gpt-4o-mini',
    __PROXY_ENDPOINT__: 'https://api.openai.com/v1/chat/completions',
    __PROXY_API_KEY_ENV__: 'OPENAI_API_KEY',
  }
}

export function toProjectTitle(projectName: string): string {
  return projectName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function getScaffoldMetadata(
  projectName: string,
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' = 'npm',
): Record<string, string> {
  const projectTitle = toProjectTitle(projectName)
  const installCommand = packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
  const devCommand = packageManager === 'yarn' ? 'yarn dev' : `${packageManager} run dev`
  const buildCommand = packageManager === 'yarn' ? 'yarn build' : `${packageManager} run build`

  return {
    __PROJECT_NAME__: projectName,
    __PROJECT_TITLE__: projectTitle,
    __INSTALL_COMMAND__: installCommand,
    __DEV_COMMAND__: devCommand,
    __BUILD_COMMAND__: buildCommand,
  }
}

export function applyTemplateVariables(dir: string, variables: Record<string, string>): void {
  const textExtensions = new Set(['.ts', '.js', '.mjs', '.cjs', '.json', '.md', '.vue', '.html', '.env'])

  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, file.name)

    if (file.isDirectory()) {
      applyTemplateVariables(fullPath, variables)
      continue
    }

    const ext = file.name.includes('.') ? `.${file.name.split('.').at(-1)}` : ''
    if (!textExtensions.has(ext) && file.name !== '.env.example') {
      continue
    }

    try {
      let content = readFileSync(fullPath, 'utf-8')
      let changed = false

      for (const [key, value] of Object.entries(variables)) {
        if (!content.includes(key)) {
          continue
        }

        content = content.replaceAll(key, value)
        changed = true
      }

      if (changed) {
        writeFileSync(fullPath, content, 'utf-8')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(pc.yellow(`Warning: failed to apply template variables for ${file.name}: ${msg}`))
    }
  }
}

export function replaceWorkspaceProtocolDeps(projectDir: string, templateDir: string): void {
  const packageJsonPath = join(projectDir, 'package.json')
  if (!existsSync(packageJsonPath)) {
    return
  }

  const packagesRoot = resolve(templateDir, '../../..')
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as Record<string, Record<string, string> | unknown>
  let changed = false

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const deps = pkg[section] as Record<string, string> | undefined
    if (!deps || typeof deps !== 'object') {
      continue
    }

    for (const [packageName, currentVersion] of Object.entries(deps)) {
      if (currentVersion !== 'workspace:*') {
        continue
      }

      const packageDir = workspacePackageMap[packageName]
      if (!packageDir) {
        continue
      }

      const workspacePackageJsonPath = join(packagesRoot, packageDir, 'package.json')
      if (!existsSync(workspacePackageJsonPath)) {
        continue
      }

      const workspacePackageJson = JSON.parse(readFileSync(workspacePackageJsonPath, 'utf-8')) as { version?: string }
      if (!workspacePackageJson.version) {
        continue
      }

      deps[packageName] = `^${workspacePackageJson.version}`
      changed = true
    }
  }

  if (changed) {
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
  }
}

export function scaffoldProject(options: ScaffoldProjectOptions): void {
  mkdirSync(options.projectDir, { recursive: true })
  copyTemplateFiles(options.templateDir, options.projectDir)
  renameSpecialFiles(options.projectDir)
  applyTemplateVariables(options.projectDir, {
    ...getTemplateVariables(options.provider),
    ...getScaffoldMetadata(options.projectName ?? 'my-chat-app', options.packageManager ?? 'npm'),
  })
  replaceWorkspaceProtocolDeps(options.projectDir, options.templateDir)
}
