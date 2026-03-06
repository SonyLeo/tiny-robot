#!/usr/bin/env node
/**
 * banner-v2.mjs — 独立 Banner 演示脚本
 *
 * 核心逻辑已迁移至 packages/chat-cli/utils/banner.js（可复用模块）。
 * 本文件保留作为独立演示/预览脚本使用。
 *
 * 运行：node scripts/banner-v2.mjs
 */

// ── ANSI helpers ──────────────────────────────────────────────
const B  = '\x1b[38;2;20;118;255m'   // brand blue #1476ff
const bo = '\x1b[1m'
const dm = '\x1b[2m'
const gr = '\x1b[90m'
const gn = '\x1b[32m'
const cy = '\x1b[36m'
const R  = '\x1b[0m'

// ── Dify-style Logo (14×14 pixel grid → 7 terminal rows) ─────
const logoMap = [
  '  bbbbbbbbbb  ',
  ' bbbbbbbbbbbb ',
  'bbbbbbbbbbbbbb',
  'bbbbwwwwwwbbbb',
  'bbbwwwwwwwwbbb',
  'bbbwwbwwbwwbbb',
  'bbbwwbwwbwwbbb',
  'bbbwwwwwwwwbbb',
  'bbbwwwwwwwbbbb',
  'bbbwwwwwbbbbbb',
  'bbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbb',
  ' bbbbbbbbbbbb ',
  '  bbbbbbbbbb  ',
]
const colors = { ' ': null, b: '20;118;255', w: '255;255;255' }

function renderLogoLines() {
  const lines = []
  for (let y = 0; y < logoMap.length; y += 2) {
    let s = ''
    for (let x = 0; x < logoMap[y].length; x++) {
      const top = colors[logoMap[y][x]]
      const bot = (y + 1 < logoMap.length) ? colors[logoMap[y + 1][x]] : null
      if (!top && !bot)       s += '\x1b[0m '
      else if (top && !bot)   s += `\x1b[38;2;${top}m▀\x1b[0m`
      else if (!top && bot)   s += `\x1b[38;2;${bot}m▄\x1b[0m`
      else                    s += `\x1b[38;2;${top}m\x1b[48;2;${bot}m▀\x1b[0m`
    }
    lines.push(s)
  }
  return lines
}

// ── TINY ROBOT 大字（一行，紧凑版） ──────────────────────────
const title = [
  '████████╗██╗███╗   ██╗██╗   ██╗   ██████╗  ██████╗ ██████╗  ██████╗ ████████╗',
  '╚══██╔══╝██║████╗  ██║╚██╗ ██╔╝   ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝',
  '   ██║   ██║██╔██╗ ██║ ╚████╔╝    ██████╔╝██║   ██║██████╔╝██║   ██║   ██║   ',
  '   ██║   ██║██║╚██╗██║  ╚██╔╝     ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║   ',
  '   ██║   ██║██║ ╚████║   ██║      ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║   ',
  '   ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ',
]

function printBanner() {
  const logo = renderLogoLines()  // 7 rows

  console.log('')

  // ── Logo 居中 ──
  const logoIndent = ' '.repeat(33) // (80 - 14) / 2 ≈ 33
  logo.forEach(line => console.log(`${logoIndent}${line}`))

  console.log('')

  // ── TINY ROBOT 一行大字 ──
  title.forEach(line => console.log(`  ${B}${bo}${line}${R}`))

  // ── 副标题 ──
  console.log('')
  console.log(`${' '.repeat(18)}${gr}Chat Kit · 开箱即用的 Vue AI 对话套件${R}`)
  console.log(`${' '.repeat(14)}${gr}Build powerful AI chat apps based on${R} ${B}@opentiny/tiny-robot-chat${R}`)

  console.log('')
  console.log(`  ${B}${dm}${'─'.repeat(80)}${R}`)
  console.log('')

  // ── Quick start ──
  console.log(`  ${B}${bo}🚀 快速开始${R}`)
  console.log('')
  console.log(`     ${gr}$${R}  ${cy}npm create tiny-robot my-app${R}`)
  console.log(`     ${gr}$${R}  ${cy}cd my-app && npm run dev${R}`)
  console.log('')
  console.log(`  ${B}${dm}${'─'.repeat(80)}${R}`)
  console.log('')

  // ── Templates ──
  console.log(`  ${B}${bo}📦 可用模板${R}`)
  console.log('')

  const templates = [
    { done: true,  name: 'basic',          desc: '纯对话，OpenAI / DeepSeek' },
    { done: false, name: 'with-context',   desc: '多轮对话上下文优化' },
    { done: false, name: 'with-mcp',       desc: 'MCP 工具调用' },
    { done: false, name: 'with-rag',       desc: '知识检索增强生成' },
  ]

  for (const t of templates) {
    const dot = t.done ? `${gn}◆${R}` : `${gr}◇${R}`
    console.log(`     ${dot}  ${B}${t.name.padEnd(22)}${R}${gr}${t.desc}${R}`)
  }

  console.log('')
  console.log(`  ${B}${dm}${'─'.repeat(80)}${R}`)
  console.log(`  ${gn}${bo}Happy coding! 🎉${R}  ${gr}https://github.com/opentiny/tiny-robot${R}`)
  console.log('')
}

printBanner()
