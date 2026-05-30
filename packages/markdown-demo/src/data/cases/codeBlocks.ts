import type { MarkdownDemoCase } from '../../types/markdownDemo'

export const codeBlocksCase: MarkdownDemoCase = {
  id: 'code-blocks',
  title: 'Code blocks',
  description:
    '对标 LobeUI 的 code blocks 案例，覆盖单行 fenced snippet、多行 block code，以及 full / overlay 两种 code block 交互模式。',
  deferPreview: true,
  sourceCode: {
    language: 'typescript',
    code: `interface User {
  id: number
  name: string
  email: string
}

function createUser(userData: Partial<User>): User {
  return {
    id: Math.random(),
    name: '',
    email: '',
    ...userData,
  }
}`,
  },
  initialContent: `\`\`\`bash
pnpm install
\`\`\`

\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
}

function createUser(userData: Partial<User>): User {
  return {
    id: Math.random(),
    name: '',
    email: '',
    ...userData,
  }
}
\`\`\`

**Code blocks in lists**

1. First, install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

2. Then, run the demo:
   \`\`\`bash
   pnpm dev --host
   \`\`\``,
  markdownProps: {
    code: {
      highlight: {
        engine: 'shiki',
      },
    },
  },
  controls: {
    blockMode: true,
    copyable: true,
    defaultExpand: true,
    highlightEngine: true,
    showLanguage: true,
  },
}
