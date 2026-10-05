import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConversationService } from './service';
import { deferred } from './testing';

afterEach(() => { TestBed.resetTestingModule(); localStorage.clear(); });

describe('P7 application-owned Skill DB lifecycle', () => {
  it('keeps the owned DB open until the manager final queue drains, then closes once', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const service = TestBed.inject(ConversationService); await service.ready;
    const gate = deferred();
    const originalDispose = service.manager.dispose.bind(service.manager);
    vi.spyOn(service.manager, 'dispose').mockImplementation(async () => { await gate.promise; await originalDispose(); });
    const close = vi.spyOn(service.skills, 'close');
    const disposal = service.dispose(); expect(service.dispose()).toBe(disposal);
    await Promise.resolve(); await Promise.resolve(); expect(close).not.toHaveBeenCalled();
    gate.resolve(); await disposal; expect(close).toHaveBeenCalledTimes(1);
    await expect(service.skills.list()).rejects.toThrow('closed');
    service.ngOnDestroy(); await service.dispose(); expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes the owned DB after an observable final-save failure', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const service = TestBed.inject(ConversationService); await service.ready;
    const close = vi.spyOn(service.skills, 'close'); service.storage.failSaves = true;
    await expect(service.dispose()).rejects.toThrow('P7 storage save failed');
    expect(close).toHaveBeenCalledTimes(1); await expect(service.skills.list()).rejects.toThrow('closed');
  });
});
