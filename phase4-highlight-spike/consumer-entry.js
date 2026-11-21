import TrMarkdown from '../packages/components/dist/markdown/index.js'

// Keep the entry small and consumer shaped. Vite follows the published markdown
// entry and its dynamic highlight imports when producing the closure report.
export { TrMarkdown }
globalThis.__tinyRobotConsumerMarkdown = TrMarkdown
