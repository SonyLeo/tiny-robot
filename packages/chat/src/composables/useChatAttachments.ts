import { ref, type Ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import type { UseChatAttachmentsOptions } from '../types'

function normalizeAttachment(file: File): Attachment {
  return {
    rawFile: file,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    status: 'success',
  }
}

export function useChatAttachments(options: UseChatAttachmentsOptions = {}) {
  const items = ref<Attachment[]>([...(options.initialItems ?? [])])

  function addFiles(files: File[]) {
    items.value.push(...files.map(normalizeAttachment))
  }

  function setItems(nextItems: Attachment[]) {
    items.value = [...nextItems]
  }

  function removeItem(target: Attachment) {
    items.value = items.value.filter((item) => item !== target)
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    addFiles,
    setItems,
    removeItem,
    clear,
  }
}

export interface UseChatAttachmentsReturn {
  items: Ref<Attachment[]>
  addFiles: (files: File[]) => void
  setItems: (items: Attachment[]) => void
  removeItem: (item: Attachment) => void
  clear: () => void
}
