# TinyRobot Chat Web Component

`@opentiny/tiny-robot-chat-web-component` exposes the real TinyRobot Chat through standard DOM APIs. The package contains Vue and Chat implementation code in its browser bundle; a host does not install or configure Vue.

This package is under staged validation and has not been published. The repository builds it with `pnpm --filter @opentiny/tiny-robot-chat-web-component build`.

## Native HTML

Serve the complete installed `dist` directory. Import only `index.js`; its other JS chunks load relative to the entry when needed. The compiled Chat CSS is included in the entry and inserted into each ShadowRoot.

```html
<tiny-robot-chat id="chat" title="Support" color-mode="light" style="display:block;height:650px">
  <span slot="header-notice">Online support</span>
</tiny-robot-chat>
<script type="module">
  import { registerTinyRobotChat } from './node_modules/@opentiny/tiny-robot-chat-web-component/dist/index.js'

  const chat = document.querySelector('#chat')
  chat.responseProvider = (requestBody, abortSignal) => myStreamingService(requestBody, abortSignal)
  chat.addEventListener('ready', () => console.log('Chat is ready'))
  chat.addEventListener('chat-error', (event) => console.error(event.detail))
  registerTinyRobotChat()
</script>
```

`responseProvider` is a JavaScript property, not an HTML attribute. It accepts a completion Promise or an async generator of OpenAI-style completion chunks. Pass the supplied `AbortSignal` to the service and stop the stream when it is aborted. Set the property before or after registration; `ready` fires only when a provider exists and the real Chat has mounted. Registration is explicit and repeated calls are safe. The tag name is fixed: `tiny-robot-chat`.

After `ready`, `await chat.send('Hello')` sends text and returns a boolean; `await chat.cancel()` aborts the current request. Calling either method before `ready` rejects. Changing `responseProvider` after `ready` affects later requests; an in-progress request keeps the provider selected when it began.

`title` and `color-mode` are attributes. The matching DOM properties are `title` and `colorMode`; changing either while mounted updates that instance. `color-mode` accepts `light` or `dark` and defaults to `light`. The host must give the element a useful height.

`ready` has `detail.instance`; `chat-error` has `detail: { action, message }`, where action is `mount`, `send`, `cancel`, or `runtime`. Both are bubbling, composed `CustomEvent`s. A failure also rejects the related method's Promise when there is one. Errors from the internal UI can use action `runtime`.

`<span slot="header-notice">` projects ordinary host DOM into the header. Native slots do not receive Vue scoped-slot data.

## Angular

Import `registerTinyRobotChat` and the public element/provider types from the package root. Register in browser code, declare `CUSTOM_ELEMENTS_SCHEMA`, then assign `responseProvider` through `ElementRef<TinyRobotChatElement>` in `ngAfterViewInit`. The working two-instance Angular 21 example is at `verification/chat-web-component-angular` in this repository. It imports no Vue API and needs no kit Angular adapter.

## Lifecycle And Limits

Each element owns its Vue app, kit conversation collection and memory storage. A synchronous DOM move preserves the conversation. Removing the element aborts its request and releases the app; attaching it later creates a fresh session and fires `ready` again. A page refresh clears history.

This first version covers embedded Chat, streaming, cancellation, conversation history, themes and the `header-notice` slot. It does not promise persisted history, external state ownership, floating layout, SSR, arbitrary framework content in slots, or complete MCP and attachment workflows. The fixed demo suggestions from the validation slice are not product defaults.

Build output currently contains one entry and three lazy JS chunks. The complete JS output is 706,680 gzip bytes, including CSS embedded in the entry; the source CSS alone is 55,718 gzip bytes. These are file calculations, not network measurements or a startup guarantee. Keep the whole published `dist` directory available for lazy modules.
