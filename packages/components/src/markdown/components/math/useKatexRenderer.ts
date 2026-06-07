import { computed, ref, watch } from 'vue'
import { renderKatex } from './renderKatex'
import { getKatexErrorMessage } from './utils'

export interface UseKatexRendererOptions {
  displayMode: () => boolean
  formula: () => string
}

export const useKatexRenderer = (options: UseKatexRendererOptions) => {
  const formula = computed(() => options.formula())
  const displayMode = computed(() => options.displayMode())
  const state = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const renderedHtml = ref('')
  const errorMessage = ref('')
  const hasKatexError = ref(false)

  let renderRevision = 0

  const renderFormula = async () => {
    const currentRevision = ++renderRevision
    const nextFormula = formula.value.trim()

    if (!nextFormula) {
      renderedHtml.value = ''
      errorMessage.value = ''
      hasKatexError.value = false
      state.value = 'idle'
      return
    }

    state.value = 'loading'
    renderedHtml.value = ''
    errorMessage.value = ''
    hasKatexError.value = false

    try {
      const result = await renderKatex({
        displayMode: displayMode.value,
        formula: nextFormula,
      })

      if (currentRevision !== renderRevision) {
        return
      }

      renderedHtml.value = result.html
      errorMessage.value = result.errorMessage
      hasKatexError.value = result.isError
      state.value = result.isError ? 'error' : 'ready'
    } catch (error) {
      if (currentRevision !== renderRevision) {
        return
      }

      renderedHtml.value = ''
      errorMessage.value = getKatexErrorMessage(error)
      hasKatexError.value = true
      state.value = 'error'
    }
  }

  watch([formula, displayMode], renderFormula, { immediate: true })

  return {
    errorMessage,
    formula,
    hasKatexError,
    renderedHtml,
    state,
  }
}
