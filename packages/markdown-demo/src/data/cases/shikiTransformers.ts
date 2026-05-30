import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const shikiTransformersCase: MarkdownDemoCase = {
  id: 'shiki-transformers',
  title: 'Shiki transformers',
  description:
    '对标 LobeUI 的 transformer 案例，使用 Shiki 可选路径渲染 diff / highlight / focus，并通过右侧控制面板切换引擎和 transformer 开关。',
  deferPreview: true,
  initialContent: `**Code Diff**

\`\`\`ts
export function greetUser(name: string) {
  console.log('hewwo ' + name) // [!code --]
  console.log('Hello ' + name) // [!code ++]
  return \`Welcome, \${name}!\`
}
\`\`\`

**Code Highlighting**

\`\`\`ts
export function calculateTotal(items: Item[]) {
  let total = 0
  console.log('Calculating total...') // [!code highlight]

  for (const item of items) {
    total += item.price
  }

  return total
}
\`\`\`

**Code Focus**

\`\`\`ts
export function authenticateUser(credentials: Credentials) {
  const isValid = validateCredentials(credentials)

  if (isValid) {
    return generateToken(credentials.userId) // [!code focus]
  }

  throw new Error('Invalid credentials')
}
\`\`\``,
  markdownProps: {
    code: {
      blockMode: 'full',
      highlight: {
        engine: 'shiki',
        enableTransformer: true,
      },
    },
  },
  controls: {
    blockMode: true,
    highlightEngine: true,
    enableTransformer: true,
    showLanguage: true,
    copyable: true,
    defaultExpand: true,
  },
}
