#!/usr/bin/env node

const B  = '\x1b[38;2;20;118;255m'  // #1476ff
const bo = '\x1b[1m'
const gr = '\x1b[90m'
const gn = '\x1b[32m'
const R  = '\x1b[0m'

// Tiny Robot 大字（单词间有空格）
const title = [
  ' ████████╗██╗███╗   ██╗██╗   ██╗    ██████╗  ██████╗ ██████╗  ██████╗ ████████╗',
  '    ██║   ██║████╗  ██║╚██╗ ██╔╝    ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝',
  '    ██║   ██║██╔██╗ ██║ ╚████╔╝     ██████╔╝██║   ██║██████╔╝██║   ██║   ██║   ',
  '    ██║   ██║██║╚██╗██║  ╚██╔╝      ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║   ',
  '    ██║   ██║██║ ╚████║   ██║       ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║   ',
  '    ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝       ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝   ╚═╝   ',
]

function printBanner() {
  console.clear()
  console.log('')

  title.forEach(line => console.log(`${B}${bo}${line}${R}`))

  console.log('')
  console.log(`${B}${bo}  ✦ Chat Kit${R}  ${gr}开箱即用的 Vue AI 对话套件${R}`)
  console.log(`${gr}    Build powerful AI chat applications with ease${R}`)
  console.log(`${gr}    based on ${R}${B}@opentiny/tiny-robot-chat${R}`)
  console.log('')
  console.log(B + '─'.repeat(74) + R)
  console.log('')

  console.log(`${B}${bo}  🚀 快速开始${R}`)
  console.log('')
  console.log(`  ${gr}$${R}  ${B}npm create tiny-robot-app my-app${R}`)
  console.log(`  ${gr}$${R}  ${B}cd my-app && npm run dev${R}`)
  console.log('')
  console.log(B + '─'.repeat(74) + R)
  console.log('')

  console.log(`${B}${bo}  📦 可用模板${R}`)
  console.log('')

  const templates = [
    { done: true,  name: 'basic',                   desc: '纯对话，OpenAI / DeepSeek' },
    { done: false, name: 'with-context-management', desc: '多轮对话上下文优化' },
    { done: false, name: 'with-skills',             desc: '模块化能力包，自动发现' },
    { done: false, name: 'with-mcp',                desc: 'MCP 工具调用' },
    { done: false, name: 'with-rag',                desc: '知识检索增强生成' },
  ]

  for (const t of templates) {
    const dot = t.done ? `${gn}◆${R}` : `${gr}◇${R}`
    console.log(`    ${dot}  ${B}${t.name.padEnd(30)}${R}${gr}${t.desc}${R}`)
  }

  console.log('')
  console.log(B + '─'.repeat(74) + R)
  console.log(`${gn}${bo}  Happy coding! 🎉${R}  ${gr}https://github.com/opentiny/tiny-robot${R}`)
  console.log('')
}

printBanner()
