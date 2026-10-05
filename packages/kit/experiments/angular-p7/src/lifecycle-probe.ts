import { ApplicationRef, EnvironmentInjector, createComponent, createEnvironmentInjector } from '@angular/core';
import {
  createConversationManager, createMessageEngine, createNativeMessageAdapter, createIndexedDBSkillStorage,
  type ChatMessage, type ConversationInfo, type ConversationStorage, type MessageEngine, type MessageUpdateKinds, type PublicMessageState,
} from '@opentiny/tiny-robot-kit/core';
import { ConversationService } from './service';
import { ConversationViewComponent } from './conversation-view';
import { chunk } from './providers';

interface Counts { subscriptions: number; requests: number; queues: number; databases: number; timers: number; writes: number; databaseOpens: number; databaseCloses: number }
const zero = (): Counts => ({ subscriptions: 0, requests: 0, queues: 0, databases: 0, timers: 0, writes: 0, databaseOpens: 0, databaseCloses: 0 });
const check = (counts: Counts) => {
  for (const name of ['subscriptions', 'requests', 'queues', 'databases', 'timers'] as const) {
    if (counts[name] !== 0) throw new Error(`Residual ${name}: ${counts[name]}`);
  }
};

export async function runLifecycleProbe(app: ApplicationRef, parent: EnvironmentInjector, container: HTMLElement) {
  const counts = zero();
  const batches: Array<{ cycle: number; counts: Counts; heap?: number }> = [];
  const histories: Array<Record<string, unknown>> = [];
  const originalSetTimeout = window.setTimeout.bind(window); const originalClearTimeout = window.clearTimeout.bind(window);
  const originalOpen = indexedDB.open.bind(indexedDB);
  indexedDB.open = ((name: string, version?: number) => {
    const request = version === undefined ? originalOpen(name) : originalOpen(name, version);
    if (name.startsWith('p7-lifecycle-')) request.addEventListener('success', () => {
      const db = request.result; counts.databaseOpens += 1; counts.databases += 1;
      const close = db.close.bind(db); let closed = false;
      const recordClose = () => { if (!closed) { closed = true; counts.databases -= 1; counts.databaseCloses += 1; } };
      db.close = () => { recordClose(); close(); };
      db.addEventListener('close', recordClose, { once: true });
    }, { once: true });
    return request;
  }) as IDBFactory['open'];
  const timers = new Set<number>();
  // Count scheduled timers during the probe and restore native functions in finally.
  window.setTimeout = ((callback: TimerHandler, timeout?: number, ...args: unknown[]) => {
    let id = 0;
    id = originalSetTimeout(() => {
      if (timers.delete(id)) counts.timers -= 1;
      if (typeof callback === 'function') callback(...args); else throw new Error('String timer is not supported by probe');
    }, timeout);
    timers.add(id); counts.timers += 1; return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id?: number) => {
    if (id !== undefined && timers.delete(id)) counts.timers -= 1;
    originalClearTimeout(id);
  }) as typeof window.clearTimeout;

  async function cycle(historyLength: number, cancel: boolean, views: number) {
    const databaseName = `p7-lifecycle-${crypto.randomUUID()}`;
    const skills = createIndexedDBSkillStorage({ databaseName });
    const entries = new Map<string, ConversationInfo>(); const saved = new Map<string, ChatMessage[]>();
    const storage: ConversationStorage = {
      saveConversation: (info) => { entries.set(info.id, structuredClone(info)); },
      saveMessages: async (id, messages) => {
        counts.queues += 1;
        try { await Promise.resolve(); saved.set(id, structuredClone(messages)); counts.writes += 1; }
        finally { counts.queues -= 1; }
      },
    };
    let emitted = 0; let firstChunkAt = 0; let streamStarted = 0;
    const manager = createConversationManager({
      storage, autoSaveThrottle: 20,
      engineFactory: (_id, initialMessages, options) => {
        const engine = createMessageEngine(createNativeMessageAdapter(), { ...options, initialMessages });
        const subscribe = engine.subscribe.bind(engine);
        engine.subscribe = ((kindOrListener: MessageUpdateKinds | ((state: PublicMessageState) => void), listener?: (state: PublicMessageState) => void) => {
          counts.subscriptions += 1;
          const unsubscribe = typeof kindOrListener === 'function' ? subscribe(kindOrListener) : subscribe(kindOrListener, listener!);
          let active = true;
          return () => { if (active) { active = false; counts.subscriptions -= 1; unsubscribe(); } };
        }) as MessageEngine['subscribe'];
        return engine;
      },
      engineOptions: { responseProvider: async function* (_body, signal) {
        counts.requests += 1;
        try {
          streamStarted = performance.now();
          for (let index = 0; index < 40; index++) {
            await new Promise<void>((resolve) => {
              const end = () => { clearTimeout(timer); signal.removeEventListener('abort', end); resolve(); };
              const timer = setTimeout(end, 2); signal.addEventListener('abort', end, { once: true }); if (signal.aborted) end();
            });
            if (signal.aborted) return;
            if (!firstChunkAt) firstChunkAt = performance.now(); emitted += 1;
            yield chunk(`token${index} `, index === 39);
            if (cancel && index === 0) {
              await new Promise<void>((resolve) => {
                if (signal.aborted) resolve(); else signal.addEventListener('abort', () => resolve(), { once: true });
              });
              return;
            }
          }
        } finally { counts.requests -= 1; }
      } },
    });
    const subscribeManager = manager.subscribe.bind(manager);
    manager.subscribe = (listener) => {
      counts.subscriptions += 1; const unsubscribe = subscribeManager(listener); let active = true;
      return () => { if (active) { active = false; counts.subscriptions -= 1; unsubscribe(); } };
    };
    const injector = createEnvironmentInjector([{ provide: ConversationService, useValue: {
      manager, perform: (operation: () => unknown) => operation(),
    } }], parent);
    const components = [];
    const starting = performance.now();
    let sending: Promise<void> | undefined;
    try {
      await skills.add({ name: 'probe', description: 'Lifecycle probe', instructions: 'Probe' });
      manager.createConversation({ id: 'history', options: { initialMessages: Array.from({ length: historyLength }, (_, index): ChatMessage => ({
        role: index % 2 ? 'assistant' : 'user', content: `history-${index} ${'history '.repeat(12)}`,
      })) } });
      for (let index = 0; index < views; index++) {
        const element = document.createElement('div'); container.append(element);
        const component = createComponent(ConversationViewComponent, { environmentInjector: injector, hostElement: element });
        component.setInput('label', `Probe ${index}`); app.attachView(component.hostView); components.push({ component, element });
      }
      await app.whenStable();
      const renderedAt = performance.now();
      sending = manager.getEngine('history')!.sendMessage('probe stream');
      if (cancel) {
        await new Promise<void>((resolve, reject) => {
          const ready = () => Array.from(container.querySelectorAll('[data-view]')).every((view) => view.textContent?.includes('token0'));
          const observer = new MutationObserver(() => { if (ready()) finish(); });
          const timer = setTimeout(() => finish(new Error('Cancelled lifecycle sample never rendered its first token')), 10000);
          function finish(error?: Error) { observer.disconnect(); clearTimeout(timer); if (error) reject(error); else resolve(); }
          observer.observe(container, { subtree: true, childList: true, characterData: true });
          if (ready()) finish();
        });
        if (emitted !== 1 || counts.requests !== 1 || !manager.getEngine('history')!.getState().isProcessing) {
          throw new Error('Cancellation sample did not retain a real active streamed request');
        }
      } else {
        await sending; await app.whenStable();
        if (!container.textContent?.includes('token39')) throw new Error('Long history OnPush view did not render the final stream token');
        histories.push({ historyLength, views, emitted, initialRenderMs: renderedAt - starting,
          streamMs: performance.now() - streamStarted, firstChunkMs: firstChunkAt - streamStarted,
          renderedRows: container.querySelectorAll('p7-message-row').length });
      }
    } finally {
      for (const { component, element } of components) { app.detachView(component.hostView); component.destroy(); element.remove(); }
      try { await manager.dispose(); await sending; }
      finally {
        const closed = skills.close(); if (skills.close() !== closed) throw new Error('Skill close Promise is not idempotent'); await closed;
        injector.destroy();
        await new Promise<void>((resolve, reject) => {
          const deletion = indexedDB.deleteDatabase(databaseName);
          deletion.onblocked = () => reject(new Error('Lifecycle DB deletion blocked after close'));
          deletion.onerror = () => reject(deletion.error); deletion.onsuccess = () => resolve();
        });
      }
    }
    // Queue/DB completion and cancellation are awaited; no optional GC is needed for these counts.
    await app.whenStable();
    check(counts);
  }

  try {
    await cycle(500, false, 2); await cycle(2000, false, 2);
    for (let index = 1; index <= 30; index++) {
      await cycle(100, true, 2);
      if (index % 10 === 0) batches.push({ cycle: index, counts: { ...counts },
        heap: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize });
    }
    return { histories, destructionCycles: 30, batches, final: { ...counts },
      heapInterpretation: 'Raw batch samples; subscription/request/timer/queue/DB counts are the deterministic lifecycle gates.' };
  } finally {
    window.setTimeout = originalSetTimeout; window.clearTimeout = originalClearTimeout;
    indexedDB.open = originalOpen;
    for (const id of timers) originalClearTimeout(id);
  }
}
