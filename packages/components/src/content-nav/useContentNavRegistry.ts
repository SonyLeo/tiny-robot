import { ref } from 'vue'
import type { ContentNavRegistry } from './index.type'

export function useContentNavRegistry(): ContentNavRegistry {
  const registry = new Map<string, HTMLElement>()
  const version = ref(0)

  const touch = () => {
    version.value += 1
  }

  return {
    version,
    register(id, el) {
      if (!id) {
        return
      }

      if (!el) {
        if (registry.delete(id)) {
          touch()
        }
        return
      }

      const current = registry.get(id)
      if (current !== el) {
        registry.set(id, el)
        touch()
      }
    },
    unregister(id) {
      if (registry.delete(id)) {
        touch()
      }
    },
    get(id) {
      return registry.get(id) ?? null
    },
    getAll() {
      return Array.from(registry.entries()).map(([id, el]) => ({ id, el }))
    },
  }
}
