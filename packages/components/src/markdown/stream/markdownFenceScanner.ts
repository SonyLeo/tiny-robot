export type TrMarkdownFenceMarker = '`' | '~'

export interface TrMarkdownFenceRange {
  marker: TrMarkdownFenceMarker
  run: number
  start: number
  /** Exclusive source offset at the end of the fence line, before its line ending. */
  end: number
  open: boolean
  closed: boolean
}

export interface TrMarkdownFenceScan {
  fences: TrMarkdownFenceRange[]
  openFence?: TrMarkdownFenceRange
}

type FenceLine = {
  marker: TrMarkdownFenceMarker
  run: number
  start: number
  end: number
  suffix: string
}

const fenceLinePattern = /^( {0,3})(`{3,}|~{3,})(.*)$/

const readFenceLine = (line: string, start: number): FenceLine | undefined => {
  const match = line.match(fenceLinePattern)
  if (!match) return

  const markerRun = match[2]
  const marker = markerRun[0] as TrMarkdownFenceMarker
  const suffix = match[3]
  // Backtick info strings cannot contain a backtick. Tilde info strings may.
  if (marker === '`' && suffix.includes('`')) return

  return {
    marker,
    run: markerRun.length,
    start,
    end: start + line.length,
    suffix,
  }
}

const isClosingFence = (line: FenceLine, openFence: TrMarkdownFenceRange) =>
  line.marker === openFence.marker && line.run >= openFence.run && /^[ \t]*$/.test(line.suffix)

/** Scan fenced code ranges without interpreting Markdown inside the range. */
export const scanMarkdownFences = (content: string): TrMarkdownFenceScan => {
  const fences: TrMarkdownFenceRange[] = []
  let openFence: TrMarkdownFenceRange | undefined
  let lineStart = 0
  const lines = content.split(/\r\n|\n|\r/)

  for (const line of lines) {
    const lineInfo = readFenceLine(line, lineStart)
    const lineEnd = lineStart + line.length
    const separatorLength = content.startsWith('\r\n', lineEnd)
      ? 2
      : content[lineEnd] === '\r' || content[lineEnd] === '\n'
        ? 1
        : 0
    lineStart = lineEnd + separatorLength
    if (!lineInfo) continue

    if (!openFence) {
      openFence = {
        marker: lineInfo.marker,
        run: lineInfo.run,
        start: lineInfo.start,
        end: content.length,
        open: true,
        closed: false,
      }
      continue
    }

    if (!isClosingFence(lineInfo, openFence)) continue

    openFence.end = lineInfo.end
    openFence.open = false
    openFence.closed = true
    fences.push(openFence)
    openFence = undefined
  }

  if (openFence) fences.push(openFence)
  return { fences, openFence }
}

export const findOpenMarkdownFence = (content: string) => scanMarkdownFences(content).openFence
