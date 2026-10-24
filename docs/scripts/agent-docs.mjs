import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const AGENT_SCRIPT_PATH = fileURLToPath(import.meta.url)
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..')
const SRC_ROOT = path.join(DOCS_ROOT, 'src')
const DEMOS_ROOT = path.join(DOCS_ROOT, 'demos')
const THEME_CONFIG_PATH = path.join(DOCS_ROOT, '.vitepress', 'themeConfig.ts')
const OUTPUT_ROOT = path.join(DOCS_ROOT, '.agent-docs')
const MANIFEST_PATH = path.join(OUTPUT_ROOT, 'manifest.json')
const REPORT_PATH = path.join(OUTPUT_ROOT, 'validation-report.json')
const SCHEMA_VERSION = '0.1.0'
const MAX_LLM_FULL_BYTES = 10 * 1024 * 1024
const ALLOWED_DEMO_EXTENSIONS = new Set([
  '.vue',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.scss',
  '.less',
  '.html',
  '.svg',
])
const KIND_BY_DIRECTORY = {
  'best-practices': 'best-practice',
  components: 'component',
  examples: 'example',
  guide: 'guide',
  icons: 'reference',
  migration: 'migration',
  suites: 'suite',
  tools: 'tool',
}

const commandArgs = process.argv.slice(2)
const command = commandArgs.find((argument) => !argument.startsWith('--')) || 'help'
const checkOnly = command === 'check' || commandArgs.includes('--check')

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function isWithin(candidate, root) {
  const relative = path.relative(root, candidate)
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
}

function realPathIfExists(candidate) {
  try {
    return fs.realpathSync.native(candidate)
  } catch {
    return path.resolve(candidate)
  }
}

function ensureWithin(candidate, root) {
  const resolved = path.resolve(candidate)
  const realRoot = realPathIfExists(root)
  const realCandidate = fs.existsSync(resolved) ? realPathIfExists(resolved) : resolved
  return isWithin(realCandidate, realRoot)
}

function walkMarkdown(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(absolute))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolute)
  }
  return files.sort()
}

