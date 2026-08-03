import React, { useState, useCallback } from 'react'
import { View, Input, Icon } from '@tarojs/components'
import { debounce } from '../../utils'
import './index.scss'

interface SearchBarProps {
  placeholder?: string
  onSearch: (keyword: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = '搜索植物名称...', onSearch }) => {
  const [value, setValue] = useState('')

  const handleSearch = useCallback(debounce((keyword: string) => {
    onSearch(keyword)
  }, 300), [onSearch])

  const handleInput = (e: any) => {
    const keyword = e.detail.value
    setValue(keyword)
    handleSearch(keyword)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <View className="search-bar">
      <Icon type="search" className="search-icon" />
      <Input
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleInput}
      />
      {value && (
        <Icon type="clear" className="clear-icon" onClick={handleClear} />
      )}
    </View>
  )
}

export default SearchBar