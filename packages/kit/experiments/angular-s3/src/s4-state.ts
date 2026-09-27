import { DestroyRef, signal } from '@angular/core';
import {
  createNativeMessageAdapter, type MessageEngine, type MessageStateAdapter, type PublicMessageState,
} from '@opentiny/tiny-robot-kit/core';

export type S4Mode = 'full' | 'revision' | 'adapter';

export function createS4State(mode: S4Mode, destroyRef?: DestroyRef) {
  const metrics = { notifications: 0, copiedEntries: 0, publishMs: 0 };
  const state = signal<PublicMessageState | null>(null);
  const revision = signal(0);
  let destroyed = false;
  let unsubscribe: (() => void) | undefined;

  const publish = (snapshot: PublicMessageState) => {
    if (destroyed) return;
    const start = performance.now();
    const messages = mode === 'full' ? structuredClone(snapshot.messages) : snapshot.messages;
    metrics.copiedEntries += messages.length;
    state.set({ ...snapshot, messages });
    revision.update((value) => value + 1);
    metrics.notifications++;
    metrics.publishMs += performance.now() - start;
  };

  const adapter: MessageStateAdapter | undefined = mode === 'adapter' ? (() => {
    const native = createNativeMessageAdapter();
    return {
      initialize(initialState) {
        native.initialize(initialState);
        unsubscribe = native.subscribe(publish);
      },
      getState: native.getState,
      createMessage: native.createMessage,
      subscribe: native.subscribe,
      mutate: native.mutate,
    } satisfies MessageStateAdapter;
  })() : undefined;

  const connect = (engine: MessageEngine) => {
    if (!adapter) unsubscribe = engine.subscribe(publish);
  };
  const dispose = () => { destroyed = true; unsubscribe?.(); };
  destroyRef?.onDestroy(dispose);
  return { adapter, state, revision, metrics, connect, dispose };
}
