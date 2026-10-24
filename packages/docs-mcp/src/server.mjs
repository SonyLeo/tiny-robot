import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { contentText, createCatalog } from './catalog.mjs'

const catalog = createCatalog()
const server = new McpServer({ name: 'tiny-robot-docs', version: '0.1.0' })
const readLimit = z.number().int().min(0).max(catalog.MAX_READ_CHARS).default(catalog.DEFAULT_READ_CHARS)
const offsetSchema = z.number().int().min(0).default(0)

function result(value) {
  const text = JSON.stringify(value, null, 2)
  return { content: [{ type: 'text', text }], structuredContent: value }
}

function fail(error) {
  return { content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }], isError: true }
}

function registerTool(name, description, schema, handler) {
  server.registerTool(name, { description, inputSchema: schema }, async (args) => {
    try {
      return await handler(args)
    } catch (error) {
      return fail(error)
    }
  })
}

function registerIndexResource(name, uri, description) {
  server.registerResource(name, uri, { description, mimeType: 'application/json' }, async (resourceUri) => ({
    contents: [
      { uri: resourceUri.href, mimeType: 'application/json', text: catalog.resolveResource(resourceUri.href) },
    ],
  }))
}

registerIndexResource('documentation-pages', 'resource://tiny-robot/pages', 'Published documentation page index')
registerIndexResource('components', 'resource://tiny-robot/components', 'Documented public component catalog')
registerIndexResource('examples', 'resource://tiny-robot/examples', 'Published examples catalog')
registerIndexResource('migration-guides', 'resource://tiny-robot/migrations', 'Migration documentation index')

registerTool(
  'search-documentation',
  'Search published TinyRobot documentation by title, description, route, and keywords.',
  { query: z.string().min(1).max(200), limit: z.number().int().min(1).max(20).default(8) },
  ({ query, limit }) =>
    result({
      ...catalog.docsMeta,
      results: catalog
        .search(
          catalog.pages,
          query,
          (page) => [
            { value: page.title, weight: 12 },
            ...(page.keywords || []).map((value) => ({ value, weight: 9 })),
            { value: page.description, weight: 5 },
            { value: page.route, weight: 1 },
          ],
          limit,
        )
        .map(({ item: page, score, matchedSection, snippet }) => ({
          id: page.id,
          title: page.title,
          description: page.description,
          ...catalog.pageReference(page),
          matchedSection,
          snippet,
          score,
        })),
    }),
)

registerTool(
  'search-components',
  'Search documented TinyRobot Vue components by export name, alias, status, route, and examples.',
  { query: z.string().min(1).max(200), limit: z.number().int().min(1).max(20).default(8) },
  ({ query, limit }) =>
    result({
      ...catalog.docsMeta,
      results: catalog
        .search(
          catalog.components,
          query,
          (item) => {
            const page = catalog.pageFor(item.page)
            return [
              { value: item.name, weight: 20 },
              { value: item.exportName, weight: 20 },
              ...(item.aliases || []).map((value) => ({ value, weight: 20 })),
              { value: page.title, weight: 12 },
              ...(page.keywords || []).map((value) => ({ value, weight: 9 })),
              { value: page.description, weight: 5 },
              { value: item.page, weight: 1 },
            ]
          },
          limit,
        )
        .map(({ item, score }) => ({
          name: item.name,
          exportName: item.exportName,
          aliases: item.aliases,
          status: item.status,
          page: item.page,
          pageTitle: catalog.pageFor(item.page).title,
          rawPath: catalog.pageReference(catalog.pageFor(item.page)).rawPath,
          sourceUrl: catalog.pageReference(catalog.pageFor(item.page)).sourceUrl,
          exampleCount: item.examples?.length || 0,
          score,
        })),
    }),
)

registerTool(
  'get-component-metadata',
  'Get the documented API catalog record for one public component.',
  { name: z.string().min(1).max(100) },
  ({ name }) => {
    const component = catalog.componentFor(name)
    const page = catalog.pageFor(component.page)
    return result({ ...catalog.docsMeta, component, ...catalog.pageReference(page) })
  },
)

registerTool(
  'get-component',
  'Read a component documentation page, optionally narrowed to an exact H2 section.',
  {
    name: z.string().min(1).max(100),
    section: z.string().max(200).optional(),
    offset: offsetSchema,
    maxChars: readLimit,
  },
  ({ name, section, offset, maxChars }) => {
    const component = catalog.componentFor(name)
    const page = catalog.pageFor(component.page)
    const doc = catalog.readPage(page, section, offset, maxChars)
    return contentText(doc.text, { ...doc.metadata, component })
  },
)

registerTool(
  'get-documentation-page',
  'Read a published documentation page by catalog ID or route. Exact H2 sections and offsets are supported.',
  {
    page: z.string().min(1).max(200),
    section: z.string().max(200).optional(),
    offset: offsetSchema,
    maxChars: readLimit,
  },
  ({ page: pageId, section, offset, maxChars }) => {
    const doc = catalog.readPage(catalog.pageFor(pageId), section, offset, maxChars)
    return contentText(doc.text, doc.metadata)
  },
)

registerTool(
  'get-example',
  'Read a published demo entry or explicitly cataloged demo file by demo ID or file path.',
  { example: z.string().min(1).max(300), offset: offsetSchema, maxChars: readLimit },
  ({ example, offset, maxChars }) => {
    const { demo, file } = catalog.demoFor(example)
    const text = catalog.readArtifact(file.path, 'demos')
    const start = Math.min(offset, text.length)
    const end = Math.min(text.length, start + maxChars)
    return contentText(text.slice(start, end), {
      ...catalog.docsMeta,
      id: demo.id,
      ...catalog.exampleReference(demo, file),
      truncated: end < text.length,
      nextOffset: end < text.length ? end : null,
      totalChars: text.length,
    })
  },
)

registerTool(
  'get-migration-guide',
  'Read a published migration guide by catalog ID or route.',
  {
    page: z.string().min(1).max(200),
    section: z.string().max(200).optional(),
    offset: offsetSchema,
    maxChars: readLimit,
  },
  ({ page: pageId, section, offset, maxChars }) => {
    const page = catalog.pageFor(pageId)
    if (page.kind !== 'migration') throw new Error('Page is not a migration guide')
    const doc = catalog.readPage(page, section, offset, maxChars)
    return contentText(doc.text, doc.metadata)
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
