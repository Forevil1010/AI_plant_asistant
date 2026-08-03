import { useState, useCallback, useEffect } from 'react'
import { getLanguage, setLanguage, type Language } from './language'

const loadLocale = (lang: Language, namespace: string): Record<string, string> => {
  try {
    return require(`./${lang}/${namespace}.json`)
  } catch {
    return {}
  }
}

interface UseTranslationResult {
  t: (key: string, interpolations?: Record<string, string | number>) => string
  lang: Language
  setLang: (lang: Language) => void
}

const useTranslation = (namespace: string = 'common'): UseTranslationResult => {
  const [lang, setLangState] = useState<Language>(getLanguage())
  const [locale, setLocale] = useState<Record<string, string>>(loadLocale(lang, namespace))

  useEffect(() => {
    setLocale(loadLocale(lang, namespace))
  }, [lang, namespace])

  const t = useCallback((key: string, interpolations?: Record<string, string | number>): string => {
    let text = locale[key] || key
    if (interpolations) {
      Object.entries(interpolations).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v))
      })
    }
    return text
  }, [locale])

  const setLang = useCallback((newLang: Language) => {
    setLanguage(newLang)
    setLangState(newLang)
    Taro.showToast({
      title: '语言已切换',
      icon: 'success'
    })
  }, [])

  return { t, lang, setLang }
}

export default useTranslation