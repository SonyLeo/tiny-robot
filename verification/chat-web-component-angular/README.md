# Angular Chat Web Component consumer

This standalone Angular 21.2.24 project consumes the packed `@opentiny/tiny-robot-chat-web-component` artifact from `../chat-web-component-consumer/`. It imports no Vue API and uses no kit Angular adapter. Node 22.15.1 is supported by this CLI version; the current machine does not meet Angular 22's minimum Node version.

The app registers `tiny-robot-chat` in browser code, declares `CUSTOM_ELEMENTS_SCHEMA`, and assigns each element's `responseProvider` DOM property after view initialization. It renders two Chats with different themes, a native `header-notice` slot, and an external form. The buttons release mock streaming responses on demand.

From this directory, after the tarball dependency has been installed and the Angular production build has been generated:

```powershell
node server.mjs
```

Open `http://localhost:4180/`. To rebuild the production host, run `npm run build`. From `packages/test`, run `pnpm exec playwright test -c playwright.wc-angular.config.ts` to check it in Chromium and actual Chrome. The package's public contract and limitations are in `packages/chat-web-component/README.md`.
