import type { ConversationInfo, ConversationStorage, SharedConversationMessage } from '@opentiny/tiny-robot-kit/core';

export const HISTORY_KEY = 'tiny-robot-angular-p7-history';
export const TURN_KEY = '__tiny-robot-turn';
type Entry = ConversationInfo & { messages: SharedConversationMessage[] };

/** Host fault injection; errors deliberately propagate to the public manager. */
export class BrowserStorage implements ConversationStorage {
  failSaves = false;
  private read(): Entry[] { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as Entry[]; }
  private write(entries: Entry[]) {
    if (this.failSaves) throw new Error('P7 storage save failed');
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  }
  loadConversations() { return this.read().map(({ messages: _messages, ...info }) => info); }
  loadMessages(id: string) { return this.read().find((entry) => entry.id === id)?.messages ?? []; }
  saveConversation(info: ConversationInfo) {
    const entries = this.read();
    const entry = entries.find((item) => item.id === info.id);
    if (entry) Object.assign(entry, info); else entries.push({ ...info, messages: [] });
    this.write(entries);
  }
  saveMessages(id: string, messages: SharedConversationMessage[]) {
    const entries = this.read();
    const entry = entries.find((item) => item.id === id);
    if (!entry) throw new Error(`Conversation ${id} was not saved`);
    entry.messages = messages;
    this.write(entries);
  }
  deleteConversation(id: string) { this.write(this.read().filter((entry) => entry.id !== id)); }
}
