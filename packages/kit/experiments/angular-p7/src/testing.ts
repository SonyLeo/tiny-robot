import {
  createConversationManager, createMessageEngine, createNativeMessageAdapter,
  toolPlugin, type ConversationInfo, type ConversationStorage,
  type CreateMessageEngineOptions, type SharedConversationMessage,
} from '@opentiny/tiny-robot-kit/core';

export function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

export class ControlledStorage implements ConversationStorage {
  infos = new Map<string, ConversationInfo>();
  messages = new Map<string, SharedConversationMessage[]>();
  fail = false;
  saves: string[] = [];
  loadGate?: ReturnType<typeof deferred<SharedConversationMessage[]>>;
  saveGate?: ReturnType<typeof deferred<void>>;
  loadConversations() { return structuredClone([...this.infos.values()]); }
  loadMessages(id: string) { return this.loadGate?.promise ?? structuredClone(this.messages.get(id) ?? []); }
  saveConversation(info: ConversationInfo) {
    if (this.fail) throw new Error('controlled save failure');
    this.infos.set(info.id, structuredClone(info));
  }
  async saveMessages(id: string, messages: SharedConversationMessage[]) {
    const gate = this.saveGate;
    if (gate) await gate.promise;
    if (this.fail) throw new Error('controlled save failure');
    this.saves.push(id);
    this.messages.set(id, structuredClone(messages));
  }
  deleteConversation(id: string) { this.infos.delete(id); this.messages.delete(id); }
}

export function makeManager(options: CreateMessageEngineOptions = {}, storage = new ControlledStorage(), errors: string[] = []) {
  const manager = createConversationManager({
    storage, autoSaveThrottle: 30,
    engineFactory: (_id, initialMessages, config) => createMessageEngine(createNativeMessageAdapter(), { ...config, initialMessages }),
    engineOptions: {
      ...options,
      plugins: options.plugins ?? [toolPlugin({
        getTools: () => [{ type: 'function', function: { name: 'confirm', parameters: { type: 'object', properties: {} } } }],
        callTool: () => 'approved', shouldPauseToolCall: () => true,
      })],
    },
    onPersistenceError: (error: unknown, id: string) => errors.push(`${id}: ${String(error)}`),
  });
  return { manager, storage, errors };
}
