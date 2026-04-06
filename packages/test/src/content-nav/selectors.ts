export const CONTENT_NAV_SELECTORS = {
  navLink: 'text=ContentNav Demo',
  pageTitle: '[data-testid="content-nav-page-title"]',
  availability: '[data-testid="content-nav-availability"]',
  toggleSingleTurnMode: '[data-testid="toggle-single-turn-mode"]',
  externalQueryInput: '[data-testid="external-query-input"]',
  resetStateButton: '[data-testid="reset-content-nav-state"]',
  contentNavHost: '[data-testid="content-nav-host"]',
  contentNavRoot: '[data-testid="content-nav-root"]',
  contentNavFallback: '[data-testid="content-nav-fallback"]',
  scrollContainer: '[data-testid="bubble-scroll-container"]',
  activeIdDisplay: '[data-testid="active-id-display"]',
  expandedDisplay: '[data-testid="expanded-display"]',
  queryDisplay: '[data-testid="query-display"]',
  lastEventDisplay: '[data-testid="last-event-display"]',
  itemCountDisplay: '[data-testid="item-count-display"]',
} as const

export type ContentNavSelectors = typeof CONTENT_NAV_SELECTORS
