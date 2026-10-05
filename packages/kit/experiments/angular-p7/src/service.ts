import { Injectable, OnDestroy, signal } from '@angular/core';
import { connectAngularConversation } from '@opentiny/tiny-robot-kit/angular';
import {
  createConversationManager, createMessageEngine, createNativeMessageAdapter,
  createIndexedDBSkillStorage, skillPlugin, toolPlugin,
  type ConversationManager, type CreateMessageEngineOptions, type SkillDefinition,
} from '@opentiny/tiny-robot-kit/core';
import { scriptedProvider, httpProvider } from './providers';
import { BrowserStorage, TURN_KEY } from './storage';

const docs: SkillDefinition = {
  name: 'docs', description: 'P7 documentation', instructions: 'Read the current guide.',
  resources: [{ path: 'guide.md', kind: 'text', resourceId: 'guide.md', text: '# Persisted P7 guide' }],
};

@Injectable({ providedIn: 'root' })
export class ConversationService implements OnDestroy {
  readonly bootId = crypto.randomUUID();
  readonly error = signal('');
  readonly result = signal('');
  readonly resolverReads = signal(0);
  readonly disposed = signal(false);
  readonly storage = new BrowserStorage();
  readonly skills = createIndexedDBSkillStorage({ databaseName: 'tiny-robot-angular-p7-skills' });
  readonly manager: ConversationManager = createConversationManager({
    storage: this.storage,
    autoSaveThrottle: 80,
    engineFactory: (_id, initialMessages, options) => createMessageEngine(createNativeMessageAdapter(), { ...options, initialMessages }),
    engineOptions: this.options(),
    onPersistenceError: (error: unknown, id: string) => this.error.set(`${id}: ${String(error)}`),
  });
  readonly connection = connectAngularConversation(this.manager);
  readonly ready = this.initialize();
  private disposal?: Promise<void>;

  private options(): CreateMessageEngineOptions {
    return {
      responseProvider: scriptedProvider,
      plugins: [
        skillPlugin({
          selection: { mode: 'manual', skillNames: ['docs'] },
          getSkillByName: async (name) => {
            this.resolverReads.update((count) => count + 1);
            return this.skills.get(name);
          },
        }),
        toolPlugin({
          getTools: () => [{ type: 'function', function: { name: 'confirm', description: 'Confirm action', parameters: { type: 'object', properties: {} } } }],
          callTool: (call) => {
            if (call.type !== 'function' || call.function.name !== 'confirm') throw new Error(`Missing runtime tool: ${call.type === 'function' ? call.function.name : call.type}`);
            return 'approved';
          },
          shouldPauseToolCall: () => true,
        }),
      ],
    };
  }
  private async initialize() {
    try {
      // A marker preserves intentional missing Skill/resource faults across reload.
      if (!localStorage.getItem('p7-skill-seeded')) {
        await this.skills.add(docs);
        localStorage.setItem('p7-skill-seeded', 'yes');
      }
      await this.manager.load();
      if (!this.manager.getState().conversations.length) {
        this.manager.createConversation({ id: 'A', title: 'Conversation A' });
        this.manager.createConversation({ id: 'B', title: 'Conversation B' });
        await this.manager.flush();
      }
      const id = localStorage.getItem('p7-active') ?? 'A';
      const available = this.manager.getState().conversations;
      await this.manager.switchConversation(available.some((item) => item.id === id) ? id : available[0].id);
    } catch (error) { this.error.set(String(error)); }
  }
  async perform(operation: () => unknown | PromiseLike<unknown>) {
    this.error.set('');
    this.result.set('');
    try {
      const result = await operation();
      this.result.set(result === undefined ? 'Done' : JSON.stringify(result));
      if (!this.disposed()) await this.manager.flush();
    } catch (error) { this.error.set(String(error)); }
  }
  async switch(id: string) {
    await this.manager.switchConversation(id);
    localStorage.setItem('p7-active', id);
  }
  dispose(): Promise<void> {
    if (this.disposal) return this.disposal;
    this.disposed.set(true);
    this.disposal = (async () => {
      await this.connection.dispose();
      await this.ready;
      try { await this.manager.dispose(); }
      finally { await this.skills.close(); }
    })();
    return this.disposal;
  }
  useHttp(enabled: boolean) {
    this.connection.activeEngine()?.setResponseProvider(enabled ? httpProvider : scriptedProvider);
  }
  removeSnapshot() { localStorage.removeItem(TURN_KEY); }
  async removeResource() { await this.skills.add({ ...docs, resources: [] }); }
  async removeSkill() { await this.skills.delete('docs'); }
  async restoreSkill() { await this.skills.add(docs); }
  ngOnDestroy() { void this.dispose().catch((error: unknown) => this.error.set(String(error))); }
}
