import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent, SHARED_ENGINE } from './app';
import { createExperimentEngine } from './session';

describe('Angular S3 native bridge', () => {
  async function mount(shared = false) {
    const engine = createExperimentEngine();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(),
      ...(shared ? [{ provide: SHARED_ENGINE, useValue: engine }] : [])] });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, engine: shared ? engine : fixture.componentInstance.session.engine };
  }

  async function send(fixture: ReturnType<typeof TestBed.createComponent<AppComponent>>, text: string) {
    const input = fixture.nativeElement.querySelector('input[aria-label="Message"]') as HTMLInputElement;
    input.value = text;
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
  }

  it('updates OnPush message child for each streamed chunk without detectChanges', async () => {
    const { fixture } = await mount();
    await send(fixture, 'hello');
    await new Promise((resolve) => setTimeout(resolve, 130));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('one ');
    await new Promise((resolve) => setTimeout(resolve, 240));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('one two three');
    expect(fixture.nativeElement.querySelector('[data-status]').textContent).toContain('completed');
    fixture.destroy();
  });

  it('shows nested tool approval state, then resumes', async () => {
    const { fixture } = await mount();
    await send(fixture, 'tool');
    await new Promise((resolve) => setTimeout(resolve, 40));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-tool-status="awaiting-approval"]')).toBeTruthy();
    fixture.nativeElement.querySelector('s3-tool button').click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Tool finished');
    fixture.destroy();
  });

  it('rejects a tool and updates its OnPush status', async () => {
    const { fixture } = await mount();
    await send(fixture, 'tool');
    await new Promise((resolve) => setTimeout(resolve, 40));
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('s3-tool button');
    buttons[1].click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-tool-status="denied"]')).toBeTruthy();
    fixture.destroy();
  });

  it('reports provider errors and cancellation', async () => {
    const { fixture, engine } = await mount();
    await send(fixture, 'error');
    await new Promise((resolve) => setTimeout(resolve, 30));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-status]').textContent).toContain('error');
    await send(fixture, 'cancel');
    await new Promise((resolve) => setTimeout(resolve, 110));
    fixture.nativeElement.querySelector('button[type="button"]').click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    expect(engine.getState().requestState).toBe('aborted');
    expect(fixture.nativeElement.querySelector('[data-status]').textContent).toContain('aborted');
    fixture.destroy();
  });

  it('preserves shared engine but aborts owned engine on destruction', async () => {
    const { fixture, engine } = await mount(true);
    const session = fixture.componentInstance.session;
    fixture.destroy();
    await engine.sendMessage('hello');
    expect(engine.getState().requestState).toBe('completed');
    expect(session.messages()).toHaveLength(0);
    TestBed.resetTestingModule();
    const owned = await mount();
    void owned.engine.sendMessage('hello');
    owned.fixture.destroy();
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(owned.engine.getState().requestState).toBe('aborted');
  });
});
