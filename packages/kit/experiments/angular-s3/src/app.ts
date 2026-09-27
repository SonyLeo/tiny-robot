import { ChangeDetectionStrategy, Component, InjectionToken, Input, inject } from '@angular/core';
import { injectAngularMessage, injectSharedAngularMessage } from '@opentiny/tiny-robot-kit/angular';
import { TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND, type ChatMessage, type MessageEngine } from '@opentiny/tiny-robot-kit/core';
import { createExperimentOptions, httpProvider, scriptedProvider } from './session';

export const SHARED_ENGINE = new InjectionToken<MessageEngine>('S3 shared engine');

@Component({
  selector: 's3-tool', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="tool" [attr.data-tool-status]="status">Tool {{ callId }}: {{ status }}
    @if (status === 'awaiting-approval') {
      <button type="button" (click)="decide(true)">Approve</button>
      <button type="button" (click)="decide(false)">Reject</button>
    }
  </div>`,
})
export class ToolComponent {
  @Input({ required: true }) callId = '';
  @Input({ required: true }) status = '';
  @Input({ required: true }) decide!: (approve: boolean) => void;
}

@Component({
  selector: 's3-message', standalone: true, imports: [ToolComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article [attr.data-role]="message.role"><strong>{{ message.role }}</strong>: {{ message.content }}
    @for (call of message.tool_calls ?? []; track call.id) {
      <s3-tool [callId]="call.id" [status]="toolStatus(call.id)" [decide]="decide(call.id)" />
    }
  </article>`,
})
export class MessageComponent {
  @Input({ required: true }) message!: ChatMessage;
  @Input({ required: true }) revision = 0;
  @Input({ required: true }) onDecision!: (approve: boolean, id: string) => void;
  toolStatus(id: string): string {
    return (this.message.state?.toolCall as Record<string, { status: string }> | undefined)?.[id]?.status ?? 'pending';
  }
  decide(id: string) { return (approve: boolean) => this.onDecision(approve, id); }
}

@Component({
  selector: 's3-app', standalone: true, imports: [MessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host{display:block;max-width:48rem;margin:2rem auto;font:16px system-ui;padding:1rem}
    form{display:flex;gap:.5rem}input{flex:1}article,.tool{padding:.5rem;border-bottom:1px solid #aaa}
    button{margin:.25rem} .tool{margin-left:1rem}`],
  template: `<h1>Angular S3 single session</h1>
      <label><input type="checkbox" #http (change)="useHttp(http.checked)">Local HTTP/SSE</label>
    <form (submit)="send(input, $event)">
      <input #input aria-label="Message" placeholder="Try hello, tool, error" />
      <button type="submit" [disabled]="session.isProcessing()">Send</button>
      <button type="button" (click)="session.abort()">Cancel</button>
    </form>
    <p data-status>{{ session.requestState() }}</p>
    @for (message of session.messages(); track $index) {
      <s3-message [message]="message" [revision]="session.revision()" [onDecision]="onDecision" />
    }`,
})
export class AppComponent {
  private readonly shared = inject(SHARED_ENGINE, { optional: true });
  readonly session = this.shared ? injectSharedAngularMessage(this.shared) : injectAngularMessage(createExperimentOptions());
  readonly onDecision = (approve: boolean, id: string) => {
    void this.session.dispatchCommand(approve ? TOOL_RESUME_COMMAND : TOOL_REJECT_COMMAND, { toolCallId: id });
  };
  useHttp(enabled: boolean) { this.session.setResponseProvider(enabled ? httpProvider : scriptedProvider); }
  send(input: HTMLInputElement, event: Event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    void this.session.sendMessage(text).catch(() => {});
  }
}
