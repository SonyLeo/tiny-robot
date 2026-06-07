import { getCurrentInstance } from 'vue'

export function usePropPresence(): (name: string) => boolean {
  const instance = getCurrentInstance()
  const rawProps = instance?.vnode.props

  return (name: string) => {
    if (!rawProps) {
      return false
    }

    const kebabName = name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)

    return (
      Object.prototype.hasOwnProperty.call(rawProps, name) || Object.prototype.hasOwnProperty.call(rawProps, kebabName)
    )
  }
}
