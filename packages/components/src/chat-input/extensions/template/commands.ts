/**
 * Template 扩展命令实现
 */

import type { Editor } from '@tiptap/core'
import { generateId } from '../utils'
import type { TemplateItem, TemplateAttrs, TemplateSelectAttrs } from './types'

// ProseMirror Node 类型
type PMNode = ReturnType<Editor['state']['doc']['nodeAt']> & { nodeSize: number }

/**
 * 查找模板块节点
 */
function findTemplate(editor: Editor, id: string): { node: PMNode; pos: number } | null {
  let result: { node: PMNode; pos: number } | null = null

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'template' && node.attrs.id === id) {
      result = { node, pos }
      return false
    }
  })

  return result
}

/**
 * 获取所有模板块节点
 */
function getAllTemplates(editor: Editor): Array<{ node: PMNode; pos: number }> {
  const blocks: Array<{ node: PMNode; pos: number }> = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'template') {
      blocks.push({ node, pos })
    }
  })

  return blocks
}

/**
 * Template 命令集合
 */
export const templateCommands = {
  /**
   * 设置模板数据（批量）
   */
  setTemplateData:
    (items: TemplateItem[]) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      // 清空编辑器
      commands.clearContent()

      // 构建内容
      const content: Array<Record<string, unknown>> = []

      items.forEach((item) => {
        if (item.type === 'text') {
          // 添加文本节点
          if (item.content) {
            content.push({
              type: 'text',
              text: item.content,
            })
          }
        } else if (item.type === 'block') {
          // 添加模板块节点（内部包含文本）
          content.push({
            type: 'template',
            attrs: {
              id: item.id || generateId('template'),
              content: item.content,
            },
            content: item.content
              ? [
                  {
                    type: 'text',
                    text: item.content,
                  },
                ]
              : [],
          })
        } else if (item.type === 'select') {
          // 添加选择器节点
          content.push({
            type: 'templateSelect',
            attrs: {
              id: item.id || generateId('select'),
              placeholder: item.placeholder,
              options: item.options,
              value: item.value || null,
            },
          })
        }
      })

      // 如果有内容，插入到段落中
      if (content.length > 0) {
        commands.insertContent({
          type: 'paragraph',
          content,
        })
      }

      return true
    },

  /**
   * 插入模板块
   */
  insertTemplate:
    (attrs: Partial<TemplateAttrs>) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      const content = attrs.content || ''
      return commands.insertContent({
        type: 'template',
        attrs: {
          id: attrs.id || generateId('template'),
          content,
        },
        content: content
          ? [
              {
                type: 'text',
                text: content,
              },
            ]
          : [],
      })
    },

  /**
   * 更新模板块
   */
  updateTemplate:
    (id: string, content: string) =>
    ({ editor, tr }: { editor: Editor; tr: Editor['state']['tr'] }) => {
      const result = findTemplate(editor, id)
      if (!result) {
        return false
      }

      const { node, pos } = result
      // 替换节点内容
      const from = pos + 1
      const to = pos + node.nodeSize - 1

      if (content) {
        tr.replaceWith(from, to, editor.schema.text(content))
      } else {
        tr.delete(from, to)
      }

      return true
    },

  /**
   * 删除模板块
   */
  deleteTemplate:
    (id: string) =>
    ({ editor, tr }: { editor: Editor; tr: Editor['state']['tr'] }) => {
      const result = findTemplate(editor, id)
      if (!result) {
        return false
      }

      const { node, pos } = result
      tr.delete(pos, pos + node.nodeSize)

      return true
    },

  /**
   * 聚焦到模板块
   */
  focusTemplate:
    (id: string, position: 'start' | 'end' | number = 'end') =>
    ({ editor, commands }: { editor: Editor; commands: Editor['commands'] }) => {
      const result = findTemplate(editor, id)
      if (!result) {
        return false
      }

      const { node, pos } = result

      let targetPos: number
      if (position === 'start') {
        targetPos = pos
      } else if (position === 'end') {
        targetPos = pos + node.nodeSize
      } else {
        targetPos = pos + position
      }

      return commands.focus(targetPos)
    },

  /**
   * 聚焦到第一个模板块
   */
  focusFirstTemplate:
    () =>
    ({ editor }: { editor: Editor }) => {
      const blocks = getAllTemplates(editor)
      if (blocks.length === 0) {
        return false
      }

      const { node } = blocks[0]
      const blockId = node.attrs.id as string

      // 模板初始化：将光标置于第一个可编辑元素之后。
      setTimeout(() => {
        // 通过 data-id 找到对应的 DOM 元素
        const blockElement = editor.view.dom.querySelector(`[data-id="${blockId}"]`)
        if (blockElement) {
          // 找到内部的 contenteditable 元素
          const contentElement = blockElement.querySelector('.template-block__content') as HTMLElement
          if (contentElement) {
            contentElement.focus()
            // 将光标移到内容末尾
            const selection = window.getSelection()
            if (selection) {
              selection.selectAllChildren(contentElement)
              selection.collapseToEnd()
            }
          }
        }
      }, 0)

      return true
    },

  /**
   * 聚焦到最后一个模板块
   */
  focusLastTemplate:
    () =>
    ({ editor, commands }: { editor: Editor; commands: Editor['commands'] }) => {
      const blocks = getAllTemplates(editor)
      if (blocks.length === 0) {
        return false
      }

      const { pos } = blocks[blocks.length - 1]
      // 聚焦到节点内部（pos + 1）
      return commands.focus(pos + 1)
    },

  /**
   * 插入选择器
   */
  insertTemplateSelect:
    (attrs: Partial<TemplateSelectAttrs>) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      return commands.insertContent({
        type: 'templateSelect',
        attrs: {
          id: attrs.id || generateId('select'),
          placeholder: attrs.placeholder || 'Please select',
          options: attrs.options || [],
          value: attrs.value || null,
        },
      })
    },

  /**
   * 更新选择器的选中值
   */
  updateTemplateSelect:
    (id: string, value: string) =>
    ({ editor, tr }: { editor: Editor; tr: Editor['state']['tr'] }) => {
      let found = false

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'templateSelect' && node.attrs.id === id) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            value,
          })
          found = true
          return false
        }
      })

      return found
    },

  /**
   * 删除选择器
   */
  deleteTemplateSelect:
    (id: string) =>
    ({ editor, tr }: { editor: Editor; tr: Editor['state']['tr'] }) => {
      let found = false

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'templateSelect' && node.attrs.id === id) {
          tr.delete(pos, pos + node.nodeSize)
          found = true
          return false
        }
      })

      return found
    },
}
