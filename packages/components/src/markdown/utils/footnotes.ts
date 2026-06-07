import type { TrMarkdownFootnoteConfig } from '../index.type'

export interface ResolvedTrMarkdownFootnoteConfig {
  enabled: boolean
}

const normalizeFootnoteId = (id: unknown) => {
  const value = typeof id === 'number' ? id : Number(id)

  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return Math.floor(value)
}

const normalizeFootnoteSubId = (subId: unknown) => {
  if (subId === undefined || subId === null) {
    return undefined
  }

  const value = typeof subId === 'number' ? subId : Number(subId)

  if (!Number.isFinite(value) || value < 0) {
    return undefined
  }

  return Math.floor(value)
}

export const resolveFootnoteConfig = (
  config?: boolean | TrMarkdownFootnoteConfig,
): ResolvedTrMarkdownFootnoteConfig => {
  if (!config) {
    return {
      enabled: false,
    }
  }

  const options = typeof config === 'boolean' ? {} : config

  return {
    enabled: options.enabled !== false,
  }
}

export const getFootnoteAnchorName = (id: unknown) => {
  return String(normalizeFootnoteId(id) + 1)
}

export const getFootnoteReferenceId = (id: unknown, subId?: unknown) => {
  const anchorName = getFootnoteAnchorName(id)
  const normalizedSubId = normalizeFootnoteSubId(subId)

  if (normalizedSubId && normalizedSubId > 0) {
    return `${anchorName}:${normalizedSubId}`
  }

  return anchorName
}

export const getFootnoteCaption = (id: unknown, subId?: unknown) => {
  return `[${getFootnoteReferenceId(id, subId)}]`
}

export const getFootnoteItemId = (id: unknown) => {
  return `fn${getFootnoteAnchorName(id)}`
}

export const getFootnoteRefId = (id: unknown, subId?: unknown) => {
  return `fnref${getFootnoteReferenceId(id, subId)}`
}

export const getFootnoteItemHref = (id: unknown) => {
  return `#${getFootnoteItemId(id)}`
}

export const getFootnoteBackrefHref = (id: unknown, subId?: unknown) => {
  return `#${getFootnoteRefId(id, subId)}`
}
