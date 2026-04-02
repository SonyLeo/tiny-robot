import { Component } from 'vue'

export interface FeedbackProps {
  operations?: {
    name: string
    label: string
    onClick?: () => void
  }[]
  operationsLimit?: number
  actions?: {
    name: string
    label: string
    icon?: 'copy' | 'refresh' | 'like' | 'dislike' | Component
    onClick?: () => void
  }[]
  actionsLimit?: number
  sources?: {
    label: string
    link: string
  }[]
  sourcesLinesLimit?: number
}

export interface FeedbackEvents {
  (e: 'operation', name: string): void
  (e: 'action', name: string): void
}
