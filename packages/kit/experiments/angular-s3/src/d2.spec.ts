import 'fake-indexeddb/auto';
import { Component, InjectionToken, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAngularMessage, injectAngularMessage } from '@opentiny/tiny-robot-kit/angular';
import {
  createIndexedDBSkillStorage, createMemorySkillStorage, getSkillRequestContext, loadSkill,
  loadSkillWithDetails, skillPlugin, toolPlugin, TOOL_RESUME_COMMAND,
  type CreateMessageEngineOptions, type MessageRequestBody, type ResponseProvider,
  type SkillDefinition, type SkillSelection,
} from '@opentiny/tiny-robot-kit/core';
import type { ChatCompletion } from 'openai/resources';

const weather: SkillDefinition = {
  name: 'weather', description: 'Weather answers', instructions: 'Use weather data.',
};
const docs: SkillDefinition = {
  name: 'docs', description: 'Documentation answers', instructions: 'Use documentation.',
  resources: [{ path: 'guide.md', kind: 'text', resourceId: 'guide.md', text: '# Current guide' }],
};
const OPTIONS = new InjectionToken<CreateMessageEngineOptions>('D2 message options');

@Component({ standalone: true, template: '' })
class SkillHost {
  readonly message = injectAngularMessage(inject(OPTIONS));
}

const mount = (options: CreateMessageEngineOptions) => {
  TestBed.configureTestingModule({ providers: [
    provideZonelessChangeDetection(), { provide: OPTIONS, useValue: options },
  ] });
  return TestBed.createComponent(SkillHost);
};

const completion = (content: string, toolName?: string, args = '{}'): ChatCompletion => ({
  id: 'd2', object: 'chat.completion', created: 0, model: 'd2',
  choices: [{ index: 0, message: toolName
    ? { role: 'assistant', content: '', tool_calls: [{ id: 'd2-call', type: 'function', function: { name: toolName, arguments: args } }] }
    : { role: 'assistant', content }, finish_reason: toolName ? 'tool_calls' : 'stop' }],
} as ChatCompletion);

const injectInstructions = (context: { requestBody: MessageRequestBody; customContext: Record<string, unknown> }) => {
  const instructions = getSkillRequestContext(context as Parameters<typeof getSkillRequestContext>[0])?.instructions ?? [];
  if (instructions.length) context.requestBody.messages.unshift({ role: 'system', content: instructions.join('\n\n') });
};

afterEach(() => { vi.unstubAllGlobals(); });

