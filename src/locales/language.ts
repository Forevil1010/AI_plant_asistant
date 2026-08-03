import storage from '../utils/storage'

export const LANGUAGES = {
  'zh-CN': '中文',
  'en-US': 'English'
}

export type Language = keyof typeof LANGUAGES

const LANG_KEY = 'app_language'

export const getLanguage = (): Language => {
  const saved = storage.get<string>(LANG_KEY)
  if (saved && saved in LANGUAGES) {
    return saved as Language
  }
  return 'zh-CN'
}

export const setLanguage = (lang: Language): void => {
  storage.set(LANG_KEY, lang)
}

export default {
  getLanguage,
  setLanguage,
  LANGUAGES
}