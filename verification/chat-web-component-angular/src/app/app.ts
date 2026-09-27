import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import { registerTinyRobotChat } from '@opentiny/tiny-robot-chat-web-component';
import type { ChatCompletion, TinyRobotChatElement } from '@opentiny/tiny-robot-chat-web-component';

registerTinyRobotChat();

interface PendingRequest {
  signal: AbortSignal;
  release: (content: string) => void;
}

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <form (submit)="$event.preventDefault()">
      <label>External form <input aria-label="External form" value="outside" /></label>
      <button>Submit</button>
    </form>
    <div class="controls">
      <button type="button" (click)="send('a')">Send A</button>
      <button type="button" (click)="send('b')">Send B</button>
      <button type="button" (click)="release('a')">Release A</button>
      <button type="button" (click)="release('b')">Release B</button>
      <button type="button" (click)="cancelA()">Cancel A</button>
    </div>
    <output id="ready-count">{{ readyCount() }}</output>
    <output id="error-count">{{ errorCount() }}</output>
    <div class="chats">
      <tiny-robot-chat #chatA title="Angular A" color-mode="light">
        <span slot="header-notice">Angular host A</span>
      </tiny-robot-chat>
      <tiny-robot-chat #chatB title="Angular B" color-mode="dark">
        <span slot="header-notice">Angular host B</span>
      </tiny-robot-chat>
    </div>
  `,
})
export class App implements AfterViewInit {
  @ViewChild('chatA') chatA!: ElementRef<TinyRobotChatElement>;
  @ViewChild('chatB') chatB!: ElementRef<TinyRobotChatElement>;

  readonly readyCount = signal(0);
  readonly errorCount = signal(0);
  readonly requests: Record<'a' | 'b', PendingRequest[]> = { a: [], b: [] };

  ngAfterViewInit() {
    for (const [name, element] of [
      ['a', this.chatA.nativeElement],
      ['b', this.chatB.nativeElement],
    ] as const) {
      element.addEventListener('ready', () => this.readyCount.update((count) => count + 1));
      element.addEventListener('chat-error', () => this.errorCount.update((count) => count + 1));
      element.responseProvider = (_body, signal) => {
        let release!: (content: string) => void;
        const content = new Promise<string>((resolve) => {
          release = resolve;
        });
        this.requests[name].push({ signal, release });
        signal.addEventListener('abort', () => release(''), { once: true });
        return (async function* (): AsyncGenerator<ChatCompletion> {
          const text = await content;
          if (signal.aborted) return;
          yield {
            id: `angular-${name}`,
            object: 'chat.completion.chunk',
            created: 0,
            model: 'mock',
            system_fingerprint: null,
            choices: [
              { index: 0, delta: { role: 'assistant', content: text }, finish_reason: null },
            ],
          };
        })();
      };
    }
  }

  send(name: 'a' | 'b') {
    const element = name === 'a' ? this.chatA.nativeElement : this.chatB.nativeElement;
    void element.send(`Angular request ${name}`);
  }

  release(name: 'a' | 'b') {
    this.requests[name].at(-1)?.release(`**Angular answer ${name}**`);
  }

  cancelA() {
    void this.chatA.nativeElement.cancel();
  }
}
