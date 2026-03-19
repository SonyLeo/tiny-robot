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

export function updateTemplateDependencyVersions({
  templatesDir,
  packagesDir,
  packageDirectoryMap = packageMap,
}) {
  const versions = collectWorkspacePackageVersions(packagesDir, packageDirectoryMap)
  let updatedCount = 0

  for (const packageJsonPath of getTemplatePackageJsonPaths(templatesDir)) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
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

export function validateTemplateRegistry({
  templatesDir,
  templateDefinitions,
  validFeatureKeys = [],
}) {
  const errors = []
  const validFeatureKeySet = new Set(validFeatureKeys)

  for (const template of templateDefinitions) {
    const templateRoot = join(templatesDir, template.templateDir)
    const packageJsonPath = join(templateRoot, 'package.json')

    for (const feature of template.requiredChatFeatures ?? []) {
      if (!validFeatureKeySet.has(feature)) {
        errors.push(`Template "${template.id}" references unknown required feature "${feature}"`)
      }
    }

    if (!existsSync(templateRoot)) {
      errors.push(`Template "${template.id}" points to missing directory "${template.templateDir}"`)
      continue
    }

    if (!existsSync(packageJsonPath)) {
      errors.push(`Template "${template.id}" is missing package.json in "${template.templateDir}"`)
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
    if (template.contractUsage.mode !== 'whitebox-slices') {
      continue
    }

    const templateRoot = join(templatesDir, template.templateDir)
    const sourceFiles = getTemplateSourceFiles(templateRoot)

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
