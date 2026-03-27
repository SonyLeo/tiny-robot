import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const packageMap = {
  '@opentiny/tiny-robot': 'components',
  '@opentiny/tiny-robot-svgs': 'svgs',
  '@opentiny/tiny-robot-kit': 'kit',
  '@opentiny/tiny-robot-chat': 'chat',
}

export function collectWorkspacePackageVersions(packagesDir, packageDirectoryMap = packageMap) {
  const versions = {}

  for (const [packageName, dir] of Object.entries(packageDirectoryMap)) {
    const packageJsonPath = join(packagesDir, dir, 'package.json')
    if (!existsSync(packageJsonPath)) {
      continue
    }

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    versions[packageName] = pkg.version
  }

  return versions
}

export function getTemplatePackageJsonPaths(templatesDir) {
  return readdirSync(templatesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(templatesDir, entry.name, 'package.json'))
    .filter((filePath) => existsSync(filePath))
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function getTopLevelDependencies(pkg) {
  return {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  }
}

export function updateTemplateDependencyVersions({
  templatesDir,
  packagesDir,
  packageDirectoryMap = packageMap,
}) {
  const versions = collectWorkspacePackageVersions(packagesDir, packageDirectoryMap)
  let updatedCount = 0

  for (const packageJsonPath of getTemplatePackageJsonPaths(templatesDir)) {
    const pkg = readJson(packageJsonPath)
    let changed = false

    for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[section]
      if (!deps) {
        continue
      }

      for (const [packageName, version] of Object.entries(deps)) {
        if (version === 'workspace:*' && versions[packageName]) {
          deps[packageName] = `^${versions[packageName]}`
          changed = true
        }
      }
    }

    if (changed) {
      writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
      updatedCount += 1
    }
  }

  return {
    updatedCount,
    versions,
  }
}

export function validateTemplatePackages(templatesDir) {
  const errors = []

  for (const packageJsonPath of getTemplatePackageJsonPaths(templatesDir)) {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
    if (!packageJsonContent.includes('workspace:*')) {
      continue
    }

    const templateName = packageJsonPath.split(/[\\/]/).at(-2) ?? packageJsonPath
    errors.push(`${templateName}/package.json still contains workspace:* dependencies`)
  }

  return errors
}

export function validateTemplateDependencyClosure({
  templatesDir,
  packagesDir,
  packageDirectoryMap = packageMap,
}) {
  const errors = []
  const packageJsonCache = new Map()

  function getWorkspacePackageJson(packageName) {
    const cached = packageJsonCache.get(packageName)
    if (cached !== undefined) {
      return cached
    }

    const dir = packageDirectoryMap[packageName]
    if (!dir) {
      packageJsonCache.set(packageName, null)
      return null
    }

    const packageJsonPath = join(packagesDir, dir, 'package.json')
    if (!existsSync(packageJsonPath)) {
      packageJsonCache.set(packageName, null)
      return null
    }

    const pkg = readJson(packageJsonPath)
    packageJsonCache.set(packageName, pkg)
    return pkg
  }

  for (const packageJsonPath of getTemplatePackageJsonPaths(templatesDir)) {
    const templateName = packageJsonPath.split(/[\\/]/).at(-2) ?? packageJsonPath
    const pkg = readJson(packageJsonPath)
    const topLevelDependencies = getTopLevelDependencies(pkg)
    const visitedWorkspacePackages = new Set()
    const reportedMissingPeers = new Set()

    function visitWorkspacePackage(packageName) {
      if (visitedWorkspacePackages.has(packageName)) {
        return
      }
      visitedWorkspacePackages.add(packageName)

      const workspacePackageJson = getWorkspacePackageJson(packageName)
      if (!workspacePackageJson) {
        return
      }

      for (const peerName of Object.keys(workspacePackageJson.peerDependencies ?? {})) {
        if (topLevelDependencies[peerName]) {
          continue
        }

        const reportKey = `${templateName}:${packageName}:${peerName}`
        if (reportedMissingPeers.has(reportKey)) {
          continue
        }

        errors.push(`${templateName}/package.json is missing peer dependency "${peerName}" required by "${packageName}"`)
        reportedMissingPeers.add(reportKey)
      }

      for (const dependencyName of Object.keys(workspacePackageJson.dependencies ?? {})) {
        if (!packageDirectoryMap[dependencyName]) {
          continue
        }

        visitWorkspacePackage(dependencyName)
      }
    }

    for (const dependencyName of Object.keys(topLevelDependencies)) {
      if (!packageDirectoryMap[dependencyName]) {
        continue
      }

      visitWorkspacePackage(dependencyName)
    }
  }

  return errors
}

