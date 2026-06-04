import type { ComponentInternalInstance } from 'vue'

export function hasVNodeProp(instance: ComponentInternalInstance | null, name: string): boolean {
  const rawProps = instance?.vnode.props

  if (!rawProps) {
    return false
  }

  const kebabName = name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)

  return (
    Object.prototype.hasOwnProperty.call(rawProps, name) || Object.prototype.hasOwnProperty.call(rawProps, kebabName)
  )
}