function blankFencedCode(content) {
  const lines = content.split(/(\r?\n)/)
  let fence = null
  return lines
    .map((line) => {
      const match = line.match(/^\s*(`{3,}|~{3,})/)
      if (match) {
        const marker = match[1][0]
        if (!fence) fence = marker
        else if (fence === marker) fence = null
        return line.replace(/[^\r\n]/g, ' ')
      }
      return fence ? line.replace(/[^\r\n]/g, ' ') : line
    })
    .join('')
}

function findTagEnd(content, start) {
  let quote = null
  let bracketDepth = 0
  for (let index = start; index < content.length; index += 1) {
    const char = content[index]
    if (quote) {
      if (char === '\\') index += 1
      else if (char === quote) quote = null
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '[' || char === '{' || char === '(') bracketDepth += 1
    else if (char === ']' || char === '}' || char === ')') bracketDepth = Math.max(0, bracketDepth - 1)
    else if (char === '>' && bracketDepth === 0) return index
  }
  return -1
}

function parseAttributes(tag) {
  const attributes = {}
  let index = tag.indexOf('demo') + 4
  while (index < tag.length) {
    while (/\s/.test(tag[index] || '')) index += 1
    if (tag[index] === '/' || tag[index] === '>') break

    const nameStart = index
    while (index < tag.length && !/[\s=/>]/.test(tag[index])) index += 1
    const name = tag.slice(nameStart, index)
    if (!name) {
      index += 1
      continue
    }
    while (/\s/.test(tag[index] || '')) index += 1
    if (tag[index] !== '=') {
      attributes[name] = true
      continue
    }
    index += 1
    while (/\s/.test(tag[index] || '')) index += 1
    const quote = tag[index]
    if (quote === "'" || quote === '"') {
      index += 1
      const valueStart = index
      while (index < tag.length && tag[index] !== quote) {
        if (tag[index] === '\\') index += 1
        index += 1
      }
      attributes[name] = tag.slice(valueStart, index)
      index += 1
    } else {
      const valueStart = index
      while (index < tag.length && !/[\s>]/.test(tag[index])) index += 1
      attributes[name] = tag.slice(valueStart, index)
    }
  }
  return attributes
}

function parseStringArray(value) {
  if (typeof value !== 'string') return { error: '必须是字符串数组' }
  const source = value.trim()
  if (!source.startsWith('[') || !source.endsWith(']')) return { error: '必须使用数组语法 `[...]`' }
  const values = []
  let quote = null
  let current = ''
  for (let index = 1; index < source.length - 1; index += 1) {
    const char = source[index]
    if (quote) {
      if (char === '\\' && index + 1 < source.length - 1) {
        current += source[index + 1]
        index += 1
      } else if (char === quote) {
        values.push(current)
        current = ''
        quote = null
      } else current += char
      continue
    }
    if (char === "'" || char === '"' || char === '`') quote = char
  }
  return quote ? { error: '未闭合的字符串' } : { values }
}

function firstHeading(content) {
  const clean = blankFencedCode(content)
  return clean.match(/^\s*#\s+(.+?)\s*#*\s*$/m)?.[1]?.trim() || null
}

function routeForSource(source) {
  const withoutExtension = source.replace(/\.md$/i, '')
  if (withoutExtension === 'index') return '/'
  if (withoutExtension.endsWith('/index')) return `/${withoutExtension.slice(0, -'/index'.length)}/`
  return `/${withoutExtension}`
}

function routeKey(route) {
  if (route === '/') return route
  return route.replace(/\/$/, '')
}

function readBuildConfig(issues) {
  const base = process.env.VITEPRESS_BASE || '/'
  if (!base.startsWith('/') || !base.endsWith('/')) {
    issues.push(issue('error', 'invalid-vitepress-base', 'VITEPRESS_BASE 必须以 `/` 开头和结尾', 'build-config'))
  }
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')
  const siteUrl = process.env.DOCS_SITE_URL || null
  if (!siteUrl) return { docsSiteUrl: null, vitepressBase: normalizedBase }

  try {
    const parsed = new URL(siteUrl)
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.pathname !== '/' || parsed.search || parsed.hash) {
      throw new Error('必须是 scheme + host，可选 port，不能包含路径、查询参数或片段')
    }
    return { docsSiteUrl: parsed.origin, vitepressBase: normalizedBase }
  } catch (error) {
    issues.push(issue('error', 'invalid-docs-site-url', `DOCS_SITE_URL 无效：${error.message}`, 'build-config'))
    return { docsSiteUrl: null, vitepressBase: normalizedBase }
  }
}

function canonicalUrl(route, config) {
  if (!config.docsSiteUrl) return null
  const relativeRoute = route === '/' ? '' : route.replace(/^\/+/, '')
  return `${config.docsSiteUrl}${config.vitepressBase}${relativeRoute}`
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return []
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(absolute))
    else if (entry.isFile()) files.push(absolute)
  }
  return files.sort()
}

function inputHash(config) {
  const inputs = [...walkMarkdown(SRC_ROOT), ...walkFiles(DEMOS_ROOT), THEME_CONFIG_PATH, AGENT_SCRIPT_PATH]
    .filter((file, index, files) => files.indexOf(file) === index && fs.existsSync(file))
    .sort()
  const hash = crypto.createHash('sha256')
  hash.update(`DOCS_SITE_URL=${config.docsSiteUrl || ''}\0VITEPRESS_BASE=${config.vitepressBase}\0`)
  for (const file of inputs) {
    hash.update(toPosix(path.relative(DOCS_ROOT, file)))
    hash.update('\0')
    hash.update(fs.readFileSync(file))
    hash.update('\0')
  }
  return hash.digest('hex')
}

function inferKind(source) {
  const firstSegment = source.split('/')[0]
  return KIND_BY_DIRECTORY[firstSegment] || 'page'
}

function issue(severity, code, message, source, details = {}) {
  return { severity, code, message, source, ...details }
}

function validateStringArray(value, field, source, issues) {
  if (value === undefined) return null
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    issues.push(issue('error', 'invalid-frontmatter', `${field} 必须是字符串数组`, source, { field }))
    return null
  }
  return value
}

