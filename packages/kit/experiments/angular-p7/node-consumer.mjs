import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createNativeMessageAdapter, createMessageEngine } from '@opentiny/tiny-robot-kit/core'
import { createFsSkillStorage, loadSkill, loadSkillWithDetails } from '@opentiny/tiny-robot-kit/node'

const fixedRepo = process.env.P7_NODE_GITHUB_REPO ?? 'openclaw/openclaw'
const fixedRef = process.env.P7_NODE_GITHUB_REF ?? '58672075219d09495de6489ad0821d276ac84f13'
const fixedPath = process.env.P7_NODE_GITHUB_PATH ?? 'skills/weather'

const response = (status, body, statusText = status >= 200 && status < 300 ? 'OK' : 'Server Error') => ({
  ok: status >= 200 && status < 300,
  status,
  statusText,
  json: async () => body,
  arrayBuffer: async () => new TextEncoder().encode(typeof body === 'string' ? body : JSON.stringify(body)).buffer,
})

const originalFetch = globalThis.fetch
const skillMarkdown = '---\nname: controlled-node\ndescription: Controlled node skill\n---\n\n# Controlled\n'

async function controlledGithub() {
  let calls = 0
  globalThis.fetch = async (input, init) => {
    calls += 1
    const url = String(input)
    if (url.includes('/contents/skills/controlled?')) {
      return response(200, [{ name: 'SKILL.md', path: 'skills/controlled/SKILL.md', type: 'file', size: skillMarkdown.length, download_url: 'https://raw.test/controlled.md' }])
    }
    return response(200, skillMarkdown)
  }
  try {
    const loaded = await loadSkill({ source: 'github', repo: 'acme/node', ref: 'fixture', path: 'skills/controlled' })
    assert.equal(loaded.name, 'controlled-node')
    assert.ok(calls >= 2)
    return { name: loaded.name, calls }
  } finally {
    globalThis.fetch = originalFetch
  }
}

async function controlledFailure() {
  globalThis.fetch = async () => response(404, { message: 'missing' }, 'Not Found')
  try {
    await assert.rejects(
      loadSkill({ source: 'github', repo: 'acme/node', ref: 'fixture', path: 'skills/missing' }),
      /Failed to fetch https:\/\/api\.github\.com\/repos\/acme\/node\/contents\/skills\/missing\?ref=fixture: 404 Not Found/,
    )
    return '404'
  } finally {
    globalThis.fetch = originalFetch
  }
}

async function controlledCancel() {
  let seenSignal
  globalThis.fetch = (_input, init) => {
    seenSignal = init?.signal
    return new Promise((resolve, reject) => {
      if (init?.signal?.aborted) {
        reject(init.signal.reason)
        return
      }
      init?.signal?.addEventListener('abort', () => reject(init.signal.reason), { once: true })
      void resolve
    })
  }
  try {
    const job = loadSkill({ source: 'github', repo: 'acme/node', ref: 'fixture', path: 'skills/cancel' })
    job.cancel()
    await assert.rejects(job, /Skill load was cancelled|AbortError/)
    assert.equal(seenSignal?.aborted, true)
    return 'cancelled'
  } finally {
    globalThis.fetch = originalFetch
  }
}

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'tiny-robot-node-consumer-'))
  try {
    const engine = createMessageEngine(createNativeMessageAdapter(), {
      responseProvider: async () => ({
        id: 'node-core', object: 'chat.completion', created: 0, model: 'fixture',
        choices: [{ index: 0, message: { role: 'assistant', content: 'core ok' }, finish_reason: 'stop' }],
      }),
    })
    await engine.sendMessage('hello')
    assert.equal(engine.getState().messages.at(-1)?.content, 'core ok')

    const storage = createFsSkillStorage({ root })
    const skill = await storage.add({
      name: 'crud-skill', description: 'CRUD skill', instructions: '# CRUD',
      resources: [{ path: 'notes.txt', kind: 'text', resourceId: 'notes.txt', text: 'stored' }],
    })
    assert.equal(skill.name, 'crud-skill')
    assert.equal(await storage.has('crud-skill'), true)
    assert.equal((await storage.get('crud-skill'))?.resources?.[0]?.readText ? await (await storage.get('crud-skill')).resources[0].readText() : '', 'stored')
    assert.deepEqual((await storage.list()).map(({ name }) => name), ['crud-skill'])
    assert.equal(await storage.delete('crud-skill'), true)
    assert.equal(await storage.has('crud-skill'), false)

    const controlled = await controlledGithub()
    const failure = await controlledFailure()
    const cancelled = await controlledCancel()
    const live = await loadSkillWithDetails({ source: 'github', repo: fixedRepo, ref: fixedRef, path: fixedPath })
    assert.equal(live.skill.name, 'weather')
    assert.ok(live.skill.instructions.includes('# Weather Skill'))

    console.log(JSON.stringify({
      node: process.version, core: 'ok', fsStorage: 'add/get/list/delete ok', controlled, failure, cancelled,
      live: { repo: fixedRepo, ref: fixedRef, path: fixedPath, name: live.skill.name, warnings: live.warnings },
    }, null, 2))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

await main()
