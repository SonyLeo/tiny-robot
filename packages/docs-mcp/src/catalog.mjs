import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_DOCS_ROOT = path.resolve(PACKAGE_ROOT, '..', '..', 'docs', 'dist')
const MAX_READ_CHARS = 12000
const DEFAULT_READ_CHARS = 8000

function inside(root, candidate) {
  const relative = path.relative(root, candidate)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

function safeRelativePath(value, label) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.startsWith('/')) {
    throw new Error(`Invalid ${label} path`)
  }
  const normalized = path.posix.normalize(value)
  if (normalized !== value || normalized.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error(`Invalid ${label} path`)
  }
  return normalized
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function contentText(text, metadata = {}) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ ...metadata, content: text }, null, 2) }],
  }
}

export function createCatalog(root = process.env.DOCS_MCP_CATALOG_DIR || DEFAULT_DOCS_ROOT) {
  const docsRoot = path.resolve(root)
  const agentRoot = path.join(docsRoot, 'agent')
  const manifest = readJson(path.join(agentRoot, 'manifest.json'))
  const pagesIndex = readJson(path.join(agentRoot, 'pages.json'))
  const demosIndex = readJson(path.join(agentRoot, 'demos.json'))
  const componentsPath = path.join(agentRoot, 'components.json')
  const componentsIndex = fs.existsSync(componentsPath) ? readJson(componentsPath) : null

  if (!manifest.schemaVersion || !manifest.docsVersion || !manifest.artifactHashes) {
    throw new Error('Invalid documentation manifest')
  }
  for (const index of [pagesIndex, demosIndex, componentsIndex].filter(Boolean)) {
    if (index.schemaVersion !== manifest.schemaVersion) throw new Error('Documentation catalog schema mismatch')
  }

  const pages = Array.isArray(pagesIndex.pages) ? pagesIndex.pages : []
  const demos = Array.isArray(demosIndex.demos) ? demosIndex.demos : []
  const components = Array.isArray(componentsIndex?.components) ? componentsIndex.components : []
  const hasPublicBaseUrl = Boolean(manifest.docsSiteUrl && manifest.publicBaseUrl)
  const publicBaseUrl = hasPublicBaseUrl ? new URL(manifest.publicBaseUrl) : null
  const docsMeta = {
    docsVersion: manifest.docsVersion,
    schemaVersion: manifest.schemaVersion,
    publicBaseUrl: hasPublicBaseUrl ? manifest.publicBaseUrl : null,
  }

  // Load and hash-check published Markdown once when the server starts. This
  // gives documentation search coverage for API names and prose without doing
  // filesystem work on every query.
  const pageContent = new Map(
    pages.flatMap((page) => {
      const artifactPath = artifactPathFromPublicPath(page.rawPath, 'raw')
      return manifest.artifactHashes[`raw/${artifactPath}`] ? [[page.id, readArtifact(artifactPath, 'raw')]] : []
    }),
  )

  function artifactPathFromPublicPath(publicPath, namespace) {
    let relativePath = String(publicPath || '').replace(/^\//, '')
    const basePath = publicBaseUrl?.pathname.replace(/^\//, '') || ''
    if (basePath && relativePath.startsWith(basePath)) relativePath = relativePath.slice(basePath.length)
    if (!relativePath.startsWith(`${namespace}/`)) throw new Error(`Invalid ${namespace} path`)
    return safeRelativePath(relativePath.slice(namespace.length + 1), namespace)
  }

  function readArtifact(relativePath, namespace) {
    const safePath = safeRelativePath(relativePath, namespace)
    const artifactPath = `${namespace}/${safePath}`
    const expectedHash = manifest.artifactHashes[artifactPath]
    if (!expectedHash) throw new Error(`Unknown ${namespace} artifact`)
    const namespaceRoot = fs.realpathSync(path.resolve(docsRoot, namespace))
    const absolutePath = fs.realpathSync(path.resolve(namespaceRoot, ...safePath.split('/')))
    if (!inside(namespaceRoot, absolutePath)) throw new Error(`Invalid ${namespace} path`)
    const content = fs.readFileSync(absolutePath)
    const actualHash = crypto.createHash('sha256').update(content).digest('hex')
    if (actualHash !== expectedHash) throw new Error(`${namespace} artifact hash mismatch`)
    return content.toString('utf8')
  }

  function pageFor(value) {
    const page = pages.find((item) => item.id === value || item.route === value)
    if (!page) throw new Error('Unknown documentation page')
    return page
  }

  function pageReference(page) {
    const artifactPath = artifactPathFromPublicPath(page.rawPath, 'raw')
    return {
      route: page.route,
      rawPath: page.rawPath,
      sourceUrl: hasPublicBaseUrl ? new URL(`raw/${artifactPath}`, publicBaseUrl).href : null,
    }
  }

  function exampleReference(demo, file) {
    return {
      id: demo.id,
      pageRoute: demo.pageRoute,
      title: demo.title,
      file: file.path,
      sourceUrl: hasPublicBaseUrl ? new URL(`demos/${safeRelativePath(file.path, 'demos')}`, publicBaseUrl).href : null,
    }
  }

  function componentFor(value) {
    const key = String(value || '').toLocaleLowerCase()
    const component = components.find((item) =>
      [item.name, item.exportName, ...(item.aliases || [])].some((candidate) => candidate.toLocaleLowerCase() === key),
    )
    if (!component) throw new Error('Unknown component')
    return component
  }

  function demoFor(value) {
    const demo = demos.find((item) => item.id === value)
    if (demo) return { demo, file: demo.files.find((item) => item.role === 'entry') || demo.files[0] }
    const file = demos
      .flatMap((item) => item.files.map((entry) => ({ demo: item, file: entry })))
      .find(({ file: entry }) => entry.path === value)
    if (!file) throw new Error('Unknown example')
    return file
  }

  function readPage(page, section, offset, maxChars) {
    const rawPath = artifactPathFromPublicPath(page.rawPath, 'raw')
    const fullText = readArtifact(rawPath, 'raw')
    let selected = fullText
    if (section) {
      const headings = [...fullText.matchAll(/^##\s+(.+)\s*$/gm)]
      const index = headings.findIndex(
        (heading) => heading[1].trim().toLocaleLowerCase() === section.trim().toLocaleLowerCase(),
      )
      if (index < 0) throw new Error('Unknown documentation section')
      const start = headings[index].index
      const end = headings[index + 1]?.index ?? fullText.length
      selected = fullText.slice(start, end).trim()
    }
    const start = Math.min(Math.max(0, offset), selected.length)
    const end = Math.min(selected.length, start + maxChars)
    return {
      text: selected.slice(start, end),
      metadata: {
        ...docsMeta,
        id: page.id,
        title: page.title,
        ...pageReference(page),
        section: section || null,
        truncated: end < selected.length,
        nextOffset: end < selected.length ? end : null,
        totalChars: selected.length,
      },
    }
  }

  function search(items, query, fields, limit = 8) {
    const normalizedQuery = String(query || '')
      .toLocaleLowerCase()
      .trim()
    const latinTerms = [...new Set(normalizedQuery.match(/[a-z0-9_@$.-]+/g) || [])]
    const cjkRuns = normalizedQuery.match(/[\u3400-\u9fff]+/g) || []
    const cjkTerms = [
      ...new Set(
        cjkRuns.flatMap((run) => {
          if (run.length < 2) return [run]
          return Array.from({ length: run.length - 1 }, (_, index) => run.slice(index, index + 2))
        }),
      ),
    ]
    const terms = [...new Set([...latinTerms, ...cjkTerms])]
    if (!terms.length) return []
    return items
      .map((item) => {
        const fieldsForItem = [
          ...fields(item),
          ...(pageContent.has(item.id) ? [{ value: pageContent.get(item.id), weight: 2 }] : []),
        ].filter((field) => field.value)
        const termScores = terms.map((term) => {
          let best = 0
          for (const field of fieldsForItem) {
            const value = String(field.value).toLocaleLowerCase().trim()
            if (value === term) best = Math.max(best, field.weight * 4)
            else if (value.startsWith(term)) best = Math.max(best, field.weight * 3)
            else if (value.includes(term)) best = Math.max(best, field.weight * 2)
          }
          return best
        })
        return {
          item,
          score: termScores.reduce((total, score) => total + score, 0),
          matchedLatinTerms: latinTerms.every((term) => {
            const normalizedTerm = term.toLocaleLowerCase()
            return fieldsForItem.some((field) => String(field.value).toLocaleLowerCase().includes(normalizedTerm))
          }),
          cjkCoverage:
            cjkTerms.length === 0
              ? 1
              : termScores.filter((score, index) => index >= latinTerms.length && score > 0).length / cjkTerms.length,
        }
      })
      .filter(({ score, matchedLatinTerms, cjkCoverage }) => score > 0 && matchedLatinTerms && cjkCoverage >= 0.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(Math.max(limit, 1), 20))
      .map(({ item, score }) => {
        if (!pageContent.has(item.id)) return { item, score }
        const content = pageContent.get(item.id)
        const matchedTerms = terms.filter((term) => content.toLocaleLowerCase().includes(term))
        const lines = content.split(/\r?\n/)
        let section = null
        let bestSection = null
        let bestLine = ''
        let bestLineScore = 0
        for (const line of lines) {
          const heading = line.match(/^#{1,3}\s+(.+)\s*$/)
          if (heading) section = heading[1].trim()
          const normalizedLine = line.toLocaleLowerCase()
          const lineScore = matchedTerms.filter((term) => normalizedLine.includes(term)).length
          if (lineScore > bestLineScore && line.trim()) {
            bestLineScore = lineScore
            bestSection = section
            bestLine = line
              .trim()
              .replace(/^[-*#>|`\s]+/, '')
              .replace(/[`*_]/g, '')
          }
        }
        return {
          item,
          score,
          matchedSection: bestSection,
          snippet: bestLine.length > 240 ? `${bestLine.slice(0, 237)}...` : bestLine || null,
        }
      })
  }

  function resolveResource(uri) {
    const data = {
      'resource://tiny-robot/pages': pages.map((page) => ({
        id: page.id,
        title: page.title,
        description: page.description,
        kind: page.kind,
        status: page.status,
        keywords: page.keywords,
        ...pageReference(page),
      })),
      'resource://tiny-robot/components': components.map((component) => ({
        name: component.name,
        exportName: component.exportName,
        aliases: component.aliases,
        status: component.status,
        page: component.page,
        exampleCount: component.examples?.length || 0,
      })),
      'resource://tiny-robot/examples': demos.map((demo) => ({
        id: demo.id,
        pageRoute: demo.pageRoute,
        title: demo.title,
        description: demo.description,
        entry: demo.entry,
        fileCount: demo.files.length,
      })),
      'resource://tiny-robot/migrations': pages
        .filter((page) => page.kind === 'migration')
        .map((page) => ({
          id: page.id,
          title: page.title,
          description: page.description,
          status: page.status,
          ...pageReference(page),
        })),
    }[uri]
    if (!data) throw new Error('Unknown resource')
    return JSON.stringify({ ...docsMeta, items: data }, null, 2)
  }

  return {
    docsRoot,
    manifest,
    pages,
    demos,
    components,
    docsMeta,
    readArtifact,
    pageFor,
    componentFor,
    pageReference,
    exampleReference,
    demoFor,
    readPage,
    search,
    resolveResource,
    MAX_READ_CHARS,
    DEFAULT_READ_CHARS,
  }
}

export { contentText }
