/**
 * banner.ts — Tiny Robot CLI Banner 模块
 *
 * 从 scripts/banner-v2.mjs 提取的核心逻辑，重构为可复用导出模块（不自执行）。
 * 支持基于终端能力的三级降级：full（24-bit 真彩色）→ ansi（基础色）→ text（纯文本）
 */

// ── ANSI helpers ──────────────────────────────────────────────
const B = '\x1b[38;2;20;118;255m' // brand blue #1476ff
const bo = '\x1b[1m'
const dm = '\x1b[2m'
const gr = '\x1b[90m'
const R = '\x1b[0m'

// ── Dify-style Logo (14×14 pixel grid → 7 terminal rows) ─────
const logoMap: string[] = [
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
const colors: Record<string, string | null> = { ' ': null, b: '20;118;255', w: '255;255;255' }

function renderLogoLines(): string[] {
  const lines: string[] = []
  for (let y = 0; y < logoMap.length; y += 2) {
    let s = ''
    for (let x = 0; x < logoMap[y].length; x++) {
      const top = colors[logoMap[y][x]] ?? null
      const bot = y + 1 < logoMap.length ? (colors[logoMap[y + 1][x]] ?? null) : null
      if (!top && !bot) s += '\x1b[0m '
      else if (top && !bot) s += `\x1b[38;2;${top}m▀\x1b[0m`
      else if (!top && bot) s += `\x1b[38;2;${bot}m▄\x1b[0m`
      else s += `\x1b[38;2;${top}m\x1b[48;2;${bot}m▀\x1b[0m`
    }
    lines.push(s)
  }
  return lines
}

// ── TINY ROBOT 大字（Box Drawing 字符） ───────────────────────
const title: string[] = [
  '████████╗██╗███╗   ██╗██╗   ██╗   ██████╗  ██████╗ ██████╗  ██████╗ ████████╗',
  '╚══██╔══╝██║████╗  ██║╚██╗ ██╔╝   ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝',
  '   ██║   ██║██╔██╗ ██║ ╚████╔╝    ██████╔╝██║   ██║██████╔╝██║   ██║   ██║   ',
  '   ██║   ██║██║╚██╗██║  ╚██╔╝     ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║   ',
  '   ██║   ██║██║ ╚████║   ██║      ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║   ',
  '   ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ',
]

export type BannerMode = 'full' | 'ansi' | 'text'

/**
 * 检测当前终端的渲染能力，返回合适的 Banner 渲染模式。
 */
function getBannerMode(): BannerMode {
  if (!process.stdout.isTTY) return 'text'
  const depth = (process.stdout as NodeJS.WriteStream & { getColorDepth?: () => number }).getColorDepth?.() ?? 1
  if (depth >= 24) return 'full'
  if (depth >= 4) return 'ansi'
  return 'text'
}

/**
 * 渲染 Banner 并返回字符串（不输出到 stdout）。
 * @param mode - 渲染模式，不传则根据终端能力自动检测
 */
export function getBanner(mode?: BannerMode): string {
  const resolvedMode = mode ?? getBannerMode()

  if (resolvedMode === 'text') {
    return '🤖 Create Tiny Robot — Chat Kit Scaffolding Tool'
  }

  const lines: string[] = []
  lines.push('')

  if (resolvedMode === 'full') {
    // Logo（24-bit 真彩色，仅 full 模式渲染）
    const logo = renderLogoLines()
    const logoIndent = ' '.repeat(33) // (80 - 14) / 2 ≈ 33
    for (const line of logo) {
      lines.push(`${logoIndent}${line}`)
    }
    lines.push('')
  }

  // TINY ROBOT ASCII Art 大字
  for (const line of title) {
    lines.push(`  ${B}${bo}${line}${R}`)
  }

  // 副标题
  lines.push('')
  lines.push(`${' '.repeat(18)}${gr}Chat Kit · 开箱即用的 Vue AI 对话套件${R}`)
  lines.push(`${' '.repeat(14)}${gr}Build powerful AI chat apps based on${R} ${B}@opentiny/tiny-robot-chat${R}`)
  lines.push('')
  lines.push(`  ${B}${dm}${'─'.repeat(80)}${R}`)

  return lines.join('\n')
}

/**
 * 直接打印 Banner 到 stdout。
 * @param mode - 渲染模式，不传则根据终端能力自动检测
 */
export function printBanner(mode?: BannerMode): void {
  console.log(getBanner(mode))
}
