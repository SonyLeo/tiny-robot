/**
 * TemplateSelect 插件
 */

import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'

const ZERO_WIDTH_CHAR = '\u200B'

/**
 * 零宽字符管理插件
 * 注意：零宽字符现在由 Vue 组件直接渲染，不需要插件动态插入
 * 这个插件保留用于清理孤立的零宽字符
 */
export function selectZeroWidthPlugin() {
  return new Plugin({
    key: new PluginKey('templateSelectZeroWidth'),

    appendTransaction(transactions: readonly Transaction[], _oldState: EditorState, newState: EditorState) {
      // 只在内容发生变化时修正
      const docChanged = transactions.some((tr) => tr.docChanged)
      if (!docChanged) return null

      // 清理孤立的零宽字符（段落中只有一个零宽字符的情况）
      const todoPositions: Array<['remove', number]> = []
      let { tr } = newState

      newState.doc.descendants((node: PMNode, pos: number) => {
        if (node.type.name === 'paragraph' && node.childCount > 0) {
          const { lastChild, firstChild } = node
          // 如果段落只有一个零宽字符，删除它
          if (lastChild === firstChild && lastChild && lastChild.isText && lastChild.text === ZERO_WIDTH_CHAR) {
            todoPositions.push(['remove', pos + 1])
          }
        }
      })

      if (todoPositions.length > 0) {
        todoPositions.forEach(([, pos]) => {
          tr = tr.delete(pos, pos + 1)
        })
        return tr
      }

      return null
    },
  })
}

/**
 * 键盘导航插件
 */
export function selectKeyboardPlugin() {
  return new Plugin({
    key: new PluginKey('templateSelectKeyboard'),

    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const { state, dispatch } = view
        const { selection } = state
        const { $from } = selection

        // 处理 Backspace 删除选择器
        // 注意：零宽字符现在由 Vue 组件渲染，总是存在于 templateSelect 前后
        if (event.key === 'Backspace' && selection.empty) {
          const beforeNode = $from.nodeBefore
          const afterNode = $from.nodeAfter

          // 场景1：光标前面直接是 templateSelect 节点
          // 删除整个选择器（包括内置的零宽字符）
          if (beforeNode?.type.name === 'templateSelect') {
            dispatch(state.tr.delete($from.pos - beforeNode.nodeSize, $from.pos))
            event.preventDefault()
            return true
          }

          // 场景2：光标后面是 templateSelect，前面是普通文本
          // 删除文本的最后一个字符
          if (afterNode?.type.name === 'templateSelect') {
            // 如果前面是普通文本
            if (beforeNode?.isText && beforeNode.text !== ZERO_WIDTH_CHAR) {
              const deleteStart = $from.pos - 1
              const deleteEnd = $from.pos
              dispatch(state.tr.delete(deleteStart, deleteEnd))
              event.preventDefault()
              return true
            }
            // 如果前面是 template 节点，不处理，让 TemplateBlock 插件处理
            if (beforeNode?.type.name === 'template') {
              return false
            }
          }
        }

        // 处理 Delete 删除选择器
        // 注意：零宽字符现在由 Vue 组件渲染，总是存在于 templateSelect 前后
        if (event.key === 'Delete' && selection.empty) {
          const afterNode = $from.nodeAfter
          const beforeNode = $from.nodeBefore

          // 场景1：光标后面直接是 templateSelect 节点
          // 删除整个选择器（包括内置的零宽字符）
          if (afterNode?.type.name === 'templateSelect') {
            dispatch(state.tr.delete($from.pos, $from.pos + afterNode.nodeSize))
            event.preventDefault()
            return true
          }

          // 场景2：光标前面是 templateSelect，后面是普通文本
          // 删除文本的第一个字符
          if (beforeNode?.type.name === 'templateSelect') {
            // 如果后面是普通文本
            if (afterNode?.isText && afterNode.text !== ZERO_WIDTH_CHAR) {
              const deleteStart = $from.pos
              const deleteEnd = $from.pos + 1
              dispatch(state.tr.delete(deleteStart, deleteEnd))
              event.preventDefault()
              return true
            }
            // 如果后面是 template 节点，不处理，让 TemplateBlock 插件处理
            if (afterNode?.type.name === 'template') {
              return false
            }
          }
        }

        return false
      },
    },
  })
}
