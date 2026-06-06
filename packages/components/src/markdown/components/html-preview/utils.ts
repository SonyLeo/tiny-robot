import type { TrMarkdownHtmlPreviewConfig } from '../../index.type'
import {
  DEFAULT_HTML_PREVIEW_HEIGHT,
  DEFAULT_HTML_PREVIEW_SANDBOX,
  HTML_PREVIEW_AUTO_HEIGHT_MESSAGE_TYPE,
} from './const'

export interface ResolvedTrMarkdownHtmlPreviewConfig {
  copyable?: boolean
  defaultHeight: number
  defaultMode: 'preview' | 'source'
  downloadable: boolean
  enabled: boolean
  fileName: string
  sandbox: string
  streamingMode: 'auto' | 'live' | 'defer'
}

const escapeScriptString = (value: string) => {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export const resolveHtmlPreviewConfig = (
  config?: boolean | TrMarkdownHtmlPreviewConfig,
): ResolvedTrMarkdownHtmlPreviewConfig => {
  if (!config) {
    return {
      defaultHeight: DEFAULT_HTML_PREVIEW_HEIGHT,
      defaultMode: 'preview',
      downloadable: true,
      enabled: false,
      fileName: 'preview.html',
      sandbox: DEFAULT_HTML_PREVIEW_SANDBOX,
      streamingMode: 'auto',
    }
  }

  const options = typeof config === 'boolean' ? {} : config

  return {
    copyable: options.copyable,
    defaultHeight: options.defaultHeight ?? DEFAULT_HTML_PREVIEW_HEIGHT,
    defaultMode: options.defaultMode ?? 'preview',
    downloadable: options.downloadable !== false,
    enabled: options.enabled !== false,
    fileName: options.fileName ?? 'preview.html',
    sandbox: options.sandbox ?? DEFAULT_HTML_PREVIEW_SANDBOX,
    streamingMode: options.streamingMode ?? 'auto',
  }
}

export const isFullHtmlDocument = (content: string) => {
  if (!content) return false

  const head = content.slice(0, 1024).toLowerCase()
  return head.includes('<!doctype html') || head.includes('<html')
}

export const isHtmlContentClosed = (content: string) => {
  if (!content) return false

  return content.slice(-1024).toLowerCase().includes('</html>')
}

export const containsScript = (content: string) => {
  return /<script\b/i.test(content || '')
}

const createStorageShim = () => {
  return `(() => {
  function createStorage() {
    var store = Object.create(null);
    return {
      get length() {
        return Object.keys(store).length;
      },
      key: function (index) {
        var keys = Object.keys(store);
        return index >= 0 && index < keys.length ? keys[index] : null;
      },
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem: function (key, value) {
        store[String(key)] = String(value);
      },
      removeItem: function (key) {
        delete store[key];
      },
      clear: function () {
        store = Object.create(null);
      },
    };
  }

  function tryShim(name) {
    try {
      window[name];
      return;
    } catch (_) {}

    try {
      Object.defineProperty(window, name, {
        configurable: true,
        value: createStorage(),
      });
    } catch (_) {}
  }

  tryShim('localStorage');
  tryShim('sessionStorage');
})();`
}

const createAutoHeightScript = (frameId: string) => {
  return `(() => {
  const frameId = ${escapeScriptString(frameId)};
  const type = ${escapeScriptString(HTML_PREVIEW_AUTO_HEIGHT_MESSAGE_TYPE)};
  const readHeight = () => Math.ceil(Math.max(
    document.documentElement ? document.documentElement.scrollHeight : 0,
    document.body ? document.body.scrollHeight : 0
  ));
  const postHeight = () => {
    window.parent.postMessage({ frameId, height: readHeight(), type }, '*');
  };
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  document.addEventListener('DOMContentLoaded', postHeight);
  if (window.ResizeObserver && document.documentElement) {
    new ResizeObserver(postHeight).observe(document.documentElement);
  }
  setTimeout(postHeight, 0);
  setTimeout(postHeight, 120);
  setTimeout(postHeight, 600);
})();`
}

const createBaseStyle = (background?: string) => {
  return `html, body {
  min-height: 100%;
  margin: 0;
  color-scheme: light dark;
  background: ${background || 'transparent'};
}`
}

const wrapScript = (content: string) => `<script>${content}</script>`

const createInjectedHead = (frameId: string, background?: string) => {
  return `<meta charset="utf-8">${wrapScript(createStorageShim())}<style>${createBaseStyle(background)}</style>${wrapScript(
    createAutoHeightScript(frameId),
  )}`
}

export const buildStaticSrcDoc = ({
  background,
  content,
  frameId,
}: {
  background?: string
  content: string
  frameId: string
}) => {
  const source = content.trim()
  const injectedHead = createInjectedHead(frameId, background)

  if (/<head(\s[^>]*)?>/i.test(source)) {
    return source.replace(/<head(\s[^>]*)?>/i, (matched) => `${matched}${injectedHead}`)
  }

  if (/<html(\s[^>]*)?>/i.test(source)) {
    return source.replace(/<html(\s[^>]*)?>/i, (matched) => `${matched}<head>${injectedHead}</head>`)
  }

  return `<!doctype html><html><head>${injectedHead}</head><body>${source}</body></html>`
}
