import TrMarkdown from '../packages/components/dist/markdown/index.js'

// Isolated size probe for the proposed HLJS language additions. This does not
// modify the production language map or package dependencies.
export const tunedLanguageLoaders = {
  python: () => import('../packages/components/node_modules/highlight.js/lib/languages/python.js'),
  sql: () => import('../packages/components/node_modules/highlight.js/lib/languages/sql.js'),
  yaml: () => import('../packages/components/node_modules/highlight.js/lib/languages/yaml.js'),
}
globalThis.__tinyRobotConsumerMarkdown = TrMarkdown
globalThis.__tinyRobotTunedLanguageLoaders = tunedLanguageLoaders
