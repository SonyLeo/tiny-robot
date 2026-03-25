import { pathToFileURL } from 'node:url'

const cssCache = new Map()

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.endsWith('.css') || specifier.endsWith('.vue')) {
    const url = specifier.startsWith('file:') ? specifier : pathToFileURL(specifier).href
    return { url, format: 'module', shortCircuit: true }
  }

  return defaultResolve(specifier, context, defaultResolve)
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.css') || url.endsWith('.vue')) {
    const cached = cssCache.get(url)
    if (cached) {
      return cached
    }

    const result = {
      format: 'module',
      source: '// CSS stub',
    }

    cssCache.set(url, result)
    return { ...result, shortCircuit: true }
  }

    return defaultLoad(url, context, defaultLoad)
}
