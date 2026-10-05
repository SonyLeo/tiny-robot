import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import type { ChatMessage } from '@opentiny/tiny-robot-kit/core';

@Component({
  selector: 'p7-tool-status', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (call of message.tool_calls ?? []; track call.id) {
    <section aria-label="Tool call"><span data-tool-status>{{ status(call.id) }}</span>
      <span>{{ name(call) }}</span>
      @if (status(call.id) === 'awaiting-approval') {
        <button type="button" (click)="decision.emit({ approve: true, id: call.id })">Approve</button>
        <button type="button" (click)="decision.emit({ approve: false, id: call.id })">Reject</button>
      }
    </section>
  }`,
})
export class ToolStatusComponent {
  @Input({ required: true }) message!: ChatMessage;
  @Input({ required: true }) revision = 0;
  @Output() decision = new EventEmitter<{ approve: boolean; id: string }>();
  status(id: string) { return (this.message.state?.['toolCall'] as Record<string, { status?: string }> | undefined)?.[id]?.status ?? ''; }
  name(call: NonNullable<ChatMessage['tool_calls']>[number]) { return call.type === 'function' ? call.function.name : call.type; }
}
