# Angular single-session validation host

This directory contains source only. Copy it to an isolated directory outside the repository before installing. Copy the D1 tarball `opentiny-tiny-robot-kit-0.5.1.tgz` into that directory first (SHA-256 `CED645910E3102C4A45CE510CB6F1F54DDAFB8AAFAF2628608CB8C60A2299B47`). The host imports the packed `/angular` and `/core` entries; it uses neither Vue, Web Components nor source aliases.

From the repository root in PowerShell:

```powershell
$hostDir = Join-Path $env:TEMP 'tiny-robot-angular-d1-repro'
Copy-Item packages/kit/experiments/angular-s3 $hostDir -Recurse
Copy-Item "$env:TEMP/tiny-robot-kit-d1-pack/opentiny-tiny-robot-kit-0.5.1.tgz" $hostDir
Set-Location $hostDir
npm install --no-audit --no-fund
& ./node_modules/.bin/tsc.cmd --noEmit -p tsconfig.json
npm run build
npm test
node browser-smoke.mjs
```

The browser smoke script starts Angular on port 4318 and local HTTP/SSE on 4317, exercises Chrome headless in Zone.js and zoneless modes, and terminates both owned processes. It checks streaming, cancellation, provider error, tool approval/rejection and HTTP/SSE. `src/d1.spec.ts` checks the `/angular` connection with real `OnPush` children and owned/shared destruction. The Angular UI is in `src/app.ts`; scripted and HTTP providers are in `src/session.ts`.

For Angular 21/22, copy the same source to separate isolated hosts and change the Angular dependency ranges to `^21.0.0` / `^22.0.0` and TypeScript to `~5.9.0` / `^6.0.0`. Exclude `*.spec.ts` in the production tsconfig when not installing the test dependencies. Angular 22.2 CLI requires Node >=22.22.3: install `node@22.22.3` in that host and run `./node_modules/node/bin/node.exe ./node_modules/@angular/cli/bin/ng.js build`. Do not change the global Node installation.

D1 uses a mutable message view with an explicit revision Signal. External nested writes must use `updateMessage` to notify Angular. D1 verifies the message stage; D2 Skill evidence follows below. Sessions, conversation persistence, Angular 21/22 browser interaction and final release acceptance remain separate tasks.

## D2 Skill verification

`src/d2.spec.ts` consumes `skillPlugin`, `toolPlugin`, loaders and stores directly from the packed `/core` entry in an Angular TestBed host. It checks per-request Signal selection (manual, none, auto), request instructions, resource tools, paused approval restoration, browser file/GitHub loading, cancellation, and memory/IndexedDB storage. `src/d2-browser.ts` and `d2-browser-smoke.mjs` additionally exercise native browser `File` and IndexedDB APIs on an Angular page. The GitHub HTTP responses are intercepted for deterministic verification; this does not prove live GitHub availability.

For an isolated D2 host, copy this directory and the D1 tarball as above, install dependencies, then run:

```powershell
& ./node_modules/.bin/tsc.cmd --noEmit -p tsconfig.json
npm run build
npm test
node d2-browser-smoke.mjs
npm ls vue --all
```

The `none` selection does not call `onInstructionsResolved`. Restoring a paused tool turn requires the saved turn snapshot and `getSkillByName` resolver. Destroying an owned Angular connection aborts its turn and clears that snapshot; the D2 restoration test recreates a connection while the original paused turn still exists. Shared conversation ownership and navigation persistence belong to D3.

The earlier S4 state comparison and its S2 tarball baseline are recorded in [S4-results.md](./S4-results.md). Run `./s4-measure.ps1 -HostDir <installed-outside-repository-host>` from this directory only when reproducing those historical measurements.
