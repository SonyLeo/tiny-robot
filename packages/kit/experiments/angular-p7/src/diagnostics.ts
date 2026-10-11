import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core'
import {
  validateNativeResources,
  validateControlledGitHub,
  validateLiveGitHub,
  validateControlledGitHub404,
  validateControlledGitHubCancellation,
  cancelControlledGitHub,
} from './browser-resources'
import { runLifecycleProbe } from './lifecycle-probe'

@Component({
  selector: 'p7-diagnostics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section aria-label="Validation diagnostics">
    <h2>Validation diagnostics</h2>
    <button type="button" [disabled]="busy()" (click)="nativeResources()">Validate native resources</button>
    <button type="button" [disabled]="busy()" (click)="controlledGitHub()">Validate controlled GitHub</button>
    <button type="button" [disabled]="busy()" (click)="controlledGitHub404()">Validate GitHub 404</button>
    <button type="button" [disabled]="busy()" (click)="controlledGitHubCancellation()">
      Validate GitHub cancellation
    </button>
    <button type="button" [disabled]="!busy()" (click)="cancelGitHub()">Cancel controlled GitHub</button>
    <button type="button" [disabled]="busy()" (click)="lifecycle()">Measure long history and disposal</button>
    <label>Live GitHub repository <input #repo /></label><label>Fixed ref <input #ref /></label
    ><label>Skill path <input #path /></label>
    <button type="button" [disabled]="busy()" (click)="liveGitHub(repo.value, ref.value, path.value)">
      Validate live GitHub
    </button>
    <p role="alert" data-diagnostic-error>{{ error() }}</p>
    <pre role="status" data-diagnostic-result>{{ result() }}</pre>
    <div #probe></div>
  </section>`,
})
export class DiagnosticsComponent {
  readonly busy = signal(false)
  readonly error = signal('')
  readonly result = signal('')
  private readonly app = inject(ApplicationRef)
  private readonly injector = inject(EnvironmentInjector)
  @ViewChild('probe', { static: true }) probe!: ElementRef<HTMLElement>
  private async run(operation: () => Promise<unknown>) {
    this.busy.set(true)
    this.result.set('')
    this.error.set('')
    try {
      this.result.set(JSON.stringify(await operation()))
    } catch (error) {
      this.error.set(String(error))
    } finally {
      this.busy.set(false)
    }
  }
  nativeResources() {
    void this.run(validateNativeResources)
  }
  controlledGitHub() {
    void this.run(validateControlledGitHub)
  }
  controlledGitHub404() {
    void this.run(validateControlledGitHub404)
  }
  controlledGitHubCancellation() {
    void this.run(validateControlledGitHubCancellation)
  }
  cancelGitHub() {
    cancelControlledGitHub()
  }
  liveGitHub(repo: string, ref: string, path: string) {
    void this.run(() => validateLiveGitHub(repo, ref, path))
  }
  lifecycle() {
    void this.run(() => runLifecycleProbe(this.app, this.injector, this.probe.nativeElement))
  }
}
