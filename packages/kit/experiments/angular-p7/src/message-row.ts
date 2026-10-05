import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import type { ChatMessage } from '@opentiny/tiny-robot-kit/core';
import { ToolStatusComponent } from './tool-status';

@Component({
  selector: 'p7-message-row', standalone: true, imports: [ToolStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article><strong>{{ message.role }}</strong><pre data-content>{{ message.content }}</pre>
    <p7-tool-status [message]="message" [revision]="revision" (decision)="decision.emit($event)" />
  </article>`,
})
export class MessageRowComponent {
  @Input({ required: true }) message!: ChatMessage;
  @Input({ required: true }) revision = 0;
  @Output() decision = new EventEmitter<{ approve: boolean; id: string }>();
}
