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