function parseDemoTags(content, pageFile, pageSource, issues) {
  const masked = blankFencedCode(content)
  const demos = []
  let cursor = 0
  while (true) {
    const match = /<demo\b/gi.exec(masked.slice(cursor))
    if (!match) break
    const start = cursor + match.index
    const end = findTagEnd(masked, start)
    if (end < 0) {
      issues.push(issue('error', 'invalid-demo-tag', 'Demo 标签缺少结束符 `>`', pageSource))
      break
    }
    const attributes = parseAttributes(content.slice(start, end + 1))
    const filesValue = attributes[':vueFiles'] ?? attributes.vueFiles
    const parsedFiles = filesValue === undefined ? null : parseStringArray(filesValue)
    if (parsedFiles?.error) {
      issues.push(issue('error', 'invalid-demo-files', `无法解析 vueFiles：${parsedFiles.error}`, pageSource))
    }
    const declaredPaths = parsedFiles?.values || []
    const entryPath =
      typeof attributes.vue === 'string'
        ? attributes.vue
        : typeof attributes.html === 'string'
          ? attributes.html
          : declaredPaths.find((value) => value.endsWith('.vue') || value.endsWith('.html'))
    const fileInputs = declaredPaths.length > 0 ? declaredPaths : entryPath ? [entryPath] : []
    if (fileInputs.length === 0) {
      issues.push(issue('error', 'missing-demo-source', 'Demo 必须声明 vue 或 vueFiles', pageSource))
      cursor = end + 1
      continue
    }

    const files = []
    for (const rawPath of fileInputs) {
      if (typeof rawPath !== 'string' || !rawPath.trim()) {
        issues.push(issue('error', 'invalid-demo-path', 'Demo 文件路径不能为空', pageSource))
        continue
      }
      const absolute = path.resolve(path.dirname(pageFile), rawPath)
      const relativeToDocs = toPosix(path.relative(DOCS_ROOT, absolute))
      if (!ensureWithin(absolute, DEMOS_ROOT)) {
        issues.push(
          issue('error', 'demo-path-outside-root', `Demo 路径越出 docs/demos：${rawPath}`, pageSource, {
            path: rawPath,
          }),
        )
        continue
      }
      const extension = path.extname(absolute).toLowerCase()
      if (!ALLOWED_DEMO_EXTENSIONS.has(extension)) {
        issues.push(
          issue('error', 'unsupported-demo-extension', `Demo 文件扩展名不在白名单中：${extension}`, pageSource, {
            path: rawPath,
          }),
        )
      }
      if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
        issues.push(issue('error', 'missing-demo-file', `Demo 文件不存在：${rawPath}`, pageSource, { path: rawPath }))
        continue
      }
      files.push({ path: relativeToDocs.replace(/^demos\//, ''), role: rawPath === entryPath ? 'entry' : 'dependency' })
    }

    const fileSet = new Set(files.map((file) => file.path))
    for (const file of files) {
      const absolute = path.join(DEMOS_ROOT, file.path)
      for (const imported of localImports(absolute)) {
        const resolved = resolveImport(absolute, imported)
        if (!resolved || !ensureWithin(resolved, DEMOS_ROOT)) continue
        const relative = toPosix(path.relative(DEMOS_ROOT, resolved))
        if (!fileSet.has(relative)) {
          issues.push(
            issue('warning', 'undeclared-demo-dependency', `Demo 使用了未列出的本地依赖：${relative}`, pageSource, {
              path: relative,
            }),
          )
        }
      }
    }

    demos.push({
      order: demos.length,
      title: typeof attributes.title === 'string' ? attributes.title : null,
      description: typeof attributes.description === 'string' ? attributes.description : null,
      entry: entryPath ? toPosix(path.relative(DEMOS_ROOT, path.resolve(path.dirname(pageFile), entryPath))) : null,
      files,
      explicitFiles: declaredPaths.length > 0,
      playground: attributes.playground === 'false' ? false : true,
    })
    cursor = end + 1
  }
  return demos
}

function localImports(file) {
  const content = fs.readFileSync(file, 'utf8')
  const imports = []
  const pattern =
    /(?:import\s+(?:[^'"\n]*?\s+from\s*)?|export\s+[^'"\n]*?\s+from\s*|require\s*\(|import\s*\()\s*['"]([^'"]+)['"]/g
  for (const match of content.matchAll(pattern)) {
    if (match[1].startsWith('.')) imports.push(match[1])
  }
  return imports
}

function resolveImport(file, imported) {
  const base = path.resolve(path.dirname(file), imported)
  const candidates = [
    base,
    ...Array.from(ALLOWED_DEMO_EXTENSIONS, (extension) => `${base}${extension}`),
    ...Array.from(ALLOWED_DEMO_EXTENSIONS, (extension) => path.join(base, `index${extension}`)),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null
}

function parsePage(file, config) {
  const source = toPosix(path.relative(SRC_ROOT, file))
  const content = fs.readFileSync(file, 'utf8')
  const issues = []
  let data
  let body
  try {
    const parsed = matter(content)
    data = parsed.data
    body = parsed.content
  } catch (error) {
    issues.push(issue('error', 'invalid-frontmatter', `frontmatter 解析失败：${error.message}`, source))
    data = {}
    body = content
  }

  const heading = firstHeading(body)
  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : heading
  if (!title) issues.push(issue('warning', 'missing-title', '页面缺少 title 和 H1，将使用文件名作为临时标题', source))
  else if (!data.title) issues.push(issue('info', 'inferred-title', 'title 由页面 H1 推导', source))

  const kind = typeof data.kind === 'string' && data.kind.trim() ? data.kind.trim() : inferKind(source)
  if (!data.kind) issues.push(issue('info', 'inferred-kind', `kind 由目录推导为 ${kind}`, source))
  if (!data.description) issues.push(issue('warning', 'missing-description', '页面缺少 description', source))
  if (!data.status) issues.push(issue('warning', 'missing-status', '页面缺少 status', source))

  const exports = validateStringArray(data.exports, 'exports', source, issues)
  const keywords = validateStringArray(data.keywords, 'keywords', source, issues)
  const related = validateStringArray(data.related, 'related', source, issues)
  const isDraft = data.draft === true || data.status === 'draft'
  const route = routeForSource(source)
  const page = {
    id: source.replace(/\.md$/i, '').replace(/\/index$/i, '') || 'index',
    route,
    canonicalUrl: canonicalUrl(route, config),
    source,
    title: title || path.basename(source, '.md'),
    description: typeof data.description === 'string' ? data.description.trim() : null,
    kind,
    status: typeof data.status === 'string' ? data.status : null,
    draft: isDraft,
    package: typeof data.package === 'string' ? data.package : null,
    exports,
    keywords,
    related,
    demos: parseDemoTags(body, file, source, issues),
  }
  return { page, issues }
}

function validateRelatedLinks(pages, issues) {
  const routes = new Set(pages.filter((page) => !page.draft).map((page) => routeKey(page.route)))
  for (const page of pages) {
    for (const related of page.related || []) {
      if (/^(?:[a-z]+:)?\/\//i.test(related) || related.startsWith('#')) continue
      const route = routeKey(related.startsWith('/') ? related : `/${related.replace(/\.md$/, '')}`)
      if (!routes.has(route))
        issues.push(
          issue('error', 'invalid-related-link', `related 未指向正式页面：${related}`, page.source, { related }),
        )
    }
  }
}

function navigationRoutes() {
  if (!fs.existsSync(THEME_CONFIG_PATH)) return null
  const routes = []
  let base = '/'
  const content = fs.readFileSync(THEME_CONFIG_PATH, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const baseMatch = line.match(/\bbase\s*:\s*['"]([^'"]+)['"]/)
    if (baseMatch) base = baseMatch[1]
    for (const match of line.matchAll(/\blink\s*:\s*['"]([^'"]+)['"]/g)) {
      const link = match[1]
      if (/^(?:[a-z]+:)?\/\//i.test(link) || link.startsWith('#')) continue
      const route = link.startsWith('/') ? link : `${base.replace(/\/$/, '')}/${link}`
      routes.push(route.replace(/\/+/g, '/'))
    }
  }
  return [...new Set(routes)]
}

function validateNavigation(pages, issues) {
  const routes = navigationRoutes()
  if (routes === null) {
    issues.push(issue('error', 'missing-navigation-config', '找不到 VitePress 导航配置', '.vitepress/themeConfig.ts'))
    return []
  }
  const pageRoutes = new Set(pages.filter((page) => !page.draft).map((page) => routeKey(page.route)))
  for (const route of routes) {
    if (!pageRoutes.has(routeKey(route)))
      issues.push(
        issue('error', 'invalid-navigation-link', `导航链接未指向正式页面：${route}`, '.vitepress/themeConfig.ts', {
          route,
        }),
      )
  }
  return routes
}

function buildCatalog() {
  const issues = []
  const config = readBuildConfig(issues)
  const pages = []
  const seenRoutes = new Map()
  const seenIds = new Map()
  for (const file of walkMarkdown(SRC_ROOT)) {
    const result = parsePage(file, config)
    pages.push(result.page)
    issues.push(...result.issues)
    const key = routeKey(result.page.route)
    if (seenRoutes.has(key)) {
      issues.push(
        issue(
          'error',
          'duplicate-route',
          `route 与 ${seenRoutes.get(key)} 重复：${result.page.route}`,
          result.page.source,
        ),
      )
    } else seenRoutes.set(key, result.page.source)
    if (seenIds.has(result.page.id)) {
      issues.push(
        issue(
          'error',
          'duplicate-id',
          `id 与 ${seenIds.get(result.page.id)} 重复：${result.page.id}`,
          result.page.source,
        ),
      )
    } else seenIds.set(result.page.id, result.page.source)
  }
  validateRelatedLinks(pages, issues)
  const navigation = validateNavigation(pages, issues)
  const publishedPages = pages.filter((page) => !page.draft)
  const draftPages = pages.filter((page) => page.draft)
  const errors = issues.filter((item) => item.severity === 'error')
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    sourceRoot: 'src',
    demoRoot: 'demos',
    config,
    inputHash: inputHash(config),
    navigation: {
      source: '.vitepress/themeConfig.ts',
      routes: navigation,
    },
    counts: {
      pages: pages.length,
      publishedPages: publishedPages.length,
      draftPages: draftPages.length,
      demos: pages.reduce((count, page) => count + page.demos.length, 0),
      errors: errors.length,
      warnings: issues.filter((item) => item.severity === 'warning').length,
      infos: issues.filter((item) => item.severity === 'info').length,
    },
    pages: publishedPages,
    excludedPages: draftPages.map((page) => ({ id: page.id, source: page.source, reason: 'draft' })),
    issues,
  }
}

function refreshCounts(catalog) {
  catalog.counts.errors = catalog.issues.filter((item) => item.severity === 'error').length
  catalog.counts.warnings = catalog.issues.filter((item) => item.severity === 'warning').length
  catalog.counts.infos = catalog.issues.filter((item) => item.severity === 'info').length
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function validateGeneratedCatalog(catalog) {
  const generated = readJson(MANIFEST_PATH)
  const report = readJson(REPORT_PATH)
  if (!generated) {
    catalog.issues.push(
      issue(
        'error',
        'missing-generated-catalog',
        '找不到内部 manifest，请先运行 `agent:catalog`',
        '.agent-docs/manifest.json',
      ),
    )
  } else {
    if (generated.schemaVersion !== catalog.schemaVersion)
      catalog.issues.push(
        issue('error', 'stale-generated-catalog', 'manifest 的 schemaVersion 已过期', '.agent-docs/manifest.json'),
      )
    if (generated.inputHash !== catalog.inputHash)
      catalog.issues.push(
        issue(
          'error',
          'stale-generated-catalog',
          'manifest 与当前页面、Demo 或脚本输入不一致，请重新生成',
          '.agent-docs/manifest.json',
        ),
      )
  }
  if (!report) {
    catalog.issues.push(
      issue(
        'error',
        'missing-validation-report',
        '找不到校验报告，请先运行 `agent:catalog`',
        '.agent-docs/validation-report.json',
      ),
    )
  } else if (report.inputHash !== catalog.inputHash) {
    catalog.issues.push(
      issue(
        'error',
        'stale-validation-report',
        '校验报告与当前输入不一致，请重新生成',
        '.agent-docs/validation-report.json',
      ),
    )
  }
}

function publicUrl(relativePath, config) {
  const origin = config.docsSiteUrl || 'http://localhost:4173'
  const base = config.vitepressBase
  const relative = relativePath.replace(/^\/+/, '')
  return `${origin}${base}${relative}`
}

function rawPathForPage(page) {
  return `raw/${page.source}`
}

function demoUrl(filePath, config) {
  return publicUrl(`demos/${filePath}`, config)
}

function splitUrlSuffix(value) {
  const match = value.match(/^([^?#]*)([?#].*)?$/)
  return { pathname: match?.[1] || value, suffix: match?.[2] || '' }
}

function resolveMarkdownUrl(target, page, pageBySource, pageByRoute, config, issues) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target) || target.startsWith('mailto:')) return target
  const { pathname, suffix } = splitUrlSuffix(target)
  if (!pathname) return `${page.canonicalUrl || publicUrl(page.route, config)}${suffix}`
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    issues.push(issue('warning', 'invalid-link-encoding', `无法解码站内链接：${target}`, page.source, { target }))
    return target
  }
  if (decoded.includes('\\')) {
    issues.push(
      issue('warning', 'unsafe-relative-link', `站内链接包含不安全路径，保留原文：${target}`, page.source, { target }),
    )
    return target
  }

  if (decoded.startsWith('/')) {
    const absoluteSource = decoded.replace(/^\/+/, '').replace(/\.md$/i, '')
    const targetPage = pageBySource.get(`${absoluteSource}.md`) || pageByRoute.get(routeKey(decoded))
    if (targetPage) return `${targetPage.canonicalUrl || publicUrl(targetPage.route, config)}${suffix}`
    return `${publicUrl(decoded, config)}${suffix}`
  }

  const resolvedSource = path.posix.normalize(path.posix.join(path.posix.dirname(page.source), decoded))
  if (resolvedSource === '..' || resolvedSource.startsWith('../')) {
    issues.push(
      issue('warning', 'unsafe-relative-link', `站内链接越出文档源目录，保留原文：${target}`, page.source, { target }),
    )
    return target
  }
  const markdownSource = /\.md$/i.test(resolvedSource) ? resolvedSource : `${resolvedSource}.md`
  const targetPage = pageBySource.get(markdownSource)
  if (targetPage) return `${targetPage.canonicalUrl || publicUrl(targetPage.route, config)}${suffix}`
  if (decoded.startsWith('#')) return `${page.canonicalUrl || publicUrl(page.route, config)}${decoded}`

  const publicAsset = resolvedSource.replace(/^public\//, '')
  const assetPath = publicUrl(publicAsset, config)
  issues.push(
    issue(
      'warning',
      'unverified-local-link',
      `本地资源链接已按站点路径改写，但未验证其发布位置：${target}`,
      page.source,
      { target, output: `${assetPath}${suffix}` },
    ),
  )
  return `${assetPath}${suffix}`
}

function rewriteMarkdownLinks(content, page, pageBySource, pageByRoute, config, issues) {
  const lines = content.split(/(\r?\n)/)
  let fence = null
  const linkPattern = /(!?\[[^\]]*\]\()\s*(<[^>]+>|[^\s)]+)(\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*(\))/g
  return lines
    .map((line) => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
      if (fenceMatch) {
        const marker = fenceMatch[1][0]
        if (!fence) fence = marker
        else if (fence === marker) fence = null
        return line
      }
      if (fence) return line
      const inlineCode = [...line.matchAll(/(`+).*?\1/g)].map((match) => [match.index, match.index + match[0].length])
      return line.replace(linkPattern, (whole, prefix, rawTarget, title, close, offset) => {
        if (inlineCode.some(([start, end]) => offset < end && offset + whole.length > start)) return whole
        const target = rawTarget.startsWith('<') && rawTarget.endsWith('>') ? rawTarget.slice(1, -1) : rawTarget
        if (target.startsWith('`')) return whole
        const rewritten = resolveMarkdownUrl(target, page, pageBySource, pageByRoute, config, issues)
        return `${prefix}<${rewritten}>${title || ''}${close}`
      })
    })
    .join('')
}

function replaceDemoTags(content, page, config) {
  const masked = blankFencedCode(content)
  const chunks = []
  let cursor = 0
  let demoIndex = 0
  while (true) {
    const match = /<demo\b/gi.exec(masked.slice(cursor))
    if (!match) break
    const start = cursor + match.index
    const end = findTagEnd(masked, start)
    if (end < 0) break
    const demo = page.demos[demoIndex++]
    if (!demo) {
      cursor = end + 1
      continue
    }
    chunks.push(content.slice(cursor, start))
    const files = demo.files.map((file) => `- [${path.posix.basename(file.path)}](${demoUrl(file.path, config)})`)
    const title = demo.title || '示例'
    const description = demo.description ? `\n\n${demo.description}` : ''
    chunks.push(`\n> **${title}**${description}\n>\n${files.map((line) => `> ${line}`).join('\n')}\n\n`)
    cursor = end + 1
  }
  chunks.push(content.slice(cursor))
  return chunks.join('')
}

function llmsPageText(page, rawUrl, rawBody) {
  const metadata = [`Title: ${page.title}`, `Kind: ${page.kind}`, `Status: ${page.status || 'unspecified'}`]
  if (page.description) metadata.push(`Description: ${page.description}`)
  metadata.push(`Source: ${page.source}`, `Raw: ${rawUrl}`)
  return `# ${page.title}\n\n${metadata.join('\n')}\n\n${rawBody.replace(/^---[\s\S]*?---\s*/, '').trim()}\n`
}

function buildStaticArtifacts(catalog) {
  const pages = catalog.pages
  const pageBySource = new Map(pages.map((page) => [page.source, page]))
  const pageByRoute = new Map(pages.map((page) => [routeKey(page.route), page]))
  const issues = [...catalog.issues]
  const artifacts = new Map()
  const demos = []
  const llmsSections = []
  const llmsFullSections = []
  const sitemapEntries = []
  const pageRecords = []

  for (const page of pages) {
    const sourceFile = path.join(SRC_ROOT, page.source)
    const original = fs.readFileSync(sourceFile, 'utf8')
    const transformed = rewriteMarkdownLinks(
      replaceDemoTags(original, page, catalog.config),
      page,
      pageBySource,
      pageByRoute,
      catalog.config,
      issues,
    )
    const rawPath = rawPathForPage(page)
    artifacts.set(rawPath, transformed)
    const rawUrl = publicUrl(rawPath, catalog.config)
    const canonicalUrl = page.canonicalUrl || publicUrl(page.route, catalog.config)
    const examplePaths = []
    for (const demo of page.demos) {
      const demoFiles = demo.files.map((file) => ({
        path: file.path,
        role: file.role,
        url: demoUrl(file.path, catalog.config),
      }))
      for (const file of demo.files) {
        const publicExamplePath = `demos/${file.path}`
        if (!examplePaths.includes(publicExamplePath)) examplePaths.push(publicExamplePath)
      }
      demos.push({
        id: `${page.id}#demo-${demo.order + 1}`,
        pageId: page.id,
        pageRoute: page.route,
        order: demo.order,
        title: demo.title,
        description: demo.description,
        entry: demo.entry,
        files: demoFiles,
        playground: demo.playground,
      })
    }
    pageRecords.push({
      id: page.id,
      route: page.route,
      title: page.title,
      description: page.description,
      kind: page.kind,
      status: page.status,
      source: page.source,
      canonicalUrl: page.canonicalUrl,
      rawPath: `${catalog.config.vitepressBase}${rawPath}`,
      rawUrl,
      examples: examplePaths,
    })
    llmsSections.push(`- [${page.title}](${canonicalUrl}): ${page.description || `${page.kind} documentation`}`)
    llmsFullSections.push(llmsPageText(page, rawUrl, transformed))
    sitemapEntries.push(`- [${page.title}](${canonicalUrl}) — ${page.kind}`)
  }

  for (const demo of demos) {
    for (const file of demo.files) {
      const sourceFile = path.join(DEMOS_ROOT, file.path)
      artifacts.set(`demos/${file.path}`, fs.readFileSync(sourceFile))
    }
  }

  artifacts.set(
    'llms.txt',
    `# TinyRobot Documentation\n\n> AI-readable documentation index.\n\n${llmsSections.join('\n')}\n`,
  )
  artifacts.set(
    'sitemap.md',
    `# TinyRobot Documentation Sitemap\n\nThis is a human-readable Agent index. See sitemap.xml for crawler sitemap format.\n\n${sitemapEntries.join('\n')}\n`,
  )
  const fullText = `# TinyRobot Documentation (full)\n\n${llmsFullSections.join('\n\n---\n\n')}`
  const fullBytes = Buffer.byteLength(fullText)
  const fullParts = []
  if (fullBytes <= MAX_LLM_FULL_BYTES) {
    artifacts.set('llms-full.txt', fullText)
    fullParts.push({ path: 'llms-full.txt', bytes: fullBytes })
  } else {
    const shards = []
    let shard = []
    let shardBytes = Buffer.byteLength('# TinyRobot Documentation (full)\n\n')
    for (const section of llmsFullSections) {
      const sectionBytes = Buffer.byteLength(`${section}\n\n---\n\n`)
      if (shard.length && shardBytes + sectionBytes > MAX_LLM_FULL_BYTES) {
        shards.push(shard)
        shard = []
        shardBytes = Buffer.byteLength('# TinyRobot Documentation (full)\n\n')
      }
      shard.push(section)
      shardBytes += sectionBytes
    }
    if (shard.length) shards.push(shard)
    const links = shards.map((sections, index) => {
      const shardPath = `llms-full/part-${String(index + 1).padStart(2, '0')}.txt`
      const content = `# TinyRobot Documentation (full, part ${index + 1}/${shards.length})\n\n${sections.join('\n\n---\n\n')}`
      artifacts.set(shardPath, content)
      fullParts.push({ path: shardPath, bytes: Buffer.byteLength(content) })
      return `- [Part ${index + 1}](${publicUrl(shardPath, catalog.config)})`
    })
    artifacts.set(
      'llms-full.txt',
      `# TinyRobot Documentation (full index)\n\nThe full content exceeds ${MAX_LLM_FULL_BYTES} bytes and is split into complete page sections.\n\n${links.join('\n')}\n`,
    )
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${escapeXml(page.canonicalUrl || publicUrl(page.route, catalog.config))}</loc></url>`).join('\n')}\n</urlset>\n`
  artifacts.set('sitemap.xml', sitemapXml)
  artifacts.set(
    'agent/pages.json',
    `${JSON.stringify({ schemaVersion: catalog.schemaVersion, pages: pageRecords }, null, 2)}\n`,
  )
  artifacts.set('agent/demos.json', `${JSON.stringify({ schemaVersion: catalog.schemaVersion, demos }, null, 2)}\n`)

  catalog.issues = issues
  refreshCounts(catalog)
  const outputHashes = Object.fromEntries(
    [...artifacts].map(([file, content]) => [file, crypto.createHash('sha256').update(content).digest('hex')]),
  )
  const docsVersion = process.env.DOCS_VERSION || process.env.GITHUB_REF_NAME || 'working-tree'
  const publicManifest = {
    schemaVersion: catalog.schemaVersion,
    docsVersion,
    contentVersion: docsVersion,
    sourceCommit: process.env.GITHUB_SHA || null,
    generatedAt: new Date().toISOString(),
    inputHash: catalog.inputHash,
    docsSiteUrl: catalog.config.docsSiteUrl,
    vitepressBase: catalog.config.vitepressBase,
    publicBaseUrl: `${catalog.config.docsSiteUrl || 'http://localhost:4173'}${catalog.config.vitepressBase}`,
    counts: { pages: pages.length, demos: demos.length, warnings: catalog.counts.warnings },
    llmsFullMaxBytes: MAX_LLM_FULL_BYTES,
    llmsFullParts: fullParts,
    artifactHashes: outputHashes,
  }
  artifacts.set('agent/manifest.json', `${JSON.stringify(publicManifest, null, 2)}\n`)
  if (catalog.counts.errors > 0)
    throw new Error(`Agent docs static build blocked by ${catalog.counts.errors} validation errors`)
  writeArtifacts(artifacts)
  return { artifacts, publicManifest, pageRecords, demos }
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function writeArtifacts(artifacts) {
  const outputRoot = path.resolve(DOCS_ROOT, 'dist')
  const managedPaths = ['raw', 'demos', 'agent', 'llms.txt', 'llms-full.txt', 'llms-full', 'sitemap.md', 'sitemap.xml']
  for (const relativePath of managedPaths) {
    const target = path.resolve(outputRoot, relativePath)
    if (!isWithin(target, outputRoot)) throw new Error(`Managed output path escaped docs/dist: ${relativePath}`)
    fs.rmSync(target, { force: true, recursive: true })
  }
  for (const [relativePath, content] of artifacts) {
    const target = path.resolve(outputRoot, relativePath)
    if (!isWithin(target, outputRoot)) throw new Error(`Output path escaped docs/dist: ${relativePath}`)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }
}

function writeCatalog(catalog) {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true })
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(catalog, null, 2)}\n`)
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ schemaVersion: catalog.schemaVersion, generatedAt: catalog.generatedAt, inputHash: catalog.inputHash, counts: catalog.counts, issues: catalog.issues }, null, 2)}\n`,
  )
}

function printSummary(catalog) {
  const { counts } = catalog
  console.log(
    `Agent docs catalog: ${counts.publishedPages} published pages, ${counts.draftPages} drafts, ${counts.demos} demos`,
  )
  console.log(`Validation: ${counts.errors} errors, ${counts.warnings} warnings, ${counts.infos} infos`)
  if (counts.errors > 0) {
    for (const item of catalog.issues.filter((entry) => entry.severity === 'error'))
      console.error(`ERROR ${item.source}: ${item.message}`)
  }
}

function printHelp() {
  console.log('Usage: node scripts/agent-docs.mjs <catalog|build|check|report> [--check]')
  console.log('  catalog  扫描页面和 Demo，写入内部 manifest 与校验报告')
  console.log('  build    从最新 catalog 生成 docs/dist 静态 AI 文档产物')
  console.log('  check    只校验输入，不写入生成物；存在 Error 时返回非零')
  console.log('  report   输出质量统计和问题明细，不写入生成物')
}

const catalog = buildCatalog()
if (checkOnly) {
  validateGeneratedCatalog(catalog)
  refreshCounts(catalog)
  printSummary(catalog)
  if (command === 'report') console.log(JSON.stringify({ counts: catalog.counts, issues: catalog.issues }, null, 2))
  if (catalog.counts.errors > 0) process.exitCode = 1
} else if (command === 'catalog' || command === 'build') {
  if (command === 'catalog') {
    writeCatalog(catalog)
    if (catalog.counts.errors > 0) process.exitCode = 1
    printSummary(catalog)
  } else {
    validateGeneratedCatalog(catalog)
    refreshCounts(catalog)
    if (catalog.counts.errors > 0) {
      printSummary(catalog)
      process.exitCode = 1
    } else {
      try {
        const result = buildStaticArtifacts(catalog)
        writeCatalog(catalog)
        printSummary(catalog)
        console.log(`Generated ${result.artifacts.size} static artifacts in docs/dist`)
      } catch (error) {
        console.error(error.message)
        process.exitCode = 1
      }
    }
  }
} else if (command === 'report') {
  printSummary(catalog)
  console.log(JSON.stringify({ counts: catalog.counts, issues: catalog.issues }, null, 2))
} else {
  printHelp()
  process.exitCode = command === 'help' ? 0 : 1
}
