const hexPattern = /^#([\da-f]{6}|[\da-f]{3})$/i
const rgbPattern = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
const hslPattern = /^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i

export const normalizeColorPreview = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (hexPattern.test(trimmed)) {
    if (trimmed.length === 4) {
      const [, r, g, b] = trimmed
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
    }

    return trimmed.toUpperCase()
  }

  const rgbMatch = trimmed.match(rgbPattern)
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch
    const rNum = Number(r)
    const gNum = Number(g)
    const bNum = Number(b)

    if ([rNum, gNum, bNum].every((item) => item >= 0 && item <= 255)) {
      return `rgb(${rNum}, ${gNum}, ${bNum})`
    }
  }

  const hslMatch = trimmed.match(hslPattern)
  if (hslMatch) {
    const [, h, s, l] = hslMatch
    const hNum = Number(h)
    const sNum = Number(s)
    const lNum = Number(l)

    if (hNum >= 0 && hNum <= 360 && sNum >= 0 && sNum <= 100 && lNum >= 0 && lNum <= 100) {
      return `hsl(${hNum}, ${sNum}%, ${lNum}%)`
    }
  }

  return null
}
