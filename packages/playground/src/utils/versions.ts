interface VersionData {
  versions: Record<string, string>
  tags: Record<string, string>
}

const versionCache = new Map<string, string[]>()

export async function getVersions(pkg: string): Promise<string[]> {
  if (versionCache.has(pkg)) {
    return versionCache.get(pkg)!
  }

  try {
    const response = await fetch(`https://registry.npmjs.org/${pkg}`)
    const data: VersionData = await response.json()

    const versions = Object.keys(data.versions)
      .sort((a, b) => {
        // Sort versions in descending order, including alpha/rc versions
        const aParts = a.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))
        const bParts = b.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0
          const bPart = bParts[i] || 0

          if (typeof aPart === 'number' && typeof bPart === 'number') {
            if (aPart !== bPart) {
              return bPart - aPart
            }
          } else if (typeof aPart === 'string' && typeof bPart === 'string') {
            if (aPart !== bPart) {
              return bPart.localeCompare(aPart)
            }
          } else {
            // Numbers come before strings
            return typeof bPart === 'number' ? 1 : -1
          }
        }
        return 0
      })
      .slice(0, 20) // Get latest 20 versions including alpha/rc

    // Add latest tag if available
    if (data.tags?.latest) {
      versions.unshift('latest')
    }

    versionCache.set(pkg, versions)
    return versions
  } catch (error) {
    console.error(`Failed to fetch versions for ${pkg}:`, error)
    return ['latest']
  }
}

export function getSupportedTSVersions(): string[] {
  return ['latest', '5.3.3', '5.2.2', '5.1.6', '5.0.4', '4.9.5', '4.8.4', '4.7.4']
}

export function getSupportedVueVersions(): string[] {
  return ['latest', '3.4.15', '3.3.11', '3.3.8', '3.3.4', '3.2.47', '3.2.45']
}
