import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { createCatalog } from '../src/catalog.mjs'

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-docs-mcp-'))
const serverPath = path.resolve('src/server.mjs')
let client
let transport
let demoFile

function writeJson(relative, value) {
  const target = path.join(fixtureRoot, relative)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`)
}

function writeArtifact(relative, content) {
  const target = path.join(fixtureRoot, relative)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, content)
  return crypto.createHash('sha256').update(content).digest('hex')
}

before(async () => {
  const pageContent = '# Bubble\n\n## Usage\n\nBubble usage content.\n\n## API\n\nBubble API content.\n'
  const chatRuntimeContent =
    '# Data and logic\n\n## 复用已有会话\n\n将已有 Kit conversation 接入 TrChat。\n\n```ts\nuseChatRuntimeFromConversation({ conversation })\n```\n'
  const demoContent = '<template><div>Bubble</div></template>\n'
  demoFile = path.join(fixtureRoot, 'demos/bubble/basic.vue')
  const hashes = {
    'raw/components/bubble.md': writeArtifact('raw/components/bubble.md', pageContent),
    'raw/suites/chat-runtime.md': writeArtifact('raw/suites/chat-runtime.md', chatRuntimeContent),
    'raw/migration/v1.md': writeArtifact('raw/migration/v1.md', '# Migration\n\n## Upgrade\n\nUpgrade notes.\n'),
    'demos/bubble/basic.vue': writeArtifact('demos/bubble/basic.vue', demoContent),
  }
  writeJson('agent/manifest.json', {
    schemaVersion: '0.1.0',
    docsVersion: 'test-docs',
    docsSiteUrl: null,
    publicBaseUrl: 'http://localhost:4173/',
    artifactHashes: hashes,
  })
  writeJson('agent/pages.json', {
    schemaVersion: '0.1.0',
    pages: [
      {
        id: 'components/bubble',
        route: '/components/bubble',
        title: 'Bubble',
        description: 'Chat bubble',
        kind: 'component',
        rawPath: '/raw/components/bubble.md',
        rawUrl: 'https://docs.test/raw/components/bubble.md',
      },
      {
        id: 'suites/chat-runtime',
        route: '/suites/chat-runtime',
        title: 'Data and logic',
        description: 'Configure TrChat runtime behavior',
        keywords: ['TrChat', 'runtime'],
        kind: 'suite',
        rawPath: '/raw/suites/chat-runtime.md',
        rawUrl: 'https://docs.test/raw/suites/chat-runtime.md',
      },
      {
        id: 'migration/v1',
        route: '/migration/v1',
        title: 'Migration v1',
        description: 'Upgrade guide',
        kind: 'migration',
        rawPath: '/raw/migration/v1.md',
        rawUrl: 'https://docs.test/raw/migration/v1.md',
      },
      {
        id: 'components/unrelated',
        route: '/components/unrelated',
        title: 'Unrelated',
        description: 'A separate component page',
        keywords: ['other'],
        kind: 'component',
        rawPath: '/raw/components/unrelated.md',
        rawUrl: 'https://docs.test/raw/components/unrelated.md',
      },
    ],
  })
  writeJson('agent/components.json', {
    schemaVersion: '0.1.0',
    components: [
      {
        name: 'TrBubble',
        exportName: 'TrBubble',
        aliases: ['Bubble'],
        status: 'stable',
        page: '/components/bubble',
        examples: ['demos/bubble/basic.vue'],
      },
      {
        name: 'TrUnrelated',
        exportName: 'TrUnrelated',
        aliases: ['Unrelated'],
        status: 'stable',
        page: '/components/unrelated',
        examples: ['demos/bubble/basic.vue'],
      },
    ],
  })
  writeJson('agent/demos.json', {
    schemaVersion: '0.1.0',
    demos: [
      {
        id: 'components/bubble#demo-1',
        title: 'Basic Bubble',
        entry: 'bubble/basic.vue',
        files: [{ path: 'bubble/basic.vue', role: 'entry', url: 'https://docs.test/demos/bubble/basic.vue' }],
      },
    ],
  })

  transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: path.resolve('.'),
    env: { ...process.env, DOCS_MCP_CATALOG_DIR: fixtureRoot },
  })
  client = new Client({ name: 'tiny-robot-docs-mcp-test', version: '0.1.0' })
  await client.connect(transport)
})

after(async () => {
  await client?.close()
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
})

test('stdio MCP exposes discovery resources and all planned tools', async () => {
  const { tools } = await client.listTools()
  assert.deepEqual(tools.map(({ name }) => name).sort(), [
    'get-component',
    'get-component-metadata',
    'get-documentation-page',
    'get-example',
    'get-migration-guide',
    'search-components',
    'search-documentation',
  ])
  const resources = await client.listResources()
  assert.equal(resources.resources.length, 4)
  for (const uri of [
    'resource://tiny-robot/pages',
    'resource://tiny-robot/components',
    'resource://tiny-robot/examples',
    'resource://tiny-robot/migrations',
  ]) {
    const resource = await client.readResource({ uri })
    assert.match(resource.contents[0].text, /docsVersion/)
  }
})

test('search, component metadata, section reads, examples, and migration guides work', async () => {
  const pageSearch = await client.callTool({ name: 'search-documentation', arguments: { query: 'Bubble' } })
  assert.match(pageSearch.content[0].text, /components\/bubble/)

  const search = await client.callTool({ name: 'search-components', arguments: { query: 'Bubble' } })
  const searchResults = JSON.parse(search.content[0].text).results
  assert.equal(searchResults[0].name, 'TrBubble')
  assert.equal(
    searchResults.some((item) => item.name === 'TrUnrelated'),
    false,
  )
  assert.equal(searchResults[0].sourceUrl, null)
  assert.equal(searchResults[0].rawPath, '/raw/components/bubble.md')

  const unrelatedSearch = await client.callTool({ name: 'search-components', arguments: { query: 'calendar' } })
  assert.deepEqual(JSON.parse(unrelatedSearch.content[0].text).results, [])

  const docsSearch = await client.callTool({ name: 'search-documentation', arguments: { query: 'Bubble' } })
  const docsResults = JSON.parse(docsSearch.content[0].text).results
  assert.equal(docsResults[0].id, 'components/bubble')
  assert.equal(docsResults[0].sourceUrl, null)
  assert.equal(docsResults[0].rawPath, '/raw/components/bubble.md')

  const apiSearch = await client.callTool({
    name: 'search-documentation',
    arguments: { query: 'useChatRuntimeFromConversation' },
  })
  const apiResults = JSON.parse(apiSearch.content[0].text).results
  assert.equal(apiResults[0].id, 'suites/chat-runtime')
  assert.equal(apiResults[0].matchedSection, '复用已有会话')
  assert.match(apiResults[0].snippet, /useChatRuntimeFromConversation/)

  const naturalLanguageSearch = await client.callTool({
    name: 'search-documentation',
    arguments: { query: 'TrChat 复用已有会话', limit: 5 },
  })
  const naturalLanguageResults = JSON.parse(naturalLanguageSearch.content[0].text).results
  assert.equal(naturalLanguageResults[0].id, 'suites/chat-runtime')

  const metadata = await client.callTool({ name: 'get-component-metadata', arguments: { name: 'Bubble' } })
  assert.match(metadata.content[0].text, /docsVersion/)

  const page = await client.callTool({
    name: 'get-documentation-page',
    arguments: { page: 'components/bubble', section: 'API' },
  })
  assert.match(page.content[0].text, /Bubble API content/)
  assert.doesNotMatch(page.content[0].text, /Bubble usage content/)

  const component = await client.callTool({ name: 'get-component', arguments: { name: 'TrBubble' } })
  assert.match(component.content[0].text, /Bubble usage content/)

  const example = await client.callTool({ name: 'get-example', arguments: { example: 'components/bubble#demo-1' } })
  assert.match(example.content[0].text, /<template>/)
  const exampleResult = JSON.parse(example.content[0].text)
  assert.equal(exampleResult.sourceUrl, null)
  assert.equal(exampleResult.file, 'bubble/basic.vue')

  const migration = await client.callTool({ name: 'get-migration-guide', arguments: { page: '/migration/v1' } })
  assert.match(migration.content[0].text, /Upgrade notes/)
})

test('configured public base URLs produce deployable source links, local builds do not', () => {
  const manifestPath = path.join(fixtureRoot, 'agent/manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(createCatalog(fixtureRoot).docsMeta.publicBaseUrl, null)

  manifest.docsSiteUrl = 'https://sonyleo.github.io'
  manifest.publicBaseUrl = 'https://sonyleo.github.io/tiny-robot/beta/'
  writeJson('agent/manifest.json', manifest)
  const pagesIndex = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'agent/pages.json'), 'utf8'))
  pagesIndex.pages[0].rawPath = '/tiny-robot/beta/raw/components/bubble.md'
  writeJson('agent/pages.json', pagesIndex)
  const catalog = createCatalog(fixtureRoot)
  const page = catalog.pageFor('/components/bubble')
  const reference = catalog.pageReference(page)
  assert.equal(reference.sourceUrl, 'https://sonyleo.github.io/tiny-robot/beta/raw/components/bubble.md')
  assert.equal(reference.rawPath, '/tiny-robot/beta/raw/components/bubble.md')
  assert.match(catalog.readPage(page, 'API', 0, 200).text, /Bubble API content/)

  const demo = catalog.demos[0]
  assert.equal(
    catalog.exampleReference(demo, demo.files[0]).sourceUrl,
    'https://sonyleo.github.io/tiny-robot/beta/demos/bubble/basic.vue',
  )
})

test('directory resources contain compact discoverable entries within the payload budget', async () => {
  const examples = await client.readResource({ uri: 'resource://tiny-robot/examples' })
  const parsed = JSON.parse(examples.contents[0].text)
  assert.equal(parsed.items[0].id, 'components/bubble#demo-1')
  assert.equal(typeof parsed.items[0].entry, 'string')
  assert.equal('files' in parsed.items[0], false)
  assert.ok(Buffer.byteLength(examples.contents[0].text) < 64 * 1024)
})

test('older documentation catalogs without a component index remain searchable', () => {
  const componentsPath = path.join(fixtureRoot, 'agent/components.json')
  const componentsIndex = fs.readFileSync(componentsPath)
  fs.rmSync(componentsPath)
  try {
    const catalog = createCatalog(fixtureRoot)
    assert.equal(catalog.components.length, 0)
    assert.equal(catalog.pages.length, 4)
  } finally {
    fs.writeFileSync(componentsPath, componentsIndex)
  }
})

test('unknown IDs, unregistered paths, and hash mismatches are rejected', async () => {
  const unknown = await client.callTool({ name: 'get-documentation-page', arguments: { page: '../secret' } })
  assert.equal(unknown.isError, true)

  const unregisteredFile = await client.callTool({ name: 'get-example', arguments: { example: '../secret' } })
  assert.equal(unregisteredFile.isError, true)

  await client.close()
  const demosIndexPath = path.join(fixtureRoot, 'agent/demos.json')
  const demosIndex = JSON.parse(fs.readFileSync(demosIndexPath, 'utf8'))
  demosIndex.demos[0].files[0].path = '../secret.vue'
  writeJson('agent/demos.json', demosIndex)
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: path.resolve('.'),
    env: { ...process.env, DOCS_MCP_CATALOG_DIR: fixtureRoot },
  })
  client = new Client({ name: 'tiny-robot-docs-mcp-test', version: '0.1.0' })
  await client.connect(transport)
  const traversal = await client.callTool({ name: 'get-example', arguments: { example: 'components/bubble#demo-1' } })
  assert.equal(traversal.isError, true)
  assert.match(traversal.content[0].text, /Invalid demos path/)

  await client.close()
  demosIndex.demos[0].files[0].path = 'bubble/basic.vue'
  writeJson('agent/demos.json', demosIndex)
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: path.resolve('.'),
    env: { ...process.env, DOCS_MCP_CATALOG_DIR: fixtureRoot },
  })
  client = new Client({ name: 'tiny-robot-docs-mcp-test', version: '0.1.0' })
  await client.connect(transport)

  fs.appendFileSync(demoFile, '<!-- changed -->')
  const changed = await client.callTool({ name: 'get-example', arguments: { example: 'bubble/basic.vue' } })
  assert.equal(changed.isError, true)
  assert.match(changed.content[0].text, /hash mismatch/)
})

test('oversized page content returns an offset for continuation', async () => {
  const content = '# Long\n\n## Content\n\n' + 'x'.repeat(14000)
  const hash = crypto.createHash('sha256').update(content).digest('hex')
  writeArtifact('raw/components/bubble.md', content)
  const manifest = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'agent/manifest.json'), 'utf8'))
  manifest.artifactHashes['raw/components/bubble.md'] = hash
  writeJson('agent/manifest.json', manifest)
  await client.close()
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: path.resolve('.'),
    env: { ...process.env, DOCS_MCP_CATALOG_DIR: fixtureRoot },
  })
  client = new Client({ name: 'tiny-robot-docs-mcp-test', version: '0.1.0' })
  await client.connect(transport)

  const first = await client.callTool({
    name: 'get-documentation-page',
    arguments: { page: 'components/bubble', section: 'Content', maxChars: 5000 },
  })
  const firstData = JSON.parse(first.content[0].text)
  assert.equal(firstData.truncated, true)
  assert.equal(firstData.nextOffset, 5000)

  const second = await client.callTool({
    name: 'get-documentation-page',
    arguments: { page: 'components/bubble', section: 'Content', offset: firstData.nextOffset, maxChars: 5000 },
  })
  const secondData = JSON.parse(second.content[0].text)
  assert.equal(secondData.content.length, 5000)
})