export function validateTemplateRegistry({
  templatesDir,
  templateDefinitions,
  validFeatureKeys = [],
}) {
  const errors = []
  const validFeatureKeySet = new Set(validFeatureKeys)

  function getTemplateLayerDirs(template) {
    return [
      ...(template.baseTemplateDir ? [join(templatesDir, template.baseTemplateDir)] : []),
      join(templatesDir, template.templateDir),
    ]
  }

  function hasTemplateFile(template, relativePath) {
    return getTemplateLayerDirs(template).some((dir) => existsSync(join(dir, relativePath)))
  }

  for (const template of templateDefinitions) {
    const templateRoot = join(templatesDir, template.templateDir)

    for (const feature of template.requiredChatFeatures ?? []) {
      if (!validFeatureKeySet.has(feature)) {
        errors.push(`Template "${template.id}" references unknown required feature "${feature}"`)
      }
    }

    if (template.baseTemplateDir !== undefined) {
      const baseTemplateRoot = join(templatesDir, template.baseTemplateDir)
      if (!existsSync(baseTemplateRoot)) {
        errors.push(`Template "${template.id}" points to missing base directory "${template.baseTemplateDir}"`)
      }
    }

    if (!existsSync(templateRoot)) {
      errors.push(`Template "${template.id}" points to missing directory "${template.templateDir}"`)
      continue
    }

    if (!hasTemplateFile(template, 'package.json')) {
      errors.push(`Template "${template.id}" is missing package.json across its template layers`)
    }
  }

  return errors
}

function getTemplateSourceFiles(templateRoot) {
  const sourceFiles = []
  const queue = [join(templateRoot, 'src')]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || !existsSync(current)) {
      continue
    }

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(entryPath)
        continue
      }

      if (/\.(ts|vue|js|mjs)$/.test(entry.name)) {
        sourceFiles.push(entryPath)
      }
    }
  }

  return sourceFiles
}

function fileContainsPattern(filePaths, pattern) {
  return filePaths.some((filePath) => readFileSync(filePath, 'utf-8').includes(pattern))
}

export function validateTemplateContractUsageSource({
  templatesDir,
  templateDefinitions,
}) {
  const errors = []

  for (const template of templateDefinitions) {
    const templateRoots = [
      ...(template.baseTemplateDir ? [join(templatesDir, template.baseTemplateDir)] : []),
      join(templatesDir, template.templateDir),
    ]
    const sourceFiles = templateRoots.flatMap((templateRoot) => getTemplateSourceFiles(templateRoot))
    const mode = template.contractUsage.mode

    if (mode === 'blackbox-component') {
      if (!fileContainsPattern(sourceFiles, 'TrChat')) {
        errors.push(`Template "${template.id}" must reference "TrChat" when using "blackbox-component"`)
      }

      if (fileContainsPattern(sourceFiles, 'chatCapabilitySurface')) {
        errors.push(`Template "${template.id}" must not reference "chatCapabilitySurface" when using "blackbox-component"`)
      }

      if (fileContainsPattern(sourceFiles, 'TrChat.Root')) {
        errors.push(`Template "${template.id}" must not render "TrChat.Root" when using "blackbox-component"`)
      }

      continue
    }

    if (mode === 'scaffold-slots') {
      if (!fileContainsPattern(sourceFiles, 'TrChat.Scaffold')) {
        errors.push(`Template "${template.id}" must reference "TrChat.Scaffold" when using "scaffold-slots"`)
      }

      for (const pattern of ['TrChat.Layout', 'TrChat.Header', 'TrChat.MessageList', 'TrChat.Sender']) {
        if (!fileContainsPattern(sourceFiles, pattern)) {
          errors.push(`Template "${template.id}" must reference "${pattern}" when using "scaffold-slots"`)
        }
      }

      const requiresMcp = (template.requiredChatFeatures ?? []).includes('mcp')
      if (requiresMcp && !fileContainsPattern(sourceFiles, 'TrMcpTrigger') && !fileContainsPattern(sourceFiles, 'TrChatMcpPanel')) {
        errors.push(
          `Template "${template.id}" must reference "TrMcpTrigger" or "TrChatMcpPanel" when requiring "mcp"`,
        )
      }

      continue
    }

    if (mode !== 'whitebox-slices') {
      continue
    }

    if (!fileContainsPattern(sourceFiles, 'chatCapabilitySurface')) {
      errors.push(`Template "${template.id}" must reference "chatCapabilitySurface" when using "whitebox-slices"`)
    }

    if (!fileContainsPattern(sourceFiles, 'TrChat.Root')) {
      errors.push(`Template "${template.id}" must render "TrChat.Root" when using "whitebox-slices"`)
    }

    for (const sliceKey of template.contractUsage.presetSliceKeys ?? []) {
      if (!fileContainsPattern(sourceFiles, `slices.${sliceKey}`)) {
        errors.push(`Template "${template.id}" declares preset slice "${sliceKey}" but does not reference "slices.${sliceKey}"`)
      }
    }
  }

  return errors
}
