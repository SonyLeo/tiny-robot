import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createIndexedDBSkillStorage as createStorage, IndexedDBSkillStorage } from '../storage'
import type { IndexedDBSkillStorageOptions, SkillImportJob } from '../storage'
import type { SkillDefinition } from '../types'

const databaseName = () => `tiny-robot-skills-test-${crypto.randomUUID()}`
const storages = new Set<Pick<IndexedDBSkillStorage<unknown>, 'databaseName' | 'close'>>()
const createIndexedDBSkillStorage = (options: IndexedDBSkillStorageOptions) => {
  const storage = createStorage(options)
  storages.add(storage)
  return storage
}
const requestResult = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error(`Skill database ${name} still has an open connection`))
  })
const skill: SkillDefinition = { name: 'lifecycle', description: 'Lifecycle skill', instructions: '# Lifecycle' }

afterEach(async () => {
  try {
    await Promise.all([...storages].map((storage) => storage.close()))
    await Promise.all([...new Set([...storages].map((storage) => storage.databaseName))].map(deleteDatabase))
  } finally {
    storages.clear()
    vi.restoreAllMocks()
  }
})

describe('IndexedDBSkillStorage', () => {
  it('adds, gets, lists, checks, and deletes skills', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    const saved = await storage.add({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
      metadata: {
        homepage: 'https://example.com',
      },
    })

    expect(saved).toMatchObject({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
      metadata: {
        homepage: 'https://example.com',
      },
    })
    expect(await storage.has('demo')).toBe(true)
    expect(await storage.list()).toEqual([
      {
        name: 'demo',
        description: 'Demo skill',
        resourceCount: 0,
        metadata: {
          homepage: 'https://example.com',
        },
      },
    ])

    expect(await storage.delete('demo')).toBe(true)
    expect(await storage.delete('demo')).toBe(false)
    expect(await storage.has('demo')).toBe(false)
    expect(await storage.get('demo')).toBeUndefined()
  })

  it('restores resources as lazy readers without eager content', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    await storage.add({
      name: 'docs',
      description: 'Docs skill',
      instructions: '# Docs',
      resources: [
        {
          path: 'references/guide.md',
          kind: 'text',
          resourceId: 'references/guide.md',
          text: '# Guide',
          readText: async () => '# Guide',
        },
        {
          path: 'assets/icon.png',
          kind: 'binary',
          resourceId: 'assets/icon.png',
          binary: new Uint8Array([1, 2, 3]),
          readBinary: async () => new Uint8Array([1, 2, 3]),
          mimeType: 'image/png',
        },
      ],
    })

    const skill = await storage.get('docs')
    const textResource = skill?.resources?.find((resource) => resource.path === 'references/guide.md')
    const binaryResource = skill?.resources?.find((resource) => resource.path === 'assets/icon.png')

    expect(textResource).toMatchObject({
      path: 'references/guide.md',
      kind: 'text',
      resourceId: 'references/guide.md',
    })
    expect(textResource).not.toHaveProperty('text')
    await expect(textResource?.readText?.()).resolves.toBe('# Guide')
    await expect(textResource?.readBinary?.()).resolves.toEqual(new TextEncoder().encode('# Guide'))

    expect(binaryResource).toMatchObject({
      path: 'assets/icon.png',
      kind: 'binary',
      resourceId: 'assets/icon.png',
      mimeType: 'image/png',
    })
    expect(binaryResource).not.toHaveProperty('binary')
    await expect(binaryResource?.readBinary?.()).resolves.toEqual(new Uint8Array([1, 2, 3]))
    await expect(binaryResource?.readText?.()).resolves.toBe(new TextDecoder().decode(new Uint8Array([1, 2, 3])))
  })

  it('overwrites stale resource records when replacing a skill', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    await storage.add({
      name: 'docs',
      description: 'Docs skill',
      instructions: '# Docs',
      resources: [
        {
          path: 'old.md',
          kind: 'text',
          resourceId: 'old.md',
          text: 'old',
        },
      ],
    })

    await storage.add({
      name: 'docs',
      description: 'Updated docs skill',
      instructions: '# Updated',
      resources: [
        {
          path: 'new.md',
          kind: 'text',
          resourceId: 'new.md',
          text: 'new',
        },
      ],
    })

    const skill = await storage.get('docs')

    expect(skill?.description).toBe('Updated docs skill')
    expect(skill?.resources?.map((resource) => resource.path)).toEqual(['new.md'])
    await expect(skill?.resources?.[0]?.readText?.()).resolves.toBe('new')
  })

  it('imports skills from browser sources', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    const entry = new File(
      [['---', 'name: browser-docs', 'description: Browser docs skill', '---', '', '# Browser Docs'].join('\n')],
      'SKILL.md',
      { type: 'text/markdown' },
    )
    const guide = new File(['# Guide'], 'guide.md', { type: 'text/markdown' })

    const result = await storage.import({
      source: 'browser',
      fileList: [entry, guide],
    })
    const importedGuide = result.skill.resources?.find((resource) => resource.path === 'guide.md')

    expect(result.name).toBe('browser-docs')
    expect(importedGuide).not.toHaveProperty('text')
    await expect(importedGuide?.readText?.()).resolves.toBe('# Guide')
    expect(await storage.get('browser-docs')).toMatchObject({
      name: 'browser-docs',
      instructions: '# Browser Docs',
    })
  })

  it('persists resources through lazy readers during add', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })
    const skill: SkillDefinition = {
      name: 'lazy',
      description: 'Lazy skill',
      instructions: '# Lazy',
      resources: [
        {
          path: 'lazy.md',
          kind: 'text',
          resourceId: 'lazy.md',
          readText: async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
            return 'lazy text'
          },
        },
      ],
    }

    await storage.add(skill)

    const storedSkill = await storage.get('lazy')
    const resource = storedSkill?.resources?.[0]

    expect(resource).not.toHaveProperty('text')
    await expect(resource?.readText?.()).resolves.toBe('lazy text')
  })

  it('supports cancel on import task', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })
    let releaseWait!: () => void
    const waitForText = new Promise<string>((resolve) => {
      releaseWait = () => resolve('# Cancelled')
    })
    const entry = new File(
      [['---', 'name: cancelled', 'description: Cancelled skill', '---', '', '# Cancelled'].join('\n')],
      'SKILL.md',
      { type: 'text/markdown' },
    )
    Object.defineProperty(entry, 'text', {
      value: async () => waitForText,
    })

    const task = storage.import({
      source: 'browser',
      fileList: [entry],
    })
    task.cancel()
    releaseWait()

    await expect(task).rejects.toMatchObject({
      name: 'SkillLoadCancelledError',
    })
    await expect(storage.has('cancelled')).resolves.toBe(false)
  })

  it('returns one close promise and rejects new operations without invoking external readers or imports', async () => {
    const importer = vi.fn(() =>
      Object.assign(Promise.resolve({ name: skill.name, skill, warnings: [] }), { cancel: () => undefined }),
    )
    const storage = new IndexedDBSkillStorage<unknown>({ databaseName: databaseName() }, importer)
    storages.add(storage)
    const open = vi.spyOn(indexedDB, 'open')
    const readText = vi.fn(async () => 'external text')
    const first = storage.close()
    expect(storage.close()).toBe(first)
    await first
    await expect(
      storage.add({ ...skill, resources: [{ path: 'lazy.md', resourceId: 'lazy.md', kind: 'text', readText }] }),
    ).rejects.toThrow('closed')
    expect(readText).not.toHaveBeenCalled()
    await expect(storage.get(skill.name)).rejects.toThrow('closed')
    await expect(storage.has(skill.name)).rejects.toThrow('closed')
    await expect(storage.list()).rejects.toThrow('closed')
    await expect(storage.delete(skill.name)).rejects.toThrow('closed')
    const task: SkillImportJob = storage.import({})
    expect(task.cancel).toBeTypeOf('function')
    task.cancel()
    await expect(task).rejects.toThrow('closed')
    expect(importer).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
  })

  it('closes a pending real connection and rejects concurrent operations waiting for it', async () => {
    const name = databaseName()
    const blocker = await requestResult(indexedDB.open(name, 1))
    const deletion = indexedDB.deleteDatabase(name)
    await new Promise<void>((resolve, reject) => {
      deletion.onblocked = () => resolve()
      deletion.onerror = () => reject(deletion.error)
    })
    const deleted = requestResult(deletion)
    const opened: IDBDatabase[] = []
    const closed = vi.fn()
    const nativeOpen = indexedDB.open.bind(indexedDB)
    const open = vi.spyOn(indexedDB, 'open').mockImplementation((dbName, version) => {
      const request = nativeOpen(dbName, version)
      request.addEventListener('success', () => {
        opened.push(request.result)
        const nativeClose = request.result.close.bind(request.result)
        vi.spyOn(request.result, 'close').mockImplementation(() => {
          closed()
          nativeClose()
        })
      })
      return request
    })
    const storage = createIndexedDBSkillStorage({ databaseName: name })
    try {
      const reads = Promise.allSettled([storage.list(), storage.has(skill.name)])
      const first = storage.close()
      expect(storage.close()).toBe(first)
      blocker.close()
      await deleted
      await first
      expect(
        (await reads).every((result) => result.status === 'rejected' && /closed/.test(String(result.reason))),
      ).toBe(true)
      expect(open).toHaveBeenCalledOnce()
      expect(closed).toHaveBeenCalledOnce()
      await deleteDatabase(name)
    } finally {
      blocker.close()
      opened.forEach((db) => db.close())
      await storage.close()
    }
  })

  it('retries an asynchronous open failure on the same instance', async () => {
    const name = databaseName()
    const incompatible = await requestResult(indexedDB.open(name, 2))
    incompatible.close()
    const storage = createIndexedDBSkillStorage({ databaseName: name })
    const open = vi.spyOn(indexedDB, 'open')
    await expect(storage.list()).rejects.toMatchObject({ name: 'VersionError' })
    await deleteDatabase(name)
    await storage.add(skill)
    expect(await storage.has(skill.name)).toBe(true)
    expect(open).toHaveBeenCalledTimes(2)
  })

  it('preserves resources for a new owner and rejects previously acquired lazy readers after close', async () => {
    const name = databaseName()
    const storage = createIndexedDBSkillStorage({ databaseName: name })
    const open = vi.spyOn(indexedDB, 'open')
    const stored = await storage.add({
      ...skill,
      resources: [
        { path: 'guide.md', resourceId: 'guide.md', kind: 'text', text: '# Guide' },
        { path: 'icon.png', resourceId: 'icon.png', kind: 'binary', binary: new Uint8Array([3, 7]) },
      ],
    })
    await storage.close()
    for (const resource of stored.resources!) {
      await expect(resource.readText!()).rejects.toThrow('closed')
      await expect(resource.readBinary!()).rejects.toThrow('closed')
    }
    await expect(storage.add(skill)).rejects.toThrow('closed')
    expect(open).toHaveBeenCalledOnce()
    const reader = createIndexedDBSkillStorage({ databaseName: name })
    const restored = await reader.get(skill.name)
    expect(restored?.instructions).toBe(skill.instructions)
    await expect(restored?.resources?.[0].readText!()).resolves.toBe('# Guide')
    await expect(restored?.resources?.[1].readBinary!()).resolves.toEqual(new Uint8Array([3, 7]))
  })

  it('rejects a lazy write released after close without opening a database', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })
    const open = vi.spyOn(indexedDB, 'open')
    let release!: (text: string) => void
    const text = new Promise<string>((resolve) => {
      release = resolve
    })
    const result = Promise.allSettled([
      storage.add({
        ...skill,
        resources: [{ path: 'lazy.md', resourceId: 'lazy.md', kind: 'text', readText: () => text }],
      }),
    ])
    await storage.close()
    release('late text')
    expect(await result).toEqual([expect.objectContaining({ status: 'rejected', reason: expect.any(Error) })])
    expect(open).not.toHaveBeenCalled()
  })
})
