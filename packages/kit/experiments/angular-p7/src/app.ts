import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ConversationService } from './service';
import { ConversationViewComponent } from './conversation-view';
import { DiagnosticsComponent } from './diagnostics';

@Component({
  selector: 'p7-app', standalone: true, imports: [ConversationViewComponent, DiagnosticsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host{display:block;max-width:960px;margin:24px auto;padding:16px;font-family:system-ui}nav,fieldset{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}button{padding:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere}[role=alert]{color:#a02020}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}label{display:block}`],
  template: `<h1>Angular P7 conversations</h1>
    <p>Session <span data-boot-id>{{ service.bootId }}</span>; resolver reads <span data-resolver-reads>{{ service.resolverReads() }}</span></p>
    <p role="alert" data-error>{{ service.error() }}</p><p role="status" data-result>{{ service.result() }}</p>
    <nav aria-label="Conversations">@for (item of service.connection.conversations(); track item.id) {
      <button type="button" [attr.aria-pressed]="service.connection.activeConversationId() === item.id"
        [disabled]="service.disposed()" (click)="switchConversation(item.id)">{{ item.id }}</button>
    }</nav>
    <fieldset [disabled]="service.disposed()"><legend>Message</legend>
      <label>Prompt <input #prompt value="stream" /></label>
      <button type="button" (click)="send(prompt.value)">Send</button>
      <button type="button" (click)="send('tool')">Start tool</button>
      <button type="button" (click)="send('skill')">Read Skill</button>
      <button type="button" (click)="cancel()">Cancel</button>
      <button type="button" (click)="useHttp(true)">Use HTTP</button>
      <button type="button" (click)="useHttp(false)">Use scripted</button>
    </fieldset>
    <fieldset><legend>Lifecycle and storage</legend>
      <button type="button" (click)="secondary.set(!secondary())">{{ secondary() ? 'Destroy secondary view' : 'Mount secondary view' }}</button>
      <button type="button" [disabled]="service.disposed()" (click)="dispose()">Dispose manager</button>
      <button type="button" [disabled]="service.disposed()" (click)="deleteActive()">Delete active conversation</button>
      <button type="button" (click)="removeSnapshot()">Remove paused snapshot</button>
      <button type="button" (click)="removeResource()">Remove Skill resource</button>
      <button type="button" (click)="removeSkill()">Remove Skill</button>
      <button type="button" (click)="restoreSkill()">Restore Skill</button>
      <button type="button" (click)="service.storage.failSaves = !service.storage.failSaves">{{ service.storage.failSaves ? 'Allow saves' : 'Fail saves' }}</button>
      <button type="button" [disabled]="service.disposed()" (click)="save()">Save messages</button>
    </fieldset>
    <div class="views"><p7-conversation-view label="Primary" />@if (secondary()) { <p7-conversation-view label="Secondary" /> }</div>
    @if (diagnostics) { <p7-diagnostics /> }`,
})
export class AppComponent {
  readonly service = inject(ConversationService);
  readonly secondary = signal(true);
  readonly diagnostics = new URLSearchParams(location.search).has('diagnostics');
  send(prompt: string) { void this.service.perform(() => this.service.connection.sendMessage(prompt)); }
  switchConversation(id: string) { void this.service.perform(() => this.service.switch(id)); }
  cancel() { void this.service.perform(() => this.service.connection.abort()); }
  useHttp(enabled: boolean) { void this.service.perform(() => this.service.useHttp(enabled)); }
  dispose() { void this.service.perform(() => this.service.dispose()); }
  removeSnapshot() { void this.service.perform(() => this.service.removeSnapshot()); }
  removeResource() { void this.service.perform(() => this.service.removeResource()); }
  removeSkill() { void this.service.perform(() => this.service.removeSkill()); }
  restoreSkill() { void this.service.perform(() => this.service.restoreSkill()); }
  save() { void this.service.perform(() => this.service.manager.saveMessages()); }
  deleteActive() {
    const id = this.service.connection.activeConversationId();
    if (id) void this.service.perform(() => this.service.manager.deleteConversation(id));
  }
}
