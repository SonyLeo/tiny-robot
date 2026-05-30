declare module '@shikijs/langs/*' {
  import type { LanguageRegistration } from '@shikijs/types'

  const language: LanguageRegistration
  export default language
}

declare module '@shikijs/themes/*' {
  import type { ThemeRegistrationAny } from '@shikijs/types'

  const theme: ThemeRegistrationAny
  export default theme
}
