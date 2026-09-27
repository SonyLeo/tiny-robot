import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app';

const mode = new URLSearchParams(location.search).get('mode');
if (mode === 'zone') await import('zone.js');
bootstrapApplication(AppComponent, {
  providers: [mode === 'zone' ? provideZoneChangeDetection() : provideZonelessChangeDetection()],
}).catch(console.error);
