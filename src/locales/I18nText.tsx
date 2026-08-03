import React from 'react'
import { Text } from '@tarojs/components'
import useTranslation from './useTranslation'

interface I18nTextProps {
  i18nKey: string
  namespace?: string
  interpolations?: Record<string, string | number>
  children?: React.ReactNode
}

const I18nText: React.FC<I18nTextProps> = ({
  i18nKey,
  namespace = 'common',
  interpolations,
  children
}) => {
  const { t } = useTranslation(namespace)
  const text = t(i18nKey, interpolations)
  return <Text>{text || children}</Text>
}

export default I18nText