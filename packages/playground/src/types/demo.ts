export interface DemoFile {
  name: string
  path: string
  content: string
  component: string
}

export interface DemoCategory {
  name: string
  demos: DemoFile[]
}

export interface DemoMetadata {
  title?: string
  description?: string
  tags?: string[]
}
