#!/usr/bin/env node

// ── ANSI helpers ──────────────────────────────────────────────
const B  = '\x1b[38;2;20;118;255m'   // brand blue #1476ff
const bo = '\x1b[1m'
const dm = '\x1b[2m'
const gr = '\x1b[90m'
const gn = '\x1b[32m'
const R  = '\x1b[0m'

// ── Dify-style Logo (14×14 pixel grid) ────────────────────────
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

/** Render 2 rows of pixels into 1 terminal row using ▀/▄ half-blocks */
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
  return lines // 7 lines (14 pixel rows / 2)
}

// ── Right-side info lines (aligned to logo height = 7 rows) ──
function renderInfoLines() {
  return [
    `${B}${bo}Tiny Robot${R}  ${dm}Chat Kit${R}`,
    `${gr}开箱即用的 Vue AI 对话套件${R}`,
    `${gr}based on ${R}${B}@opentiny/tiny-robot-chat${R}`,
    '',
    `${gr}$${R}  ${B}npm create tiny-robot-app my-app${R}`,
    `${gr}$${R}  ${B}cd my-app && npm run dev${R}`,
    `${gn}${bo}Happy coding! 🎉${R}`,
  ]
}

// ── Compose: logo left + info right ──────────────────────────
function printBanner() {
  const logoLines = renderLogoLines()
  const infoLines = renderInfoLines()
  const gap = '    '   // space between logo and text
  const rows = Math.max(logoLines.length, infoLines.length)

  console.log('')
  console.log(`  ${B}${dm}${'─'.repeat(56)}${R}`)

  for (let i = 0; i < rows; i++) {
    const logo = logoLines[i] ?? ' '.repeat(14)
    const info = infoLines[i] ?? ''
    console.log(`  ${logo}${gap}${info}`)
  }

  console.log(`  ${B}${dm}${'─'.repeat(56)}${R}`)
  console.log('')

  // ── Templates ──
  const templates = [
    { done: true,  name: 'basic',          desc: '纯对话，OpenAI / DeepSeek' },
    { done: false, name: 'with-context',   desc: '多轮对话上下文优化' },
    { done: false, name: 'with-mcp',       desc: 'MCP 工具调用' },
    { done: false, name: 'with-rag',       desc: '知识检索增强生成' },
  ]

  console.log(`  ${B}${bo}📦 可用模板${R}`)
  console.log('')
  for (const t of templates) {
    const dot = t.done ? `${gn}◆${R}` : `${gr}◇${R}`
    console.log(`    ${dot}  ${B}${t.name.padEnd(22)}${R}${gr}${t.desc}${R}`)
  }
  console.log('')
}

printBanner()