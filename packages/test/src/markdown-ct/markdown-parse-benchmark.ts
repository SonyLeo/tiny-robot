import type { TrMarkdownParserAdapter, TrMarkdownParserOptions } from '../../../components/src/markdown/index.type'
import { markdownItAdapter } from '../../../components/src/markdown/parser/markdownItAdapter'

export interface MarkdownParseMeasurement {
  requestedLength: number
  textLength: number
  samplesMs: number[]
  medianMs: number
}

export const createMarkdownBenchmarkSource = (length: number) => {
  const paragraph = 'TinyRobot markdown parse benchmark paragraph with stable words.\n\n'
  const heading = '# Parse benchmark\n\n'
  const repeated = `${heading}${paragraph.repeat(Math.ceil(length / paragraph.length) + 1)}`
  return repeated.slice(0, length)
}

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)] || 0
}

/**
 * Measures only the parser adapter call. Rendering, Vue updates, highlighting,
 * and DOM work are intentionally outside this measurement.
 */
export const measureMarkdownParseSizes = async (
  sizes: number[] = [1_000, 10_000, 20_000],
  options: TrMarkdownParserOptions = {},
  parser: TrMarkdownParserAdapter | undefined = markdownItAdapter,
  sampleCount = 3,
  warmupCount = 2,
): Promise<MarkdownParseMeasurement[]> => {
  const measurements: MarkdownParseMeasurement[] = []
  const resolvedParser = parser || markdownItAdapter

  for (const requestedLength of sizes) {
    const source = createMarkdownBenchmarkSource(requestedLength)
    for (let warmup = 0; warmup < warmupCount; warmup += 1) {
      await resolvedParser.parse(source, options)
    }

    const samplesMs: number[] = []
    for (let sample = 0; sample < sampleCount; sample += 1) {
      const start = typeof performance === 'undefined' ? Date.now() : performance.now()
      await resolvedParser.parse(source, options)
      const end = typeof performance === 'undefined' ? Date.now() : performance.now()
      samplesMs.push(end - start)
    }

    measurements.push({
      requestedLength,
      textLength: source.length,
      samplesMs,
      medianMs: median(samplesMs),
    })
  }

  return measurements
}
