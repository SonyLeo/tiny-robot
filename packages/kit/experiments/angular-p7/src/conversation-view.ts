import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { injectAngularConversation } from '@opentiny/tiny-robot-kit/angular';
import { TOOL_RESUME_COMMAND, TOOL_REJECT_COMMAND } from '@opentiny/tiny-robot-kit/core';
import { ConversationService } from './service';
import { MessageRowComponent } from './message-row';

@Component({
  selector: 'p7-conversation-view', standalone: true, imports: [MessageRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section [attr.aria-label]="label" [attr.data-view]="label">
    <h2>{{ label }}: {{ connection.activeConversationId() }}</h2>
    @if (connection.activeEngine(); as message) {
      <p role="status" data-request-state>{{ message.requestState() }}</p>
      @for (item of message.messages(); track $index) {
        <p7-message-row [message]="item" [revision]="message.revision()" (decision)="decide($event)" />
      }
    }
  </section>`,
})
export class ConversationViewComponent {
  @Input() label = 'Primary';
  readonly service = inject(ConversationService);
  readonly connection = injectAngularConversation(this.service.manager);
  decide(value: { approve: boolean; id: string }) {
    void this.service.perform(() => this.connection.dispatchCommand(value.approve ? TOOL_RESUME_COMMAND : TOOL_REJECT_COMMAND, { toolCallId: value.id }));
  }
}