describe('D2 packed core Skill in an Angular host', () => {
  it('reads a Signal for each request, including manual, none and auto selection', async () => {
    const selected = signal<SkillSelection>({ mode: 'manual', skillNames: ['weather'] });
    const requestBodies: MessageRequestBody[] = [];
    const phases: string[] = [];
    const provider: ResponseProvider = async (body) => {
      requestBodies.push(structuredClone(body));
      if (body.tools?.some((tool) => tool.type === 'function' && tool.function.name === 'select_skills')) {
        return completion('', 'select_skills', JSON.stringify({ skillNames: ['docs'] }));
      }
      return completion('answered');
    };
    const fixture = mount({ responseProvider: provider, plugins: [
      skillPlugin({
        selection: () => selected(),
        getSkillByName: (name) => ({ weather, docs })[name as 'weather' | 'docs'],
        getSkillCandidates: () => [weather, docs],
        onInstructionsResolved: (skillContext) => { phases.push(`${skillContext.selection.mode}:${skillContext.selection.phase}`); },
        onBeforeRequest: injectInstructions,
      }),
      toolPlugin({ getTools: () => [], callTool: () => { throw new Error('unexpected fallback'); } }),
    ] });
    const session = fixture.componentInstance.message;
    await session.sendMessage('first');
    expect(String(requestBodies[0].messages[0].content)).toContain('Use weather data.');
    selected.set({ mode: 'none' });
    await session.sendMessage('second');
    expect(requestBodies[1].messages[0].role).toBe('user');
    selected.set({ mode: 'auto', preferredSkillNames: ['docs'], maxSelectedSkills: 1 });
    await session.sendMessage('third');
    expect(requestBodies[2].tools?.some((tool) => tool.type === 'function' && tool.function.name === 'select_skills')).toBe(true);
    expect(String(requestBodies[2].messages[0].content)).toContain('docs: Documentation answers');
    expect(requestBodies[3].tools?.some((tool) => tool.type === 'function' && tool.function.name === 'read_skill_file')).toBe(true);
    expect(String(requestBodies[3].messages[0].content)).toContain('Use documentation.');
    expect(phases).toEqual(['manual:ready', 'auto:selecting', 'auto:ready']);
    fixture.destroy();
    await session.dispose();
  });

  it('executes a resource tool after Angular approval and restores it after recreation', async () => {
    const storage = createMemorySkillStorage();
    await storage.add(docs);
    const saved = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => { saved.set(key, value); },
      removeItem: (key: string) => { saved.delete(key); },
    });
    let shouldPause = true;
    const provider: ResponseProvider = async (body) => {
      const toolResult = body.messages.find((message) => message.role === 'tool');
      if (toolResult) {
        expect(String(toolResult.content)).toContain('# Current guide');
        return completion('resource read');
      }
      return completion('', 'read_skill_file', JSON.stringify({ skillName: 'docs', path: 'guide.md' }));
    };
    const options = (initialMessages: CreateMessageEngineOptions['initialMessages'] = []): CreateMessageEngineOptions => ({
      initialMessages, responseProvider: provider, plugins: [
        skillPlugin({ selection: { mode: 'manual', skillNames: ['docs'] }, getSkillByName: (name) => storage.get(name) }),
        toolPlugin({ getTools: () => [], callTool: () => { throw new Error('unexpected fallback'); }, shouldPauseToolCall: () => shouldPause }),
      ],
    });
    const first = mount(options());
    await first.componentInstance.message.sendMessage('read');
    expect(first.componentInstance.message.isPaused(), JSON.stringify(first.componentInstance.message.state())).toBe(true);
    expect(saved.has('__tiny-robot-turn')).toBe(true);
    const messages = first.componentInstance.message.messages();
    shouldPause = false;
    const restored = createAngularMessage(options(messages));
    expect(restored.isPaused()).toBe(true);
    await expect(restored.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'd2-call' }))
      .resolves.toEqual({ status: 'resumed', toolCallId: 'd2-call' });
    expect(restored.messages().at(-1)?.content).toBe('resource read');
    expect(saved.has('__tiny-robot-turn')).toBe(false);
    first.destroy();
    await first.componentInstance.message.dispose();
    await restored.dispose();
  });

  it('loads browser files, imports into memory and IndexedDB, and reads persisted resources', async () => {
    const entry = new File(['---\nname: browser-docs\ndescription: Browser docs\n---\n# Browser instructions'], 'SKILL.md');
    const guide = new File(['# Browser guide'], 'guide.md');
    entry.text = async () => '---\nname: browser-docs\ndescription: Browser docs\n---\n# Browser instructions';
    guide.text = async () => '# Browser guide';
    const files = [entry, guide];
    const loaded = await loadSkillWithDetails({ source: 'browser', fileList: files });
    expect(loaded.warnings).toEqual([]);
    expect(loaded.skill.name).toBe('browser-docs');
    expect(await loaded.skill.resources?.[0].readText?.()).toBe('# Browser guide');
    const memory = createMemorySkillStorage();
    const imported = await memory.import({ source: 'browser', fileList: files });
    expect(imported.name).toBe('browser-docs');
    expect((await memory.list())[0].resourceCount).toBe(1);
    const indexed = createIndexedDBSkillStorage({ databaseName: `d2-${crypto.randomUUID()}` });
    await indexed.add(imported.skill);
    const restored = await indexed.get('browser-docs');
    expect(await restored?.resources?.[0].readText?.()).toBe('# Browser guide');
    expect(await indexed.delete('browser-docs')).toBe(true);
  });

  it('loads a GitHub skill via fetch and cancels a pending browser load/import', async () => {
    const skillText = '---\nname: remote\ndescription: Remote skill\n---\n# Remote instructions';
    vi.stubGlobal('fetch', vi.fn(async (url: URL | string) => {
      const target = String(url);
      if (target.endsWith('/repos/acme/skills')) return Response.json({ default_branch: 'main' });
      if (target.includes('/contents/demo?')) return Response.json([
        { name: 'SKILL.md', path: 'demo/SKILL.md', type: 'file', download_url: 'https://raw.example/SKILL.md' },
        { name: 'guide.md', path: 'demo/guide.md', type: 'file', download_url: 'https://raw.example/guide.md' },
      ]);
      if (target.endsWith('/SKILL.md')) return new Response(skillText);
      if (target.endsWith('/guide.md')) return new Response('# Remote guide');
      throw new Error(`Unexpected URL: ${target}`);
    }));
    const remote = await loadSkill({ source: 'github', repo: 'acme/skills', path: 'demo' });
    expect(remote.name).toBe('remote');
    expect(await remote.resources?.[0].readText?.()).toBe('# Remote guide');
    let release!: () => void;
    const pending = new Promise<string>((resolve) => { release = () => resolve(skillText); });
    const entry = new File([skillText], 'SKILL.md');
    entry.text = () => pending;
    const load = loadSkill({ source: 'browser', fileList: [entry] });
    load.cancel();
    release();
    await expect(load).rejects.toMatchObject({ name: 'SkillLoadCancelledError' });
    const memory = createMemorySkillStorage();
    const importing = memory.import({ source: 'browser', fileList: [entry] });
    importing.cancel();
    await expect(importing).rejects.toMatchObject({ name: 'SkillLoadCancelledError' });
    expect(await memory.list()).toEqual([]);
  });
});
