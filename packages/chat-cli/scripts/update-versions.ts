#!/usr/bin/env node
/**
 * update-versions.ts — 自动同步模板 package.json 中的依赖版本
 *
 * 在 release CI 中运行（发布前），将模板中的 workspace:* 替换为各包的实际发布版本。
 * 用法：npx tsx scripts/update-versions.ts
 *      或 node --import tsx/esm scripts/update-versions.ts
 *
 * 设计原则（参考 chat-kit-design.md §9.4）：
 * - 版本同步在 CI/发布时运行，而非 CLI 运行时动态读取
 * - 各包独立读取自己的 package.json 版本，不共用同一个版本号
 * - 支持多个模板目录批量更新
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const chatCliDir = join(__dirname, '..') // packages/chat-cli/
const packagesDir = join(__dirname, '../..') // packages/

// ── 需要同步的包，key 为 npm 包名，value 为 monorepo 内的目录名 ──────────
const PACKAGES: Record<string, string> = {
  '@opentiny/tiny-robot': 'components',
  '@opentiny/tiny-robot-svgs': 'svgs',
  '@opentiny/tiny-robot-kit': 'kit',
  '@opentiny/tiny-robot-chat': 'chat',
}

// ── 1. 读取各包的实际版本 ────────────────────────────────────────────────
console.log('\n🔍 Reading package versions...')
const versions: Record<string, string> = {}

for (const [pkgName, dir] of Object.entries(PACKAGES)) {
  const pkgJsonPath = join(packagesDir, dir, 'package.json')
  if (!existsSync(pkgJsonPath)) {
    console.warn(`  ⚠ Package not found: ${pkgJsonPath}，跳过 ${pkgName}`)
    continue
  }
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as { version: string }
  versions[pkgName] = pkg.version
}

console.log('\n📦 Found versions:')
for (const [name, version] of Object.entries(versions)) {
  console.log(`  \x1b[32m✓\x1b[0m ${name}: ${version}`)
}

// ── 2. 遍历所有模板目录，更新 package.json ────────────────────────────────
interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  [key: string]: unknown
}

const templatesDir = join(chatCliDir, 'templates')
const templateDirs = readdirSync(templatesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(templatesDir, d.name))

console.log('\n📝 Updating template package.json files...')
let updatedCount = 0

for (const templateDir of templateDirs) {
  const pkgJsonPath = join(templateDir, 'package.json')
  if (!existsSync(pkgJsonPath)) continue

  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as PackageJson
  let changed = false
  const templateName = templateDir.split(/[\\/]/).at(-1) ?? templateDir

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const deps = pkg[section]
    if (!deps) continue

    for (const [name, currentVersion] of Object.entries(deps)) {
      if (currentVersion === 'workspace:*' && versions[name]) {
        deps[name] = `^${versions[name]}`
        changed = true
        console.log(`  \x1b[32m✓\x1b[0m ${templateName}/${section}/${name}: workspace:* → ^${versions[name]}`)
      }
    }
  }

  if (changed) {
    writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
    updatedCount++
  }
}

console.log(`\n✅ Done! Updated ${updatedCount} template package.json file(s).`)
